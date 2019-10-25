export default {
  dashboard: {
    title: "Welcome to the Kontist API Console",
    subtitle: "You can manage your OAuth2 clients below",
    actionBar: {
      title: "OAuth2 clients",
      button: "Create client"
    },
    clientList: {
      emptyListText: "You don't have any existing clients yet.",
      nameTitle: "Client name",
      uriTitle: "Redirect URI"
    }
  },
  createClient: {
    title: "Create client",
    buttonLabel: "Create client"
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
    }
  },
  backButtonLabel: "Back"
};
