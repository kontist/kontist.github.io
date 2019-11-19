export default {
  dashboard: {
    title: "Welcome to the Kontist API Client Management",
    subtitle: "You can manage your OAuth2 clients below",
    actionBar: {
      title: "OAuth2 clients",
      button: "Create client"
    },
    clientList: {
      emptyListText: "You don't have any existing clients yet.",
      nameTitle: "Client name",
      uriTitle: "Redirect URI"
    },
    clientDetails: {
      id: "Client ID",
      name: "Name",
      redirectUri: "Redirect URI",
      updateClientLabel: "Update client",
      deleteClientLabel: "Delete client"
    }
  },
  createClient: {
    title: "Create client",
    buttonLabel: "Create client"
  },
  updateClient: {
    title: "Update client",
    buttonLabel: "Update client",
    secretInformation:
      "Submitting a secret with the update will override the existing secret"
  },
  clientForm: {
    name: "Name",
    redirectUri: "Redirect URI",
    secret: "Secret",
    optionalFields: "Optional",
    placeholders: {
      name: "Client name",
      redirectUri: "https://redirect.uri/callback",
      secret: "Secret"
    }
  },
  clientDeletion: {
    title: "Please confirm you want to delete the following OAuth2 client:",
    subtitle: "This action is not reversible.",
    confirm: "Delete client",
    cancel: "Cancel"
  },
  scopes: {
    OFFLINE: "Offline",
    ACCOUNTS: "Accounts",
    USERS: "Users",
    TRANSACTIONS: "Transactions",
    TRANSFERS: "Transfers",
    SUBSCRIPTIONS: "Subscriptions",
    STATEMENTS: "Statements",
    title: "Scopes"
  },
  backButtonLabel: "Back"
};
