import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminHomeBanners,
  createAdminHomeBanner,
  updateAdminHomeBanner,
  setAdminHomeBannerPublished,
  deleteAdminHomeBanner,
} from '../../../api/endpoints';
import { logger } from '../../utils/logger';

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)';

const EMPTY_FORM = {
  slot: 1,
  title: '',
  description: '',
  buttonLabel: 'Подробнее',
  buttonUrl: '/services',
  imageUrl: '',
  gradient: DEFAULT_GRADIENT,
  isPublished: true,
};

function getSlotLabel(slot) {
  return Number(slot) === 1 ? 'Первый баннер' : 'Второй баннер';
}

function getBannersBySlot(items, slot) {
  return items.filter((item) => Number(item.slot) === Number(slot));
}

function AdminBanners() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const isEditing = editingId != null;

  const slot1Banners = useMemo(() => getBannersBySlot(items, 1), [items]);
  const slot2Banners = useMemo(() => getBannersBySlot(items, 2), [items]);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminHomeBanners();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      logger.warn('AdminBanners: не удалось загрузить баннеры', err);
      setItems([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = (slot = selectedSlot) => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      slot,
    });
    setError(null);
    setMessage(null);
  };

  const startCreateForSlot = (slot) => {
    setSelectedSlot(slot);
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      slot,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (banner) => {
    setSelectedSlot(banner.slot);
    setEditingId(banner.id);

    setForm({
      slot: banner.slot,
      title: banner.title ?? '',
      description: banner.description ?? '',
      buttonLabel: banner.buttonLabel ?? '',
      buttonUrl: banner.buttonUrl ?? '',
      imageUrl: banner.imageUrl ?? '',
      gradient: banner.gradient ?? '',
      isPublished: Boolean(banner.isPublished),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = () => ({
    slot: Number(form.slot),
    title: form.title.trim(),
    description: form.description.trim(),
    buttonLabel: form.buttonLabel.trim() || null,
    buttonUrl: form.buttonUrl.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    gradient: form.gradient.trim() || null,
    isPublished: form.isPublished,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!form.title.trim()) {
      setError({ message: 'Введите название баннера' });
      return;
    }

    if (!form.description.trim()) {
      setError({ message: 'Введите описание баннера' });
      return;
    }

    const slot = Number(form.slot);

    if (![1, 2].includes(slot)) {
      setError({ message: 'Позиция баннера может быть только 1 или 2' });
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      const result = isEditing
        ? await updateAdminHomeBanner(editingId, payload)
        : await createAdminHomeBanner(payload);

      setMessage(result?.message || (isEditing ? 'Баннер обновлён' : 'Баннер создан'));

      resetForm(slot);

      await loadBanners();
    } catch (err) {
      logger.warn('AdminBanners: не удалось сохранить баннер', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (banner) => {
    setActionId(banner.id);
    setError(null);
    setMessage(null);

    try {
      const nextValue = !banner.isPublished;
      const result = await setAdminHomeBannerPublished(banner.id, nextValue);

      setMessage(result?.message || 'Статус публикации обновлён');

      await loadBanners();
    } catch (err) {
      logger.warn('AdminBanners: не удалось изменить публикацию баннера', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(`Удалить баннер «${banner.title}»?`);

    if (!confirmed) return;

    setActionId(banner.id);
    setError(null);
    setMessage(null);

    try {
      const result = await deleteAdminHomeBanner(banner.id);

      if (editingId === banner.id) {
        resetForm(banner.slot);
      }

      setMessage(result?.message || 'Баннер удалён');

      await loadBanners();
    } catch (err) {
      logger.warn('AdminBanners: не удалось удалить баннер', err);
      setError(err);
    } finally {
      setActionId(null);
    }
  };

  const selectedSlotBanners = getBannersBySlot(items, Number(form.slot));

  return (
    <main className="wrapper admin-banners">
      <div className="admin-banners__container">
        <header className="admin-banners__header">
          <div>
            <div className="admin-banners__label">
              Админ-панель
            </div>

            <h1 className="admin-banners__title">
              Баннеры главной страницы
            </h1>

            <p className="admin-banners__subtitle">
              Управляйте двумя рекламными баннерами на главной странице. Если позиция пустая или баннер снят с публикации, пользователю будет показана стандартная заглушка.
            </p>
          </div>

          <Link to="/admin" className="admin-banners__back">
            Назад в админку
          </Link>
        </header>

        {message && (
          <div className="admin-banners__message admin-banners__message--success">
            {message}
          </div>
        )}

        {error && (
          <div className="admin-banners__message admin-banners__message--error">
            {error?.data?.message || error?.message || 'Произошла ошибка'}
          </div>
        )}

        <section className="admin-banners__slots">
          <BannerSlotCard
            slot={1}
            banners={slot1Banners}
            loading={loading}
            actionId={actionId}
            onCreate={startCreateForSlot}
            onEdit={startEdit}
            onToggle={handleTogglePublished}
            onDelete={handleDelete}
          />

          <BannerSlotCard
            slot={2}
            banners={slot2Banners}
            loading={loading}
            actionId={actionId}
            onCreate={startCreateForSlot}
            onEdit={startEdit}
            onToggle={handleTogglePublished}
            onDelete={handleDelete}
          />
        </section>

        <section className="admin-banners__layout">
          <form className="admin-banners__form" onSubmit={handleSubmit}>
            <div className="admin-banners__form-head">
              <div>
                <h2>{isEditing ? 'Редактирование баннера' : 'Новый баннер'}</h2>
                <p>
                  Выберите позицию баннера и заполните данные. На главной странице показываются только опубликованные баннеры.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  className="admin-banners__small-btn"
                  onClick={() => resetForm(form.slot)}
                >
                  Отмена
                </button>
              )}
            </div>

            <div className="admin-banners__row">
              <label className="admin-banners__field">
                <span>Позиция</span>

                <select
                  value={form.slot}
                  onChange={(event) => {
                    const nextSlot = Number(event.target.value);
                    setSelectedSlot(nextSlot);
                    updateField('slot', nextSlot);
                  }}
                  disabled={isEditing}
                >
                  <option value={1}>Первый баннер</option>
                  <option value={2}>Второй баннер</option>
                </select>

                {!isEditing && (
                  <small>
                    В выбранной позиции сейчас баннеров: {selectedSlotBanners.length}. Новый баннер добавится в этот же слайдер.
                  </small>
                )}
              </label>

              <label className="admin-banners__checkbox">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => updateField('isPublished', event.target.checked)}
                />
                <span>Опубликовать</span>
              </label>
            </div>

            <label className="admin-banners__field">
              <span>Название</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Например: Новый турнир уже открыт"
                maxLength={200}
              />
            </label>

            <label className="admin-banners__field">
              <span>Описание</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Краткое описание баннера"
                rows={5}
                maxLength={1000}
              />
            </label>

            <div className="admin-banners__row">
              <label className="admin-banners__field">
                <span>Текст кнопки</span>
                <input
                  type="text"
                  value={form.buttonLabel}
                  onChange={(event) => updateField('buttonLabel', event.target.value)}
                  placeholder="Сервисы"
                  maxLength={100}
                />
              </label>

              <label className="admin-banners__field">
                <span>Ссылка кнопки</span>
                <input
                  type="text"
                  value={form.buttonUrl}
                  onChange={(event) => updateField('buttonUrl', event.target.value)}
                  placeholder="/services"
                  maxLength={500}
                />
              </label>
            </div>

            <label className="admin-banners__field">
              <span>Картинка</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="/images/banners/banner.webp"
                maxLength={500}
              />
              <small>Если картинка указана, фон баннера будет изображением.</small>
            </label>

            <label className="admin-banners__field">
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

            <button
              type="submit"
              className="admin-banners__submit"
              disabled={saving}
            >
              {saving
                ? 'Сохраняем...'
                : isEditing
                  ? 'Сохранить изменения'
                  : 'Создать баннер'}
            </button>
          </form>

          <aside className="admin-banners__preview-wrap">
            <div className="admin-banners__section-head">
              <h2>Предпросмотр</h2>
              <span>{getSlotLabel(form.slot)}</span>
            </div>

            <div className="admin-banners__preview">
              <div
                className="admin-banners__preview-bg"
                style={
                  form.imageUrl
                    ? {
                      backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.2)), url(${form.imageUrl})`,
                    }
                    : {
                      background: form.gradient || DEFAULT_GRADIENT,
                    }
                }
              />

              <div className="admin-banners__preview-content">
                <span className="admin-banners__preview-badge">
                  {form.isPublished ? 'Опубликован' : 'Черновик'}
                </span>

                <h3>{form.title || 'Название баннера'}</h3>

                <p>
                  {form.description || 'Описание баннера будет отображаться здесь.'}
                </p>

                {form.buttonLabel && (
                  <span className="admin-banners__preview-btn">
                    {form.buttonLabel}
                  </span>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function BannerSlotCard({
  slot,
  banners = [],
  loading,
  actionId,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}) {
  const hasBanners = banners.length > 0;

  return (
    <article className={`admin-banners__slot${hasBanners ? '' : ' admin-banners__slot--empty'}`}>
      <div className="admin-banners__slot-head">
        <div>
          <span>Slot {slot}</span>
          <h2>{getSlotLabel(slot)}</h2>
        </div>

        <strong className="admin-banners__status">
          {banners.length} шт.
        </strong>
      </div>

      {loading ? (
        <p className="admin-banners__empty">
          Загружаем...
        </p>
      ) : hasBanners ? (
        <>
          <div className="admin-banners__slot-list">
            {banners.map((banner) => (
              <div key={banner.id} className="admin-banners__slot-item">
                <div className="admin-banners__slot-preview">
                  <div
                    className="admin-banners__slot-bg"
                    style={
                      banner.imageUrl
                        ? {
                          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.45), rgba(0,0,0,0.2)), url(${banner.imageUrl})`,
                        }
                        : {
                          background: banner.gradient || DEFAULT_GRADIENT,
                        }
                    }
                  />

                  <div className="admin-banners__slot-content">
                    <div className="admin-banners__slot-topline">
                      <strong className={banner.isPublished ? 'admin-banners__status' : 'admin-banners__status admin-banners__status--draft'}>
                        {banner.isPublished ? 'Опубликован' : 'Черновик'}
                      </strong>
                    </div>

                    <h3>{banner.title}</h3>

                    <p>{banner.description}</p>

                    <div className="admin-banners__slot-meta">
                      <span>ID: {banner.id}</span>
                      <span>{banner.slotLabel}</span>
                      {banner.buttonLabel && <span>Кнопка: {banner.buttonLabel}</span>}
                    </div>
                  </div>
                </div>

                <div className="admin-banners__slot-actions">
                  <button
                    type="button"
                    className="admin-banners__small-btn"
                    onClick={() => onEdit(banner)}
                  >
                    Изменить
                  </button>

                  <button
                    type="button"
                    className="admin-banners__small-btn"
                    onClick={() => onToggle(banner)}
                    disabled={actionId === banner.id}
                  >
                    {banner.isPublished ? 'Снять' : 'Опубликовать'}
                  </button>

                  <button
                    type="button"
                    className="admin-banners__small-btn admin-banners__small-btn--danger"
                    onClick={() => onDelete(banner)}
                    disabled={actionId === banner.id}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="admin-banners__create-btn"
            onClick={() => onCreate(slot)}
          >
            Добавить ещё баннер
          </button>
        </>
      ) : (
        <>
          <p className="admin-banners__empty">
            В этой позиции пока нет баннеров. На главной странице будет показана стандартная заглушка.
          </p>

          <button
            type="button"
            className="admin-banners__create-btn"
            onClick={() => onCreate(slot)}
          >
            Создать баннер
          </button>
        </>
      )}
    </article>
  );
}

export default AdminBanners;