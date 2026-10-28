import React from 'react';
import BaseNode from './BaseNode';

export default function MerchantService({ subtitle = 'API Orquestradora' }) {
  return (
    <BaseNode
      id="node-merchant"
      icon="fa-solid fa-microchip"
      iconColor="text-purple-400"
      title="Merchant Service"
      subtitle={subtitle}
      glowClass="glow-purple"
    />
  );
}

