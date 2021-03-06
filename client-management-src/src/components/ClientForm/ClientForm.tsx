import React, { Component, Fragment, ReactNode } from "react";
import { History } from "history";
import styled from "styled-components";

import { BodyText } from "../Text";
import TextInput from "../inputs/TextInput";
import Checkbox from "../inputs/Checkbox";
import Button from "../buttons/Button";

import colors from "../../theme/colors";
import copy from "../../copy";

import { Schema, AuthorizedScopes } from "../../types/oAuthClient";

const Separator = styled.div`
  height: 1px;
  width: 100%;
  margin: 0.5rem 0 1rem;
  background-color: ${colors.veryLightGrey};
`;

const StyledForm = styled.form`
  padding: 1rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 0.5rem;

  & > * {
    flex: 1 0 50%;
    position: relative;
    left: 1rem;
  }

  @media (max-width: 800px) {
    flex-direction: column;

    & > * {
      flex: 1 0 100%;
      left: 0;
    }
  }
`;

type CheckboxGroupProps = {
  title: string;
  children: ReactNode;
};

const CheckboxGroup = ({ title, children }: CheckboxGroupProps) => (
  <Fragment>
    <BodyText className="primary-black small">{title}</BodyText>
    <CheckboxContainer>{children}</CheckboxContainer>
  </Fragment>
);

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

type ClientFormProps = {
  action: Function;
  isLoading?: boolean;
  buttonLabel: string;
  history: History;
  client?: Schema.Client;
};

type Scopes = {
  [index in AuthorizedScopes]: boolean;
};

type State = {
  isValid: boolean;
  name?: string;
  redirectUri?: string | null;
  secret?: string;
  scopes: Scopes;
};

type TextInputKeyType = "name" | "secret" | "redirectUri";

const hasValidScopes = (scopes: Scopes) =>
  Object.values(scopes).some(scope => scope);

const hasValidState = (state: State) =>
  hasValidScopes(state.scopes) &&
  Boolean(state.redirectUri) &&
  Boolean(state.name);

const getInitialState = (client?: Schema.Client) => {
  const defaultState = {
    isValid: false,
    name: undefined,
    redirectUri: undefined,
    secret: undefined,
    scopes: {
      OFFLINE: false,
      ACCOUNTS: false,
      USERS: false,
      TRANSACTIONS: false,
      TRANSFERS: false,
      SUBSCRIPTIONS: false,
      STATEMENTS: false
    }
  };

  return {
    ...defaultState,
    ...(client
      ? {
          isValid: true,
          name: client.name,
          redirectUri: client.redirectUri,
          scopes: {
            ...defaultState.scopes,
            ...(client.scopes || []).reduce(
              (scopes, scope) => ({ ...scopes, [scope]: true }),
              {}
            )
          }
        }
      : {})
  };
};

class ClientForm extends Component<ClientFormProps, State> {
  constructor(props: ClientFormProps) {
    super(props);

    this.state = getInitialState(props.client);
  }

  handleTextInputChange = (key: TextInputKeyType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    this.setState(state => {
      const updatedState = {
        ...state,
        [key]: value
      };
      return {
        ...updatedState,
        isValid: hasValidState(updatedState)
      };
    });
  };

  handleCheckboxClick = (key: keyof Scopes) => () => {
    this.setState((state: State) => {
      const updatedScopes = {
        ...state.scopes,
        [key]: !state.scopes[key]
      };
      const updatedState = {
        ...state,
        scopes: updatedScopes
      };
      return {
        ...updatedState,
        isValid: hasValidState(updatedState)
      };
    });
  };

  submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, redirectUri, secret, scopes } = this.state;
    const { client } = this.props;

    await this.props.action({
      ...(client ? { id: client.id } : {}),
      name,
      redirectUri,
      secret,
      scopes: (Object.keys(scopes) as (keyof Scopes)[]).filter(
        scope => scopes[scope]
      )
    });

    this.props.history.push("/clients");
  };

  render() {
    const { name, redirectUri, secret, scopes, isValid } = this.state;
    const { buttonLabel, isLoading, client } = this.props;

    const isUpdate = Boolean(client);

    return (
      <StyledForm onSubmit={this.submitForm}>
        <TextInput
          label={copy.clientForm.name}
          placeholder={copy.clientForm.placeholders.name}
          value={name}
          handleChange={this.handleTextInputChange("name")}
        />
        <TextInput
          label={copy.clientForm.redirectUri}
          placeholder={copy.clientForm.placeholders.redirectUri}
          value={redirectUri || ""}
          handleChange={this.handleTextInputChange("redirectUri")}
        />
        <TextInput
          label={copy.clientForm.secret}
          placeholder={copy.clientForm.placeholders.secret}
          value={secret}
          optional
          handleChange={this.handleTextInputChange("secret")}
        />
        {isUpdate && (
          <BodyText className="italic x-small">
            {copy.updateClient.secretInformation}
          </BodyText>
        )}
        <CheckboxGroup title={copy.scopes.title}>
          {(Object.keys(scopes) as (keyof Scopes)[]).map(scope => (
            <Checkbox
              label={copy.scopes[scope]}
              key={scope}
              checked={scopes[scope]}
              handleClick={this.handleCheckboxClick(scope)}
            />
          ))}
        </CheckboxGroup>
        <Separator />
        <ButtonContainer>
          <Button type="submit" loading={isLoading} disabled={!isValid}>
            {buttonLabel}
          </Button>
        </ButtonContainer>
      </StyledForm>
    );
  }
}

export default ClientForm;
