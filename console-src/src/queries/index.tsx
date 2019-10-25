export const fetchClientsQuery = `
  {
    viewer {
      clients {
        id
        redirectUri
        name
        grantTypes
        scopes
      }
    }
  }
`;

export const createClientMutation = `
  mutation(
    $name: String!,
    $redirectUri: String,
    $secret: String,
    $scopes: [ScopeType!]!,
    $grantTypes: [GrantType!]!
  ) {
    createClient(
      client: {
        name: $name
        redirectUri: $redirectUri
        grantTypes: $grantTypes
        scopes: $scopes
        secret: $secret
      }
    ) {
      id
      redirectUri
      name
      grantTypes
      scopes
    }
  }
`;

export const updateClientMutation = `
  mutation(
    $id: String!,
    $name: String,
    $redirectUri: String,
    $secret: String,
    $scopes: [ScopeType!],
    $grantTypes: [GrantType!]
  ) {
    updateClient(
      client: {
        id: $id
        name: $name
        redirectUri: $redirectUri
        grantTypes: $grantTypes
        scopes: $scopes
        secret: $secret
      }
    ) {
      id
      redirectUri
      name
      grantTypes
      scopes
    }
  }
`;

export const deleteClientMutation = `
  mutation(
    $id: String!,
  ) {
    deleteClient(
      id: $id
    ) {
      id
    }
  }
`;
