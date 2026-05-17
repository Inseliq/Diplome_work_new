import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminNotifications,
  createAdminNotification,
  setAdminNotificationPublished,
  deleteAdminNotification,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const EMPTY_FORM = {
  message: '',
  description: '',
  sourceButton: '',
  isPublished: true,
  startsAtUtc: '',
  endsAtUtc: '',
  sortOrder: 0,
};

function getButtonPreview(sourceButton) {
  if (!sourceButton) return null;

  const colonIndex = sourceButton.indexOf(':');

  if (colonIndex === -1) {
    return null;
  }

  return {
    label: sourceButton.slice(0, colonIndex).trim(),
    url: sourceButton.slice(colonIndex + 1).trim(),
  };
}

function toUtcOrNull(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getSourceButton(notification) {
  return notification?.sourceButton ?? notification?.['src-btn'] ?? null;
}

function AdminNotification() {
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminNotifications();

      setActive(data?.active ?? null);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      logger.warn('AdminNotification: не удалось загрузить уведомления', err);
      setActive(null);
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!form.message.trim()) {
      setError({ message: 'Введите заголовок уведомления' });
      return;
    }

    if (!form.description.trim()) {
      setError({ message: 'Введите описание уведомления' });
      return;
    }

    const startsAtUtc = toUtcOrNull(form.startsAtUtc);
    const endsAtUtc = toUtcOrNull(form.endsAtUtc);

    if (startsAtUtc && endsAtUtc && new Date(startsAtUtc) >= new Date(endsAtUtc)) {
      setError({ message: 'Дата начала показа должна быть раньше даты окончания' });
      return;
    }

    setCreating(true);

    try {
      const result = await createAdminNotification({
        message: form.message.trim(),
        description: form.description.trim(),
        sourceButton: form.sourceButton.trim() || null,
        isPublished: form.isPublished,
        startsAtUtc,
        endsAtUtc,
        sortOrder: Number(form.sortOrder) || 0,
      });

      setMessage(result?.message || 'Уведомление создано');
      setForm(EMPTY_FORM);

      await loadNotifications();
    } catch (err) {
      logger.warn('AdminNotification: не удалось создать уведомление', err);
      setError(err);
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublished = async (item) => {
    setError(null);
    setMessage(null);
    setUpdatingId(item.id);

    try {
      const nextValue = !item.isPublished;
      const result = await setAdminNotificationPublished(item.id, nextValue);

      setMessage(result?.message || 'Статус публикации обновлён');
      await loadNotifications();
    } catch (err) {
      logger.warn('AdminNotification: не удалось изменить публикацию', err);
      setError(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Удалить уведомление «${item.message}»?`);

    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setDeletingId(item.id);

    try {
      const result = await deleteAdminNotification(item.id);

      setMessage(result?.message || 'Уведомление удалено');
      await loadNotifications();
    } catch (err) {
      logger.warn('AdminNotification: не удалось удалить уведомление', err);
      setError(err);
    } finally {
      setDeletingId(null);
    }
  };

  const buttonPreview = getButtonPreview(form.sourceButton);
  const activeSourceButton = getSourceButton(active);

  return (
    <main className="wrapper admin-notify">
      <div className="admin-notify__container">
        <header className="admin-notify__header">
          <div>
            <div className="admin-notify__label">
              Админ-панель
            </div>

            <h1 className="admin-notify__title">
              Управление уведомлениями
            </h1>

            <p className="admin-notify__subtitle">
              Создавайте всплывающие уведомления для пользователей. Активным считается опубликованное уведомление, которое попадает в период показа и имеет самый высокий порядок сортировки.
            </p>
          </div>

          <Link to="/admin" className="admin-notify__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-notify__message admin-notify__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-notify__message admin-notify__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-notify__layout">
          <form className="admin-notify__form" onSubmit={handleSubmit}>
            <div className="admin-notify__form-head">
              <h2>Новое уведомление</h2>
              <p>
                После создания опубликованное уведомление может стать активным, если оно подходит по времени и порядку сортировки.
              </p>
            </div>

            <label className="admin-notify__field">
              <span>Название</span>
              <input
                type="text"
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder="Например: Кубок Весны — регистрация открыта"
                maxLength={200}
              />
            </label>

            <label className="admin-notify__field">
              <span>Описание</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Можно использовать markdown-разметку уведомлений..."
                rows={10}
              />
            </label>

            <label className="admin-notify__field">
              <span>Кнопка действия</span>
              <input
                type="text"
                value={form.sourceButton}
                onChange={(event) => updateField('sourceButton', event.target.value)}
                placeholder="Подробнее:/tournaments/custom/details/2"
                maxLength={500}
              />
              <small>
                Формат: название:ссылка. Например: Подробнее:/services
              </small>
            </label>

            <div className="admin-notify__row">
              <label className="admin-notify__field">
                <span>Начало показа</span>
                <input
                  type="datetime-local"
                  value={form.startsAtUtc}
                  onChange={(event) => updateField('startsAtUtc', event.target.value)}
                />
                <small>Можно оставить пустым.</small>
              </label>

              <label className="admin-notify__field">
                <span>Конец показа</span>
                <input
                  type="datetime-local"
                  value={form.endsAtUtc}
                  onChange={(event) => updateField('endsAtUtc', event.target.value)}
                />
                <small>Можно оставить пустым.</small>
              </label>
            </div>

            <label className="admin-notify__field">
              <span>Порядок сортировки</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) => updateField('sortOrder', event.target.value)}
                placeholder="0"
              />
              <small>
                Чем больше число, тем выше приоритет уведомления.
              </small>
            </label>

            <label className="admin-notify__checkbox">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => updateField('isPublished', event.target.checked)}
              />
              <span>Опубликовать сразу</span>
            </label>

            <div className="admin-notify__preview">
              <div className="admin-notify__preview-label">
                Предпросмотр
              </div>

              <h3>{form.message || 'Название уведомления'}</h3>

              <p>
                {form.description || 'Описание уведомления будет отображаться здесь.'}
              </p>

              {buttonPreview && (
                <span className="admin-notify__preview-btn">
                  {buttonPreview.label} → {buttonPreview.url}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="admin-notify__submit"
              disabled={creating}
            >
              {creating ? 'Создаём...' : 'Создать уведомление'}
            </button>
          </form>

          <aside className="admin-notify__side">
            <section className="admin-notify__active">
              <div className="admin-notify__section-head">
                <h2>Активное уведомление</h2>
              </div>

              {loading ? (
                <p className="admin-notify__empty">
                  Загружаем...
                </p>
              ) : active ? (
                <article className="admin-notify__active-card">
                  <div className="admin-notify__active-top">
                    <span>Активно</span>
                    <time>{active.createdAt}</time>
                  </div>

                  <h3>{active.message}</h3>
                  <p>{active.description}</p>

                  {activeSourceButton && (
                    <div className="admin-notify__src">
                      Кнопка: {activeSourceButton}
                    </div>
                  )}

                  <div className="admin-notify__meta">
                    <span>SortOrder: {active.sortOrder}</span>
                    <span>{active.isPublished ? 'Опубликовано' : 'Черновик'}</span>
                  </div>
                </article>
              ) : (
                <p className="admin-notify__empty">
                  Активного уведомления пока нет.
                </p>
              )}
            </section>

            <section className="admin-notify__history">
              <div className="admin-notify__section-head">
                <h2>История</h2>
                <span>{items.length}</span>
              </div>

              {loading ? (
                <p className="admin-notify__empty">
                  Загружаем историю...
                </p>
              ) : items.length > 0 ? (
                <div className="admin-notify__list">
                  {items.map((item) => {
                    const sourceButton = getSourceButton(item);

                    return (
                      <article
                        key={item.id}
                        className={`admin-notify__item${item.isActive ? ' admin-notify__item--active' : ''}`}
                      >
                        <div className="admin-notify__item-top">
                          <span>
                            {item.isActive ? 'Активное' : item.isPublished ? 'Опубликовано' : 'Черновик'}
                          </span>
                          <time>{item.createdAt}</time>
                        </div>

                        <h3>{item.message}</h3>
                        <p>{item.description}</p>

                        {sourceButton && (
                          <div className="admin-notify__src">
                            {sourceButton}
                          </div>
                        )}

                        <div className="admin-notify__meta">
                          <span>SortOrder: {item.sortOrder}</span>

                          {item.startsAtUtc && (
                            <span>Начало: {new Date(item.startsAtUtc).toLocaleString()}</span>
                          )}

                          {item.endsAtUtc && (
                            <span>Конец: {new Date(item.endsAtUtc).toLocaleString()}</span>
                          )}
                        </div>

                        <div className="admin-notify__item-actions">
                          <button
                            type="button"
                            className="admin-notify__small-btn"
                            onClick={() => handleTogglePublished(item)}
                            disabled={updatingId === item.id}
                          >
                            {item.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                          </button>

                          <button
                            type="button"
                            className="admin-notify__small-btn admin-notify__small-btn--danger"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                          >
                            Удалить
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="admin-notify__empty">
                  Уведомлений пока нет.
                </p>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default AdminNotification;