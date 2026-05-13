// // ============================================================
// //  AdminServices.jsx  — управление сервисами
// // ============================================================

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { servicesStore } from '../../admin/adminStore';

// export function AdminServices() {
//   const [list, setList] = useState(() => servicesStore.getAll());
//   const [editing, setEditing] = useState(null); // id или null
//   const [form, setForm] = useState({});

//   const refresh = () => setList(servicesStore.getAll());

//   const startEdit = (s) => { setEditing(s.id); setForm({ ...s }); };
//   const cancelEdit = () => { setEditing(null); setForm({}); };

//   const saveEdit = () => {
//     if (!form.title?.trim()) { alert('Введите название'); return; }
//     servicesStore.update(editing, form);
//     refresh();
//     cancelEdit();
//   };

//   const handleDelete = (id) => {
//     if (!window.confirm('Удалить сервис?')) return;
//     servicesStore.remove(id);
//     refresh();
//   };

//   const handleAdd = () => {
//     const created = servicesStore.create({ title: 'Новый сервис', desc: '', path: '', icon: '', visible: false });
//     refresh();
//     startEdit(created);
//   };

//   const handleReset = () => {
//     if (!window.confirm('Сбросить?')) return;
//     servicesStore.reset();
//     refresh();
//   };

//   const toggleVisible = (id, val) => {
//     servicesStore.update(id, { visible: val });
//     refresh();
//   };

//   const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
//             <h1 className="adm-page__title">Сервисы</h1>
//             <span className="adm-page__count">{list.filter((s) => s.visible).length} активных</span>
//           </div>
//           <div className="adm-page__header-right">
//             <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleReset}>Сбросить</button>
//             <button className="adm-btn adm-btn--primary" onClick={handleAdd}>
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
//               </svg>
//               Добавить
//             </button>
//           </div>
//         </div>

//         <div className="adm-list">
//           {list.map((s) => (
//             <div key={s.id} className={`adm-list-item${!s.visible ? ' adm-list-item--dim' : ''}`}>
//               <div className="adm-list-item__icon-wrap">
//                 {s.icon
//                   ? <img src={s.icon} alt={s.title} className="adm-svc-icon" onError={(e) => { e.target.style.opacity = '.3'; }} />
//                   : <div className="adm-svc-icon adm-svc-icon--empty" />
//                 }
//               </div>

//               {editing === s.id ? (
//                 /* ─── Inline edit ─── */
//                 <div className="adm-list-item__body adm-list-item__body--edit">
//                   <div className="adm-form__row adm-form__row--2">
//                     <div className="adm-field">
//                       <label className="adm-label">Название</label>
//                       <input className="adm-input" value={form.title}
//                         onChange={(e) => setF('title', e.target.value)} />
//                     </div>
//                     <div className="adm-field">
//                       <label className="adm-label">Путь</label>
//                       <input className="adm-input" value={form.path}
//                         onChange={(e) => setF('path', e.target.value)} placeholder="/marks" />
//                     </div>
//                   </div>
//                   <div className="adm-field">
//                     <label className="adm-label">Описание</label>
//                     <input className="adm-input" value={form.desc}
//                       onChange={(e) => setF('desc', e.target.value)} />
//                   </div>
//                   <div className="adm-field">
//                     <label className="adm-label">Иконка (путь)</label>
//                     <input className="adm-input" value={form.icon}
//                       onChange={(e) => setF('icon', e.target.value)} placeholder="/images/services/..." />
//                   </div>
//                   <label className="adm-checkbox" style={{ marginTop: 8 }}>
//                     <input type="checkbox" checked={!!form.visible}
//                       onChange={(e) => setF('visible', e.target.checked)} />
//                     Показывать на главной
//                   </label>
//                   <div className="adm-inline-actions">
//                     <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={cancelEdit}>Отмена</button>
//                     <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={saveEdit}>Сохранить</button>
//                   </div>
//                 </div>
//               ) : (
//                 /* ─── View mode ─── */
//                 <div className="adm-list-item__body">
//                   <div className="adm-list-item__meta">
//                     <span className={`adm-badge ${s.visible ? 'adm-badge--green' : ''}`}>
//                       {s.visible ? 'Активен' : 'Скрыт'}
//                     </span>
//                     {s.path && <code className="adm-code">{s.path}</code>}
//                   </div>
//                   <h3 className="adm-list-item__title">{s.title}</h3>
//                   <p className="adm-list-item__excerpt">{s.desc}</p>
//                 </div>
//               )}

