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

export const createClientMutation = ``;

export const updateClientMutation = ``;

export const deleteClientMutation = ``;
