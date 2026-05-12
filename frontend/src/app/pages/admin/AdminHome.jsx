import React from 'react';
import { Link } from 'react-router-dom';
import { newsStore, tournamentsStore, servicesStore, catalogStore } from '../../admin/adminStore';

const SECTIONS = [
  {
    key: 'news',
    path: '/secure/helmet/admin/news',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2-2z" />
        <line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
      </svg>
    ),
    label: 'Новости',
    desc: 'Создание, редактирование и удаление новостей',
    count: () => newsStore.getAll().length,
  },
  {
    key: 'tournaments',
    path: '/secure/helmet/admin/tournaments',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
      </svg>
    ),
    label: 'Турниры',
    desc: 'Управление кастомными турнирами и регистрациями',
    count: () => tournamentsStore.getAll().length,
  },
  {
    key: 'services',
    path: '/secure/helmet/admin/services',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="6" height="6" rx="1" /><rect x="16" y="3" width="6" height="6" rx="1" />
        <rect x="2" y="15" width="6" height="6" rx="1" /><rect x="16" y="15" width="6" height="6" rx="1" />
        <line x1="9" y1="6" x2="15" y2="6" /><line x1="9" y1="18" x2="15" y2="18" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </svg>
    ),
    label: 'Сервисы',
    desc: 'Настройка карточек сервисов на главной странице',
    count: () => servicesStore.getAll().filter((s) => s.visible).length,
    countLabel: 'активных',
  },
  {
    key: 'catalog',
    path: '/secure/helmet/admin/catalog',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="7" y1="5" x2="7" y2="19" /><line x1="12" y1="5" x2="12" y2="19" />
      </svg>
    ),
    label: 'Каталог танков',
    desc: 'Сборки оборудования и полевые модернизации',
    count: () => catalogStore.getAll().length,
  },
];

function AdminHome() {
  return (
    <div className="adm-wrapper">
      <div className="adm-container">

        <div className="adm-home__header">
          <div className="adm-home__label">Панель управления</div>
          <h1 className="adm-home__title">Администрирование</h1>
          <p className="adm-home__subtitle">Выберите раздел для управления</p>
        </div>

        <div className="adm-home__grid">
          {SECTIONS.map((sec) => {
            const count = sec.count();
            return (
              <Link key={sec.key} to={sec.path} className="adm-card">
                <div className="adm-card__icon">{sec.icon}</div>
                <div className="adm-card__body">
                  <h2 className="adm-card__title">{sec.label}</h2>
                  <p className="adm-card__desc">{sec.desc}</p>
                </div>
                <div className="adm-card__footer">
                  <span className="adm-card__count">{count}</span>
                  <span className="adm-card__count-label">{sec.countLabel ?? 'записей'}</span>
                  <svg className="adm-card__arrow" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default AdminHome;