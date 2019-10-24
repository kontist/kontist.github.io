import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

import { KontistClientProvider } from "./enhancers/withKontistClient";
import Dashboard from "./pages/Dashboard";

const history = createBrowserHistory();

const App = () => (
  <Router history={history}>
    <KontistClientProvider>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/dashboard" exact component={Dashboard} />
      </Switch>
    </KontistClientProvider>
  </Router>
);

export default App;
