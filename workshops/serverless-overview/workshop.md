---
published: true
type: workshop
title: Serverless Workshop
short_title: Serverless Overview
description: This workshop will cover multiple serverless services that you will use to build a complete real world scenario.
level: beginner # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors: # Required. You can add as many authors as needed
  - Damien Aicheh
contacts: # Required. Must match the number of authors
  - "@damienaicheh"
duration_minutes: 180
tags: azure, azure functions, logic apps, event grid, key vault, cosmos db, email
navigation_levels: 3
sections_title:
  - The Serverless Workshop
---

# The Serverless Workshop

Welcome to this Azure Serverless Workshop. In this lab, you will use different types of serverless services on Azure to achieve a real world scenario. Don't worry, this is a step by step lab, you will be guided through it.

During this workshop you will have the instructions to complete each steps, try to find the answer before looking at the solution.

---

# The Workshop

## Prerequisites

Before starting this workshop, be sure you have:

<!--  TODO : Add the required permissions specificaly / contributor role
      TODO : Remind what Serverless is : Event based (explain what we have : EVG , EH, SB), Main Compute Services, Storage Account, Cognitive Services, Data Services not taken into account for the workshop.
      TODO : "Did you know that basic storage accounts are one of the first serverless"
      Resources :
      - https://learn.microsoft.com/en-us/dotnet/architecture/serverless/azure-serverless-platform
      - https://azure.microsoft.com/en-us/solutions/serverless/
      Pourquoi on présenter Serverless  -->

- An Azure Subscription with the **required permissions** to create and manage services
- The [Azure CLI][az-cli-install] installed on your machine
- The [Azure Functions Core Tools][az-func-core-tools] installed, this will be useful for creating the scaffold of your Azure Functions using command line.
- If you are using VS Code, you can also install the [Azure Function extension][azure-function-vs-code-extension]
- Register the Azure providers: `Microsoft.Logic`, `Microsoft.EventGrid`, `Microsoft.EventHub`
<div class="task" data-title="Task">

> Before starting, log into your Azure subscription locally using Azure CLI and on the [Azure Portal][az-portal] using your own credentials.

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Login to Azure
az login
# Display your account details
az account show
# Select a specific subscription if you have more than one or another one selected
az account set --subscription <subscription-id>
# Register the Azure providers
az provider register --namespace 'Microsoft.Web'
az provider register --namespace 'Microsoft.Logic'
az provider register --namespace 'Microsoft.EventGrid'
```

</details>

## Scenario

The goal of the lab is to upload an audio file to Azure and get back the transcription using a Web Application.

Here is a diagram to illustrate the flow:

![Hand's On Lab Architecture](assets/hands-on-lab-architecture.png)

<!-- TODO : Add a link to the audio file  -->

1. The user uploads the [audio file][audio-demo] from the Web application
2. The web application sends an HTTP request to APIM (API Management) which is a facade for multiple APIs
3. An Azure Function will process the request and upload the file to a Storage Account
4. When the file is uploaded the Event Grid service will detect it and send a "Blob created event" to an Event Hub
<!-- TODO : Change the need for Event Hub to EventGrid -->
5. The Event Hub will trigger a Logic App
6. The Logic App retrieves the uploaded audio file
7. The audio file is sent to to Azure Cognitive Services
8. The speech to text service will process the file and return the result to the Logic App
9. The Logic App will then store the transcription of the audio file in a Cosmos DB database
10. A second Azure Function will be triggered by the update in CosmosDB. It will fetch the transcription from CosmosDB and send it to Web Pub/Sub
11. Finally Web Pub/Sub will notify the Web Application about the new transcription using websockets

<div class="info" data-title="Note">

> Azure Key Vault will be used to store the secrets needed for this scenario.

</div>

You will get more details about each of these services during the Hands On Lab.

## Naming convention

Before starting to deploy any Azure services, it's important to follow a naming convention. Based on the official [documentation][az-naming-convention] we need to define a few things:

- The application name
- The environment
- The region
- The instance number

We will also add an owner property, so for the purpose of this lab the values will be:

<!--  TODO : Mettre la liste dans l'ordre
      TODO : Ajouter le prefix Service/Resource-->

- The application name: `hol` (for Hands On Lab)
- The environment: `dev`
- The region: `we` (for West Europe)
- The instance: `01`
- The owner: `ms`

So we will use this convention:

```xml
<!--If the resource prefix has a dash: -->
<service-prefix>-<environment>-<region>-<application-name>-<owner>-<instance>
<!--If the resource does not autorize any special caracters: -->
<service-prefix><environment><region><application-name><owner><instance>
```

<div class="info" data-title="Note">

> Be sure to use your own values to have unique names or use your own convention.
> [Official resource abbreviations][az-abrevation]

</div>

## Programming language

We will have to create few functions in this workshop to address various problems. You can choose the programming language you are most confortable with among the ones [supported by Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions#languages) but please keep in mind that solutions will only be provided in Python.

With everything ready let's start the lab 🚀

[az-cli-install]: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
[az-func-core-tools]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools
[az-naming-convention]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming
[az-abrevation]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations
[az-portal]: https://portal.azure.com
[vs-code]: https://code.visualstudio.com/
[azure-function-vs-code-extension]: https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions

---

# Lab 1

On this first lab, you will be focus on this part of the scenario:

![Hand's On Lab Architecture Lab 1](assets/hands-on-lab-architecture-lab-1.png)

## Create a resource group

Let's start by creating the resource group for this Hand's On Lab. The resource group is a logical structure to store Azure components used to group your Azure resources.

<div class="info" data-title="Information">

> For the purpose of this lab we will create all the resources in the same region, for instance West US (westus) or West Europe (westeurope).

</div>

Remember, the naming convension for resource groups will be: `rg-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="task" data-title="Resources">

