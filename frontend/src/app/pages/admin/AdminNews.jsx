// import React, { useState, useEffect } from 'react';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { newsStore } from '../../admin/adminStore';
// import { CATEGORY_COLORS } from '../../data/newsData';

// // ─── Список новостей ──────────────────────────────────────────────

// export function AdminNewsList() {
//   const [list, setList] = useState(() => newsStore.getAll());

//   const handleDelete = (id) => {
//     if (!window.confirm('Удалить новость?')) return;
//     newsStore.remove(id);
//     setList(newsStore.getAll());
//   };

//   const handleReset = () => {
//     if (!window.confirm('Сбросить все новости к начальным данным?')) return;
//     newsStore.reset();
//     setList(newsStore.getAll());
//   };

//   const sorted = [...list].sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));

//   return (
//     <div className="adm-wrapper">
//       <div className="adm-container">

//         <div className="adm-page__header">
//           <div className="adm-page__header-left">
//             <Link to="/secure/helmet/admin" className="adm-back">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
//               </svg>
//               Назад
//             </Link>
//             <h1 className="adm-page__title">Новости</h1>
//             <span className="adm-page__count">{list.length}</span>
//           </div>
//           <div className="adm-page__header-right">
//             <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleReset}>Сбросить</button>
//             <Link to="/secure/helmet/admin/news/new" className="adm-btn adm-btn--primary">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
//               </svg>
//               Создать
//             </Link>
//           </div>
//         </div>

//         <div className="adm-list">
//           {sorted.map((item) => {
//             const cat = CATEGORY_COLORS[item.category] ?? {};
//             return (
//               <div key={item.id} className="adm-list-item">
//                 {/* Превью */}
//                 <div className="adm-list-item__thumb">
//                   {item.image
//                     ? <img src={item.image} alt={item.title} />
//                     : <div className="adm-list-item__gradient" style={{ background: item.gradient }} />
//                   }
//                 </div>

//                 <div className="adm-list-item__body">
//                   <div className="adm-list-item__meta">
//                     <span className="adm-badge">{item.category}</span>
//                     <time className="adm-list-item__date">{item.date}</time>
//                   </div>
//                   <h3 className="adm-list-item__title">{item.title}</h3>
//                   <p className="adm-list-item__excerpt">{item.excerpt}</p>
//                 </div>

//                 <div className="adm-list-item__actions">
//                   <Link to={`/secure/helmet/admin/news/${item.id}`} className="adm-btn adm-btn--ghost adm-btn--sm">
//                     Изменить
//                   </Link>
//                   <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(item.id)}>
//                     Удалить
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Пустая форма ─────────────────────────────────────────────────

// const EMPTY_NEWS = {
//   title: '',
//   excerpt: '',
//   category: 'Платформа',
//   date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
//   dateISO: new Date().toISOString().split('T')[0],
//   image: '',
//   gradient: 'linear-gradient(135deg, #1a0540, #582BBA)',
//   content: '',
// };

// const CATEGORIES = ['Платформа', 'Гайд', 'Обновление', 'Событие', 'Турнир', 'Клан'];

// // ─── Форма редактирования ─────────────────────────────────────────

// export function AdminNewsEdit() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isNew = id === 'new';

//   const [form, setForm] = useState(() =>
//     isNew ? { ...EMPTY_NEWS } : (newsStore.getById(id) ?? { ...EMPTY_NEWS })
//   );
//   const [saved, setSaved] = useState(false);

//   const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

//   const handleSave = () => {
//     if (!form.title.trim()) { alert('Введите заголовок'); return; }
//     if (isNew) {
//       newsStore.create(form);
//     } else {
//       newsStore.update(id, form);
//     }
//     setSaved(true);
//     setTimeout(() => { setSaved(false); navigate('/secure/helmet/admin/news'); }, 800);
//   };

//   return (
//     <div className="adm-wrapper">
//       <div className="adm-container adm-container--narrow">

//         <div className="adm-page__header">
//           <div className="adm-page__header-left">
//             <Link to="/secure/helmet/admin/news" className="adm-back">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
//               </svg>
//               Новости
//             </Link>
//             <h1 className="adm-page__title">{isNew ? 'Новая новость' : 'Редактировать'}</h1>
//           </div>
//           <div className="adm-page__header-right">
//             <button className="adm-btn adm-btn--primary" onClick={handleSave}>
//               {saved ? '✓ Сохранено' : 'Сохранить'}
//             </button>
//           </div>
//         </div>

//         <div className="adm-form">
//           <div className="adm-form__row adm-form__row--2">
//             <div className="adm-field">
//               <label className="adm-label">Заголовок *</label>
//               <input className="adm-input" value={form.title}
//                 onChange={(e) => set('title', e.target.value)} placeholder="Заголовок новости" />
//             </div>
//             <div className="adm-field">
//               <label className="adm-label">Категория</label>
//               <select className="adm-input adm-select" value={form.category}
//                 onChange={(e) => set('category', e.target.value)}>
//                 {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//           </div>

//           <div className="adm-form__row adm-form__row--2">
//             <div className="adm-field">
//               <label className="adm-label">Дата (отображаемая)</label>
//               <input className="adm-input" value={form.date}
//                 onChange={(e) => set('date', e.target.value)} placeholder="1 января 2025" />
//             </div>
//             <div className="adm-field">
//               <label className="adm-label">Дата ISO</label>
//               <input className="adm-input" type="date" value={form.dateISO}
//                 onChange={(e) => set('dateISO', e.target.value)} />
//             </div>
//           </div>

//           <div className="adm-field">
//             <label className="adm-label">Краткое описание</label>
//             <textarea className="adm-input adm-textarea adm-textarea--sm" value={form.excerpt}
//               onChange={(e) => set('excerpt', e.target.value)}
//               placeholder="Краткое описание для карточки..." rows={2} />
//           </div>

//           <div className="adm-form__row adm-form__row--2">
//             <div className="adm-field">
//               <label className="adm-label">URL изображения</label>
//               <input className="adm-input" value={form.image}
//                 onChange={(e) => set('image', e.target.value)}
//                 placeholder="https://... или /images/..." />
//             </div>
//             <div className="adm-field">
//               <label className="adm-label">Градиент (если нет фото)</label>
//               <input className="adm-input" value={form.gradient}
//                 onChange={(e) => set('gradient', e.target.value)}
//                 placeholder="linear-gradient(...)" />
//             </div>
//           </div>

//           {form.image && (
//             <div className="adm-preview-img">
//               <img src={form.image} alt="preview" />
//             </div>
//           )}

//           <div className="adm-field">
//             <label className="adm-label">
//               Контент <span className="adm-label__hint">(Markdown)</span>
//             </label>
//             <div className="adm-md-hint">
//               Поддерживаемые теги: <code>#h</code> заголовок, <code>**текст**</code> жирный,
//               <code>*текст*</code> курсив, <code>[highlight]текст[/highlight]</code>,
//               <code>[link](url)</code>, <code>![img](alt)</code>, <code>?[вопрос](ответ)</code> FAQ
//             </div>
//             <textarea className="adm-input adm-textarea adm-textarea--md adm-textarea--code"
//               value={form.content}
//               onChange={(e) => set('content', e.target.value)}
//               placeholder="#h Заголовок статьи&#10;&#10;Текст статьи..." rows={20} />
//           </div>

//           <div className="adm-form__footer">
//             <Link to="/secure/helmet/admin/news" className="adm-btn adm-btn--ghost">Отмена</Link>
//             <button className="adm-btn adm-btn--primary" onClick={handleSave}>
//               {saved ? '✓ Сохранено' : 'Сохранить'}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }