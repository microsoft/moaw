---
published: true
type: workshop
title: Building RAG (Retrieval augmented generation) Application on Microsoft Fabric & Azure Open AI
short_title: Building RAG Application on Microsoft Fabric & Azure Open AI
description: This workshop will guide you through the process of building a Retrieval augmented generation (RAG) application on Microsoft Fabric and Azure Open AI.
level: beginner
authors:
  - Josh Ndemenge
contacts:
  - '@Jcardif'
duration_minutes: 60
tags: data, Microsoft Fabric, Azure Open AI
banner_url: assets/architecture.png
sections_title:
  - Introduction
  - Loading and Preprocessing PDF Documents
  - Generating Embeddings and Storing them in a Vector Store
  - Retrieving Relevant Documents and Answering Questions

wt_id: data-114676-jndemenge

---

# Introduction

In this workshop, we'll demonstrate how to develop a context-aware question answering framework for any form of a document using [OpenAI models](https://azure.microsoft.com/products/ai-services/openai-service), [SynapseML](https://microsoft.github.io/SynapseML/) and [Azure AI Services](https://azure.microsoft.com/products/cognitive-services/). The source of data for this workshop is a PDF document, however, the same framework can be easily extended to other document formats too.


We’ll cover the following key steps:

1. Preprocessing PDF Documents: Learn how to load the PDF documents into a Spark DataFrame, read the documents using the [Azure AI Document Intelligence](https://azure.microsoft.com/products/ai-services/ai-document-intelligence) in Azure AI Services, and use SynapseML to split the documents into chunks.
2. Embedding Generation and Storage: Learn how to generate embeddings for the chunks using SynapseML and [Azure OpenAI Services](https://azure.microsoft.com/products/cognitive-services/openai-service), store the embeddings in a vector store using [Azure Cognitive Search](https://azure.microsoft.com/products/search), and search the vector store to answer the user’s question.
3. Question Answering Pipeline: Learn how to retrieve relevant document based on the user’s question and provide the answer using [Langchain](https://python.langchain.com/en/latest/index.html#).

To get an indepth understanding of the RAG framework, refer to [this workshop](https://moaw.dev/workshop/gh:azure-samples/azure-openai-rag-workshop/main/docs/?step=1#application-architecture)

---

# Loading and Preprocessing PDF Documents
 We start by installing the necessary python libraries.

```python
%pip install langchain openai semantic-link
```

Next we'll need to provide the keys for Azure AI Services and Azure OpenAI to authenticate the applications.

To do this we'll use the built in `find_secret()` function which uses Azure Key Vault to get the API keys, or alternatively you can directly paste your own keys there.

```python
# Key Vault
key_vault_endpoint = ''

# Azure Open AI
aoai_service_name = mssparkutils.credentials.getSecret(key_vault_endpoint, 'aoai-service-name')
aoai_endpoint = f'https://{aoai_service_name}.openai.azure.com/'
aoai_key = mssparkutils.credentials.getSecret(key_vault_endpoint, 'aoai-key')
aoai_deployment_name_embeddings = "text-embedding-ada-002"
aoai_deployment_name_completions = "gpt-4"

# Azure Cognitive Search
cogsearch_name = mssparkutils.credentials.getSecret(key_vault_endpoint, 'cogsearch-name')
cogsearch_index_name = 'wwireports'
cogsearch_api_key = mssparkutils.credentials.getSecret(key_vault_endpoint, 'cogsearch-api-key')

# Azure AI Service
ai_services_key = mssparkutils.credentials.getSecret(key_vault_endpoint, 'ai-services-key')
ai_services_location = mssparkutils.credentials.getSecret(key_vault_endpoint, 'ai-services-location')
```
Now that we have the basic configuration to Azure AI Services and Azure OpenAI, we can start loading the PDF documents into a Spark DataFrame using the `spark.read.format("binaryFile")`method provided by Apache Spark.

```python
# Import required pyspark libraries

from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

document_path = 'Files/wwi-doc-reports/wwi-importers-bi-report.pdf'

df = (
    spark.read.format('binaryFile')
    .load(document_path)
    .limit(10)
    .cache()
)
```

This code will read the PDF documents and create a Spark DataFrame named df with the contents of the PDFs. The DataFrame will have a schema that represents the structure of the PDF documents, including their textual content.

Next, we'll use the Azure AI Document Intelligence to read the PDF documents and extract the text from them. 

We utilize [SynapseML](https://microsoft.github.io/SynapseML/), an ecosystem of tools designed to enhance the distributed computing framework [Apache Spark](https://github.com/apache/spark). SynapseML introduces advanced networking capabilities to the Spark ecosystem and offers user-friendly SparkML transformers for various [Azure AI Services](https://azure.microsoft.com/products/ai-services).

Additionally, we employ `AnalyzeDocument` from Azure AI Services to extract the complete document content and present it in the designated columns called `output_content` and `paragraph`.

```python
from synapse.ml.cognitive import AnalyzeDocument
from pyspark.sql.functions import col

analyze_document = (
    AnalyzeDocument()
    .setPrebuiltModelId("prebuilt-layout")
    .setSubscriptionKey(ai_services_key)
    .setLocation(ai_services_location)
    .setImageBytesCol("content")
    .setOutputCol("result")
)

analyzed_df = (
    analyze_document.transform(df)
    .withColumn("output_content", col("result.analyzeResult.content"))
    .withColumn("paragraphs", col("result.analyzeResult.paragraphs"))
).cache()
```

We can observe the analyzed Spark DataFrame named ```analyzed_df``` using the following code. Note that we drop the `content` column as it is not needed anymore.

```python
analyzed_df = analyzed_df.drop("content")
display(analyzed_df)
```

---

# Generating Embeddings and Storing them in a Vector Store

Now that we have the text content of the PDF documents, we can generate embeddings for the text using Azure OpenAI. Embeddings are vector representations of the text that can be used to compare the similarity between different pieces of text.

Before we can generate the embeddings, we need to split the text into chunks. To do this we leverage SynapseML’s PageSplitter to divide the documents into smaller sections, which are subsequently stored in the `chunks` column. This allows for more granular representation and processing of the document content.

```python
from synapse.ml.featurize.text import PageSplitter

ps = (
    PageSplitter()
    .setInputCol("output_content")
    .setMaximumPageLength(4000)
    .setMinimumPageLength(3000)
    .setOutputCol("chunks")
)

splitted_df = ps.transform(analyzed_df)
display(splitted_df)
```

Note that the chunks for each document are presented in a single row inside an array. In order to embed all the chunks in the following cells, we need to have each chunk in a separate row. To accomplish that, we first explode these arrays so there is only one chunk in each row, then filter the Spark DataFrame in order to only keep the path to the document and the chunk in a single row.

```python
# Each column contains many chunks for the saame document as a vector.
# Explode will distribute and replicate the content of a vecor across multple rows
from pyspark.sql.functions import explode, col

exploded_df = splitted_df.select("path", explode(col("chunks")).alias("chunk")).select(
    "path", "chunk"
)
display(exploded_df)
```
Next we'll generate the embeddings for each chunk. To do this we utilize both SynapseML and Azure OpenAI Service. By integrating the Azure OpenAI service with SynapseML, we can leverage the power of the Apache Spark distributed computing framework to process numerous prompts using the OpenAI service. 

```python
from synapse.ml.cognitive import OpenAIEmbedding

embedding = (
    OpenAIEmbedding()
    .setSubscriptionKey(aoai_key)
    .setDeploymentName(aoai_deployment_name_embeddings)
    .setCustomServiceName(aoai_service_name)
    .setTextCol("chunk")
    .setErrorCol("error")
    .setOutputCol("embeddings")
)

df_embeddings = embedding.transform(exploded_df)

display(df_embeddings)
```

This integration enables the SynapseML embedding client to generate embeddings in a distributed manner, enabling efficient processing of large volumes of data. If you're interested in applying large language models at a distributed scale using Azure OpenAI and Azure Synapse Analytics, you can refer to [this approach](https://microsoft.github.io/SynapseML/docs/Explore%20Algorithms/OpenAI/). 

For more detailed information on generating embeddings with Azure OpenAI, you can look [here]( https://learn.microsoft.com/azure/cognitive-services/openai/how-to/embeddings?tabs=console&WT.mc_id=data-114676-jndemenge).


[Azure Cognitive Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search?WT.mc_id=data-114676-jndemenge) offers a user-friendly interface for creating a vector database, as well as storing and retrieving data using vector search. If you're interested in learning more about vector search, you can look [here](https://github.com/Azure/cognitive-search-vector-pr/tree/main).


Storing data in the AzureCogSearch vector database involves two main steps:

1. **Creating the Index:** The first step is to establish the index or schema of the vector database. This entails defining the structure and properties of the data that will be stored and indexed in the vector database.

2. **Adding Chunked Documents and Embeddings:** The second step involves adding the chunked documents, along with their corresponding embeddings, to the vector datastore. This allows for efficient storage and retrieval of the data using vector search capabilities.

By following these steps, we will effectively store the chunked documents and their associated embeddings in the AzureCogSearch vector database, enabling seamless retrieval of relevant information through vector search functionality.

```python
# Import necessary packages
import requests
import json

EMBEDDING_LENGTH = (
    1536  # length of the embedding vector (OpenAI generates embeddings of length 1536)
)

# Create Index for Cog Search with fields as id, content, and contentVector
# Note the datatypes for each field below

# Create Index for Cog Search with fields as id, content, and contentVector
# Note the datatypes for each field below

url = f"https://{cogsearch_name}.search.windows.net/indexes/{cogsearch_index_name}?api-version=2023-07-01-Preview"
payload = json.dumps(
  {
    "name": cogsearch_index_name,
    "fields": [
      {"name": "id", "type": "Edm.String", "key": True, "filterable": True},  # Unique identifier for each document
      {
        "name": "content",
        "type": "Edm.String",
        "searchable": True,
        "retrievable": True,
      },  # Text content of the document
      {
        "name": "contentVector",
        "type": "Collection(Edm.Single)",
        "searchable": True,
        "retrievable": True,
        "dimensions": EMBEDDING_LENGTH,  # Length of the embedding vector
        "vectorSearchConfiguration": "vectorConfig",  # Configuration for vector search
      },  # Embedding vector representation of the document content
    ],
    "vectorSearch": {
      "algorithmConfigurations": [
        {
          "name": "vectorConfig",
          "kind": "hnsw",  # Algorithm used for vector search
        }
      ]
    },
  }
)
headers = {"Content-Type": "application/json", "api-key": cogsearch_api_key}

response = requests.request("PUT", url, headers=headers, data=payload)
print(response.status_code)
```

Next we need to use User Defined Function (UDF) through the udf() method in order to apply functions directly to the DataFrames and SQL databases in Python, without any need to individually register them.

```python
# Use Spark's UDF to insert entries to Cognitive Search
# This allows to run the code in a distributed fashion

# Define a UDF using the @udf decorator
@udf(returnType=StringType())
def insert_to_cog_search(idx, content, contentVector):
    url = f"https://{cogsearch_name}.search.windows.net/indexes/{cogsearch_index_name}/docs/index?api-version=2023-07-01-Preview"

    payload = json.dumps(
        {
            "value": [
                {
                    "id": str(idx),
                    "content": content,
                    "contentVector": contentVector.tolist(),
                    "@search.action": "upload",
                },
            ]
        }
    )
    headers = {
        "Content-Type": "application/json",
        "api-key": cogsearch_api_key,
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    # response.text

    if response.status_code == 200 or response.status_code == 201:
        return "Success"
    else:
        return "Failure"
```

Now we can use the UDF to insert the chunked documents and their embeddings into the vector database by applying the UDF to the Spark DataFrame. Note that UDF also helps to add new columns to the DataFrame.

```python
# Apply the UDF on the different columns
from pyspark.sql.functions import monotonically_increasing_id

df_embeddings = df_embeddings.withColumn(
    "idx", monotonically_increasing_id()
)  ## adding a column with id
df_embeddings = df_embeddings.withColumn(
    "errorCogSearch",
    insert_to_cog_search(
        df_embeddings["idx"], df_embeddings["chunk"], df_embeddings["embeddings"]
    ),
)

# Show the transformed DataFrame
df_embeddings.show()
```

---

# Retrieving Relevant Documents and Answering Questions

After processing the document, we can proceed to pose a question. We will use [SynapseML](https://microsoft.github.io/SynapseML/docs/Explore%20Algorithms/OpenAI/Quickstart%20-%20OpenAI%20Embedding/) to convert the user's question into an embedding and then utilize cosine similarity to retrieve the top K document chunks that closely match the user's question. 

It's worth mentioning that alternative similarity metrics can also be employed.

```python
# Ask a question and convert to embeddings


def gen_question_embedding(user_question):
    # Convert question to embedding using synapseML
    from synapse.ml.cognitive import OpenAIEmbedding

    df_ques = spark.createDataFrame([(user_question, 1)], ["questions", "dummy"])
    embedding = (
        OpenAIEmbedding()
        .setSubscriptionKey(aoai_key)
        .setDeploymentName(aoai_deployment_name_embeddings)
        .setCustomServiceName(aoai_service_name)
        .setTextCol("questions")
        .setErrorCol("errorQ")
        .setOutputCol("embeddings")
    )
    df_ques_embeddings = embedding.transform(df_ques)
    row = df_ques_embeddings.collect()[0]
    question_embedding = row.embeddings.tolist()
    return question_embedding


def retrieve_k_chunk(k, question_embedding):
    # Retrieve the top K entries
    url = f"https://{cogsearch_name}.search.windows.net/indexes/{cogsearch_index_name}/docs/search?api-version=2023-07-01-Preview"

    payload = json.dumps(
        {"vector": {"value": question_embedding, "fields": "contentVector", "k": 2}}
    )
    headers = {
        "Content-Type": "application/json",
        "api-key": cogsearch_api_key,
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    output = json.loads(response.text)
    print(response.status_code)
    return output
```

To provide a response to the user's question, we will utilize the [LangChain](https://python.langchain.com/en/latest/index.html) framework. With the LangChain framework we will augment the retrieved documents with respect to the user's question. Following this, we can request a response to the user's question from our framework.

```python
# Import necenssary libraries and setting up OpenAI
from langchain.chat_models import AzureChatOpenAI
from langchain import PromptTemplate
from langchain.chains import LLMChain
import openai

openai.api_type = "azure"
openai.api_base = aoai_endpoint
openai.api_version = "2022-12-01"
openai.api_key = aoai_key
```

We will then define a Question answering chain function using langchain. 

```python
# Define a Question Answering chain function using LangChain
def qa_chain_func():

    # Define llm model
    llm = AzureChatOpenAI(
    openai_api_base=aoai_endpoint,
    openai_api_version="2023-05-15",
    deployment_name=aoai_deployment_name_completions,
    openai_api_key=aoai_key,
    openai_api_type="azure",
    temperature=0
)

    # Write a preprompt with context and query as variables 
    template = """
    context :{context}
    Answer the question based on the context above. If the
    information to answer the question is not present in the given context then reply "I don't know".
    Question: {query}
    Answer: """

    # Define a prompt template
    prompt_template = PromptTemplate(
        input_variables=["context", "query"], template=template
    )
    # Define a chain
    qa_chain = LLMChain(llm=llm, prompt=prompt_template)
    return qa_chain
```

Finally define a function to answer the user's question.

```python
def get_answer(user_question):
    retrieve_k = 5  # Retrieve the top 5 documents from vector database

    # Generate embeddings for the question and retrieve the top k document chunks
    question_embedding = gen_question_embedding(user_question)
    output = retrieve_k_chunk(retrieve_k, question_embedding)

    # Concatenate the content of retrieved documents
    context = [i["content"] for i in output["value"]]

    # Make a Quesion Answer chain function and pass
    qa_chain = qa_chain_func()
    answer = qa_chain.run({"context": context, "query": user_question})

    return answer
```

We can now ask a question and get the answer from the document.

```python
get_answer('What percentage of total sales value did chiller items make? Number only')
```

