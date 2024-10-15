---
published: true # Optional. Set to true to publish the workshop (default: false)
type: workshop # Required.
title: Getting Started with Azure Kubernetes Service (AKS) Automatic # Required. Full title of the workshop
short_title: Getting Started with AKS Automatic # Optional. Short title displayed in the header
description: This is a workshop for getting started with AKS Automatic # Required.
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
wt_id: WT.mc_id=containers-147656-pauyu
---

# Overview

This workshop will guide you up to speed with working with Azure Kubernetes Service (AKS) Automatic. AKS Automatic is a new way to deploy and manage Kubernetes clusters on Azure. It is a fully managed Kubernetes service that simplifies the deployment, management, and operations of Kubernetes clusters. With AKS Automatic, you can deploy a Kubernetes cluster with just a few clicks in the Azure Portal. AKS Automatic is designed to be simple and easy to use, so you can focus on building and running your applications.

## Objectives

After completing this workshop, you will be able to:

- Deploy an AKS Automatic cluster
- Connect to the AKS cluster and deploy applications
- Implement resiliency in your application using Kubernetes Deployments
- Scale your cluster and application
- Monitor your cluster and application

## Prerequisites

All you need to complete this workshop is an [Azure subscription](https://azure.microsoft.com/) with permissions to create resources and a [GitHub account](https://github.com/signup). You will also need to ensure you have enough vCPU quota in the region you are deploying the AKS cluster to. If you don't have enough quota, you can request a quota increase. See [here](https://docs.microsoft.com/azure/azure-portal/supportability/per-vm-quota-requests) for more information.

## Workshop instructions

When you see these blocks of text, you should follow the instructions below.

<!-- <div class="task" data-title="Task">

> This means you need to perform a task.

</div> -->

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

---

# Deploy your AKS Cluster

There are several ways to deploy an AKS cluster, including the Azure Portal, Azure CLI, ARM templates, Azure Bicep, Terraform, and Pulumi, among others. While there are no shortages of ways to deploy an AKS cluster, we will focus on the Azure Portal and Azure CLI in this workshop.

## Familiarize yourself with AKS Presets in portal

Open a browser and navigate to the [Azure Portal](https://portal.azure.com). Login with your Azure credentials.

In the search bar at the top of the portal, start typing **kubernetes** and you will start to see a list of services, marketplace items, and resources that match your search. Under **Services** click on **Kubernetes services**.

![Azure Portal Kubernetes Services](./assets/azure-portal-kubernetes-services.png)

In the **Kubernetes services** screen, click on the **Create** drop down and then click on **Kubernetes cluster**.

![Azure Portal Create Kubernetes Cluster](./assets/azure-portal-create-kubernetes-cluster.png)

You should now see the **Create Kubernetes cluster** screen. This is where you can create a new AKS cluster.

Across the top of the screen, you'll notice a series of tabs. Under **Cluster details** in the **Basics** tab, you'll see the **Cluster preset configuration**. This is where you can choose from a series of presets that will automatically configure your AKS cluster based on your workload requirements.

![Azure Portal Create Kubernetes Cluster Basics](./assets/azure-portal-create-kubernetes-cluster-basics.png)

Click the **Compare presets** link to see the differences between the presets.

![Azure Portal Kubernetes Preset Configurations](./assets/azure-portal-kubernetes-preset-configurations.png)

You should see a table that lists all the presets and the differences between them. By default, the **Production Standard** preset is selected.

Click **Cancel** to back out of the cluster preset comparison window.

You will also notice that the cluster preset can be selected from the drop down menu. Toggle between **Dev/Test** and **Production Enterprise** to see the differences between the presets.

![Azure Portal Kubernetes Preset Configurations](./assets/azure-portal-kubernetes-preset-configuration-selection.png)

Going back to the tabs at the top of the screen, click through the **Node pools**, **Networking**, **Integrations**, **Monitoring**, and **Advanced** tabs to see additional configuration options available to you.

That's a lot of options! But what if you just want to create an AKS cluster without all the fuss? That's where **Automatic AKS Cluster** comes in.

Click the **X** icon in the upper right corner to back out of the create cluster window.

## Deploy AKS Automatic Cluster

Click on the **Create** drop down again but this time, click **Automatic Kubernetes cluster (preview)**.

![Azure Portal Create Automatic Kubernetes Cluster](./assets/azure-portal-create-aks-automatic-cluster.png)

You can see that the configuration options are much simpler. There's only a **Basics** and **Monitoring** tab.

![Azure Portal Create Automatic Kubernetes Cluster](./assets/azure-portal-create-aks-automatic-cluster-options.png)

Let's go ahead and create an AKS automatic cluster.

In the **Basics** tab, fill out the following fields:

- **Subscription:** Select your Azure subscription.

  <div class="info" data-title="Note">

  > You may see a message that the subscription does not have the flags: EnableAPIServerVnetIntegrationPreview, NRGLockdownPreview, NodeAutoProvisioningPreview, DisableSSHPreview, SafeguardsPreview, AutomaticSKUPreview registered. Preview features must be registered in order to create a cluster so go ahead and click the **Register preview features** link to register the required flags in your subscription.

  </div>

- **Resource group:** Create a new resource group or use an existing one.
- **Kubernetes cluster name:** Enter a name for your cluster.
- **Region:** Select the desired region where you want to deploy your cluster.

  <div class="info" data-title="Note">

  > You need to ensure you have 32 vCPU quota for Standard_DSv2 available in the region you are deploying the cluster to. If you don't have enough quota, you can request a quota increase by following this [guide](https://learn.microsoft.com/azure/quotas/quickstart-increase-quota-portal).

  </div>

- **Automatic upgrade scheduler:** Leave the default setting.
- **Access control:**: AKS Automatic uses Microsoft Entra ID authentication with Azure RBAC for cluster access. You can add additional users or groups to the cluster after it's created, but that is outside the scope of this workshop.

In the **Monitoring** tab, you have the option to either link existing monitoring resources or create new ones. We'll go ahead and create new monitoring resources.

- **Enable Container Logs:** Make sure the checkbox is checked to enable Container Insights.
- **Log Analytics Workspace:** Create the **Create new** link and create a new Log Analytics workspace.
- **Cost Preset:** Leave the default setting of **Standard**.
- **Enable Prometheus metrics:** Make sure the checkbox is checked to enable Prometheus metrics.
- **Azure Monitor workspace:** Create the **Create new** link and create a new Azure Monitor workspace.
- **Enable Grafana:** Make sure the checkbox is checked to enable Grafana.
- **Grafana workspace:** Create the **Create new** link and create a new Grafana workspace.
- **Enable recommended alerts:** Make sure the checkbox is checked to enable recommended alerts.

Click the **Review + create** button then after validation passes, click the **Create** button.

<div class="info" data-title="Note">

> The cluster creation process will take about 10-15 minutes to complete.

</div>

## Connect to AKS cluster

The kubectl tool is your direct line of communication with the kube-apiserver and is most common way to interact with a Kubernetes cluster. Access to the kube-apiserver is controlled by the [kubeconfig file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/). The kubeconfig file contains the necessary certificate information to authenticate against the Kubernetes API server, and the Azure CLI for AKS has a handy command to get the kubeconfig file for your AKS cluster.

<div class="info" data-title="Note">

> For the rest of this workshop, you will perform tasks using both kubectl and the Azure portal. This will give you a good understanding of how to interact with your AKS cluster using both methods. Any time we need to interact with the AKS cluster, we will use the Azure Cloud Shell. The Azure Cloud Shell is a free interactive shell that you can use to run the Azure CLI, kubectl, and other tools. It is already configured to use your Azure subscription and is a great way to run commands without having to install anything on your local machine.

</div>

In the Azure Portal, click the **Cloud Shell** icon in the top right corner of the portal.

![Azure Portal Cloud Shell](./assets/azure-portal-cloud-shell.png)

<div class="tip" data-title="Tip">

> If this is your first time opening Azure Cloud Shell, be sure to click the **Bash** button when asked presented with the environment selector as all command line instructions in this workshop are intended to be run in a POSIX shell. You may also be asked to create a storage account for your Cloud Shell. Go ahead and select **No storage account required**, then select your subscription and click **Apply**.

</div>

Run the following commands to set a few environment variables in a local .env file.

```bash
RG_NAME=<resource-group-name>
```

<div class="important" data-title="Important">

> Be sure to replace `<resource-group-name>` with the resource group name where the AKS cluster was deployed.

</div>

Run the following command to get the name of your AKS cluster.

```bash
AKS_NAME=$(az aks list -g $RG_NAME --query "[0].name" -o tsv)
```

Run the following command to write the environment variables to a local .env file.

```bash
echo "RG_NAME=$RG_NAME" > .env
echo "AKS_NAME=$AKS_NAME" >> .env
source .env
```

<div class="warning" data-title="Warning">

> Throughout the workshop, your Azure Cloud Shell session may time out. If this happens, you can simply refresh re-connect to the Azure Cloud Shell and run the `source .env` command to re-load the environment variables.

</div>

Run the following command to download the kubeconfig file for your AKS cluster.

```bash
az aks get-credentials --resource-group $RG_NAME --name $AKS_NAME
```

Now you should be able to run kubectl commands against your AKS cluster.

```bash
kubectl cluster-info
```

When running a kubectl command for the first time, you will be presented with a login prompt. Follow the instructions on the screen and proceed with the authorization process and the kubectl command will be executed. As your authentication token expires, you will be prompted to re-authenticate.

![Azure Cloud Shell kubectl login](./assets/azure-cloud-shell-kubectl-login.png)

<div class="info" data-title="Note">

> AKS Automatic clusters are secured by default. It uses [Microsoft Entra ID](https://www.microsoft.com/security/business/identity-access/microsoft-entra-id) authentication with Azure RBAC for cluster access, so simply downloading the kubeconfig file is not enough to access the cluster. You also need to authenticate with Microsoft Entra ID and have the necessary permissions to access the cluster. When you created the AKS Automatic cluster, you were automatically granted the **Azure Kubernetes Service RBAC Cluster Admin** role assignment to access the cluster.

</div>

If you can see the cluster information printed in your terminal, your cluster is up and ready to host applications. But there is a little bit more prep work we need to do. We need to prepare the cluster for our application containers.

## Container Registries

Kubernetes is a container orchestrator. It will run whatever container image you tell it to run. Containers can be pulled from public container registries like [Docker Hub](https://hub.docker.com/) or [GitHub Container Registry (GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), or they can be pulled from private container registries like [Azure Container Registry (ACR)](https://azure.microsoft.com/products/container-registry). Pulling images from a public registry is fine for development and testing but for production workloads, you'll want to use a private registry and only deploy images that have been scanned for vulnerabilities and approved.

### Deploy Azure Container Registry (ACR)

ACR is a managed, private Docker registry service based on the open-source Docker Registry 2.0. It is highly available and scalable across Azure regions across the globe. It also integrates with Microsoft Entra ID for authentication and authorization so it makes it easy to secure your container images.

In the Azure Cloud Shell, run the following command to create an environment variable for your new Azure Container Registry name.

```bash
ACR_NAME=<acr-name>
echo "ACR_NAME=$ACR_NAME" >> .env
source .env
```

<div class="important" data-title="Important">

> Be sure to replace `<acr-name>` with a new unique name for your Azure Container Registry. The name for an ACR resource may contain alphanumeric characters only and must be between 5 and 50 characters long.

</div>

Run the following command to create a new Azure Container Registry.

```bash
az acr create \
  --resource-group $RG_NAME \
  --name $ACR_NAME \
  --sku Standard
```

### Attach ACR to AKS cluster

With the Azure Container Registry created, you need to "attach" it to your AKS cluster. This will allow your AKS cluster to pull images from the Azure Container Registry by granting the AKS resource's managed identity the **AcrPull** role on the Azure Container Registry.

```bash
az aks update \
  --name $AKS_NAME \
  --resource-group $RG_NAME \
  --attach-acr $ACR_NAME
```

## Import container images

We will be using a sample application called [aks-store-demo](https://github.com/Azure-Samples/aks-store-demo). This application is a simple e-commerce store that consists of three services: **store-front**, **order-service**, and **product-service**. The [store-front](https://github.com/Azure-Samples/aks-store-demo/tree/main/src/store-front) is a web application that allows users to browse products, add products to a cart, and checkout. The [product-service](https://github.com/Azure-Samples/aks-store-demo/tree/main/src/product-service) is a RESTful API that provides product information to the store-front service. Finally, the [order-service](https://github.com/Azure-Samples/aks-store-demo/tree/main/src/order-service) is a RESTful API that handles order processing and saves order to a [RabbitMQ](https://www.rabbitmq.com/) message queue.

Here is a high-level application architecture diagram:

![AKS Store Demo Application Architecture](https://learn.microsoft.com/azure/aks/learn/media/quick-kubernetes-deploy-portal/aks-store-architecture.png#lightbox)

The application containers are hosted on GitHub Container Registry (GHCR). Rather than building the containers from source, we will import the containers from GHCR to ACR.

In the Azure Cloud Shell, run the following commands to import the application container images from GHCR into ACR.

```bash
# store-front version 1.2.0
az acr import \
  --name $ACR_NAME \
  --source ghcr.io/azure-samples/aks-store-demo/store-front:1.2.0 \
  --image aks-store-demo/store-front:1.2.0 \
  --no-wait

# store-front version 1.5.0
az acr import \
  --name $ACR_NAME \
  --source ghcr.io/azure-samples/aks-store-demo/store-front:1.5.0 \
  --image aks-store-demo/store-front:1.5.0 \
  --no-wait

# order-service
az acr import \
  --name $ACR_NAME \
  --source ghcr.io/azure-samples/aks-store-demo/order-service:1.2.0 \
  --image aks-store-demo/order-service:1.2.0 \
  --no-wait

# product-service
az acr import \
  --name $ACR_NAME \
  --source ghcr.io/azure-samples/aks-store-demo/product-service:1.2.0 \
  --image aks-store-demo/product-service:1.2.0 \
  --no-wait
```

<div class="info" data-title="Note">

> If you are wondering why we are importing two versions of the store-front application, it's because we will be rolling out application updates later in the workshop.

</div>

Run the following command to ensure the import operations have completed.

```bash
for repo in $(az acr repository list -n $ACR_NAME -o tsv); do
  echo "${repo} tags:"
  az acr repository show-tags -n $ACR_NAME --repository $repo
done
```

If you see tags for each repository, the import operations have completed.

---

# Deploy Store App to AKS

Let's continue in the Azure Cloud Shell and use kubectl to deploy the aks-store-demo application to AKS. There is a [YAML manifest](https://github.com/Azure-Samples/aks-store-demo/blob/main/aks-store-quickstart.yaml) in the repo that contains the deployment and service resources for the store-front, order-service, and product-service, and RabbitMQ.

## Updating Deployment manifests

Before we deploy the manifest, we need to make a few changes. The manifest in the repo references the images on GHCR. We need to replace the image references with the images we imported to ACR.

In the Azure Cloud Shell, run the following command to download the YAML file.

```bash
curl -o aks-store-quickstart.yaml https://raw.githubusercontent.com/Azure-Samples/aks-store-demo/main/aks-store-quickstart.yaml
```

Next, run the following **sed** command to replace all instances of `ghcr.io/azure-samples` with `${ACR_NAME}.azurecr.io` and the tag `latest` with `1.2.0` in the aks-store-quickstart.yaml file.

```bash
sed -i -e "s|ghcr.io/azure-samples/\(.*\):latest|${ACR_NAME}.azurecr.io/\1:1.2.0|g" aks-store-quickstart.yaml
```

Run the following command to apply the manifest.

```bash
kubectl apply -f aks-store-quickstart.yaml
```

<div class="info" data-title="Note">

> The deployment can take up to 10 minutes to schedule pods onto a new node. This is because the AKS Node Autoprovisioning feature (aka Karpenter) automatically provisions new nodes when the existing nodes are at capacity. The new nodes are provisioned with the necessary resources to run the pods. The pods are then scheduled onto the new nodes.

</div>

Run the following command to check the status of the pods.

```bash
kubectl get pods -w
```

When all the pods are in the **Running** state, you can press **Ctrl+C** to exit the watch and proceed to the next step.

## Getting familiar with the demo app

Now, let's explore the store app. Run the following command to get the public IP address of the **store-front** service.

```bash
echo "http://$(kubectl get svc/store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the link in the terminal, and you should be taken to the product page of the AKS pet store. Here a user can browse products, add items to a shopping cart, and checkout. The checkout process is intentionally simple and does not require any payment information. The order is saved to a RabbitMQ message queue.

Add an item to the cart and checkout by clicking on the cart link in the upper right corner. You should see a confirmation message that the order was successfully placed.

![Store front order submitted](./assets/store-front-order-submitted.png)

## Getting familiar with the Kubernetes resources

Now that we've seen the store app in action, let's take a closer look at the resources that were created when we applied the manifest to the Kubernetes cluster.

Back in the terminal, run the following command to view the contents of the YAML file.

```bash
less aks-store-quickstart.yaml
```

<div class="tip" data-title="Tip">

> Press **up** or **down** arrow keys to scroll through the file. Press **q** to exit the file.

</div>

If you look at the YAML file, you'll see that it contains a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and [Service](https://kubernetes.io/docs/concepts/services-networking/service/) resource for each of the three services: **store-front**, **product-service**, and **order-service**. It also contains a [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/), Service, and [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) resource for RabbitMQ.

The manifest is the desired state of the resources in the cluster. When you apply the manifest, the Kubernetes API server will create the resources in the cluster to match the desired state.

### Deployments

Each Deployment resource specifies the container image to use, the ports to expose, environment variables, and resource requests and limits. The Deployment resource was not originally part of Kubernetes but was introduced to make it easier to manage [ReplicaSets](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/). A ReplicaSet is a resource that ensures a specified number of pod replicas are running at any given time and no longer commonly used in favor of Deployments.

Run the following command to view the Deployments.

```bash
kubectl get deployments
```

You can see there are three Deployments: **order-service**, **product-service**, and **store-front**. Each Deployment has one replica. A Deployment is a resource that manages a set of identical [Pods](https://kubernetes.io/docs/concepts/workloads/pods/). The Pods are created from the container image specified in the Deployment resource.

If you want to see individual Pods, you can run the following command.

```bash
kubectl get pods
```

This is where your application code runs. A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster. If you need to troubleshoot an application, you can view the logs of the Pod by running the following command.

```bash
kubectl logs rabbitmq-0
```

### Services

A Service is a resource that exposes an application running in a set of Pods as a network service. It provides a stable endpoint for the application that can be accessed by other applications in the cluster or outside the cluster.

Run the following command to view the Services.

```bash
kubectl get service store-front
```

As you can see, the **store-front** Service is of type [LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer). This means that the Service is exposed to the internet and the Service has an public IP address that you can use to access the application.

### StatefulSets

The StatefulSet is a resource that manages a set of identical pods with persistent storage and commonly used for stateful applications like databases and data stores.

Run the following command to view the StatefulSets.

```bash
kubectl get statefulsets
```

You can see that there is a StatefulSet for RabbitMQ. The StatefulSet resource is used to manage the RabbitMQ pods and ensure that the pods are created in a specific order.

### ConfigMaps

The ConfigMap resource is used to store configuration data in key-value pairs. The ConfigMap resource is used to store the configuration data for RabbitMQ.

Run the following command to view the ConfigMaps.

```bash
kubectl get configmaps
```

You can see that there is a ConfigMap for RabbitMQ. The ConfigMap resource is used to store the configuration data for RabbitMQ to enable AMQP 1.0 protocol.

## Ingress and App Routing Add-on

We saw that the service type for the **store-front** service is _LoadBalancer_. This is one way to expose an application to the internet. A better way is to use an [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/). An [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) is a Kubernetes resource that manages inbound access to services in a cluster. It provides HTTP and HTTPS routing to services based on hostnames and paths. The Ingress Controller is responsible for reading the Ingress resource and processing the rules to configure the load balancer. With AKS Automatic, the App Routing Add-on, a managed NGINX Ingress Controller, is enabled by default. All you need to do is create an Ingress resource and the App Routing Add-on will take care of the rest.

Let's convert our app to use ingress to expose the store-front service to the internet rather than using a public IP on the service.

Run the following command to patch the store-front service to change the service type to _ClusterIP_.

```bash
kubectl patch service store-front -p '{"spec": {"type": "ClusterIP"}}'
```

<div class="info" data-title="Note">

> kubectl is a powerful tool that can be used to create, update, and delete resources in a Kubernetes cluster. The `patch` command is used to update a resource in the cluster. The `-p` flag is used to specify the patch to apply to the resource. In this case, we are changing the service type to _ClusterIP_ to remove the public IP address from the service.

</div>

Run the following command to deploy the ingress manifest for the store-front app.

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: store-front
spec:
  ingressClassName: webapprouting.kubernetes.azure.com
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

This Ingress resource is very similar to a typical [NGINX Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource) resource. The only difference is the `ingressClassName` field. The `ingressClassName` field is set to `webapprouting.kubernetes.azure.com` which enables the AKS App Routing Add-on to manage this resource.

Wait a minute or two for the ingress to be created, then run the following command to get the public IP address of the ingress.

```bash
echo "http://$(kubectl get ingress store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the URL in the terminal and you should be taken to the product page of the AKS pet store, this time using the Ingress to access the store-front service!

<div class="important" data-title="Important">

> It is also worth mentioning that the App Routing Add-on does a little more than just manage the NGINX Ingress Controller. It also provides integration with Azure DNS for automatic DNS registration and management and Azure Key Vault for automatic TLS certificate management. Check out the [App Routing Add-on documentation](https://learn.microsoft.com/azure/aks/app-routing?tabs=default%2Cdeploy-app-default) for more information.

</div>

---

# Application Resiliency

As mentioned above Kubernetes Deployments is a resource that manages [ReplicaSets](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/) and it enables you to manage application updates and rollbacks. This greatly improves the resiliency of your application.

## Deployments and ReplicaSets

There is a link between Deployment and ReplicaSet resources. When you create a Deployment, Kubernetes creates a ReplicaSet for you.

To view the link beetween the two resources, run the following command to get the owner reference of the store-front ReplicaSet.

```bash
# get the name of the store-front ReplicaSet
STORE_FRONT_RS_NAME=$(kubectl get rs --sort-by=.metadata.creationTimestamp | grep store-front | tail -n 1 | awk '{print $1}')

# get the details of the store-front ReplicaSet
kubectl get rs $STORE_FRONT_RS_NAME -o json | jq .metadata.ownerReferences
```

In the output, you can see the ReplicaSet resource is owned by the store-front Deployment resource. Also, note the `uid` field in the output. This is the unique identifier (`uid`) of the Deployment resource.

```json
[
  {
    "apiVersion": "apps/v1",
    "blockOwnerDeletion": true,
    "controller": true,
    "kind": "Deployment",
    "name": "store-front",
    "uid": "65aeeba4-5202-4fb7-9d70-ad5db0ffe1df"
  }
]
```

If we inspect at the Deployment resource, we can see the same `uid` field in the output.

```bash
kubectl get deployment store-front -o json | jq .metadata.uid
```

Additionally, when a Deployment is created, it creates a rollout history. You can view the rollout history by running the following command.

```bash
kubectl rollout history deployment store-front
```

Here you can see the revision number and you should only have a single revision since we only deployed the application once. Let's update the store-front app to use a new container image version and then roll back to the previous version.

## Deployment Update Strategy

The default deployment strategy of a Deployment resource is _RollingUpdate_. You can see that by running the following command.

```bash
kubectl get deployments store-front -o jsonpath='{.spec.strategy.type}'
```

The [RollingUpdate](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) strategy means that Kubernetes will create a new ReplicaSet and scale it up while scaling down the old ReplicaSet. If the new ReplicaSet fails to start, Kubernetes will automatically roll back to the previous ReplicaSet.

Run the following command to update the store-front container image to use the 1.5.0 version.

```bash
kubectl set image deployment/store-front store-front=$ACR_NAME.azurecr.io/aks-store-demo/store-front:1.5.0
```

Run the following command to check the rollout status.

```bash
kubectl rollout status deployment/store-front
```

Wait until you see the message `deployment "store-front" successfully rolled out`.

Now if you run the following command, you should see two different versions of the ReplicaSet.

```bash
kubectl get rs --selector app=store-front
```

You should see the older ReplicaSet with 0 for the DESIRED, CURRENT, and READY columns and the newer ReplicaSet with 1s across the board.

If you browse to the store-front application, you should see the new version of the application.

![Store front updated](./assets/store-front-updated.png)

### Rollback a Deployment

With Deployment rollouts, you can easily roll back to a previous version of the application. As mentioned earlier, the rollout history is stored and you can run the following command to roll back to the previous version.

```bash
kubectl rollout undo deployment/store-front
```

<div class="info" data-title="Note">

> You can also roll back to a specific revision by specifying the revision number. For example, `kubectl rollout undo deployment/store-front --to-revision=1` to select the first revision.

</div>

If you browse to the store-front application, you should see the previous version of the application.

![Store front original](./assets/store-front-original.png)

## Dealing with Disruptions

As you may be aware, application updates can cause disruptions. However, with Kubernetes Deployments, you can manage application updates and rollbacks. But application updates are not the only disruptions that can occur. Nodes can fail or be marked for maintenance. You need to be prepared for both [voluntary and involuntary disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/).

### Voluntary Disruptions

A voluntary disruption is a disruption that is initiated by the user. For example, you may want to scale down the number of replicas in a Deployment, or you may want to take a Node down for maintenance. Kubernetes has built-in mechanisms to handle these disruptions. During a voluntary disruption, Kubernetes will gracefully remove Pods from a Node.

In maintenance scenarios, a Node will be [drained and cordoned](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/) so that no new Pods will be scheduled on the node. Any existing Pod will be evicted using the [Eviction API](https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/). It doesn't matter how many replicas you have running on a Node or how many replicas will be remaining after the eviction; the Pod will be evicted and rescheduled on another Node. This means you can incur downtime if you are not prepared for it.

Good news is that Kubernetes has a built-in mechanism to handle these disruptions. The [PodDisruptionBudget](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) resource allows you to specify the minimum number of Pods that must be available during a voluntary disruption. When a PodDisruptionBudget is created, Kubernetes will not evict Pods if evicting it will result in a violation of the budget. Essentially the PodDisruptionBudget ensures that a minimum number of Pods remains available during a voluntary disruption.

To see this in action we should scale our store-front deployment to have more than one replica. Run the following command to scale the store-front deployment to 3 replicas.

```bash
kubectl scale deployment store-front --replicas=3
```

With the deployment scaled to 3 replicas, we can see which nodes the Pods are running on.

```bash
kubectl get pod --selector app=store-front -o wide
```

You can see that the Pods are all running on a single Node.

Let's grab the name of the Node and cordon it.

```bash
# get the name of the Node
NODE_NAME=$(kubectl get pod -l app=store-front -o jsonpath='{.items[0].spec.nodeName}')

# cordon the node
kubectl drain $NODE_NAME --ignore-daemonsets
```

You should see a list of all the Pods that have been evicted. It doesn't matter that all 3 replicas of the store-front application were running on the node. Kubernetes doesn't care and will evict all the Pods with no regard.

This is where the PodDisruptionBudget comes in. A PodDisruptionBudget is a resource that specifies the minimum number of Pods that must be available during a voluntary disruption. When a PodDisruptionBudget is created, Kubernetes will not evict Pods that violate the budget

You will need to create a PodDisruptionBudget for the store-front application that specifies that at least 1 Pod must be available during a voluntary disruption. This will ensure that the next time we drain a node, at least 1 Pod will remain running. Once new Pods are scheduled on other nodes, the PodDisruptionBudget will be satisfied and the remaining Pods on the node will be evicted. This is a great way to ensure that your application remains available during a voluntary disruption.

Run the following command to create a PodDisruptionBudget for the store-front application.

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

If you run the following command, you should see that the Pods were scheduled on a different node. If you see a status of 'Pending' wait a short while and re-run the command until all three replicas are in the 'Running' state.

```bash
kubectl get pod --selector app=store-front -o wide
```

<div class="info" data-title="Note">

> You may have noticed the drained Node is no longer available in your cluster. This is because the Node was unused and the [AKS Node Autoprovisioning](https://learn.microsoft.com/azure/aks/node-autoprovision?tabs=azure-cli) feature (aka [Karpenter](https://karpenter.sh/)) automatically removed it from the cluster. More on that later.

</div>

Let's drain the node again and see what happens.

```bash
# get the name of the new node
NODE_NAME=$(kubectl get pod -l app=store-front -o jsonpath='{.items[0].spec.nodeName}')

# cordon the new node
kubectl drain $NODE_NAME --ignore-daemonsets

# watch the status of the pods and the nodes they are running on
kubectl get pod --selector app=store-front -o wide -w
```

Notice this time a warning message is displayed that the PodDisruptionBudget is preventing the eviction of the a store-front Pod on the node due to the PodDisruptionBudget violation.

Once the new node is up and running, the PodDisruptionBudget will be satisfied and the remaining Pods on the node will be evicted.

### Involuntary Disruptions

An involuntary disruption is a disruption that is not initiated by the user. For example, a node may fail and if we had all the replicas of the store-front application running on that node, we would have downtime. When running more than one replica of an application, it is important to spread the replicas across multiple nodes to ensure high availability. This is where [PodAntiAffinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) or [PodTopologySpreadConstraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) comes in.

**PodAntiAffinity** is a feature that allows you to specify that a Pod should not be scheduled on the same node as another Pod. PodAntiAffinity can be hard or soft. Hard PodAntiAffinity means that the Pods must be scheduled on different nodes. Soft PodAntiAffinity means that the Pods should be scheduled on different nodes if possible.

**PodTopologySpreadConstraints** is a feature that allows you to specify that a Pod should be spread across different zones, regions, or nodes. This is useful for ensuring high availability of your application.

Either of these Pod scheduling features can be used to ensure that your application remains available during an involuntary disruption with the difference being that PodAntiAffinity is used to spread Pods across nodes and PodTopologySpreadConstraints can provide more granular control by spreading Pods across zones and/or regions.

Let's ensure the store-front application is spread across multiple nodes. Run the following command to create a PodAntiAffinity rule for the store-front application.

Run the following command to get the YAML manifest for the store-front deployment.

```bash
kubectl get deployment store-front -o yaml > store-front-deployment.yaml
```

Open the `store-front-deployment.yaml` file using the nano text editor.

```bash
nano store-front-deployment.yaml
```

<div class="tip" data-title="Tip">

> When done editing, press the **Ctrl + O** keys to save the file then press the Enter key. Press the **Ctrl + X** keys to exit the nano text editor.

</div>

In the `store-front-deployment.yaml` file, add the following PodAntiAffinity rule to the `spec` section of the **store-front** deployment. This rule tells the Kubernetes scheduler to spread the store-front Pods using `topologyKey: kubernetes.io/hostname` which essentially means to spread the Pods across different nodes.

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values:
                - store-front
        topologyKey: "kubernetes.io/hostname"
```

<div class="warning" data-title="Warning">

> There are many `spec` items in the manifest, you want to add the code snippet above in the `spec` section that includes the `containers` field. Once you locate the correct `spec` section, add a new line after the `spec` field and just before the `containers` field and paste the code snippet.

</div>

Now let's replace the store-front deployment with the updated manifest.

```bash
kubectl replace -f store-front-deployment.yaml
```

This command will force Kubernetes to reschedule Pods onto new nodes. Run the following command to get the nodes that the store-front Pods are running on.

```bash
kubectl get pod --selector app=store-front -o wide -w
```

<div class="info" data-title="Note">

> It can take a few minutes for the Pods to be rescheduled onto new nodes because AKS Node Autoprovisioning (Karpenter) will need to create new nodes to satisfy the PodAntiAffinity rule.

</div>

Also note that the replacement of the Pods are considered to be an update to the Deployment resource. So the RollingUpdate strategy will be used to rollout new Pods before terminating the old Pods. So we're safe from downtime during this process!

Once the Pods are rescheduled onto new nodes, you should see that the Pods are spread across multiple nodes.

```bash
kubectl get pod --selector app=store-front -o wide
```

---

# Handling Stateful Workloads

Container storage is ephemeral; that is if a pod is deleted, the data is lost because by default, data is saved within the container. In order to persist the data, you need to use [Persistent Volume (PV)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) and [Persistent Volume Claim (PVC)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims).

## AKS Storage classes and PVC's

Typically for persistent storage in a Kubernetes cluster, you would create a PV to allocate storage and use a PVC to request a slice storage against the PV.

With AKS, [Azure CSI drivers and storage classes](https://learn.microsoft.com/azure/aks/csi-storage-drivers) are pre-deployed into your cluster. The storage classes allow you to simply create a PVC that references a particular storage class based on your application requirements. This storage class will take care of the task of creating the PV for you, in this case, using Azure Storage. So AKS removes the need to manually create PV's.

Run the following command to get the list of storage classes in your AKS cluster.

```bash
kubectl get storageclasses
```

We need to update the RabbitMQ StatefulSet to use a PVC. Run the following command to get the YAML manifest for the RabbitMQ StatefulSet.

```bash
kubectl get statefulset rabbitmq -o yaml > rabbitmq-statefulset.yaml
```

Open the `rabbitmq-statefulset.yaml` file using the nano text editor.

```bash
nano rabbitmq-statefulset.yaml
```

Add the following PVC spec to the `rabbitmq-statefulset.yaml` file. This will create a PVC that requests 1Gi of storage using the `managed-csi` storage class.

```yaml
volumeClaimTemplates:
  - metadata:
      name: rabbitmq-data
    spec:
      storageClassName: managed-csi
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
```

<div class="warning" data-title="Warning">

> There are many `spec` items in the manifest, you want to add the code snippet at the top of the first `spec` section

</div>

Keep the file open, navigate to the pod template spec and add an additional volume that references the PVC.

```yaml
- name: rabbitmq-data
  persistentVolumeClaim:
    claimName: rabbitmq-data
```

Finally in the container spec, add a volume mount that references the volume.

```yaml
- mountPath: /var/lib/rabbitmq/mnesia
  name: rabbitmq-data
```

Save the file and exit the nano text editor.

<div class="info" data-title="Info">

> For more information on RabbitMQ and persistent storage, see the [RabbitMQ documentation](https://www.rabbitmq.com/docs/relocate) and this [blog post](https://www.rabbitmq.com/blog/2020/08/10/deploying-rabbitmq-to-kubernetes-whats-involved).

</div>

Run the following command to replace the RabbitMQ StatefulSet with the updated manifest.

```bash
kubectl delete statefulset rabbitmq
kubectl apply -f rabbitmq-statefulset.yaml
```

A `volumeClaimTemplates` section was added to the RabbitMQ StatefulSet manifest. This section defines a PVC that requests 1Gi of storage using the `managed-csi` storage class. The PVC is automatically created by the storage class and is bound to an Azure Disk.

You can check the status of the PVC by running the following command.

```bash
kubectl get pvc
```

If you see STATUS as `Bound`, the PVC has been successfully created and is ready to be used by the RabbitMQ pod. You can also see that the Azure Disk has been created in the AKS cluster's managed resource group by running the following command.

```bash
az resource list \
  -g $(az aks show --name $AKS_NAME --resource-group $RG_NAME --query nodeResourceGroup -o tsv) \
  --resource-type Microsoft.Compute/disks \
  --query "[?contains(name, 'pvc')]" \
  -o table
```

Now, let's test the durability of the RabbitMQ data by creating a queue and then deleting the RabbitMQ pod. Run the following command to port-forward to the RabbitMQ management UI.

```bash
kubectl port-forward svc/rabbitmq 15672:15672
```

Open a browser and navigate to `http://localhost:15672`. Log in with the username `username` and password `password`. Click on the **Queues** tab then click on **Add a new queue** and create a new queue called `test`.

<div class="info" data-title="Note">

> Make sure the **Durability** option is set to **Durable**. This will ensure that the queue is persisted to disk.

</div>

Back in the terminal, run the following command to delete the RabbitMQ pod.

```bash
kubectl delete pod rabbitmq-0
```

After a few seconds, Kubernetes will do what it does best and recreate the RabbitMQ pod. At this point the port-forward to the RabbitMQ service will be broken, so run the port-forward command again and reload the RabbitMQ management UI in the browser. Navigate back to the **Queues** tab and you should see the `test` queue you created earlier. This is because the we mounted the Azure Disk to the `/var/lib/rabbitmq/mnesia` path and all RabbitMQ data now persists across pod restarts.

## Replace RabbitMQ with Azure Service Bus

As you can see, Kubernetes is great for stateless applications especially with Azure storage backing it. But running stateful applications like RabbitMQ in a highly available and durable way can be challenging and might not be something you would want to manage yourself. This is where integrating with a managed service like [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview) can help. Azure Service Bus is a fully managed enterprise message broker with message queues and publish-subscribe topics very similar to RabbitMQ. The sample application has been written to use the AMQP protocol which is supported by both RabbitMQ and Azure Service Bus, so we can easily switch between the two.

### Create Azure Service Bus namespace and queue

In the Azure portal, search for **Service Bus**, click on **Service Bus** under **Services** then click on the **Create service bus namespace** button.

![Azure portal service bus](./assets/azure-portal-service-bus.png)

Fill in the required fields and click **Create**.

- **Resource group**: Select the resource group where your AKS cluster is deployed.
- **Namespace name**: Enter a unique name for the namespace (should be globally unique and lower case).
- **Location**: Select the same location as your AKS cluster.
- **Pricing tier**: Select **Basic**.

Click on the **Review + create** button then click **Create**.

Once the namespace is created, click on the **Go to resource** button.

![Azure portal service bus namespace created](./assets/azure-portal-service-bus-namespace-created.png)

In the **Overview** section, click on the **+ Queue** button at the top to create a new queue.

![Azure portal service bus queue create](./assets/azure-portal-service-bus-queue-create.png)

In the **Create queue** window, set the name of the queue to `orders` and click **Create**.

![Azure portal service bus queue configuration](./assets/azure-portal-service-bus-queue-configuration.png)

### Create a user-assigned managed identity

In order for the order-service application to authenticate with Azure Service Bus, we need to create a user-assigned managed identity. In the Azure portal, search for **Managed Identities**, click on **Managed Identities** under **Services** then click on the **+ Create** button.

![Azure portal managed identity](./assets/azure-portal-managed-identity.png)

Fill in the required fields

- **Resource group**: Select the resource group where your AKS cluster is deployed.
- **Name**: You can use the same name as the Service Bus namespace.

Click **Review + create** then click **Create**.

### Integrate Azure Services with AKS using Service Connector

Here is where the authentication magic happens. We will use the [AKS Service Connector](https://learn.microsoft.com/azure/service-connector/overview) to connect the order-service application to Azure Service Bus. The AKS Service Connector is a new feature that greatly simplifies the process of configuring [Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet) for your applications running on AKS. [Workload Identity](https://learn.microsoft.com/entra/workload-id/workload-identities-overview) is a feature that allows you to assign an identity to a Pod and use that identity to authenticate with Microsoft Entra ID to access Azure services.

<div class="info" data-title="Note">

> Workload Identity is the recommended way to authenticate with Azure services from your applications running on AKS. It is more secure than using service principals and does not require you to manage credentials in your application. To read more about the implementation of Workload Identity for Kubernetes, see [this doc](https://azure.github.io/azure-workload-identity/docs/).

</div>

In the Azure portal, navigate to the AKS cluster you created earlier. In the left-hand menu, click on **Service Connector (Preview)** under **Settings** then click on the **+ Create** button.

![Azure portal AKS service connector](./assets/azure-portal-aks-service-connector.png)

In the **Basics** tab, enter the following details:

- **Kubernetes namespace**: Enter **default**
- **Service type**: Select **Service Bus**

Leave the rest of the fields as their default values and click **Next: Authentication**.

In the **Authentication** tab, select the **Workload Identity** option and select the user-assigned managed identity you created earlier.

Click **Next: Networking** then click **Next: Review + create** and finally click **Create**.

<div class="info" data-title="Info">

> This process will take a few minutes as the Service Connector does some work behind the scenes to configure Workload Identity for the order-service application. Some of the tasks include assigning the proper Azure role permissions to the [managed identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) to access the Service Bus, creating a [Federated Credential](https://learn.microsoft.com/entra/workload-id/workload-identity-federation) to establish trust between the Kubernetes cluster and the managed identity, creating a Kubernetes [ServiceAccount](https://kubernetes.io/docs/concepts/security/service-accounts/) with a link back to the managed identity, and finally creating a Kubernetes [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) with the Service Bus endpoint information.

</div>

Once the Service Connector for Azure Service Bus has been created, you can configure the order-service application to use the Service Bus connection details.

In the Service Connector page, select the checkbox next to the Service Bus connection and click the **Yaml snippet** button.

![Azure portal AKS service connector yaml snippet](./assets/azure-portal-aks-service-connector-yaml-snippet.png)

In the **YAML snippet** window, select **Kubernetes Workload** for **Resource type**, then select **order-service** for **Kubernetes Workload**.

![Azure portal AKS service connector yaml snippet for order-service](./assets/azure-portal-aks-service-connector-yaml-snippet-order-service.png)

You will see the YAML manifest for the order-service application with the highlighted edits required to connect to Azure Service Bus via Workload Identity.

Click **Apply** to apply the changes to the order-service application. This will redeploy the order-service application with the new connection details. But since the original order-service deployment was created specifically to connect to RabbitMQ, we need to update the deployment to remove some of the RabbitMQ specific information.

The order-service is designed to use multiple authentication methods. We need to add one environment variable to the order-service deployment to tell it to connect to the Azure Service Bus using workload identity.

Run the following command to patch the order-service deployment.

```bash
# add the USE_WORKLOAD_IDENTITY_AUTH environment variable
kubectl patch deployment order-service --type='json' -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/env/-",
    "value": {
      "name": "USE_WORKLOAD_IDENTITY_AUTH",
      "value": "true"
    }
  }
]'

# remove the RabbitMQ specific environment variables
kubectl patch deployment order-service --type='json' -p='[
  { "op": "remove", "path": "/spec/template/spec/containers/0/env/3" },
  { "op": "remove", "path": "/spec/template/spec/containers/0/env/2" },
  { "op": "remove", "path": "/spec/template/spec/containers/0/env/1" },
  { "op": "remove", "path": "/spec/template/spec/containers/0/env/0" }
]'

# remove the RabbitMQ init container
kubectl patch deployment order-service --type='json' -p='[
  { "op": "remove", "path": "/spec/template/spec/initContainers" }
]'
```

<div class="info" data-title="Info">

> The `USE_WORKLOAD_IDENTITY_AUTH` environment variable is used to tell the order-service application to use Workload Identity to authenticate with Azure Service Bus. The other environment variables are removed because they are specific to RabbitMQ.

</div>

With Azure Service Bus in place, RabbitMQ isn't needed anymore, so run the following commands to delete it.

```bash
kubectl delete statefulset rabbitmq
kubectl delete service rabbitmq
```

Browse to the store-front application again, add an item to the cart, and checkout, you should see the order appear in the Azure Service Bus queue. To view the message in the queue, you can use the Azure portal or the Azure CLI.

```bash
# get the service bus namespace name
SERVICEBUS_NAME=$(az servicebus namespace list -g $RG_NAME --query "[0].name" -o tsv)

# get the active message count in the orders queue
az servicebus queue show --resource-group $RG_NAME --namespace-name $SERVICEBUS_NAME --name orders --query "countDetails"
```

You should see 1 active message count in the queue.

---

# Application and Cluster Scaling

In a enterprise production environment, the demands and resource usage of your workloads running on Azure Kubernetes Service (AKS) can be dynamic and change frequently. If your application requires more resources, it could be impacted due to the lack of clusters resources. One of the easiest ways to ensure your applications have enough resources from the cluster, is to scale your cluster to include more working nodes.

There are several scenarios that would require your application and/or cluster the need to scale. If your application needs to respond to increased demand, we can scale your application across the cluster to meet demand. If your application has used all of the available resources from the cluster, we can scale the number of nodes in the cluster to meet demand as well.

We will walk through the most popular options that allow you to scale your application and cluster to meet your workload demands.

## Manually scaling your cluster

Manually scaling your cluster gives you the ability to add or remove additional nodes to the cluster at any point in time, adding additional hardware resources to your cluster. Using manual scaling is good for dev/test and/or small production environments where reacting to changing workload utilization is not that important. In most production environments, you will want to set policies based on conditions to scale your cluster in a more automated fashion. Manually scaling you cluster gives you the ability to scale your cluster at the exact time you want, but your applications could potentially be in a degraded and/or offline state while the cluster is scaling up.

With AKS Automatic, system pods and other critical components of the cluster are deployed to a system node pool. This node pool is managed by AKS and is not recommended to be scaled manually. Workloads like the AKS store demo app you deployed earlier are deployed to special nodes that are managed by a different feature of AKS and more on that later.

Run the following command to view the current count of the system node pool.

```bash
az aks show \
  --resource-group $RG_NAME \
  --name $AKS_NAME \
  --query "agentPoolProfiles[].{count: count, name: name}"
```

<div class="important" data-title="Important">

> You could scale the system node pool by running the following command, but this may not be available in the future for AKS Automatic clusters.
>
> ```bash
> az aks scale  \
>   --resource-group $RG_NAME \
>   --name $AKS_NAME \
>   --node-count 4 \
>   --nodepool-name systempool
> ```

</div>

## Manually scaling your application

In addition to you being able to manually scale the number of nodes in your cluster to add additional hardware resources, you can also manually scale your application workloads deployed in the cluster. In the scenario where your application is experiencing a lot of transactions, such as client interactions or internal API processing, you can manually scale the deployment to increase the number of replicas (instances) running to handle additional load.

In the following example, we will view the current number of replicas running for the **store-front** service and then increase the number of replicas to 10.

View the current number of replicas for the **store-front** service

```bash
kubectl get deployment store-front
```

Notice that there is currently only 1 replica running of the **store-front** service. Run the following command to scale the number of replicas for the store-front service to 10.

```bash
kubectl scale deployment store-front --replicas=10
```

Scaling to 10 replicas may take a moment. You can view the increased number of replicas by watching the **store-front** deployment.

```bash
kubectl get deployment store-front -w
```

When you see **READY** and **AVAILABLE** number of replicas as 10, press **Ctrl+C** to stop watching the deployment.

The number of replicas represent the number of Pods running for the **store-front** service. You can view the Pods running for the **store-front** service by running the following command.

```bash
kubectl get pods --selector app=store-front
```

Scale the replica count of the **store-front** service back to 1.

```bash
kubectl scale deployment store-front --replicas=1
```

## Automatically scaling your application

To automatically scale your deployments, you can use the [Horizontal Pod Autoscaler (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) resource. This is a better approach to scale you application, as it allows you to automatically scale a workload based on the resource utilization of the Pods in the Deployment. The resource utilization is based on the CPU and memory requests and limits set in the Pod configuration, so it is important to set these values correctly to ensure the HPA can scale your application correctly.

Let's first take a look and view the current CPU and memory requests and limits for the **store-front** deployment.

```bash
kubectl describe deployment store-front | grep -A 2 -E "Limits|Requests"
```

A description of the **store-front** deployment is returned. Under the Pod Template\Containers section, you should see the following limits and requests:

```yaml
Limits:
  cpu: 1
  memory: 512Mi
Requests:
  cpu: 1m
  memory: 200Mi
```

This configuration tells the Kubernetes scheduler to allocate up to 1 CPU and up to 512Mi of memory to the Pod. The Pod will be allocated at least 1m of CPU and 200Mi of memory. The HPA will use these values to determine when to scale the number of replicas of the **store-front** deployment.

The simplest way to create an HPA is to use the `kubectl autoscale` command. Run the following command to create an HPA for the **store-front** deployment that will allow the HPA controller to increase or decrease the number of Pods from 1 to 10, based on the Pods keeping an average of 50% CPU utilization.

```bash
kubectl autoscale deployment store-front --cpu-percent=50 --min=1 --max=10
```

We can then verify that an HPA resource exists for the **store-front** deployment.

```bash
kubectl get hpa store-front
```

You may notice that the HPA autoscaler has already added an additional replica (instance) of the **store-front** deployment to meet the HPA configuration.

We will now deploy an application to simulate additional client load to the **store-front** deployment. Run the following command to deploy a Pod that will generate additional load to the **store-front** deployment.

```bash
kubectl run load-generator --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://store-front; done"
```

Take a look at the HPA resource for the **store-front** deployment to see if we have increased the need for replicas to meet the resource configuration.

```bash
kubectl get hpa store-front
```

You should see that the load generating application forced the automatic scaling of the **store-front** deployment to reach the maximum replica limit of 10.

```bash
NAME          REFERENCE                TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
store-front   Deployment/store-front   225%/50%   1         10        10         6m15s
```

Terminate the load generating Pod by running the following command.

```bash
kubectl delete pod load-generator --wait=false
```

Remove the HPA configuration for the **store-front** deployment by running the following command.

```bash
kubectl delete hpa store-front
```

## Automatically scaling your cluster

So far as it relates to scaling, we have seen how to manually scale the cluster nodes, to allow more access to hardware recourses for running workloads, manually scaling your workload deployments to increase the number of instances of your application, and we have also seen how you can create an HPA autoscaler for your application workload deployment that will automatically scale your application depending on the amount of resources it utilizes.

One thing to note, even though an HPA resource will automate the scaling of your application deployment, based on resource utilization, your application can still be affected if your cluster resources are exhausted. At that point, you will need to manually scale the number of nodes in the cluster to meet application demand.

There is a more preferred approach and method for scaling your cluster that takes into account both the resource needs of your application and the cluster nodes utilization known as the Node Autoprovisioning (NAP) component. NAP is based on the Open Source [Karpenter](https://karpenter.sh/) project, and the [AKS provider](https://github.com/Azure/karpenter-provider-azure), which is also Open Source. NAP will automatically scale your cluster node pool to meet the demands of your application workloads, not only with additional nodes, but will find the most efficient VM configuration to host the demands of your workloads.

To show how Node Autoprovisioning work, we will first scale down the node pool to have a single node.

First we will check to see if NAP is configured for the cluster. Run the following command in the terminal.

```bash
az aks show \
  --resource-group $RG_NAME \
  --name $AKS_NAME \
  --query "nodeProvisioningProfile"
```

You should see mode is set to **Auto**.

<div class="important" data-title="Important">

> The `nodeProvisioningProfile` property is currently available in preview versions of the Azure resource provider APIs, so you will need to install the `aks-preview` extension within Azure CLI to view the property.
>
> ```bash
> az extension add --name aks-preview
> ```

</div>

To activate NAP, run the following command to manually scale the **store-front** Deployment again.

```bash
kubectl scale deployment store-front --replicas=100
```

This should start to exhaust the currently single node and trigger NAP to auto provision additional nodes in the node pool to support the resource demand.

If you run the following command, you should see some of the Pods for the **store-front** deployment are in a **Running** state and some are in a **Pending** state.

```bash
kubectl get pod --selector app=store-front -o wide
```

Note the **NODE** column to see which node the Pods are running on. Notice that the Pods that are in a **Pending** state are waiting for additional nodes to be provisioned by NAP.

Run the following command to check the status of the nodes in the cluster.

```bash
kubectl get nodes -w
```

After a few minutes, you should see additional nodes being created to support the resource demand of the **store-front** deployment.

## Using KEDA to manage HPA

In the previous section, we saw how to use the Horizontal Pod Autoscaler (HPA) to automatically scale your application based on resource utilization. The HPA is a great way to scale your application based on CPU and memory utilization, but what if you want to scale your application based on other metrics like the number of messages in a queue, the length of a stream, or the number of messages in a topic?

The [Kubernetes Event-driven Autoscaling (KEDA)](https://keda.sh/) project is a Kubernetes-based Event-Driven Autoscaler. KEDA allows you to scale your application workloads based on the number of events in a queue, the length of a stream, or the number of messages in a topic. KEDA can be installed manually in your AKS cluster but it is also available as an add-on to AKS and is automatically enabled in AKS Automatic clusters. When you use the AKS add-on for KEDA, it will be fully supported by Microsoft.

In order to use KEDA, you can deploy a [ScaledObject](https://keda.sh/docs/2.15/reference/scaledobject-spec/) resource to scale long-running applications or deploy a [ScaledJob](https://keda.sh/docs/2.15/reference/scaledjob-spec/) resource to scale batch jobs. A ScaledObject is a custom resource that defines how to scale a deployment based on an external metric. The ScaledObject will watch the external metric and scale the deployment based on the metric value.

Having to learn and write the ScaledObject resource manifest can be a bit challenging, so AKS provides a simpler way to create a ScaledObject resource using the Azure portal. In the Azure portal, navigate to the AKS cluster you created earlier. In the left-hand menu, click on **Application scaling** under **Settings** then click on the **+ Create** button.

![Azure portal AKS application scaling](./assets/azure-portal-aks-application-scaling.png)

In the **Basics** tab, enter the following details:

- **Name**: Enter **store-front**
- **Namespace**: Select **default**
- **Target workload**: Select **store-front**
- **Minimum replicas**: Enter **1**
- **Maximum replicas**: Enter **10**
- **Trigger type**: Select **CPU**

Leave the rest of the fields as their default values and click \*_Next_.

In the **Review + create** tab, click **Customize with YAML** to view the YAML manifest for the ScaledObject resource.

![Azure portal AKS application scaling yaml](./assets/azure-portal-aks-application-scaling-yaml.png)

You can see the YAML manifest the AKS portal generated for the ScaledObject resource. Here you can add additional configuration to the ScaledObject resource if needed.

![Azure portal AKS application scaling yaml manifest](./assets/azure-portal-aks-application-scaling-yaml-manifest.png)

Click **Save and create** to create the ScaledObject resource.

Header over to the **Workloads** section in the left-hand menu and click on **Deployments**. In the **Filter by deployment name** field, enter **store-front** to view the **store-front** Deployment. You should see the **store-front** Deployment is now running 2 replicas.

Also, if you run the following command, you should see a HPA resource named **keda-hpa-store-front** which KEDA created and is managing for the **store-front** Deployment.

```bash
kubectl get hpa
```

This was a simple example of using using KEDA. But using KEDA over the HPA for CPU and memory utilization doesn't give you lot to differentiate the experience. The real power of KEDA comes from its ability to scale your application based on external metrics like the number of messages in a queue, the length of a stream, the number of messages in a topic, or based on a custom schedule using CRON expressions. There are many [scalers](https://keda.sh/docs/2.15/scalers/) available for KEDA that you can use to scale your application based on a variety of external metrics.

---

# Observability

Monitoring and observability are key components of running applications in production. With AKS Automatic, you get a lot of monitoring and observability features enabled out-of-the-box. If you recall from the beginning of the workshop, we created an [Azure Log Analytics Workspace](https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview) with [Container Insights](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-overview) to collect application logs, [Azure Monitor Managed Workspace](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli) to with [Prometheus recording rules](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-default) enabled to capture metrics from workloads within the cluster, and [Azure Managed Grafana](https://azure.microsoft.com/products/managed-grafana) to visualize the metrics.

## Cluster observability

In the Azure portal, navigate to the AKS cluster you created earlier. In the left-hand menu, scroll down to the **Monitoring** section and click on **Insights**. Here you can see a high-level overview of how the cluster is performing.

![Azure portal cluster metrics](./assets/azure-portal-cluster-metrics.png)

The AKS Automatic cluster was also pre-configured with basic CPU utilization and memory utilization alerts. You can also create additional alerts based on the metrics collected by the Prometheus workspace.

Click on the **Recommended alerts (Preview)** button to view the recommended alerts for the cluster. Expand the **Prometheus community alert rules (Preview)** section to see the list of Prometheus alert rules that are available. You can enable any of these alerts by clicking on the toggle switch.

![Azure portal cluster alerts](./assets/azure-portal-cluster-alerts.png)

Click save to enable the alerts.

## Workbooks and logs

With Container Insights enabled, you can query the logs using Kusto Query Language (KQL) and create custom workbooks to visualize the data. One nice feature of Container Insights is having pre-configured workbooks that you can use to monitor your cluster and applications without having to write any queries.

In the **Monitoring** section of the AKS cluster left-hand menu, click on **Workbooks**. Here you will see a list of pre-configured workbooks that you can use to monitor your cluster.

![Azure portal AKS workbooks](./assets/azure-portal-aks-workbooks.png)

One workbook that is particularly useful is the **Cluster Optimization** workbook. This workbook can help you identify anomalies and detect application probe failures in addition to providing guidance on optimizing container resource requests and limits. Click on the **Cluster Optimization** workbook to view the details.

![Azure portal AKS cluster optimization workbook](./assets/azure-portal-aks-cluster-optimization-workbook.png)

Take some time to explore the other workbooks available in the list.

<div class="tip" data-title="Tip">

> The workbook visuals will include a query button that you can click to view the KQL query that powers the visual. This is a great way to learn how to write your own queries.

</div>

If you click on the **Logs** section in the left-hand menu, you can view the logs collected by Container Insights. Here, you can write your own KQL queries or run pre-configured queries to logs from your cluster and applications. If you expand the **Logs** menu, click on **Queries**, and scroll down to the **Container Logs** section, you will see a list of pre-configured queries that you can run. Click on a query and click **Run** to view the results.

![Azure portal AKS logs queries](./assets/azure-portal-aks-container-logs.png)

You can also view live streaming logs for a specific container by clicking on the **Workloads** section in the left-hand menu. In the **Deployments** tab, scroll down and locate the **order-service** deployment. Click on the **order-service** deployment to view the details. In the left-hand menu, click on **Live logs**, then select the Pod you want to view logs for.

![Azure portal AKS live logs](./assets/azure-portal-aks-live-logs.png)

This is the equivalent of running `kubectl logs -f <pod-name>` in the terminal.

## Visualizing metrics with Grafana

The Azure Portal provides a great way to view metrics and logs, but if you prefer to visualize the data using Grafana, or execute complex queries using PromQL, you can use the Azure Managed Grafana instance that was created with the AKS Automatic cluster.

In the AKS cluster's left-hand menu, click on **Insights** under the **Monitoring** section and click on the **View Grafana** button at the top of the page. This will open a window with the linked Azure Managed Grafana instance. Click on the **Browse dashboards** link. This will take you to the Azure Managed Grafana instance.

![Azure portal AKS browse dashboards](./assets/azure-portal-aks-browse-dashboards.png)

In the Grafana home page, click on the **Dashboards** link in the left-hand menu. Here you will see a list of pre-configured dashboards that you can use to visualize the metrics collected by the Prometheus workspace.

![Azure portal AKS Grafana dashboards](./assets/grafana-homepage.png)

In the **Dashboards** list, expand the **Azure Managed Prometheus** folder and explore the dashboards available.

![Azure portal AKS Grafana dashboards list](./assets/grafana-dashboards.png)

Each dashboard provides a different view of the metrics collected by the Prometheus workspace with controls to allow you to filter the data.

Click on a **Kubernetes / Compute Resources / Workload** dashboard. Filter the **namespace** to `default` the **type** to `deployment`, and the **workload** to `order-service`. This will show you the metrics for the order-service deployment.

![Azure portal AKS Grafana dashboard](./assets/grafana-dashboard-workload-order-service.png)

## Querying metrics with PromQL

If you prefer to write your own queries to visualize the data, you can use the **Explore** feature in Grafana. In the Grafana home page, click on the **Explore** link in the left-hand menu, and select the **Managed_Prometheus_defaultazuremonitorworkspace** data source.

The query editor supports a graphical query builder and a text-based query editor. The graphical query builder is a great way to get started with PromQL. You can select the metric you want to query, the aggregation function, and any filters you want to apply.

![Azure portal AKS Grafana explore](./assets/grafana-explore.png)

## Importing dashboards

If none of the pre-configured dashboards meet your needs, you can import a dashboard from the [Grafana community](https://grafana.com/grafana/dashboards/?search=azure). In fact, many of the pre-configured Azure dashboards were imported from the Grafana community for you when the Azure Managed Grafana instance was created.

To import a dashboard, navigate to the **Dashboards** page in Grafana, click on the **New** button, then click on **Import**.

![Azure portal AKS Grafana import dashboard](./assets/grafana-import-dashboard.png)

You can import a dashboard by providing the dashboard ID or by uploading a JSON file. To import a dashboard from the Grafana community, you will need to provide the dashboard ID. For example, the dashboard ID for the [Kubernetes / ETCD](https://grafana.com/grafana/dashboards/20330-kubernetes-etcd/) dashboard is `20330`.

<div class="info" data-title="Note">

> The **Kubernetes / ETCD dashboard** allows you to monitor the AKS control plane components. In order to see data in this dashboard, you will need to have the `AzureMonitorMetricsControlPlanePreview` feature enabled in your Azure subscription prior to creating your AKS cluster. See the [documentation](https://learn.microsoft.com/en-us/azure/aks/monitor-aks) for more information.

</div>

![Grafana dashboard](./assets/grafana-dashboard-id.png)

Simply copy the dashboard ID, paste it into the **Grafana.com dashboard URL or ID** field, and click **Load**. This will import the dashboard into your Azure Managed Grafana instance.

![Azure portal AKS Grafana import dashboard ID](./assets/grafana-import-etcd-dashboard.png)

<div class="tip" data-title="Tip">

> To view the full list of dashboards available in the Grafana community written by the Azure team, visit the [Azure Grafana dashboards](https://grafana.com/orgs/azure) page.

</div>

---

# CI/CD with Automated Deployments

Up until this point, you've been using either kubectl or the Azure portal to deploy applications to your AKS cluster and/or edit configurations. This is fine for manual deployments, but in a production environment, you would want to automate the deployment process. This is where Continuous Integration and Continuous Deployment (CI/CD) pipelines come in. With CI/CD pipelines, you can automate the process of building, testing, and deploying your applications to your AKS cluster.

With AKS, the [Automated Deployments](https://learn.microsoft.com/azure/aks/automated-deployments) feature allows you to create [GitHub Actions workflows](https://docs.github.com/actions) that allows you to start deploying your applications to your AKS cluster with minimal effort. All you need is a GitHub repository with your application code. If you have Dockerfiles or Kubernetes manifests in your repository, that's great, you can simply point to them in the Automated Deployments setup. But the best part is that you don't even need to have Dockerfiles or Kubernetes manifests in your repository. Automated Deployments can create them for you.

## Fork a sample repository

In this section, you will fork a sample repository that contains a simple Node.js application.

In your browser, navigate to the [contoso-air](https://github.com/pauldotyu/contoso-air) repo and click the **Fork** button in the top right corner of the page.

![GitHub fork button](./assets/github-fork.png)

<div class="info" data-title="Note">

> Make sure you are logged into your GitHub account before forking the repository.

</div>

## Automated Deployments setup

In the Azure portal, navigate to the AKS cluster you created earlier. In the left-hand menu, click on **Automated Deployments** under the **Settings** section. Click on the **+ Create** button, then click **Automatically containerize and deploy** button.

![Azure portal Automated Deployments](./assets/azure-portal-automated-deployments.png)

In the **Repository** tab, fill in the following details:

- **Workflow name**: Enter `contoso-air`
- **Repository location**: Authenticate to your GitHub account
- **Repository source**: Select the **My repositories** radio button
- **Repository**: Select the **contoso-air** repository you forked earlier
- **Branch**: Select the **main** branch

Click **Next: Image**.

In the **Image** tab, fill in the following details:

**Dockerfile configuration**:

- **Application environment**: Select **JavaScript - Node.js 20**
- **Application port**: Enter **3000**
- **Dockerfile build context**: Enter `./src/frontend`

**Registry details**:

- **Azure Container Registry**: Select the Azure Container Registry you created earlier
- **Azure Container Registry image**: Enter `contoso-air`

Click **Next: Deployment details**.

In the **Deployment details** tab, fill in the following details:

- **Namespace**: Select `default`

Click **Next: Review** then click **Next: Deploy**.

After a minute or so, the deployment will complete and you will see a success message. Click on the **Approve pull request** button to approve the pull request that was created by the Automated Deployments workflow.

![Azure portal Automated Deployments success](./assets/azure-portal-automated-deployments-success.png)

## Review the pull request

You will be taken to the pull request page in your GitHub repository. Click on the **Files changed** tab to view the changes that were made by the Automated Deployments workflow.

Navigate back to the **Conversation** tab and click on the **Merge pull request** button to merge the pull request, then click **Confirm merge**.

![GitHub merge pull request](./assets/github-merge-pull-request.png)

With the pull request merged, the changes will be automatically deployed to your AKS cluster. You can view the deployment logs by clicking on the **Actions** tab in your GitHub repository.

![GitHub Actions tab](./assets/github-actions-tab.png)

In the **Actions** tab, you will see the Automated Deployments workflow running. Click on the workflow run to view the logs.

![GitHub Actions workflow run](./assets/github-actions-workflow-run.png)

In the workflow run details page, you can view the logs of each step in the workflow by simply clicking on the step.

![GitHub Actions workflow logs](./assets/github-actions-workflow-logs.png)

After a few minutes, the workflow will complete and you will see two green check marks next to the **buildImage** and **deploy** steps. This means that the application has been successfully deployed to your AKS cluster.

## View the deployed application

In the Azure portal, navigate to the AKS cluster you created earlier. In the left-hand menu, click on **Services and ingresses** under the **Kubernetes resources** section. You should see a new service called `contoso-air` with a public IP address assigned to it. Click on the IP address to view the deployed application.

![Azure portal AKS services](./assets/azure-portal-aks-services-contoso-air.png)

With this setup, every time you push application code changes to your GitHub repository, the GitHub Action workflow will automatically build and deploy your application to your AKS cluster.

---

# Summary

In this workshop, you learned how to create an AKS cluster with the new AKS Automatic feature. You deployed a sample application to the cluster and explored some of the features that AKS Automatic provides. You learned how to scale your cluster manually and automatically using the Horizontal Pod Autoscaler and KEDA. You also learned how to handle stateful workloads using Persistent Volumes and Azure Service Bus. Finally, you explored the monitoring and observability features of AKS Automatic.

To learn more about AKS Automatic, visit the [AKS documentation](https://learn.microsoft.com/azure/aks/intro-aks-automatic).

In addition to this workshop, you can also explore the following resources:

- [Azure Kubernetes Service (AKS) documentation](https://learn.microsoft.com/azure/aks)
- [Kubernetes: Getting started](https://azure.microsoft.com/solutions/kubernetes-on-azure/get-started/)
- [Learning Path: Introduction to Kubernetes on Azure](https://learn.microsoft.com/training/paths/intro-to-kubernetes-on-azure/)
- [Learning Path: Deploy containers by using Azure Kubernetes Service (AKS)](https://learn.microsoft.com/training/paths/deploy-manage-containers-azure-kubernetes-service/)

If you have any feedback or suggestions for this workshop, please feel free to open an issue or pull request in the [GitHub repository](https://github.com/Azure-Samples/aks-labs)
