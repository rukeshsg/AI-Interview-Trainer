import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

export function MarkdownRenderer({ content, isDark = true }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          return <CodeBlock key={index} rawBlock={part} isDark={isDark} />;
        }
        return <TextBlock key={index} text={part} isDark={isDark} />;
      })}
    </div>
  );
}

function CodeBlock({ rawBlock, isDark }: { rawBlock: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  
  // Extract language and code
  const lines = rawBlock.slice(3, -3).split('\n');
  const firstLine = lines[0].trim();
  const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 20;
  const lang = hasLang ? firstLine : 'code';
  const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

  function copyCode() {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`my-3 rounded-2xl border overflow-hidden font-mono text-xs shadow-md ${
      isDark ? 'bg-[#0d0f17] border-white/10' : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-indigo-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>{lang}</span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded bg-white/5"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function isTableDelimiter(line: string): boolean {
  const trimmed = line.trim();
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(trimmed);
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
}

function parseTableCells(line: string): string[] {
  const trimmed = line.trim();
  // Strip leading and trailing pipes
  const stripped = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return stripped.split('|').map((cell) => cell.trim());
}

function TableView({ headers, rows, isDark }: { headers: string[]; rows: string[][]; isDark: boolean }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className={isDark ? 'bg-slate-800/80 text-white border-b border-slate-700' : 'bg-slate-100 text-slate-900 border-b border-slate-200'}>
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5 font-bold tracking-wide">
                {parseInlineFormatting(h, isDark)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`${
                isDark
                  ? rIdx % 2 === 0 ? 'bg-slate-900/40 hover:bg-slate-800/50' : 'bg-slate-900/80 hover:bg-slate-800/50'
                  : rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'
              } transition-colors`}
            >
              {headers.map((_, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2.5 leading-relaxed align-top">
                  {parseInlineFormatting(row[cIdx] || '', isDark)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextBlock({ text, isDark }: { text: string; isDark: boolean }) {
  if (!text.trim()) return null;

  const rawLines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  function flushList() {
    if (currentList.length === 0) return;
    const listItems = currentList.map((item, idx) => (
      <li key={idx} className="flex items-start gap-2.5 my-1.5">
        <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
          isDark ? 'bg-indigo-400 ring-2 ring-indigo-400/20' : 'bg-indigo-600 ring-2 ring-indigo-600/20'
        }`} />
        <span className="flex-1 leading-relaxed">{parseInlineFormatting(item, isDark)}</span>
      </li>
    ));

    elements.push(
      <ul key={`list-${elements.length}`} className="my-2.5 space-y-1 pl-1">
        {listItems}
      </ul>
    );
    currentList = [];
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule (---, ***, ___ or --- with spaces)
    if (/^(---+|\*\*\*+|___+)\s*$/.test(trimmed)) {
      flushList();
      elements.push(
        <hr
          key={`hr-${i}`}
          className={`my-4 border-0 h-px ${isDark ? 'bg-slate-700/70' : 'bg-slate-200'}`}
        />
      );
      continue;
    }

    // Table detection: check if current line is a table row and next non-empty line is delimiter
    if (isTableRow(trimmed)) {
      // Look ahead for delimiter
      let delimiterIdx = -1;
      for (let j = i + 1; j < rawLines.length; j++) {
        const nextTrimmed = rawLines[j].trim();
        if (!nextTrimmed) continue; // skip blank lines
        if (isTableDelimiter(nextTrimmed)) {
          delimiterIdx = j;
        }
        break;
      }

      if (delimiterIdx !== -1) {
        flushList();
        const headers = parseTableCells(trimmed);
        const tableRows: string[][] = [];

        // Collect rows until table ends
        let k = delimiterIdx + 1;
        while (k < rawLines.length) {
          const rowLine = rawLines[k].trim();
          if (!rowLine) {
            // Check if table continues after blank line
            let hasMoreTable = false;
            for (let next = k + 1; next < rawLines.length; next++) {
              const peek = rawLines[next].trim();
              if (!peek) continue;
              if (isTableRow(peek)) {
                hasMoreTable = true;
                k = next - 1; // will be incremented
              }
              break;
            }
            if (!hasMoreTable) break;
          } else if (isTableRow(rowLine)) {
            tableRows.push(parseTableCells(rowLine));
          } else {
            break;
          }
          k++;
        }

        elements.push(
          <TableView key={`table-${i}`} headers={headers} rows={tableRows} isDark={isDark} />
        );

        i = k - 1;
        continue;
      }
    }

    // Header 1 (# )
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={i} className={`text-xl font-extrabold tracking-tight mt-4 mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {parseInlineFormatting(trimmed.slice(2), isDark)}
        </h2>
      );
      continue;
    }

    // Header 2 (## )
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={i} className={`text-lg font-bold tracking-tight mt-3 mb-1.5 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
          {parseInlineFormatting(trimmed.slice(3), isDark)}
        </h3>
      );
      continue;
    }

    // Header 3 (### )
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={i} className={`text-sm font-bold uppercase tracking-wider mt-3 mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
          {parseInlineFormatting(trimmed.slice(4), isDark)}
        </h4>
      );
      continue;
    }

    // Bullet point (- or * or • )
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      currentList.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    // Numbered list (1. 2. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={i} className="flex items-start gap-2.5 my-1.5 pl-1">
          <span className="font-bold text-indigo-400 text-xs mt-0.5">{numMatch[1]}.</span>
          <span className="flex-1 leading-relaxed">{parseInlineFormatting(numMatch[2], isDark)}</span>
        </div>
      );
      continue;
    }

    // Blockquote (> )
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={i} className={`my-2 pl-4 border-l-2 py-1 italic ${
          isDark ? 'border-indigo-500 bg-indigo-500/5 text-slate-300' : 'border-indigo-600 bg-indigo-50/50 text-slate-700'
        }`}>
          {parseInlineFormatting(trimmed.slice(2), isDark)}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={i} className="leading-relaxed my-1.5">
        {parseInlineFormatting(trimmed, isDark)}
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
}

function parseInlineFormatting(text: string, isDark: boolean): React.ReactNode {
  // Regex to match **bold**, *italic*, `code`
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const tokens = text.split(regex);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={idx} className={`italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          className={`px-1.5 py-0.5 rounded font-mono text-xs border ${
            isDark
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

