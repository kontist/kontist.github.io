import React, { Component } from "react";
import { Client } from "kontist";

import Loading from "../pages/Loading";

const CODE_QUERY_PARAM = "code";

type Props = {
  kontistClient: Client;
};

type State = {
  isAuthenticated: boolean;
};

class AuthenticateUser extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isAuthenticated: false
    };
  }
  async componentDidMount() {
    const { kontistClient } = this.props;

    if (kontistClient.auth.token) {
      this.setState({
        isAuthenticated: true
      });

      return;
    }

    const params = new URL(document.location.href).searchParams;
    const code = params.get(CODE_QUERY_PARAM);

    if (!code) {
      const url = await kontistClient.auth.getAuthUri();
      window.location.href = url;
    } else {
      await kontistClient.auth.fetchToken(document.location.href);
      this.setState({
        isAuthenticated: true
      });
    }
  }

  render() {
    const { isAuthenticated } = this.state;

    return isAuthenticated ? this.props.children : <Loading />;
  }
}

export default AuthenticateUser;
