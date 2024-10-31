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

Service meshes traditionally work by deploying an additional container within the same pod as your application container. These additional containers are referred to as a sidecar or a sidecar proxy. These sidecar proxy receive policy and configuration from the service mesh control plane and insert themselves in the communication path of your application, to control the traffic to and from your application pod.

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

Get a list of all the current deployment names in the `aks-store` namespace.

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

#### Verify the Istio Mesh is Controlling Mesh Communications

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

##### Configure mTLS Strict Mode for AKS Store Namespace

Currently Istio configures workloads to use mTLS when calling other workloads, but the default permissive mode allows a service to accept traffic in plaintext or mTLS traffic. To ensure that the workloads we manage with the Istio add-on only accept mTLS communication, we will deploy a Peer Authentication policy to enforce only mTLS traffic for the workloads in the `aks-store` namespace.

Prior to deploying the mTLS strict mode, let's verify that the `store-front` service will respond to a client not using mTLS. We will invoke a call from the `curl` pod to the `store-front` service and see if we get a response. Run the following command to curl to the `store-front` service.

```bash
kubectl exec -it $(kubectl get pod -l app=curl -o jsonpath="{.items[0].metadata.name}") -- curl store-front.aks-store.svc.cluster.local:80

<!doctype html><html lang=""><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico"><title>store-front</title><script defer="defer" src="/js/chunk-vendors.1541257f.js"></script><script defer="defer" src="/js/app.1a424918.js"></script><link href="/css/app.0f9f08e7.css" rel="stylesheet"></head><body><noscript><strong>We're sorry but store-front doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div></body></html>
```

As you can see, HTML was returned to the client meaning that the `store-front` service successfully responded to the client in plaintext. Let's now apply the Peer Authentication policy that will enforce all services in the `aks-store` namespace to only use mTLS communication. Run the following command to configure the mTLS Peer Authentication policy.

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

Once the mTLS strict mode peer authentication policy has been applied, we will now see if we can again get a response back from the `store-front` service from a client not using mTLS. Run the following command to curl to the `store-front` service again.

```bash
kubectl exec -it $(kubectl get pod -l app=curl -o jsonpath="{.items[0].metadata.name}") -- curl store-front.aks-store.svc.cluster.local:80

curl: (56) Recv failure: Connection reset by peer
command terminated with exit code 56
```

Notice that the curl client did not receive the HTML from the prior attempt. The error returned is the indication that the mTLS policy has been enforced, and that the `store-front` service has rejected the non mTLS communication from the curl client.

#### Deploying External Istio Ingress

By default, services are not accessible from outside the cluster. When managing your workloads with the Istio service mesh, you want to ensure that if you expose a service for communications outside the cluster, mesh policy configurations can still be preserved.

The AKS Istio AKS add-on comes with both a external and internal ingress gateway that you can utilize to expose your services in the service mesh. In the following steps, we will show how to enable an external ingress gateway to allow the `store-front` service to be reached from outside the cluster.

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

Workloads deployed on an Azure Kubernetes Services (AKS) cluster require Microsoft Entra application credentials or managed identities to access Microsoft Entra protected resources, such as Azure Key Vault and Microsoft Graph. Microsoft Entra Workload ID integrates with the capabilities native to Kubernetes to federate with external identity providers.

This Workload Identity section of the lab will deploy an application workload onto AKS and use Workload Identity to allow the application to access a secret in Azure KeyVault.

To expedite the running of commands in this section, it is advised to create the following exported environment variables. Please update the values to what is appropriate for your environment, and then run the export commands in your terminal.

```bash
export RESOURCE_GROUP="myResourceGroup" \
export LOCATION="eastus" \
export CLUSTER_NAME="myAKSCluster" \
export SERVICE_ACCOUNT_NAMESPACE="default" \
export SERVICE_ACCOUNT_NAME="workload-identity-sa" \
export SUBSCRIPTION="$(az account show --query id --output tsv)" \
export USER_ASSIGNED_IDENTITY_NAME="myIdentity" \
export FEDERATED_IDENTITY_CREDENTIAL_NAME="myFedIdentity" \
export KEYVAULT_NAME="keyvault-workload-id" \
export KEYVAULT_SECRET_NAME="my-secret"
```

