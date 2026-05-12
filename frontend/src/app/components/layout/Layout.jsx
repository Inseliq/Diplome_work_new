import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollTopButton from '../ui/ScrollTopButton';
import { usePageTitle } from '../../utils/usePageTitle';
import { useScrollToTopOnNavigate } from '../../utils/useScrollToTopOnNavigate';
import { useReveal } from '../../utils/useReveal';
import NotificationGate from '../ui/NotificationGate';

function Layout() {
  usePageTitle('/');
  useScrollToTopOnNavigate();
  useReveal(); // работает на всех страницах автоматически

  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <ScrollTopButton />
      <NotificationGate />
    </>
  );
}

export default Layout;