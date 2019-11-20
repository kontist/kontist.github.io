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

type Props = {
  createClient: Function;
  isLoading: boolean;
  history: History;
};

const CreateClient = ({ createClient, isLoading, history }: Props) => {
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
            {copy.createClient.title}
          </BodyText>
        )}
      >
        <ClientForm
          action={createClient}
          buttonLabel={copy.createClient.buttonLabel}
          isLoading={isLoading}
          history={history}
        />
      </TitledCard>
    </Layout>
  );
};

export default withOAuthClients(CreateClient);