> [Resource Groups][resource-group]

</div>

[resource-group]: https://learn.microsoft.com/fr-fr/cli/azure/group?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

```bash
# Use az account list-locations to get a location:

az account list-locations -o table

# Then create the resource group using the selected location:

az group create --name <resource-group> --location <region>
```

</details>

## Configure the storage account

The Azure storage account is used to store data objects, including blobs, file shares, queues, tables, and disks. You will use it to store the audios files inside an `audios` container.

With the resource group ready, let's create a storage account with a container named `audios` that will store all audios. The naming convention for Storage Accounts is: `st<environment><region><application-name><owner><instance>`.

<!-- TODO : Check max SA name size-->
<div class="info" data-title="Note">

> Azure Storage Account names do not accept hyphens and cannot exceed a maximum of 24 characters.

</div>

Choose a Locally redundant storage: Standard LRS

<div class="task" data-title="Resources">

> [Storage Account][storage-account]<br> > [Storage Account Container][storage-account-container]

</div>

[storage-account]: https://learn.microsoft.com/fr-fr/cli/azure/storage/account?view=azure-cli-latest
[storage-account-container]: https://learn.microsoft.com/fr-fr/cli/azure/storage/container?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

```bash
# Create the Storage Account with Standard LRS

az storage account create -n <storage-account-name> \
                          -g <resource-group> \
                          -l <region> \
                          --sku Standard_LRS
```

Based on the command line below, to create the container for the audios files you need to get one of the access key:

![Storage account access keys](assets/storage-account-access-keys.png)

```bash
# Then create the audios container inside it

az storage container create -n audios \
                            --account-name <storage-account-name> \
                            --account-key <storage-account-key>
```

If everything is fine, open the [Azure Portal][az-portal] and you should retrieve your container:

![Storage account access keys](assets/storage-account-show-container.png)

</details>

[az-portal]: https://portal.azure.com

## Detect the audio uploaded

### Create an Event Grid

The Event Grid is an event broker that you can use to integrate applications using events. The different events are delivered by Event Grid to subscribers such as applications, Azure services, or any endpoint to which Event Grid has network access. The source of those events can be Azure services related, First and Third-party SaaS services as well as custom applications.

Next step is to setup a way to listen to the audio files uploaded by the user in the storage account container. To start, we will upload them directly using the [Azure Portal][az-portal] and further in the labs we will use a user interface and a dedicated API.

To detect the upload event you will use the `System topic` functionality of the Event Grid service.

The naming convention for Event Grid topics is: `egst-<environment>-<region>-<application-name>-<owner>-<instance>`.

<!-- TODO : Add something about the EVG System Topic on Added only (updated could be another lab 2 / 3) -->
<div class="task" data-title="Resources">

> [Event Grid][event-grid]

</div>

[event-grid]: https://learn.microsoft.com/en-us/cli/azure/eventgrid/system-topic?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

<!-- TODO : Add an Event Filter to Event Grid System Topic to send only blob created events to Event Hub -->

```bash
# Create the Event Grid system topic
az eventgrid system-topic create -g <resource-group> \
                                 --name <event-grid-system-topic-name> \
                                 --location <region> --topic-type microsoft.storage.storageaccounts \
                                 --source /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Storage/storageAccounts/<storage-account-name>
```

