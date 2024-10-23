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

---

## Objectives

---

## Prerequisites

- Pre-provisioned AKS cluster
- Azure CLI
- kubectl
- Helm

---

## Cluster Sizing and Topology

- Multiple clusters
- Multitenancy
- Availability Zones

---

## Advanced Networking Concepts

### Azure Container Networking Services

### Istio Service Mesh

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
