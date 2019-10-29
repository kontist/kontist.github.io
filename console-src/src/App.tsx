import React from "react";
import { Client } from "@kontist/client";
import Modal from "react-modal";

import { BrowserRouter, Route, Switch } from "react-router-dom";

import { OAuthClientsProvider } from "./enhancers/withOAuthClients";
import KontistClientProvider from "./enhancers/KontistClientProvider";
import AuthenticateUser from "./enhancers/AuthenticateUser";
import Dashboard from "./pages/Dashboard";
import CreateClient from "./pages/CreateClient";
import UpdateClient from "./pages/UpdateClient";

Modal.setAppElement("#root");

const App = () => (
  <KontistClientProvider>
    {(kontistClient: Client) => (
      <BrowserRouter basename="/console">
        <AuthenticateUser kontistClient={kontistClient}>
          <OAuthClientsProvider kontistClient={kontistClient}>
            <Switch>
              <Route path="/" exact component={Dashboard} />
              <Route path="/clients" exact component={Dashboard} />
              <Route path="/clients/create" exact component={CreateClient} />
              <Route
                path="/clients/update/:clientId"
                exact
                component={UpdateClient}
              />
            </Switch>
          </OAuthClientsProvider>
        </AuthenticateUser>
      </BrowserRouter>
    )}
  </KontistClientProvider>
);

export default App;
