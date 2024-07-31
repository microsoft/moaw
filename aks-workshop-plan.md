# AKS Workshop Plans (2024)

Below is a list of the planned workshops we're building for AKS. 

1. AKS and Kubernetes for Beginners
2. Advanced AKS and Day 2 Operations
3. Securing AKS Clusters 
4. AI Apps on AKS

### Getting Started with Azure Kubernetes Service (AKS)
Example: https://moaw.dev/workshop/getting-started-with-aks 

1. Getting started
    * Objectives
    * Prerequisites
    * Workshop instructions
    * Setting up your environment
    * For basic container learning, go here: https://learn.microsoft.com/azure/aks/tutorial-kubernetes-prepare-app?tabs=azure-cli 
2. Deploy your AKS Cluster
    * Familiarize with AKS Presets in portal
    * Deploy AKS Automatic Cluster (CLI)
    * Connect to AKS 
3. Azure Container Registry 
    * Deploy Azure Container Registry (ACR)
    * Attach ACR to AKS cluster
    * Import aks-store images to ACR
4. Deploy Store App to AKS
    * Getting familiar with AKS Store app 
    * Publishing images to ACR
    * Deployments and Services
    * Setting request and limits
    * Ingress and App Routing Add-on
5. App Updates and Rollbacks
    * Deployment rolling updates
    * PodDisruptionBudgets
6. Application and Cluster Scaling
    * Manual application scaling (deployment)
    * HPA
    * Scaling with KEDA based on CPU utilization
7. Handling Stateful Workloads
    * AKS Storage classes and PVC's
    * Replace RabbitMQ with Azure Service Bus
    * Replace MongoDB for Azure Cosmos DB
8. Observability
    * Prometheus and Grafana
    * Container Insights
    * Control Plane metrics
9. CI/CD and Automated Deployments
    * Use AKS Automated Deployments with a single service to setup CI/CD

### Advanced AKS and Day 2 Operations

1. Cluster sizing and topology
    * System and User nodepools
    * Azure Linux
    * Multitenancy
    * Availability Zones
2. Cluster Update Management
    * API Server upgrades
    * Node image updates
    * Maintenance windows
3. Networking Concepts
    * Ingress
    * WAF
    * Network policy
    * Advanced Container Networking Services (ACNS)
    * Private AKS Clusters
4. Cost optimization
    * Node Auto-provision (Karpenter)
    * VPA
    * AKS Cost Analysis
    * Spot and Reservced Instances
5. Basic security topics
    * Access management
    * RBAC (Azure and K8s)
    * Deployment Safeguards
    * Managing secrets
    * Workload Identity
    * Basic image security (Image Cleaner, Defender?)
6. Fleet Management
7. Istio Service Mesh Add-on
    * Istio deployment
    * Sidecar injection
    * Mesh and Proxy config
    * Istio ingress
    * Upgrades and lifecycle management
8. GitOps and Application Delivery (ArgoCD)
9. Load Testing your application

### AI Apps on AKS

1. GPU Configuration
2. MLOps
3. KAITO
4. Big Bertha? 

### Securing AKS Clusters
Example: https://securekubernetes.com

Focus on attack and defense approaches
Compliance

### Existing Lab for reference (KubeCon Paris)
  * Exercise 1 - The Azure Container Registry
  * Exercise 2 - Deploying the Azure Kubernetes Service (AKS) cluster
  * Exercise 3 - Your first deployment
  * Exercise 4 - Scaling and high availability
  * Exercise 5 - Deploying MongoDB to AKS
  * Exercise 6 - Updates and rollbacks
  * Exercise 7 - Storage
  * Exercise 8 - Helm
  * Exercise 9 - Deploying Prometheus and Grafana for AKS cluster monitoring
