import React from "react";
import styled from "styled-components";
import classnames from "classnames";

import { ReactComponent as LoadingIndicatorAsset } from "../../assets/svg/loading-indicator.svg";
import colors from "../../theme/colors";

const Loader = styled(LoadingIndicatorAsset)`
  animation: spin 2s linear infinite;

  &.small {
    width: 24px;
    height: 24px;
  }

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

  &.small {
    margin: 0;
  }

  &.white {
    svg path {
      fill: ${colors.white};
    }
  }
`;

type Props = {
  small?: boolean;
  white?: boolean;
};

const LoadingIndicator = ({ small, white }: Props) => {
  const classes = classnames({
    small,
    white
  });
  return (
    <LoaderContainer className={classes}>
      <Loader className={classes} />
    </LoaderContainer>
  );
};

export default LoadingIndicator;
