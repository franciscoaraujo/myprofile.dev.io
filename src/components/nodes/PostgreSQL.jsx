import React from 'react';
import BaseNode from './BaseNode';

export default function PostgreSQL({
  queueCount = 0,
  partitionCount = 0,
  subtitle = 'PostgreSQL Core',
}) {
  return (
    <BaseNode
      id="node-db"
      icon="fa-solid fa-database"
      iconColor="text-indigo-400"
      title="DB & Outbox"
      subtitle={subtitle}
      glowClass="glow-indigo"
      extraClasses="relative overflow-hidden"
    >
      <div className="scanner-line"></div>

      {queueCount > 0 && (
        <div
          title="Eventos retidos na tabela Outbox"
          className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse border border-red-400 z-20"
        >
          {queueCount}
        </div>
      )}

      {partitionCount > 0 && (
        <div
          title="Transações persistidas na partição diária (prontas para Cut-Off Batch)"
          className="absolute -bottom-2 -right-2 bg-indigo-600 text-cyan-200 text-[9px] font-mono font-bold px-1.5 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(99,102,241,0.7)] border border-cyan-400/60 z-20"
        >
          {partitionCount}
        </div>
      )}
    </BaseNode>
  );
}
