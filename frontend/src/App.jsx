import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROLES } from './app/data/roles';

import './app/styles/reset.css';
import './app/styles/variables.css';
import './app/styles/globals.css';
import './app/styles/assemble.css';
import Layout from './app/components/layout/Layout';

import AdminRoute from './app/components/routes/AdminRoute';
import HomeAdmin from './app/admin/HomeAdmin';
import AdminNotification from './app/pages/admins/AdminNotification';
import AdminNews from './app/pages/admins/AdminNews';
import AdminEvents from './app/pages/admins/AdminEvents';
import AdminBanners from './app/pages/admins/AdminBanners';
import AdminClans from './app/pages/admins/AdminClans';
import AdminUsers from './app/pages/admins/AdminUsers';
import AdminReserves from './app/pages/admins/AdminReserves';
import AdminTournaments from './app/pages/admins/AdminTournaments';
import AdminTournamentsMatches from './app/pages/admins/AdminTournamentsMatches';
import AdminDirectory from './app/pages/admins/AdminDirectory';

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
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <HomeAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <AdminNotification />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/news"
          element={
            <AdminRoute>
              <AdminNews />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/home-banners"
          element={
            <AdminRoute>
              <AdminBanners />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/clans"
          element={
            <AdminRoute>
              <AdminClans />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reserves"
          element={
            <AdminRoute>
              <AdminReserves />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tournaments"
          element={
            <AdminRoute>
              <AdminTournaments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tournament-matches"
          element={
            <AdminRoute>
              <AdminTournamentsMatches />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/directory"
          element={
            <AdminRoute>
              <AdminDirectory />
            </AdminRoute>
          }
        />

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