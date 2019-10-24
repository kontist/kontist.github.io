import React from "react";
import styled from "styled-components";

import { ReactComponent as LoadingIndicatorAsset } from "../../assets/svg/loading-indicator.svg";

const Loader = styled(LoadingIndicatorAsset)`
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem;
`;

const LoadingIndicator = () => (
  <LoaderContainer>
    <Loader />
  </LoaderContainer>
);

export default LoadingIndicator;
