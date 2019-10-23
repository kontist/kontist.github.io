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
  createClient: (payload: CreateOAuthClientPayload) => Promise<Object> | void;
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<Object> | void;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<Object> | void;
}

interface State extends OAuthClientsContext {}

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
  fetchClients: () => Promise<any>;
  createClient: (payload: CreateOAuthClientPayload) => Promise<any>;
  updateClient: (payload: UpdateOAuthClientPayload) => Promise<any>;
  deleteClient: (payload: DeleteOAuthClientPayload) => Promise<any>;

  constructor(props: Props) {
    super(props);

    const { kontistClient } = props;

    this.fetchClients = async () => {
      const { viewer } = await kontistClient.graphQL.rawQuery(
        fetchClientsQuery
      );

      this.setState({
        isLoading: false,
        // Currently rawQuery return type does not include clients
        // @ts-ignore
        oAuthClients: viewer.clients
      });
    };

    this.createClient = async (payload: CreateOAuthClientPayload) =>
      kontistClient.graphQL.rawQuery(createClientMutation, payload);

    this.updateClient = async (payload: UpdateOAuthClientPayload) =>
      kontistClient.graphQL.rawQuery(updateClientMutation, payload);

    this.deleteClient = async (payload: DeleteOAuthClientPayload) =>
      kontistClient.graphQL.rawQuery(deleteClientMutation, payload);

    this.state = {
      isLoading: true,
      createClient: this.createClient,
      updateClient: this.updateClient,
      deleteClient: this.deleteClient,
      oAuthClients: []
    };
  }

  async componentDidMount() {
    await this.fetchClients();
  }

  render() {
    const {
      oAuthClients,
      isLoading,
      createClient,
      updateClient,
      deleteClient
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
