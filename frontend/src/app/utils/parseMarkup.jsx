/**
 * Простой markup-парсер для новостей.
 *
 * Синтаксис (построчно):
 *   # Заголовок        → <h1>
 *   ## Заголовок       → <h2>  (до h6)
 *   ---                → <hr>
 *   > цитата           → <blockquote>
 *   - элемент          → <li> (группируются в <ul>)
 *   пустая строка      → разрыв между блоками
 *   остальное          → <p>
 *
 * Инлайн (внутри строки):
 *   **текст**          → <b>
 *   *текст*            → <i>
 *   [текст]            → <strong class="markup-highlight"> (цветной)
 *   [ссылка](название) → <a href="ссылка">
 *   ![alt](img)        → <img src="img" alt="alt">
 */

import React from 'react';

// ─── Inline parser ────────────────────────────────────────────────────────────

function parseInline(text) {
  // Разбиваем строку на токены через RegExp
  const pattern = /!\[([^\]]*)\]\(([^)]*)\)|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const parts = [];
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    if (match[1] !== undefined) {
      // ![alt](src) — картинка
      parts.push(<img key={match.index} src={match[2]} alt={match[1]} className="markup-img" />);
    } else if (match[3] !== undefined) {
      // [название](ссылка) — ссылка
      const href = match[4];
      const isExternal = href.startsWith('http');
      parts.push(
        <a
          key={match.index}
          href={href}
          className="markup-link"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {match[3]}
        </a>
      );
    } else if (match[5] !== undefined) {
      // [текст] — цветной strong
      parts.push(<strong key={match.index} className="markup-highlight">{match[5]}</strong>);
    } else if (match[6] !== undefined) {
      // **текст** — жирный
      parts.push(<b key={match.index}>{match[6]}</b>);
    } else if (match[7] !== undefined) {
      // *текст* — курсив
      parts.push(<i key={match.index}>{match[7]}</i>);
    }

    last = pattern.lastIndex;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

// ─── Block parser ─────────────────────────────────────────────────────────────

export function parseMarkup(source) {
  const lines = source.split('\n');
  const elements = [];
  let listBuffer = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key++}`} className="markup-list">
          {listBuffer.map((item, i) => (
            <li key={i} className="markup-list-item">{parseInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Заголовки
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = `h${level}`;
      elements.push(
        <Tag key={key++} className={`markup-h markup-h${level}`}>
          {parseInline(headingMatch[2])}
        </Tag>
      );
      continue;
    }

    // Горизонтальная линия
    if (/^-{3,}$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key++} className="markup-hr" />);
      continue;
    }

    // Цитата
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={key++} className="markup-quote">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Список
    if (/^[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    // Пустая строка
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Обычный параграф
    flushList();
    elements.push(
      <p key={key++} className="markup-p">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  return elements;
}