import React from 'react';
import BaseNode from './BaseNode';

export default function SwitchAdq({ subtitle = 'Maestro Central' }) {
  return (
    <BaseNode
      id="node-switch"
      icon="fa-solid fa-server"
      iconColor="text-blue-500"
      title="Switch Adq (C++)"
      subtitle={subtitle}
      glowClass="glow-blue"
    />
  );
}

