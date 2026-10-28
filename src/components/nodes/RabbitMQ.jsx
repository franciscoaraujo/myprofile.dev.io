import React from 'react';
import BaseNode from './BaseNode';

export default function RabbitMQ({ queueCount = 0, subtitle = 'Fila de Eventos' }) {
  return (
    <BaseNode
      id="node-rmq"
      icon="fa-solid fa-envelope-open-text"
      iconColor="text-orange-400"
      title="RabbitMQ"
      subtitle={subtitle}
      glowClass="glow-orange"
      extraClasses="border-orange-500 relative"
    >
      <i
        id="rmq-clock-icon"
        className="fa-solid fa-clock absolute -top-3 -right-3 text-2xl opacity-0 transition-all duration-300 bg-gray-900 rounded-full"
      ></i>

      {queueCount > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse border border-orange-400 z-10">
          {queueCount}
        </div>
      )}
    </BaseNode>
  );
}

