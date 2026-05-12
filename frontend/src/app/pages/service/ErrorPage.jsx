import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Универсальная страница ошибок.
 *
 * Props:
 *   code        — числовой код (404 | 500 | 403 | 503 | ...)
 *   title       — заголовок (если не передан — берётся из словаря)
 *   description — описание (если не передан — берётся из словаря)
 *
 * Использование:
 *   <ErrorPage code={404} />
 *   <ErrorPage code={500} title="Что-то пошло не так" description="..." />
 */

const ERROR_DICT = {
  400: {
    title: 'Некорректный запрос',
    description: 'Сервер не смог обработать запрос из-за неверного синтаксиса.',
    canReload: false,
    emoji: '🔧',
  },
  401: {
    title: 'Доступ ограничен',
    description: 'Для просмотра этой страницы необходима авторизация.',
    canReload: false,
    emoji: '🔒',
  },
  403: {
    title: 'Доступ запрещён',
    description: 'У вас недостаточно прав для просмотра этого раздела.',
    canReload: false,
    emoji: '🚫',
  },
  404: {
    title: 'Страница не найдена',
    description: 'Страница, которую вы ищете, не существует или была перемещена.',
    canReload: false,
    emoji: '🌌',
  },
  408: {
    title: 'Превышено время ожидания',
    description: 'Сервер не дождался ответа. Попробуйте ещё раз.',
    canReload: true,
    emoji: '⏱️',
  },
  429: {
    title: 'Слишком много запросов',
    description: 'Вы отправили слишком много запросов. Подождите немного и попробуйте снова.',
    canReload: true,
    emoji: '⚡',
  },
  500: {
    title: 'Ошибка сервера',
    description: 'На сервере произошла непредвиденная ошибка. Мы уже работаем над её устранением.',
    canReload: true,
    emoji: '💥',
  },
  502: {
    title: 'Плохой шлюз',
    description: 'Сервер получил некорректный ответ от вышестоящего сервера.',
    canReload: true,
    emoji: '🔁',
  },
  503: {
    title: 'Сервис недоступен',
    description: 'Сервер временно недоступен. Попробуйте позже.',
    canReload: true,
    emoji: '🛰️',
  },
  504: {
    title: 'Шлюз не отвечает',
    description: 'Сервер-шлюз не получил ответа вовремя.',
    canReload: true,
    emoji: '📡',
  },
};

const DEFAULT_ERROR = {
  title: 'Что-то пошло не так',
  description: 'Произошла неизвестная ошибка.',
  canReload: true,
  emoji: '⚠️',
};

function ErrorPage({ code = 404, title, description }) {
  const navigate = useNavigate();
  const dict = ERROR_DICT[code] ?? DEFAULT_ERROR;
  const errTitle = title ?? dict.title;
  const errDesc = description ?? dict.description;
  const canReload = dict.canReload;

  return (
    <div className="wrapper svc-page svc-page--error">
      <div className="svc-page__bg">
        <div className="svc-page__bg-glow svc-page__bg-glow--1" />
        <div className="svc-page__bg-glow svc-page__bg-glow--2" />
      </div>

      <div className="svc-page__content">
        <div className="svc-page__emoji">{dict.emoji}</div>

        <div className="svc-page__code-wrap">
          <span className="svc-page__code">{code}</span>
        </div>

        <h1 className="svc-page__title">{errTitle}</h1>
        <p className="svc-page__desc">{errDesc}</p>

        <div className="svc-page__actions">
          {canReload && (
            <button className="btn btn-ghost svc-page__btn" onClick={() => window.location.reload()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              </svg>
              Перезагрузить
            </button>
          )}
          <Link to="/" className="btn btn-primary svc-page__btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;