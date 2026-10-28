import React from 'react';
import BaseNode from './BaseNode';

export default function Reconciliation({ subtitle = 'Job Noturno (Recon)' }) {
  return (
    <BaseNode
      id="node-batch"
      icon="fa-solid fa-server"
      iconColor="text-yellow-400"
      title="Spring Batch"
      subtitle={subtitle}
      glowClass="glow-yellow"
      extraClasses="relative"
    >
      <i
        id="batch-clock-icon"
        className="fa-solid fa-clock absolute -top-3 -right-3 text-gray-600 text-2xl transition-all duration-300 bg-gray-900 rounded-full shadow-sm"
      ></i>
    </BaseNode>
  );
}

