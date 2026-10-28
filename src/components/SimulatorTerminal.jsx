'use client';

import React, { useEffect, useRef } from 'react';

export default function SimulatorTerminal({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <footer className="h-44 bg-black border-t border-gray-800 shrink-0 p-4 font-mono text-xs overflow-y-auto terminal-scroll">
      {logs.map((log) => {
        let color = 'text-green-400';
        if (log.type === 'error') color = 'text-red-400';
        if (log.type === 'warn') color = 'text-yellow-400';
        if (log.type === 'live') color = 'text-purple-400 font-bold';

        return (
          <div key={log.id} className={`mb-1 ${color}`}>
            <span className="text-gray-500 font-normal">[{log.time}]</span> {log.msg}
          </div>
        );
      })}
      <div ref={endRef} />
    </footer>
  );
}

