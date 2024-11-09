---
published: true # Optional. Set to true to publish the workshop (default: false)
type: workshop # Required.
title: AKS Deep Dives # Required. Full title of the workshop
short_title: AKS Deep Dives # Optional. Short title displayed in the header
description: This is a workshop for advanced AKS scenarios and day 2 operations # Required.
level: intermediate # Required. Can be 'beginner', 'intermediate' or 'advanced'
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

## Overview

This workshop is designed to help you understand advanced Azure Kubernetes Service (AKS) concepts and day 2 operations. The workshop will cover topics such as cluster sizing and topology, advanced networking concepts, advanced storage concepts, advanced security concepts, and advanced monitoring concepts.

---

## Objectives

After completing this workshop, you will be able to:

- Deploy and manage multiple AKS clusters
- Develop secure applications using Workload Identity on AKS
- Monitor AKS clusters using Azure Managed Prometheus and Grafana
- Manage cluster updates and maintenance
- Manage costs with AKS Cost Analysis

---

## Prerequisites

Before you begin, you will need an [Azure subscription](https://azure.microsoft.com/) with permissions to create resources and a [GitHub account](https://github.com/signup). Using a code editor like [Visual Studio Code](https://code.visualstudio.com/) will also be helpful for editing files and running commands.

### Command Line Tools

Most of the workshop will be done using command line tools, so you will need to have the following tools installed:

- [Azure CLI](https://learn.microsoft.com/cli/azure/what-is-azure-cli)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Hubble CLI](https://docs.cilium.io/en/stable/observability/hubble/setup/)
- [Notation CLI]()
- [Git](https://git-scm.com/)
- Bash shell (e.g. [Windows Terminal](https://www.microsoft.com/p/windows-terminal/9n0dx20hk701) with [WSL](https://docs.microsoft.com/windows/wsl/install-win10) or [Azure Cloud Shell](https://shell.azure.com))

If you are unable to install these tools on your local machine, you can use the Azure Cloud Shell, which has most of the tools pre-installed.

### Lab Resource Setup

This workshop will require the use of multiple Azure resources such as [Azure Log Analytics](https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview), [Azure Managed Prometheus](https://learn.microsoft.com/azure/azure-monitor/essentials/prometheus-metrics-overview), [Azure Managed Grafana](https://learn.microsoft.com/azure/managed-grafana/overview), [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/general/overview), and [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/container-registry-intro). The resource deployment can take some time, so to expedite the process, we will use a [Bicep template](https://learn.microsoft.com/azure/azure-resource-manager/bicep/overview?tabs=bicep) to deploy the resources.

Using the terminal of your choice, run the following commands to set up the workshop **.env** file which will be used to store the environment variables throughout the workshop. If you are using the Azure Cloud Shell, you may encounter shell a time out loose environment variables. Therefore, writing your variables to an **.env** file will make it easier to reload them.

Set the environment variables for the resource group name and location.

<div class="important" data-title="Important">

> You must ensure the region you choose to deploy to supports [availability zones](https://learn.microsoft.com/azure/aks/availability-zones-overview) to demonstrate some of the concepts in this workshop.

</div>

```bash
cat <<EOF > .env
RG_NAME="myResourceGroup"
LOCATION="eastus"
EOF
```

Run the following command to load the local variables into the shell.

```bash
source .env
```

Run the following command and follow the prompts to log in to your Azure account using the Azure CLI.

```bash
az login --use-device-code
```

<div class="tip" data-title="Tip">

> If you are logging into a different tenant, you can use the **--tenant** flag to specify the tenant domain or tenant ID.

</div>

Run the following command to create a resource group.

```bash
az group create \
--name ${RG_NAME} \
--location ${LOCATION}
```

Run the following command to download the Bicep template file to deploy the lab resources.

```bash
curl -o main.bicep https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/main.bicep
```

Verify the contents of the **main.bicep** file by running the following command.

```bash
cat main.bicep
```

Run the following command to save your user object ID to a variable, save it to the **.env** file, and reload the environment variables.

```bash
cat <<EOF >> .env
USER_ID="$(az ad signed-in-user show --query id -o tsv)"
EOF
source .env
```

Run the following command to deploy Bicep template into the resource group.

```bash
az deployment group create \
--resource-group $RG_NAME \
--template-file main.bicep \
--parameters userObjectId=${USER_ID} \
--no-wait
```

This deployment will take a few minutes to complete. You can move on to the next section while the resources are being deployed.

---

## AKS Deployment Strategies

In this section, you will explore cluster setup considerations such as cluster sizing and topology, system and user node pools, and availability zones. You will create an AKS cluster implementing some of the best practices for production clusters. Not all best practices will be covered in this workshop, but you will have a good foundation to build upon.

### Size Considerations

Before you deploy an AKS cluster, it's essential to consider its size based on your workload requirements. The number of nodes needed depends on the number of pods you plan to run, while node configuration is determined by the amount of CPU and memory required for each pod. As you know more about your workload requirements, you can adjust the number of nodes and the size of the nodes.

When it comes to considering the size of the node, it is important to understand the types of Virtual Machines (VMs) available in Azure; their characteristics, such as CPU, memory, and disk, and ultimate the SKU that best fits your workload requirements. See the [Azure VM sizes](https://learn.microsoft.com/azure/virtual-machines/sizes/overview) documentation for more information.

<div class="info" data-title="Note">

> In your Azure subscription, you will need to make sure to have at least 32 vCPU of Standard D series quota available to create multiple AKS clusters and accommodate node surges on cluster upgrades. If you don't have enough quota, you can request an increase. Check [here](https://docs.microsoft.com/azure/azure-portal/supportability/per-vm-quota-requests) for more information.

</div>

### System and User Node Pools

When an AKS cluster is created, a single node pool is created. The single node pool will run Kubernetes system components required to run the Kubernetes control plane. It is recommended to create a separate node pool for user workloads. This separation allows you to manage system and user workloads independently.

System node pools serve the primary purpose of hosting pods implementing the Kubernetes control plane, such as **kube-apiserver**, **coredns**, and **metrics-server** just to name a few. User node pools are additional pools of compute that can be created to host user workloads. User node pools can be created with different configurations than the system node pool, such as different VM sizes, node counts, and availability zones and are added after the cluster is created.

### Resilience with Availability Zones

When creating an AKS cluster, you can specify the use of [availability zones](https://learn.microsoft.com/azure/aks/availability-zones) which will distribute control plane zones within a region. You can think of availability zones as separate data centers within a large geographic region. By distributing the control plane across availability zones, you can ensure high availability for the control plane. In an Azure region, there are typically three availability zones, each with its own power source, network, and cooling.

### Creating an AKS Cluster

Now that we have covered the basics of cluster sizing and topology, let's create an AKS cluster with multiple node pools and availability zones.

Before you create the AKS cluster, run the following command to install the aks-preview extension. This extension will allow you to work with the latest features in AKS some of which will be in preview.

```bash
az extension add --name aks-preview
```

Run the following command to set a name for the AKS cluster, save it to the **.env** file, and reload the environment variables.

```bash
cat <<EOF >> .env
AKS_NAME="myAKSCluster"
EOF
source .env
```

Run the following command to create an AKS cluster.

```bash
az aks create \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--location ${LOCATION} \
--tier standard \
--kubernetes-version 1.29 \
--os-sku AzureLinux \
--nodepool-name systempool \
--node-count 3 \
--zones 1 2 3 \
--load-balancer-sku standard \
--network-plugin azure \
--network-plugin-mode overlay \
--network-dataplane cilium \
--network-policy cilium \
--ssh-access disabled \
--enable-managed-identity \
--enable-acns
```

The command above will deploy an AKS cluster with the following configurations:

- Deploy Kubernetes version 1.29. This is not the latest version of Kubernetes, and is intentionally set to an older version to demonstrate cluster upgrades later in the workshop.
- Create a system node pool with 3 nodes spread across availability zones 1, 2, and 3. This node pool will be used to host Kubernetes control plane and AKS-specific components.
- Use standard load balancer to support traffic across availability zones.
- Use Azure CNI Overlay Powered By Cilium networking. This will give you the most advanced networking features available in AKS and gives great flexibility in how IP addresses are assigned to pods. Note the Advanced Container Networking Services (ACNS) feature is enabled and will be covered later in the workshop.
- Some best practice for production clusters:
  - Disable SSH access to the nodes to prevent unauthorized access
  - Enable a managed identity for passwordless authentication to Azure services

<div class="important" data-title="Important">

> Not all best practices are implemented in this workshop. For example, you will be creating an AKS cluster that can be accessible from the public internet. For production use, it is recommended to create a private cluster. You can find more information on creating a private cluster [here](https://docs.microsoft.com/azure/aks/private-clusters). Don't worry though, more best practices will be implemented as we progress through the workshop 😎

</div>

Once the AKS cluster has been created, run the following command to connect to the cluster.

```bash
az aks get-credentials \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--overwrite-existing
```

### Adding a User Node Pool

As mentioned above, the AKS cluster has been created with a system node pool that is used to host system workloads. You will need to manually create a user node pool to host user workloads. This user node pool will be created with a single node but can be scaled up as needed. Also note that the VM SKU is specified here which can be changed to suit your workload requirements.

Run the following command to add a user node pool to the AKS cluster.

```bash
az aks nodepool add \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--mode User \
--name userpool \
--node-count 1 \
--node-vm-size Standard_DS2_v2 \
--zones 1 2 3
```

### Tainting the System Node Pool

Now that we have created a user node pool, we need to add a taint to the system node pool to ensure that the user workloads are not scheduled on it. A taint is a key-value pair that prevents pods from being scheduled on a node unless the node has the corresponding toleration. You could taint nodes using the [kubectl taint](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#taint) command, but since AKS can scale node pools up and down, it is recommended to use the [--node-taints](https://learn.microsoft.com/azure/aks/use-node-taints) option from the Azure CLI to ensure the taint is applied to all nodes in the pool.

Run the following command to add a taint to the system node pool.

```bash
az aks nodepool update \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--name systempool \
--node-taints CriticalAddonsOnly=true:NoSchedule
```

This taint will prevent pods from being scheduled on the node pool unless they have a toleration for the taint. More on taints and tolerations can be found [here](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).

### Enabling AKS Monitoring and Logging

Monitoring and logging are essential for maintaining the health and performance of your AKS cluster. AKS provides integrations with Azure Monitor for metrics and logs. Logging is provided by [container insights](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#enable-container-insights) which can send container logs to [Azure Log Analytics Workspaces](https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview) for analysis. Metrics are provided by [Azure Monitor managed service for Prometheus](https://learn.microsoft.com/azure/azure-monitor/essentials/prometheus-metrics-overview) which collects performance metrics from nodes and pods and allows you to query using [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) and visualize using [Azure Managed Grafana](https://learn.microsoft.com/azure/managed-grafana/overview).

The Bicep template that was deployed earlier should be completed by now. All you need to do next is enable [metrics monitoring](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli) and on the cluster by linking the monitoring resources to the AKS cluster.

Run the following commands to get the resource IDs for the resources that were created, save them to the **.env** file, and reload the environment variables.

```bash
cat <<EOF >> .env
MONITOR_ID="$(az monitor account list -g $RG_NAME --query "[0].id" -o tsv)"
GRAFANA_ID="$(az grafana list -g $RG_NAME --query "[0].id" -o tsv)"
LOGS_ID="$(az monitor log-analytics workspace list -g $RG_NAME --query "[0].id" -o tsv)"
AKV_NAME="$(az keyvault list --resource-group $RG_NAME --query "[0].name" -o tsv)"
AKV_ID="$(az keyvault show --name $AKV_NAME --query "id" -o tsv)"
EOF
source .env
```

<div class="tip" data-title="Tip">

> Whenever you want to see the contents of the **.env** file, run the `cat .env` command.

</div>

Run the following command to enable metrics monitoring on the AKS cluster.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--enable-azure-monitor-metrics \
--azure-monitor-workspace-resource-id ${MONITOR_ID} \
--grafana-resource-id ${GRAFANA_ID} \
--no-wait
```

Run the following command to enable the monitoring addon which will enable logging to the Azure Log Analytics workspace from the AKS cluster.

```bash
az aks enable-addons \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--addon monitoring \
--workspace-resource-id ${LOGS_ID} \
--no-wait
```

<div class="info" data-title="Note">

> More on full stack monitoring on AKS can be found [here](https://learn.microsoft.com/azure/azure-monitor/containers/monitor-kubernetes)

</div>

### Deploying the AKS Store Demo Application

This workshop will have you implement features and test scenarios on the AKS cluster. To do this, you will need an application to work with. The [AKS Store Demo application](https://github.com/Azure-Samples/aks-store-demo) is a simple e-commerce application that will be used to demonstrate the advanced features of AKS.

The application has the following services:

| Service         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| store-front     | Web app for customers to place orders (Vue.js)                     |
| order-service   | This service is used for placing orders (Javascript)               |
| product-service | This service is used to perform CRUD operations on products (Rust) |
| rabbitmq        | RabbitMQ for an order queue                                        |

Here is a high-level architecture of the application:

![AKS store demo architecture](./assets/aks-store-architecture.png)

Run the following command to create a namespace for the application.

```bash
kubectl create namespace pets
```

Run the following command to install the application in the **pets** namespace using the following commands.

```bash
kubectl apply -f https://raw.githubusercontent.com/Azure-Samples/aks-store-demo/refs/heads/main/aks-store-quickstart.yaml -n pets
```

Verify the application was installed with the following command.

```bash
kubectl get all -n pets
```

The application uses a LoadBalancer service to allow access to the application UI. Once you have confirmed all the pods are deployed, run the following command to get the storefront service IP address.

```bash
kubectl get svc store-front -n pets
```

Copy the **EXTERNAL-IP** of the **store-front** service to your browser to access the application.

![AKS Store Demo sample app](assets/acns-pets-app.png)

<div class="tip" data-title="Congratulations!">

> You have now created an AKS cluster with some best practices in place such as multiple node pools, availability zones, and monitoring. You have also deployed an application to work with in the upcoming sections.
>
> At this point, you can jump any section within this workshop and focus on the topics that interest you the most.
>
> Feel free to click **Next** at the bottom of the page to continue with the workshop or jump to any of the sections in the left-hand navigation.

</div>

---

## Advanced Networking Concepts

TODO: Add content about Azure CNI Overlay with Cilium

### Advanced Container Networking Services

Advanced Container Networking Services (ACNS) is a suite of services built to significantly enhance the operational capabilities of your Azure Kubernetes Service (AKS) clusters.
Advanced Container Networking Services contains features split into two pillars:

- **Security**: For clusters using Azure CNI Powered by Cilium, network policies include fully qualified domain name (FQDN) filtering for tackling the complexities of maintaining configuration.
- **Observability**: The inaugural feature of the Advanced Container Networking Services suite bringing the power of Hubble’s control plane to both Cilium and non-Cilium Linux data planes. These features aim to provide visibility into networking and performance.

### Enforcing Network Policy

In this section, we’ll apply network policies to control traffic flow to and from the Pet Shop application. We will start with standard network policy that doesn't require ACNS, then we enforce more advanced FQDN policies.

#### Test Connectivity

Do the following test to make sure that all traffic is allowed by default

Run the following command to test a connection to an external website from the order-service pod.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service -- sh -c 'wget --spider www.bing.com'
```

You should see output similar to the following:

```text
Connecting to www.bing.com (13.107.21.237:80)
remote file exists
```

Now test the connection between the order-service and product-service pods which is allowed but not required by the architecture.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service  -- sh -c 'nc -zv -w2 product-service 3002'
```

You should see output similar to the following:

```text
product-service (10.0.96.101:3002) open
```

In both tests, the connection was successful. This is because all traffic is allowed by default in Kubernetes.

#### Deploy Network Policy

Now, let's deploy some network policy to allow only the required ports in the pets namespace.

Run the following command to download the network policy manifest file.

```bash
curl -o acns-network-policy.yaml https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/acns-network-policy.yaml
```

Take a look at the network policy manifest file by running the following command.

```bash
cat acns-network-policy.yaml
```

Apply the network policy to the pets namespace.

```bash
kubectl apply -n pets -f acns-network-policy.yaml
```

#### Verify Policies

Review the created policies using the following command

```bash
kubectl get cnp -n pets
```

Ensure that only allowed connections succeed and others are blocked. For example, order-service should not be able to access www.bing.com or the product-service.

Run the following command to test the connection to www.bing.com from the order-service pod.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service -- sh -c 'wget --spider --timeout=1 --tries=1 www.bing.com'
```

You should see output similar to the following:

```text
wget: bad address 'www.bing.com'
command terminated with exit code 1
```

Run the following command to test the connection between the order-service and product-service pods.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service  -- sh -c 'nc -zv -w2 product-service 3002'
```

You should see output similar to the following:

```text
nc: bad address 'product-service'
command terminated with exit code 1
```

We've just enforced network policies to control traffic flow to and from pods within the demo application. At the same time, we should be able to access the pet shop app UI and order product normally.

### Configuring FQDN Filtering

Using network policies, you can control traffic flow to and from your AKS cluster. This is traditionally been enforced based on IP addresses and ports. But what if you want to control traffic based on fully qualified domain names (FQDNs)? What if an application owner asks you to allow traffic to a specific domain like Microsoft Graph API?

This is where FQDN filtering comes in.

<div class="info" data-title="Note">

> FQDN filtering is only available for clusters using Azure CNI Powered by Cilium.

</div>

Let's explore how we can apply FQDN-based network policies to control outbound access to specific domains.

#### Test Connectivity

Let's start with testing the connection from the order-service to see if it can contact the Microsoft Graph API endpoint.

Run the following command to test the connection to the Microsoft Graph API from the order-service pod.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service  -- sh -c 'wget --spider --timeout=1 --tries=1 https://graph.microsoft.com'
```

As you can see the traffic is denied. This is an expected behavior because we have implemented zero trust security policy and denying any unwanted traffic.

#### Create an FQDN Policy

To limit egress to certain domains, apply an FQDN policy. This policy permits access only to specified URLs, ensuring controlled outbound traffic.

<div class="info" data-title="Note">

> FQDN filtering requires ACNS to be enabled

</div>

Run the following command to download the FQDN policy manifest file.

```bash
curl -o acns-network-policy-fqdn.yaml https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/acns-network-policy-fqdn.yaml
```

Take a look at the FQDN policy manifest file by running the following command.

```bash
cat acns-network-policy-fqdn.yaml
```

```bash
kubectl apply -n pets -f acns-network-policy-fqdn.yaml
```

#### Verify FQDN Policy Enforcement

Now if we try to access Microsoft Graph API from order-service app, that should be allowed.

```bash
kubectl exec -n pets -it $(kubectl get po -n pets -l app=order-service -ojsonpath='{.items[0].metadata.name}') -c order-service  -- sh -c 'wget --spider --timeout=1 --tries=1 https://graph.microsoft.com'
```

You should see output similar to the following:

```text
Connecting to graph.microsoft.com (20.190.152.88:443)
Connecting to developer.microsoft.com (23.45.149.11:443)
Connecting to developer.microsoft.com (23.45.149.11:443)
remote file exists
```

### Monitoring Advanced Network Metrics and Flows

Advanced Container Networking Services (ACNS) provides deep visibility into your cluster's network activity. This includes flow logs and deep visibility into your cluster's network activity. All communications to and from pods are logged, allowing you to investigate connectivity issues over time

Using Azure Managed Grafana, you can visualize real-time data and gain insights into network traffic patterns, performance, and policy effectiveness.

What if a customer reports a problem in accessing the pets shop? How can you troubleshoot the issue?

We'll work to simulate a problem and then use ACNS to troubleshoot the issue.

#### Introducing Chaos to Test container networking

Let's start by applying a new network policy to cause some chaos in the network. This policy will drop incoming traffic to the store-front service.

Run the following command to download the chaos policy manifest file.

```bash
curl -o acns-network-policy-chaos.yaml https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/acns-network-policy-chaos.yaml
```

Run the following command to examine the chaos policy manifest file.

```bash
cat acns-network-policy-chaos.yaml
```

Run the following command to apply the chaos policy to the pets namespace.

```bash
kubectl apply -n pets -f acns-network-policy-chaos.yaml
```

#### Access Grafana Dashboard

When you enabled Advanced Container Networking Services (ACNS) on your AKS cluster, you also enabled metrics collection. These metrics provide insights into traffic volume, dropped packets, number of connections, etc. The metrics are stored in Prometheus format and, as such, you can view them in Grafana.

Using your browser, navigate to [Azure Portal](https://aka.ms/publicportal), search for **grafana** resource, then click on the **Azure Managed Grafana** link under the **Services** section. Locate the Azure Managed Grafana resource that was created earlier in the workshop and click on it, then click on the URL next to **Endpoint** to open the Grafana dashboard.

![Azure Managed Grafana overview](assets/acns-grafana-overview.png)

Part of ACNS we provide pre-defined networking dashboards. Review the available dashboards

![ACNS dashboards in Grafana](assets/acns-grafana-dashboards.png)

You can start with the **Kubernetes / Networking / Clusters** dashboard to get an over view of whats is happening in the cluster.

![ACNS networking clusters dashboard](assets/acns-network-clusters-dashboard.png)

Lets' change the view to the **Kubernetes / Networking / Drops**, select the **pets** namespace, and **store-front** workload

![ACNS networking drops dashboard](assets/acns-drops-incoming-traffic.png)

Now you can see increase in the dropped incoming traffic and the reason is "policy_denied" so now we now the reason that something was wrong with the network policy. let's dive dipper and understand why this is happening

[Optional] Familiarize yourself with the other dashboards for DNS, and pod flows

| ![DNS Dashboard](assets/acns-dns-dashboard.png) | ![Pod Flows Dashboard](assets/acns-pod-flows-dashboard.png) |
| ----------------------------------------------- | ----------------------------------------------------------- |

#### Observe network flows with hubble

ACNS integrates with Hubble to provide flow logs and deep visibility into your cluster's network activity. All communications to and from pods are logged allowing you to investigate connectivity issues over time.

But first we need to install Hubble CLI

Install Hubble CLI

```bash
# Set environment variables
export HUBBLE_VERSION="v0.11.0"
export HUBBLE_OS="$(uname | tr '[:upper:]' '[:lower:]')"
export HUBBLE_ARCH="$(uname -m)"

#Install Hubble CLI
if [ "$(uname -m)" = "aarch64" ]; then HUBBLE_ARCH="arm64"; fi
curl -L --fail --remote-name-all https://github.com/cilium/hubble/releases/download/${HUBBLE_VERSION}/hubble-${HUBBLE_OS}-${HUBBLE_ARCH}.tar.gz{,.sha256sum}
sha256sum --check hubble-${HUBBLE_OS}-${HUBBLE_ARCH}.tar.gz.sha256sum
sudo tar xzvfC hubble-${HUBBLE_OS}-${HUBBLE_ARCH}.tar.gz /usr/local/bin
rm hubble-${HUBBLE_OS}-${HUBBLE_ARCH}.tar.gz{,.sha256sum}
```

Port forward Hubble Relay using the kubectl port-forward command.

```bash
kubectl port-forward -n kube-system svc/hubble-relay --address 127.0.0.1 4245:443
```

Move the port forward to the background by pressing **Ctrl + z** and then type `bg`.

Configure the client with hubble certificate

```bash
#!/usr/bin/env bash

set -euo pipefail
set -x

# Directory where certificates will be stored
CERT_DIR="$(pwd)/.certs"
mkdir -p "$CERT_DIR"

declare -A CERT_FILES=(
  ["tls.crt"]="tls-client-cert-file"
  ["tls.key"]="tls-client-key-file"
  ["ca.crt"]="tls-ca-cert-files"
)

for FILE in "${!CERT_FILES[@]}"; do
  KEY="${CERT_FILES[$FILE]}"
  JSONPATH="{.data['${FILE//./\\.}']}"

  # Retrieve the secret and decode it
  kubectl get secret hubble-relay-client-certs -n kube-system -o jsonpath="${JSONPATH}" | base64 -d > "$CERT_DIR/$FILE"

  # Set the appropriate hubble CLI config
  hubble config set "$KEY" "$CERT_DIR/$FILE"
done

hubble config set tls true
hubble config set tls-server-name instance.hubble-relay.cilium.io
```

Check Hubble pods are running using the `kubectl get pods` command.

```bash
kubectl get pods -o wide -n kube-system -l k8s-app=hubble-relay
```

Your output should look similar to the following example output:

```text
NAME                            READY   STATUS    RESTARTS   AGE    IP            NODE                                 NOMINATED NODE   READINESS GATES
hubble-relay-7ff97868ff-tvwcf   1/1     Running   0          101m   10.244.2.57   aks-systempool-10200747-vmss000000   <none>           <none>
```

Using hubble we will look for what is dropped.

```bash
hubble observe --verdict DROPPED
```

Here we can see traffic coming from world dropped in store-front

![Hubble CLI](assets/acns-hubble-cli.png)

So now we can tell that there is a problem with the frontend ingress traffic configuration, let's review the `allow-store-front-traffic` policy

```bash
kubectl describe -n pets cnp allow-store-front-traffic
```

Here we go, we see that the Ingress traffic is not allowed

![Ingress traffic not allowed](assets/acns-policy-output.png)

Now to solve the problem we will apply the original policy.

Run the following command to apply the original network policy to the pets namespace.

```bash
curl -o acns-network-policy-allow-store-front-traffic.yaml https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/acns-network-policy-allow-store-front-traffic.yaml
```

View the contents of the network policy manifest file.

```bash
cat acns-network-policy-allow-store-front-traffic.yaml
```

Apply the network policy to the pets namespace.

```bash
kubectl apply -n pets -f acns-network-policy-allow-store-front-traffic.yaml
```

You should now see the traffic flowing again and you are able to access the pets shop app UI.

### Visualize traffic with Hubble UI

#### Install Hubble UI

Run the following command to download the Hubble UI manifest file.

```bash
curl -o acns-hubble-ui.yaml https://raw.githubusercontent.com/Azure-Samples/aks-labs/refs/heads/main/workshops/advanced-aks/assets/acns-hubble-ui.yaml
```

Optionally, run the following command to take a look at the Hubble UI manifest file.

```bash
cat acns-hubble-ui.yaml
```

Apply the hubble-ui.yaml manifest to your cluster, using the following command

```bash
kubectl apply -f acns-hubble-ui.yaml
```

#### Forward Hubble Relay Traffic

Set up port forwarding for Hubble UI using the kubectl port-forward command.

```bash
kubectl -n kube-system port-forward svc/hubble-ui 12000:80
```

#### Access Hubble UI

Access Hubble UI by entering http://localhost:12000/ into your web browser.

![Accessing the Hubble UI](assets/acns-hubble-ui.png)

### Istio Service Mesh

<div class="important" data-title="Important">

> If you have implemented the CiliumNetworkPolicy manifests from the previous sections, you will need to remove them with the following command before proceeding with the Istio service mesh.
>
> ```bash
> kubectl delete ciliumnetworkpolicy -n pets --all
> ```

</div>

Istio is an open-source service mesh that layers transparently onto existing distributed applications. Istio’s powerful features provide a uniform and more efficient way to secure, connect, and monitor services. Istio enables load balancing, service-to-service authentication, and monitoring – with few or no service code changes. Its powerful control plane brings vital features, including:

- Secure service-to-service communication in a cluster with TLS (Transport Layer Security) encryption, strong identity-based authentication, and authorization.
- Automatic load balancing for HTTP, gRPC, WebSocket, and TCP traffic.
- Fine-grained control of traffic behavior with rich routing rules, retries, failovers, and fault injection.
- A pluggable policy layer and configuration API supporting access controls, rate limits, and quotas.
- Automatic metrics, logs, and traces for all traffic within a cluster, including cluster ingress and egress.

Istio is integrated with AKS as an addon and is supported alongside AKS.

<div class="info" data-title="Note">

> Please be aware that the Istio addon for AKS does not provide the full functionality of the Istio upstream project. You can view the current limitations for this AKS Istio addon [here](https://learn.microsoft.com/azure/aks/istio-about#limitations) and what is currently [Allowed, supported, and blocked MeshConfig values](https://learn.microsoft.com/azure/aks/istio-meshconfig#allowed-supported-and-blocked-meshconfig-values)

</div>

#### Configure CA certificates

In the Istio-based service mesh addon for Azure Kubernetes Service, by default the Istio certificate authority (CA) generates a self-signed root certificate and key and uses them to sign the workload certificates. To protect the root CA key, you should use a root CA which runs on a secure machine offline.

In this lab, we will create our own root CA, along with an intermediate CA, and configure the Istio addon to issue intermediate certificates to the Istio CAs that run in each cluster. An Istio CA can sign workload certificates using the administrator-specified certificate and key, and distribute an administrator-specified root certificate to the workloads as the root of trust.

##### Clone the Istio Repo

To expedite the process of creating the necessary certificates needed, we will leverage the certificate tooling provided by the Istio open-source project.

In your terminal, run the following command to clone the Istio repository.

```bash
git clone https://github.com/istio/istio.git
```

##### Generate the Root and Intermediate CA certificates

Navigate into the recently cloned Istio directory.

```bash
cd istio
```

Once in the `istio` directory, create the `akslab-certs` directory and navigate into it.

```bash
mkdir -p akslab-certs
pushd akslab-certs
```

Generate the root certificate and key.

```bash
make -f ../tools/certs/Makefile.selfsigned.mk root-ca
```

Generate the intermediate certificate and key

```bash
make -f ../tools/certs/Makefile.selfsigned.mk intermediate-cacerts
```

This will create a directory called `intermediate` which will contain the intermediate CA certificate information.

#### Add the CA Certificates to Azure Key Vault

We will utilize Azure KeyVault to store the root and intermediate CA certificate information.

In the `akslab-certs` directory, run the following commands.

```bash
az keyvault secret set --vault-name ${AKV_NAME} --name istio-root-cert --file root-cert.pem
az keyvault secret set --vault-name ${AKV_NAME} --name istio-intermediat-cert --file ./intermediate/ca-cert.pem
az keyvault secret set --vault-name ${AKV_NAME} --name isito-intermediat-key --file ./intermediate/ca-key.pem
az keyvault secret set --vault-name ${AKV_NAME} --name istio-cert-chain --file ./intermediate/cert-chain.pem
```

#### Enable Azure Key Vault provider for Secret Store CSI Driver for your cluster

The Azure Key Vault provider for Secrets Store CSI Driver allows for the integration of an Azure Key Vault as a secret store with an Azure Kubernetes Service (AKS) cluster via a [CSI volume](https://kubernetes-csi.github.io/docs/).

This integration will allow AKS to create, store, and retrieve Kubernetes secrets from Azure Key Vault.

Run the following command to enable the AKS Azure Key Vault secrets provider.

```bash
az aks enable-addons \
--addons azure-keyvault-secrets-provider \
--resource-group ${RG_NAME} \
--name ${AKS_NAME}
```

#### Authorize the user-assigned managed identity of the AKS Azure Key Vault provider add-on to have access to Azure Key Vault

<div class="info" data-title="Note">

> For the purposes of this lab, we are using the `Key Vault Administrator` role. Please consider a role with lesser privileges for accessing Azure Key Vault in a production environment.

</div>

When you enable the Azure Key Vault provider for the AKS cluster, a user-assigned managed identity is created for the cluster. We will provide the managed identity with access to Azure Key Vault to retrieve the CA certificate information needed when we deploy the AKS Istio addon.

Run the following commands to add an Azure role assignment for Key Vault administrator for the add-on's user-assigned managed identity.

```bash
OBJECT_ID=$(az aks show \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--query 'addonProfiles.azureKeyvaultSecretsProvider.identity.objectId' \
-o tsv)

az role assignment create \
--role "Key Vault Administrator" \
--assignee-object-id ${OBJECT_ID} \
--assignee-principal-type ServicePrincipal \
--scope ${AKV_ID}
```

#### Deploy Istio service mesh add-on with plug-in CA certificates

Before deploying the AKS Istio add-on, check the revision of Istio to ensure it is compatible with the version of Kubernetes on the cluster. To check the available revisions in the region that the AKS cluster is deployed in, run the following command:

```bash
az aks mesh get-revisions \
--location ${LOCATION} \
--output table
```

You should see the available revisions for the AKS Istio add-on and the compatible versions of Kubernetes they support.

Run the following command to enable the default supported revision of the AKS Istio add-on for the AKS cluster, using the CA certificate information created earlier.

```bash
az aks mesh enable \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--key-vault-id ${AKV_ID} \
--root-cert-object-name istio-root-cert \
--ca-cert-object-name istio-intermediat-cert \
--ca-key-object-name isito-intermediat-key \
--cert-chain-object-name istio-cert-chain
```

<div class="info" data-title="Note">

> This may take several minutes to complete.

</div>

Once the service mesh has been enabled, run the following command to view the Istio pods on the cluster.

```bash
kubectl get pods -n aks-istio-system
```

#### Enable Sidecar Injection

Service meshes traditionally work by deploying an additional container within the same pod as your application container. These additional containers are referred to as a sidecar or a sidecar proxy. These sidecar proxies receive policy and configuration from the service mesh control plane, and insert themselves in the communication path of your application to control the traffic to and from your application container.

The first step to onboarding your application into a service mesh, is to enable sidecar injection for your application pods. To control which applications are onboarded to the service mesh, we can target specific Kubernetes namespaces where applications are deployed.

<div class="info" data-title="Note">

> For upgrade scenarios, it is possible to run multiple Istio add-on control planes with different versions. The following command enables sidecar injection for the Istio revision `asm-1-22`. If you are not sure which revision is installed on the cluster, you can run the following command `az aks show --resource-group ${RG_NAME} --name ${AKS_NAME}  --query "serviceMeshProfile.istio.revisions"`

</div>

The following command will enable the AKS Istio add-on sidecar injection for the `pets` namespace for the Istio revision `1.22`.

```bash
kubectl label namespace pets istio.io/rev=asm-1-22
```

At this point, we have simply just labeled the namespace, instructing the Istio control plane to enable sidecar injection on new deployments into the namespace. Since we have existing deployments in the namespace already, we will need to restart the deployments to trigger the sidecar injection.

Get a list of all the current pods running in the `pets` namespace.

```bash
kubectl get pods -n pets
```

You'll notice that each pod listed has a `READY` state of `1/1`. This means there is one container (the application container) per pod. We will restart the deployments to have the Istio sidecar proxies injected into each pod.

Restart the deployments for the `order-service`, `product-service`, and `store-front`.

```bash
kubectl rollout restart deployment order-service -n pets
kubectl rollout restart deployment product-service -n pets
kubectl rollout restart deployment store-front -n pets
```

If we re-run the get pods command for the `pets` namespace, you will notice all of the pods now have a `READY` state of `2/2`, meaning the pods now include the sidecar proxy for Istio. The RabbitMQ for the AKS Store application is not a Kubernetes deployment, but is a stateful set. We will need to redeploy the RabbitMQ stateful set to get the sidecar proxy injection.

```bash
kubectl rollout restart statefulset rabbitmq -n pets
```

If you again re-run the get pods command for the `pets` namespace, we'll see all the pods with a `READY` state of `2/2`

```bash
kubectl get pods -n pets
```

#### Verify the Istio Mesh is Controlling Mesh Communications

We will walk through some common configurations to ensure the communications for the AKS Store application are secured. To begin we will deploy a Curl utility container to the cluster, so we can execute traffic commands from it to test out the Istio mesh policy.

Use the following command to deploy a test pod that will run the **curl** image to the **default** namespace of the cluster.

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: curl-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  template:
    metadata:
      labels:
        app: curl
    spec:
      containers:
      - name: curl
        image: curlimages/curl
        command: ["sleep", "3600"]
EOF
```

We can verify the deployment of the test pod in the **default** namespace using following command:

```bash
kubectl get pods -n default
```

Wait for the test pod to be in a **Running** state.

##### Configure mTLS Strict Mode for the pets namespace

Currently Istio configures managed workloads to use mTLS when calling other workloads, but the default permissive mode allows a service to accept traffic in both plaintext or mTLS traffic. To ensure that the workloads we manage with the Istio add-on only accept mTLS communication, we will deploy a Peer Authentication policy to enforce only mTLS traffic for the workloads in the `pets` namespace.

Prior to deploying the mTLS strict mode, let's verify that the **store-front** service will respond to a client not using mTLS. We will invoke a call from the test pod to the **store-front** service and see if we get a response.

Run the following command to get the name of the test pod.

```bash
CURL_POD_NAME="$(kubectl get pod -l app=curl -o jsonpath="{.items[0].metadata.name}")"
```

Run the following command to run a curl command from the test pod to the **store-front** service.

```bash
kubectl exec -it ${CURL_POD_NAME} -- curl -IL store-front.pets.svc.cluster.local:80
```

You should see a response with a status of **HTTP/1.1 200 OK** indicating that the **store-front** service successfully responded to the client Let's now apply the Peer Authentication policy that will enforce all services in the `pets` namespace to only use mTLS communication.

Run the following command to configure the mTLS Peer Authentication policy.

```bash
kubectl apply -n pets -f - <<EOF
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: pets-default
  namespace: pets
spec:
  mtls:
    mode: STRICT
EOF
```

Once the mTLS strict mode peer authentication policy has been applied, we will now see if we can again get a response back from the `store-front` service from a client not using mTLS. Run the following command to curl to the **store-front** service again.

```bash
kubectl exec -it ${CURL_POD_NAME} -- curl -IL store-front.pets.svc.cluster.local:80
```

Notice that the curl client failed to get a response from the **store-front** service. The error returned is the indication that the mTLS policy has been enforced, and that the **store-front** service has rejected the non mTLS communication from the test pod.

To verify that the `store-front` service is still accessible for pods in the `pets` namespace where the mTLS Peer Authentication policy is deployed, we will again deploy the **curl** image utility pod in the `pets` namespace. That pod will automatically get the sidecar injection of the Istio proxy, along with the policy that will enable it to securly communicate to the `store-front` service.

Use the following command to deploy the test pod that will run the **curl** image to the **pets** namespace of the cluster.

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: curl-pets-deployment
  namespace: pets
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  template:
    metadata:
      labels:
        app: curl
    spec:
      containers:
      - name: curl
        image: curlimages/curl
        command: ["sleep", "3600"]
EOF
```

We can again verify the deployment of the test pod in the **pets** namespace using following command:

```bash
kubectl get pods -n pets | grep curl
```

Wait for the test pod to be in a **Running** state, and notice the `READY` state, which should have a status of `2/2`.

Run the following command to get the name of the test pod in the `pets` namespace.

```bash
CURL_PETS_POD_NAME="$(kubectl get pod -n pets -l app=curl -o jsonpath="{.items[0].metadata.name}")"
```

Run the following command to run a curl command from the test pod in the `pets` namespace to the **store-front** service.

```bash
kubectl exec -it ${CURL_PETS_POD_NAME} -n pets -- curl -IL store-front.pets.svc.cluster.local:80
```

You should see a response with a status of **HTTP/1.1 200 OK** indicating that the **store-front** service successfully responded to the client in the `pets` namespace using only mTLS communication.

---

## Advanced Storage Concepts

### Storage Options

Azure offers rich set of storage options that can be categorized into two buckets: Block Storage and Shared File Storage. You can choose the best match option based on the workload requirements. The following guidance can facilitate your evaluation:

- Select storage category based on the attach mode.
  Block Storage can be attached to a single node one time (RWO: Read Write Once), while Shared File Storage can be attached to different nodes one time (RWX: Read Write Many). If you need to access the same file from different nodes, you would need Shared File Storage.
- Select a storage option in each category based on characteristics and user cases.

  **Block storage category:**
  | Storage option | Characteristics | User Cases |
  | :-------------------------------------------------------------------------------------------: | :----------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
  | [Azure Disks](https://learn.microsoft.com/azure/virtual-machines/managed-disks-overview) | Rich SKUs from low-cost HDD disks to high performance Ultra Disks. | Generic option for all user cases from Backup to database to SAP Hana. |
  | [Elastic SAN](https://learn.microsoft.com/azure/storage/elastic-san/elastic-san-introduction) | Scalability up to millions of IOPS, Cost efficiency at scale | Tier 1 & 2 workloads, Databases, VDI hosted on any Compute options (VM, Containers, AVS) |
  | [Local Disks](https://learn.microsoft.com/azure/virtual-machines/nvme-overview) | Priced in VM, High IOPS/Throughput and extremely low latency. | Applications with no data durability requirement or with built-in data replication support (e.g., Cassandra), AI training |

  **Shared File Storage category:**
  | Storage option | Characteristics | User Cases |
  | :--------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: |
  | [Azure Files](https://learn.microsoft.com/azure/storage/files/storage-files-introduction) | Fully managed, multiple redundancy options. | General purpose file shares, LOB apps, shared app or config data for CI/CD, AI/ML. |
  | [Azure NetApp Files](https://learn.microsoft.com/azure/azure-netapp-files/azure-netapp-files-introduction) | Fully managed ONTAP with high performance and low latency. | Analytics, HPC, CMS, CI/CD, custom apps currently using NetApp. |
  | [Azure Blobs](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction) | Unlimited amounts of unstructured data, data lifecycle management, rich redundancy options. | Large scale of object data handling, backup |

- Select performance tier, redundancy type on the storage option.
  See the product page from above table for further evaluation of performance tier, redundancy type or other requirements.

### Orchestration Options

Besides invoking service REST API to ingest remote storage resources, there are two major ways to use storage options in AKS workloads: CSI (Container Storage Interface) drivers and Azure Container Storage.

#### CSI Drivers

Container Storage Interface is industry standard that enables storage vendors (SP) to develop a plugin once and have it work across a number of container orchestration systems. It’s widely adopted by both OSS community and major cloud storage vendors. If you already build storage management and operation with CSI drivers, or you plan to build cloud independent k8s cluster setup, it’s the preferred option.

#### Azure Container Storage

Azure Container Storage is built on top of CSI drivers to support greater scaling capability with storage pool and unified management experience across local & remote storage. If you want to simplify the use of local NVMe disks, or achieve higher pod scaling target,​ it’s the preferred option.

Storage option support on CSI drivers and Azure Container Storage:

|                                               Storage option                                               |                                        CSI drivers                                         | Azure Container Storage |
| :--------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: | :---------------------: |
|          [Azure Disks](https://learn.microsoft.com/azure/virtual-machines/managed-disks-overview)          |     Support([CSI disks driver](https://learn.microsoft.com/azure/aks/azure-disk-csi))      |         Support         |
|       [Elastic SAN](https://learn.microsoft.com/azure/storage/elastic-san/elastic-san-introduction)        |                                            N/A                                             |         Support         |
|              [Local Disks](https://learn.microsoft.com/azure/virtual-machines/nvme-overview)               |                            N/A (Host Path + Static Provisioner)                            |         Support         |
|         [Azure Files](https://learn.microsoft.com/azure/storage/files/storage-files-introduction)          |     Support([CSI files driver](https://learn.microsoft.com/azure/aks/azure-files-csi))     |           N/A           |
| [Azure NetApp Files](https://learn.microsoft.com/azure/azure-netapp-files/azure-netapp-files-introduction) | Support([CSI NetApp driver](https://learn.microsoft.com/azure/aks/azure-netapp-files-nfs)) |           N/A           |
|         [Azure Blobs](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction)          | Support([CSI Blobs driver](https://learn.microsoft.com/azure/aks/azure-blob-csi?tabs=NFS)) |           N/A           |

### Use Azure Container Storage for Replicated Ephemeral NVMe Disk

Deploy a MySQL Server to mount volumes using local NVMe storage via Azure Container Storage and demonstrate replication and failover of replicated local NVMe storage in Azure Container Storage.

#### Setup Azure Container Storage

Follow the below steps to enable Azure Container Storage in an existing AKS cluster

Run the following command to set the new node pool name.

```bash
cat <<EOF >> .env
ACSTOR_NODEPOOL_NAME="acstorpool"
EOF
source .env
```

Run the following command to create a new node pool with `Standard_L8s_v3` VMs.

```bash
az aks nodepool add \
--cluster-name ${AKS_NAME} \
--resource-group ${RG_NAME} \
--name ${ACSTOR_NODEPOOL_NAME} \
--node-vm-size Standard_L8s_v3 \
--node-count 3
```

Update the cluster to enable Azure Container Storage.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--enable-azure-container-storage ephemeralDisk \
--azure-container-storage-nodepools ${ACSTOR_NODEPOOL_NAME} \
--storage-pool-option NVMe \
--ephemeral-disk-volume-type PersistentVolumeWithAnnotation
```

<div class="info" data-title="Note">

> To create a new AKS cluster with Azure Container Storage, see the [Tutorial: Install Azure Container Storage for use with Azure Kubernetes Service](https://learn.microsoft.com/azure/storage/container-storage/install-container-storage-aks) documentation.

Add `--watch` to wait a little bit until all the pods reaches Running state.

```bash
kubectl get pods -n acstor --watch
```

#### Create a replicated ephemeral storage pool

Storage pools can also be created using Kubernetes CRDs, as described here. This CRD generates a storage class called "acstor-(your-storage-pool-name-here)".

```bash
kubectl apply -f - <<EOF
apiVersion: containerstorage.azure.com/v1
kind: StoragePool
metadata:
  name: ephemeraldisk-nvme
  namespace: acstor
spec:
  poolType:
    ephemeralDisk:
      diskType: nvme
      replicas: 3
EOF
```

Storage Class generated will be called "acstor-ephemeraldisk-nvme".

#### Deploy a MySQL server using acstor-ephemeraldisk-nvme storage class

This setup is a modified version of [this guide](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/).

Deploy the config map and services:

```bash
kuebctl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql
  labels:
    app: mysql
    app.kubernetes.io/name: mysql
data:
  primary.cnf: |
    # Apply this config only on the primary.
    [mysqld]
    log-bin
  replica.cnf: |
    # Apply this config only on replicas.
    [mysqld]
    super-read-only
---
# Headless service for stable DNS entries of StatefulSet members.
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
    app.kubernetes.io/name: mysql
spec:
  ports:
  - name: mysql
    port: 3306
  clusterIP: None
  selector:
    app: mysql
---
# Client service for connecting to any MySQL instance for reads.
apiVersion: v1
kind: Service
metadata:
  name: mysql-read
  labels:
    app: mysql
    app.kubernetes.io/name: mysql
    readonly: "true"
spec:
  ports:
  - name: mysql
    port: 3306
  selector:
    app: mysql
EOF
```

Deploy The statefulset for MySQL server:

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  serviceName: mysql
  replicas: 1
  template:
    metadata:
      labels:
        app: mysql
    spec:
      # Use the scheduler extender to ensure the pod is placed on a node with an attachment replica on failover.
      schedulerName: csi-azuredisk-scheduler-extender
      initContainers:
      - name: init-mysql
        image: mysql:5.7
        command:
        - bash
        - "-c"
        - |
          set -ex
          # Generate mysql server-id from pod ordinal index.
          [[ `hostname` =~ -([0-9]+)$ ]] || exit 1
          ordinal=${BASH_REMATCH[1]}
          echo [mysqld] > /mnt/conf.d/server-id.cnf
          # Add an offset to avoid reserved server-id=0 value.
          echo server-id=$((100 + $ordinal)) >> /mnt/conf.d/server-id.cnf
          # Copy appropriate conf.d files from config-map to emptyDir.
          if [[ $ordinal -eq 0 ]]; then
            cp /mnt/config-map/primary.cnf /mnt/conf.d/
          else
            cp /mnt/config-map/replica.cnf /mnt/conf.d/
          fi
        volumeMounts:
        - name: conf
          mountPath: /mnt/conf.d
        - name: config-map
          mountPath: /mnt/config-map
      - name: clone-mysql
        image: gcr.io/google-samples/xtrabackup:1.0
        command:
        - bash
        - "-c"
        - |
          set -ex
          # Skip the clone if data already exists.
          [[ -d /var/lib/mysql/mysql ]] && exit 0
          # Skip the clone on primary (ordinal index 0).
          [[ `hostname` =~ -([0-9]+)$ ]] || exit 1
          ordinal=${BASH_REMATCH[1]}
          [[ $ordinal -eq 0 ]] && exit 0
          # Clone data from previous peer.
          ncat --recv-only mysql-$(($ordinal-1)).mysql 3307 | xbstream -x -C /var/lib/mysql
          # Prepare the backup.
          xtrabackup --prepare --target-dir=/var/lib/mysql
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
          subPath: mysql
        - name: conf
          mountPath: /etc/mysql/conf.d
      containers:
      - name: mysql
        image: mysql:5.7
        env:
        - name: MYSQL_ALLOW_EMPTY_PASSWORD
          value: "1"
        ports:
        - name: mysql
          containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
          subPath: mysql
        - name: conf
          mountPath: /etc/mysql/conf.d
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
        livenessProbe:
          exec:
            command: ["mysqladmin", "ping"]
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          exec:
            # Check we can execute queries over TCP (skip-networking is off).
            command: ["mysql", "-h", "127.0.0.1", "-e", "SELECT 1"]
          initialDelaySeconds: 5
          periodSeconds: 2
          timeoutSeconds: 1
      - name: xtrabackup
        image: gcr.io/google-samples/xtrabackup:1.0
        ports:
        - name: xtrabackup
          containerPort: 3307
        command:
        - bash
        - "-c"
        - |
          set -ex
          cd /var/lib/mysql

          # Determine binlog position of cloned data, if any.
          if [[ -f xtrabackup_slave_info && "x$(<xtrabackup_slave_info)" != "x" ]]; then
            # XtraBackup already generated a partial "CHANGE MASTER TO" query
            # because we're cloning from an existing replica. (Need to remove the tailing semicolon!)
            cat xtrabackup_slave_info | sed -E 's/;$//g' > change_master_to.sql.in
            # Ignore xtrabackup_binlog_info in this case (it's useless).
            rm -f xtrabackup_slave_info xtrabackup_binlog_info
          elif [[ -f xtrabackup_binlog_info ]]; then
            # We're cloning directly from primary. Parse binlog position.
            [[ `cat xtrabackup_binlog_info` =~ ^(.*?)[[:space:]]+(.*?)$ ]] || exit 1
            rm -f xtrabackup_binlog_info xtrabackup_slave_info
            echo "CHANGE MASTER TO MASTER_LOG_FILE='${BASH_REMATCH[1]}',\
                  MASTER_LOG_POS=${BASH_REMATCH[2]}" > change_master_to.sql.in
          fi

          # Check if we need to complete a clone by starting replication.
          if [[ -f change_master_to.sql.in ]]; then
            echo "Waiting for mysqld to be ready (accepting connections)"
            until mysql -h 127.0.0.1 -e "SELECT 1"; do sleep 1; done

            echo "Initializing replication from clone position"
            mysql -h 127.0.0.1 \
                  -e "$(<change_master_to.sql.in), \
                          MASTER_HOST='mysql-0.mysql', \
                          MASTER_USER='root', \
                          MASTER_PASSWORD='', \
                          MASTER_CONNECT_RETRY=10; \
                        START SLAVE;" || exit 1
            # In case of container restart, attempt this at-most-once.
            mv change_master_to.sql.in change_master_to.sql.orig
          fi

          # Start a server to send backups when requested by peers.
          exec ncat --listen --keep-open --send-only --max-conns=1 3307 -c \
            "xtrabackup --backup --slave-info --stream=xbstream --host=127.0.0.1 --user=root"
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
          subPath: mysql
        - name: conf
          mountPath: /etc/mysql/conf.d
        resources:
          requests:
            cpu: 100m
            memory: 100Mi
      volumes:
      - name: conf
        emptyDir: {}
      - name: config-map
        configMap:
          name: mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: azuredisk-standard-ssd-zrs-replicas
      resources:
        requests:
          storage: 256Gi
EOF
```

#### Verify that all the MySQL server's components are available

Verify that 2 services were created (headless one for the statefulset and mysql-read for the reads)

```bash
kubectl get svc -l app=mysql
```

Output should resemble like:

```text
NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
mysql        ClusterIP   None           <none>        3306/TCP   5h43m
mysql-read   ClusterIP   10.0.205.191   <none>        3306/TCP   5h43m
```

Verify that MySql server pod is running

Add the `--watch` to wait and watch until the pod goes from Init to Running state.

```bash
kubectl get pods -l app=mysql -o wide --watch
```

Output should resemble like:

```text
NAME      READY   STATUS    RESTARTS   AGE   IP             NODE                                NOMINATED NODE   READINESS GATES
mysql-0   2/2     Running   0          1m34s  10.244.3.16   aks-nodepool1-28567125-vmss000003   <none>           <none>
```

<div class="info" data-title="Note">

> Keep a note of the node on which the `mysql-0` pod is running.

</div>

#### Inject data to the MySql database

Using the mysql-client image `mysql:5.7`, create a database `school` and a table `students`. Also, make a few entries in the table to verify persistence as below:

```bash
kubectl run mysql-client --image=mysql:5.7 -i --rm --restart=Never -- \
mysql -h mysql-0.mysql <<EOF
CREATE DATABASE school;
CREATE TABLE school.students (RollNumber INT, Name VARCHAR(250));
INSERT INTO school.students VALUES (1, 'Student1');
INSERT INTO school.students VALUES (2, 'Student2');
EOF
```

#### Verify the entries in the MySQL server

Run the following command to verify the creation of database, table and entries:

```bash
kubectl run mysql-client --image=mysql:5.7 -i -t --rm --restart=Never -- \
mysql -h mysql-read -e "SELECT * FROM school.students"
```

Output:

```text
+------------+----------+
| RollNumber | Name     |
+------------+----------+
|          1 | Student1 |
+------------+----------+
|          2 | Student2 |
+------------+----------+
pod "mysql-client" deleted
```

#### Initiate the node failover

Perform the following steps:

- Capture the number of nodes in the default node pool set in the variable `$ACSTOR_NODEPOOL_NAME`,
- Scale up the node pool to add one more node,
- Capture the node on which the workload is running,
- Delete the node on which the workload is running.

```bash
NODE_COUNT=$(az aks nodepool show \
-g ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--name ${ACSTOR_NODEPOOL_NAME} \
--query count \
--output tsv)

az aks nodepool scale \
-g ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--name ${ACSTOR_NODEPOOL_NAME} \
--node-count $((NODE_COUNT+1)) \
--no-wait

POD_NAME=$(kubectl get pods -l app=mysql -o custom-columns=":metadata.name" --no-headers)

NODE_NAME=$(kubectl get pods $POD_NAME -o jsonpath='{.spec.nodeName}')

kubectl delete node $NODE_NAME
```

#### Observe that the mysql pods are running

Add the `--watch` to wait and watch until the pod goes from Init to Running state.

```bash
kubectl get pods -l app=mysql -o wide --watch
```

Output should resemble like:

```text
NAME      READY   STATUS    RESTARTS   AGE   IP             NODE                                NOMINATED NODE   READINESS GATES
mysql-0   2/2     Running   0          3m25s  10.244.3.16   aks-nodepool1-28567125-vmss000002   <none>           <none>
```

<div class="info" data-title="Note">

> Compare the `NODE` entry with the value and verify that they are different.

</div>

#### Verify successful data replication and persistence for MySQL Server

Verify the mount volume by injecting new data by running the following command:

```bash
kubectl run mysql-client --image=mysql:5.7 -i --rm --restart=Never -- \
mysql -h mysql-0.mysql <<EOF
INSERT INTO school.students VALUES (3, 'Student3');
INSERT INTO school.students VALUES (4, 'Student4');
EOF
```

Run the command to fetch the entries previously inserted into the database:

```bash
kubectl run mysql-client --image=mysql:5.7 -i -t --rm --restart=Never -- \
mysql -h mysql-read -e "SELECT * FROM school.students"
```

Output:

```text
+------------+----------+
| RollNumber | Name     |
+------------+----------+
|          1 | Student1 |
+------------+----------+
|          2 | Student2 |
+------------+----------+
|          3 | Student3 |
+------------+----------+
|          4 | Student4 |
+------------+----------+
pod "mysql-client" deleted
```

The output obtained contains the values entered before the failover. This shows that the database and table entries in the MySQL Server were replicated and persisted across the failover of `mysql-0` pod.
The output also demonstrates that, newer entries were successfully appended on the newly spawned mysql server application.

#### Summary

In this section, we have demonstrated the following:

- Create a replicated local NVMe storage pool `ephemeraldisk-nvme`.
- Create a MySQL server statefulset whose `volumeTemplate` uses the storage pool's storage class `acstor-ephemeraldisk-nvme`.
- Create entries into MySQL server.
- Trigger a failover scenario by deleting the node on which the workload pod is running. Scale up the cluster by 1 node so that the 3 active nodes are still present.
- Once the failover completes successfully, enter newer entries into the database and fetch all entries to verify that the data entered before the failover were successfully replicated and persisted across the failover and newer data were entered on top of the replicated data.

---

## Advanced Security Concepts

### Workload Identity

Workloads deployed on an Azure Kubernetes Services (AKS) cluster require Microsoft Entra application credentials or managed identities to access Microsoft Entra protected resources, such as Azure Key Vault and Microsoft Graph. Microsoft Entra Workload ID integrates with the capabilities native to Kubernetes to federate with external identity providers.

This Workload Identity section of the lab will deploy an application workload onto AKS and use Workload Identity to allow the application to access a secret in Azure KeyVault.

#### Limitations

Please be aware of the following limitations for Workload Identity

- You can have a maximum of [20 federated identity credentials](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-considerations#general-federated-identity-credential-considerations) per managed identity.
- It takes a few seconds for the federated identity credential to be propagated after being initially added.
- The [virtual nodes](https://learn.microsoft.com/azure/aks/virtual-nodes) add on, based on the open source project [Virtual Kubelet](https://virtual-kubelet.io/docs/), isn't supported.
- Creation of federated identity credentials is not supported on user-assigned managed identities in these [regions.](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-considerations#unsupported-regions-user-assigned-managed-identities)

#### Enable Workload Identity on an AKS cluster

<div class="info" data-title="Note">

> If Workload Identity is already enabled on your AKS cluster, you can skip this section.

</div>

To enable Workload Identity on the AKS cluster, run the following command.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--enable-oidc-issuer \
--enable-workload-identity
```

This will take several moments to complete.

<div class="info" data-title="Note">

> Please take note of the OIDC Issuer URL. This URL will be used to bind the Kubernetes service account to the Managed Identity for the federated credential.

</div>

You can store the AKS OIDC Issuer URL using the following command.

```bash
cat <<EOF >> .env
AKS_OIDC_ISSUER="$(az aks show \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--query "oidcIssuerProfile.issuerUrl" \
--output tsv)"
EOF
source .env
```

#### Create a Managed Identity

A Managed Identity is a account (identity) created in Microsoft Entra ID. These identities allows your application to leverage them to use when connecting to resources that support Microsoft Entra authentication. Applications can use managed identities to obtain Microsoft Entra tokens without having to manage any credentials.

To expedite the running of commands in this section, it is advised to create the following exported environment variables. Please update the values to what is appropriate for your environment, and then run the export commands in your terminal.

```bash
cat <<EOF >> .env
USER_ASSIGNED_IDENTITY_NAME="myIdentity"
EOF
source .env
```

Run the following command to create a Managed Identity.

```bash
az identity create \
--resource-group ${RG_NAME} \
--name ${USER_ASSIGNED_IDENTITY_NAME} \
--location ${LOCATION} \
```

You should see the following output that will contain your environment specific attributes.

Capture your Managed Identity client ID with the following command.

```bash
cat <<EOF >> .env
USER_ASSIGNED_CLIENT_ID="$(az identity show \
--resource-group ${RG_NAME} \
--name ${USER_ASSIGNED_IDENTITY_NAME} \
--query "clientId" \
--output tsv)"
EOF
source .env
```

#### Create a Kubernetes Service Account

Create a Kubernetes service account and annotate it with the client ID of the managed identity created in the previous step.

```bash
cat <<EOF >> .env
SERVICE_ACCOUNT_NAMESPACE="default"
SERVICE_ACCOUNT_NAME="workload-identity-sa"
EOF
source .env
```

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    azure.workload.identity/client-id: ${USER_ASSIGNED_CLIENT_ID}
  name: ${SERVICE_ACCOUNT_NAME}
  namespace: ${SERVICE_ACCOUNT_NAMESPACE}
EOF
```

#### Create the Federated Identity Credential

Call the az identity federated-credential create command to create the federated identity credential between the managed identity, the service account issuer, and the subject. For more information about federated identity credentials in Microsoft Entra, see [Overview of federated identity credentials in Microsoft Entra ID](https://learn.microsoft.com/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0).

```bash
FEDERATED_IDENTITY_CREDENTIAL_NAME="myFedIdentity"
```

```bash
az identity federated-credential create \
--name ${FEDERATED_IDENTITY_CREDENTIAL_NAME} \
--identity-name ${USER_ASSIGNED_IDENTITY_NAME} \
--resource-group ${RG_NAME} \
--issuer ${AKS_OIDC_ISSUER} \
--subject "system:serviceaccount:${SERVICE_ACCOUNT_NAMESPACE}:${SERVICE_ACCOUNT_NAME}" \
--audience api://AzureADTokenExchange
```

<div class="info" data-title="Note">

> It takes a few seconds for the federated identity credential to propagate after it is added. If a token request is made immediately after adding the federated identity credential, the request might fail until the cache is refreshed. To avoid this issue, you can add a slight delay after adding the federated identity credential.

</div>

#### Deploy a Sample Application Utilizing Workload Identity

When you deploy your application pods, the manifest should reference the service account created in the Create Kubernetes service account step. The following manifest deploys the `busybox` image and shows how to reference the account, specifically the metadata\namespace and spec\serviceAccountName properties.

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: sample-workload-identity
  namespace: ${SERVICE_ACCOUNT_NAMESPACE}
  labels:
    azure.workload.identity/use: "true"  # Required. Only pods with this label can use workload identity.
spec:
  serviceAccountName: ${SERVICE_ACCOUNT_NAME}
  containers:
    - image: busybox
      name: busybox
      command: ["sh", "-c", "sleep 3600"]
EOF
```

<div class="important" data-title="Important">

> Ensure that the application pods using workload identity include the label azure.workload.identity/use: "true" in the pod spec. Otherwise the pods will fail after they are restarted.

</div>

#### Create an Azure KeyVault and Deploy an Application to Access it.

The instructions in this step show how to access secrets, keys, or certificates in an Azure key vault from the pod. The examples in this section configure access to secrets in the key vault for the workload identity, but you can perform similar steps to configure access to keys or certificates.

The following example shows how to use the Azure role-based access control (Azure RBAC) permission model to grant the pod access to the key vault. For more information about the Azure RBAC permission model for Azure Key Vault, see [Grant permission to applications to access an Azure key vault using Azure RBAC](https://learn.microsoft.com/azure/key-vault/general/rbac-guide).

Create a key vault with purge protection and RBAC authorization enabled. You can also use an existing key vault if it is configured for both purge protection and RBAC authorization:

```bash
cat <<EOF >> .env
KEYVAULT_NAME="myKeyVault${RANDOM}"
KEYVAULT_SECRET_NAME="my-secret"
KEYVAULT_RESOURCE_ID="$(az keyvault create \
--name ${KEYVAULT_NAME} \
--resource-group ${RG_NAME} \
--location "${LOCATION}" \
--enable-purge-protection \
--enable-rbac-authorization \
--query "id" \
--output tsv)"
EOF
source .env
```

Assign yourself the RBAC Key Vault Secrets Officer role so that you can create a secret in the new key vault:

```bash
az role assignment create \
--assignee $(az ad signed-in-user show --query "id" -o tsv) \
--role "Key Vault Secrets Officer" \
--scope "${KEYVAULT_RESOURCE_ID}"
```

Create a secret in the key vault:

```bash
az keyvault secret set \
--vault-name "${KEYVAULT_NAME}" \
--name "${KEYVAULT_SECRET_NAME}" \
--value "Hello\!"
```

Assign the Key Vault Secrets User role to the user-assigned managed identity that you created previously. This step gives the managed identity permission to read secrets from the key vault:

```bash
IDENTITY_PRINCIPAL_ID="$(az identity show \
--name "${USER_ASSIGNED_IDENTITY_NAME}" \
--resource-group ${RG_NAME} \
--query "principalId" \
--output tsv)"
```

```bash
az role assignment create \
--assignee-object-id "${IDENTITY_PRINCIPAL_ID}" \
--role "Key Vault Secrets User" \
--scope "${KEYVAULT_RESOURCE_ID}" \
--assignee-principal-type ServicePrincipal
```

Create an environment variable for the key vault URL:

```bash
KEYVAULT_URL="$(az keyvault show \
--resource-group ${RG_NAME} \
--name ${KEYVAULT_NAME} \
--query "properties.vaultUri" \
--output tsv)"
```

Deploy a pod that references the service account and key vault URL:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: sample-workload-identity-key-vault
  namespace: ${SERVICE_ACCOUNT_NAMESPACE}
  labels:
    azure.workload.identity/use: "true"
spec:
  serviceAccountName: ${SERVICE_ACCOUNT_NAME}
  containers:
    - image: ghcr.io/azure/azure-workload-identity/msal-go
      name: oidc
      env:
      - name: KEYVAULT_URL
        value: ${KEYVAULT_URL}
      - name: SECRET_NAME
        value: ${KEYVAULT_SECRET_NAME}
  nodeSelector:
    kubernetes.io/os: linux
EOF
```

To check whether all properties are injected properly by the webhook, use the kubectl describe command:

```bash
kubectl describe pod sample-workload-identity-key-vault | grep "SECRET_NAME:"
```

To verify that pod is able to get a token and access the resource, use the kubectl logs command:

```bash
kubectl logs sample-workload-identity-key-vault
```

### Secure Supply Chain

Containers Secure Supply Chain (CSSC) framework is a seamless, agile ecosystem of tools and processes built to integrate and execute security controls throughout the lifecycle of containers. The container secure supply chain strategy is built considering all the security needs of the container applications. To find out more about the CSSC framework, visit the [Azure Container Secure Supply Chain](https://learn.microsoft.com/azure/security/container-secure-supply-chain/articles/container-secure-supply-chain-implementation/containers-secure-supply-chain-overview) page.

As a quick overview, a container supply chain is built in stages to ensure that the container is secure at every stage of the lifecycle. Microsoft identifies these stages in the container supply chain:

![secure supply chain](./assets/secure-supply-chain.png)

Container images are signed as part of the Acquire stage of the platform. Once a container image acquired from an external source or third-party vendor is verified for functionality and security, it is signed before being added to a catalog of approved container images. In this exercise, we will sign a container image using [Notation](https://github.com/notaryproject/notation), an open source supply chain security tool developed by the [Notary Project community](https://notaryproject.dev/).

#### Install Notation

First, set a local variable for the version of Notation you want to install (in this lab we will use version 1.2.0). Also set environment variables for the operating system and architecture you are using.

```bash
export NOTATION_VERSION=1.2.0
export OS=$(uname | tr '[:upper:]' '[:lower:]')
export ARCH=$(uname -m)
```

Use the following commands to download and install Notation.

```bash
curl -LO https://github.com/notaryproject/notation/releases/download/v$NOTATION_VERSION/notation_$NOTATION_VERSION\_${OS}_${ARCH}.tar.gz
curl -LO https://github.com/notaryproject/notation/releases/download/v$NOTATION_VERSION/notation_$NOTATION_VERSION\_checksums.txt
shasum --check notation_$NOTATION_VERSION\_checksums.txt
```

If the checksum verification is successful, you should see something like this (the result shown here is for Linux AMD64):

```bash
shasum: notation_1.2.0_darwin_amd64.tar.gz: No such file or directory
notation_1.2.0_darwin_amd64.tar.gz: FAILED open or read
shasum: notation_1.2.0_darwin_arm64.tar.gz: No such file or directory
notation_1.2.0_darwin_arm64.tar.gz: FAILED open or read
notation_1.2.0_linux_amd64.tar.gz: OK
shasum: notation_1.2.0_linux_arm64.tar.gz: No such file or directory
notation_1.2.0_linux_arm64.tar.gz: FAILED open or read
shasum: notation_1.2.0_linux_armv7.tar.gz: No such file or directory
notation_1.2.0_linux_armv7.tar.gz: FAILED open or read
shasum: notation_1.2.0_windows_amd64.zip: No such file or directory
notation_1.2.0_windows_amd64.zip: FAILED open or read
shasum: WARNING: 5 listed files could not be read
```

If the checksum verification is successful, extract the binary and move it to the desired bin directory in your `$PATH`.

```bash
tar xvf notation_$NOTATION_VERSION\_${OS}_${ARCH}.tar.gz
mv ./notation /usr/local
ln -s /usr/local/notation /usr/local/bin/notation
```

Verify the installation by running the following command:

```bash
notation version
```

You should see the version of Notation installed.

```text
Notation - a tool to sign and verify artifacts.

Version:     1.2.0
Go version:  go1.23.0
Git commit:  4700ad6f1bef13e411772d7ae4399f891fc3a6ae
```

#### Install the Notation Azure Key Vault Plugin

After installing Notation, install the Notation Azure Key Vault plugin. You can find the URL and the SHA256 checksum for the Notation Azure Key Vault plugin on the [release page](https://github.com/Azure/notation-azure-kv/releases).

```bash
notation plugin install --url https://github.com/Azure/notation-azure-kv/releases/download/v${NOTATION_VERSION}/notation-azure-kv_${NOTATION_VERSION}_${OS}_${ARCH}.tar.gz --sha256sum 06bb5198af31ce11b08c4557ae4c2cbfb09878dfa6b637b7407ebc2d57b87b34
```

Once the plugin is installed, confirm the `azure-kv` plugin is installed by running the following command:

```bash
notation plugin ls
```

#### Create Azure Container Registry and Azure Key Vault

<div class="info" data-title="Note">

> If you have already created an Azure Container Registry and Azure Key Vault, you can skip this section. Make sure the environment variables `AKV_NAME` and `ACR_NAME` are set correctly.

</div>

Before beginning this exercise, let's set the environment variables for the Azure Container Registry and Azure Key Vault which was created at the beginning of the lab with the Bicep template.

Run the following command to get the name of the Azure Container Registry and Azure Key Vault, store them in the **.env** file, and source the file.

```bash
cat <<EOF >> .env
ACR_NAME="$(az acr list --resource-group ${RG_NAME} --query "[].name" -o tsv)"
ACR_RESOURCE_ID="$(az acr show --name ${ACR_NAME} --query id -o tsv)"
ACR_SERVER="$(az acr show -n ${ACR_NAME} --query loginServer -o tsv)"
AKV_NAME="$(az keyvault list --resource-group ${RG_NAME} --query "[].name" -o tsv)"
AKV_RESOURCE_ID="$(az keyvault show --name ${AKV_NAME} --query id -o tsv)"
EOF
source .env
```

Set the local variables containing information about the certificate to be used for signing the container image.

```bash
cat <<EOF >> .env
CERT_NAME="wabbit-networks-io"
CERT_SUBJECT="CN=wabbit-networks.io,O=Notation,L=Seattle,ST=WA,C=US"
CERT_PATH="./${CERT_NAME}.pem"
EOF
source .env
```

Now set the local variables containing information about the container registry and the image source code directory containing the Dockerfile to build.

```bash
cat <<EOF >> .env
REPO="net-monitor"
TAG="v1"
IMAGE="${ACR_SERVER}/${REPO}:${TAG}"
IMAGE_SOURCE="https://github.com/wabbit-networks/net-monitor.git#main"
EOF
source .env
```

#### Authorize access to the container registry

The `AcrPush` and `AcrPull` roles are required to push and pull images from the Azure Container Registry. Run the following command to save your Azure user id in a local variable and assign the AcrPush and AcrPull roles to it.

```bash
az role assignment create \
--role "AcrPull" \
--role "AcrPush" \
--assignee ${USER_ID} \
--scope ${ACR_RESOURCE_ID}
```

#### Authorize access to the key vault

The Azure Key Vault instance you created earlier should have Azure RBAC authorization enabled. The following roles will be required for signing and using self-signed certificates:

- `Key Vault Certificates Officer` to create and read certificates.
- `Key Vault Crypto User` to sign and verify certificates.

Assign the roles using the following commands:

```bash
az role assignment create \
--role "Key Vault Certificates Officer" \
--role "Key Vault Crypto User" \
--assignee ${USER_ID} \
--scope ${AKV_RESOURCE_ID=}
```

#### Create a self-signed certificate in Azure Key Vault

Use the following command to create a certificate policy file named `my_policy.json` which will be used the create the self-signed certificate in Azure Key Vault. The subject value will be used as the trust identity during verification.

```bash
cat <<EOF > ./my_policy.json
{
    "issuerParameters": {
    "certificateTransparency": null,
    "name": "Self"
    },
    "keyProperties": {
      "exportable": false,
      "keySize": 2048,
      "keyType": "RSA",
      "reuseKey": true
    },
    "secretProperties": {
      "contentType": "application/x-pem-file"
    },
    "x509CertificateProperties": {
    "ekus": [
        "1.3.6.1.5.5.7.3.3"
    ],
    "keyUsage": [
        "digitalSignature"
    ],
    "subject": "${CERT_SUBJECT}",
    "validityInMonths": 12
    }
}
EOF
```

Use the following command to create a certificate compatible with [Notary Project certificate requirement](https://github.com/notaryproject/specifications/blob/v1.0.0/specs/signature-specification.md#certificate-requirements) in the Azure Key Vault instance.

```bash
az keyvault certificate create \
--vault-name ${AKV_NAME} \
--name ${CERT_NAME} \
--policy @my_policy.json \
```

#### Signing a Container Image using Notation and Azure Key Vault Plugin

To sign a container image using Notation and Azure Key Vault, you first need to authenticate to your Azure Container Registry using the following command:

```bash
az acr login --name ${ACR_NAME}
```

Build and push a new image with ACR Tasks. Use the digest value to identify the image to sign.

```bash
DIGEST="$(az acr build -r ${ACR_NAME} -t ${ACR_SERVER}/${REPO}:${TAG} ${IMAGE_SOURCE} --no-logs --query "outputImages[0].digest" -o tsv)"
IMAGE="${ACR_SERVER}/${REPO}@${DIGEST}"
```

If the image is built and stored in the registry, the tag serves as an identifier for the image.

```bash
IMAGE="${ACR_SERVER}/${REPO}:${TAG}"
```

Get the ID of the signing key. The following command will get the Key ID of the latest version of the certificate.

```bash
KEY_ID="$(az keyvault certificate show -n $CERT_NAME --vault-name $AKV_NAME --query 'kid' -o tsv)"
```

Sign the image with the [COSE](https://datatracker.ietf.org/doc/html/rfc9052) format using the Notation Azure Key Vault plugin and the key retrieved in the previous step with the following command:

```bash
notation sign \
--signature-format cose \
--id ${KEY_ID} \
--plugin azure-kv \
--plugin-config self_signed=true ${IMAGE}
```

#### Verify the image using Notation

To verify the signed container image, add the root certificate that signs the leaf certificate to the trust store. The following command will download the root certificate and add it to the trust store. In the case of a self-signed certificate, the root certificate _is_ the self-signed certificate. Use the following command to download the root certificate:

```bash
az keyvault certificate download --name ${CERT_NAME} --vault-name ${AKV_NAME} --file ${CERT_PATH}
```

Add the root certificate to the trust store using the following command:

```bash
STORE_TYPE="ca"
STORE_NAME="wabbit-networks.io"
notation cert add --type ${STORE_TYPE} --store ${STORE_NAME} ${CERT_PATH}
```

Verify the image using the following command:

```bash
notation cert ls
```

Configure the trust policy before verification. The trust policy is a JSON file that specifies the trust policy for the image. The trust policy is used to verify the signature of the image. For more information on trust policies and trust stores, see [Trust store and trust policy specification](https://github.com/notaryproject/notaryproject/blob/v1.0.0/specs/trust-store-trust-policy.md) Use the following command to create a trust policy file named `trust_policy.json`:

```bash
cat <<EOF > ./trust_policy.json
{
    "version": "1.0",
    "trustPolicies": [
        {
            "name": "wabbit-networks-images",
            "registryScopes": [ "${ACR_SERVER}/${REPO}" ],
            "signatureVerification": {
                "level" : "strict"
            },
            "trustStores": [ "${STORE_TYPE}:${STORE_NAME}" ],
            "trustedIdentities": [
                "x509.subject: ${CERT_SUBJECT}"
            ]
        }
    ]
}
EOF
```

Import and verify the trust policy from the `trust_poilicy.json` file using the following Notation CLI commands:

```bash
notation policy import ./trustpolicy.json
notation policy show
```

Verify the image using the following command:

```bash
notation verify $IMAGE
```

Upon successful verification of the image using the trust policy, the sha256 digest of the verified image is returned in a successful output message.

---

## Advanced Observability Concepts

Monitoring your AKS cluster has never been easier. Services like Azure Managed Prometheus and Azure Managed Grafana provide a fully managed monitoring solution for your AKS cluster all while using industry standard cloud-native tools. You can always deploy the open-source Prometheus and Grafana to your AKS cluster, but with Azure Managed Prometheus and Azure Managed Grafana, you can save time and resources by letting Azure manage the infrastructure for you.

The cluster should already be onboarded for monitoring; however, if you want to review the monitoring configuration, you can head over to the **Insights** under the **Monitoring** section in the Azure portal. From there, you can click on the **Monitor Settings** button and review/select the appropriate options. More information can be found [here](https://learn.microsoft.com/azure/azure-monitor/containers/kubernetes-monitoring-enable?tabs=cli#enable-full-monitoring-with-azure-portal).

### AKS control plane metrics

As you may know, Kubernetes control plane components are managed by Azure and there are metrics that Kubernetes administrators would like to monitor such as kube-apiserver, kube-scheduler, kube-controller-manager, and etcd. These are metrics that typically were not exposed to AKS users... until now. AKS now offers a preview feature that allows you to access these metrics and visualize them in Azure Managed Grafana. More on this preview feature can be found [here](https://learn.microsoft.com/azure/aks/monitor-aks#monitor-aks-control-plane-metrics-preview). Before you set off to enable this, it is important to consider the [pre-requisites and limitations](https://learn.microsoft.com/azure/aks/monitor-aks#prerequisites-and-limitations) of this feature while it is in preview.

To enable the feature simply run the following command to register the preview feature.

```bash
az feature register \
--namespace "Microsoft.ContainerService" \
--name "AzureMonitorMetricsControlPlanePreview"
```

Once the feature is registered, refresh resource provider.

```bash
az provider register --namespace Microsoft.ContainerService
```

After the feature is registered, you can enable the feature on your existing AKS cluster by running the following command. New clusters will have this feature enabled by default from this point forward.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
```

<div class="info" data-title="Note">

> The AKS cluster must also have been onboarded to Azure Managed Prometheus in order for the data to be collected.

</div>

With Azure Managed Grafana integrated with Azure Managed Prometheus, you can import [kube-apiserver](https://grafana.com/grafana/dashboards/20331-kubernetes-api-server/) and [etcd](https://grafana.com/grafana/dashboards/20330-kubernetes-etcd/) metrics dashboards.

Run the following command to get the name of your Azure Managed Grafana instance.

```bash
AMG_NAME="$(az grafana list -g ${RG_NAME} --query "[0].name" -o tsv)"
```

Run the following command to import the kube-apiserver and etcd metrics dashboards.

```bash
# make sure the amg extension is installed
az extension add --name amg
```

```bash
# import kube-apiserver dashboard
az grafana dashboard import \
--name ${AMG_NAME} \
--resource-group ${RG_NAME} \
--folder 'Azure Managed Prometheus' \
--definition 20331

# import etcd dashboard
az grafana dashboard import \
--name ${AMG_NAME} \
--resource-group ${RG_NAME} \
--folder 'Azure Managed Prometheus' \
--definition 20330
```

Now you, should be able to browse to your Azure Managed Grafana instance and see the kube-apiserver and etcd metrics dashboards in the Azure Managed Prometheus folder.

Out of the box, only the etcd and kube-apiserver metrics data is being collected as part of the [minimal ingestion profile](https://learn.microsoft.com/azure/aks/monitor-aks-reference#minimal-ingestion-profile-for-control-plane-metrics-in-managed-prometheus) for control plane metrics. This profile is designed to provide a balance between the cost of monitoring and the value of the data collected. The others mentioned above will need to be manually enabled and this can be done by deploying a ConfigMap named [ama-metrics-settings-configmap](https://github.com/Azure/prometheus-collector/blob/89e865a73601c0798410016e9beb323f1ecba335/otelcollector/configmaps/ama-metrics-settings-configmap.yaml) in the kube-system namespace.

<div class="info" data-title="Note">

> More on the minimal ingestion profile can be found [here](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-configuration-minimal).

</div>

Run the following command to deploy the `ama-metrics-settings-configmap` in the `kube-system` namespace.

```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/prometheus-collector/89e865a73601c0798410016e9beb323f1ecba335/otelcollector/configmaps/ama-metrics-settings-configmap.yaml
```

Now, you can edit the `ama-metrics-settings-configmap` to enable the metrics you want to collect. Run the following command to edit the `ama-metrics-settings-configmap`.

```bash
kubectl edit cm ama-metrics-settings-configmap -n kube-system
```

Toggle any of the metrics you wish to collect to `true`, but keep in mind that the more metrics you collect, the more resources you will consume.

<div class="info" data-title="Note">

> The Azure team does not offer a [pre-built dashboard](https://grafana.com/orgs/azure/dashboards) for some of these metrics, but you can reference the doc on [supported metrics for Azure Managed Prometheus](https://learn.microsoft.com/azure/aks/monitor-aks-reference#supported-metrics-for-microsoftcontainerservicemanagedclusters) and create your own dashboards in Azure Managed Grafana or search for community dashboards on [Grafana.com](https://grafana.com/grafana/dashboards) and import them into Azure Managed Grafana. Just be sure to use the Azure Managed Prometheus data source.

</div>

### Custom scrape jobs for Azure Managed Prometheus

Typically when you want to scrape metrics from a target, you would create a scrape job in Prometheus. With Azure Managed Prometheus, you can create custom scrape jobs for your AKS cluster using the PodMonitor and ServiceMonitor custom resource definitions (CRDs) that is automatically created when you onboard your AKS cluster to Azure Managed Prometheus. These CRDs are nearly identical to the open-source Prometheus CRDs, with the only difference being the apiVersion. When you deploy a PodMonitor or ServiceMonitor for Azure Managed Prometheus, you will need to specify the apiVersion as `azmonitoring.coreos.com/v1` instead of `monitoring.coreos.com/v1`.

We'll go through a quick example of how to deploy a PodMonitor for a reference app that is deployed to your AKS cluster.

Run the following command to deploy a reference app to the cluster to generate some metrics.

```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/prometheus-collector/refs/heads/main/internal/referenceapp/prometheus-reference-app.yaml
```

Run the following command to deploy a PodMonitor for the reference app

```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/prometheus-collector/refs/heads/main/otelcollector/deploy/example-custom-resources/pod-monitor/pod-monitor-reference-app.yaml
```

Custom resource targets are scraped by pods that start with the name `ama-metrics-*` and the Prometheus Agent web user interface is available on port 9090. So we can port-forward the Prometheus pod to our local machine to access the Prometheus UI and explore all that is configured.

Run the following command to get the name of the Azure Monitor Agent pod.

```bash
cat <<EOF >> .env
AMA_METRICS_POD_NAME="$(kubectl get po -n kube-system -lrsName=ama-metrics -o jsonpath='{.items[0].metadata.name}')"
EOF
source .env
```

Run the following command to port-forward the Prometheus pod to your local machine.

```bash
kubectl port-forward ${AMA_METRICS_POD_NAME} -n kube-system 9090
```

Open a browser and navigate to `http://localhost:9090` to access the Prometheus UI.

If you click on the **Status** dropdown and select **Targets**, you will see the target for **podMonitor/default/prometheus-reference-app-job/0** and the endpoint that is being scraped.

If you click on the **Status** dropdown and select **Service Discovery**, you will see the scrape jobs with active targets and discovered labels for **podMonitor/default/prometheus-reference-app-job/0**.

When you are done, you can stop the port-forwarding by pressing `Ctrl+C`.

Give the scrape job a few moments to collect metrics from the reference app. Once you have given it enough time, you can head over to Azure Managed Grafana and click on the **Explore** tab to query the metrics that are being collected.

More on custom scrape jobs can be found [here](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-scrape-crd) and [here](https://learn.microsoft.com/azure/azure-monitor/containers/prometheus-metrics-troubleshoot#prometheus-interface)

### AKS Cost Analysis

Cost for AKS clusters can be managed like any other resource in Azure, via the [Azure Cost Analysis](https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview/openedBy/AzurePortal) blade.

Using the Cost Analysis blade, you can view the cost of your Azure resources overtime and can be scoped by management group, subscription, and resource group with further filters and views for more granular analysis. To learn more about Azure Cost Analysis, see [the quickstart guide](https://learn.microsoft.com/azure/cost-management-billing/costs/quick-acm-cost-analysis).

When it comes to Kubernetes, you would want to see a more granular view of the compute, networking, and storage costs associated with Kubernetes namespaces. This is where the AKS Cost Analysis add-on comes in. The AKS Cost Analysis add-on is built on the [OpenCost](https://www.opencost.io/) project, with is a CNCF incubating project that provides a Kubernetes-native cost analysis solution.

You can always install the open-source project into your AKS cluster by following these [instructions](https://www.opencost.io/docs/configuration/azure) but it might be easiest to enable the AKS Cost Analysis add-on to your AKS cluster.

There are a few pre-requisites to enable the AKS Cost Analysis add-on to your AKS cluster and they are documented [here](https://learn.microsoft.com/azure/aks/cost-analysis#prerequisites-and-limitations). Once you have met the pre-requisites, you can enable the AKS Cost Analysis add-on to your AKS cluster.

Run the following command to enable the AKS Cost Analysis add-on to your AKS cluster.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--enable-cost-analysis
```

It can take a few minutes to enable the AKS Cost Analysis add-on to your AKS cluster and up to 24 hours for cost data to be populated up to the Cost Analysis blade. But when it is ready, you can view the cost of your AKS cluster and its namespaces by navigating to the [Azure Cost Analysis](https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview/openedBy/AzurePortal) blade. Once you scope to a management group, subscription, or resource group that contains your AKS cluster, you should see a button labeled "Kubernetes clusters". Clicking on this button will take you to the AKS Cost Analysis blade where you can view the cost of your AKS cluster and its namespaces.

![AKS Cost Analysis](./assets/aks-cost-analysis.png)

If you expand the AKS cluster, you will see a list of all the Azure resources that are associated with it.

![AKS Cost Analysis Cluster](./assets/aks-cost-analysis-cluster.png)

If you click on the AKS cluster, you will see a list of all compute, networking, and storage costs associated with namespaces in the AKS cluster.

![AKS Cost Analysis Namespace](./assets/aks-cost-analysis-namespace.png)

It also shows you the "idle charges" which is a great way to see if you are over-provisioning your AKS cluster or if you any opportunities to optimize your AKS cluster.

---

## Update and Multi-Cluster Management

Maintaining your AKS cluster's updates is crucial for operational hygiene. Neglecting this can lead to severe issues, including losing support and becoming vulnerable to known CVEs (Common Vulnerabilities and Exposures) attacks. In this section, we will look and examine all tiers of your AKS infrastructure, and discuss and show the procedures and best practices to keep your AKS cluster up-to-date.

### API Server upgrades

AKS is a managed Kubernetes service provided by Azure. Even though AKS is managed, flexibility has been given to customer on controlling the version of the API server they use in their environment. As newer versions of Kubernetes become available, those versions are tested and made available as part of the service. As newer versions are provided, older versions of Kubernetes are phased out of the service and are no longer available to deploy. Staying within the spectrum of supported versions, will ensure you don't compromise support for your AKS cluster.

You have two options for upgrading your AKS API server, you can do manual upgrades at your own designated schedule, or you can configure cluster to subscribe to an auto-upgrade channel. These two options provides you with the flexibility to adopt the most appropriate choice depending on your organizations policies and procedures.

<div class="info" data-title="Note">

> When you upgrade a supported AKS cluster, you can't skip Kubernetes minor versions. For more information please see [Kubernetes version upgrades](https://learn.microsoft.com/azure/aks/upgrade-aks-cluster?tabs=azure-cli#kubernetes-version-upgrades)

</div>

#### Manually Upgrading the API Server and Nodes

The first step in manually upgrading your AKS API server is to view the current version, and the available upgrade versions.

```bash
az aks get-upgrades \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--output table
```

We can also, quickly look at the current version of Kubernetes running on the nodes in the nodepools by running the following:

```bash
kubectl get nodes
```

We can see all of the nodes in both the system and user node pools are at version `1.29.9` as well.

```text
NAME                                 STATUS   ROLES    AGE    VERSION
aks-systempool-14753261-vmss000000   Ready    <none>   123m   v1.29.9
aks-systempool-14753261-vmss000001   Ready    <none>   123m   v1.29.9
aks-systempool-14753261-vmss000002   Ready    <none>   123m   v1.29.9
aks-userpool-27827974-vmss000000     Ready    <none>   95m    v1.29.9
```

Run the following command to upgrade the current cluster API server, and the Kubernetes version running on the nodes, from version `1.29.9` to version `1.30.5`.

```bash
az aks upgrade \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--kubernetes-version "1.30.5"
```

<div class="info" data-title="Note">

> The az aks upgrade command has the ability to separate the upgrade operation to specify just the control plane and/or the node version. In this lab we will run the command that will upgrade both the control plan and nodes at the same time.

</div>

Follow the prompts to confirm the upgrade operation. Once the AKS API version has been completed on both the control plane and nodes, you will see a completion message with the updated Kubernetes version shown.

#### Setting up the auto-upgrade channel for the API Server and Nodes

A more preferred method for upgrading your AKS API server and nodes is to configure the cluster auto-upgrade channel for your AKS cluster. This feature allow you a "set it and forget it" mechanism that yields tangible time and operational cost benefits. By enabling auto-upgrade, you can ensure your clusters are up to date and don't miss the latest features or patches from AKS and upstream Kubernetes.

There are several auto-upgrade channels you can subscribe your AKS cluster to. Those channels include **none**, **patch**, **stable**, and **rapid**. Each channel provides a different upgrade experience depending on how you would like to keep your AKS clusters upgraded. For a more detailed explanation of each channel, please view the [cluster auto-upgrade channels](https://learn.microsoft.com/azure/aks/auto-upgrade-cluster?tabs=azure-cli#cluster-auto-upgrade-channels) table.

For this lab demonstration, we will configure the AKS cluster to subscribe to the **patch** channel. The patch channel will automatically upgrades the cluster to the latest supported patch version when it becomes available while keeping the minor version the same.

Run the following command to set the auto-upgrade channel.

```bash
az aks update \
--resource-group ${RG_NAME} \
--name ${AKS_NAME} \
--auto-upgrade-channel patch
```

Once the auto-upgrade channel subscription has been enabled for your cluster, you will see the `upgradeChannel` property updated to the chosen channel in the output.

<div class="important" data-title="Important">

> Configuring your AKS cluster to an auto-upgrade channel can have impact on the availability of workloads running on your cluster. Please review the additional options available to [Customize node surge upgrade](https://learn.microsoft.com/azure/aks/upgrade-aks-cluster?tabs=azure-cli#customize-node-surge-upgrade).

</div>

### Node image updates

In addition to you being able to upgrade the Kubernetes API versions of both your control plan and nodepool nodes, you can also upgrade the operating system (OS) image of the VMs for your AKS cluster. AKSregularly provides new node images, so it's beneficial to upgrade your node images frequently to use the latest AKS features. Linux node images are updated weekly, and Windows node images are updated monthly.

Upgrading node images is critical to not only ensuring the latest Kubernetes API functionality will be available from the OS, but also to ensure that the nodes in your AKS cluster have the latest security and CVE patches to prevent any vulnerabilities in your environment.

#### Manually Upgrading AKS Node Image

When planning to manually upgrade your AKS cluster, it's good practice to view the available images.

Run the following command to view the available images for your the system node pool.

```bash
az aks nodepool get-upgrades \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--nodepool-name systempool
```

The command output shows the `latestNodeImageVersion` available for the nodepool.

Check the current node image version for the system node pool by running the following command.

```bash
az aks nodepool show \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--name systempool \
--query "nodeImageVersion"
```

In this particular case, the system node pool image is the most recent image available as it matches the latest image version available, so there is no need to do an upgrade operation for the node image. If you needed to upgrade your node image, you can run the following command which will update all the node images for all node pools connected to your cluster.

```bash
az aks upgrade \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--node-image-only
```

### Maintenance windows

Maintenance windows provides you with the predictability to know when maintenance from Kubernetes API updates and/or node OS image updates will occur. The use of maintenance windows can help align to your current organizational operational policies concerning when services are expected to not be available.

There are currently three configuration schedules for maintenance windows, **default**, **aksManagedAutoUpgradeSchedule**, and **aksManagedNodeOSUpgradeSchedule**. For more specific information on these configurations, please see [Schedule configuration types for planned maintenance](https://learn.microsoft.com/azure/aks/planned-maintenance?tabs=azure-cli#schedule-configuration-types-for-planned-maintenance).

It is recommended to use **aksManagedAutoUpgradeSchedule** for all cluster upgrade scenarios and aksManagedNodeOSUpgradeSchedule for all node OS security patching scenarios.

<div class="info" data-title="Note">

> The default option is meant exclusively for AKS weekly releases. You can switch the default configuration to the **aksManagedAutoUpgradeSchedule** or **aksManagedNodeOSUpgradeSchedule** configuration by using the `az aks maintenanceconfiguration update` command.

</div>

When creating a maintenance window, it is good practice to see if any existing maintenance windows have already been configured. Checking to see if existing maintenance windows exists will avoid any conflicts when applying the setting. To check for the maintenance windows on an existing AKS cluster, run the following command:

```bash
az aks maintenanceconfiguration list \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME}
```

If you receive `[]` as output, this means no maintenance windows exists for the AKS cluster specified.

#### Adding an AKS Cluster Maintenance Windows

Maintenance window configuration is highly configurable to meet the scheduling needs of your organization. For an in-depth understanding of all the properties available for configuration, please see the [Create a maintenance window](https://learn.microsoft.com/azure/aks/planned-maintenance?tabs=azure-cli#create-a-maintenance-window) guide.

The following command will create a `default` configuration that schedules maintenance to run from 1:00 AM to 2:00 AM every Sunday.

```bash
az aks maintenanceconfiguration add \
--resource-group ${RG_NAME} \
--cluster-name ${AKS_NAME} \
--name default \
--weekday Sunday \
--start-hour 1
```

### Azure Fleet

Azure Kubernetes Fleet Manager (Fleet) enables at-scale management of multiple Azure Kubernetes Service (AKS) clusters. Fleet supports the following scenarios:

- Create a Fleet resource and join AKS clusters across regions and subscriptions as member clusters
- Orchestrate Kubernetes version upgrades and node image upgrades across multiple clusters by using update runs, stages, and groups
- Automatically trigger version upgrades when new Kubernetes or node image versions are published (preview)
- Create Kubernetes resource objects on the Fleet resource's hub cluster and control their propagation to member clusters
- Export and import services between member clusters, and load balance incoming layer-4 traffic across service endpoints on multiple clusters (preview)

For this section of the lab we will focus on two AKS Fleet Manager features, creating a fleet and joining member clusters, and propagating resources from a hub cluster to a member clusters.

You can find and learn about additional AKS Fleet Manager concepts and functionality on the [Azure Kubernetes Fleet Manager](https://learn.microsoft.com/azure/kubernetes-fleet/) documentation page.

#### Create Additional AKS Cluster

<div class="info" data-title="Note">

> If you already have an additional AKS cluster, in addition to your original lab AKS cluster, you can skip this section.

</div>

To understand how AKS Fleet Manager can help manage multiple AKS clusters, we will need to create an additional AKS cluster to join as a member cluster. The following commands and instructions will deploy an additional AKS cluster into the same Azure resource group as your existing AKS cluster. For this lab purposes, it is not necessary to deploy the additional cluster in a region and/or subscription to show the benefits of AKS Fleet Manager.

Run the following command to save the new AKS cluster name to the `.env` file and reload the environment variables.

```bash
cat <<EOF >> .env
AKS_NAME_2="${AKS_NAME}-2"
EOF
source .env
```

Run the following command to create a new AKS cluster.

```bash
az aks create \
--resource-group ${RG_NAME} \
--name ${AKS_NAME_2} \
--no-wait
```

<div class="info" data-title="Note">

> This command will take a few minutes to complete. You can proceed with the next steps while the command is running.

</div>

#### Create and configure Access for a Kubernetes Fleet Resource with Hub Cluster

Since this lab will be using AKS Fleet Manager for Kubernetes object propagation, you will need to create the Fleet resource with the hub cluster enabled by specifying the --enable-hub parameter with the az fleet create command. The hub cluster will orchestrate and manage the Fleet member clusters. We will add the lab's original AKS cluster and the newly created additional cluster as a member of the Fleet group in a later step.

In order to use the AKS Fleet Manager extension, you will need to install the extension. Run the following command to install the AKS Fleet Manager extension.

```bash
az extension add --name fleet
```

Run the following command to create new environment variables for the Fleet resource name and reload the environment variables.

```bash
cat <<EOF >> .env
FLEET_NAME="myfleet${RANDOM}"
EOF
source .env
```

Next run the following command to create the Fleet resource with the hub cluster enabled.

```bash
FLEET_ID="$(az fleet create \
--resource-group ${RG_NAME} \
--name ${FLEET_NAME} \
--location ${LOCATION} \
--enable-hub \
--query id \
--output tsv)"
```

Add the `FLEET_ID` to the `.env` file and reload the environment variables.

```bash
echo "FLEET_ID=${FLEET_ID}" >> .env
source .env
```

Once the Kubernetes Fleet hub cluster has been created, we will need to gather the credential information to access it. This is similar to using the `az aks get-credentials` command on an AKS cluster. Run the following command to get the Fleet hub cluster credentials.

```bash
az fleet get-credentials \
--resource-group ${RG_NAME} \
--name ${FLEET_NAME}
```

Now that you have the credential information merged to your local Kubernetes config file, we will need to configure and authorize Azure role access for your account to access the Kubernetes API for the Fleet resource.

Once we have all of the terminal environment variables set, we can run the command to add the Azure account to be a "Azure Kubernetes Fleet Manager RBAC Cluster Admin" role on the Fleet resource.

```bash
az role assignment create \
--role "Azure Kubernetes Fleet Manager RBAC Cluster Admin" \
--assignee "$(az ad signed-in-user show --query "id" --output tsv)" \
--scope ${FLEET_ID}
```

#### Joining Existing AKS Cluster to the Fleet

Now that we have our Fleet hub cluster created, along with the necessary Fleet API access, we're now ready to join our AKS clusters to Fleet as member servers. To join AKS clusters to Fleet, we will need the Azure subscription path to each AKS object. To get the subscription path to your AKS clusters, you can run the following commands.

<div class="info" data-title="Note">

> The following commands are referencing environment variables created in the earlier terminal session. If you are using a new terminal session, please create the `SUBSCRIPTION_ID`, `RESOURCE_GROUP`, and `FLEET_NAME` variables before proceeding.

</div>

```bash
cat <<EOF >> .env
AKS_FLEET_CLUSTER_1_NAME="$(echo ${AKS_NAME} | tr '[:upper:]' '[:lower:]')"
AKS_FLEET_CLUSTER_2_NAME="$(echo ${AKS_NAME_2} | tr '[:upper:]' '[:lower:]')"
AKS_FLEET_CLUSTER_1_ID="$(az aks show --resource-group ${RG_NAME} --name ${AKS_FLEET_CLUSTER_1_NAME} --query "id" --output tsv)"
AKS_FLEET_CLUSTER_2_ID="$(az aks show --resource-group ${RG_NAME} --name ${AKS_FLEET_CLUSTER_2_NAME} --query "id" --output tsv)"
EOF
source .env
```

Run the following command to join both AKS clusters to the Fleet.

```bash
# add first AKS cluster to the Fleet
az fleet member create \
--resource-group ${RG_NAME} \
--fleet-name ${FLEET_NAME} \
--name ${AKS_FLEET_CLUSTER_1_NAME} \
--member-cluster-id ${AKS_FLEET_CLUSTER_2_ID}

# add the second AKS cluster to the Fleet
az fleet member create \
--resource-group ${RG_NAME} \
--fleet-name ${FLEET_NAME} \
--name ${AKS_FLEET_CLUSTER_2_NAME} \
--member-cluster-id ${AKS_FLEET_CLUSTER_2_ID}
```

Once the `az fleet member create` command has completed for both AKS clusters, we can verify they have both been added and enabled for Fleet running the following command.

```bash
kubectl get memberclusters
```

#### Propagate Resources from a Hub Cluster to Member Clusters

The ClusterResourcePlacement API object is used to propagate resources from a hub cluster to member clusters. The ClusterResourcePlacement API object specifies the resources to propagate and the placement policy to use when selecting member clusters. The ClusterResourcePlacement API object is created in the hub cluster and is used to propagate resources to member clusters. This example demonstrates how to propagate a namespace to member clusters using the ClusterResourcePlacement API object with a PickAll placement policy.

<div class="important" data-title="Important">

> Before running the following commands, make sure your `kubectl conifg` has the Fleet hub cluster as it's current context. To check your current context, run the `kubectl config current-context` command. You should see the output as `hub`. If the output is not `hub`, please run `kubectl config set-context hub`.

</div>

Run the following command to create a namespace to place onto the member clusters.

```bash
kubectl create namespace my-fleet-ns
```

Run the following command to create a ClusterResourcePlacement API object in the hub cluster to propagate the namespace to the member clusters.

```bash
kubectl apply -f - <<EOF
apiVersion: placement.kubernetes-fleet.io/v1beta1
kind: ClusterResourcePlacement
metadata:
  name: my-lab-crp
spec:
  resourceSelectors:
    - group: ""
      kind: Namespace
      version: v1
      name: my-fleet-ns
  policy:
    placementType: PickAll
EOF
```

Check the progress of the resource propagation using the following command.

```bash
kubectl get clusterresourceplacement my-lab-crp
```

View the details of the ClusterResourcePlacement object using the following command.

```bash
kubectl describe clusterresourceplacement my-lab-crp
```

---

## Summary

### Additional Resources

- [Cluster operator and developer best practices to build and manage applications on Azure Kubernetes Service (AKS)](https://learn.microsoft.com/azure/aks/best-practices)
- [Set up Advanced Network Observability for Azure Kubernetes Service (AKS)](https://learn.microsoft.com/azure/aks/advanced-network-observability-cli?tabs=cilium)
- Private cluster
- Secure baseline
- etc.
