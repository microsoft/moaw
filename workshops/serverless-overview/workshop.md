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
  - Before you start
---

# The Serverless Workshop

Welcome to this Azure Serverless Workshop. In this lab, you will use different types of serverless services on Azure to achieve a real world scenario. Don't worry, this is a step by step lab, you will be guided through it.

During this workshop you will have the instructions to complete each steps, try to find the answer before looking at the solution.

## Prerequisites

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

## Scenario overview

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

## Naming convention

Before starting to deploy any Azure services, it's important to follow a naming convention. Based on the official [documentation][az-naming-convention] we need to define a few things:

- The application name
- The environment
- The region
- The instance number

We will also add an owner property, so for the purpose of this lab the values will be:

- The application name: `hol` (for Hands On Lab)
- The environment: `dev`
- The region: `frc`
- The instance: `01`
- The owner: `ms`

So we will use this convention:

```xml
<service-prefix><environment><region><application-name><owner><instance>
```

<div class="info" data-title="Note">

> Feel free to use your own values to be sure to have something unique and use your own convention. 

</div>

With everything ready let's start the lab!

[az-cli-install]: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
[az-func-core-tools]: https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools
[az-naming-convention]: https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming
[az-portal]: https://portal.azure.com
[vs-code]: https://code.visualstudio.com/

---

## Configure the storage account

### Create the storage account

Open the [Azure Portal][az-portal], sign in and search for `Storage Accounts` and create one based on this syntax: st<environment><region><application-name><owner><instance>, `st` is the prefix for Storage Accounts, so it will be named `stdevfrcholms01`

[IMAGE of creation with parameters]

Fill all the *Basics* tab parameters like in the image above and skip other tabs.

### Create the container

With the storage account ready, it's time to create the container to drop the audios to proceed. So, go to the `containers` and create one called `audios`:

[IMAGE of creation with parameters]

## Create an Azure Function

In the [Azure Portal][az-portal], search for `Azure Functions` and create a new one:

[IMAGE of creation with parameters]

The naming format to use must be: func-<environment><region><application-name><owner><instance>

Make sure to:
- Select the `Linux` Operating System
- Have a plan type set to `Consumption (Serverless)`

Then select the language you want to use for it. In this lab we will use `python`, however if you want to use any other language in the list you are confortable with it, of course do it!

Leave other default options as is and press the `Create` button.

## Create the Event Grid

Next step is to setup a way to listen to the audios files that the user will upload to the storage account. As you probably already guess the Event Grid service will be used for this.

Back to [Azure Portal][az-portal] and search for `Event Grid`, and because the goal is to listen to an other Azure service you need to select the `System topic` section. So let's create one:

[IMAGE of creation with parameters]

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
