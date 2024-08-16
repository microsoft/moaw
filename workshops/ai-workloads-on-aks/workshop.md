---
published: false
type: workshop
title: Containerizing and Deploying AI Workloads on AKS
short_title: Containerizing and Deploying AI Workloads on AKS
description: So, you have a new AI workload that you're ready to put into production. Join us as we cover the key considerations for deploying AI workloads at scale, from local development to large-scale deployment on Azure Kubernetes Service (AKS). We'll get hands on and deploy an AI workload to an enterprise ready AKS cluster. We'll go from "works on my machine" to "works on all machines" in 90 minutes or less!
level: beginner
authors:
  - Paul Yu
contacts:
  - "@pauldotyu"
duration_minutes: 90
tags: workshop, authoring
sections_title:
  - Introduction
---

# Overview

In this lab, you will learn all about deploying AI workloads on Azure Kubernetes Service (AKS). We'll start by running a containerized AI workload locally then deploy it to an AKS Automatic cluster. AKS Automatic is a new offering of AKS that simplifies the deployment of Kubernetes clusters. In a matter of minutes, you will have an enterprise ready AKS cluster that is ready to run your AI workloads securely and at scale.

## Prerequisites

Before you begin this lab, you will need the following tools installed on your machine:

- [Azure subscription](https://azure.microsoft.com/free)
- [Git](https://git-scm.com/downloads)
- [Python](https://www.python.org/downloads)
- [Node.js](https://nodejs.org/en/download)
- [Docker Desktop](https://www.docker.com/get-started)
- [Terraform](https://developer.hashicorp.com/terraform/install)
- [Azure CLI](hhttps://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)
- [GitHub CLI](https://cli.github.com)
- [Visual Studio Code](https://code.visualstudio.com)
- POSIX compliant shell (e.g. bash, zsh)

<div class="info" data-title="Note">

> You can also run the lab in a GitHub Codespace or DevContainer. This environment has all the tools you need pre-installed. More on that in the next section.

</div>

<div class="important" data-title="Important">

> In order to deploy an AKS Automatic cluster, you will need to have at least 32 vCPU of Standard DSv2 quota available in the region you want to deploy the cluster. If you don't have this quota available, you can request a quota increase in the Azure portal. Instructions on how to request a quota increase can be found [here](https://learn.microsoft.com/azure/quotas/quickstart-increase-quota-portal).

</div>

---

# Lab environment setup

The application we will be deploying is ... <TODO>

Here is a high-level overview of the application and the Azure resources that it relies on.

![Solution architecture](https://via.placeholder.com/800x400)

## Fork and clone the repo

Start by forking the repo to your GitHub account. You can use the GitHub CLI to fork the repo; otherwise, you can fork the repo in the GitHub UI. 

![Fork the repo](https://via.placeholder.com/800x400)

```bash
gh auth login --scopes repo,workflow,write:packages
gh repo fork pauldotyu/contoso-creative-writer
```

If you want to use the GitHub Codespaces, navigate to the repo in the GitHub UI and click on the Code button. Click on the Codespaces tab, then click "Create codespace on main". If you do use Codespaces, you can skip the next step of cloning the repo to your local machine.

![Fork the repo](https://via.placeholder.com/800x400)

<div class="info" data-title="Note">

> If you want to use a DevContainer, clone the repo to your local machine and open it in Visual Studio Code. You will be prompted to open the repo in a DevContainer.

</div>

Clone repo to your local machine.

```bash
gh repo clone $(gh api user --jq .login)/contoso-creative-writer
cd contoso-creative-writer
gh repo set-default $(gh api user --jq .login)/contoso-creative-writer
```

## Deploy Azure Resources 

As mentioned above, the application relies on a few Azure resources. We will use the existing Terraform configuration that is included in the repo and deploy the resources using the Azure Developer CLI (AZD).

Run the following commands to set up the AZD environment.

```bash
# login to Azure CLI
az login

# login to Azure Developer CLI
azd auth login

# create a new AZD environment
azd env new

# set the Azure location that has all services and vCPU quota available for the workshop
azd env set AZURE_LOCATION "australiaeast"

# provision the Azure resources
azd provision

# set the environment variables
source .env
```

---

# Runs on my machine!

Great! We've quickly provisioned all the Azure resources needed to support this app. We can verify the application works locally before deploying it to the cloud. This is a very common workflow for developers as they pepare to deploy their applications to the cloud. 

## Local development

The repo includes two applications: a web api and a web app.

The web api is a Python based application and we can run the following commands to start the api locally.

```bash
cd src/api
python -m venv .venv
source .venv/bin/activate
pip install --no-cache-dir -r requirements.txt --find-links ./whl
gunicorn -c gunicorn.conf.py api.app:app
```

With the api running, open a new terminal and start the web app.

```bash
source .env
cd src/web
npm install
npm run dev
```

## Test the application

Browse to http://localhost:5173

Click the "Try an Example" button, then click "Get to Work!".

![Fork the repo](https://via.placeholder.com/800x400)

You should see the Agents working on the task.

![Fork the repo](https://via.placeholder.com/800x400)

Once you see the status of "Editor accepted article", you can click the "Document" tab to see the final document.

![Fork the repo](https://via.placeholder.com/800x400)

After you have verified the application works locally, you can stop the applications by pressing `Ctrl+C` in both terminals.

## Containerize the application

Next step is to ensure the applications can run in containers. The repo includes Dockerfiles for both the api and web app. A Dockerfile is a manifest that describes how to build a container image. To run a container you need to build an image from the Dockerfile and then run the image in a container.

When running multi-container applications, it is common to use Docker Compose. Docker Compose enables you to easily define the services that make up your application in a `docker-compose.yml` file. In this file, you can define the services, networks, volumes, and environment variables for your application. Understanding how the docker-compose.yml file is structured is beneficial when deploying multi-container applications to Kubernetes.

Run the following command to build and start the applications in containers.

```bash
docker compose up --build
```

While the containers build and start, let's take a look at the Docker Compose file to understand how the applications are configured to run in containers.

The Docker Compose file begins with a **services** stanza. Here is where you define the services that make up your application. In this case, we have two services: api and web.

```yml
services:
...
```

Within the **services** stanza, you define the configuration for each service. For example, the api service is defined as follows:

```yml
...
  api:
    build:
      context: src/api
      dockerfile: Dockerfile.local
    ports:
      - "5000:5000"
    env_file: 
      - .env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - $HOME/.azure/:/root/.azure
...
```

The **build** stanza specifies the context and Dockerfile to use to build the image. There is a special Dockerfile.local file that is used to build the image specifically for running the container locally (more on that in a bit). The **ports** stanza specifies the port mapping between the host and the container. Remember the api service is running on port 5000. The **env_file** stanza specifies the .env file to load into the container. The **environment** stanza specifies individual environment variables to set in the container. Finally the **volumes** stanza mounts your local Azure CLI directory into the container so that the container can access your Azure CLI credentials. This is due to the fact that the API service is written to authenticate to Azure services using Workload Identity via the Azure Identity SDK and the easiest way to do this is to use the Azure CLI credentials. Therefore, we have a special Dockerfile.local that is used to install Azure CLI when building the image specifically for running the container locally.

The web service is defined similarly:

```yml
  web:
    build:
      context: src/web
    ports:
      - "3000:80"
    depends_on:
      - api
```

The **depends_on** stanza specifies that the web service depends on the api service. This means that the api service will start before the web service starts.

## Test the application

Browse to http://localhost:3000 and test the application as you did before.

Press `Ctrl+C` to stop the containers.

---

# Runs on all machines!

So we know the app works locally, both as standalone applications and within containers. Once we know the app works within containers, we can be _pretty_ sure that it'll work on all machines, and in our case, Kubernetes clusters.

## Deploy AKS Automatic cluster

AKS Automatic greatly simplifies the design and deployment of Kubernetes clusters. Many of the design decisions that you would have to make when deploying a traditional AKS cluster are made and managed for you. This includes the network plugin, the authentication and authorization mode, and the monitoring and logging configuration, node pool configuration, and more.

Let's use the Azure portal to deploy an AKS Automatic cluster. Navigate to the [Azure Portal](https://portal.azure.com) and search for "kubernetes" in the search bar. Click on the "Kubernetes services" link under "Services", click on the "Create" button, and then click on the "Automatic Kubernetes cluster (preview)" button.

![Create AKS Automatic cluster](https://via.placeholder.com/800x400)

In the "Basics" tab, enter the following details:

**Subscription**: Select your Azure subscription
**Resource group**: Select the resource group you created earlier
**Kubernetes cluster name**: aks-njk4mge1yjm4n
**Region**: Select the region your resource group is in

You can leave the rest of the settings as default then click "Next".

In the "Monitoring" tab, note that monitoring and logging are enabled by default. Since we have existing Azure Monitor and Log Analytics resources, and Azure Managed Grafana, it automatically populated the dropdowns for you. Pretty awesome, right? Click "Review + create", wait for the validation to complete, then click "Create".

It'll take a few minutes to deploy the AKS Automatic cluster. Once the deployment is complete, click the "Go to resource" button to navigate to the AKS cluster.

## Publish container images

Before we attempt to run the application containers in a Kubernetes cluster, we'll need to put our container images in a container registry. Common registries include Docker Hub, Azure Container Registry (ACR), or GitHub Container Registry (GHCR).

In order for your AKS cluster to pull images from ACR, you need to grant the AKS cluster access to the ACR instance, so that the kubelet can pull images.

Let's use the Azure CLI to give the AKS cluster access to ACR.

Run the following command to grant the AKS cluster access to ACR.

```bash
# this is temporary
AZURE_KUBERNETES_SERVICE_NAME=$(az aks list -g $AZURE_RESOURCE_GROUP --query "[0].name" -o tsv)
az aks upgrade --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_KUBERNETES_SERVICE_NAME --kubernetes-version 1.30.1 --yes
```

```bash
AZURE_KUBERNETES_SERVICE_NAME=$(az aks list -g $AZURE_RESOURCE_GROUP --query "[0].name" -o tsv)
az aks update --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_KUBERNETES_SERVICE_NAME --attach-acr $AZURE_CONTAINER_REGISTRY_NAME
```

This can take a few minutes to complete.

## Application configuration

We saw that in our docker compose file, we loaded the .env file directly into the api container. We won't have this luxury in AKS. Instead we need to pass the environment variables to the container at runtime and we can do this using a ConfigMap. The good news is that we can create a ConfigMap from the .env file to start.

Log into the AKS cluster.

```bash
az aks get-credentials --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_KUBERNETES_SERVICE_NAME
```

Run a command to verify that you are connected to the AKS cluster.

```bash
kubectl create namespace ccw
```

Since this is the first time you are connecting to the AKS cluster, you will be prompted to log in to the AKS cluster using Microsoft Entra ID.

After you've authenticated, run the following command to create a ConfigMap from the local .env file.

```bash
kubectl create configmap ccw-config -n ccw --from-env-file .env
```

Confirm the ConfigMap was created and view the contents.

```bash
kubectl get configmap ccw-config -n ccw -o yaml
```

<div class="warning" data-title="Warning">

> There are configs here that should really be secrets. We'll address that later. Let's just get the app running for now.

</div>

## Automated deployments

The easiest way to deploy apps to AKS is to use the Azure portal. AKS has a feature called Automated deployments that allows you to deploy applications to your AKS cluster directly from GitHub. This feature uses GitHub Actions to build container images, push them into ACR, then deploy it to your AKS cluster. When you setup an Automated Deployment, it will create a Service Principal in your Microsoft Entra tenant, assign it Azure RBAC permissions, and configure a federated credential for your GitHub repository. This allows the GitHub Actions to authenticate to your Azure subscription and deploy the application to your AKS cluster. Having a pipeline set up makes it very easy to deploy new versions of your application. Any changes to the code will trigger a new deployment. 

You will need to configure an automated deployment for the api app and the web app separately.

### Deploy the api app

Navigate to your AKS cluster in the Azure portal

Click on Automated deployments under Settings, click the "Create an automated deployment" button in the middle of the screen, then click "Deploy an application" option

![Automated deployments](https://via.placeholder.com/800x400)

<div class="info" data-title="Note">

> Automated deployments is currently in preview and only supports GitHub repositories.

</div>

Enter the following details:

In the Repository tab:
**Workflow name:** ccw-api
**Repository location:** GitHub
**Repository source:** My repositories
**Repository:** <YOUR_FORKED_REPO>
**Branch:** learnlive/creativeagents-on-aks-ep1

![Automated deployments](https://via.placeholder.com/800x400)

In the Image tab:
**Dockerfile:** Click select and choose the Dockerfile in the src/api directory, then click Select
**Dockerfile build context:** ./src/api
**Azure Container Registry:** Select your ACR from the dropdown
**Azure Container Registry image:** Click the Create new link and enter **api** as the image name

![Automated deployments](https://via.placeholder.com/800x400)

In the Deployment details tab:
**Deployment options:** Click on Kubernetes manifests files
**Manifest files:** Click the Select link, navigate to the infra/manifests/api directory, check the deployment.yaml file, then click Select
**Namespace:** Select ccw

<div class="info" data-title="Note">

> AKS Automated Deployments can create Kubernetes manifests for you. However, in this lab, we are using the existing manifests in the repo.

</div>

![Automated deployments](https://via.placeholder.com/800x400)

In the Review tab:
Review the deployment details then click "Next: Deploy"

This will create a new pull request in your forked repo.

When ready, click the "Approve pull request" button

In the GitHub Pull request review page, click on the "Files changed" tab and view the workflow file that will be added to your repo. You can see that the workflow file has two jobs: one to build the container image and push it to ACR, and another to deploy the image to the AKS cluster.

Click on the "Conversation" tab and click the "Merge pull request" button.

![Automated deployments](https://via.placeholder.com/800x400)

Click the "Confirm merge" button.

![Automated deployments](https://via.placeholder.com/800x400)

Click on the "Delete branch" button.

![Automated deployments](https://via.placeholder.com/800x400)

Repeat the same steps for the web app.

### Deploy the web app

Navigate back to the Azure portal and click Close to close the Automated deployment for the api app.

Click the Create button at the top of the Automated deployments blade, then click Deploy an application option

Enter the following details:

In the Repository tab:
**Workflow name:** ccw-web
**Repository location:** GitHub
**Repository source:** My repositories
**Repository:** <YOUR_FORKED_REPO>
**Branch:** learnlive/creativeagents-on-aks-ep1

![Automated deployments](https://via.placeholder.com/800x400)

In the Image tab:
**Dockerfile:** Click select and choose the Dockerfile in the src/web directory, then click Select
**Dockerfile build context:** ./src/web
**Azure Container Registry:** Select your ACR from the dropdown
**Azure Container Registry image:** Click the Create new link and enter web as the image name

![Automated deployments](https://via.placeholder.com/800x400)

In the Deployment details tab:
**Deployment options:** Click on Kubernetes manifests files
**Manifest files:** Click the Select link, navigate to the infra/manifests/web directory, check the deployment.yaml file, then click Select
**Namespace:** Select ccw

![Automated deployments](https://via.placeholder.com/800x400)

In the Review tab:
Review the deployment details, then click "Next: Deploy"

This will create another new pull request in your forked repo. Review and merge the pull request as you did for the api app.

### Confirm deployment

In the GitHub page, click on the "Actions" tab to view the deployment progress for workflows. Click on the workflow run to view the details of the deployment.

## Configure ingress

As mentioned earlier, AKS Automatic makes several design decisions for you. One of those decisions is to use the AKS App Routing Add-on for ingress. This add-on provides a fully managed NGINX ingress controller that is automatically deployed to your AKS cluster. All you need to do is configure the ingress resource to route traffic to your applications. 

We can also do this from the Azure portal. Navigate to the AKS cluster, click on the Workloads tab, then select the web deployment. Click on the Expose button, then click on the Create ingress route button. Enter the following details:

---

# Debugging

## Troubleshoot

Container won't start without the ConfigMap. The app is also looking for workload identity.

## ServiceAccount, Secrets, and Workload Identity, oh my!

The api deployment manifest specifies a service account and has a label to signal it should use workload identity. 

### Service connector

---

# Summary

## Learn More
