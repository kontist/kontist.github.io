import React, { Fragment, ReactNode } from "react";
import styled from "styled-components";

import { ReactComponent as Logo } from "../assets/svg/logo.svg";

const HeaderContainer = styled.header`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const Header = () => (
  <HeaderContainer>
    <Logo />
  </HeaderContainer>
);

const Footer = styled.footer`
  height: 30px;
  width: 100%;
  flex-shrink: 0;
`;

const Content = styled.main`
  width: 660px;
`;

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Fragment>
      <Header />
      <Content>{props.children}</Content>
      <Footer />
    </Fragment>
  );
};

export default Layout;
