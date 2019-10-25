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
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<Object> | void;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<Object> | void;
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
      // Currently rawQuery return type does not include clients
      // @ts-ignore
      oAuthClients: viewer.clients
    });
  };

  createClient = async (payload: CreateOAuthClientPayload) => {
    this.setState({
      isLoading: true
    });

    const {
      // Currently rawQuery return type does not include client mutation results
      // @ts-ignore
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

  updateClient = async (payload: UpdateOAuthClientPayload) =>
    this.props.kontistClient.graphQL.rawQuery(updateClientMutation, payload);

  deleteClient = async (payload: DeleteOAuthClientPayload) =>
    this.props.kontistClient.graphQL.rawQuery(deleteClientMutation, payload);

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
