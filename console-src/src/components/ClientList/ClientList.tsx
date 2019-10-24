import React from "react";
import styled from "styled-components";

import { BodyText } from "../../components/Text";
import TitledCard from "../../components/TitledCard";
import ClientItem from "../../components/ClientItem";
import { OAuthClient } from "../../types/oAuthClient";
import copy from "../../copy";

type ClientListProps = {
  clients: OAuthClient[];
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
