import React from 'react';
import BaseNode from './BaseNode';

export default function NetworkLog({ queueCount = 0, title = 'Log de Rede (TC57)', subtitle = 'Registro Transacional' }) {
  return (
    <BaseNode
      id="node-network-log"
      icon="fa-solid fa-file-lines"
      iconColor="text-gray-400"
      title={title}
      subtitle={subtitle}
      glowClass="glow-gray"
      extraClasses="relative"
    >
      {queueCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(75,85,99,0.6)] border border-gray-400 z-10">
          {queueCount}
        </div>
      )}
    </BaseNode>
  );
}

