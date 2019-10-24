import React from "react";
import styled from "styled-components";

import colors from "../../../theme/colors";
import copy from "../../../copy";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 0.5rem;
`;

const StyledLabel = styled.label`
  flex: 3;
  padding-right: 1rem;
  font-size: 18px;
`;

const StyledSuffix = styled.span`
  font-size: 16px;
  font-style: italic;
  color: ${colors.darkGrey};
  padding-left: 0.5rem;
`;

const StyledInput = styled.input`
  flex: 5;
  font-size: 18px;
  line-height: 140%;
  height: 50px;
  width: 100%;
  width: fill-available;
  background: rgba(0, 0, 0, 0.05);
  padding: 0 12px;
  display: block;
  opacity: 1;
  border-radius: 4px;
  border: 2px solid transparent;
  box-sizing: border-box;
  color: ${colors.primaryBlack};
  transition: all 0.3s;

  &.invalid {
    border: 2px solid ${colors.darkRed};
    color: ${colors.darkRed};
  }

  &.invalid:focus {
    border: 2px solid ${colors.darkRed};
    color: ${colors.darkRed};
  }

  &::placeholder {
    color: ${colors.midDarkGrey};
  }

  &:focus {
    border: 2px solid ${colors.midDarkGrey};
    color: ${colors.primaryBlack}!important;
    outline: none;
    &::placeholder {
      color: ${colors.midGrey};
    }
  }

  &:active {
    border: 2px solid ${colors.midDarkGrey};
    color: ${colors.primaryBlack};
  }

  &:disabled {
    opacity: 1;
    -webkit-text-fill-color: ${colors.primaryBlack};
  }
`;

type Props = {
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
  value?: string;
  type?: string;
  optional?: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const BaseInput = ({
  placeholder = "",
  value,
  label,
  type = "text",
  handleChange,
  optional,
  isInvalid = false
}: Props) => (
  <Container>
    <StyledLabel>
      {label}
      {optional && (
        <StyledSuffix>{copy.clientForm.optionalFields}</StyledSuffix>
      )}
    </StyledLabel>
    <StyledInput
      type={type}
      placeholder={placeholder}
      className={isInvalid ? "invalid" : ""}
      value={value}
      onChange={handleChange}
    />
  </Container>
);

export default BaseInput;