</details>

### Create an Event Hub

<!--  TODO : Check description
      TODO : Add Event Hub capabilities + Explain why we use it in this scenario for further Lab capabilities
      TODO : Explain Event Hub Namespaces vs Event Hubs
      TODO : Explain it's not truly Serverless as Throughput Units need to be defined -->

The Event Grid previously created will listen to the Storage Account, but before adding this mechanism we need to create another service: The Event Hub. This one is responsible for broadcasting the event caught by the Event Grid service. With that in place the event can be consumed by multiple services. In our case, a Logic App will be triggered based on the Event Hub broadcasting.

The naming convention for Event Hub Namespace is: `evhns-<environment>-<region>-<application-name>-<owner>-<instance>` and for the event hub: `evh-audios-uploaded-<environment>-<region>-<application-name>-<owner>-<instance>`.

- Use the `Basic` SKU for the Event Hub Namespace.
- Define the message retention to 1 and partition count to 2 for the Event Hub.

<div class="task" data-title="Resources">

> [Event Hubs Namespace][event-hubs-namespace]<br> > [Event Hubs Event][event-hubs-event]

</div>

[event-hubs-namespace]: https://learn.microsoft.com/en-us/cli/azure/eventhubs/namespace?view=azure-cli-latest
[event-hubs-event]: https://learn.microsoft.com/en-us/cli/azure/eventhubs/eventhub?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

```bash
# Create the Event Hub Namespace
az eventhubs namespace create --resource-group <resource-group> \
                              --name <event-hub-namespace> \
                              --location <region> \
                              --sku Basic

# Create the Event Hub "Instance"
az eventhubs eventhub create --resource-group <resource-group> \
                             --namespace-name <event-hub-namespace> \
                             --name <event-hub-name> \
                             --message-retention 1 \
                             --partition-count 2
```

![Event Hub Namespace](assets/event-hub-namespace.png)

</details>

### Add an Event Subscription

Now, you will need to subscribe to the Storage Account with your Event Grid and use the Event Hub as a broadcaster.
To achieve this, you need to meet these trigger criteria:

<!-- TODO : Explain that the  it's a second round of check to avoid  -->

- Only on blob creation
- If the file is uploaded in the `audios` container otherwise ignore it
- If the file extension is `.wav`
- The Event Grid trigger the Event Hub

The naming convention for Event Subscription is: `evgs-audios-uploaded-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="tip" data-title="tip">

> To get access to the identifier of a resource, go to the `Overview` tab and click en `Json View` on the top right and you will see it.

</div>

<div class="task" data-title="Resources">

> [Event Grid Topic Subscription][event-grid-topic-subscription]

</div>

[event-grid-topic-subscription]: https://learn.microsoft.com/en-us/cli/azure/eventgrid/system-topic/event-subscription?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

```bash
# Create the event grid system topic subscription
az eventgrid system-topic event-subscription create --name <event-grid-system-topic-subscription-name> \
                                             -g <resource-group> \
                                             --system-topic-name <event-grid-system-topic-name> \
                                             --event-delivery-schema eventgridschema \
                                             --included-event-types Microsoft.Storage.BlobCreated \
                                             --subject-begins-with /blobServices/default/containers/audios/blobs \
                                             --subject-ends-with .wav \
                                             --endpoint-type eventhub \
                                             --endpoint /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.EventHub/namespaces/<event-hub-namespace-name>/eventhubs/<event-hub-name>
```

If you did everything correctly you should see the event subscription like this:

![Event Grid System Topic Subscription](assets/event-grid-system-topic-subscription.png)

</details>

## Process the event

### Create the Logic App

<!-- TODO : Create the Full Logic App parameterized Template -->

Azure Logic Apps is a cloud platform where you can create and run automated workflows with little to no code. A visual designer can be used to select prebuilt operations which can quickly build a workflow that integrates and manages your apps, data, services, and systems.

The action of uploading an audio file is now sent to the subscribers, and now needs to be consumed.

Let's create a Logic App in consumption mode which is triggered by the event Grid once 10 seconds.

The default template to use is:

```json
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "actions": {},
    "contentVersion": "1.0.0.0",
    "outputs": {},
    "parameters": {},
    "triggers": {}
  },
  "parameters": {}
}
```

The naming convention for Logic Apps is: `logic-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="task" data-title="Resources">

> [Azure Cli Extension][azure-cli-extension]<br> > [Azure Logic App][azure-logic-app]

