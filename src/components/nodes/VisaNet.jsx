import React from 'react';
import BaseNode from './BaseNode';

export default function VisaNet({ subtitle = 'Rede Externa' }) {
  return (
    <BaseNode
      id="node-visanet"
      icon="fa-solid fa-globe"
      iconColor="text-blue-400"
      title="VisaNet"
      subtitle={subtitle}
      glowClass="glow-blue"
    />
  );
}

