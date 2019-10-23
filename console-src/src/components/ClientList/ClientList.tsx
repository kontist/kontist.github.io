import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { BodyText } from "../../components/Text";
import { OAuthClient } from "../../types/oAuthClient";
import colors from "../../theme/colors";
import copy from "../../copy";

type ClientListProps = {
  clients: OAuthClient[];
};

type ClientItemProps = {
  client: OAuthClient;
};

const ClientItemContainer = styled(Link)`
  display: block;
  padding: 1rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${colors.veryLightGrey};
`;

const ClientItem = (props: ClientItemProps) => {
  const { client } = props;

  return (
    <ClientItemContainer to={`/clients/${props.client.id}`}>
      <BodyText className="without-padding primary-black">
        {client.name}
      </BodyText>
      <BodyText className="without-padding">{client.redirectUri}</BodyText>
    </ClientItemContainer>
  );
};

const ClientListContainer = styled.div`
  border-radius: 0.25rem;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
`;

const ClientListHeader = styled.div`
  border-top: 0.25rem solid ${colors.secondaryPurple};
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 1rem;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.veryLightGrey};
`;

const ClientList = (props: ClientListProps) => {
  if (props.clients.length === 0) {
    return <BodyText>{copy.dashboard.clientList.emptyListText}</BodyText>;
  }

  return (
    <ClientListContainer>
      <ClientListHeader>
        <BodyText className="without-padding primary-black bold">
          {copy.dashboard.clientList.nameTitle}
        </BodyText>
        <BodyText className="without-padding  primary-black bold">
          {copy.dashboard.clientList.uriTitle}
        </BodyText>
      </ClientListHeader>
      {props.clients.map((client, index) => (
        <ClientItem key={index} client={client} />
      ))}
    </ClientListContainer>
  );
};

export default ClientList;
