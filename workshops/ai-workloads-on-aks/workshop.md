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
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
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

![Need a description here](https://via.placeholder.com/800x400)

```bash
gh auth login --scopes repo,workflow,write:packages
gh repo fork pauldotyu/contoso-creative-writer
```

If you want to use the GitHub Codespaces, navigate to the repo in the GitHub UI and click on the Code button. Click on the Codespaces tab, then click "Create codespace on main". If you do use Codespaces, you can skip the next step of cloning the repo to your local machine.

![Need a description here](https://via.placeholder.com/800x400)

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

# set environment variables
azd env get-values | awk '{gsub(/"/, "")}1' > .env
source .env
```

---

# Runs on my machine!

Great! We've quickly provisioned all the Azure resources needed to support this app. We can verify the application works locally before deploying it to the cloud. This is a very common workflow for developers as they prepare to deploy their applications to the cloud. 

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
cd src/web
npm install
npm run dev
```

## Test the application

Browse to http://localhost:5173

Click the "Try an Example" button, then click "Get to Work!".

![Need a description here](https://via.placeholder.com/800x400)

You should see the Agents working on the task and if you click back into your terminal, you should see logs from the api service that shows the task being processed.

![Need a description here](https://via.placeholder.com/800x400)

Once you see the status of "Editor accepted article", you can click the "Document" tab to see the final document.

![Need a description here](https://via.placeholder.com/800x400)

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

Within the **services** stanza are the configurations for each service. For example, the api service is defined as follows:

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

The **build** stanza specifies the context and Dockerfile to use to build the image. There is a special Dockerfile.local file that is used to build the image specifically for running the container locally (more on that in a bit). The **ports** stanza specifies the port mapping between the host and the container. Remember the api service is running on port 5000. The **env_file** stanza loads the local **.env** file to load into the container. The **environment** stanza specifies individual environment variables to set in the container. Finally we get to the **volumes** stanza. Here we mount the local Azure CLI directory into the container so that the container can access your Azure CLI credentials for authentication. 

<div class="info" data-title="Note">

> This is due to the fact that the API service is written to authenticate to Azure services the Azure Identity SDK. More specifically it uses the DefaultAzureCredential class which tries several different methods to authenticate, ranging from environment variables, workload identity, and Azure CLI credentials. In this case, we are running the container locally so the easiest way to do this is to use the Azure CLI credentials. However, the Azure CLI is not installed in the container by default, so we are using a special Dockerfile.local to install the Azure CLI in the container. we only use this Dockerfile when running the container locally.

</div>

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

Let's use the Azure portal to deploy an AKS Automatic cluster. 

Navigate to the [Azure Portal](https://portal.azure.com) and search for "kubernetes" in the search bar. 

Click on the "Kubernetes services" link under "Services", click on the "Create" button, and then click on the "Automatic Kubernetes cluster (preview)" button.

![Create AKS Automatic cluster](https://via.placeholder.com/800x400)

In the "Basics" tab, enter the following details:

- **Subscription**: Select your Azure subscription
- **Resource group**: Select the resource group you created earlier
- **Kubernetes cluster name**: aks-learnlive
- **Region**: Select the region your resource group is in
- You can leave the rest of the settings as default then click "Next".

In the "Monitoring" tab, note that monitoring and logging are enabled by default. Since we have existing Azure Monitor, Azure Log Analytics, and Azure Managed Grafana resources, it automatically populated the dropdowns for you. Pretty awesome, right? 

Click "Review + create", wait for the validation to complete, then click "Create". It'll take a few minutes to deploy the AKS Automatic cluster. 

Once the deployment is complete, click the "Go to resource" button to navigate to the AKS cluster.

## Publish container images

Before we attempt to run the application containers in a Kubernetes cluster, we'll need to put our container images in a container registry. Common registries include Docker Hub, Azure Container Registry (ACR), or GitHub Container Registry (GHCR).

In order for your AKS cluster to pull images from ACR, you need to grant the AKS cluster access to the ACR instance, so that the kubelet can pull images.

Let's use the Azure CLI to give the AKS cluster access to ACR.

Run the following command to grant the AKS cluster access to ACR.

```bash
AZURE_KUBERNETES_SERVICE_NAME=$(az aks list -g $AZURE_RESOURCE_GROUP --query "[0].name" -o tsv)
az aks update --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_KUBERNETES_SERVICE_NAME --attach-acr $AZURE_CONTAINER_REGISTRY_NAME
```

This can take a few minutes to complete.

## Application configuration

We saw in the docker compose file, the **.env** file directly into the api container. We won't have this luxury in AKS. Instead we need to pass the environment variables to the container at runtime and we can do this using a ConfigMap. The good news is that we can quickly create a ConfigMap from the **.env** file to start.

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

<div class="info" data-title="Note">

> The following commands are temporary and will be removed

</div>

```bash
# push the api image to ttl.sh
IMG=$(uuidgen | tr '[:upper:]' '[:lower:]'):4h
docker tag contoso-creative-writer-api:latest ttl.sh/$IMG
docker push ttl.sh/$IMG

cd infra/manifests/api
kustomize create --autodetect
kustomize edit set image api=$IMG
kustomize build . | kubectl apply -n ccw -f -


# push the web image to ttl.sh
IMG=$(uuidgen | tr '[:upper:]' '[:lower:]'):4h
docker tag contoso-creative-writer-web:latest ttl.sh/$IMG
docker push ttl.sh/$IMG

cd ../web
kustomize create --autodetect
kustomize edit set image web=$IMG
kustomize build . | kubectl apply -n ccw -f -
```

The easiest way to deploy apps to AKS is to use the Azure portal. 

AKS has a feature called Automated deployments that allows you to deploy applications to your AKS cluster directly from GitHub. This feature uses GitHub Actions to build container images, push them into ACR, then deploy it to your AKS cluster.

When you setup an Automated Deployment, it will create a Service Principal in your Microsoft Entra tenant, assign it Azure RBAC permissions, and configure a federated credential for your GitHub repository. This allows the GitHub Actions to authenticate to your Azure subscription and deploy the application to your AKS cluster.

Having a pipeline set up makes it very easy to deploy new versions of your application. Any changes to the code will trigger a new deployment. 

You will need to configure an automated deployment for the api app and the web app separately.

### Deploy the api app

Navigate to your AKS cluster in the Azure portal.

Click on Automated deployments under Settings, click the "Create an automated deployment" button in the middle of the screen, then click "Deploy an application" option

![Automated deployments](https://via.placeholder.com/800x400)

<div class="info" data-title="Note">

> Automated deployments is currently in preview and only supports GitHub repositories.

</div>

Enter the following details:

In the Repository tab:

- **Workflow name:** ccw-api
- **Repository location:** GitHub
- **Repository source:** My repositories
- **Repository:** <YOUR_FORKED_REPO>
- **Branch:** learnlive/ep1

![Automated deployments](https://via.placeholder.com/800x400)

In the Image tab:

- **Dockerfile:** Click select and choose the Dockerfile in the src/api directory, then click Select
- **Dockerfile build context:** ./src/api
- **Azure Container Registry:** Select your ACR from the dropdown
- **Azure Container Registry image:** Click the Create new link and enter **api** as the image name

![Automated deployments](https://via.placeholder.com/800x400)

In the Deployment details tab:

- **Deployment options:** Click on Kubernetes manifests files
- **Manifest files:** Click the Select link, navigate to the infra/manifests/api directory, check the deployment.yaml file, then click Select
- **Namespace:** Select ccw

<div class="info" data-title="Note">

> AKS Automated Deployments can create Kubernetes manifests for you. However, in this lab, we are using the existing manifests in the repo.

</div>

![Automated deployments](https://via.placeholder.com/800x400)

In the Review tab:

- Review the deployment details then click "Next: Deploy"

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

- **Workflow name:** ccw-web
- **Repository location:** GitHub
- **Repository source:** My repositories
- **Repository:** <YOUR_FORKED_REPO>
- **Branch:** learnlive/ep1

![Automated deployments](https://via.placeholder.com/800x400)

In the Image tab:

- **Dockerfile:** Click select and choose the Dockerfile in the src/web directory, then click Select
- **Dockerfile build context:** ./src/web
- **Azure Container Registry:** Select your ACR from the dropdown
- **Azure Container Registry image:** Click the Create new link and enter web as the image name

![Automated deployments](https://via.placeholder.com/800x400)

In the Deployment details tab:

- **Deployment options:** Click on Kubernetes manifests files
- **Manifest files:** Click the Select link, navigate to the infra/manifests/web directory, check the deployment.yaml file, then click Select
- **Namespace:** Select ccw

![Automated deployments](https://via.placeholder.com/800x400)

In the Review tab:

- Review the deployment details, then click "Next: Deploy"

This will create another new pull request in your forked repo. Review and merge the pull request as you did for the api app.

### Confirm deployment

In the GitHub page, click on the "Actions" tab to view the deployment progress for workflows. Click on the workflow run to view the details of the deployment.

## Configure ingress

As mentioned earlier, AKS Automatic makes several design decisions for you. One of those decisions is to use the AKS App Routing Add-on for ingress. This add-on provides a fully managed NGINX ingress controller that is automatically deployed to your AKS cluster. All you need to do is configure the ingress resource to route traffic to your applications.

We can also do this from the Azure portal. 

Navigate to the AKS cluster, click on the **Services and ingresses** tab

Right-click on the **web** service, then click the **Add ingress** button.

![Configure ingress](https://via.placeholder.com/800x400)

In the **Basic** tab, enter the following details:

- **Ingress name:** web
- **Namespace:** ccw
- **Service:** web
- **Key vault and primary certificate:** Click the **Select a certificate** link then select the key vault and self-signed certificate that has been created for you
- **DNS provider:** Select Azure DNS
- **Azure DNS Zone:** Select the Azure DNS zone that has been created for you
- **Subdomain name:** ccw

Click **Review + create**, then click **Create**.

![Configure ingress](https://via.placeholder.com/800x400)

This will take a few minutes to create the ingress resource.

When it is complete, click the **Close** button and configure the ingress for the api service.

Right-click on the **api** service, then click the **Add ingress** button.

In the **Basic** tab, enter the following details:

- **Ingress name:** api
- **Namespace:** ccw
- **Service:** api
- **Key vault and primary certificate:** Click the **Select a certificate** link then select the key vault and self-signed certificate that has been created for you
- **DNS provider:** Select Azure DNS
- **Azure DNS Zone:** Select the Azure DNS zone that has been created for you
- **Subdomain name:** ccw

Click **Review + create**, then click **Create**.

![Configure ingress](https://via.placeholder.com/800x400)

This will take a few minutes to create the ingress resource.

When it is complete, click the **Close** button.

Did you notice something about this api ingress configuration? It's pointing to the same subdomain as the web ingress. This is because the api service is expected to be on a different path `/api`. We need to update the api service to listen on the `/api` path.

Click on the **Ingresses** tab, then click on the **api** ingress.

Click on the **YAML** tab.

Click on the **Copilot** to bring up the Azure Copilot prompt, enter the following text and press enter:

```text
update this ingress to listen on the /api path and add annotation to rewrite the url to remove /api to backend pods
```

![Fix ingress](https://via.placeholder.com/800x400)

Wait for the Copilot suggest edits to the YAML file. You will see a diff of the changes that Copilot is suggesting. If you are happy with the changes, click the **Apply** button.

![Fix ingress](https://via.placeholder.com/800x400)

You should see the path updated to `- path: /api(/|$)(.*)` and an annotation `nginx.ingress.kubernetes.io/rewrite-target: $2` added to rewrite the url to remove the `/api` path.

Click the **Review + save** button, then confirm the changes by checking the **Confirm manifest changes** checkbox and click the **Save** button.

![Fix ingress](https://via.placeholder.com/800x400)

## Test the application

You should now be able to navigate to the web app. 

If you don't know the url of the web app, you can run the following command in your terminal to get the url of the web app.

```bash
echo "https://ccw.${AZURE_DNS_ZONE}"
```

Test the app again and see if it works.

---

# Debugging applications

You may have noticed, the app is not working as expected. It seems to be stuck on "Starting research agent task..." and the api service is not processing the task.

## Troubleshoot

We can use AKS Container Insights to see what might be going wrong.

Navigate back to teh AKS portal, click on **Workloads**, then click the **api** deployment.

In the right-naviagtion pane, click on **Live logs**, then select a pod to view the logs.

![Fix api](https://via.placeholder.com/800x400)

<div class="info" data-title="Note">

> It can take a few minutes for the logs to appear. If logs do not appear, try clicking the **Looking for historical logs? View in Log Analytics** link.

</div>

Scroll through the logs and you will see that the api service is looking for details to authenticate to Azure OpenAI. We know from running this app locally that the api service uses the Azure Identity SDK to authenticate to Azure services. We need to configure the api service to use AKS Workload Identity.

# Azure Service Integrations

We need to configure the api service to use AKS Workload Identity. But configuring Workload Identity can be a bit tricky. We need to create an Azure Identity, give it permissions to access the Azure OpenAI service, create a Federated Credential for the AKS cluster, create a Kubernetes Service Account, and finally configure the api service to use the Kubernetes Service Account. That's a lot of steps!

## Workload Identity with Service Connector

AKS Service Connector is a new feature that simplifies the configuration of Workload Identity. At the time of this writing it is currently available as a preview feature, but is quickly becoming the preferred way to configure Workload Identity.

It automatically creates the Azure Identity, gives it the necessary permissions, and creates the Federated Credential for the AKS cluster. All you need to do is create a Kubernetes Service Account and configure the api service to use the Kubernetes Service Account.

Let's use the Azure portal to create a Service Connector.

In the AKS portal, click on **Service Connector (Preview)** under **Settings**.

![Service Connector](https://via.placeholder.com/800x400)

Click the **Connect to your Servicess** button in the middle of the page.

In the **Create connection** pane, enter the following details:

In the **Basics** tab:

- **Kubernetes namesapce:** ccw
- **Service type:** Select **OpenAI Service**
- **Connection name:** Leave as default
- **Subscription:** Select your Azure subscription where the target service is located
- **OpenAI:** Select the OpenAI service
- **Client type:** Leave as default (None)
- Click **Next: Authentication**

![Service Connector](https://via.placeholder.com/800x400)

In the **Authentication** tab:

- **Select authentication type:** Select **Workload Identity**
- **Subscription:** Select your Azure subscription where the target managed identity is located
- **User assigned managed identity:** Select the managed identity that was created for you (it'll start with `identity-*`)
- Click **Next: Networking**

![Service Connector](https://via.placeholder.com/800x400)

In the **Networking** tab:

- Leave as default
- Click **Next: Review + Create**

![Service Connector](https://via.placeholder.com/800x400)


In the **Review + Create** tab:

- Wait for the final validation
- Review the details
- Click **Create**

![Service Connector](https://via.placeholder.com/800x400)

This will take a few minutes to create the Service Connector.

Deploying the Service Connector took care of the underlying infrastructure bits for you. All you have do now is update your api deployment manifest to enable workload identity and use the newly created Kubernetes Service Account.

Not sure of where to add the configuration? No problem! The Service Connector can help you with that too.

When it is complete, check the checkbox next to the Service Connector, then click the **Yaml snippet** button to view a generic snippet. This gives you an idea of what you need to add to your deployment manifest. But we can actually do better than that. We can have the Service Connector make the changes for us.

Select **Kubernetes Workload** as the **Resource Type**.

![Service Connector](https://via.placeholder.com/800x400)

You will see a new dropdown appear. Select the **api** deployment from the **Kubernetes Workload** dropdown.

As you can see, the Service Connector is suggesting changes to the deployment manifest and highlighting the changes so you don't miss them.

![Service Connector](https://via.placeholder.com/800x400)

Click the **Apply** button to apply the changes.

This will restart the api deployment with the new configuration.

Click on the **Workloads** tab, then click on the **Pods** tab to view the pods.

Filter by namespace **ccw** and you should see the api pod restarting.

![Service Connector](https://via.placeholder.com/800x400)

After a few minutes, the pod should be running.

Now we can retest the application.

## Re-test the application

Navigate back to the web app and test the app again. You should see the app working as expected.

---

# Summary

Congratulations! You have successfully containerized and deployed an AI workload to an AKS Automatic cluster. You have learned how to deploy an AKS Automatic cluster, publish container images to ACR, create ConfigMaps, configure Automated Deployments, configure ingress, and troubleshoot an application using AKS Container Insights. You now have a solution that not only works on your machine, but works on all machines!

With AKS Automatic, we can see how many enterprise ready features are built-in and enabled by default. This allows you to focus on building and deploying your applications without having to worry about the underlying infrastructure.

## Next steps

Be sure to clean up your resources to avoid incurring any charges. You can do this by deleting the resource group in the Azure portal or running `azd down --force --purge` in your terminal.

## Learn More

- [Azure Kubernetes Service (AKS) Automatic](https://aka.ms/aks/automatic)
