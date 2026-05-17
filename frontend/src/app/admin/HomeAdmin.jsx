import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { LoadingSpinner } from '../components/ui/StatusComponents';
import './home-admin.css';

const FALLBACK_SECTIONS = [
  {
    key: 'users',
    title: 'Пользователи',
    description: 'Управление аккаунтами, ролями и доступом пользователей.',
    path: '/admin/users',
  },
  {
    key: 'clans',
    title: 'Кланы',
    description: 'Создание кланов, назначение игроков и управление званиями.',
    path: '/admin/clans',
  },
  {
    key: 'clan-reserves',
    title: 'Резервы кланов',
    description: 'Пополнение склада резервов и контроль активных бонусов.',
    path: '/admin/reserves',
  },
  {
    key: 'tournaments',
    title: 'Турниры',
    description: 'Создание и редактирование пользовательских турниров.',
    path: '/admin/tournaments',
  },
  {
    key: 'tournament-matches',
    title: 'Матчи турниров',
    description: 'Сетки, пары команд, результаты и победители.',
    path: '/admin/tournament-matches',
  },
  {
    key: 'news',
    title: 'Новости',
    description: 'Публикация новостей и обновлений платформы.',
    path: '/admin/news',
  },
  {
    key: 'home-banners',
    title: 'Баннеры главной',
    description: 'Управление рекламными баннерами на главной странице.',
    path: '/admin/home-banners',
  },
  {
    key: 'events',
    title: 'События',
    description: 'Создание событий и привязка турниров.',
    path: '/admin/events',
  },
  {
    key: 'notifications',
    title: 'Уведомления',
    description: 'Настройка всплывающих уведомлений для пользователей.',
    path: '/admin/notifications',
  },
  {
    key: 'vehicle-builds',
    title: 'Сборки техники',
    description: 'Оборудование и полевая модернизация танков.',
    path: '/admin/directory',
  },
];

function getSectionNumber(index) {
  return String(index + 1).padStart(2, '0');
}

function HomeAdmin() {
  const {
    dashboard,
    loading,
    error,
    reload,
  } = useAdminDashboard();

  const sections = dashboard?.sections?.length
    ? dashboard.sections
    : FALLBACK_SECTIONS;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__container">
          <LoadingSpinner text="Загружаем админ-панель..." />
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="admin-page">
        <div className="admin-page__container">
          <div className="admin-error">
            <h1>Не удалось загрузить админ-панель</h1>
            <p>Проверьте подключение к серверу и права доступа администратора.</p>

            <div className="admin-error__actions">
              <button className="admin-btn admin-btn--primary" onClick={reload}>
                Попробовать снова
              </button>

              <Link className="admin-btn admin-btn--ghost" to="/">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__container">
        <header className="admin-hero">
          <div>
            <div className="admin-hero__label">
              CosmoManager Admin
            </div>

            <h1 className="admin-hero__title">
              {dashboard?.title || 'Административная панель'}
            </h1>

            <p className="admin-hero__description">
              {dashboard?.description || 'Выберите раздел для управления системой.'}
            </p>
          </div>

          <Link to="/" className="admin-btn admin-btn--ghost">
            Вернуться на сайт
          </Link>
        </header>

        <section className="admin-grid" aria-label="Разделы управления">
          {sections.map((section, index) => (
            <Link
              key={section.key}
              to={section.path}
              className="admin-card"
            >
              <div className="admin-card__top">
                <span className="admin-card__number">
                  {getSectionNumber(index)}
                </span>

                <span className="admin-card__arrow">
                  →
                </span>
              </div>

              <h2 className="admin-card__title">
                {section.title}
              </h2>

              <p className="admin-card__description">
                {section.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default HomeAdmin;