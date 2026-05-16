import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROLES } from './app/data/roles';

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
import Marks from './app/pages/Marks';
import Masters from './app/pages/Masters';
import Customs from './app/pages/Customs';
import CustomDetail from './app/pages/CustomDetail';
import CustomRegister from './app/pages/CustomRegister';
import CatalogsTanks from './app/pages/CatalogsTanks';
import TankDirectory from './app/pages/TankDirectory';
// import AdminHome from './app/pages/admin/AdminHome';
// import { AdminNewsList, AdminNewsEdit } from './app/pages/admin/AdminNews';
// import { AdminTournamentsList, AdminTournamentsEdit } from './app/pages/admin/AdminTournaments';
// import { AdminServices, AdminCatalog } from './app/pages/admin/AdminServicesCatalog';
import ErrorPage from './app/pages/service/ErrorPage';
import InDevelopment from './app/pages/service/InDevelopment';
import Maintenance from './app/pages/service/Maintenance';
import Mods from './app/pages/Mods';
import Documents from './app/pages/Documents';
import ProtectedRoute from './app/components/ProtectedRoute';
import Reserves from './app/pages/Reserves';
import Profile from './app/pages/Profile';
import MyClan from './app/pages/MyClan';

import Login from './app/pages/Login';
import Register from './app/pages/Register';

// Пример использования:
{/* <Route
  path="/admin"
  element={
    <ProtectedRoute roles={[ROLES.Administrator]}>
      <AdminPanel />
    </ProtectedRoute>
  }
/> */}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />

        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="clan" element={<Clan />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="news" element={<News />} />
        <Route path="mods" element={<Mods />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:documentKey" element={<Documents />} />
        <Route path="news/:id" element={<NewsDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="social-media" element={<Social />} />
        <Route path="achievements/marks" element={<Marks />} />
        <Route path="achievements/masters" element={<Masters />} />
        <Route path="tournaments/custom" element={<Customs />} />
        <Route path="tournaments/custom/details/:id" element={<CustomDetail />} />
        <Route path="directory" element={<CatalogsTanks />} />
        <Route path="directory/:id" element={<TankDirectory />} />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="clan/me"
          element={
            <ProtectedRoute>
              <MyClan />
            </ProtectedRoute>
          }
        />

        <Route
          path="clan/reserves"
          element={
            <ProtectedRoute>
              <Reserves />
            </ProtectedRoute>
          }
        />

        <Route
          path="tournaments/custom/register/:id"
          element={
            <ProtectedRoute>
              <CustomRegister />
            </ProtectedRoute>
          }
        />


        {/* ── ADMIN ── */}
        {/* <Route path="secure/helmet/admin" element={<AdminHome />} />
        <Route path="secure/helmet/admin/news" element={<AdminNewsList />} />
        <Route path="secure/helmet/admin/news/:id" element={<AdminNewsEdit />} />
        <Route path="secure/helmet/admin/tournaments" element={<AdminTournamentsList />} />
        <Route path="secure/helmet/admin/tournaments/:id" element={<AdminTournamentsEdit />} />
        <Route path="secure/helmet/admin/services" element={<AdminServices />} />
        <Route path="secure/helmet/admin/catalog" element={<AdminCatalog />} /> */}

        {/* ── SERVICE ── */}
        <Route path="error" element={<ErrorPage code="404" />} />
        <Route path="development" element={<InDevelopment />} />
        <Route path="maintenance" element={<Maintenance />} />
      </Route>


      {/* ── Служебные страницы (вне Layout с шапкой — если нужны без шапки) ── */}
      {/* Используй ErrorPage/InDevelopment/Maintenance напрямую в коде при необходимости */}

      {/* ── 404 — всё что не совпало ── */}
      <Route path="*" element={<Layout />}>
        <Route path="*" element={<ErrorPage code={404} />} />
      </Route>
    </Routes>
  );
}

export default App;