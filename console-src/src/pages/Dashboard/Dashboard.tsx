import React, { Fragment } from "react";
import styled from "styled-components";

import withOAuthClients from "../../enhancers/withOAuthClients";
import { OAuthClient } from "../../types/oAuthClient";
import Layout from "../../layout";
import { BodyText, H1 } from "../../components/Text";
import LinkButton from "../../components/LinkButton";
import ClientList from "../../components/ClientList";
import ActionBar from "../../components/ActionBar";
import copy from "../../copy";
import LoadingIndicator from "src/components/LoadingIndicator";

type Props = {
  oAuthClients: OAuthClient[];
  isLoading: boolean;
};

const TitleContainer = styled.div`
  margin-bottom: 1rem;
`;

const Dashboard = (props: Props) => {
  return (
    <Layout>
      <TitleContainer>
        <H1 className="align-center">{copy.dashboard.title}</H1>
        <BodyText className="align-center">{copy.dashboard.subtitle}</BodyText>
      </TitleContainer>
      {props.isLoading ? (
        <LoadingIndicator />
      ) : (
        <Fragment>
          <ActionBar title={copy.dashboard.actionBar.title}>
            <LinkButton to="/clients/create">
              {copy.dashboard.actionBar.button}
            </LinkButton>
          </ActionBar>
          <ClientList clients={props.oAuthClients} />
        </Fragment>
      )}
    </Layout>
  );
};

export default withOAuthClients(Dashboard);
