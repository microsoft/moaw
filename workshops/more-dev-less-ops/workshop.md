---
published: true
type: workshop
title: More Dev Less Ops Workshop
short_title: More Dev Less Ops
description: This workshop will cover Microsoft Dev Box, Az Dev Cli.
level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Damien Aicheh
contacts:                               # Required. Must match the number of authors
  - '@damienaicheh'
duration_minutes: 90
tags: azure, azure Dev Center, Microsoft Dev Box, Az Dev Cli
navigation_levels: 3
---

# More Dev Less Ops Workshop

Welcome to this Workshop. In this lab, you will discover Microsoft and Azure services oriented for the developers such as Microsoft Dev Box, Azure Developer Cli, don't worry, this is a step by step lab, you will be guided through it.

During this workshop you will have the instructions to complete each steps, try to find the answer before looking at the solution.

---

# The Workshop

## Prerequisites

- An Azure which will be provided to you
- A GitHub account


# Microsoft Dev Box

## What is Microsoft Dev Box?

Microsoft Dev Box is a managed service that enables developers to create on-demand, high-performance, secure, ready-to-code, project-specific workstations in the cloud. It is a fully managed service that provides pre-configured development environments accessible from anywhere.

With Microsoft Dev Box, developers can focus on building applications without worrying about the underlying infrastructure. Microsoft Dev Box provides a consistent, secure development environment for each project, and it can be used for a variety of development scenarios, such as onboarding new developers, collaborating on a project, or working on a short-term project.

This support any development language, framework, IDE that can be run on Windows. Those Dev Boxes can be accessed from Windows, Mac, Android, iOS or web browser.

In this workshop, you will use a pre-configured Dev Box environment to create a new application.

## Navigate to Microsoft Dev Box

Let's start by navigating to Microsoft Dev Box. Open a new tab in your browser and navigate to [Azure Portal](https://portal.azure.com/). Sign in with the credentials provided to you.

In the search bar, type `Dev Box` and select the `Microsoft Dev Box` service. You will find all the dev centers and projects of your subscription here.

You should see this king of screen (the name of the resource group will be different on your subscriptions):

![Microsoft Dev Box](./assets/microsoft-dev-box-dev-center.png)

Let's begin to look at the `Dev Centers` tab. Select the Dev Center in the list, you will be redirected to the Dev Center detail page.

## What is a Dev Center?

The Dev Center is the main page of the Microsoft Dev Box service. It is the place where you can find all the Dev Boxes, Catalogs, Environments and Projects associated to the Dev Center.

As you discover the function of the tabs on the left navigate on its to understand what they are:

- `Dev box definitions` which are preconfigured Virtual Machines with a specific configuration ready to use by developers.
- `Catalogs` which are a list of preconfigured Azure infrastructure environment defined using Infrastructure as Code (IaC). Those infrastructures are defined by providing a GitHub repository URL, like this one: [Azure Deployment Environment](https://github.com/Azure/deployment-environments).
- `Environments types` are defined to split the Dev Boxes of your projects in different environments that you can defined such as Dev, Test, Prod, etc.
- `Projects` where you can assign users and deploy Dev Boxes specific to it.


## Deep dive into the project

Select the `Projects` tab on the left and select the project in the list. You will be redirected to the project detail page. This project contains only the Dev Box pool that can be used by the developers for this project. 

With this approach, you can imagine a project dedicated to a Node.js application, with a Dev Box pool containing only Dev Boxes with all the tools needed to develop a Node.js application pre-installed.

If you click on the `Dev Box pools` tab on the left, you will see the list of Dev Boxes available for this project. Each dev box can have local administator or standard user privileges. Moreover, you can specify hours where the Dev Box can be automatically stopped. This is useful to save money when the Dev Box is not used.

Click on a Dev Box definition in the list, you will be redirected to the Dev Center detail page. You will see details about the Dev Box definition such as Windows version and tools installed.

![Dev Box Definitions](./assets/devcenter-dev-box-definitions.png)

## Use the Dev Box

You have now the basics to understand how Microsoft Dev Box works. Let's use it to create a new application. Go to [Microsoft Dev Box](https://devbox.microsoft.com/), sign in with your Azure credentials. 

Once you are logged in, you will see dev boxes, select the one corresponding to your user name. You will be invited to connect to it using a Remote Desktop Client. Follow the instructions to connect to your Dev Box. If needed the official documentation is available [here](https://learn.microsoft.com/en-us/azure/dev-box/tutorial-connect-to-dev-box-with-remote-desktop-app?tabs=windows)

If everything is ok, you should see this kind of screen:

![Dev Box](./assets/dev-box-rdp.png)

This is a Windows 11 machine with tools like Visual Studio Code, Visual Studio, Azure CLI are already installed. You can use this machine to develop your application.

# Azure Developer Cli

## What is Azure Developer Cli?

[Azure Developer Cli]() also now as `azd` is an open-source tool that accelerates the process of building cloud apps on Azure. This can be used to create a new application from a template, deploy it to Azure, and manage it.

A lot of templates are available publicly on GitHub, you can find them [here](https://github.com/topics/azd-templates). You can also create your own templates and use them with `azd`. These templates include application code, and reusable infrastructure as code assets.

The `azd` tool can be use in combination with Azure Cli to support your Azure workflow.

For this workshop, you will use a custom template to create a new application. This template is available [here](TODO).

## Develop a new application

The goal of this section is to create a new application using `azd` and in the next one you will discover how to deploy it to Azure using `azd` or `Azure Deployment Environment`. The template used for this workshop is a basic API that manage a TODO list. This application is a dotnet API.

Your Dev Box is connected to an Azure Environment like defined ...
// TODO Explain how this is connected to a database for the API

## Use Azure Developer Cli

Let's start by using `azd` to create a new application. Open a new terminal in your Dev Box and type the following command:

```bash
azd init TODO with the template URL
```

Open the generated project with VS Code. You will see a project with the infrastructure as code, pipeline and application code. In the repository, you will find an `azure.yaml` file, this one is used by `azd` as a configuration file.

The application code is voluntarily simple, it is a basic API that manage a TODO list. The goal is to add 2 calls to retreive elements to the associated database.