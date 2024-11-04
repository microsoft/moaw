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
