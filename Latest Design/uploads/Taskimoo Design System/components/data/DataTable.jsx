'use client';
import React from 'react';

/**
 * DataTable — the dense editorial table used for finance, work lists and
 * portfolios. Mono uppercase headers, hairline row rules, hover highlight.
 * Columns declare alignment, mono/strong rendering, width, and an optional
 * cell `render`. Rows clickable via `onRowClick`; `selectedKey` adds the
 * red left rail.
 */
export function DataTable({ columns = [], rows = [], rowKey = 'id', onRowClick, selectedKey, empty }) {
  const keyOf = (row, i) => (typeof rowKey === 'function' ? rowKey(row, i) : row[rowKey] ?? i);
  return (
    <div className="tk-tbl-wrap">
      <table className="tk-tbl">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || 'left', width: c.width }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="tk-tbl__emptyrow">
              <td colSpan={columns.length}>{empty ?? 'Nothing here yet.'}</td>
            </tr>
          ) : (
            rows.map((row, ri) => {
              const k = keyOf(row, ri);
              const sel = selectedKey != null && k === selectedKey;
              return (
                <tr
                  key={k}
                  className={`${onRowClick ? 'tk-tbl__row--click' : ''}${sel ? ' tk-tbl__row--sel' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row, ri) : undefined}
                >
                  {columns.map((c) => {
                    const content = c.render ? c.render(row[c.key], row, ri) : row[c.key];
                    const cls = `${c.mono ? 'tk-tbl__mono' : ''}${c.strong ? ' tk-tbl__strong' : ''}`.trim();
                    return (
                      <td key={c.key} className={cls} style={{ textAlign: c.align || 'left' }}>{content}</td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <style>{`
        .tk-tbl-wrap { border: 1px solid var(--border-0); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-0); }
        .tk-tbl { width: 100%; border-collapse: collapse; font-size: 12.5px; color: var(--fg-0); }
        .tk-tbl thead th { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-3); font-weight: 500; text-align: left; padding: 8px 12px; background: var(--bg-1); border-bottom: 1px solid var(--border-0); white-space: nowrap; }
        .tk-tbl tbody td { padding: 8px 12px; border-bottom: 1px solid var(--border-0); vertical-align: middle; }
        .tk-tbl tbody tr:last-child td { border-bottom: none; }
        .tk-tbl__row--click { cursor: pointer; transition: background var(--dur-fast) var(--ease-out); }
        .tk-tbl__row--click:hover { background: var(--bg-1); }
        .tk-tbl__row--sel td:first-child { box-shadow: inset 2px 0 0 var(--red-500); }
        .tk-tbl__mono { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); font-variant-numeric: tabular-nums; }
        .tk-tbl__strong { font-weight: 600; color: var(--fg-0); }
        .tk-tbl__emptyrow td { padding: 28px 12px; text-align: center; color: var(--fg-3); font-size: 12px; }
      `}</style>
    </div>
  );
}
