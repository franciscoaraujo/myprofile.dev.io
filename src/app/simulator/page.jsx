'use client';

import React from 'react';
import Script from 'next/script';
import SwitchSimulator from '../../components/SwitchSimulator';

export default function SimulatorPage() {
  return (
    <>
      <Script src="/js/utils/i18n.js" strategy="afterInteractive" />
      <Script
        src="/js/components/simulator.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && typeof window.initSimulatorLab === 'function') {
            window.initSimulatorLab();
            setTimeout(() => {
              if (typeof window.drawArchitectureArrows === 'function') {
                window.drawArchitectureArrows();
              }
            }, 150);
          }
        }}
      />
      <SwitchSimulator />
    </>
  );
}

