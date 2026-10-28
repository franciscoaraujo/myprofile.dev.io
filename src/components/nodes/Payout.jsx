import React from 'react';
import BaseNode from './BaseNode';

export default function Payout({ subtitle = 'Liquidação Financeira' }) {
  return (
    <BaseNode
      id="node-payout"
      icon="fa-solid fa-building-columns"
      iconColor="text-emerald-400"
      title="Payout & Ledger"
      subtitle={subtitle}
      glowClass="glow-emerald"
    />
  );
}

