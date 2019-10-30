import React, { ReactNode } from "react";
import styled from "styled-components";

import colors from "../../theme/colors";

const TitledCardContainer = styled.div`
  border-radius: 0.25rem;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
`;

const TitledCardHeader = styled.div`
  border-top: 0.25rem solid ${colors.secondaryPurple};
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 1rem;
  min-height: 30px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.veryLightGrey};
`;

type Props = {
  children: ReactNode;
  renderTitle: Function;
};

const TitledCard = (props: Props) => {
  return (
    <TitledCardContainer>
      <TitledCardHeader>{props.renderTitle()}</TitledCardHeader>
      {props.children}
    </TitledCardContainer>
  );
};

export default TitledCard;
