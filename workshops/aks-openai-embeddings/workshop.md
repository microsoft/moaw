---
published: false                        # Optional. Set to true to publish the workshop (default: false)
type: workshop                          # Required.
title: AKS and OpenAI Embeddings Workshop              # Required. Full title of the workshop
short_title: AKS and OpenAI Embeddings Workshop       # Optional. Short title displayed in the header
description: This is a workshop for cloud engineers who would like to learn how build secure AKS environments for their AI applications using OpenAI, Redis, Langchain and various Azure AI services like the form recognizer  # Required.
level: intermediate                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Ayobami Ayodeji
contacts:                               # Required. Must match the number of authors
  - "@mosabami"
duration_minutes: 120                   # Required. Estimated duration in minutes
tags: aks, openai, python, langchain         # Required. Tags for filtering and searching
#banner_url: assets/banner.jpg           # Optional. Should be a 1280x640px image
#video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
#audience: students                      # Optional. Audience of the workshop (students, pro devs, etc.)
#wt_id: <cxa_tracking_id>                # Optional. Set advocacy tracking code for supported links
#oc_id: <marketing_tracking_id>          # Optional. Set marketing tracking code for supported links
#navigation_levels: 2                    # Optional. Number of levels displayed in the side menu (default: 2)
#sections_title:                         # Optional. Override titles for each section to be displayed in the side bar
#   - Section 1 title
#   - Section 2 title
---

# AKS and OpenAI Embeddings Workshop

AKS is a great platform for hosting modern AI based applications for various reasons. It provides a single control plane to host all the assets required to build applications from end to end and even allows the development of applications using a Microservice architecture. What this means is that the AI based components can be separated from the rest of the applications. AKS also allows hosting of some of Azure's AI services as containers withing your cluster, so that you can keep all the endpoints of your applications private as well as manage scaling however you need to. This is a significant advantage when it comes to securing your application. By hosting all components in a single control plane, you can streamline your DevOps process.

