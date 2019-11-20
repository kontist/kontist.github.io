import * as Schema from "kontist/dist/graphql/schema";

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

export type AuthorizedScopes = Exclude<
  Schema.ScopeType,
  Schema.ScopeType.Clients | Schema.ScopeType.Admin
>;

export { Schema };
