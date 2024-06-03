param openailocation string = 'canadaeast'
param location string = resourceGroup().location
param cognitiveSearchName string = substring('rag-cogsearch${uniqueString(resourceGroup().id)}', 0, 24)
param azureOpenAiServiceName string = substring('rag-azureoai${uniqueString(resourceGroup().id)}', 0, 24)
param azureAiServiceName string = substring('rag-aiservices${uniqueString(resourceGroup().id)}', 0, 24)

resource cognitiveSearch_resource 'Microsoft.Search/searchServices@2023-11-01' ={
  name: cognitiveSearchName
  location: location
  sku: {
    name: 'free'
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    networkRuleSet: {
      ipRules: []
    }
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    disableLocalAuth: false
    authOptions: {
      apiKeyOnly: {}
    }
  }
}

// resource azureOpenAiService_resource 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
//   name: azureOpenAiServiceName
//   location: openailocation
//   sku: {
//     name: 'S0'
//   }
//   kind: 'OpenAI'
//   properties: {
//     customSubDomainName: azureOpenAiServiceName
//     networkAcls: {
//       defaultAction: 'Allow'
//       virtualNetworkRules: []
//       ipRules: []
//     }
//     publicNetworkAccess: 'Enabled'
//   }
// }

// resource gpt4_deployment 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
//   parent: azureOpenAiService_resource
//   name: 'gpt-4'
//   sku: {
//     name: 'Standard'
//     capacity: 10
//   }
//   properties: {
//     model: {
//       format: 'OpenAI'
//       name: 'gpt-4'
//       version: '0613'
//     }
//     versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
//     currentCapacity: 10
//     raiPolicyName: 'Microsoft.Default'
//   }
// }

// resource adaTextEmbeddingResource 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
//   parent: azureOpenAiService_resource
//   name: 'text-embedding-ada-002'
//   sku: {
//     name: 'Standard'
//     capacity: 120
//   }
//   properties: {
//     model: {
//       format: 'OpenAI'
//       name: 'text-embedding-ada-002'
//       version: '2'
//     }
//     versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
//     currentCapacity: 120
//     raiPolicyName: 'Microsoft.Default'
//   }
// }


resource azureAiService_resource 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: azureAiServiceName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'CognitiveServices'
  properties: {
    customSubDomainName: azureAiServiceName
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}
