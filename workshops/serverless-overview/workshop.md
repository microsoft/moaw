---
published: true
type: workshop
title: Serverless Workshop
short_title: Short title for header
description: This workshop will cover multiple serverless services that you will use to build a complete scenario.
level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Damien Aicheh
contacts:                               # Required. Must match the number of authors
  - '@damienaicheh'
duration_minutes: 20
tags: azure, azure functions, logic apps, event grid, key vault, cosmos db, email
#banner_url: assets/banner.jpg           # Optional. Should be a 1280x640px image
#video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
#audience: students                      # Optional. Audience of the workshop (students, pro devs, etc.)
#wt_id: <cxa_tracking_id>                # Optional. Set advocacy tracking code for supported links
#oc_id: <marketing_tracking_id>          # Optional. Set marketing tracking code for supported links
sections_title:                         # Optional. Override titles for each section to be displayed in the side bar
  - The Serverless Workshop
---

## The Serverless Workshop

### Before you start

Welcome to this Azure Serverless Workshop. In this lab, you will use different types of serverless services on Azure to achieve a real world scenario. Don't worry, this is a step by step lab, you will be guided through it.

During this workshop you will have the instructions to complete each steps, try to find the answer before looking at the solution.

### Prerequisites

Before starting this workshop, be sure you have:

- An Azure Subscription with **enough right** to create and manage services
- The [Azure CLI][az-cli-install] installed on your machine
- The [Azure Functions Core Tools][az-func-core-tools] installed, this will be useful for creating the scaffold of your Azure Functions using command line.

<div class="task" data-title="Task">

> Before starting, login to your Azure subscription locally using Azure CLI and inside the [Azure Portal][az-portal] using your own credentials.

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Login to Azure
az login
# Display your account details
az account show
# Select a specific subscription if you have more than one or the wrong one selected
az account set --subscription <subscription-id>
```

</details>

### Scenario overview

The goal of the lab is to upload an audio file to Azure and receive the content inside a Single Page Application. Here is a diagram to explain it:

![global shema]

1) The user upload the audio file to the Web application
2) The web application communicate if an APIM (API Management) which is a facade for multiple APIs
3) An Azure Function which works as a simple API will upload the file to a Storage Account.
4) When the file is uploaded the Event Grid service will detect it and send a "Blob created event" to an event Hub
5) The Event Hub will be consumed by a Logic App which will be responsible from sending the audio file from the Storage Account to the Azure cognitive service.
6) The speech to text service will proceed the file and return the result to the Logic App.
7) The Logic App will then store it inside a Cosmos Db database
8) An other Azure Function will listen to this Cosmos Db and get the text just uploaded to send it to the Web pub/sub service.
9) Finally the Web pub/sub service which works like a websocket will notify the Web Application with the content of the audio file.

<div class="info" data-title="Note">

> The Azure Key Vault will be used to store the different secrets needed for this scenario.

</div>

You will get more details about each of these services during the Hands On Lab.

### Naming convention

Before starting to deploy any Azure services, it's important to follow a naming convention. Based on the official [documentation][az-naming-convention] we need to define a few things:

- The application name
- The environment
- The region
- The instance number

We will also add an owner property, so for the purpose of this lab the values will be:

- The application name: `hol` (for Hands On Lab)
- The environment: `dev`
- The region: `we`
- The instance: `01`
- The owner: `ms`

So we will use this convention:

```xml
<!--If the resource dashes: -->
<service-prefix>-<environment>-<region>-<application-name>-<owner>-<instance>
<!--If the resource does not autorize any special caracters: -->
<service-prefix><environment><region><application-name><owner><instance>
```

<div class="info" data-title="Note">

> Be sure to use your own value to have unique names or use your own convention. 

</div>

With everything ready let's start the lab!

[az-cli-install]: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
[az-func-core-tools]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools
[az-naming-convention]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming
[az-portal]: https://portal.azure.com
[vs-code]: https://code.visualstudio.com/

---

## Create a resource group

Let's start by creating the resource group for this Hand's On Lab.

<div class="info" data-title="Information">

> For the purpose of this lab we will create all the resources in the same region, for instance West US (westus) or West Europe (westeurope).

</div>

Remember, the naming convension for resource groups will be: `rg-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="task" data-title="Resources">

> https://learn.microsoft.com/fr-fr/cli/azure/group?view=azure-cli-latest

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Use az account list-locations to get a location:

az account list-locations -o table

# Then create the resource group using the selected location:

az group create --name <resource-group> --location <region>
```

</details>

---

## Configure the storage account

With the resource group ready, let's create a storage account with a container named `audios` that will store all audios. The naming convention for Storage Accounts is: `st<environment><region><application-name><owner><instance>`.

Choose a Locally redundant storage: Standard LRS

<div class="task" data-title="Resources">

> https://learn.microsoft.com/fr-fr/cli/azure/storage/account?view=azure-cli-latest
> https://learn.microsoft.com/fr-fr/cli/azure/storage/container?view=azure-cli-latest

</div>

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

If everything is fine, open the [Azure Portal][az-portal] and you will retreive your container:

![Storage account access keys](assets/storage-account-show-container.png)
</details>

[az-portal]: https://portal.azure.com

---

## Detect the audio uploaded

### Create an Event Grid

Next step is to setup a way to listen to the audios files uploaded by the user in the storage account container. To start, we will upload them directly using the [Azure Portal][az-portal] and further in the lab we will use a user interface and a dedicated API.

To detect the upload you will use a service called Event Grid, and use the `System topic`.

The naming convention for Event Grid topics is: `egst-<environment>-<region>-<application-name>-<owner>-<instance>`.

<div class="task" data-title="Resources">

> https://learn.microsoft.com/en-us/cli/azure/eventgrid/system-topic?view=azure-cli-latest

</div>

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Create the Event Grid system topic
az eventgrid system-topic create -g <resource-group> \
                                 --name <event-grid-system-topic-name> \
                                 --location <region> --topic-type microsoft.storage.storageaccounts \
                                 --source /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Storage/storageAccounts/<storage-account-name>
```

