import React, { Component } from "react";
import { Client } from "@kontist/client";

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

interface OAuthClientsContext {
  isLoading: boolean;
  oAuthClients: OAuthClient[];
  createClient: (payload: CreateOAuthClientPayload) => Promise<void> | void;
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<void> | void;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<void> | void;
}

type State = {
  isLoading: boolean;
  oAuthClients: OAuthClient[];
};

type Props = {
  kontistClient: Client;
};

const { Provider, Consumer } = React.createContext<OAuthClientsContext>({
  isLoading: false,
  oAuthClients: [],
  createClient: () => {},
  updateClient: () => {},
  deleteClient: () => {}
});

class OAuthClientsProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      oAuthClients: []
    };
  }

  async componentDidMount() {
    await this.fetchClients();
  }

  fetchClients = async () => {
    const { viewer } = await this.props.kontistClient.graphQL.rawQuery(
      fetchClientsQuery
    );

    this.setState({
      isLoading: false,
      oAuthClients: viewer.clients
    });
  };

  createClient = async (payload: CreateOAuthClientPayload) => {
    this.setState({
      isLoading: true
    });

    const {
      createClient: client
    } = await this.props.kontistClient.graphQL.rawQuery(createClientMutation, {
      ...payload,
      grantTypes: ["AUTHORIZATION_CODE", "REFRESH_TOKEN"]
    });

    this.setState(state => ({
      ...state,
      isLoading: false,
      oAuthClients: [...state.oAuthClients, client]
    }));
  };

  updateClient = async (payload: UpdateOAuthClientPayload) => {
    const { id, name, redirectUri, scopes, secret } = payload;
    const updatePayload: UpdateOAuthClientPayload = {
      id,
      name,
      redirectUri,
      scopes
    };

    if (secret) {
      updatePayload.secret = secret;
    }

    const {
      updateClient: updatedClient
    } = await this.props.kontistClient.graphQL.rawQuery(updateClientMutation, {
      ...updatePayload,
      grantTypes: ["AUTHORIZATION_CODE", "REFRESH_TOKEN"]
    });

    this.setState(state => ({
      ...state,
      isLoading: false,
      oAuthClients: [...state.oAuthClients].map(oAuthClient =>
        oAuthClient.id === updatedClient.id ? updatedClient : oAuthClient
      )
    }));
  };

  deleteClient = async (payload: DeleteOAuthClientPayload) => {
    this.setState({
      isLoading: true
    });

    await this.props.kontistClient.graphQL.rawQuery(
      deleteClientMutation,
      payload
    );

    this.setState(state => ({
      ...state,
      isLoading: false,
      oAuthClients: [...state.oAuthClients].filter(
        oAuthClient => oAuthClient.id !== payload.id
      )
    }));
  };

  render() {
    const { oAuthClients, isLoading } = this.state;

    return (
      <Provider
        value={{
          oAuthClients,
          isLoading,
          createClient: this.createClient,
          updateClient: this.updateClient,
          deleteClient: this.deleteClient
        }}
      >
        {this.props.children}
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
