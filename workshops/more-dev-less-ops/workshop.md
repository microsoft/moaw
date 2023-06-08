---
published: true
type: workshop
title: More Dev Less Ops Workshop
short_title: More Dev Less Ops
description: This workshop will cover Microsoft Dev Box, Az Dev CLI.
level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Damien Aicheh
contacts:                               # Required. Must match the number of authors
  - '@damienaicheh'
duration_minutes: 90
tags: azure, Azure Dev Center, Microsoft Dev Box, Azure Deployment Environment, Az Dev CLI
navigation_levels: 3
---

# More Dev Less Ops Workshop

Welcome to this Workshop. In this lab, you will discover how Microsoft move towards to help developers to be more productive and focus on their code. You will discover two services: Microsoft Dev Box and Azure Deployment Environment.

During this workshop you will have the instructions to complete each steps, try to find the answer before looking at the solution. Don't worry, this is a step by step lab, you will be guided through it.

## Prerequisites

To access the resources of this workshop, you will have access to an Azure subscription.

## A bit of context

When you arrive a new company, you need to be onboarded. This is the same for developers. They need to be onboarded to the company and to the project they will work on. This is a long process that can take days or weeks. Moreover, the developer needs to have a computer with all the tools needed to develop the application. 

This scenario is not the best for the developer and the company. An other reccurent problem for developers is for deploying their application without waiting for the IT team to create the infrastructure. This is a long process that can take days or weeks. 

Based on this report, Microsoft has created two services to help developers to be more productive, autonomous and focus on their code. Those services are Microsoft Dev Box and Azure Deployment Environment.

## Microsoft Dev Box

### What is Microsoft Dev Box?

To solve this problem, Microsoft has created a new service called Microsoft Dev Box. This service allows developers to create on-demand, high-performance, secure, ready-to-code, project-specific workstations in the cloud. It is a fully managed service that provides pre-configured development environments accessible from anywhere.

The principle is simple, you have a project with specific technologies, so you need to have a computer with all the tools needed to develop the application. This is what Microsoft Dev Box provides. 

Based on this, the IT team can provide through a Dev Center multiple Dev Box definitions with all the tools needed to develop different projects type. Then, when needed the developer can just create a new Dev Box based on the Dev Box definition. This Dev Box will be created in a few minutes and the developer can start to work on it.

The Dev Box can be a Windows 10 or 11 with a specific configuration. It can be accessed from Windows, Mac, Android, iOS or a web browser.

The different tools provided in the Dev Box definition can be declared inside a `devbox.yaml` file (Actually in private preview). This file allows you to install software with the `WinGet` or `Chocolatey` package managers, as well as setting common OS settings like enabling Windows Features and configuring applications like installing Visual Studio extensions.

In this workshop, you will use a pre-configured Dev Box environment to create a new application.

### Overview of the Microsoft Dev Box service

To start this workshop, let's have a look at the Microsoft Dev Box service from an IT team perspective. Take the credentials provided to you and open a new tab in your browser and navigate to [Azure Portal](https://portal.azure.com/).

In the search bar on top, type `Dev Box` and select the `Microsoft Dev Box` service. On the left, you will find all the dev centers and projects of your subscription. 

You should see this king of screen (the name of the resource group will be different on your subscription):

![Microsoft Dev Box Dev Centers](./assets/microsoft-dev-box-dev-center.png)

![Microsoft Dev Box Projects](./assets/microsoft-dev-box-projects.png)

### What is a Dev Center?

The Dev Center is the contol tower of the IT team to have an overview of all the Dev Boxes, Catalogs, Environments and Projects. It is the place where all the resources needed by the developers are defined.

Click on the `Dev Centers` tab on the left and select the first one of the list. You will be redirected to the resource detail page.

A Dev Center is composed of multiple resources:
- Dev Box definitions
- Catalogs
- Environments types
- Projects

Each of those resources has a specific role in the Dev Center.

![Dev Center Overview](./assets/dev-center-overview.png)

#### Dev Box definitions

A Dev Box definition is a preconfigured Virtual Machine with a specific configuration ready to use by developers. It can be a Windows 10 or 11 with a specific configuration. It can be accessed from Windows, Mac, Android, iOS or a web browser.

You can give a specific amount of RAM, CPU, disk size and disk type to the Dev Box. You can also specify a custom image stored in your Azure compute gallery.

All those definitions will be available for the developers to create a new Dev Box based on it, in a few minutes. A developer portal is provided to the developers to create a new Dev Box based on the Dev Box definition. 

The Dev Box is entirely integrated in your souscription. You can use your Azure AD credentials to connect to the Dev Box. You can also define rules to stop the Dev Box automatically after the working hours.

You will see the dedicated developer experience later in this workshop.

![Dev Box definitions](./assets/dev-box-definitions.png)

#### Environment types

An environment type is a way to split the Dev Boxes of your projects in different environments that you can defined such as Dev, Staging, Prod, etc. 

![Environment types](./assets/dev-center-environment-types.png)

#### Catalogs