In this workshop, you will perform a series of tasks with the end result being a Python based chatbot application deployed in a moderately well architected AKS environment, but allow more advanced environment architectures be deployed due to the flexibility of the AKS construciton tool being used. The appliction will have a page that allows the user upload text, pdf and other forms of media. This triggers a batch process that gets sequenced in Azure storage queue. It uses an Azure OpenAI embedding model to create embeddings of the uploaded document which then allows the chatbot answer questions based on the content of the data uploaded. For more information about the architecture of this workload, checkout the [AKS Landing Zone Accelerator](https://github.com/Azure/AKS-Landing-Zone-Accelerator/tree/main/Scenarios/AKS-OpenAI-CogServe-Redis-Embeddings#core-architecture-components) repo.

![Architecture](assets/architecture_aks_oai.png)

## Prerequisites

<div class="info" data-title="Info">

> This workshop was originally developed as part of the AKS landing zone accelerator program. Check out [the repo](https://aka.ms/akslza/aiscenario) for more information

</div> 

You will need to have the following installed on your system if you are not using Azure cloud shell. The .devcontainer of the repo you will be cloning comes preinstalled with them:

- Kubectl, preferably 1.25 and above  ( `az aks install-cli` ) 
- [Azure Subscription](https://azure.microsoft.com/free)
- [Azure CLI](https://learn.microsoft.com/cli/azure/what-is-azure-cli?WT.mc_id=containers-105184-pauyu)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- Bash shell (e.g. [Windows Terminal](https://www.microsoft.com/p/windows-terminal/9n0dx20hk701) with [WSL](https://docs.microsoft.com/windows/wsl/install-win10) or [Azure Cloud Shell](https://shell.azure.com))

<div class="important" data-title="important">

> To Deploy this scenario, you must have Azure OpenAI Service enabled in your subscription.  If you haven't registered it yet, follow the instructions [here](https://learn.microsoft.com/legal/cognitive-services/openai/limited-access) to do so. Registration may take a day.

</div> 

---

## Fork and Clone the repo
<div class="warning" data-title="Warning">

> Ensure you fork the repo before cloning your fork. If you don't fork it, you might not be able to push changes or run GitHub Actions required at the end of this workshop.

</div> 

1. Skip this step if you have a local terminal ready with kubectl and Azure CLI installed. Using a web browser, navigate to the [Azure Cloud Shell](https://shell.azure.com). Ensure your Cloud Shell is set to Bash. If it is on PowerShell, click the drop down in the top left corner and select Bash.
1. Clone this repository locally, and change the directory to the `./infrastructure` folder.
    ```bash
    git clone --recurse-submodules https://github.com/Azure/AKS-Landing-Zone-Accelerator

    cd Scenarios/AKS-OpenAI-CogServe-Redis-Embeddings/infrastructure/
    ```
1. Ensure you are signed into the `az` CLI (use `az login` if not)

<div class="warning" data-title="warning">

> If running in **Github Code Spaces**, update submodules explicitly run in `AKS-Landing-Zone-Accelerator/Scenarios/AKS-OpenAI-CogServe-Redis-Embeddings/`

</div> 

```bash
git submodule update --init --recursive
```

---

## Setup environment specific variables
This will set environment variables, including your preferred `Resource Group` name and `Azure Region` for the subsequent steps, and create the `resource group` where we will deploy the solution.

 > **Important**
 > Set UNIQUESTRING to a value that will prevent your resources from clashing names, recommended combination of your initials, and 2-digit number (eg. js07)

```bash
UNIQUESTRING=<Your value here>
RGNAME=embedding-openai-rg
LOCATION=eastus
SIGNEDINUSER=$(az ad signed-in-user show --query id --out tsv) && echo "Current user is $SIGNEDINUSER"

```

---

## Deploy the environment using IaC (Bicep) and AKS Construction

Create all the solution resources using the provided `bicep` template and capture the output environment configuration in variables that are used later in the process.
<div class="info" data-title="Info">

> Our bicep template is using the [AKS-Construction](https://github.com/Azure/AKS-Construction) project to provision the AKS Cluster and associated cluster services/addons, in addition to the other workload specific resources.

</div> 

<div class="warning" data-title="Warning">

> Ensure you have enough **quota** to deploy the gpt-35-turbo and text-embedding-ada-002 models before running the command below. Failure to do this will lead to an "InsufficientQuota" error in the model deployment. Most subscriptions have quota of 1 of these models, so if you already have either of those models deployed, you might not be able to deploy another one in the same subscription and you might have to use that deployment as your model instead to proceed. If that is the case, use the **Reusing existing  OpenAI Service** option. Otherwise use the **Deploy new resources** option.

</div> 

#### Reusing existing OpenAI Service option

If you are re-using existing OpenAI resource set following variables and pass them to Bicep template

```bash
OPENAI_RGNAME=<Name of existing OpenAI RG>
OPENAI_ACCOUNTNAME=<Name of existing OpenAI service>
```

Add optional variable variables to the script below
```bash
az deployment sub create \
        --name main-$UNIQUESTRING \
        --template-file main.bicep \
        --location=$LOCATION \
        --parameters UniqueString=$UNIQUESTRING \
        --parameters signedinuser=$SIGNEDINUSER \
        --parameters resourceGroupName=$RGNAME \
        --parameters openAIName=$OPENAI_ACCOUNTNAME \
        --parameters openAIRGName=$OPENAI_RGNAME 
      
```

#### Deploy new resources option
```bash
az deployment sub create \
        --name main-$UNIQUESTRING \
        --template-file main.bicep \
        --location=$LOCATION \
        --parameters UniqueString=$UNIQUESTRING \
        --parameters signedinuser=$SIGNEDINUSER \
        --parameters resourceGroupName=$RGNAME      
```
### Set Output Variables

<div class="important" data-title="important">

> If you already had an OpenAI resource before you began this deployment that had either gpt-35-turbo or text-embedding-ada-002 turbo, you will need to change the OPENAI_ACCOUNTNAME, OPENAI_RGNAME, OPENAI_API_BASE, OPENAI_ENGINE and OPENAI_EMBEDDINGS_ENGINE environment variables in the commands below to the actual names used in your previous deployment. If you only created one of the two required models previously, you will need to create the other one manually.

</div> 

```bash
KV_NAME=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.kvAppName.value -o tsv) && echo "The Key Vault name is $KV_NAME"
OIDCISSUERURL=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.aksOidcIssuerUrl.value -o tsv) && echo "The OIDC Issue URL is $OIDCISSUERURL"
AKSCLUSTER=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.aksClusterName.value -o tsv) && echo "The AKS cluster name is $AKSCLUSTER"
BLOB_ACCOUNT_NAME=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.blobAccountName.value -o tsv) && echo "The Azure Storage Blob account name is $BLOB_ACCOUNT_NAME"
FORMREC_ACCOUNT=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.formRecognizerName.value -o tsv) && echo "The Document Intelligence account name is $FORMREC_ACCOUNT"
FORM_RECOGNIZER_ENDPOINT=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.formRecognizerEndpoint.value -o tsv) && echo "The Document Intelligence endpoint URL is $FORM_RECOGNIZER_ENDPOINT"
TRANSLATOR_ACCOUNT=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.translatorName.value -o tsv) && echo "The Translator account name is $TRANSLATOR_ACCOUNT"
ACR_NAME=$(az acr list -g $RGNAME --query '[0]'.name -o tsv) && echo "The Azure OpenAI GPT Model is $ACR_NAME"
# If you created the OpenAI service separate from the deployment steps in this workshop, dont run the commands below, instead provide the name of your exisitng OpenAI deployments as the value of these environment variables.
OPENAI_ACCOUNTNAME=$(az deployment sub show --name main-$UNIQUESTRING --query properties.outputs.openAIAccountName.value -o tsv) && echo "The Azure OpenAI account name is $OPENAI_ACCOUNTNAME"
OPENAI_API_BASE=$(az deployment sub show --name main-$UNIQUESTRING  --query properties.outputs.openAIURL.value -o tsv) && echo "The Azure OpenAI instance API URL is $OPENAI_API_BASE"
OPENAI_RGNAME=$(az deployment sub show --name main-$UNIQUESTRING  --query properties.outputs.openAIRGName.value -o tsv) && echo "The Azure OpenAI Resource Group is $OPENAI_RGNAME"
OPENAI_ENGINE=$(az deployment sub show --name main-$UNIQUESTRING  --query properties.outputs.openAIEngineName.value -o tsv) && echo "The Azure OpenAI GPT Model is $OPENAI_ENGINE"
OPENAI_EMBEDDINGS_ENGINE=$(az deployment sub show --name main-$UNIQUESTRING  --query properties.outputs.openAIEmbeddingEngine.value -o tsv) && echo "The Azure OpenAI Embedding Model is $OPENAI_EMBEDDINGS_ENGINE"

```

If variables are empty (some shells like zsh may have this issue) - see Troubleshooting section below.
<div class="warning" data-title="Warning">

> Ensure you those commands above captured the correct values for the environment variables by using the echo command, otherwise you might run into errors in the next few commands.

</div> 

---

## Store the resource keys Key Vault Secrets
OpenAI API, Blob Storage, Form Recognizer and Translator keys will be secured in Key Vault, and passed to the workload using the CSI Secret driver

<div class="tip" data-title="Tip">

> If you get a bad request error in any of the commands below, then it means the previous commands did not serialize the environment variable correctly. Use the echo command to get the name of the AI services used in the commands below and run the commands by replacing the environment variables with actual service names.

</div> 

Enter the commands below to store the required secrets in Key vault
  ```bash
  az keyvault secret set --name openaiapikey  --vault-name $KV_NAME --value $(az cognitiveservices account keys list -g $OPENAI_RGNAME -n $OPENAI_ACCOUNTNAME --query key1 -o tsv)

  az keyvault secret set --name formrecognizerkey  --vault-name $KV_NAME --value $(az cognitiveservices account keys list -g $RGNAME -n $FORMREC_ACCOUNT --query key1 -o tsv)

  az keyvault secret set --name translatekey  --vault-name $KV_NAME --value $(az cognitiveservices account keys list -g $RGNAME -n $TRANSLATOR_ACCOUNT --query key1 -o tsv)

  az keyvault secret set --name blobaccountkey  --vault-name $KV_NAME --value $(az storage account keys list -g $RGNAME -n $BLOB_ACCOUNT_NAME --query \[1\].value -o tsv)
  ```

---

## Federate AKS MI with Service account 
Create and record the required federation to allow the CSI Secret driver to use the AD Workload identity, and to update the manifest files.

<div class="important" data-title="important">

> If running the commands below in **zsh** or in **Github Code Spaces**, order of the variables is different. Make sure the variables make sense by taking a look at the echo'ed strings in your terminal. Use Option 1 below. If you are not using either of those two terminals, use Option 2 below.

</div> 

#### Option 1 for **zsh** or **Github Code Spaces**

```bash
CSIIdentity=($(az aks show -g $RGNAME -n $AKSCLUSTER --query "[addonProfiles.azureKeyvaultSecretsProvider.identity.resourceId,addonProfiles.azureKeyvaultSecretsProvider.identity.clientId]" -o tsv |  cut -d '/' -f 5,9 --output-delimiter ' '))

CLIENT_ID=${CSIIdentity[3]} && echo "CLIENT_ID is $CLIENT_ID"
IDNAME=${CSIIdentity[2]} && echo "IDNAME is $IDNAME"
IDRG=${CSIIdentity[1]} && echo "IDRG is $IDRG"

az identity federated-credential create --name aksfederatedidentity --identity-name $IDNAME --resource-group $IDRG --issuer $OIDCISSUERURL --subject system:serviceaccount:default:serversa
```

#### Option 2 for other Bash

```bash
CSIIdentity=($(az aks show -g $RGNAME -n $AKSCLUSTER --query "[addonProfiles.azureKeyvaultSecretsProvider.identity.resourceId,addonProfiles.azureKeyvaultSecretsProvider.identity.clientId]" -o tsv |  cut -d '/' -f 5,9 --output-delimiter ' '))

CLIENT_ID=${CSIIdentity[2]} && echo "CLIENT_ID is $CLIENT_ID"
IDNAME=${CSIIdentity[1]} && echo "IDNAME is $IDNAME"
IDRG=${CSIIdentity[0]} && echo "IDRG is $IDRG"

az identity federated-credential create --name aksfederatedidentity --identity-name $IDNAME --resource-group $IDRG --issuer $OIDCISSUERURL --subject system:serviceaccount:default:serversa
```


### Build ACR Image for the web app
```bash
cd ../App/
az acr build --image oai-embeddings:v1 --registry $ACR_NAME -g $RGNAME -f ./WebApp.Dockerfile ./
```


---

## Deploy the Kubernetes Resources
In this step, you will deploy the kubernetes resources required to make the application run. This includes the ingress resources, deployments / pods, services, etc.

1. Change directory to the Kubernetes manifests folder, deployment will be done using Kustomize declarations.
    ```bash
    cd ../kubernetes/
    ```
1. Log into your AKS cluster and ensure you are properly logged in. The command should return the nodes in your cluster.
    ```bash
    az aks get-credentials -g $RGNAME -n $AKSCLUSTER
    kubectl get nodes
    ```
1. Get your ingress's IP address so you have the URL required to access your application on your browser
    ```bash
    INGRESS_IP=$(kubectl get svc nginx -n app-routing-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    echo "Ingress IP: $INGRESS_IP"
    ```
1. Save variables in a new .env file. Dont forget to change the env variables for the OPENAI_API_BASE, OPENAI_ENGIN and OPENAI_EMBEDDINGS_ENGINE variables in the command below to your actual openai deployment IF you already had an existing deployment. 
    ```bash
    cat << EOF > .env
    CLIENT_ID=$CLIENT_ID
    TENANT_ID=$(az account show --query tenantId -o tsv)
    KV_NAME=$KV_NAME
    OPENAI_API_BASE=$OPENAI_API_BASE
    OPENAI_ENGINE=$OPENAI_ENGINE
    OPENAI_EMBEDDINGS_ENGINE=$OPENAI_EMBEDDINGS_ENGINE
    LOCATION=$LOCATION
    BLOB_ACCOUNT_NAME=$BLOB_ACCOUNT_NAME
    FORM_RECOGNIZER_ENDPOINT=$FORM_RECOGNIZER_ENDPOINT
    DNS_NAME=openai-$UNIQUESTRING.$INGRESS_IP.nip.io
    ACR_IMAGE=$ACR_NAME.azurecr.io/oai-embeddings:v1
    EOF
    ```
1. Deploy the Kubernetes resources. Use option 1 if you are using kubectl < 1.25. Use option 2 if you are using kubectl >= 1.25
    
    **Option 1:**
    ```bash
    kustomize build . > deploy-all.yaml

    kubectl apply -f deploy-all.yaml
    ```
    **Option 2:**
    ```bash
    kubectl apply -k .
    ```

---

## Test the app
1. Get the URL where the app can be reached
  ```bash
  kubectl get ingress
  ```
1. Copy the url under **HOSTS** and paste it in your browser. 
1. Try asking the chatbot a domain specific question by heading to the **Chat** tab and typing a question there. You will notice it fail to answer it correctly. 
1. Click on the `Add Document` tab in the left pane and either upload a PDF with domain information you would like to ask the chatbot about or copy and paste text containing the knowledge base in `Add text to the knowledge base` section, then click on `Compute Embeddings`
![add](./assets/openaiadddocs.png)
1. Head back to the **Chat** tab, try asking the same question again and watch the chatbot answer it correctly
![add](./assets/openaichat.png)

---

## Troubleshooting

<div class="tip" data-title="Insufficient Quota">

> Depending on your subscription OpenAI quota you may get deployment error

```json
Inner Errors:
{"code": "InsufficientQuota", "message": "The specified capacity '120' of account deployment is bigger than available capacity '108' for UsageName 'Tokens Per Minute (thousands) - GPT-35-Turbo'."}
```
There are few options - point deployment to the existing OpenAI resource instead of provisioning new one, or adjust quota.
Note: check if you have soft-deleted OpenAI instances taking up quota and purge them.
</div> 


<div class="tip" data-title="Bad Request Errors">

> Depending on type of terminal you are using, the command to create environment variables by querying the **INFRA_RESULT** variable that gets created with the deployment might not work properly. You will notice then when you get bad request errors when running subsequent commands. Try using the **echo** command to print the values of those environment variables into your terminal and replace the environment variables like `$OPENAI_ACCOUNTNAME` and `$OIDCISSUERURL` with the actual string values.

</div> 

<div class="tip" data-title="Pod deployment issues">

> If you notice that the api pod is stuck in *ContainerCreating* status, chances are that the federated identity was not created properly. To fix this, ensure that the "CSIIdentity" environment variable was created properly. You should then run the "az identity federated-credential create" command again using string values as opposed to environment variables. You can find the string values by using the **echo** command to print the environment variables in your terminal. It is the API deployment that brings the secrets from Key vault into the AKS cluster, so the other two pods require the API pod to be in a running state before they can start as well since they require the secrets.

</div> 

---

# Build Intelligent Apps on AKS Challenge 1

Create CICD pipeline to automate OpenAI web application deployment to AKS.

Assumption is that infrastructure, setting variables and keyvault secrets were done following OpenAI Scenario  steps in [README.md](../AKS-OpenAI-CogServe-Redis-Embeddings/README.md)

## Create GitHub Identity Federated with AAD

Simplest way to create template for Github workflow is to use AKS **Automated deployments** wizard.
It will create Github identity federated with AAD and grant to it required permissions to AKS and ACR

Fork `AKS-Landing-Zone-Accelerator` repo and use wizard option to "Deploy an application" pointing it to your fork and selecting provisioned ACR and AKS

## Update GitHub workflow for Kustomize steps
Once deployment wizard is finished it will create PR with sample github flow that could be updated to match the steps required to run Kustomize

- Add variables section and specify all variables that were queried from deployment 
- Add Repo secret `CLIENT_ID` to value retrieved during infrastructure setup
- Add step to prepare `.env` file with all replacement variables 
- Add step to bake Kubernetes manifest from Kustomize files
- Modify deployment step to refer to Kustomize built manifest
