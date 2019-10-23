import React, { Component } from "react";
import { Client } from "@kontist/client";

import prodConfig from "../config";
import devConfig from "../config.dev";

import Loading from "../pages/Loading";

import {
  OAuthClient,
  CreateOAuthClientPayload,
  UpdateOAuthClientPayload,
  DeleteOAuthClientPayload
} from "../types/oAuthClient";
import {
  fetchClientsQuery,
  createClientMutation,
  updateClientMutation,
  deleteClientMutation
} from "../queries";

const { baseAPIUrl, clientId, redirectUri } =
  process.env.NODE_ENV === "production" ? prodConfig : devConfig;

const STATE_KEY = "state";
const VERIFIER_KEY = "verifier";
const CLIENT_SCOPE = "clients";
const CODE_QUERY_PARAM = "code";

sessionStorage.setItem(
  STATE_KEY,
  sessionStorage.getItem(STATE_KEY) || (Math.random() + "").substring(2)
);
sessionStorage.setItem(
  VERIFIER_KEY,
  sessionStorage.getItem(VERIFIER_KEY) || (Math.random() + "").substring(2)
);

const client = new Client({
  baseUrl: baseAPIUrl,
  clientId,
  redirectUri,
  scopes: [CLIENT_SCOPE],
  state: sessionStorage.getItem(STATE_KEY) || "",
  verifier: sessionStorage.getItem(VERIFIER_KEY) || ""
});

interface OAuthClientsContext {
  isLoading: boolean;
  oAuthClients: OAuthClient[];
  createClient: (payload: CreateOAuthClientPayload) => Promise<Object> | void;
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<Object> | void;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<Object> | void;
}

interface State extends OAuthClientsContext {
  isAuthenticated: boolean;
}

const { Provider, Consumer } = React.createContext<OAuthClientsContext>({
  isLoading: false,
  oAuthClients: [],
  createClient: () => {},
  updateClient: () => {},
  deleteClient: () => {}
});

class OAuthClientsProvider extends Component<{}, State> {
  fetchClients: () => Promise<any>;
  createClient: (payload: CreateOAuthClientPayload) => Promise<any>;
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<any>;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<any>;

  constructor(props: {}) {
    super(props);

    this.fetchClients = async () => {
      this.setState({
        isLoading: true
      });

      const { viewer } = await client.graphQL.rawQuery(fetchClientsQuery);

      this.setState({
        isLoading: false,
        // Currently rawQuery return type does not include clients
        // @ts-ignore
        oAuthClients: viewer.clients
      });
    };

    this.createClient = async (payload: CreateOAuthClientPayload) =>
      client.graphQL.rawQuery(createClientMutation, payload);

    this.updateClient = async (payload: UpdateOAuthClientPayload) =>
      client.graphQL.rawQuery(updateClientMutation, payload);

    this.deleteClient = async (payload: DeleteOAuthClientPayload) =>
      client.graphQL.rawQuery(deleteClientMutation, payload);

    this.state = {
      isAuthenticated: false,
      isLoading: false,
      createClient: this.createClient,
      updateClient: this.updateClient,
      deleteClient: this.deleteClient,
      oAuthClients: []
    };
  }

  async componentDidMount() {
    if (client.auth.token) {
      await this.fetchClients();

      return;
    }

    const params = new URL(document.location.href).searchParams;
    const code = params.get(CODE_QUERY_PARAM);

    if (!code) {
      const url = await client.auth.getAuthUri();
      window.location.href = url;
    } else {
      await client.auth.fetchToken(document.location.href);
      this.setState({
        isAuthenticated: true
      });
      await this.fetchClients();
    }
  }

  render() {
    const {
      oAuthClients,
      isLoading,
      createClient,
      updateClient,
      deleteClient,
      isAuthenticated
    } = this.state;

    return (
      <Provider
        value={{
          oAuthClients,
          isLoading,
          createClient,
          updateClient,
          deleteClient
        }}
      >
        {isAuthenticated ? this.props.children : <Loading />}
      </Provider>
    );
  }
}

const withOAuthClients = (BaseComponent: any) => {
  return class extends Component {
    render() {
      return (
        <Consumer>
          {({
            createClient,
            updateClient,
            deleteClient,
            oAuthClients,
            isLoading
          }) => (
            <BaseComponent
              createClient={createClient}
              updateClient={updateClient}
              deleteClient={deleteClient}
              oAuthClients={oAuthClients}
              isLoading={isLoading}
              {...this.props}
            />
          )}
        </Consumer>
      );
    }
  };
};

export { OAuthClientsProvider };
export default withOAuthClients;
