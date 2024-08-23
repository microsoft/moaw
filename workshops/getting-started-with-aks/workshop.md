---
published: false # Optional. Set to true to publish the workshop (default: false)
type: workshop # Required.
title: Getting Started with Azure Kubernetes Service (AKS) # Required. Full title of the workshop
short_title: Getting Started with AKS # Optional. Short title displayed in the header
description: This is a workshop for getting started AKS  # Required.
level: beginner # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors: # Required. You can add as many authors as needed
  - "Paul Yu"
  - "Brian Redmond"
  - "Phil Gibson"
  - "Russell de Pina"
  - "Ken Kilty"
contacts: # Required. Must match the number of authors
  - "@pauldotyu"
  - "@chzbrgr71"
  - "@phillipgibson"
  - "@russd2357"
  - "@kenkilty"
duration_minutes: 180 # Required. Estimated duration in minutes
tags: kubernetes, azure, aks # Required. Tags for filtering and searching
---

# Getting started

## Objectives

The objectives of this workshop are to:

- Introduce you to the basics of Kubernetes and `kubectl`
- Deploy an application to Azure Kubernetes Service
- Securing application secrets using Azure Key Vault
- Persisting application data using Azure Disk Storage
- Exposing applications using the Istio Ingress Gateway
- Monitoring applications using Azure Monitor and the Prometheus/Grafana stack
- Scaling applications using KEDA

## Prerequisites

## Workshop instructions

When you see these blocks of text, you should follow the instructions below.

<div class="task" data-title="Task">

> This means you need to perform a task.

</div>

<div class="info" data-title="Info">

> This means there's some additional context.

</div>

<div class="tip" data-title="Tip">

> This means you should pay attention to some helpful tips.

</div>

<div class="warning" data-title="Warning">

> This means you should pay attention to some information.

</div>

<div class="important" data-title="Important">

> This means you should **_really_** pay attention to some information.

</div>

## Setting up your environment

> For basic container learning, go here: https://learn.microsoft.com/azure/aks/tutorial-kubernetes-prepare-app?tabs=azure-cli 

---

# Deploy your AKS Cluster

There are many ways to deploy an AKS cluster. You can use the Azure Portal, Azure CLI, ARM templates, Azure Bicep, Terraform, Pulumi. The list goes on. While there are no shortages of ways to deploy an AKS cluster, we will focus on the Azure Portal and Azure CLI in this workshop.

## Familiarize with AKS Presets in portal

