export enum Scope {
  OFFLINE = "OFFLINE",
  ACCOUNTS = "ACCOUNTS",
  USERS = "USERS",
  TRANSACTIONS = "TRANSACTIONS",
  TRANSFERS = "TRANSFERS",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  STATEMENTS = "STATEMENTS"
}

enum GrantType {
  AUTHORIZATION_CODE = "AUTHORIZATION_CODE",
  REFRESH_TOKEN = "REFRESH_TOKEN"
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
  secret?: string;
  redirectUri?: string;
  scopes?: Scope[];
  grantTypes?: GrantType[];
};

export type DeleteOAuthClientPayload = {
  id: string;
};
