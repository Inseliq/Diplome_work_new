import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Inline парсер ────────────────────────────────────────────────

function parseInline(text, keyOffset = 0) {
  const tokens = [];
  let i = 0, buf = '', k = keyOffset;

  const flush = () => { if (buf) { tokens.push(buf); buf = ''; } };

  while (i < text.length) {
    // ![alt](src)
    if (text[i] === '!' && text[i + 1] === '[') {
      flush();
      const altEnd = text.indexOf(']', i + 2);
      if (altEnd !== -1 && text[altEnd + 1] === '(') {
        const srcEnd = text.indexOf(')', altEnd + 2);
        if (srcEnd !== -1) {
          const alt = text.slice(i + 2, altEnd);
          const src = text.slice(altEnd + 2, srcEnd);
          tokens.push(<img key={k++} src={src} alt={alt} className="doc-img" />);
          i = srcEnd + 1; continue;
        }
      }
      buf += text[i++]; continue;
    }

    // [name](to)
    if (text[i] === '[' && text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/)) {
      flush();
      const m = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
      const [full, name, to] = m;
      if (to.startsWith('http')) {
        tokens.push(<a key={k++} href={to} target="_blank" rel="noopener noreferrer" className="doc-link">{name}</a>);
      } else {
        tokens.push(<Link key={k++} to={to} className="doc-link">{name}</Link>);
      }
      i += full.length; continue;
    }

    // [text] — strong
    if (text[i] === '[' && text.slice(i).match(/^\[([^\]()]+)\](?!\()/)) {
      flush();
      const m = text.slice(i).match(/^\[([^\]()]+)\]/);
      tokens.push(<strong key={k++}>{m[1]}</strong>);
      i += m[0].length; continue;
    }

    // **bold**
    if (text[i] === '*' && text[i + 1] === '*') {
      flush();
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        tokens.push(<strong key={k++}>{text.slice(i + 2, end)}</strong>);
        i = end + 2; continue;
      }
      buf += text[i++]; continue;
    }

    // *italic*
    if (text[i] === '*') {
      flush();
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        tokens.push(<em key={k++}>{text.slice(i + 1, end)}</em>);
        i = end + 1; continue;
      }
      buf += text[i++]; continue;
    }

    buf += text[i++];
  }
  flush();
  return tokens.length ? tokens : [text];
}

// ─── FAQ-блок ─────────────────────────────────────────────────────

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`doc-faq__item${isOpen ? ' doc-faq__item--open' : ''}`}>
      <button className="doc-faq__q" onClick={onToggle}>
        <svg className="doc-faq__arrow" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {question}
      </button>
      <div className="doc-faq__a-wrap">
        <p className="doc-faq__a">{parseInline(answer)}</p>
      </div>
    </div>
  );
}

// ─── Основной парсер ─────────────────────────────────────────────

export function parseDocMarkdown(source, sectionKey) {
  if (!source?.trim()) return null;

  const lines = source.split('\n');
  const result = [];
  let key = 0;
  let ulBuf = null;
  let olBuf = null;
  let faqBuf = [];

  // Собираем FAQ-группы: несколько ?[] подряд в один блок
  const flushFaq = (openIdx) => {
    if (!faqBuf.length) return;
    result.push(
      <FaqBlock key={key++} items={faqBuf} sectionKey={sectionKey} openIdx={openIdx} />
    );
    faqBuf = [];
  };

  const flushLists = () => {
    if (ulBuf) {
      result.push(<ul key={key++} className="doc-list doc-list--ul">{ulBuf}</ul>);
      ulBuf = null;
    }
    if (olBuf) {
      result.push(<ol key={key++} className="doc-list doc-list--ol">{olBuf}</ol>);
      olBuf = null;
    }
  };

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trimEnd();

    // Пустая строка
    if (!line.trim()) {
      flushLists();
      flushFaq(null);
      continue;
    }

    // HR
    if (/^-{3,}$/.test(line.trim())) {
      flushLists(); flushFaq(null);
      result.push(<hr key={key++} className="doc-hr" />);
      continue;
    }

    // FAQ ?[question](answer)
    const faqMatch = line.match(/^\?\[([^\]]+)\]\(([^)]+)\)/);
    if (faqMatch) {
      flushLists();
      faqBuf.push({ q: faqMatch[1], a: faqMatch[2] });
      continue;
    }

    // Если faq-цепочка прервалась не пустой строкой — сбрасываем
    if (faqBuf.length) flushFaq(null);

    // Заголовки
    const hMatch = line.match(/^(#{2,4})\s+(.+)/);
    if (hMatch) {
      flushLists();
      const level = hMatch[1].length;
      const Tag = `h${level}`;
      result.push(<Tag key={key++} className={`doc-h${level}`}>{parseInline(hMatch[2])}</Tag>);
      continue;
    }

    // UL
    const ulMatch = line.match(/^[-•]\s+(.+)/);
    if (ulMatch) {
      if (olBuf) flushLists();
      if (!ulBuf) ulBuf = [];
      ulBuf.push(<li key={key++} className="doc-li">{parseInline(ulMatch[1])}</li>);
      continue;
    }

    // OL
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (ulBuf) flushLists();
      if (!olBuf) olBuf = [];
      olBuf.push(<li key={key++} className="doc-li">{parseInline(olMatch[1])}</li>);
      continue;
    }

    // Параграф
    flushLists();
    result.push(<p key={key++} className="doc-p">{parseInline(line)}</p>);
  }

  flushLists();
  flushFaq(null);

  return result;
}

// ─── FAQ-блок (управляет состоянием открытых вопросов) ───────────

function FaqBlock({ items, sectionKey }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <div className="doc-faq">
      {items.map((item, i) => (
        <FaqItem
          key={i}
          question={item.q}
          answer={item.a}
          isOpen={openIdx === i}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}