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

  &.align-center {
    text-align: center;
    @media (max-width: 800px) {
      text-align: left;
    }
  }

  &.p1 {
    font-size: 34px;
    line-height: 120%;
    @media (max-width: 800px) {
      font-size: 24px;
    }
  }

  &.p2 {
    font-size: 28px;
  }

  &.small {
    font-size: 18px;
  }

  &.verySmall {
    font-size: 16px;
  }

  @media (max-width: 800px) {
    font-size: 22px;
  }

  @media (max-width: 800px) {
    font-size: 18px;
  }
`;

const H1 = styled.h1`
  font-size: 60px;
  line-height: 100%;
  padding-bottom: 16px;
  color: ${colors.primaryBlack};
  @media (max-width: 800px) {
    font-size: 42px;
  }
`;

const H2 = styled.h2`
  font-size: 46px;
  line-height: 110%;
  padding-bottom: 16px;
  color: ${colors.primaryBlack};
  @media (max-width: 800px) {
    font-size: 38px;
  }
`;

const H3 = styled.h3`
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
`;

export { BodyText, H1, H2, H3, H4 };
