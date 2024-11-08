@description('The location of the resource.')
param location string = resourceGroup().location

@description('The user object id for the cluster admin.')
@secure()
param userObjectId string

resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'myLogs${uniqueString(subscription().id, resourceGroup().id, deployment().name)}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource metricsWorkspace 'Microsoft.Monitor/accounts@2023-04-03' = {
  name: 'myPrometheus${uniqueString(subscription().id, resourceGroup().id, deployment().name)}'
  location: location
}

resource grafanaDashboard 'Microsoft.Dashboard/grafana@2023-09-01' = {
  name: 'myGrafana${uniqueString(subscription().id, resourceGroup().id, deployment().name)}'
  location: location
  sku: {
    name: 'Standard'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    grafanaIntegrations: {
      azureMonitorWorkspaceIntegrations: [
        {
          azureMonitorWorkspaceResourceId: metricsWorkspace.id
        }
      ]
    }
  }
}

resource grafanaAdminRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, resourceGroup().id, userObjectId, 'Grafana Admin')
  scope: grafanaDashboard
  properties: {
    principalId: userObjectId
    principalType: 'User'
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '22926164-76b3-42b3-bc55-97df8dab3e41')
  }
}

resource azureKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'myKeyVault${uniqueString(subscription().id, resourceGroup().id, deployment().name)}'
  location: location
  properties: {
    enableRbacAuthorization: true
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
  }
}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${azureKeyVault.name}-identity'
  location: location
}

resource keyVaultSecretUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, resourceGroup().id, managedIdentity.id, 'Key Vault Secrets User')
  scope: azureKeyVault
  properties: {
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
  }
}

resource keyVaultCertificateUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, resourceGroup().id, managedIdentity.id, 'Key Vault Certificate User')
  scope: azureKeyVault
  properties: {
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', 'db79e9a7-68ee-4b58-9aeb-b90e7c24fcba')
  }
}

resource keyVaultAdministratorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, resourceGroup().id, userObjectId, 'Key Vault Administrator')
  scope: azureKeyVault
  properties: {
    principalId: userObjectId
    principalType: 'User'
    roleDefinitionId: resourceId('Microsoft.Authorization/roleDefinitions', '00482a5a-887f-4fb3-b363-3b7fe8e74483')
  }
}

// TODO: add key vault roles

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: 'myregistry${uniqueString(subscription().id, resourceGroup().id, deployment().name)}'
  location: location
  sku: {
    name: 'Standard'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// TODO: add acrpull and acrpush
