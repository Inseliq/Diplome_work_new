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
import Events from './app/pages/Events';
import EventDetail from './app/pages/EventDetail';
import Social from './app/pages/Social';

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
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="social-media" element={<Social />} />
      </Route>
    </Routes>
  );
}

export default App;