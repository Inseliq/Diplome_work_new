import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Лёгкий markdown-парсер для уведомлений.
 *
 * Поддерживаемый синтаксис:
 *   ##text        → <h2>
 *   ###text       → <h3>
 *   ####text      → <h4>
 *   #####text     → <h5>
 *   **text**      → <b>
 *   *text*        → <i>
 *   [text]        → <strong>  (выделение без ссылки)
 *   [name](url)   → <Link to={url}>name</Link>
 *   ![alt](src)   → <img alt src />
 *   - item        → <ul><li>...</li></ul>
 *   1. item       → <ol><li>...</li></ol>
 *   ---           → <hr />
 *   пустая строка → разрыв между параграфами
 *
 * Использование:
 *   const nodes = parseNotifyMarkdown(text);
 *   return <div>{nodes}</div>;
 */

// ─── Inline-парсер: **b**, *i*, [strong], [link](url), ![alt](src) ──────────

function parseInline(text, options = {}) {
  const { onNavigate } = options;
  const tokens = [];
  let i = 0;
  let buf = '';

  const flush = () => {
    if (buf) { tokens.push(buf); buf = ''; }
  };

  while (i < text.length) {

    // ![alt](src)  — изображение
    if (text[i] === '!' && text[i + 1] === '[') {
      flush();
      const altEnd = text.indexOf(']', i + 2);
      if (altEnd !== -1 && text[altEnd + 1] === '(') {
        const srcEnd = text.indexOf(')', altEnd + 2);
        if (srcEnd !== -1) {
          const alt = text.slice(i + 2, altEnd);
          const src = text.slice(altEnd + 2, srcEnd);
          tokens.push(<img key={i} src={src} alt={alt} className="nm-img" />);
          i = srcEnd + 1;
          continue;
        }
      }
      buf += text[i++];
      continue;
    }

    // [name](url) — ссылка
    if (text[i] === '[' && text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/)) {
      flush();
      const m = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
      const [full, name, url] = m;
      // внутренние ссылки — через Link, внешние — через <a>
      if (url.startsWith('http')) {
        tokens.push(
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="nm-link"
            onClick={onNavigate}
          >
            {name}
          </a>
        );
      } else {
        tokens.push(
          <Link
            key={i}
            to={url}
            className="nm-link"
            onClick={onNavigate}
          >
            {name}
          </Link>
        );
      }
      i += full.length;
      continue;
    }

    // [text] — strong (без ссылки)
    if (text[i] === '[' && text.slice(i).match(/^\[([^\]()]+)\](?!\()/)) {
      flush();
      const m = text.slice(i).match(/^\[([^\]()]+)\]/);
      tokens.push(<strong key={i} className="nm-strong">{m[1]}</strong>);
      i += m[0].length;
      continue;
    }

    // **text** — bold
    if (text[i] === '*' && text[i + 1] === '*') {
      flush();
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        tokens.push(<b key={i}>{text.slice(i + 2, end)}</b>);
        i = end + 2;
        continue;
      }
      buf += text[i++];
      continue;
    }

    // *text* — italic
    if (text[i] === '*') {
      flush();
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        tokens.push(<i key={i}>{text.slice(i + 1, end)}</i>);
        i = end + 1;
        continue;
      }
      buf += text[i++];
      continue;
    }

    buf += text[i++];
  }

  flush();
  return tokens.length ? tokens : [text];
}

// ─── Блочный парсер ─────────────────────────────────────────────────────────

export function parseNotifyMarkdown(source, options = {}) {
  if (!source?.trim()) return null;

  const lines = source.split('\n');
  const result = [];
  let key = 0;

  let ulItems = null; // накапливаем <ul>
  let olItems = null; // накапливаем <ol>

  const flushList = () => {
    if (ulItems) {
      result.push(<ul key={key++} className="nm-list nm-list--ul">{ulItems}</ul>);
      ulItems = null;
    }
    if (olItems) {
      result.push(<ol key={key++} className="nm-list nm-list--ol">{olItems}</ol>);
      olItems = null;
    }
  };

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const line = raw.trimEnd();

    // ── Пустая строка ──
    if (!line.trim()) {
      flushList();
      continue;
    }

    // ── HR ──
    if (/^-{3,}$/.test(line.trim())) {
      flushList();
      result.push(<hr key={key++} className="nm-hr" />);
      continue;
    }

    // ── Заголовки #####, ####, ###, ## ──
    const hMatch = line.match(/^(#{2,5})\s+(.+)/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length; // 2..5
      const text = hMatch[2];
      const Tag = `h${level}`;
      result.push(
        <Tag key={key++} className={`nm-h${level}`}>
          {parseInline(text, options)}
        </Tag>
      );
      continue;
    }

    // ── Маркированный список  "- " ──
    const ulMatch = line.match(/^[-•]\s+(.+)/);
    if (ulMatch) {
      if (olItems) flushList();
      if (!ulItems) ulItems = [];
      ulItems.push(<li key={key++} className="nm-li">{parseInline(ulMatch[1], options)}</li>);
      continue;
    }

    // ── Нумерованный список  "1. " ──
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (ulItems) flushList();
      if (!olItems) olItems = [];
      olItems.push(<li key={key++} className="nm-li">{parseInline(olMatch[1], options)}</li>);
      continue;
    }

    // ── Обычный параграф ──
    flushList();
    result.push(
      <p key={key++} className="nm-p">
        {parseInline(line, options)}
      </p>
    );
  }

  // Сбросить незакрытые списки в конце
  flushList();

  return result;
}