Open a browser and navigate to the [Azure Portal](https://portal.azure.com). Login with your Azure credentials.

In the search bar at the top of the portal, start typing **kubernetes** and you will start to see a list of services, marketplace items, and resources that match your search. Under **Services** click on **Kubernetes services**.

![](https://placehold.co/800x400)

In the **Kubernetes services** blade, click on the **Create** drop down then click on **Kubernetes cluster**.

![](https://placehold.co/800x400)

You should now see the **Create Kubernetes cluster** blade. This is where you can create a new AKS cluster. Across the top of the blade, you'll notice a series of tabs. Click on the **Basics** tab. Under **Cluster details**, you'll see the **Cluster preset configuration**. This is where you can choose from a series of presets that will automatically configure your AKS cluster based on your workload requirements.

![](https://placehold.co/800x400)

Click the **Compare presets** link to see the differences between the presets.

![](https://placehold.co/800x400)

You should see a table that lists all the presets and the differences between them. By default, the **Production Standard** preset is selected.

Click **Cancel** to back out of the cluster preset comparison window.

![](https://placehold.co/800x400)

You will also notice that the cluster preset can be selected from the drop down menu. Toggle between **Dev/Test** and **Production Enterprise** to see the differences between the presets.

![](https://placehold.co/800x400)

Going back to the tabs at the top of the blade, click through the **Node pools**, **Networking**, **Integrations**, **Monitoring**, and **Advanced** tabs to see additional configuration options available to you.

![](https://placehold.co/800x400)

That's a lot of options! But what if you just want to create an AKS cluster without all the fuss? That's where **Automatic AKS Cluster** comes in.

Click the **X** icon in the upper right corner to back out of the create cluster window.

![](https://placehold.co/800x400)

## Deploy AKS Automatic Cluster

Click on the **Create** drop down again but this time, click **Automatic Kubernetes cluster (preview)**.

![](https://placehold.co/800x400)

You can see that the configuration options are much simpler. There's only a **Basics** and **Monitoring** tab.

![](https://placehold.co/800x400)

Let's go ahead and create an AKS automatic cluster.

In the **Basics** tab, fill out the following fields:

**Subscription:** Select your Azure subscription. 

<div class="info" data-title="Note">

> You may see a message that the subscription does not have the flags: EnableAPIServerVnetIntegrationPreview, NRGLockdownPreview, NodeAutoProvisioningPreview, DisableSSHPreview, SafeguardsPreview, AutomaticSKUPreview registered. Preview features must be registered in order to create a cluster so go ahead and click the "Register preview features" link to register the the required flags in your subscription.

</div>

**Resource group:** Create a new resource group or use an existing one.

**Kubernetes cluster name:** Enter a name for your cluster.

**Region:** Select the desired region where you want to deploy your cluster.

<div class="info" data-title="Note">

> You need to ensure you have 32 vCPU quota for Standard_DSv2 available in the region you are deploying the cluster to. If you don't have enough quota, you can request a quota increase.

</div>

**Automatic upgrade scheduler:** Leave the default setting.

**Access control:**: AKS Automatic uses Microsoft Entra ID authentication with Azure RBAC for cluster access. You can add additional users or groups to the cluster after it's created but that is outside the scope of this workshop.

![](https://placehold.co/800x400)

Click **Next**

In the **Monitoring** tab, you have the option to either link existing monitoring resources or create new ones. We'll go ahead and create new monitoring resources.

**Enable Container Logs:** Check the box to enable container logs.

**Log Analytics Workspace:** Create the "Create new" link and create a new Log Analytics workspace.

**Cost Preset:** Leave the default setting.

**Enable Prometheus metrics:** Check the box to enable Prometheus metrics.

**Azure Monitor workspace:** Create the "Create new" link and create a new Azure Monitor workspace.

**Enable Grafana:** Check the box to enable Grafana.

**Grafana workspace:** Create the "Create new" link and create a new Grafana workspace.

**Enable recommended alerts:** Check the box to enable recommended alerts.

![](https://placehold.co/800x400)

Click the **Review + create** button.

After validation passes, click the **Create** button.

<div class="info" data-title="Note">

> The cluster creation process will take about 10-15 minutes to complete.

</div>

## Connect to AKS 

Typically, you would use the kubectl command line tool to interact with a Kubernetes cluster. The kubectl tool is your direct line of communication with the kube-apiserver. Access to the kube-apiserver is controlled by the kubeconfig file. The kubeconfig file contains the necessary information to authenticate and the Azure CLI for AKS has a handy command to get the kubeconfig file for your AKS cluster.

Open the Azure Cloud Shell and run the following command to set up local variables.

<div class="info" data-title="Note">

> If this is your first time opening Azure Cloud Shell, be sure to click the **Bash** button when asked presented with the environment selector as all command line instructions in this workshop are intended to be run in a POSIX shell. You may also be asked to create a storage account for your Cloud Shell. Go ahead and select **No storage account required**, then select your subscription and click **Apply**. 

![](https://placehold.co/800x400)

> If you do not use a storage account for your Cloud Shell, you will have to pull down the kubeconfig file when the shell is closed and re-opened or when the session times out.

</div>

```bash
RG_NAME=<resource-group-name>
AKS_NAME=$(az aks list -g $RG_NAME --query "[0].name" -o tsv)
```

<div class="info" data-title="Note">

> Be sure to replace `<resource-group-name>` and `<aks-name>` with your resource group and AKS cluster name.

</div>

Run the following command to connect to your AKS cluster.

```bash
az aks get-credentials --resource-group $RG_NAME --name $AKS_NAME
```

Now you should be able to run kubectl commands against your AKS cluster.

```bash
kubectl cluster-info
```

AKS Automatic clusters are secured by default. It uses Microsoft Enter ID authentication with Azure RBAC for cluster access, so simply downloading the kubeconfig file is not enough to access the cluster. You also need to authenticate with Microsoft Enter ID and have the necessary permissions to access the cluster. When you created the AKS Automatic cluster, you were automatically granted the **Azure Kubernetes Service RBAC Cluster Admin** role assignment to access the cluster. Therefore when running a kubectl command for the first time, you will be presented with a login prompt. Follow the instructions on the screen and proceed with the authorization process and the kubectl command will be executed. As your authentication token expires, you will be prompted to re-authenticate.

The cluster is almost ready to go... but not quite yet. Next up, we need to prepare the cluster for our application containers.

## Azure Container Registry 

Kubernetes is a container orchestrator. It will run whatever container image you tell it to run. Containers can be pulled from public container registries like Docker Hub or GitHub Container Registry (GHCR), or they can be pulled from private container registries like Azure Container Registry (ACR). Pulling images from a public registry is fine for development and testing but for production workloads, you'll want to use a private registry and only deploy images that have been scanned and approved.

Azure Container Registry is a managed, private Docker registry service based on the open-source Docker Registry 2.0. It is highly available and scalable across Azure regions across the globe. It also integrates with Microsoft Entra ID for authentication and authorization so it makes it easy to secure your container images.

### Deploy Azure Container Registry (ACR)

In the Azure Cloud Shell, run the following command to create a variable for your new Azure Container Registry name.

```bash
ACR_NAME=<acr-name>
```

<div class="info" data-title="Note">

> Be sure to replace `<acr-name>` with a new unique name for your Azure Container Registry.

</div>

Run the following command to create a new Azure Container Registry.

```bash
az acr create --resource-group $RG_NAME --name $ACR_NAME --sku Basic
```

### Attach ACR to AKS cluster

With the Azure Container Registry created, you need to "attach" it to your AKS cluster. This will allow your AKS cluster to pull images from the Azure Container Registry by granting the AKS resource's managed identity the **AcrPull** role on the Azure Container Registry.

```bash
az aks upgrade -n $AKS_NAME -g $RG_NAME --kubernetes-version 1.30.1
az aks update --name $AKS_NAME --resource-group $RG_NAME --attach-acr $ACR_NAME
```

## Import container images

We will be using a sample application called [aks-store-demo](https://github.com/Azure-Samples/aks-store-demo). This application is a simple e-commerce store that consists of three services: store-front, order-service, and product-service. The store-front service is a web application that allows users to browse products, add products to a cart, and checkout. The order-service is a RESTful API that handles order processing and saves order to a RabbitMQ message queue. The product-service is a RESTful API that provides product information to the store-front service.

Here is a high-level application architecture diagram:

![](https://placehold.co/800x400)

The application containers are hosted on GitHub Container Registry (GHCR). Rather than building the containers from source, we will import the containers from GHCR to ACR.

In the Azure Cloud Shell, run the following commands to import the application container images to ACR.

```bash
# store-front
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/store-front:1.2.0 -t aks-store-demo/store-front:1.2.0 --no-wait
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/store-front:1.5.0 -t aks-store-demo/store-front:1.5.0 --no-wait

# order-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/order-service:1.2.0 -t aks-store-demo/order-service:1.2.0 --no-wait
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/order-service:1.5.0 -t aks-store-demo/order-service:1.5.0 --no-wait

# product-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/product-service:1.2.0 -t aks-store-demo/product-service:1.2.0 --no-wait
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/product-service:1.5.0 -t aks-store-demo/product-service:1.5.0 --no-wait
```

<div class="info" data-title="Note">

> If you are wondering why we are importing two versions of each image, it's because we will be rolling out application updates later in the workshop.

</div>

Run the following command to ensure the import operations have completed.

```bash
for repo in $(az acr repository list -n $ACR_NAME -o tsv); do
    echo "${repo} tags:"
   az acr repository show-tags -n $ACR_NAME --repository $repo
done
```

If you see two tags for each repository, the import operations have completed.

---

# Deploy Store App to AKS

Let's use kubectl to deploy the aks-store-demo application to AKS. There is a [YAML manifest](https://github.com/Azure-Samples/aks-store-demo/blob/main/aks-store-quickstart.yaml) in the repo that contains the deployment and service resources for the store-front, order-service, and product-service, and RabbitMQ.

We can't use the YAML file as is because it references the images on GHCR. We need to replace the image references with the images we imported to ACR.

In the Azure Cloud Shell, run the following command to download the YAML file.

```bash
curl -o aks-store-quickstart.yaml https://raw.githubusercontent.com/Azure-Samples/aks-store-demo/main/aks-store-quickstart.yaml
```

Next, run the following command to replace the image references in the YAML file with the images you imported to ACR.

```bash
sed -i -e "s|ghcr.io/azure-samples/\(.*\):latest|${ACR_NAME}.azurecr.io/\1:1.2.0|g" aks-store-quickstart.yaml
```

<div class="info" data-title="Note">

> The **sed** command will replace all instances of `ghcr.io/azure-samples` with `${ACR_NAME}.azurecr.io` and the tag `latest` with `1.2.0`.

</div>

Verify the image references have been updated.

```bash
cat aks-store-quickstart.yaml
```

Apply the manifest

```bash
kubectl apply -f aks-store-quickstart.yaml
```

<div class="info" data-title="Note">

> The deployment can take up to 7 minutes to schedule pods onto a new node.

</div>

Run the following command to check the status of the pods.

```bash
kubectl get po -w
```

## Deployment Safeguards

When you deployed the manifest, did you notice the warnings in the terminal when you applied the manifest? These warning messages are emitted by AKS Deployment Safeguards. Deployment Safeguards is a feature of AKS that helps you avoid common deployment pitfalls. It checks your deployment manifest for common issues and provides warnings if it detects any. The checks are based on best practices and are designed to help you avoid common deployment issues an implemented using Azure Policy.

TODO: View Azure Policy....

## Getting familiar with the demo app

Now, let's explore the store app. Run the following command to get the public IP address of the **store-front** service.

```bash
echo "http://$(kubectl get svc/store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the link in the terminal and you should be taken to the product page of the AKS pet store. Here a user can browse products, add items to a shopping cart, and checkout. The checkout process is intentional simple and does not require any payment information. The order is saved to a RabbitMQ message queue.

Add an item to the cart and checkout. You should see a confirmation message that the order was successfully placed.

![](https://placehold.co/800x400)

## Deployments and Services

Now that we've seen the store app in action, let's take a closer look at the resources that were created when we deployed the manifest.

Run the following command to view the contents of the YAML file.

```bash
cat aks-store-quickstart.yaml
```

It's a fairly big file, so let's break it down.

The YAML file contains a deployment and service resource for each of the three services: store-front, order-service, and product-service. It also contains a deployment and service resource for RabbitMQ.

If we look at the YAML file, we can see that it contains a deployment and service resource for each of the three services: store-front, order-service, and product-service. It also contains a statefulset, service, and configmap resource for RabbitMQ. Each deployment resource specifies the container image to use, the ports to expose, environment variables, and resource requests and limits. The service resources expose the deployments to the cluster and the outside world. A statefulset is a resource that manages a set of identical pods with persistent storage and commonly used for stateful applications like databases.

The manifest is the desired state of the resources in the cluster. When you apply the manifest, the Kubernetes API server will create the resources in the cluster to match the desired state.

We can use the `kubectl get` command to view the resources that were created when we applied the manifest.

Let's start with the deployments.

```bash
kubectl get deployments
```

You can see there are three deployments: order-service, product-service, and store-front. Each deployment has one replica. A deployment is a resource that manages a set of identical pods. The pods are created from the container image specified in the deployment resource.

If you want to see individual pods, you can run the following command.

```bash
kubectl get pods
```

This is where your application code runs. A pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster. If you need to troubleshoot an application, you can view the logs of the pod.

```bash
kubectl logs <pod-name>
```

The next resource we'll look at is services. A service is a resource that exposes an application running in a set of pods as a network service. It provides a stable endpoint for the application that can be accessed by other applications in the cluster or outside the cluster.

```bash
kubectl get svc store-front
```

As you can see, the store-front service is of type LoadBalancer. This means that the service is exposed to the internet. The service has an external IP address that you can use to access the store-front application.

## Ingress and App Routing Add-on

We saw that the service type for the store-front service is LoadBalancer. This is one way to expose a service to the internet. A better way is to use an Ingress Controller. An Ingress Controller is a Kubernetes resource that manages external access to services in a cluster. It provides HTTP and HTTPS routing to services based on hostnames and paths. The Ingress Controller is responsible for reading the Ingress resource and processing the rules to configure the load balancer. With AKS Automatic, the App Routing Add-on, a managed NGINX Ingress Controller, is enabled by default. All you need to do is create an Ingress resource and the App Routing Add-on will take care of the rest.

Let's convert our app to use ingress to expose the store-front service to the internet rather than using a public IP on the service. Run the following command to patch the store-front service to change the service type to ClusterIP.

```bash
kubectl patch service store-front -p '{"spec": {"type": "ClusterIP"}}'
```

Deploy the ingress resource:

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: store-front
spec:
  ingressClassName: webapprouting.kubernetes.azure.com # this is critical
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: store-front
            port:
              number: 80
EOF
```

<div class="info" data-title="Note">

> This ingress resource is very similar to a typical nginx ingress resource. The only difference is the `ingressClassName` field. The `ingressClassName` field is set to `webapprouting.kubernetes.azure.com` which enables the App Routing Add-on to manage this ingress resource.

</div>

Wait a minute or two for the ingress to be created, then run the following command to get the public IP address of the ingress.

```bash
echo "http://$(kubectl get ingress store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the link in the terminal and you should be taken to the product page of the AKS pet store, this time using the ingress to access the store-front service!

It is also worth mentioning that the App Routing Add-on does a little more than just manage the NGINX Ingress Controller. It also provides integration with Azure DNS for automatic DNS registration and management and Azure Key Vault for automatic TLS certificate management. Check out the [App Routing Add-on documentation](https://learn.microsoft.com/azure/aks/app-routing?tabs=default%2Cdeploy-app-default) for more information.

---

# App Updates and Rollbacks

```bash
kubectl set image deployment/store-front store-front=$ACR_NAME.azurecr.io/store-front:1.5.0
```

Check the rollout status:

```bash
kubectl rollout status deployment/store-front
```

Check the store-front service to see the new image:

```bash
kubectl get svc store-front
```

Open a browser and navigate to the public IP address of the store-front service.


## Deployment rollbacks

```bash
kubectl rollout undo deployment/store-front
```

Open a browser and navigate to the public IP address of the store-front service.

## PodDisruptionBudgets

Cordon the user node:

```bash
kubectl cordon aks-nodepool1-12345678-vmss000000
```

Notice the pods are evicted.

Create a PodDisruptionBudget:

```bash
kubectl apply -f - <<EOF
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: store-front-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: store-front
EOF
```

Uncordon the node:

```bash
kubectl uncordon aks-nodepool1-12345678-vmss000000
```

Notice the pods are rescheduled.

Cordon the user node again:

Notice the pods are protected by the PodDisruptionBudget.

---

# Application and Cluster Scaling

talk about scaling cluster and application

## Manual application scaling (deployment)

Update nodepool to use smaller VM sizes

Update the store-front deployment to have 10 replicas:

Note how Karpeneter is used to automatically scale the node pool to accommodate the new pods.

view the nodes

```bash
kubectl get nodes -o custom-columns=NAME:'{.metadata.name}',OS:'{.status.nodeInfo.osImage}',SKU:'{.metadata.labels.karpenter\.azure\.com/sku-name}' -w
```

Scale it back down to 1

## HPA

> https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/

```bash
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://store-front; done"
```

see it reach 100% CPU

```bash
kubectl top pod -l app=store-front
```

Add an HPA to the store-front deployment:

```bash
kubectl autoscale deployment store-front --cpu-percent=50 --min=1 --max=100
```

Check the HPA:

```bash
kubectl get hpa store-front
```

Generate load on the store-front service

## Scaling with KEDA based on CPU utilization

You could just stick with HPA but you'd need to constantly monitor and adjust the CPU threshold.

KEDA is a Kubernetes-based Event Driven Autoscaler. With KEDA, you can automate the scaling of your application and it can scale on more than just CPU. It can scale based on the number of events in a queue, or the length of a stream, or the number of messages in a topic.

AKS Automatic Cluster comes with KEDA pre-installed.

Use Azure Portal to create a new ScaledObject

Run load generator again, and see it in action.

---

# Handling Stateful Workloads

Container storage is ephemeral. If a pod is deleted, the data is lost. To persist data, you need to use persistent volumes.

## AKS Storage classes and PVC's

Create PVC that leverages AKS storage classes 

```bash
kubectl get storageclasses
```

We'll create a PVC using the `managed-csi` storage class. This will create a managed disk in Azure.
Reference: https://www.rabbitmq.com/docs/relocate

## Replace RabbitMQ with Azure Service Bus

Moving to a managed service like Azure Service Bus can help you avoid the overhead of managing RabbitMQ.

Create Azure Service Bus namespace
Create a new queue
Create a ConfigMap with the service bus info
Create a managed identity

Use ServiceConnector to connect to the service bus

update the order-service deployment to use the service bus

submit orders and view orders in service bus explorer on azure portal

---

# Observability

With AKS automatic, its all here!

## Prometheus and Grafana

Log into Azure managed grafana and click around

## Container Insights

View container live logs
View logs from log analytics
Be specific about the logs they should be looking at

## Control Plane metrics

More dashboards!
Todo: point out the dashboards to view

## Cost analysis

View cost analysis

---

# CI/CD and Automated Deployments

## Use AKS Automated Deployments with a single service to setup CI/CD
