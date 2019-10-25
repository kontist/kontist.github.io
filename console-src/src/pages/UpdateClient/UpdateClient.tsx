import React from "react";
import { History } from "history";

import withOAuthClients from "../../enhancers/withOAuthClients";
import Layout from "../../layout";
import ActionBar from "../../components/ActionBar";
import BackButton from "../../components/buttons/BackButton";
import { BodyText } from "../../components/Text";
import TitledCard from "../../components/TitledCard";
import ClientForm from "../../components/ClientForm";

import copy from "../../copy";
import { OAuthClient } from "../../types/oAuthClient";

type Props = {
  oAuthClients: OAuthClient[];
  updateClient: Function;
  isLoading: boolean;
  history: History;
  match: {
    params: {
      clientId: string;
    };
  };
};

const UpdateClient = ({
  oAuthClients,
  updateClient,
  isLoading,
  history,
  match
}: Props) => {
  const { clientId } = match.params;
  const client = oAuthClients.find(client => client.id === clientId);

  return (
    <Layout>
      <ActionBar>
        <BackButton onClick={() => history.goBack()} />
        <BodyText className="without-padding primary-black">
          {copy.backButtonLabel}
        </BodyText>
      </ActionBar>
      <TitledCard
        renderTitle={() => (
          <BodyText className="without-padding primary-black bold">
            {copy.updateClient.title}
          </BodyText>
        )}
      >
        <ClientForm
          client={client}
          action={updateClient}
          buttonLabel={copy.updateClient.buttonLabel}
          isLoading={isLoading}
          history={history}
        />
      </TitledCard>
    </Layout>
  );
};

export default withOAuthClients(UpdateClient);