</div>

[azure-cli-extension]: https://learn.microsoft.com/en-us/cli/azure/azure-cli-extensions-overview
[azure-logic-app]: https://learn.microsoft.com/en-us/cli/azure/logic/workflow?view=azure-cli-latest

<details>
<summary>Toggle solution</summary>

```bash
# Install the logic extension
az extension add --name logic

# Create a logic app in consumption mode
az logic workflow create --resource-group <resource-group>
                         --location <region>
                         --name <logic-app-name>
                         --definition <path-to-default-workflow.json>
```

</details>

### Trigger the logic app

Next step is to trigger the Logic App based on the event raised by Event Grid when a file is uploaded to the audios container.

A basic audio file to test the trigger can be download here:
[Audio demo][audio-demo]

[audio-demo]: assets/whatstheweatherlike.wav

<div class="task" data-title="Resources">

> [Logic Apps Triggers][logic-apps-triggers]

</div>

[logic-apps-triggers]: https://learn.microsoft.com/en-us/azure/connectors/connectors-create-api-azure-event-hubs

<details>
<summary>Toggle solution</summary>

In the [Azure Portal][az-portal] inside the Logic App just created click on the `Edit` button. Then select `Blanc Logic App`. In the triggers list search for `Event Hub` and select the `When events are available in Event Hub` trigger.

You will need to go to the `Shared Access Policies` inside your event hub to create an access key with `Listen` access _only_:

![Event Hub Shared Access Policies](assets/event-hub-shared-access-policies.png)

With that done, you will be able to connect to the Event Hub using the primary or secondary connection string:

![Event Hub Connection Settings](assets/event-hub-connection-settings.png)

Next step, you can configure the event hub trigger:

![Event Hub Trigger Settings](assets/event-hub-trigger-settings.png)

Finally, if you upload a file in the audios container, after a few seconds, if you look at your logic app `Runs history` you will see a succeeded status.

</details>

[az-portal]: https://portal.azure.com

### Download the blob

<!-- TODO : Add more details on the cognitive services -->

With the trigger ready, you need to extract the blob path and prepare it to be consumed by the cognitive service.

<div class="task" data-title="Resources">

> [Logic Apps Consumption mode][logic-app]<br> > [Logic App Storage Account Action][logic-app-storage-action]<br>

</div>

[logic-app]: https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-perform-data-operations?tabs=consumption#parse-json-action
[logic-app-storage-action]: https://learn.microsoft.com/en-us/azure/connectors/connectors-create-api-azureblobstorage?tabs=consumption

<details>
<summary>Toggle solution</summary>

First thing to do is to parse the json content. To do so, search for `parse json` in the workflow editor and choose the content input with `Content` which is the event hub content data.
For the schema part, just click on `Use sample payload to generate schema` and copy paste one of the json object inside the output `Content` received from a previous successfull run.

![Parse json with logic app](assets/logic-app-parse-json.png)

Because the Content is an array, you need to loop over it for the next action. To do so, search `For each` action and then select `Body` as input.

![Logic app for each](assets/logic-app-loop.png)

Then, search for `Azure Blob Storage` and select the `Get blob content using path (V2)` action. As we did previously, create a connection service with the `Access Keys` of the Storage account:

![Storage account connection service](assets/logic-app-storage-account-connection-string.png)

Finally, update the information to get the path of the audio file just uploaded using a `split` query:

```js
split(items("For_each")["data"]["url"], ".blob.core.windows.net")[1];
```

The split query will get the container name and the audio file name from the url which always finish by: `.blob.core.windows.net`.

![Logic app](assets/logic-app-download-blob.png)

</details>

### Use the cognitive services

The Azure Cognitive Services are cloud-based artificial intelligence services that give the ability to developers to build cognitive intelligence into their applications without having skills in AI or data science. They are available through client library SDKs in popular development languages and REST APIs.

Cognitive Services can be categorized into five main areas:

- Decision
- Language
- Speech
- Vision
- Azure OpenAI Service

Next step is to transform the audio file into text using the cognitive service with the speech to text service.
To do this, you will have to:

- Instanciate the cognitive service
- Call the speech to text API

<div class="important" data-title="Security">

> Remember to store secret values (if necessary) in a Key Vault before using them.

</div>

The naming conventions are:

