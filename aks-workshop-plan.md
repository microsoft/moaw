# AKS Workshop Plans (2024)

Below is a list of the planned workshops we're building for AKS. 

1. AKS and Kubernetes for Beginners
2. Advanced AKS and Day 2 Operations
3. Securing AKS Clusters 
4. AI Apps on AKS

### AKS and Kubernetes for Beginners
Example: https://moaw.dev/workshop/getting-started-with-aks 

1. Getting started
    * Objectives
    * Prerequisites
    * Workshop instructions
    * Setting up your environment
2. Deploy your AKS Cluster
    * Familiarize with AKS Presets in portal
    * Deploy AKS Cluster (CLI)
    * Connect to AKS 
3. Container basics (skip this if in cloud shell)
    * Dockerfile
    * Create a container
    * Run container locally
4. Azure Container Registry 
    * Deploy Azure Container Registry (ACR)
    * Familiarize with ACR 
    * Push container image (from step 3)
5. Deploy Store App to AKS
    * Getting familiar with AKS Store app 
    * Publishing images to ACR
    * Deployments and Services
    * Ingress and App Routing Add-on
6. App Updates and Rollbacks
    * Deployment rolling updates
    * AKS Automated Deployments
7. Application and Cluster Scaling
    * Cluster Autoscaler
    * Setting request and limits
    * Scaling with KEDA based on CPU utilization
8. Storage and Persisting Data
    * Storage classes
    * Creating a PVC and adapting app to persist data
9. Switch Databases to Azure PaaS
    * Replace RabbitMQ with Azure Service Bus
    * Replace MongoDB for Azure Cosmos DB
10. Observability
    * Prometheus and Grafana
    * Container Insights
    * Control plane metrics
    * App Insights

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
  * Deployment Safeguards
  * Managing secrets
  * Workload Identity
  * Image security
6. Fleet Management
7. Istio Service Mesh Add-on
8. GitOps and Application Delivery 
9. Load Testing your application

### AI Apps on AKS

1. GPU Configuration
2. MLOps
3. KAITO

### Securing AKS Clusters
Example: https://securekubernetes.com

Focus on attack and defense approaches
Compliance

### Skillable Lab for reference (KubeCon Paris)
Exercise 1 - The Azure Container Registry
Exercise 2 - Deploying the Azure Kubernetes Service (AKS) cluster
Exercise 3 - Your first deployment
Exercise 4 - Scaling and high availability
Exercise 5 - Deploying MongoDB to AKS
Exercise 6 - Updates and rollbacks
Exercise 7 - Storage
Exercise 8 - Helm
Exercise 9 - Deploying Prometheus and Grafana for AKS cluster monitoring
