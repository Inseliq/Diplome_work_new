import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminNews,
  createAdminNews,
  updateAdminNews,
  setAdminNewsPublished,
  deleteAdminNews,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const EMPTY_FORM = {
  title: '',
  category: 'Платформа',
  dateStart: new Date().toISOString().slice(0, 10),
  imageUrl: '',
  gradient: 'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)',
  excerpt: '',
  content: '',
  isPublished: true,
};

function AdminNews() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const isEditing = editingId != null;

  const loadNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminNews();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminNews: не удалось загрузить новости', err);
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
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
        (statusFilter === 'published' && item.isPublished) ||
        (statusFilter === 'drafts' && !item.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

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
      category: item.category ?? 'Платформа',
      dateStart: item.dateISO ?? new Date().toISOString().slice(0, 10),
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
    dateStart: form.dateStart,
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
      setError({ message: 'Введите название новости' });
      return;
    }

    if (!form.category.trim()) {
      setError({ message: 'Введите категорию новости' });
      return;
    }

    if (!form.dateStart) {
      setError({ message: 'Выберите дату новости' });
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      const result = isEditing
        ? await updateAdminNews(editingId, payload)
        : await createAdminNews(payload);

      setMessage(result?.message || (isEditing ? 'Новость обновлена' : 'Новость создана'));
      setForm(EMPTY_FORM);
      setEditingId(null);

      await loadNews();
    } catch (err) {
      logger.warn('AdminNews: не удалось сохранить новость', err);
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
      const result = await setAdminNewsPublished(item.id, nextValue);

      setMessage(result?.message || 'Статус публикации обновлён');
      await loadNews();
    } catch (err) {
      logger.warn('AdminNews: не удалось изменить публикацию', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Удалить новость «${item.title}»?`);

    if (!confirmed) return;

    setActionId(item.id);
    setError(null);
    setMessage(null);

    try {
      const result = await deleteAdminNews(item.id);

      if (editingId === item.id) {
        resetForm();
      }

      setMessage(result?.message || 'Новость удалена');
      await loadNews();
    } catch (err) {
      logger.warn('AdminNews: не удалось удалить новость', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="wrapper admin-news">
      <div className="admin-news__container">
        <header className="admin-news__header">
          <div>
            <div className="admin-news__label">
              Админ-панель
            </div>

            <h1 className="admin-news__title">
              Управление новостями
            </h1>

            <p className="admin-news__subtitle">
              Создавайте, редактируйте, публикуйте и удаляйте новости платформы CosmoManager.
            </p>
          </div>

          <Link to="/admin" className="admin-news__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-news__message admin-news__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-news__message admin-news__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-news__layout">
          <form className="admin-news__form" onSubmit={handleSubmit}>
            <div className="admin-news__form-head">
              <div>
                <h2>{isEditing ? 'Редактирование новости' : 'Новая новость'}</h2>
                <p>
                  Заполните данные новости. На публичной странице отображаются только опубликованные записи.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="admin-news__small-btn"
                  onClick={resetForm}
                >
                  Отмена
                </button>
              )}
            </div>

            <label className="admin-news__field">
              <span>Название</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Название новости"
                maxLength={200}
              />
            </label>

            <div className="admin-news__row">
              <label className="admin-news__field">
                <span>Категория</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Платформа"
                  maxLength={50}
                />
              </label>

              <label className="admin-news__field">
                <span>Дата</span>
                <input
                  type="date"
                  value={form.dateStart}
                  onChange={(event) => updateField('dateStart', event.target.value)}
                />
              </label>
            </div>

            <label className="admin-news__field">
              <span>Картинка</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="/images/news/example.webp"
                maxLength={500}
              />
              <small>Если картинка указана, frontend сможет показать изображение.</small>
            </label>

            <label className="admin-news__field">
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

            <label className="admin-news__field">
              <span>Краткое описание</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => updateField('excerpt', event.target.value)}
                placeholder="Краткий текст для карточки новости"
                rows={4}
                maxLength={1000}
              />
            </label>

            <label className="admin-news__field">
              <span>Контент</span>
              <textarea
                value={form.content}
                onChange={(event) => updateField('content', event.target.value)}
                placeholder="Основной текст новости. Можно использовать разметку, которую поддерживает parseMarkup."
                rows={12}
              />
            </label>

            <label className="admin-news__checkbox">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => updateField('isPublished', event.target.checked)}
              />
              <span>Опубликовать</span>
            </label>

            <div className="admin-news__preview">
              <div className="admin-news__preview-media">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" />
                ) : (
                  <div
                    className="admin-news__preview-gradient"
                    style={{ background: form.gradient || '#111111' }}
                  />
                )}
              </div>

              <div className="admin-news__preview-body">
                <span>{form.category || 'Категория'}</span>
                <h3>{form.title || 'Название новости'}</h3>
                <p>{form.excerpt || 'Краткое описание новости будет отображаться здесь.'}</p>
              </div>
            </div>

            <button
              type="submit"
              className="admin-news__submit"
              disabled={saving}
            >
              {saving
                ? 'Сохраняем...'
                : isEditing
                  ? 'Сохранить изменения'
                  : 'Создать новость'}
            </button>
          </form>

          <aside className="admin-news__side">
            <section className="admin-news__tools">
              <div className="admin-news__section-head">
                <h2>Список новостей</h2>
                <span>{filteredItems.length}</span>
              </div>

              <label className="admin-news__field">
                <span>Поиск</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по названию или категории"
                />
              </label>

              <div className="admin-news__filters">
                <button
                  type="button"
                  className={statusFilter === 'all' ? 'admin-news__filter admin-news__filter--active' : 'admin-news__filter'}
                  onClick={() => setStatusFilter('all')}
                >
                  Все
                </button>

                <button
                  type="button"
                  className={statusFilter === 'published' ? 'admin-news__filter admin-news__filter--active' : 'admin-news__filter'}
                  onClick={() => setStatusFilter('published')}
                >
                  Опубликованные
                </button>

                <button
                  type="button"
                  className={statusFilter === 'drafts' ? 'admin-news__filter admin-news__filter--active' : 'admin-news__filter'}
                  onClick={() => setStatusFilter('drafts')}
                >
                  Черновики
                </button>
              </div>
            </section>

            <section className="admin-news__list-wrap">
              {loading ? (
                <p className="admin-news__empty">Загружаем новости...</p>
              ) : filteredItems.length > 0 ? (
                <div className="admin-news__list">
                  {filteredItems.map((item) => (
                    <article
                      key={item.id}
                      className={`admin-news__item${editingId === item.id ? ' admin-news__item--editing' : ''}`}
                    >
                      <div className="admin-news__item-top">
                        <span>{item.isPublished ? 'Опубликовано' : 'Черновик'}</span>
                        <time>{item.date}</time>
                      </div>

                      <h3>{item.title}</h3>
                      <p>{item.excerpt || 'Без краткого описания'}</p>

                      <div className="admin-news__item-meta">
                        <span>{item.category}</span>
                        <span>ID: {item.id}</span>
                      </div>

                      <div className="admin-news__item-actions">
                        <button
                          type="button"
                          className="admin-news__small-btn"
                          onClick={() => startEdit(item)}
                        >
                          Изменить
                        </button>

                        <button
                          type="button"
                          className="admin-news__small-btn"
                          onClick={() => handleTogglePublished(item)}
                          disabled={actionId === item.id}
                        >
                          {item.isPublished ? 'Снять' : 'Опубликовать'}
                        </button>

                        <button
                          type="button"
                          className="admin-news__small-btn admin-news__small-btn--danger"
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
                <p className="admin-news__empty">
                  Новостей пока нет.
                </p>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default AdminNews;