A catalog is a list of preconfigured Azure infrastructure environment defined using Infrastructure as Code (IaC). Those infrastructures are defined by providing a GitHub repository URL, like this one: [Azure Deployment Environment](https://github.com/Azure/deployment-environments). 

The Azure infrastructure environment are defined using Bicep and Terraform was announced as soon to be supported. Those catalogs are used to deploy the infrastructure needed by the application on depend. You will learn more on the Azure Deployment Environment section later in this workshop.

By defining a catalog, you can provide a list of environments that will be available for the developers to deploy their application on it but also, the IT team have full control on the infrastructure deployed. That leaves the developers to pick the environment they need and deploy their application on it, without waiting for multiple days or weeks to have an environment ready to used and compliant with the security and rules of the company.

![Catalogs](./assets/dev-center-catalogs.png)

#### Projects

A project is where the developers are assigned and where they can create Dev Boxes. You can limit the type of Dev Box to fit the project needs. For example, you can create a project for a Node.js application and assign only the Dev Box definitions with Node.js tools installed. 

If you click on the `Projects` tab on the left, you will see the list of projects. Select the first one of the list. You will be redirected to the project detail page. This project contains only the Dev Box pool that can be used by the developers for this project. 

As you can see, the project also has environment types. This is where you can link an environment type defined in the Dev Center to a specific Azure subscription. This will allow the developers to deploy their environment on the correct subscription when needed.

In the `Environment` section of the project, you can see the list of all environments requested on demands by the developers for this project. You can see the provisioning state of each environment. Those environments are created using the Azure Deployment Environment that you will see later in this workshop. 

![Projects](./assets/dev-center-projects.png)

## Use your Dev Box

### Connect to the Dev Box

You have now the basics to understand how Microsoft Dev Box works. Let's use it to create a new application. Go to [Dev Portal](https://devportal.microsoft.com/), sign in with the Azure credentials provided to you. 

Once you are logged in, you will see this kind of screen:

![Dev Portal](./assets/dev-portal.png)

Select the devbox corresponding to your username. You will be invited to connect to it using a Remote Desktop CLIent. Follow the instructions to connect to your Dev Box. If needed the official documentation is available [here](https://learn.microsoft.com/en-us/azure/dev-box/tutorial-connect-to-dev-box-with-remote-desktop-app?tabs=windows)

If you successfully connect, you should see the windows desktop. 

This is a Windows 11 machine with tools like Visual Studio Code, Visual Studio, Azure CLI are already installed. You can use this machine to develop your application. 

### Update an application

You will now update an existing application. Clone this repository: https://github.com and open it using Visual Studio.

You will see a simple ASP.NET Core application. This application is a simple todo list API. You can run it locally using Visual Studio.

![Todo List API](./assets/todo-list-api.png)

The goal of this workshop is to add a new endpoint to this API to get the detail of todo items. For demonstration purpose, the list of todo items are provided statically.

<details>
<summary>Toggle solution</summary>

Open the `TodoController.cs` file and add the following code:

```csharp
```

</details>

## Azure Deployment Environment

### What is Azure Deployment Environment?

Azure Deployment Environment is a new service that allows you to deploy a full environment on demand based on the templates inside the catalog defined in the project of the Dev Center. 

As a developer, this provide a way to deploy an environment on demand and test your feature directly on it. The environments is provided by the IT Teams so they are compliant with the security and rules of the company.

This will avoid developers to handle the infrastructure part of the application and focus on the application itself. Also, they will not have to deal with compliance and security rules.

As an IT Team, you can provide a list of environments that can be used by the developers. You can also provide a list of templates that can be used to deploy the infrastructure needed by the application. This will allow you to have full control on the infrastructure deployed and avoid developers to deploy resources that are not compliant with the security and rules of the company.

The developer just need to connect to [Microsoft developer portal](https://devportal.microsoft.com/) and select the template they need.

The infrastructure will be deployed in a few minutes in the correct subscription and the developer will be able to test his application on it.

### Create a new environment

Back to your application, you will now deploy it on a new environment. To do so, you need to spin up a new environment using Azure Deployment Environment.

Go to the [Dev Portal](https://devportal.microsoft.com/) and click on `+ New` button then on `New environment`:

![New Environment](./assets/dev-portal-new-environment.png)

On the right panel, give a name to your environment select an environment type, for instance `dev` and then select the template you want to use to deploy the infrastructure. In your case, you will use the `Todo List API` template.

Give it a few minutes to deploy the infrastructure. Once it's done, you will see the environment in the list of environments:

![Environment list](./assets/new-environment-created.png)

If you go back to Azure Portal, in the `Project` resource you will see in the `Environments` section the new environment created:

![Environment list](./assets/project-environment-list.png)

### Deploy your application

Now that you have an environment ready, you can deploy your application on it. To do so, you have multiple possibilities. You can use the Azure CLI or the Visual Studio menus.

To keep things more visual, you will use the Visual Studio menus. Right click on the project and select `Publish...`:

![Publish](./assets/publish.png)

Select the App Service that you just created and click on `Publish`:

![Publish](./assets/app-service-publish.png)

Once the deployment is done, you can go to the URL of your application and see the result. You should be able to call the API and get the list of todo items and the details for each one of them.

Congratulations, you just deployed your application on Azure using Azure Deployment Environment.

As you saw, you didn't have to deal with the infrastructure part of the application. You just had to select the template you want to use and the environment type. The infrastructure was deployed in a few minutes and you were able to deploy your application on it. This is a huge time saver for developers.

## Going further with Azure Developer CLI

### What is Azure Developer CLI?

[Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/) also now as `azd` is an open-source tool that accelerates the process of building cloud apps on Azure. This can be used to create a new application from a template, deploy it to Azure, and manage it.

A lot of templates are available publicly on GitHub, you can find them [here](https://github.com/topics/azd-templates). You can also create your own templates and use them with `azd`. These templates include application code, and reusable infrastructure as code assets.

The `azd` tool can be use in combination with Azure CLI to support your Azure workflow.

By the end of this workshop, you will have to create your own template and use it to deploy your application on Azure.