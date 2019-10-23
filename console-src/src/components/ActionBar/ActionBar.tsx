import React, { ReactNode } from "react";
import styled from "styled-components";

import { BodyText } from "../Text";

const ActionBarContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type Props = {
  children: ReactNode;
  title: string;
};

const ActionBar = (props: Props) => (
  <ActionBarContainer>
    <BodyText className="without-padding">{props.title}</BodyText>
    {props.children}
  </ActionBarContainer>
);

export default ActionBar;
