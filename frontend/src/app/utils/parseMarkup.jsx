import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────
   INLINE parser
───────────────────────────────────────────────────────── */
function parseInline(text) {
  const pattern = /!\[([^\]]*)\]\(([^)]*)\)|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const parts = [];
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[1] !== undefined) {
      parts.push(<img key={match.index} src={match[2]} alt={match[1]} className="markup-img" />);
    } else if (match[3] !== undefined) {
      const href = match[4];
      const ext = href.startsWith('http');
      parts.push(
        <a key={match.index} href={href} className="markup-link"
          {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {match[3]}
        </a>
      );
    } else if (match[5] !== undefined) {
      parts.push(<strong key={match.index} className="markup-highlight">{match[5]}</strong>);
    } else if (match[6] !== undefined) {
      parts.push(<b key={match.index}>{match[6]}</b>);
    } else if (match[7] !== undefined) {
      parts.push(<i key={match.index}>{match[7]}</i>);
    }

    last = pattern.lastIndex;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

/* ─────────────────────────────────────────────────────────
   FAQ ACCORDION
   Группа FAQ управляет одним открытым индексом
───────────────────────────────────────────────────────── */
function FaqGroup({ items }) {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen((prev) => (prev === i ? null : i));

  return (
    <div className="markup-faq-group">
      {items.map((item, i) => (
        <div
          key={i}
          className={`markup-faq-item${open === i ? ' markup-faq-item--open' : ''}`}
        >
          <button className="markup-faq-question" onClick={() => toggle(i)}>
            <span>{item.question}</span>
            <svg
              className="markup-faq-icon"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="markup-faq-answer-wrap">
            <div className="markup-faq-answer">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RATING BLOCK
───────────────────────────────────────────────────────── */
const PLACE_ICONS = {
  0: { label: '🥇', cls: 'markup-rating-icon--gold' },
  1: { label: '🥈', cls: 'markup-rating-icon--silver' },
  2: { label: '🥉', cls: 'markup-rating-icon--bronze' },
};

function RatingBlock({ title, rows }) {
  return (
    <div className="markup-rating">
      <div className="markup-rating-title">{title}</div>
      <div className="markup-rating-list">
        {rows.map((row, i) => {
          const icon = PLACE_ICONS[i] || { label: null, cls: 'markup-rating-icon--default' };
          return (
            <div key={i} className={`markup-rating-row${i < 3 ? ' markup-rating-row--top' : ''}`}>
              <div className="markup-rating-place">
                <span className="markup-rating-num">{i + 1}</span>
                {icon.label && (
                  <span className={`markup-rating-icon ${icon.cls}`}>{icon.label}</span>
                )}
              </div>
              <span className="markup-rating-nick">{row.nick}</span>
              <span className="markup-rating-prize">{row.prize}</span>
              {row.type && (
                <span className="markup-rating-type">{row.type}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PRE-PROCESSOR — извлекает многострочные блоки
   до построчного парсинга
───────────────────────────────────────────────────────── */
function preProcess(source) {
  const blocks = {};   // токен → React-элемент
  let counter = 0;
  let result = source;

  // !rating[title] (      ← открывающая скобка
  //   [nick](prize)(type)
  // )                     ← закрывающая скобка ОБЯЗАТЕЛЬНО на своей строке
  const ratingRE = /!rating\[([^\]]+)\]\s*\(([\s\S]*?)\n[ \t]*\)/g;
  result = result.replace(ratingRE, (_, title, body) => {
    const rowRE = /\[([^\]]+)\]\(([^)]+)\)(?:\(([^)]*)\))?/g;
    const rows = [];
    let m;
    while ((m = rowRE.exec(body)) !== null) {
      rows.push({ nick: m[1], prize: m[2], type: m[3] || null });
    }
    const token = `__BLOCK_${counter++}__`;
    blocks[token] = <RatingBlock key={token} title={title} rows={rows} />;
    return token;
  });

  return { source: result, blocks };
}

/* ─────────────────────────────────────────────────────────
   MAIN PARSER
───────────────────────────────────────────────────────── */
export function parseMarkup(source) {
  const { source: processed, blocks } = preProcess(source);
  const lines = processed.split('\n');
  const elements = [];
  let listBuf = [];
  let faqBuf = [];
  let key = 0;

  const flushList = () => {
    if (!listBuf.length) return;
    elements.push(
      <ul key={`ul-${key++}`} className="markup-list">
        {listBuf.map((item, i) => (
          <li key={i} className="markup-list-item">{parseInline(item)}</li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  const flushFaq = () => {
    if (!faqBuf.length) return;
    elements.push(<FaqGroup key={`faq-${key++}`} items={[...faqBuf]} />);
    faqBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    // — Сохранённый блок (rating и т.д.)
    if (blocks[line.trim()]) {
      flushList(); flushFaq();
      elements.push(blocks[line.trim()]);
      continue;
    }

    // — FAQ: ?[вопрос](ответ)
    const faqMatch = line.match(/^\?\[([^\]]+)\]\(([^)]+)\)$/);
    if (faqMatch) {
      flushList();
      faqBuf.push({ question: faqMatch[1], answer: faqMatch[2] });
      continue;
    } else {
      flushFaq();
    }

    // — Заголовки
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      flushList();
      const Tag = `h${hMatch[1].length}`;
      elements.push(
        <Tag key={key++} className={`markup-h markup-h${hMatch[1].length}`}>
          {parseInline(hMatch[2])}
        </Tag>
      );
      continue;
    }

    // — HR
    if (/^-{3,}$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key++} className="markup-hr" />);
      continue;
    }

    // — Цитата
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={key++} className="markup-quote">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // — Список
    if (/^[-*]\s+/.test(line)) {
      listBuf.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    // — Пустая строка
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // — Параграф
    flushList();
    elements.push(
      <p key={key++} className="markup-p">{parseInline(line)}</p>
    );
  }

  flushList();
  flushFaq();
  return elements;
}