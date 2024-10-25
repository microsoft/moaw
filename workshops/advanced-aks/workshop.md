---
published: true # Optional. Set to true to publish the workshop (default: false)
type: workshop # Required.
title: Advanced AKS and Day 2 Operations # Required. Full title of the workshop
short_title: Advanced AKS and Day 2 Operations # Optional. Short title displayed in the header
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

This workshop will guide you through advanced scenarios and day 2 operations for Azure Kubernetes Service (AKS). We will cover topics such as cluster sizing and topology, advanced networking and storage concepts, security concepts, monitoring concepts, and cluster update management.

---

## Objectives

After completing this workshop, you will be able to:

- Deploy and manage multiple AKS clusters
- Develop secure applications using Workload Identity on AKS
- Monitor AKS clusters using Azure Managed Prometheus and Grafana
- Manage cluster updates and maintenance.
- Manage costs with AKS Cost Analysis.

---

## Prerequisites

To complete this workshop, you will need:

- An [Azure subscription](https://azure.microsoft.com/) and permissions to create resources. The subscription should also have enough vCPU quota to create multiple AKS clusters in multiple regions. If you don't have enough quota, you can request an increase. Check [here](https://docs.microsoft.com/azure/azure-portal/supportability/per-vm-quota-requests) for more information.
- A [GitHub account](https://github.com/signup)
- Azure CLI. You can install it from [here](https://docs.microsoft.com/cli/azure/install-azure-cli). You may also want to install the aks-preview extension. You can find out how to do that [here](https://learn.microsoft.com/en-us/azure/aks/draft#install-the-aks-preview-azure-cli-extension)
- kubectl - You can see how to install kubectl [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Helm - You can see how to install Helm [here](https://helm.sh/docs/intro/install/)

---

## Cluster Sizing and Topology

- Multiple clusters
- Multitenancy
- Availability Zones

---

## Advanced Networking Concepts

### Azure Container Networking Services

### Istio Service Mesh

Istio is an open-source service mesh that layers transparently onto existing distributed applications. Istio’s powerful features provide a uniform and more efficient way to secure, connect, and monitor services. Istio enables load balancing, service-to-service authentication, and monitoring – with few or no service code changes. Its powerful control plane brings vital features, including:

- Secure service-to-service communication in a cluster with TLS (Transport Layer Security) encryption, strong identity-based authentication, and authorization.
- Automatic load balancing for HTTP, gRPC, WebSocket, and TCP traffic.
- Fine-grained control of traffic behavior with rich routing rules, retries, failovers, and fault injection.
- A pluggable policy layer and configuration API supporting access controls, rate limits, and quotas.
- Automatic metrics, logs, and traces for all traffic within a cluster, including cluster ingress and egress.

Istio is integrated with AKS as an addon and is supported alongside AKS. 

> NOTE: Please be aware that the Istio addon for AKS does not provide the full functionality of the Istio upstream project. You can view the current limitations for this AKS Istio addon [here](https://learn.microsoft.com/azure/aks/istio-about#limitations) and what is currently [Allowed, supported, and blocked MeshConfig values](https://learn.microsoft.com/azure/aks/istio-meshconfig#allowed-supported-and-blocked-meshconfig-values)

#### Deploy Istio service mesh add-on

Before deploying the AKS Istio add-on, you may want to check the revision of Istio to ensure it is compatible with the version of Kubernetes on the cluster. To check the available revisions in the `westus2` region, run the following command:

```bash
az aks mesh get-revisions --location westus2
```

The previous command shows the following output.

```bash
{
  "meshRevisions": [
    {
      "compatibleWith": [
        {
          "name": "kubernetes",
          "versions": [
            "1.27",
            "1.28",
            "1.29",
            "1.30"
          ]
        }
      ],
      "revision": "asm-1-22",
      "upgrades": [
        "asm-1-23"
      ]
    },
    {
      "compatibleWith": [
        {
          "name": "kubernetes",
          "versions": [
            "1.27",
            "1.28",
            "1.29",
            "1.30",
            "1.31"
          ]
        }
      ],
      "revision": "asm-1-23",
      "upgrades": null
    }
  ]
}
```

We can interpret the output to say that the AKS Istio revision `asm-1-22` is compatible with the Kubernetes versions `1.27` through `1.30` and Istio revision `asm-1-23` is compatible with Kubernetes versions `1.27` through `1.31`. 

Run the following command to enable the default supported revision of the AKS Istio add-on for the AKS cluster.

```bash
az aks mesh enable --resource-group myResourceGroup --name myAKSCluster
```

The enable process is now in process. This will take several moments to complete.

```bash
 / Running ..
```

Once completed, the output will show the `serviceMeshProfile` section as below.

```bash
...
 "serviceMeshProfile": {
    "istio": {
      "certificateAuthority": null,
      "components": {
        "egressGateways": null,
        "ingressGateways": null
      },
      "revisions": [
        "asm-1-22"
      ]
    },
    "mode": "Istio"
  },
...
```

In addition to the verification output, you can run the following command to view the Istio pods on the cluster.

```bash
kubectl get pods -n aks-istio-system
```

You should see the following similar output.

```bash
NAME                               READY   STATUS    RESTARTS   AGE
istiod-asm-1-22-5d6d4f8b44-2nwgl   1/1     Running   0          2m30s
istiod-asm-1-22-5d6d4f8b44-7q8jm   1/1     Running   0          2m45s
```

#### Deploy Sample AKS Store Demo Application

> NOTE: If your cluster already has a deployment of the AKS Store Demo application, you can skip this section.

A Service Mesh is primarily used to secure the communications between services running in a Kubernetes cluster. We will use the AKS Store Demo application to work through some of the most common tasks you will use the Istio AKS add-on service mesh for. 

Install the AKS Store Demo application in the `aks-store` namespace using the following command:

```bash
kubectl create ns aks-store

kubectl apply -f https://raw.githubusercontent.com/Azure-Samples/aks-store-demo/refs/heads/main/aks-store-quickstart.yaml -n aks-store
```

This will install the AKS Store Demo application and you should see the following output.

```bash
namespace/aks-store created

statefulset.apps/rabbitmq created
configmap/rabbitmq-enabled-plugins created
service/rabbitmq created
deployment.apps/order-service created
service/order-service created
deployment.apps/product-service created
service/product-service created
deployment.apps/store-front created
service/store-front created
```

You can verify the AKS Store Demo application was installed with the following command:

```bash
kubectl get all -n aks-store
```

You should see similar output as below.

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
pod/order-service-5cd94fbc74-mn22t    1/1     Running   0          2m51s
pod/product-service-b7cbc9bd7-v9z2r   1/1     Running   0          2m49s
pod/rabbitmq-0                        1/1     Running   0          2m52s
pod/store-front-68846476f4-qsbd7      1/1     Running   0          2m48s

NAME                      TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)              AGE
service/order-service     ClusterIP      10.0.146.183   <none>          3000/TCP             2m50s
service/product-service   ClusterIP      10.0.26.233    <none>          3002/TCP             2m49s
service/rabbitmq          ClusterIP      10.0.24.182    <none>          5672/TCP,15672/TCP   2m51s
service/store-front       LoadBalancer   10.0.9.91      4.237.243.246   80:32311/TCP         2m48s

NAME                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/order-service     1/1     1            1           2m51s
deployment.apps/product-service   1/1     1            1           2m49s
deployment.apps/store-front       1/1     1            1           2m48s

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/order-service-5cd94fbc74    1         1         1       2m52s
replicaset.apps/product-service-b7cbc9bd7   1         1         1       2m50s
replicaset.apps/store-front-68846476f4      1         1         1       2m49s

NAME                        READY   AGE
statefulset.apps/rabbitmq   1/1     2m53s
```

#### Enable Sidecar Injection

Service meshes traditionally work by deploying an additional container within the same pod as your application container. These additional containers are refered to as a sidecar or a sidecar proxy. These sidecar proxy receive policy and configuration from the service mesh control plane and insert themselves in the communication path of your applciation, to control the traffic to and from your application pod. 

The first step to onboarding your application into a service mesh, is to enable sidecar injection for your application pods. To control which applications are onboarded to the service mesh, we can target specific Kubernetes namespaces where applications are deployed. 
> NOTE: For upgrade scenarios, it is possible to run multiple Istio add-on control planes with different versions. The following command enables sidecar injection for the Istio revision `asm-1-22`. If you are not sure which revision is installed on the cluster, you can run the following command `az aks show --resource-group myResourceGroup --name myAKSCluster  --query 'serviceMeshProfile.istio.revisions'`

Prior to running the command to enable the Istio sidecar injection, let first view the existing pods in the `aks-store` namespace.

```bash
kubectl get pods -n aks-store
```

In the output of getting the pods in the `aks-store` namespace, you will notice in the `READY` column the number of containers in each pod, with is `1/1` meaning there is currently only one container for each pod.

```bash
NAME                              READY   STATUS    RESTARTS   AGE
order-service-5cd94fbc74-mn22t    1/1     Running   0          24m
product-service-b7cbc9bd7-v9z2r   1/1     Running   0          24m
rabbitmq-0                        1/1     Running   0          24m
store-front-68846476f4-qsbd7      1/1     Running   0          24m
```

The following command will enable the AKS Istio add-on sidecar injection for the `aks-store` namespace for the Istio revision `1.22`.


```bash
kubectl label namespace aks-store istio.io/rev=asm-1-22

namespace/aks-store labeled
```

At this point, we have just simply labeled the namespace, instructing the Istio control plane to enable sidecar injection on new deployments into the namespace. Since we have existing deployments in the namespace already, we will need to restart teh deployments to trigger the sidecar inject.

Get a list of all the current deployment names in the `aks-store` namepace.

```bash
kubectl get deploy -n aks-store

NAME              READY   UP-TO-DATE   AVAILABLE   AGE
order-service     1/1     1            1           26m
product-service   1/1     1            1           26m
store-front       1/1     1            1           26m
```

Restart the deployments for the `order-service`, `product-service`, and `store-front`.

```bash
kubectl rollout restart deployment -n aks-store order-service
kubectl rollout restart deployment -n aks-store product-service
kubectl rollout restart deployment -n aks-store store-front

deployment.apps/order-service restarted
deployment.apps/product-service restarted
deployment.apps/store-front restarted
```

If we re-run the get pods command for the `aks-store` namespace, we'll see the following output showing the additional sidecar for the deployments we restarted.

```bash
NAME                               READY   STATUS    RESTARTS   AGE
order-service-98ff99c4b-8xpjn      2/2     Running   0          4m28s
product-service-76fc89b74d-9llrb   2/2     Running   0          4m19s
rabbitmq-0                         1/1     Running   0          42m
store-front-5cb5c59d4c-j2f9v       2/2     Running   0          4m10s
```

You will notice all of the deployments now have a `READY` state of `2/2`, meaning the pods now include the sidecar proxy for Istio. The RabbitMQ for the AKS Store application is actually a stateful set and we will need to redeploy the stateful set.

```bash
kubectl rollout restart statefulset -n aks-store rabbitmq

statefulset.apps/rabbitmq restarted
```

If you again re-run the get pods command for the `aks-store` namespace, we'll see all the pods with a `READY` state of `2/2`

```bash
NAME                               READY   STATUS    RESTARTS   AGE
order-service-98ff99c4b-8xpjn      2/2     Running   0          23m
product-service-76fc89b74d-9llrb   2/2     Running   0          22m
rabbitmq-0                         2/2     Running   0          35s
store-front-5cb5c59d4c-j2f9v       2/2     Running   0          22m
```

#### Verify the Istio Mesh is Controlling Mesh Communicaitons

We will walk through some common configurations to ensure the communications for the AKS Store application are secured. To begin we will deploy a Curl utility container to the cluster, so we can execute traffic commands from it to test out the Istio mesh policy. 

Use the following command to deploy the Curl image to the `default` namespace of the cluster.

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

deployment.apps/curl-deployment created
```

We can verify the deployment of BusyBox using the following command:

```bash
kubectl get pods -n default

NAME                                  READY   STATUS    RESTARTS   AGE
curl-deployment-b747fd9ff-dlcft       1/1     Running   0          66s
```



##### Configure MTLS Strict Mode for AKS Store Namespace

Currently Istio configures workloads to use MTLS when calling other workloads, but the default permissive mode allows a service to accept traffic in plaintext or MTLS traffic. To ensure that the workloads we manage with the Istio add-on only accept MTLS communication, we will deploy a Peer Authentication policy to enforce only MTLS traffic for the workloads in the `aks-store` namespace.

Prior to deploying the MTLS strict mode, let's verify that the `store-front` service will respond to a client not using MTLS. We will invoke a call from the `curl` pod to the `store-front` service and see if we get a response. Run the following command to curl to the `store-front` service.

```bash
kubectl exec -it $(kubectl get pod -l app=curl -o jsonpath="{.items[0].metadata.name}") -- curl store-front.aks-store.svc.cluster.local:80

<!doctype html><html lang=""><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico"><title>store-front</title><script defer="defer" src="/js/chunk-vendors.1541257f.js"></script><script defer="defer" src="/js/app.1a424918.js"></script><link href="/css/app.0f9f08e7.css" rel="stylesheet"></head><body><noscript><strong>We're sorry but store-front doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div></body></html>
```

As you can see, HTML was returned to the client meaning that the `store-front` service successfully responed to the client in plaintext. Let's now apply the Peer Authentication policy that will enforce all services in the `aks-store` namespace to only use MTLS communication. Run the following command to configure the MTLS Peer Authentication policy.

```bash
kubectl apply -n aks-store -f - <<EOF
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: aks-store-default
spec:
  mtls:
    mode: STRICT
EOF

peerauthentication.security.istio.io/aks-store-default created
```

Once the MTLS strict mode peer authentication policy has been applied, we will now see if we can again get a response back from the `store-front` service from a client not using MTLS. Run the following command to curl to the `store-front` service again.

```bash
kubectl exec -it $(kubectl get pod -l app=curl -o jsonpath="{.items[0].metadata.name}") -- curl store-front.aks-store.svc.cluster.local:80

curl: (56) Recv failure: Connection reset by peer
command terminated with exit code 56
```

Notice that the curl client did not receive the HTML from the prior attempt. The error returned is the indication that the MTLS policy has been enfornced, and that the `store-front` service has rejected the non MTLS communication from the curl client.

#### Deploying External Istio Ingress

By default, services are not accessible from outside the cluster. When managing your workloads with the Istio service mesh, you want to ensure that if you expose a service for communications outside the cluster, mesh policy configurations can still be preserved. 

The AKS Istio AKS add-on comes with both a external and internal ingerss gateway that you can utilize to expose your services in the service mesh. In the following steps, we will show how to enable an external ingerss gateway to allow the `store-front` service to be reached from outside the cluster.

The following command will enable the Istio ingress gateway on the AKS cluster. This may take several moments.

```bash
az aks mesh enable-ingress-gateway --resource-group myResourceGroup --name myAKSCluster --ingress-gateway-type external

 / Running ..
```

Once the Istio ingress gateway has been enabled on the AKS cluster, you will see the following output.

```bash
...
  "serviceMeshProfile": {
    "istio": {
      "certificateAuthority": null,
      "components": {
        "egressGateways": null,
        "ingressGateways": [
          {
            "enabled": true,
            "mode": "External"
          }
        ]
      },
      "revisions": [
        "asm-1-22"
      ]
    },
    "mode": "Istio"
  },
...
```
Use `kubectl get svc` to check the service mapped to the ingress gateway:

```bash
kubectl get svc aks-istio-ingressgateway-external -n aks-istio-ingress

NAME                                TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)
       AGE
aks-istio-ingressgateway-external   LoadBalancer   10.0.133.198   <EXTERNAL_IP>   15021:32686/TCP,80:30989/TCP,443:30790/TCP   108s
```

> NOTE: It is important to make note of your cluster `EXTERNAL-IP` address. That will be the public endpoint to reach the service we configure for using the external ingress

Next we will create both the `Gateway` and `VirtualService` for the `store-front` service.

```bash
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: aks-store-gateway-external
spec:
  selector:
    istio: aks-istio-ingressgateway-external
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: store-front-external
  namespace: aks-store
spec:
  hosts:
  - store-front.aks-store.svc.cluster.local
  gateways:
  - aks-store-gateway-external
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: store-front.aks-store.svc.cluster.local
        port:
          number: 80
EOF

gateway.networking.istio.io/aks-store-gateway-external created
virtualservice.networking.istio.io/store-front-external created
```

Set environment variables for external ingress host and ports:

```bash
export INGRESS_HOST_EXTERNAL=$(kubectl -n aks-istio-ingress get service aks-istio-ingressgateway-external -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT_EXTERNAL=$(kubectl -n aks-istio-ingress get service aks-istio-ingressgateway-external -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
export GATEWAY_URL_EXTERNAL=$INGRESS_HOST_EXTERNAL:$INGRESS_PORT_EXTERNAL
```

Retrieve the external address of the AKS Store application:

```bash
echo "http://$GATEWAY_URL_EXTERNAL/productpage"
```

---

## Advanced Storage Concepts

### Azure Container Storage

---

## Advanced Security Concepts

### Workload Identity

### Secure Supply Chain

- Image Integrity
- Image Cleaner

---

## Advanced Monitoring Concepts

### Azure Managed Prometheus

- ServiceMonitor
- PodMonitor

### AKS Cost Analysis

---

## Cluster Update Management

Maintaining your AKS cluster's updates is crucial for operational hygiene. Neglecting this can lead to severe issues, including losing support and becoming vulnerable to known CVEs (Common Vulnerabilities and Exposures) attacks. In this section, we will look and examine all tiers of your AKS infrastructure, and discuss and show the procedures and best practices to keep your AKS cluster up-to-date.

### API Server upgrades

AKS is a managed Kubernetes service provided by Azure. Even though AKS is managed, flexibility has been given to customer on controlling the version of the API server they use in thier environment. As newer versions of Kubernetes become available, those versions are tested and made available as part of the service. As newer versions are provided, older versions of Kubernetes are phased out of the service and are no longer available to deploy. Staying within the spectrum of supported versions, will ensure you don't compromise support for your AKS cluster. 

You have two options for upgrading your AKS API server, you can do manual upgrades at your own designated schedule, or you can configure cluster to subscribe to an auto-upgrade channel. These two options provides you with the flexibility to adopt the most appropriate choice depending on your organizations policies and procedures. 

> NOTE: When you upgrade a supported AKS cluster, you can't skip Kubernetes minor versions. For more information please see [Kubernetes version upgrades](https://learn.microsoft.com/azure/aks/upgrade-aks-cluster?tabs=azure-cli#kubernetes-version-upgrades)

#### Manually Upgrading the API Server and Nodes

The first step in manually upgrading your AKS API server is to view the current version, and the available upgrade versions.

```bash
az aks get-upgrades --resource-group myResourceGroup --name myAKSCluster --output table
```

In the following command output, the current version of the AKS API server is `1.28.0` and there is a long list of available upgrade versions including the next increment minor version available.

```bash
{
  "agentPoolProfiles": null,
  "controlPlaneProfile": {
    "kubernetesVersion": "1.28.0",
    "name": null,
    "osType": "Linux",
    "upgrades": [
      {
        "isPreview": null,
        "kubernetesVersion": "1.28.14"
      },
      {
        "isPreview": null,
        "kubernetesVersion": "1.28.13"
      },
      {
        "isPreview": null,
        "kubernetesVersion": "1.28.12"
      },
...
      {
        "isPreview": null,
        "kubernetesVersion": "1.29.9"
      },
...
```

We can also, quickly look at the current version of Kuberentes running on the nodes in the nodepools by running the following:

```bash
kubectl get nodes
```

We can see all of the nodes in both the system and user node pools are at version `1.29.9` as well.

```bash
NAME                                STATUS   ROLES   AGE    VERSION
aks-agentpool-45861169-vmss000000   Ready    agent   131m   v1.28.0
aks-agentpool-45861169-vmss000001   Ready    agent   131m   v1.28.0
aks-userpool-45861169-vmss000000    Ready    agent   131m   v1.28.0
aks-userpool-45861169-vmss000001    Ready    agent   131m   v1.28.0
```

We will upgrade the current cluster API server, and the Kubernetes version running on the nodes, from version `1.28.0` to version `1.29.9`. Run the following command to upgrade the AKS API server version.

> NOTE: The az aks upgrade command has the ability to seperate the upgrade operation to specify just the control plane and/or the node version. In this lab we will run the command that will upgrade both the control plan and nodes at the same time.

```bash
az aks upgrade --resource-group myResourceGroup --name myAKSCluster --kubernetes-version 1.29.9
```

You will be promted to confirm you will be upgrading yoru cluster and the cluster will be unavailable during the upgrade. Type `y` to proceed with the upgrade.

```bash
Kubernetes may be unavailable during cluster upgrades.
 Are you sure you want to perform this operation? (y/N):
```

Additionally, if we did not specify the `control-plan-only` argument, the upgrade will upgrade both the control plan and the all the nodepool versions to `1.29.9`. Type `y` to continue the operation.

```bash
Since control-plane-only argument is not specified, this will upgrade the control plane AND all nodepools to version 1.29.9. Continue? (y/N):
```

The upgrade process is now in process. This will take several moments to complete.

```bash
 / Running ..
```

Once the AKS API version has been completed on both the control plane and nodes, you will see the following completion message with the updated Kubernetes version shown.

```bash
...
  },
  "azureMonitorProfile": null,
  "azurePortalFqdn": "myAKSCluster.fqdn.azmk8s.io",
  "currentKubernetesVersion": "1.29.9",
...
```

#### Setting up the auto-upgrade channel for the API Server and Nodes

A more preferred method for upgrading your AKS API server and nodes is to configure the cluster auto-upgrade channel for your AKS cluster. This feature allow you a "set once and forget" mechanism that yields tangible time and operational cost benefits. You don't need to stop your workloads, redeploy your workloads, or create a new AKS cluster. By enabling auto-upgrade, you can ensure your clusters are up to date and don't miss the latest features or patches from AKS and upstream Kubernetes.

There are several auto-upgrade channels you can subscribe your AKS cluster to. Those channels include `none`, `patch`, `stable`, and `rapid`. Each channel provides a different upgrade experience depending on how you would like to keep your AKS clusers upgraded. For a more detailed explaination of each channel, please view the [Cluster auto-upgrade channels](https://learn.microsoft.com/azure/aks/auto-upgrade-cluster?tabs=azure-cli#cluster-auto-upgrade-channels) table.

For this lab demonstration, we will configure the AKS cluster to subscribe to the `patch` channel. Patch "automatically upgrades the cluster to the latest supported patch version when it becomes available while keeping the minor version the same."

Run the following command to setup the AKS cluster on the `patch` auto-upgrade channel:

```bash
az aks update --resource-group myResourceGroup --name myAKSCluster --auto-upgrade-channel patch
```
The auto-upgrade channel subscription for the AKS cluster is in process for configuration. This will take several moments to complete.

```bash
 / Running ..
```

Once the auto-upgrade channel subscription has been enabled for your cluster, you will see the `upgradeChannel` property updated to the chosen channel on the completion output.

```bash
  "autoUpgradeProfile": {
    "nodeOsUpgradeChannel": "None",
    "upgradeChannel": "patch"
  },
```

> NOTE: Configuring your AKS cluster to an auto-upgrade channel can have impact on the availability of workloads running on your cluster. Please review the additional options available to [Customize node surge upgrade](https://learn.microsoft.com/azure/aks/upgrade-aks-cluster?tabs=azure-cli#customize-node-surge-upgrade).

### Node image updates

In addition to you being able to upgrade the Kuberenetes API versions of both your control plan and nodepool nodes, you can also upgrade the operating system (OS) image of the VMs for your AKS cluster. AKSregularly provides new node images, so it's beneficial to upgrade your node images frequently to use the latest AKS features. Linux node images are updated weekly, and Windows node images are updated monthly.

Upgrading node images is critical to not only ensuring the latest Kubernetes API functionality will be available from the OS, but also to ensure that the nodes in your AKS cluster have the latest security and CVE patches to prevent any vulnerabilities in your environment.

#### Manually Upgrading AKS Node Image

When planning to manually upgrade your AKS cluster, it's good practice to view the available images. We can view the available images for your AKS cluster node pull using the following command:

```bash
az aks nodepool get-upgrades --nodepool-name <node-pool-name> --cluster-name <cluster-name> --resource-group <resource-group>
```

The command output shows the `latestNodeImageVersion` available for the nodepool.

```bash
...
  "kubernetesVersion": "1.29.9",
  "latestNodeImageVersion": "AKSUbuntu-2204gen2containerd-202410.09.0",
  "name": "default",
  "osType": "Linux",
...
```

Let's view the current utilized image of the AKS cluster node pool.

```bash
az aks nodepool show --resource-group <resource-group> --cluster-name <cluster-name> --name <node-pool-name> --query nodeImageVersion
```

The command output show:

```bash
"AKSUbuntu-2204gen2containerd-202410.09.0"
```

In this particular case, the AKS lab cluster nodepool image is the most recent image available, so there is no need to do an upgrade operation for the node image. If you needed to upgrade your node image, you can run the following command which will update all the node images for all node pools connected to your cluster.

```bash
az aks upgrade --resource-group <resource-group> --name <cluster-name> --node-image-only
```

### Maintenance windows

Maintenance windows provides you with the predictability to know when maintenance from Kubernetes API updates and/or node OS image updates will occur. The use of maintenance windows can help align to your current organizational operational policies concerning when services are expected to not be available.

There are currently three configuration schedules for maintenance windows, `default`, `aksManagedAutoUpgradeSchedule`, and `aksManagedNodeOSUpgradeSchedule`. For more specific information on these configurations, please see [Schedule configuration types for planned maintenance](https://learn.microsoft.com/azure/aks/planned-maintenance?tabs=azure-cli#schedule-configuration-types-for-planned-maintenance). 

It is recommended to use aksManagedAutoUpgradeSchedule for all cluster upgrade scenarios and aksManagedNodeOSUpgradeSchedule for all node OS security patching scenarios.

> NOTE: The default option is meant exclusively for AKS weekly releases. You can switch the default configuration to the aksManagedAutoUpgradeSchedule or aksManagedNodeOSUpgradeSchedule configuration by using the az aks maintenanceconfiguration update command.

When creating a maintenance window, it is good practice to see if any existing maintenance windows have already been configured. Checking to see if existing maintenance windows exists will avoid any conflicts when applying the setting. To check for the maintenance windows on an existing AKS cluster, run the following command:

```bash
az aks maintenanceconfiguration list --resource-group myResourceGroup --cluster-name myAKSCluster
```

If you receive `[]` as output, this means no maintenance windows exists for the AKS cluster specified.

#### Adding an AKS Cluster Maintenance Windows

Maintenance window configuration is highly configurable to meet the scheduling needs of your organization. For an in-depth understanding of all the properties available for configuration, please see the [Create a maintenance window](https://learn.microsoft.com/azure/aks/planned-maintenance?tabs=azure-cli#create-a-maintenance-window) guide.

The following command will create a `default` configuration that schedules maintenance to run from 1:00 AM to 2:00 AM every Monday.

```bash
az aks maintenanceconfiguration add --resource-group myResourceGroup --cluster-name myAKSCluster --name default --weekday Monday --start-hour 1
```

You will see the following output:

```bash
...
  "maintenanceWindow": null,
  "name": "default",
  "notAllowedTime": null,
  "resourceGroup": "myResourceGroup",
  "systemData": null,
  "timeInWeek": [
    {
      "day": "Monday",
      "hourSlots": [
        1
      ]
    }
  ],
  "type": null
}
```

### Azure Fleet

https://learn.microsoft.com/azure/kubernetes-fleet/update-orchestration?tabs=azure-portal

---

## Summary
