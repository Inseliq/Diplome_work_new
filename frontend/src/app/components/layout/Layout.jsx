import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { usePageTitle } from '../../utils/usePageTitle';
import { config } from '../../../api/config/env';

function Layout() {
  usePageTitle('/');

  return (
    <>
      <Header />
      <main className="page" style={{ backgroundColor: config.themeBg }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;