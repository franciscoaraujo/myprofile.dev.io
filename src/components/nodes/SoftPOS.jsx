import React from 'react';
import BaseNode from './BaseNode';

export default function SoftPOS({ subtitle = 'App Lojista' }) {
  return (
    <BaseNode
      id="node-softpos"
      icon="fa-solid fa-mobile-button"
      iconColor="text-cyan-400"
      title="SoftPOS"
      subtitle={subtitle}
      glowClass="glow-cyan"
    />
  );
}