</details>

### Create an Event Hub

The Event Grid previously created will listen to the Storage Account, but before adding this mecanism we need to create another service: The Event Hub. This one is responsible for broadcasting the event creating by the Event Grid service. With that in placethe event can be consumed by multiple services. In our case, a Logic App will be triggered based on the Event Hub broadcasting.

The naming convention for Event Hub Namespace is: `evhns-<environment>-<region>-<application-name>-<owner>-<instance>` and for the event hub: `evh-audios-uploaded-<environment>-<region>-<application-name>-<owner>-<instance>`.

- Use the `Basic` SKU for the Event Hub Namespace.
- Define the message retention to 1 and partition count to 2 for the Event Hub.

<div class="task" data-title="Resources">

> https://learn.microsoft.com/en-us/cli/azure/eventhubs/namespace?view=azure-cli-latest
> https://learn.microsoft.com/en-us/cli/azure/eventhubs/eventhub?view=azure-cli-latest

</div>

<details>
<summary>Toggle solution</summary>

```bash
# Create the Event Hub Namespace
az eventhubs namespace create --resource-group <resource-group> \
                              --name <event-hub-namespace> \
                              --location <region> \
                              --sku Basic 

# Create the Event Hub Instance
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
To achieve this, you need to meet these triggers criterias:
- Only on blob creation
- If the file is uploaded in the `audios` container otherwise ignore it
- If the file extension is `.wav`
- The Event Grid trigger the Event Hub

The naming convention for Event Subscription is: `evgs-audios-uploaded-<environment>-<region>-<application-name>-<owner>-<instance>`

<div class="tips" data-title="Tip">

> To get access to the identifier of a resource, go to the `Overview` tab and click en `Json View` on the top right and you will see it.

</div>

<div class="task" data-title="Resources">

> https://learn.microsoft.com/en-us/cli/azure/eventgrid/system-topic/event-subscription?view=azure-cli-latest

</div>

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
                                             --endpoint /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.EventHub/namespaces/<event-grid-system-topic-name>/eventhubs/<event-hub-name>
```

If you did everything correctly you should see the event subscription like this:

![Event Grid System Topic Subscription](assets/event-grid-system-topic-subscription.png)

</details>






## Create an Azure Function

In the [Azure Portal][az-portal], search for `Azure Functions` and create a new one:

[IMAGE of creation with parameters]

The naming format to use must be: func-<environment><region><application-name><owner><instance>

Make sure to:
- Select the `Linux` Operating System
- Have a plan type set to `Consumption (Serverless)`

Then select the language you want to use for it. In this lab we will use `python`, however if you want to use any other language in the list you are confortable with it, of course do it!

Leave other default options as is and press the `Create` button.


## Create the Event Grid function

The goal now is to ask Event Grid to listen to the audios container of the storage account and then trigger the Azure Function to proceed the new file. To achieve this, you first need to create the code for the Azure Function and deploy it once. 
In fact, to create this the Event Grid will ask for a Function named to trigger.

To create your Azure Function you have multiples options, but let's talk about two:

- Use the [Azure Functions Core Tools][az-func-core-tools] using command lines
- Use the Azure Functions extensions inside [VS Code][vs-code]
  
Using the command line, **inside a specific folder** just run:

```
func new ...
```

The most important parameter is the Event Grid Trigger option, without this one, the function won't be compatible with the Event Grid.

[ADD MORE DETAILS]

## Create the Event Subscription




Next step is to create the Azure Function that will

Lab section order

1) Create the Azure Function

2) Create the Event Hub

3) Create the Azure Function code to download the audio file

4) Create the Text to Speech service

5) Send the file to the Speech to Text service

6) Create the Cosmos Db 

7) Send the result of the Text to Speech service

8) Create the Logic App

9)  Send the email to the user 
10) 
création storage account
création du container audios

création du Event Grid System Topic pour s'abonner au storage account
-> création d'un Event Subscription: ev-audio-publisher

création d'un Event Hubs Namespace pour écouter le Event Subscription et exposer un Event Hub topic: ev-audio-hub

création d'une Azure Function avec Event Hub comme trigger
-> création de la connection string pour l'Azure Function à l'ev-audio-hub
-> récupération de la connection string pour le Storage Account

créer la function avec func new

ajouter les SPEECH_KEY et SPEECH_REGION dans les app settings
https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=macos%2Cterminal&pivots=programming-language-python

Namming:
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming

Identité à ta function app
supprimer SAS token et utiliser identité managé
ajouter au keyvault les clés
Output binding cosmosdb
