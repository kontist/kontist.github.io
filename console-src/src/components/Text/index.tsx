import styled from "styled-components";
import colors from "../../theme/colors";

const BodyText = styled.p`
  font-size: 20px;
  line-height: 140%;
  padding-bottom: 16px;
  color: ${colors.darkGrey};

  &.without-padding {
    padding-bottom: 0;
  }

  &.primary-black {
    color: ${colors.primaryBlack};
  }

  &.bold {
    font-weight: 500;
  }

  &.small {
    font-size: 18px;
  }

  &.x-small {
    font-size: 16px;
  }

  &.italic {
    font-style: italic;
  }

  &.align-center {
    text-align: center;
  }

  @media (max-width: 800px) {
    font-size: 22px;
  }

  @media (max-width: 800px) {
    font-size: 18px;
  }
`;

const H1 = styled.h1`
  font-size: 26px;
  line-height: 100%;
  color: ${colors.primaryBlack};
  padding-bottom: 12px;
  &.align-center {
    text-align: center;
  }
`;

const H4 = styled.h4`
  font-size: 22px;
  line-height: 120%;
  color: ${colors.primaryBlack};

  &.align-center {
    text-align: center;
  }
`;

export { BodyText, H1, H4 };
