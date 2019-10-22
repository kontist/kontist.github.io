import React, { Component } from "react";
import { Client } from "@kontist/client";

import prodConfig from "../config";
import devConfig from "../config.dev";

import Loading from "../pages/Loading";

const { baseAPIUrl, clientId, redirectUri } =
  process.env.NODE_ENV === "production" ? prodConfig : devConfig;

const STATE_KEY = "state";
const VERIFIER_KEY = "verifier";
const CLIENT_SCOPE = "clients";
const CODE_QUERY_PARAM = "code";

sessionStorage.setItem(
  STATE_KEY,
  sessionStorage.getItem(STATE_KEY) || (Math.random() + "").substring(2)
);
sessionStorage.setItem(
  VERIFIER_KEY,
  sessionStorage.getItem(VERIFIER_KEY) || (Math.random() + "").substring(2)
);

const client = new Client({
  baseUrl: baseAPIUrl,
  clientId,
  redirectUri,
  scopes: [CLIENT_SCOPE],
  state: sessionStorage.getItem(STATE_KEY) || "",
  verifier: sessionStorage.getItem(VERIFIER_KEY) || ""
});

interface State {
  isAuthenticated: boolean;
}

const withAuth = (BaseComponent: React.ComponentType) => {
  return class extends Component<{}, State> {
    constructor(props: {}) {
      super(props);

      this.state = {
        isAuthenticated: Boolean(client.auth.token)
      };
    }

    async componentDidMount() {
      if (client.auth.token) {
        return;
      }

      const params = new URL(document.location.href).searchParams;
      const code = params.get(CODE_QUERY_PARAM);

      if (!code) {
        const url = await client.auth.getAuthUri();
        window.location.href = url;
      } else {
        await client.auth.fetchToken(document.location.href);
        this.setState({
          isAuthenticated: true
        });
      }
    }

    render() {
      const { isAuthenticated } = this.state;

      return isAuthenticated ? <BaseComponent {...this.props} /> : <Loading />;
    }
  };
};

export default withAuth;
