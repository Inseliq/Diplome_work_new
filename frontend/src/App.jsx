import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import './app/styles/reset.css';
import './app/styles/variables.css';
import './app/styles/globals.css';
import './app/styles/assemble.css';
import Layout from './app/components/layout/Layout';

// Pages
import Home from './app/pages/Home';
import Services from './app/pages/Services';

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
