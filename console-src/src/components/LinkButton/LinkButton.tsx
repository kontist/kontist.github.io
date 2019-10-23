import styled from "styled-components";
import colors from "../../theme/colors";
import { Link } from "react-router-dom";

const LinkButton = styled(Link)`
  border-style: none;
  outline: none;
  cursor: pointer;
  color: white;
  width: 150px;
  min-width: max-content;
  height: 50px;
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

  &:hover:not([disabled]) {
    background-color: ${colors.black};
  }
`;

export default LinkButton;
