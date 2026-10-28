import React from 'react';
import BaseNode from './BaseNode';

export default function GatewayVisa({ subtitle = 'Conector Bandeira' }) {
  return (
    <BaseNode
      id="node-gateway-visa"
      icon="fa-brands fa-cc-visa"
      iconColor="text-blue-600"
      title="Gateway Visa"
      subtitle={subtitle}
      glowClass="glow-blue"
    />
  );
}

