'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function SimulatorTerminal({ logs }) {
  const { theme } = useApp();
  const isLight = theme === 'light';
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <footer
      ref={containerRef}
      className={`h-40 border-t shrink-0 p-4 font-mono text-xs overflow-y-auto terminal-scroll transition-colors duration-300 ${
        isLight
          ? 'bg-slate-100 border-slate-300 text-slate-800'
          : 'bg-[#0B0F17] border-[#384152] text-slate-200'
      }`}
    >
      {logs.map((log) => {
        let color = isLight ? 'text-emerald-700 font-medium' : 'text-green-400';
        if (log.type === 'error') color = isLight ? 'text-red-700 font-semibold' : 'text-red-400';
        if (log.type === 'warn') color = isLight ? 'text-amber-700 font-medium' : 'text-yellow-400';
        if (log.type === 'live') color = isLight ? 'text-purple-700 font-bold' : 'text-purple-400 font-bold';

        return (
          <div key={log.id} className={`mb-1 ${color}`}>
            <span className={isLight ? 'text-slate-500 font-normal' : 'text-gray-500 font-normal'}>
              [{log.time}]
            </span>{' '}
            {log.msg}
          </div>
        );
      })}
    </footer>
  );
}
