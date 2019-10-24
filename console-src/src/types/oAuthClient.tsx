enum Scope {
  OFFLINE = "offline",
  ACCOUNTS = "accounts",
  USERS = "users",
  TRANSACTIONS = "transactions",
  TRANSFERS = "transfers",
  SUBSCRIPTIONS = "subscriptions",
  STATEMENTS = "statements"
}

enum GrantType {
  AUTHORIZATION_CODE = "authorization_code",
  REFRESH_TOKEN = "refresh_token"
}

export type OAuthClient = {
  id: string;
  name: string;
  redirectUri: string;
  scopes: Scope[];
  grantTypes: GrantType[];
};

export type CreateOAuthClientPayload = {
  id: string;
  name: string;
  redirectUri?: string;
  scopes?: Scope[];
};

export type UpdateOAuthClientPayload = {
  id: string;
  name?: string;
  redirectUri?: string;
  scopes?: Scope[];
  grantTypes?: GrantType[];
};

export type DeleteOAuthClientPayload = {
  id: string;
};
