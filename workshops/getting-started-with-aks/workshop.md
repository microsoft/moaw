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
wt_id: WT.mc_id=containers-147656-pauyu
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

There are several ways to deploy an AKS cluster, including the Azure Portal, Azure CLI, ARM templates, Azure Bicep, Terraform, and Pulumi, among others. While there are no shortages of ways to deploy an AKS cluster, we will focus on the Azure Portal and Azure CLI in this workshop.

## Familiarize yourself with AKS Presets in portal

Open a browser and navigate to the [Azure Portal](https://portal.azure.com). Login with your Azure credentials.

In the search bar at the top of the portal, start typing **kubernetes** and you will start to see a list of services, marketplace items, and resources that match your search. Under **Services** click on **Kubernetes services**.

![](https://placehold.co/800x400)

In the **Kubernetes services** screen, click on the **Create** drop down and then click on **Kubernetes cluster**.

![](https://placehold.co/800x400)

You should now see the **Create Kubernetes cluster** screen. This is where you can create a new AKS cluster.

Across the top of the screen, you'll notice a series of tabs. Under **Cluster details** in the **Basics** tab, you'll see the **Cluster preset configuration**. This is where you can choose from a series of presets that will automatically configure your AKS cluster based on your workload requirements.

![](https://placehold.co/800x400)

Click the **Compare presets** link to see the differences between the presets.

![](https://placehold.co/800x400)

You should see a table that lists all the presets and the differences between them. By default, the **Production Standard** preset is selected.

Click **Cancel** to back out of the cluster preset comparison window.

![](https://placehold.co/800x400)

You will also notice that the cluster preset can be selected from the drop down menu. Toggle between **Dev/Test** and **Production Enterprise** to see the differences between the presets.

![](https://placehold.co/800x400)

Going back to the tabs at the top of the screen, click through the **Node pools**, **Networking**, **Integrations**, **Monitoring**, and **Advanced** tabs to see additional configuration options available to you.

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

- **Subscription:** Select your Azure subscription. 

  <div class="info" data-title="Note">

  > You may see a message that the subscription does not have the flags: EnableAPIServerVnetIntegrationPreview, NRGLockdownPreview, NodeAutoProvisioningPreview, DisableSSHPreview, SafeguardsPreview, AutomaticSKUPreview registered. Preview features must be registered in order to create a cluster so go ahead and click the **Register preview features** link to register the required flags in your subscription.

  </div>

- **Resource group:** Create a new resource group or use an existing one.
- **Kubernetes cluster name:** Enter a name for your cluster.
- **Region:** Select the desired region where you want to deploy your cluster.

  <div class="info" data-title="Note">

  > You need to ensure you have 32 vCPU quota for Standard_DSv2 available in the region you are deploying the cluster to. If you don't have enough quota, you can request a quota increase.

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

Typically, you would use the kubectl command line tool to interact with a Kubernetes cluster. The kubectl tool is your direct line of communication with the kube-apiserver. Access to the kube-apiserver is controlled by the kubeconfig file. The kubeconfig file contains the necessary information to authenticate and the Azure CLI for AKS has a handy command to get the kubeconfig file for your AKS cluster.

Open the Azure Cloud Shell and run the following command to set up local variables.

<div class="info" data-title="Note">

> If this is your first time opening Azure Cloud Shell, be sure to click the **Bash** button when asked presented with the environment selector as all command line instructions in this workshop are intended to be run in a POSIX shell. You may also be asked to create a storage account for your Cloud Shell. Go ahead and select **No storage account required**, then select your subscription and click **Apply**.

![](https://placehold.co/800x400)

> If you do not use a storage account for your Cloud Shell, you will have to pull down the kubeconfig file when the shell is closed and re-opened or when the session times out.

</div>

Set an environment variable to store the name of your resource group.

```bash
RG_NAME=<resource-group-name>
```

<div class="info" data-title="Note">

> Be sure to replace `<resource-group-name>` with your resource group name.

</div>

Run the following command to get the name of your AKS cluster.

```bash
AKS_NAME=$(az aks list -g $RG_NAME --query "[0].name" -o tsv)
```

Run the following command to download the kubeconfig file for your AKS cluster.

```bash
az aks get-credentials --resource-group $RG_NAME --name $AKS_NAME
```

Now you should be able to run kubectl commands against your AKS cluster.

```bash
kubectl cluster-info
```

AKS Automatic clusters are secured by default. It uses Microsoft Enter ID authentication with Azure RBAC for cluster access, so simply downloading the kubeconfig file is not enough to access the cluster. You also need to authenticate with Microsoft Entra ID and have the necessary permissions to access the cluster. When you created the AKS Automatic cluster, you were automatically granted the **Azure Kubernetes Service RBAC Cluster Admin** role assignment to access the cluster. Therefore, when running a kubectl command for the first time, you will be presented with a login prompt. Follow the instructions on the screen and proceed with the authorization process and the kubectl command will be executed. As your authentication token expires, you will be prompted to re-authenticate.

Your cluster is almost ready to go... but not quite yet. Next up, we need to prepare the cluster for our application containers.

## Container Registries

Kubernetes is a container orchestrator. It will run whatever container image you tell it to run. Containers can be pulled from public container registries like Docker Hub or GitHub Container Registry (GHCR), or they can be pulled from private container registries like Azure Container Registry (ACR). Pulling images from a public registry is fine for development and testing but for production workloads, you'll want to use a private registry and only deploy images that have been scanned for vulnerabilities and approved.

Azure Container Registry is a managed, private Docker registry service based on the open-source Docker Registry 2.0. It is highly available and scalable across Azure regions across the globe. It also integrates with Microsoft Entra ID for authentication and authorization so it makes it easy to secure your container images.

### Deploy Azure Container Registry (ACR)

In the Azure Cloud Shell, run the following command to create an environment variable for your new Azure Container Registry name.

```bash
ACR_NAME=<acr-name>
```

<div class="info" data-title="Note">

> Be sure to replace `<acr-name>` with a new unique name for your Azure Container Registry. The name for an ACR resource may contain alphanumeric characters only and must be between 5 and 50 characters long.

</div>

Run the following command to create a new Azure Container Registry.

```bash
az acr create --resource-group $RG_NAME --name $ACR_NAME --sku Basic
```

### Attach ACR to AKS cluster

With the Azure Container Registry created, you need to "attach" it to your AKS cluster. This will allow your AKS cluster to pull images from the Azure Container Registry by granting the AKS resource's managed identity the **AcrPull** role on the Azure Container Registry.

```bash
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

## Updating Deployment manifests

Before we deploy the manifest, we need to make a few changes. The manifest in the repo references the images on GHCR. We need to replace the image references with the images we imported to ACR.

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

Apply the manifest

```bash
kubectl apply -f aks-store-quickstart.yaml
```

<div class="info" data-title="Note">

> The deployment can take up to 7 minutes to schedule pods onto a new node.

</div>

Run the following command to check the status of the pods.

```bash
kubectl get pods
```

When all the pods are in the **Running** state, you can proceed to the next step.

## Getting familiar with the demo app

Now, let's explore the store app. Run the following command to get the public IP address of the **store-front** service.

```bash
echo "http://$(kubectl get svc/store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the link in the terminal, and you should be taken to the product page of the AKS pet store. Here a user can browse products, add items to a shopping cart, and checkout. The checkout process is intentionally simple and does not require any payment information. The order is saved to a RabbitMQ message queue.

Add an item to the cart and checkout by clicking on the cart link in the upper right corner. You should see a confirmation message that the order was successfully placed.

![](https://placehold.co/800x400)

## Deployments and Services

Now that we've seen the store app in action, let's take a closer look at the resources that were created when we applied the manifest to the Kubernetes cluster.

Run the following command to view the contents of the YAML file.

```bash
less aks-store-quickstart.yaml
```

<div class="info" data-title="Note">

> You can click the **up** or **down** arrow keys to scroll through the file. Press **q** to exit the **less** command.

</div>

If we look at the YAML file, we can see that it contains a Deployment and Service resource for each of the three services: store-front, order-service, and product-service. It also contains a StatefulSet, service, and ConfigMap resource for RabbitMQ. 

Each Deployment resource specifies the container image to use, the ports to expose, environment variables, and resource requests and limits. The Deployment resource was not originally part of Kubernetes but was introduced to make it easier to manage ReplicaSets. A ReplicaSet is a resource that ensures a specified number of pod replicas are running at any given time and no longer commonly used in favor of Deployments.

The Service resources expose the deployments to the cluster and the outside world. A StatefulSet is a resource that manages a set of identical pods with persistent storage and commonly used for stateful applications like databases.

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
kubectl get service store-front
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

> This Ingress resource is very similar to a typical NGINX Ingress resource. The only difference is the `ingressClassName` field. The `ingressClassName` field is set to `webapprouting.kubernetes.azure.com` which enables the AKS App Routing Add-on to manage this resource.

</div>

Wait a minute or two for the ingress to be created, then run the following command to get the public IP address of the ingress.

```bash
echo "http://$(kubectl get ingress store-front -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
```

Click the link in the terminal and you should be taken to the product page of the AKS pet store, this time using the Ingress to access the store-front service!

It is also worth mentioning that the App Routing Add-on does a little more than just manage the NGINX Ingress Controller. It also provides integration with Azure DNS for automatic DNS registration and management and Azure Key Vault for automatic TLS certificate management. Check out the [App Routing Add-on documentation](https://learn.microsoft.com/azure/aks/app-routing?tabs=default%2Cdeploy-app-default) for more information.

---

# Application Resiliency

As mentioned above Kubernetes Deployments is a resource that manages ReplicaSets and it has a way to manage application updates and rollbacks. This greatly improves the resiliency of your application.

## Deployment Update Strategy

There is a link between Deployment and ReplicaSet resources. When you create a Deployment, Kubernetes creates a ReplicaSet for you and the link can be seen by running the following command:

```bash
# get the name of the store-front ReplicaSet
STORE_FRONT_RS_NAME=$(kubectl get rs --sort-by=.metadata.creationTimestamp | grep store-front | tail -n 1 | awk '{print $1}')

# get the details of the store-front ReplicaSet
kubectl get rs $STORE_FRONT_RS_NAME -o json | jq .metadata.ownerReferences
```

As you can see, the ReplicaSet resource is owned by the store-front Deployment resource. Also, note the `uid` field in the output. This is the unique identifier of the Deployment resource.

If we look at the Deployment resource, we can see the same `uid` field in the output.

```bash
kubectl get deployment store-front -o json | jq .metadata.uid
```

Additionally, when a Deployment is created, it creates a rollout history. You can view the rollout history by running the following command:

```bash
kubectl rollout history deployment store-front
```

Here you can see the revision number. We should only have a single revision since we only deployed the application once. Let's update the store-front service to use a new image and then roll back to the previous version.

### Update a Deployment

The default deployment strategy is RollingUpdate. You can see that by running the following command:

```bash
kubectl get deployments store-front -o jsonpath='{.spec.strategy.type}'
```

The RollingUpdate strategy means that Kubernetes will create a new ReplicaSet and scale it up while scaling down the old ReplicaSet. If the new ReplicaSet fails to start, Kubernetes will automatically roll back to the previous ReplicaSet.

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

### Rollback a Deployment

With Deployment rollouts, you can easily roll back to a previous version of the application. As mentioned earlier, the rollout history is stored and you can run the following command to roll back to the previous version.

```bash
kubectl rollout undo deployment/store-front
```

<div class="info" data-title="Note">

> You can also roll back to a specific revision by specifying the revision number. For example, `kubectl rollout undo deployment/store-front --to-revision=1` to select the first revision.

</div>

## Dealing with Disruptions

As you can see, Kubernetes is responsible for managing the lifecycle of your application. It can handle application updates and rollbacks. But application updates are not the only disruptions that can occur. Nodes can fail or be marked for maintenance. You need to be prepared for both voluntary and involuntary disruptions.

### Voluntary Disruptions

A voluntary disruption is a disruption that is initiated by the user. For example, you may want to scale down the number of replicas in a deployment, or you may want to evict a pod from a node to free up resources. Kubernetes has built-in mechanisms to handle these disruptions. During a voluntary disruption, Kubernetes will not evict Pods from a node.

An eviction can be harmful to your application if you are not prepared for it. When a node cordoned, no new Pods will be scheduled on the node and any existing Pod will be evicted using the Eviction API. When this happens, it doesn't matter if how many replicas you have running on a node or how many replicas will be remaining after the eviction. The Pod will be evicted and rescheduled on another node. This means you can incur downtime if you are not prepared for it.

Good news is that Kubernetes has a built-in mechanism to handle these disruptions. The PodDisruptionBudget resource allows you to specify the minimum number of Pods that must be available during a voluntary disruption. When a PodDisruptionBudget is created, Kubernetes will not evict Pods that violate the budget.

Let's see this in action. But first, we should scale our store-front deployment to have more than one replica.

```bash
kubectl scale deployment store-front --replicas=3
```

With the deployment scaled to 3 replicas, we can see which nodes the Pods are running on.

```bash
kubectl get pod --selector app=store-front -o wide 
```

You can see that the Pods are running on a single node.

<div class="info" data-title="Note">

> More on this below.

</div>

Let's grab the name of the node and cordon it.

```bash
NODE_NAME=$(kubectl get pod -l app=store-front -o jsonpath='{.items[0].spec.nodeName}')
kubectl drain $NODE_NAME --ignore-daemonsets
```

You should see a list of all the Pods that have been evicted. It doesn't matter that all 3 replicas of the store-front application were running on the node. Kubernetes will evict all the Pods with no regard.

This is where the PodDisruptionBudget comes in. A PodDisruptionBudget is a resource that specifies the minimum number of Pods that must be available during a voluntary disruption. When a PodDisruptionBudget is created, Kubernetes will not evict Pods that violate the budget

Let's create a PodDisruptionBudget for the store-front application that specifies that at least 1 Pod must be available during a voluntary disruption. This will ensure that the next time we drain a node, at least 1 Pod will remain running. Once new Pods are scheduled on other nodes, the PodDisruptionBudget will be satisfied and the remaining Pods on the node will be evicted. This is a great way to ensure that your application remains available during a voluntary disruption.

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

> You may have noticed the drained Node is no longer available in your cluster. This is because the node was unused and the AKS Node Autoprovisioning feature (aka Karpenter) automatically removed it from the cluster. More on that later.

</div>

Let's drain the node again and see what happens.

```bash
NODE_NAME=$(kubectl get pod -l app=store-front -o jsonpath='{.items[0].spec.nodeName}')
kubectl drain $NODE_NAME --ignore-daemonsets
kubectl get pod --selector app=store-front -o wide -w
```

Notice this time a warning message is displayed that the PodDisruptionBudget is preventing the eviction of the a store-front Pod on the node due to the PodDisruptionBudget violation.

Once the new node is up and running, the PodDisruptionBudget will be satisfied and the remaining Pods on the node will be evicted.

### Involuntary Disruptions

An involuntary disruption is a disruption that is not initiated by the user. For example, a node may fail and if we had all the replicas of the store-front application running on that node, we would have downtime. When running more than one replica of an application, it is important to spread the replicas across multiple nodes to ensure high availability. This is where PodAntiAffinity or PodTopologySpreadConstraints comes in.

[PodAntiAffinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) is a feature that allows you to specify that a Pod should not be scheduled on the same node as another Pod. PodAntiAffinity can be hard or soft. Hard PodAntiAffinity means that the Pods must be scheduled on different nodes. Soft PodAntiAffinity means that the Pods should be scheduled on different nodes if possible.

[PodTopologySpreadConstraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) is a feature that allows you to specify that a Pod should be spread across different zones, regions, or nodes. This is useful for ensuring high availability of your application.

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

In the `store-front-deployment.yaml` file, add the following PodAntiAffinity rule to the `spec` section of the `store-front` deployment. This rule tells the Kubernetes scheduler to spread the store-front Pods using `topologyKey: kubernetes.io/hostname` which essentially means to spread the Pods across different nodes.

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

<div class="info" data-title="Note">

> There are many `spec` items in the manifest, you want to add the code snippet above in the `spec` section that includes the `containers` field. Once you locate the correct `spec` section, add a new line after the `spec` field and just before the `containers` field and paste the code snippet.

</div>

<div class="tip" data-title="Tip">

> When done editing, press the **Ctrl + O** keys to save the file then press the Enter key. Press the **Ctrl + X** keys to exit the nano text editor.

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

# Application and Cluster Scaling

AKS Node Autoprovisioning (NAP via Karpenter) simplifies application scaling on Kubernetes by automatically adjusting the number of nodes based on workload demands. When resource needs increase, AKS NAP provisions new nodes to ensure consistent application performance, reducing the need for manual intervention and optimizing resource utilization.

Similarly, NAP efficiently scales down by removing underutilized nodes when demand decreases, cutting costs and preventing resource waste.

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
