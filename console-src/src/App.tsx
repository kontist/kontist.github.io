import React from "react";
import { Client } from "@kontist/client";

import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import { OAuthClientsProvider } from "./enhancers/withOAuthClients";
import KontistClientProvider from "./enhancers/KontistClientProvider";
import AuthenticateUser from "./enhancers/AuthenticateUser";
import Dashboard from "./pages/Dashboard";

const history = createBrowserHistory();

const App = () => (
  <KontistClientProvider>
    {(kontistClient: Client) => (
      <Router history={history}>
        <AuthenticateUser kontistClient={kontistClient}>
          <OAuthClientsProvider kontistClient={kontistClient}>
            <Switch>
              <Route path="/" exact component={Dashboard} />
              <Route path="/dashboard" exact component={Dashboard} />
            </Switch>
          </OAuthClientsProvider>
        </AuthenticateUser>
      </Router>
    )}
  </KontistClientProvider>
);

export default App;