- Cognitive services: `cog-<environment>-<region>-<application-name>-<owner>-<instance>`
- Key Vault: `kv-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="task" data-title="Resources">

> [Cognitive service][cognitive-service] <br> > [Key Vault][key-vault] <br> > [Cognitive Service Api][cognitive-service-api]

</div>

[cognitive-service]: https://learn.microsoft.com/en-us/cli/azure/cognitiveservices/account?view=azure-cli-latest
[key-vault]: https://learn.microsoft.com/fr-fr/cli/azure/keyvault?view=azure-cli-latest
[cognitive-service-api]: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=macos%2Cterminal&pivots=programming-language-rest

<details>
<summary>Toggle solution</summary>

```bash
# Let's create the cognitive service account with speech to text service
az cognitiveservices account create -n <cognitive-service-name> -g <resource-group> --kind SpeechServices --sku F0 -l <region> --yes
# Create the Key Vault to secure the speech to text API key
az keyvault create --location <region> --name <key-vault-name> --resource-group <resource-group>
```

To allow the Logic App to access the Key Vault, you need to grant access to it. Go to your Logic App and inside the identity tab, turn on the `System Identity`:

![System Identity](assets/logic-app-system-identity.png)

Then in your Key Vault, go to `Access policies` and create a new one, set the Secret access to `Get` and `List`:

![Key Vault Access](assets/key-vault-secret-access.png)

Then search for your logic app.

![Key Vault Access Logic App](assets/key-vault-access-logic-app.png)

Now inside your Key Vault, in the `Secret` section add a new one called `SpeechToTextApiKey` and set a key from the cognitive service.

![Key Vault Cognitive Secret](assets/key-vault-cognitive-secret.png)

With all of these ready, add a new action before the loop by searching for `Key Vault` and then select `Get Secret`. This will load the speech to text API key once.

![Logic App Key Vault Connection](assets/logic-app-key-vault-connection.png)

Select the Key Vault and the name of the secret.

![Logic App Get Secret](assets/logic-app-get-secret.png)

With that ready, add a new action in the for loop by searching for `Http`, then fill the different parameters like this:

![Logic App HTTP Action](assets/logic-app-http-action.png)

Notice the region of your cognitive service account and the language to use is specified in the url.

Finally as you need previously, upload the audio file and you should see the content as a text.

</details>

### Store data to Cosmos DB

The Azure Cosmos DB is a fully managed NoSQL and relational database. It currently supports NoSQL, MongoDB, Cassandra, Gremlin, Table and PostgreSQL.

With the audio transcribed to text, you will have to store it in a NoSQL database inside Cosmos DB:

- Database info: `HolDb`
- Collection to store the texts: `audios_resumes`

The naming conventions for Cosmos DB account is `cosmos-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="info" data-title="Resources">

> [Cosmos DB][cosmos-db]

</div>

[cosmos-db]: https://learn.microsoft.com/en-us/azure/cosmos-db/scripts/cli/nosql/serverless

<details>
<summary>Toggle solution</summary>

```bash
# Create the Cosmos DB account using serverless
az cosmosdb create --name <cosmos-db-account-name> \
                   --resource-group <resource-group> \
                   --default-consistency-level Eventual \
                   --locations regionName="<region>" \
                   failoverPriority=0 isZoneRedundant=False \
                   --capabilities EnableServerless

# Instanciate the database inside it
az cosmosdb sql database create --account-name <cosmos-db-account-name> \
                                --resource-group <resource-group> \
                                --name HolDb

# Create the item collection
az cosmosdb sql container create --account-name <cosmos-db-account-name> \
                                 --resource-group <resource-group> \
                                 --database-name HolDb \
                                 --name audios_resumes \
                                 --partition-key-path "/id"
```

In the last run of your Logic App just look at the output body of your HTTP action and you should see something like this:

```json
{
  "RecognitionStatus": "Success",
  "Offset": 1500000,
  "Duration": 32400000,
  "DisplayText": "What's the weather like?"
}
```

Copy it, and like previously add a `Parse Json` action into the Logic App and use this as a "Sample payload to generate schema" and choose the `Body` response as input:

![Parse HTTP response](assets/logic-app-parse-http-response.png)

Then add a new action, search for `Cosmos DB` and select `Create or update document (V3)`:

Create the connection with your Cosmos Db Instance:

![Cosmos DB Connection](assets/cosmos-db-connection.png)

Finally, it's time to compose the document object to insert using JSON:

```json
{
  "id": <guid-here>,
  "path": <audio-file-storage-account-path>,
  "result": <cognitive-service-text-result>,
  "status": <cognitive-service-status-result>
}
```

![Cosmos DB Insert Document](assets/cosmos-db-insert-document.png)

