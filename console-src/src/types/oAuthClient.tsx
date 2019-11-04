import * as Schema from "@kontist/client/dist/graphql/schema";

export type CreateOAuthClientPayload = {
  id: string;
  name: string;
  redirectUri?: string;
  scopes?: Schema.ScopeType[];
};

export type UpdateOAuthClientPayload = {
  id: string;
  name?: string;
  secret?: string;
  redirectUri?: string;
  scopes?: Schema.ScopeType[];
  grantTypes?: Schema.GrantType[];
};

export type DeleteOAuthClientPayload = {
  id: string;
};

export { Schema };