#### Limitations

Please be aware of the following limitations for Workload Identity

- You can have a maximum of [20 federated identity credentials](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-considerations#general-federated-identity-credential-considerations) per managed identity.
- It takes a few seconds for the federated identity credential to be propagated after being initially added.
- The [virtual nodes](https://learn.microsoft.com/en-us/azure/aks/virtual-nodes) add on, based on the open source project [Virtual Kubelet](https://virtual-kubelet.io/docs/), isn't supported.
- Creation of federated identity credentials is not supported on user-assigned managed identities in these [regions.](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-considerations#unsupported-regions-user-assigned-managed-identities)

#### Enable Workload Identity on an AKS cluster

> NOTE: If Workload Identity is already enabled on your AKS cluster, you can skip this section.

To enable Workload Identity on the AKS cluster, run the following command.

```bash
az aks update --resource-group "${RESOURCE_GROUP}" --name "${CLUSTER_NAME}" --enable-oidc-issuer --enable-workload-identity
```

This will take several moments to complete

```bash
 | Running ..
```

Once complete, you will see the following output.

```bash
...
  "oidcIssuerProfile": {
    "enabled": true,
    "issuerUrl": "https://eastus.oic.prod-aks.azure.com/00000000-0000-0000-0000-000000000000/11111111-1111-1111-1111-111111111111/"
  },
...
    "workloadIdentity": {
      "enabled": true
    }
...
```

> NOTE: Please take note of the OIDC Issuer URL. This URL will be used to bind the Kubernetes service account to the Managed Identity for the federated credential.

You can store the AKS OIDC Issuer URL using the following command.

```bash
export AKS_OIDC_ISSUER="$(az aks show --name "${CLUSTER_NAME}" --resource-group "${RESOURCE_GROUP}" --query "oidcIssuerProfile.issuerUrl" --output tsv)"
```

#### Create a Managed Identity

A Managed Identity is a account (identity) created in Microsoft Entra ID. These identities allows your application to leverage them to use when connecting to resources that support Microsoft Entra authenticaion. Applications can use managed identities to obtain Microsoft Entra tokens without having to manage any credentials.

Run the following command to create a Managed Identity.

```bash
az identity create --name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}" --location "${LOCATION}" --subscription "${SUBSCRIPTION}"
```

You should see the following output that will contain your environment specific attributes.

```bash
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/RESOURCE_GROUP/providers/Microsoft.ManagedIdentity/userAssignedIdentities/USER_ASSIGNED_IDENTITY_NAME",
  "location": "LOCATION",
  "name": "USER_ASSIGNED_IDENTITY_NAME",
  "principalId": "00000000-0000-0000-0000-000000000000",
  "resourceGroup": "RESOURCE_GROUP",
  "systemData": null,
  "tags": {},
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "type": "Microsoft.ManagedIdentity/userAssignedIdentities"
}
```

Capture your Managed Identity client ID with the following command.

```bash
export USER_ASSIGNED_CLIENT_ID="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${USER_ASSIGNED_IDENTITY_NAME}" --query 'clientId' --output tsv)"
```

#### Create a Kubernetes Service Account

Create a Kubernetes service account and annotate it with the client ID of the managed identity created in the previous step.

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    azure.workload.identity/client-id: "${USER_ASSIGNED_CLIENT_ID}"
  name: "${SERVICE_ACCOUNT_NAME}"
  namespace: "${SERVICE_ACCOUNT_NAMESPACE}"
EOF
```

You should see the following output.

```bash
serviceaccount/SERVICE_ACCOUNT_NAME created
```

#### Create the Federated Identity Credential

Call the az identity federated-credential create command to create the federated identity credential between the managed identity, the service account issuer, and the subject. For more information about federated identity credentials in Microsoft Entra, see [Overview of federated identity credentials in Microsoft Entra ID](https://learn.microsoft.com/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0).

```bash
az identity federated-credential create --name ${FEDERATED_IDENTITY_CREDENTIAL_NAME} --identity-name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}" --issuer "${AKS_OIDC_ISSUER}" --subject system:serviceaccount:"${SERVICE_ACCOUNT_NAMESPACE}":"${SERVICE_ACCOUNT_NAME}" --audience api://AzureADTokenExchange
```

You should see the following output specific to your environment.

```bash
{
  "audiences": [
    "api://AzureADTokenExchange"
  ],
  "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/RESOURCE_GROUP/providers/Microsoft.ManagedIdentity/userAssignedIdentities/USER_ASSIGNED_IDENTITY_NAME/federatedIdentityCredentials/FEDERATED_IDENTITY_CREDENTIAL_NAME",
  "issuer": "https://LOCATION.oic.prod-aks.azure.com/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000/",
  "name": "FEDERATED_IDENTITY_CREDENTIAL_NAME",
  "resourceGroup": "RESOURCE_GROUP",
  "subject": "system:serviceaccount:default:SERVICE_ACCOUNT_NAM",
  "systemData": null,
  "type": "Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials"
}
```

> NOTE: It takes a few seconds for the federated identity credential to propagate after it is added. If a token request is made immediately after adding the federated identity credential, the request might fail until the cache is refreshed. To avoid this issue, you can add a slight delay after adding the federated identity credential.

#### Deploy a Sample Application Utilizing Workload Identity

When you deploy your application pods, the manifest should reference the service account created in the Create Kubernetes service account step. The following manifest deploys the `busybox` image and shows how to reference the account, specifically the metadata\namespace and spec\serviceAccountName properties.

```bash
cat <<EOF | kubectl apply -f -
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

You should see the following output.

```bash
pod/sample-workload-identity created
```

> IMPORTANT: Ensure that the application pods using workload identity include the label azure.workload.identity/use: "true" in the pod spec. Otherwise the pods will fail after they are restarted.

#### Create an Azure KeyVault and Deploy an Application to Access it.

The instructions in this step show how to access secrets, keys, or certificates in an Azure key vault from the pod. The examples in this section configure access to secrets in the key vault for the workload identity, but you can perform similar steps to configure access to keys or certificates.

The following example shows how to use the Azure role-based access control (Azure RBAC) permission model to grant the pod access to the key vault. For more information about the Azure RBAC permission model for Azure Key Vault, see [Grant permission to applications to access an Azure key vault using Azure RBAC](https://learn.microsoft.com/azure/key-vault/general/rbac-guide).

1. Create a key vault with purge protection and RBAC authorization enabled. You can also use an existing key vault if it is configured for both purge protection and RBAC authorization:

```bash
export KEYVAULT_RESOURCE_GROUP="myResourceGroup"
export KEYVAULT_NAME="myKeyVault"

az keyvault create --name "${KEYVAULT_NAME}" --resource-group "${KEYVAULT_RESOURCE_GROUP}" --location "${LOCATION}" --enable-purge-protection --enable-rbac-authorization
```

The will take a few moments to create the Azure KeyVault.

```bash
 | Running ..
```

Once completed, you will see a similar output.

```bash
{
  "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/KEYVAULT_NAME",
  "location": "LOCATION",
  "name": "KEYVAULT_NAME",
  "properties": {
    "accessPolicies": [],
    "createMode": null,
    "enablePurgeProtection": true,
    "enableRbacAuthorization": true,
    "enableSoftDelete": true,
    "enabledForDeployment": false,
    "enabledForDiskEncryption": null,
    "enabledForTemplateDeployment": null,
    "hsmPoolResourceId": null,
    "networkAcls": null,
    "privateEndpointConnections": null,
    "provisioningState": "Succeeded",
    "publicNetworkAccess": "Enabled",
    "sku": {
      "family": "A",
      "name": "standard"
    },
    "softDeleteRetentionInDays": 90,
    "tenantId": "00000000-0000-0000-0000-000000000000",
    "vaultUri": "https://KEYVAULT_NAME.vault.azure.net/"
  },
...
```

2. Assign yourself the RBAC Key Vault Secrets Officer role so that you can create a secret in the new key vault:

> IMPORTANT: Please use your Azure subscription login email as the "\<user-email\>" value.

```bash
export KEYVAULT_RESOURCE_ID=$(az keyvault show --resource-group "${KEYVAULT_RESOURCE_GROUP}" --name "${KEYVAULT_NAME}" --query id --output tsv)

az role assignment create --assignee "\<user-email\>" --role "Key Vault Secrets Officer" --scope "${KEYVAULT_RESOURCE_ID}"
```

Once completed, you will see a similar output.

```bash
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
...
```

3. Create a secret in the key vault:

```bash
export KEYVAULT_SECRET_NAME="my-secret"

az keyvault secret set --vault-name "${KEYVAULT_NAME}" --name "${KEYVAULT_SECRET_NAME}" --value "Hello\!"
```

```bash
...
  "contentType": null,
  "id": "https://KEYVAULT_NAME.vault.azure.net/secrets/my-secret/00000000000000000000000000000000",
  "kid": null,
  "managed": null,
  "name": "my-secret",
  "tags": {
    "file-encoding": "utf-8"
  },
  "value": "Hello\\!"
```

4. Assign the Key Vault Secrets User role to the user-assigned managed identity that you created previously. This step gives the managed identity permission to read secrets from the key vault:

```bash
export IDENTITY_PRINCIPAL_ID=$(az identity show --name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}" --query principalId --output tsv)

az role assignment create --assignee-object-id "${IDENTITY_PRINCIPAL_ID}" --role "Key Vault Secrets User" --scope "${KEYVAULT_RESOURCE_ID}" --assignee-principal-type ServicePrincipal
```

Once completed, you will see a similar output.

```bash
{
  "condition": null,
  "conditionVersion": null,
  "createdBy": null,
...
```

5. Create an environment variable for the key vault URL:

```bash
export KEYVAULT_URL="$(az keyvault show --resource-group ${KEYVAULT_RESOURCE_GROUP} --name ${KEYVAULT_NAME} --query properties.vaultUri --output tsv)"
```

6. Deploy a pod that references the service account and key vault URL:

```bash
cat <<EOF | kubectl apply -f -
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

```bash
pod/sample-workload-identity-key-vault created
```

To check whether all properties are injected properly by the webhook, use the kubectl describe command:

```bash
kubectl describe pod sample-workload-identity-key-vault | grep "SECRET_NAME:"
```

If successful, the output should be similar to the following.

```bash
SECRET_NAME:                 my-secret
```

To verify that pod is able to get a token and access the resource, use the kubectl logs command:

```bash
kubectl logs sample-workload-identity-key-vault
```

If successful, the output should be similar to the following.

```bash
I1025 15:02:38.958802       1 main.go:63] "successfully got secret" secret="Hello\\!"
I1025 15:03:39.006595       1 main.go:63] "successfully got secret" secret="Hello\\!"
I1025 15:04:39.055667       1 main.go:63] "successfully got secret" secret="Hello\\!"
```

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

AKS is a managed Kubernetes service provided by Azure. Even though AKS is managed, flexibility has been given to customer on controlling the version of the API server they use in their environment. As newer versions of Kubernetes become available, those versions are tested and made available as part of the service. As newer versions are provided, older versions of Kubernetes are phased out of the service and are no longer available to deploy. Staying within the spectrum of supported versions, will ensure you don't compromise support for your AKS cluster.

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

We can also, quickly look at the current version of Kubernetes running on the nodes in the nodepools by running the following:

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

> NOTE: The az aks upgrade command has the ability to separate the upgrade operation to specify just the control plane and/or the node version. In this lab we will run the command that will upgrade both the control plan and nodes at the same time.

```bash
az aks upgrade --resource-group myResourceGroup --name myAKSCluster --kubernetes-version 1.29.9
```

You will be prompted to confirm you will be upgrading your cluster and the cluster will be unavailable during the upgrade. Type `y` to proceed with the upgrade.

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

There are several auto-upgrade channels you can subscribe your AKS cluster to. Those channels include `none`, `patch`, `stable`, and `rapid`. Each channel provides a different upgrade experience depending on how you would like to keep your AKS clusters upgraded. For a more detailed explanation of each channel, please view the [Cluster auto-upgrade channels](https://learn.microsoft.com/azure/aks/auto-upgrade-cluster?tabs=azure-cli#cluster-auto-upgrade-channels) table.

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

In addition to you being able to upgrade the Kubernetes API versions of both your control plan and nodepool nodes, you can also upgrade the operating system (OS) image of the VMs for your AKS cluster. AKSregularly provides new node images, so it's beneficial to upgrade your node images frequently to use the latest AKS features. Linux node images are updated weekly, and Windows node images are updated monthly.

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

Azure Kubernetes Fleet Manager (Fleet) enables at-scale management of multiple Azure Kubernetes Service (AKS) clusters. Fleet supports the following scenarios:

- Create a Fleet resource and join AKS clusters across regions and subscriptions as member clusters.

- Orchestrate Kubernetes version upgrades and node image upgrades across multiple clusters by using update runs, stages, and groups.

- Automatically trigger version upgrades when new Kubernetes or node image versions are published (preview).

- Create Kubernetes resource objects on the Fleet resource's hub cluster and control their propagation to member clusters.

- Export and import services between member clusters, and load balance incoming layer-4 traffic across service endpoints on multiple clusters (preview).

For this section of the lab we will focus on two AKS Fleet Manager features, creating a fleet and joining member clusters, and propagating resources from a hub cluster to a member clusters.

You can find and learn about additional AKS Fleet Manager concepts and functionality on the [Azure Kubernetes Fleet Manager](https://learn.microsoft.com/azure/kubernetes-fleet/) documentation page.

> IMPORTANT: Please ensure you have enabled the Azure Fleet CLI extension for your Azure subscription. You can enable this by running `az extension add --name fleet` in your terminal. 

#### Create Additional AKS Cluster

> NOTE: If you already have an additional AKS cluster, in addition to your original lab AKS cluster, you can skip this section.

To understand how AKS Fleet Manager can help manage multiple AKS clusters, we will need to create an additional AKS cluster to join as a member cluster. The following commands and instructions will deploy an addtitional AKS cluster into the same Azure resource group as your existing AKS cluster. For this lab purposes, it is not necessary to deploy the additional cluster in a region and/or subscription to show the benefits of AKS Fleet Manager.

Deploy the additional AKS cluster with the following command:

```bash
az aks create -g myResourceGroup -n <aks-fleet-member-1> --node-vm-size standard_d2_v2 --node-count 2 --enable-managed-identity 
```

#### Create and configure Access for a Kuberentes Fleet Resource with Hub Cluster

Since this lab will be using AKS Fleet Manager for Kubernetes object propagation, you will need to create the Fleet resource with the hub cluster enabled by specifying the --enable-hub parameter with the az fleet create command. The hub cluster will orchestrate and manage the Fleet member clusters. We will add the lab's original AKS cluster and the newly created additional cluster as a member of the Fleet group in a later step.

Run the following command to create the Kuberenetes AKS Fleet Manager hub cluster.

```bash
az fleet create --resource-group myResourceGroup --name <myFleetName> --location <myLocation> --enable-hub
```

Once the Kubernetes Fleet hub cluster has been created, we will need to gather the credential information to access it. This is similar to using the `az aks get-credentials` command on an AKS cluster. Run the following command to get the Fleet hub cluster credentials.

```bash
az fleet get-credentials --resource-group myResourceGroup --name myFleetName
```

Now that you have the credential information merged to your local Kubernetes config file, we will need to configure and authorize Azure role access for your account to access the Kubernetes API for the Fleet resource.

Run the following commands to get and set the terminal environment variables for, your Azure subscription ID, your Azure user ID, the Fleet ID, and the Azure RBAC role, to be used in later commands.

```bash
export SUBSCRIPTION_ID=$(az account show --query id --output tsv) \
export RESOURCE_GROUP=myResourceGroup \
export FLEET_NAME=myFleetName \
export FLEET_ID=$(az fleet show --name ${FLEET_NAME} --resource-group ${RESOURCE_GROUP} --query id --output tsv) \
export IDENTITY=$(az ad signed-in-user show --query "id" --output tsv) \
export ROLE="Azure Kubernetes Fleet Manager RBAC Cluster Admin"
```

Once we have all of the terminal environment variables set, we can run the command to add the Azure account to be a "Azure Kubernetes Fleet Manager RBAC Cluster Admin" role on the Fleet resource. 

```bash
az role assignment create --role "${ROLE}" --assignee ${IDENTITY} --scope ${FLEET_ID}
```


#### Joining Existing AKS Cluster to the Fleet

Now that we have our Fleet hub cluster created, along with the necessary Fleet API access, we're now ready to join our AKS clusters to Fleet as member servers. To join AKS clusters to Fleet, we will need the Azure subscription path to each AKS object. To get the subscription path to your AKS clusters, you can run the following commands.

> NOTE: The following commands are referencing environment variables created in the earlier terminal session. If you are using a new terminal session, please create the `SUBSCRIPTION_ID`, `RESOURCE_GROUP`, and `FLEET_NAME` variables before proceeding.

```bash
export AKS_CLUSTER_1=myAKSCluster \
export AKS_CLUSTER_2=myAdditionalAKSCluster \
export AKS_CLUSTER_1_ID=$(az aks show --resource-group ${RESOURCE_GROUP} --name ${AKS_CLUSTER_1} --query id --output tsv) \
export AKS_CLUSTER_2_ID=$(az aks show --resource-group ${RESOURCE_GROUP} --name ${AKS_CLUSTER_2} --query id --output tsv)
```

Run the following command to join both AKS clusters to the Fleet.

```bash
az fleet member create --resource-group ${RESOURCE_GROUP} --fleet-name ${FLEET_NAME} --name ${AKS_CLUSTER_1} --member-cluster-id ${AKS_CLUSTER_1_ID}

