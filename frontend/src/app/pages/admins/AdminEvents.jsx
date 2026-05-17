import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  setAdminEventPublished,
  deleteAdminEvent,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const EMPTY_FORM = {
  title: '',
  category: 'Турнир',
  status: 'soon',
  dateStart: new Date().toISOString().slice(0, 10),
  dateEnd: '',
  imageUrl: '',
  gradient: 'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)',
  excerpt: '',
  content: '',
  isPublished: true,
};

const EVENT_STATUSES = [
  { value: 'soon', label: 'Скоро' },
  { value: 'active', label: 'Активно' },
  { value: 'ended', label: 'Завершено' },
];

function getStatusLabel(status) {
  return EVENT_STATUSES.find((item) => item.value === status)?.label || status;
}

function AdminEvents() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const isEditing = editingId != null;

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminEvents();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminEvents: не удалось загрузить события', err);
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title?.toLowerCase().includes(normalizedSearch) ||
        item.category?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      const matchesPublish =
        publishFilter === 'all' ||
        (publishFilter === 'published' && item.isPublished) ||
        (publishFilter === 'drafts' && !item.isPublished);

      return matchesSearch && matchesStatus && matchesPublish;
    });
  }, [items, search, statusFilter, publishFilter]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setMessage(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title ?? '',
      category: item.category ?? 'Турнир',
      status: item.status ?? 'soon',
      dateStart: item.dateStartISO ?? new Date().toISOString().slice(0, 10),
      dateEnd: item.dateEndISO ?? '',
      imageUrl: item.imageUrl ?? '',
      gradient: item.gradient ?? '',
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      isPublished: Boolean(item.isPublished),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category.trim(),
    status: form.status,
    dateStart: form.dateStart,
    dateEnd: form.dateEnd || null,
    imageUrl: form.imageUrl.trim() || null,
    gradient: form.gradient.trim() || null,
    excerpt: form.excerpt.trim() || null,
    content: form.content.trim() || null,
    isPublished: form.isPublished,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!form.title.trim()) {
      setError({ message: 'Введите название события' });
      return;
    }

    if (!form.category.trim()) {
      setError({ message: 'Введите категорию события' });
      return;
    }

    if (!form.status.trim()) {
      setError({ message: 'Выберите статус события' });
      return;
    }

    if (!form.dateStart) {
      setError({ message: 'Выберите дату начала события' });
      return;
    }

    if (form.dateEnd && new Date(form.dateEnd) < new Date(form.dateStart)) {
      setError({ message: 'Дата окончания не может быть раньше даты начала' });
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      const result = isEditing
        ? await updateAdminEvent(editingId, payload)
        : await createAdminEvent(payload);

      setMessage(result?.message || (isEditing ? 'Событие обновлено' : 'Событие создано'));
      setForm(EMPTY_FORM);
      setEditingId(null);

      await loadEvents();
    } catch (err) {
      logger.warn('AdminEvents: не удалось сохранить событие', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (item) => {
    setActionId(item.id);
    setError(null);
    setMessage(null);

    try {
      const nextValue = !item.isPublished;
      const result = await setAdminEventPublished(item.id, nextValue);

      setMessage(result?.message || 'Статус публикации обновлён');
      await loadEvents();
    } catch (err) {
      logger.warn('AdminEvents: не удалось изменить публикацию', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Удалить событие «${item.title}»?`);

    if (!confirmed) return;

    setActionId(item.id);
    setError(null);
    setMessage(null);

    try {
      const result = await deleteAdminEvent(item.id);

      if (editingId === item.id) {
        resetForm();
      }

      setMessage(result?.message || 'Событие удалено');
      await loadEvents();
    } catch (err) {
      logger.warn('AdminEvents: не удалось удалить событие', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="wrapper admin-events">
      <div className="admin-events__container">
        <header className="admin-events__header">
          <div>
            <div className="admin-events__label">
              Админ-панель
            </div>

            <h1 className="admin-events__title">
              Управление событиями
            </h1>

            <p className="admin-events__subtitle">
              Создавайте, редактируйте, публикуйте и удаляйте события платформы CosmoManager.
            </p>
          </div>

          <Link to="/admin" className="admin-events__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-events__message admin-events__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-events__message admin-events__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-events__layout">
          <form className="admin-events__form" onSubmit={handleSubmit}>
            <div className="admin-events__form-head">
              <div>
                <h2>{isEditing ? 'Редактирование события' : 'Новое событие'}</h2>
                <p>
                  На публичной странице отображаются только опубликованные события.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="admin-events__small-btn"
                  onClick={resetForm}
                >
                  Отмена
                </button>
              )}
            </div>

            <label className="admin-events__field">
              <span>Название</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Название события"
                maxLength={200}
              />
            </label>

            <div className="admin-events__row">
              <label className="admin-events__field">
                <span>Категория</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Турнир"
                  maxLength={50}
                />
              </label>

              <label className="admin-events__field">
                <span>Статус</span>
                <select
                  value={form.status}
                  onChange={(event) => updateField('status', event.target.value)}
                >
                  {EVENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-events__row">
              <label className="admin-events__field">
                <span>Дата начала</span>
                <input
                  type="date"
                  value={form.dateStart}
                  onChange={(event) => updateField('dateStart', event.target.value)}
                />
              </label>

              <label className="admin-events__field">
                <span>Дата окончания</span>
                <input
                  type="date"
                  value={form.dateEnd}
                  onChange={(event) => updateField('dateEnd', event.target.value)}
                />
              </label>
            </div>

            <label className="admin-events__field">
              <span>Картинка</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="/images/events/example.webp"
                maxLength={500}
              />
              <small>Если картинка указана, frontend сможет показать изображение.</small>
            </label>

            <label className="admin-events__field">
              <span>Градиент</span>
              <input
                type="text"
                value={form.gradient}
                onChange={(event) => updateField('gradient', event.target.value)}
                placeholder="linear-gradient(135deg, #1a0540 0%, #582BBA 100%)"
                maxLength={500}
              />
              <small>Используется, если картинка не указана.</small>
            </label>

            <label className="admin-events__field">
              <span>Краткое описание</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => updateField('excerpt', event.target.value)}
                placeholder="Краткий текст для карточки события"
                rows={4}
                maxLength={1000}
              />
            </label>

            <label className="admin-events__field">
              <span>Контент</span>
              <textarea
                value={form.content}
                onChange={(event) => updateField('content', event.target.value)}
                placeholder="Основной текст события."
                rows={12}
              />
            </label>

            <label className="admin-events__checkbox">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => updateField('isPublished', event.target.checked)}
              />
              <span>Опубликовать</span>
            </label>

            <div className="admin-events__preview">
              <div className="admin-events__preview-media">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" />
                ) : (
                  <div
                    className="admin-events__preview-gradient"
                    style={{ background: form.gradient || '#111111' }}
                  />
                )}
              </div>

              <div className="admin-events__preview-body">
                <div className="admin-events__preview-tags">
                  <span>{form.category || 'Категория'}</span>
                  <span>{getStatusLabel(form.status)}</span>
                </div>

                <h3>{form.title || 'Название события'}</h3>

                <p>{form.excerpt || 'Краткое описание события будет отображаться здесь.'}</p>
              </div>
            </div>

            <button
              type="submit"
              className="admin-events__submit"
              disabled={saving}
            >
              {saving
                ? 'Сохраняем...'
                : isEditing
                  ? 'Сохранить изменения'
                  : 'Создать событие'}
            </button>
          </form>

          <aside className="admin-events__side">
            <section className="admin-events__tools">
              <div className="admin-events__section-head">
                <h2>Список событий</h2>
                <span>{filteredItems.length}</span>
              </div>

              <label className="admin-events__field">
                <span>Поиск</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по названию или категории"
                />
              </label>

              <div className="admin-events__filters">
                <button
                  type="button"
                  className={publishFilter === 'all' ? 'admin-events__filter admin-events__filter--active' : 'admin-events__filter'}
                  onClick={() => setPublishFilter('all')}
                >
                  Все
                </button>

                <button
                  type="button"
                  className={publishFilter === 'published' ? 'admin-events__filter admin-events__filter--active' : 'admin-events__filter'}
                  onClick={() => setPublishFilter('published')}
                >
                  Опубликованные
                </button>

                <button
                  type="button"
                  className={publishFilter === 'drafts' ? 'admin-events__filter admin-events__filter--active' : 'admin-events__filter'}
                  onClick={() => setPublishFilter('drafts')}
                >
                  Черновики
                </button>
              </div>

              <div className="admin-events__filters">
                <button
                  type="button"
                  className={statusFilter === 'all' ? 'admin-events__filter admin-events__filter--active' : 'admin-events__filter'}
                  onClick={() => setStatusFilter('all')}
                >
                  Все статусы
                </button>

                {EVENT_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    className={statusFilter === status.value ? 'admin-events__filter admin-events__filter--active' : 'admin-events__filter'}
                    onClick={() => setStatusFilter(status.value)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="admin-events__list-wrap">
              {loading ? (
                <p className="admin-events__empty">Загружаем события...</p>
              ) : filteredItems.length > 0 ? (
                <div className="admin-events__list">
                  {filteredItems.map((item) => (
                    <article
                      key={item.id}
                      className={`admin-events__item${editingId === item.id ? ' admin-events__item--editing' : ''}`}
                    >
                      <div className="admin-events__item-top">
                        <span>{item.isPublished ? 'Опубликовано' : 'Черновик'}</span>
                        <time>{item.dateStart} — {item.dateEnd}</time>
                      </div>

                      <h3>{item.title}</h3>
                      <p>{item.excerpt || 'Без краткого описания'}</p>

                      <div className="admin-events__item-meta">
                        <span>{item.category}</span>
                        <span>{getStatusLabel(item.status)}</span>
                        <span>ID: {item.id}</span>
                      </div>

                      <div className="admin-events__item-actions">
                        <button
                          type="button"
                          className="admin-events__small-btn"
                          onClick={() => startEdit(item)}
                        >
                          Изменить
                        </button>

                        <button
                          type="button"
                          className="admin-events__small-btn"
                          onClick={() => handleTogglePublished(item)}
                          disabled={actionId === item.id}
                        >
                          {item.isPublished ? 'Снять' : 'Опубликовать'}
                        </button>

                        <button
                          type="button"
                          className="admin-events__small-btn admin-events__small-btn--danger"
                          onClick={() => handleDelete(item)}
                          disabled={actionId === item.id}
                        >
                          Удалить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-events__empty">
                  Событий пока нет.
                </p>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default AdminEvents;