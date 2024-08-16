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

## Familiarize with AKS Presets in portal

Browse to https://portal.azure.com and login with your Azure account.

Search for `Kubernetes services` and click on **+ Create** drop down to expand the menu

Click on **Kubernetes Cluster** to create a new AKS cluster.

Note all the tabs and options.

Under Cluster details see the Cluster preset configuration.

You can click the link to **Compare presets** to see the differences between the presets.


Back out of the create cluster window.

Click on **Create** to create a new AKS cluster then click on **Automatic AKS Cluster** to create a new AKS cluster.


Note how much simpler the configuration is.

## Deploy AKS Automatic Cluster

Cluster Details:
Cluster Name: Enter a unique name for your cluster.
Region: Select the desired region where you want to deploy your cluster.
Node Size: Choose the appropriate node size based on your workload requirements.
Node Count: Specify the number of nodes you want in your cluster.
Configuration Settings:
Networking: Configure the networking options such as Virtual Network and Subnet.
Authentication: Set up authentication methods for accessing the cluster.
Monitoring: Enable or disable monitoring options as per your needs.

Click Next

Leave all defaults for monitoring and click review and create.

After validation passes click create.

## Connect to AKS 

Open the Azure Cloud Shell and run the following command to connect to your AKS cluster:

Set up environment variables:

```bash
RG_NAME=<resource-group-name>
AKS_NAME=<aks-name>
```

<div class="info" data-title="Note">

> Note: Replace `<resource-group-name>` and `<aks-name>` with your resource group and AKS cluster name.

</div>

```bash
az aks get-credentials --resource-group $RG_NAME --name $AKS_NAME
```

Patch nodepool manifest to only deploy B series VMs

## Azure Container Registry 

Blurb about ACR here...

### Deploy Azure Container Registry (ACR)

```bash
ACR_NAME=<acr-name>
az acr create --resource-group $RG_NAME --name <acr-name> --sku Basic
```

### Attach ACR to AKS cluster

```bash
az aks update --name $AKS_NAME --resource-group $RG_NAME --attach-acr $ACR_NAME
```

## Import aks-store images to ACR

```bash
# store-front
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/store-front:1.2.0 --image aks-store-demo/store-front:1.2.0

# order-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/order-service:1.2.0 --image aks-store-demo/order-service:1.2.0

# product-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/product-service:1.2.0 --image aks-store-demo/product-service:1.2.0

# store-front
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/store-front:1.5.0 --image aks-store-demo/store-front:1.5.0

# order-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/order-service:1.5.0 --image aks-store-demo/order-service:1.5.0

# product-service
az acr import --name $ACR_NAME --source ghcr.io/azure-samples/aks-store-demo/product-service:1.5.0 --image aks-store-demo/product-service:1.5.0
```

---

# Deploy Store App to AKS

Download the following YAML file to your local machine:

```bash
curl -o aks-store-quickstart.yaml https://raw.githubusercontent.com/Azure-Samples/aks-store-demo/main/aks-store-quickstart.yaml
```

Replace the image references in the YAML file with the images you imported to ACR.

```bash
sed -i 's/ghcr.io\/azure-samples/$ACR_NAME.azurecr.io/g' aks-store-quickstart.yaml
```

Apply the manifest

```bash
kubectl apply -f aks-store-quickstart.yaml
```

## Deployment Safeguards

Note the warnings in the portal. Here is where in the portal where you can see the policies that drive this.

View Azure Policy....

## Getting familiar with AKS Store app 

Get the public ip of the store-front service:

```bash
kubectl get svc store-front
```

Open a browser and navigate to the public IP address of the store-front service.

Explore the store app.

Browse products, add to cart, and checkout.

## Deployments and Services

Explain deployments

```bash
kubectl get deployments store-front -o yaml
```

Note the resources section. There are requests and limits set for CPU and memory. This is a best practice to ensure your pods have the resources they need to run.

Explain services

```bash
kubectl get svc store-front -o yaml
```

## Ingress and App Routing Add-on

Explain app routing add-on for AKS

We'll be using ingress to expose the store-front service to the internet rather than using a public IP on the service.

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

Get the public ip of the ingress:

```bash
kubectl get ingress store-front
```

Open a browser and navigate to the public IP address of the ingress.

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