//               {editing !== s.id && (
//                 <div className="adm-list-item__actions">
//                   <button className="adm-btn adm-btn--ghost adm-btn--sm"
//                     onClick={() => toggleVisible(s.id, !s.visible)}>
//                     {s.visible ? 'Скрыть' : 'Показать'}
//                   </button>
//                   <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => startEdit(s)}>
//                     Изменить
//                   </button>
//                   <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(s.id)}>
//                     Удалить
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


// // ============================================================
// //  AdminCatalog.jsx  — управление сборками танков
// // ============================================================

// import { catalogStore } from '../../admin/adminStore';
// import { DIRECTORY_MAP, POLEVAYA_ITEMS } from '../../data/directoryData';

// export function AdminCatalog() {
//   const [list, setList] = useState(() => catalogStore.getAll());
//   const [expanded, setExpanded] = useState(null);

//   const refresh = () => setList(catalogStore.getAll());

//   const handleDelete = (id) => {
//     if (!window.confirm('Удалить сборку?')) return;
//     catalogStore.remove(id);
//     refresh();
//   };

//   const handleReset = () => {
//     if (!window.confirm('Сбросить каталог?')) return;
//     catalogStore.reset();
//     refresh();
//   };

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
//             <h1 className="adm-page__title">Каталог танков</h1>
//             <span className="adm-page__count">{list.length} сборок</span>
//           </div>
//           <div className="adm-page__header-right">
//             <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleReset}>Сбросить</button>
//             <Link to="/directory" target="_blank" className="adm-btn adm-btn--ghost adm-btn--sm">
//               Открыть каталог ↗
//             </Link>
//           </div>
//         </div>

//         <div className="adm-hint">
//           Сборки привязаны к tank_id из Poliroid API. Редактирование сборок осуществляется
//           напрямую через <code>directoryData.js</code>. Здесь можно просмотреть и удалить записи.
//         </div>

//         <div className="adm-list">
//           {list.map((entry) => (
//             <div key={entry.id} className="adm-list-item adm-list-item--catalog">
//               {/* Иконка */}
//               <div className="adm-list-item__tank-icon">
//                 <img src={entry.image} alt={`tank ${entry.id}`}
//                   onError={(e) => { e.target.style.opacity = '.15'; }} />
//               </div>

//               <div className="adm-list-item__body">
//                 <div className="adm-list-item__meta">
//                   <code className="adm-code">ID: {entry.id}</code>
//                   {entry.battles?.random && <span className="adm-badge">Рандом</span>}
//                   {entry.battles?.fortified && <span className="adm-badge">Укреп</span>}
//                   {entry.polevaya && <span className="adm-badge">Полевая</span>}
//                 </div>

//                 {/* Сборки рандом */}
//                 <div className="adm-catalog-builds">
//                   {entry.battles && Object.entries(entry.battles).map(([modeKey, states]) => (
//                     <div key={modeKey} className="adm-catalog-mode">
//                       <span className="adm-catalog-mode__label">
//                         {modeKey === 'random' ? 'Рандом' : 'Укреп'}
//                       </span>
//                       <div className="adm-catalog-states">
//                         {Object.entries(states).map(([stateKey, items]) => (
//                           <div key={stateKey} className="adm-catalog-state">
//                             <span className="adm-catalog-state__key">{stateKey}:</span>
//                             <span className="adm-catalog-state__items">{items?.join(', ')}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="adm-list-item__actions">
//                 <Link to={`/directory/${entry.id}`} target="_blank"
//                   className="adm-btn adm-btn--ghost adm-btn--sm">
//                   Просмотр ↗
//                 </Link>
//                 <button className="adm-btn adm-btn--danger adm-btn--sm"
//                   onClick={() => handleDelete(entry.id)}>
//                   Удалить
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }