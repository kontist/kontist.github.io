import React from "react";
import styled from "styled-components";

import colors from "../../../theme/colors";

import { ReactComponent as ArrowLeft } from "../../../assets/svg/arrow-left.svg";

const Button = styled.button`
  outline: none;
  cursor: pointer;
  min-height: 50px;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 18px;
  justify-content: center;
  flex-direction: column;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  background-color: ${colors.white};
  color: ${colors.primaryPurple};
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  width: 50px;
  padding: 0;
  margin-right: 1rem;

  svg path {
    fill: ${colors.primaryPurple};
  }

  &:hover:not([disabled]) {
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    background: #eee;
  }

  &.center {
    margin: 0 auto;
  }

  &:disabled {
    color: ${colors.transparentPrimaryPurple};
    cursor: not-allowed;
  }
`;

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const IconButton = (props: Props) => {
  const { disabled, loading, onClick } = props;
  return (
    <Button type="button" disabled={disabled || loading} onClick={onClick}>
      <ArrowLeft />
    </Button>
  );
};

export default IconButton;
