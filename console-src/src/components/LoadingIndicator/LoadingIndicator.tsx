import styled from "styled-components";

import { ReactComponent as LoadingIndicatorAsset } from "../../assets/svg/loading-indicator.svg";

const LoadingIndicator = styled(LoadingIndicatorAsset)`
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

export default LoadingIndicator;