az fleet member create --resource-group ${RESOURCE_GROUP} --fleet-name ${FLEET_NAME} --name ${AKS_CLUSTER_2} --member-cluster-id ${AKS_CLUSTER_2_ID} 
```

Once the `az fleet member create` command has completed for both AKS clusters, we can verify they have both been added and enabled for Fleet running the `kubectl get memberclusters` command.

```bash
kubectl get memberclusters
```

#### Propagate Resources from a Hub Cluster to Member Clusters

The `ClusterResourcePlacement` API object is used to propagate resources from a hub cluster to member clusters. The `ClusterResourcePlacement` API object specifies the resources to propagate and the placement policy to use when selecting member clusters. The `ClusterResourcePlacement` API object is created in the hub cluster and is used to propagate resources to member clusters. This example demonstrates how to propagate a namespace to member clusters using the `ClusterResourcePlacement` API object with a `PickAll` placement policy.

Before running the following commands, make sure your `kubectl conifg` has the Fleet hub cluster as it's current context. To check your current context, run the `kubectl config current-context` command. You should see the output as `hub`. If the output is not `hub`, please run `kubectl config set-context hub`. 

Create a namespace to place onto the member clusters using the kubectl create namespace command. The following example creates a namespace named my-namespace:

```bash
kubectl create namespace my-fleet-ns-example
```
Create a `ClusterResourcePlacement` API object in the hub cluster to propagate the namespace to the member clusters and deploy it using the `kubectl apply -f` command. The following example `ClusterResourcePlacement` creates an object named `my-lab-crp` and uses the `my-fleet-ns-example` namespace with a `PickAll` placement policy to propagate the namespace to all member clusters:

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
      name: my-fleet-ns-example
  policy:
    placementType: PickAll
EOF
```

Check the progress of the resource propagation using the `kubectl get clusterresourceplacement` command. The following example checks the status of the `ClusterResourcePlacement` object named `my-lab-crp`:

```bash
kubectl get clusterresourceplacement my-lab-crp
```

View the details of the `my-lab-crp` object using the `kubectl describe my-lab-crp` command. The following example describes the `ClusterResourcePlacement` object named `my-lab-crp`:

```bash
kubectl describe clusterresourceplacement my-lab-crp
```

---

## Summary
