import React from 'react';
import BaseNode from './BaseNode';

export default function Settlement({ subtitle = 'Cálculo Real-Time' }) {
  return (
    <BaseNode
      id="node-listener"
      icon="fa-solid fa-ear-listen"
      iconColor="text-green-400"
      title="Settlement Listener"
      subtitle={subtitle}
      glowClass="glow-green"
      extraClasses="relative"
    >
      <i
        id="mdr-engine-icon"
        className="fa-solid fa-gear absolute -top-3 -right-3 text-gray-600 text-2xl transition-all duration-300 bg-gray-900 rounded-full shadow-sm"
      ></i>
    </BaseNode>
  );
}

