import React, { ReactNode } from "react";
import styled from "styled-components";
import classnames from "classnames";

import colors from "../../../theme/colors";

import LoadingIndicator from "../../LoadingIndicator";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  left: calc(50% - 12px);
`;

const Button = styled.button`
  border-style: none;
  outline: none;
  cursor: pointer;
  color: white;
  min-width: 150px;
  min-height: 50px;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 18px;
  justify-content: center;
  border-radius: 4px;
  padding: 0 32px;
  background-color: ${colors.primaryPurple};
  transition: all 0.2s ease;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px;
  position: relative;
  z-index: 1;

  &.destructive {
    background-color: ${colors.darkRed};
  }

  &:hover:not([disabled]) {
    background-color: ${colors.black};
  }

  &:disabled {
    color: ${colors.transparentWhite};
    cursor: not-allowed;
  }
`;

interface Props {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  type?: "button" | "submit";
}

const ButtonComponent = ({
  children,
  disabled,
  loading,
  onClick,
  destructive,
  type = "submit"
}: Props) => (
  <Button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={classnames({
      destructive
    })}
  >
    {loading && (
      <LoadingContainer>
        <LoadingIndicator small white />
      </LoadingContainer>
    )}
    {children}
  </Button>
);

export default ButtonComponent;
