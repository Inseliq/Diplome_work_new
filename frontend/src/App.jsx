import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './app/styles/reset.css';
import './app/styles/variables.css';
import './app/styles/globals.css';
import './app/styles/assemble.css';
import Layout from './app/components/layout/Layout';

import Home from './app/pages/Home';
import Services from './app/pages/Services';
import Clan from './app/pages/Clan';
import Tournaments from './app/pages/Tournaments';
import News from './app/pages/News';
import NewsDetail from './app/pages/NewsDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="clan" element={<Clan />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsDetail />} />
      </Route>
    </Routes>
  );
}

export default App;