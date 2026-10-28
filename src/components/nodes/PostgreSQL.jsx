import React from 'react';
import BaseNode from './BaseNode';

export default function PostgreSQL({ queueCount = 0, subtitle = 'PostgreSQL Core' }) {
  return (
    <BaseNode
      id="node-db"
      icon="fa-solid fa-database"
      iconColor="text-indigo-400"
      title="DB & Outbox"
      subtitle={subtitle}
      glowClass="glow-indigo"
      extraClasses="relative"
    >
      {queueCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse border border-red-400 z-10">
          {queueCount}
        </div>
      )}
    </BaseNode>
  );
}

