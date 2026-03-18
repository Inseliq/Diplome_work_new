import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { usePageTitle } from '../../utils/usePageTitle';

function Layout() {
  usePageTitle('/');

  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;