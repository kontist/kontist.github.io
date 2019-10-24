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

interface KontistClientContext {
  query: (query: string) => Promise<Object> | void;
}

interface State {
  isAuthenticated: boolean;
  value: {
    query: (query: string) => Promise<Object>;
  };
}

const { Provider, Consumer } = React.createContext<KontistClientContext>({
  query: () => {}
});

class KontistClientProvider extends Component<{}, State> {
  query: (query: string) => Promise<Object>;

  constructor(props: {}) {
    super(props);

    this.query = async (query: string) => client.graphQL.rawQuery(query);

    this.state = {
      isAuthenticated: false,
      value: {
        query: this.query
      }
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
    const { value, isAuthenticated } = this.state;

    return (
      <Provider value={value}>
        {isAuthenticated ? this.props.children : <Loading />}
      </Provider>
    );
  }
}

const withKontistClient = (BaseComponent: any) => {
  return class extends Component {
    render() {
      return (
        <Consumer>
          {({ query }) => <BaseComponent query={query} {...this.props} />}
        </Consumer>
      );
    }
  };
};

export { KontistClientProvider };
export default withKontistClient;
