import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { BodyText } from "../../components/Text";
import TitledCard from "../../components/TitledCard";
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

const ClientItem = (props: ClientItemProps) => {
  const { client } = props;

  return (
    <ClientItemContainer to={`/clients/${props.client.id}`}>
      <ClientItemText className="without-padding primary-black">
        {client.name}
      </ClientItemText>
      <ClientItemUri className="without-padding">
        {client.redirectUri}
      </ClientItemUri>
    </ClientItemContainer>
  );
};

const TitleContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: space-between;
`;

const ClientList = (props: ClientListProps) => {
  if (props.clients.length === 0) {
    return <BodyText>{copy.dashboard.clientList.emptyListText}</BodyText>;
  }

  return (
    <TitledCard
      renderTitle={() => (
        <TitleContainer>
          <BodyText className="without-padding primary-black bold">
            {copy.dashboard.clientList.nameTitle}
          </BodyText>
          <BodyText className="without-padding  primary-black bold">
            {copy.dashboard.clientList.uriTitle}
          </BodyText>
        </TitleContainer>
      )}
    >
      {props.clients.map((client, index) => (
        <ClientItem key={index} client={client} />
      ))}
    </TitledCard>
  );
};

export default ClientList;
