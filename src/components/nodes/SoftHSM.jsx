import React from 'react';
import BaseNode from './BaseNode';

export default function SoftHSM({ subtitle = 'Cofre Criptográfico' }) {
  return (
    <BaseNode
      id="node-softhsm"
      icon="fa-solid fa-vault"
      iconColor="text-red-400"
      title="SoftHSM"
      subtitle={subtitle}
      glowClass="glow-red"
    />
  );
}

