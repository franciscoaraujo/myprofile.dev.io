import React from 'react';
import BaseNode from './BaseNode';

export default function OutboxRelay({ subtitle = 'Debezium / Worker' }) {
  return (
    <BaseNode
      id="node-relay"
      icon="fa-solid fa-truck-fast"
      iconColor="text-orange-400"
      title="Outbox Relay"
      subtitle={subtitle}
      glowClass="glow-orange"
    />
  );
}

