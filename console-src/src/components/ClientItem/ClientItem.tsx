import React, { Component, Fragment } from "react";
import styled from "styled-components";

import { OAuthClient } from "../../types/oAuthClient";
import { BodyText } from "../../components/Text";
import { Scope } from "../../types/oAuthClient";
import Checkbox from "../inputs/Checkbox";
import Button from "../buttons/Button";
import LinkButton from "../buttons/LinkButton";
import ClientDeletionConfirmation from "../ClientDeletionConfirmation";

import colors from "../../theme/colors";
import copy from "../../copy";

const ClientItemContainer = styled.div`
  cursor: pointer;
  display: block;
  padding: 1rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.veryLightGrey};
`;

const ClientItemText = styled(BodyText)`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientItemUri = styled(ClientItemText)`
  text-align: right;
  padding-left: 1rem;
`;

const ClientDetailsItemContainer = styled.div`
  padding-bottom: 0.5rem;
`;

type ClientDetailsItemProps = {
  name: string;
  value: string;
};

export const ClientDetailsItem = ({ name, value }: ClientDetailsItemProps) => (
  <ClientDetailsItemContainer>
    <BodyText className="primary-black bold without-padding">{name}</BodyText>
    <BodyText className="primary-black">{value}</BodyText>
  </ClientDetailsItemContainer>
);

const ClientDetailsScopesContainer = styled.div``;

type ClientDetailsScopesProps = {
  title: string;
  scopes: Scope[];
};

const ClientDetailsScopes = ({ scopes, title }: ClientDetailsScopesProps) => (
  <ClientDetailsScopesContainer>
    <BodyText className="primary-black bold">{title}</BodyText>
    {scopes.map(scope => (
      <Checkbox
        // @ts-ignore
        label={copy.scopes[scope]}
        key={scope}
        checked
        disabled
      />
    ))}
  </ClientDetailsScopesContainer>
);

const ClientDetails = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${colors.veryLightGrey}
  display: flex;
  flex-wrap: wrap;
`;

const ClientDetailsColumn = styled.div`
  flex: 0 0 30%;
  padding-bottom: 1rem;

  &.wide {
    flex: 0 0 70%;
  }

  @media (max-width: 800px) {
    flex: 0 0 100%;
    padding-bottom: 0;

    &.wide {
      flex: 0 0 100%;
    }
  }
`;

const ClientDetailsActions = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  & > *:first-child {
    margin-right: 1rem;
  }

  @media (max-width: 800px) {
    flex-direction: column;
    margin-top: 1rem;

    & > *:first-child {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
  }
`;

type ClientItemProps = {
  client: OAuthClient;
  deleteClient: Function;
};

type ClientItemState = {
  expanded: boolean;
  modalOpen: boolean;
};

class ClientItem extends Component<ClientItemProps, ClientItemState> {
  constructor(props: ClientItemProps) {
    super(props);

    this.state = {
      expanded: false,
      modalOpen: false
    };
  }

  toggleDetails = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  openDeletionConfirmation = () => {
    this.setState({ modalOpen: true });
  };

  closeDeletionConfirmation = () => {
    this.setState({ modalOpen: false });
  };

  deleteClient = async () => {
    await this.props.deleteClient({ id: this.props.client.id });
  };

  render() {
    const { expanded, modalOpen } = this.state;
    const { client } = this.props;

    return (
      <Fragment>
        <ClientItemContainer onClick={this.toggleDetails}>
          <ClientItemText className="without-padding primary-black">
            {client.name}
          </ClientItemText>
          <ClientItemUri className="without-padding">
            {client.redirectUri}
          </ClientItemUri>
        </ClientItemContainer>
        {expanded && (
          <ClientDetails>
            <ClientDetailsColumn className="wide">
              <ClientDetailsItem
                name={copy.dashboard.clientDetails.id}
                value={client.id}
              />
              <ClientDetailsItem
                name={copy.dashboard.clientDetails.name}
                value={client.name}
              />
              <ClientDetailsItem
                name={copy.dashboard.clientDetails.redirectUri}
                value={client.redirectUri}
              />
            </ClientDetailsColumn>
            <ClientDetailsColumn>
              <ClientDetailsScopes
                scopes={client.scopes}
                title={copy.scopes.title}
              />
            </ClientDetailsColumn>
            <ClientDetailsActions>
              <LinkButton to={`/clients/update/${client.id}`}>
                {copy.dashboard.clientDetails.updateClientLabel}
              </LinkButton>
              <Button onClick={this.openDeletionConfirmation} destructive>
                {copy.dashboard.clientDetails.deleteClientLabel}
              </Button>
            </ClientDetailsActions>
          </ClientDetails>
        )}
        <ClientDeletionConfirmation
          isOpen={modalOpen}
          closeModal={this.closeDeletionConfirmation}
          deleteClient={this.deleteClient}
          client={client}
        />
      </Fragment>
    );
  }
}

export default ClientItem;
