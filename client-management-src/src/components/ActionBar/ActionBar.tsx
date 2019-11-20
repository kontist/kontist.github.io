import React, { ReactNode } from "react";
import styled from "styled-components";

import { BodyText } from "../Text";

const ActionBarContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  align-items: center;

  &.spaced {
    justify-content: space-between;
  }
`;

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
};

const ActionBar = (props: Props) => (
  <ActionBarContainer className={props.className}>
    {props.title && (
      <BodyText className="without-padding">{props.title}</BodyText>
    )}
    {props.children}
  </ActionBarContainer>
);

export default ActionBar;
