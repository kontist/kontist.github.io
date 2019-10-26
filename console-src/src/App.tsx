import React from "react";
import { Client } from "@kontist/client";
import Modal from "react-modal";

import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import { OAuthClientsProvider } from "./enhancers/withOAuthClients";
import KontistClientProvider from "./enhancers/KontistClientProvider";
import AuthenticateUser from "./enhancers/AuthenticateUser";
import Dashboard from "./pages/Dashboard";
import CreateClient from "./pages/CreateClient";
import UpdateClient from "./pages/UpdateClient";

const history = createBrowserHistory();

Modal.setAppElement("#root");

const App = () => (
  <KontistClientProvider>
    {(kontistClient: Client) => (
      <Router history={history}>
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
      </Router>
    )}
  </KontistClientProvider>
);

export default App;
