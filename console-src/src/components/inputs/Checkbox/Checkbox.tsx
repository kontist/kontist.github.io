import React from "react";
import styled from "styled-components";

import { ReactComponent as CheckboxIcon } from "../../../assets/svg/checkbox.svg";

import colors from "../../../theme/colors";

const StyledLabel = styled.label`
  padding-left: 1rem;
  cursor: pointer;

  &.empty {
    color: ${colors.darkGrey};
  }
`;

const Container = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  svg:nth-of-type(1) {
    height: 40px;
    width: 40px;
    z-index: 2;
  }

  svg {
    position: relative;
    &.empty {
      path:nth-of-type(1) {
        fill: ${colors.veryLightGrey};
      }
      path:nth-of-type(2) {
        fill: #fff;
      }
    }
  }
`;

type Props = {
  checked: boolean;
  label: string;
  handleClick: (event: React.MouseEvent<HTMLInputElement>) => void;
};

const Checkbox = ({ checked, handleClick, label }: Props) => {
  return (
    <Container onClick={handleClick}>
      <CheckboxIcon className={checked ? "" : "empty"} />
      <StyledLabel className={checked ? "" : "empty"}>{label}</StyledLabel>
    </Container>
  );
};

export default Checkbox;