Give it a try and ensure you can see a new item in your Cosmos DB!

</details>

## Add an API

Azure Functions is a serverless solution that allows you to write less code, maintain less infrastructure, scale seamlessly, and save on costs. You don't need to worry about deploying and maintaining servers, Azure provides all the up-to-date resources needed to keep your applications running. You just need to focus on your code.

At this point you have the first scenario quite complete. The last thing you need to add is an API to upload the audio file to your storage account. For this step you will use `Azure Functions`.

Make sure to create one Azure Function with:

- The `Linux` Operating System
- A plan type set to `Consumption (Serverless)`
- The language you are most confortable with

For the answer, the Azure Function will be done in Python.

The naming formats to use are:
For the Azure function: `func-<environment>-<region>-<application-name>-<owner>-<instance>`
For the storage account associated to it: `stfunc<environment><region><application-name><owner><instance>`

<div class="info" data-title="Resources">

> [Azure Functions][azure-function]<br> > [Azure Function Core Tools][azure-function-core-tools]<br> > [Basics of Azure Functions][azure-function-basics]<br>

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Create an Azure storage account dedicated to the Azure Function (This will be used to store files cache...)
az storage account create --name <function-storage-account-name> \
                          --location <region>  \
                          --resource-group <resource-group> \
                          --sku Standard_LRS

# Create a serverless function app in the resource group.
az functionapp create --name <function-name> \
                      --storage-account <function-storage-account-name> \
                      --consumption-plan-location <region>
                      --runtime python
                      --os-type Linux
                      --resource-group <resource-group> \
                      --functions-version 4
```

You must create a storage account dedicated to your Azure Function in order to not mix the audios files and the Azure Function specificities.

For the coding part, let's create a function using the [Azure Function Core Tools][azure-function-core-tools], **create a folder** and then run:

```bash
func new
```

Then select `python` and `Http Trigger`, name your function `AudioUpload`. Open the project inside VS Code and then:

Create a dev environment for the project:

```sh
python3 -m venv .venv
```

This will ensure the packages needed for your project are installed only for it.

Then, activate the dev environment:

```sh
# Linux
source .venv/bin/activate

# Windows
.\.venv\Scripts\activate
```

Install python packages for the project:

```sh
pip install -r requirements.txt
```

- Create a `func.py` at the same level of `__init__.py`.
- Copy all the content of `__init__.py` into `func.py`.
- Leave the `__init__.py` empty, this is mandatory for Python to find the files in that foler

Update the `function.json` with two environment variables:

- the storage account container
- the Storage Account connection string.

And don't forget to change the `scriptFile` to use `func.py`:

```json
{
  "scriptFile": "func.py",
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    },
    {
      "name": "outputblob",
      "type": "blob",
      "path": "%STORAGE_ACCOUNT_CONTAINER%/audio.wav",
      "connection": "STORAGE_ACCOUNT_CONNECTION_STRING",
      "direction": "out"
    }
  ]
}
```

Go to [Azure Portal][az-portal] and go to the `Configuration` and update the app settings with the `STORAGE_ACCOUNT_CONTAINER` to `audios` and get a connection string from the storage account with your audios container and set the `STORAGE_ACCOUNT_CONNECTION_STRING`.

Update the `func.py` to:

```python
import logging

import azure.functions as func

def main(req: func.HttpRequest, outputblob: func.Out[bytes]) -> func.HttpResponse:
    for input_file in req.files.values():
        filename = input_file.filename
        contents = input_file.stream.read()

        logging.info('Filename: %s' % filename)
        outputblob.set(contents)

    return func.HttpResponse(
        "This HTTP triggered function executed successfully.",
        status_code=200
    )
```

Deploy your function using the VS Code extension or by command line:

```bash
func azure functionapp publish func-<environment>-<region>-<application-name>-<owner>-<instance>
```

Let's give a try using Postman:

![Postman](assets/func-postman.png)

</details>

<!-- TODO : Add a summary of Lab 1 "By now you should have a system that triggers as per audio addition ... No audio upload, no compute consumption (except for Event Hub) -->

[az-portal]: https://portal.azure.com
[azure-function]: https://learn.microsoft.com/en-us/cli/azure/functionapp?view=azure-cli-latest
[azure-function-core-tools]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Cwindows%2Ccsharp%2Cportal%2Cbash
[azure-function-basics]: https://learn.microsoft.com/en-us/azure/azure-functions/supported-languages

---

# Lab 2

Coming soon...
