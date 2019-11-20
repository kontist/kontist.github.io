import React from "react";
import styled from "styled-components";

import LoadingIndicator from "../../components/LoadingIndicator";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Loading = () => {
  return (
    <LoadingContainer>
      <LoadingIndicator />
    </LoadingContainer>
  );
};

export default Loading;
