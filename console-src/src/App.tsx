import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import { OAuthClientsProvider } from "./enhancers/withOAuthClients";
import Dashboard from "./pages/Dashboard";

const history = createBrowserHistory();

const App = () => (
  <Router history={history}>
    <OAuthClientsProvider>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/dashboard" exact component={Dashboard} />
      </Switch>
    </OAuthClientsProvider>
  </Router>
);

export default App;
