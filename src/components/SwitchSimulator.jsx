'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

import SoftPOS from './nodes/SoftPOS';
import MerchantService from './nodes/MerchantService';
import GatewayVisa from './nodes/GatewayVisa';
import SwitchAdq from './nodes/SwitchAdq';
import SoftHSM from './nodes/SoftHSM';
import VisaNet from './nodes/VisaNet';
import PostgreSQL from './nodes/PostgreSQL';
import OutboxRelay from './nodes/OutboxRelay';
import RabbitMQ from './nodes/RabbitMQ';
import Settlement from './nodes/Settlement';
import Reconciliation from './nodes/Reconciliation';
import Payout from './nodes/Payout';
import SettingsModal from './modals/SettingsModal';
import SimulatorTerminal from './SimulatorTerminal';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function SwitchSimulator() {
  const { lang, theme } = useApp();
  const isPt = lang === 'pt';
  const isLight = theme === 'light';

  const [wsConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const metricsRef = useRef({
    pdvCount: 0,
    dbQueue: 0,
    rmqQueue: 0,
    partitionCount: 0,
    totalVolume: 0,
    lastEvent: '',
  });
  const [uiMetrics, setUiMetrics] = useState(metricsRef.current);

  const chaosRef = useRef({ gw: true, db: true, relay: true, rmq: true });
  const [uiChaos, setUiChaos] = useState(chaosRef.current);

  const processedTxIdsRef = useRef(new Set());

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const particlesContainerRef = useRef(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const addLog = useCallback((msg, type = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString('pt-BR', {
          hour12: false,
          fractionalSecondDigits: 3,
        }),
        msg,
        type,
      },
    ]);
  }, []);

  const updateMetrics = useCallback(() => {
    setUiMetrics({ ...metricsRef.current });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    addLog(
      isPt
        ? '[SYSTEM] OrionPay Switch Lab inicializado (Persistência direta no PostgreSQL Core com Range Partitioning).'
        : '[SYSTEM] OrionPay Switch Lab initialized (Direct PostgreSQL Core persistence with Range Partitioning).',
      'info'
    );
    addLog(
      isPt
        ? '[INFO] Clique em 🚀 (Simular Transação) para o Caminho Quente/Morno ou em 💼 (Rodar Batch) para o Cold Path direto do PostgreSQL.'
        : '[INFO] Click 🚀 (Simulate Tx) for Hot/Warm Path or 💼 (Run Batch) for Cold Path directly from PostgreSQL.',
      'info'
    );
  }, [addLog, isPt]);

  // --- SVG Drawing ---
  const drawLine = useCallback((id1, id2, dashed = false, arrow = true, twoWay = false, label = '', labelOffsetY = 0) => {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    const container = canvasRef.current;
    if (!el1 || !el2 || !container) return '';

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const cx1 = r1.left - cRect.left + container.scrollLeft + r1.width / 2;
    const cy1 = r1.top - cRect.top + container.scrollTop + r1.height / 2;
    const cx2 = r2.left - cRect.left + container.scrollLeft + r2.width / 2;
    const cy2 = r2.top - cRect.top + container.scrollTop + r2.height / 2;

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const angle = Math.atan2(dy, dx);

    const getIntersection = (w, h, ang) => {
      const absCos = Math.abs(Math.cos(ang));
      const absSin = Math.abs(Math.sin(ang));
      if ((w / 2) * absSin <= (h / 2) * absCos) {
        return w / 2 / (absCos === 0 ? 1 : absCos);
      } else {
        return h / 2 / (absSin === 0 ? 1 : absSin);
      }
    };

    const dist1 = getIntersection(r1.width, r1.height, angle) + 5;
    const dist2 = getIntersection(r2.width, r2.height, angle) + 5;

    const x1 = cx1 + Math.cos(angle) * dist1;
    const y1 = cy1 + Math.sin(angle) * dist1;

    const x2 = cx2 - Math.cos(angle) * dist2;
    const y2 = cy2 - Math.sin(angle) * dist2;

    const dash = dashed ? 'stroke-dasharray="6 6"' : '';
    const markerEnd = arrow ? 'marker-end="url(#arrowhead)"' : '';
    const markerStart = twoWay ? 'marker-start="url(#arrowhead-start)"' : '';

    const lineStroke = isLight ? '#94A3B8' : '#4B5563';
    const labelBg = isLight ? '#FFFFFF' : '#1A2130';
    const labelBorder = isLight ? '#CBD5E1' : '#384152';
    const labelText = isLight ? '#334155' : '#E2E8F0';

    let labelSvg = '';
    if (label) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2 + labelOffsetY;
      const boxW = Math.max(label.length * 6.5 + 22, 124);
      labelSvg = `
        <rect x="${midX - boxW / 2}" y="${midY - 11}" width="${boxW}" height="22" rx="11" fill="${labelBg}" stroke="${labelBorder}" stroke-width="1.2" />
        <text x="${midX}" y="${midY + 4}" fill="${labelText}" font-size="11" font-family="monospace" text-anchor="middle" font-weight="bold">${label}</text>
      `;
    }

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineStroke}" stroke-width="2" ${dash} ${markerEnd} ${markerStart} />${labelSvg}`;
  }, [isLight]);

  // Return elbow line from Settlement Listener -> DB & Outbox (offset slightly right on DB so it never collides with vertical Batch line)
  const drawElbowLine = useCallback((id1, id2, dashed = false, offsetY = 48, targetOffsetX = 34) => {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    const container = canvasRef.current;
    if (!el1 || !el2 || !container) return '';

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const cx1 = r1.left - cRect.left + container.scrollLeft + r1.width / 2;
    const cy1 = r1.top - cRect.top + container.scrollTop + r1.height / 2;
    const cx2 = r2.left - cRect.left + container.scrollLeft + r2.width / 2;
    const cy2 = r2.top - cRect.top + container.scrollTop + r2.height / 2;

    const x1 = cx1;
    const y1 = cy1 + r1.height / 2 + 5;
    const x2 = cx2 + targetOffsetX;
    const y2 = cy2 + r2.height / 2 + 5;
    const yMid = cy1 + r1.height / 2 + offsetY;

    const lineStroke = isLight ? '#94A3B8' : '#4B5563';
    const dash = dashed ? 'stroke-dasharray="6 6"' : '';
    const d = `M ${x1} ${y1} L ${x1} ${yMid} L ${x2} ${yMid} L ${x2} ${y2}`;

    return `<path d="${d}" stroke="${lineStroke}" stroke-width="2" fill="none" ${dash} marker-end="url(#arrowhead)" />`;
  }, [isLight]);

  // Outer elbow line from Spring Batch -> VisaNet ("Envio TC50 (Base II)") routed cleanly around the right side of Column 5
  const drawBottomElbowLine = useCallback((id1, id2, label = '') => {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    const container = canvasRef.current;
    if (!el1 || !el2 || !container) return '';

    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const cx1 = r1.left - cRect.left + container.scrollLeft + r1.width / 2;
    const cy1 = r1.top - cRect.top + container.scrollTop + r1.height / 2;
    const cx2 = r2.left - cRect.left + container.scrollLeft + r2.width / 2;
    const cy2 = r2.top - cRect.top + container.scrollTop + r2.height / 2;

    const x1 = cx1;
    const y1 = cy1 + r1.height / 2 + 5;
    const yMid = cy1 + r1.height / 2 + 48;
    const xOuter = cx2 + r2.width / 2 + 32;
    const x2 = cx2 + r2.width / 2 + 6;
    const y2 = cy2;

    const lineStroke = isLight ? '#94A3B8' : '#4B5563';
    const labelBg = isLight ? '#FFFFFF' : '#1A2130';
    const labelBorder = isLight ? '#CBD5E1' : '#384152';
    const labelText = isLight ? '#1D4ED8' : '#93C5FD';

    const d = `M ${x1} ${y1} L ${x1} ${yMid} L ${xOuter} ${yMid} L ${xOuter} ${y2} L ${x2} ${y2}`;

    let labelSvg = '';
    if (label) {
      const midX = (x1 + xOuter) / 2;
      const boxW = Math.max(label.length * 6.8 + 22, 148);
      labelSvg = `
        <rect x="${midX - boxW / 2}" y="${yMid - 11}" width="${boxW}" height="22" rx="11" fill="${labelBg}" stroke="${labelBorder}" stroke-width="1.2" />
        <text x="${midX}" y="${yMid + 4}" fill="${labelText}" font-size="11" font-family="monospace" text-anchor="middle" font-weight="bold">${label}</text>
      `;
    }

    return `<path d="${d}" stroke="${lineStroke}" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />${labelSvg}`;
  }, [isLight]);

  const renderLines = useCallback(() => {
    if (!svgRef.current) return;
    const partitionLabel = isPt
      ? 'Leitura Paginada / Partition Pruning'
      : 'Paged Read / Partition Pruning';
    const doubleEntryLabel = isPt
      ? 'Crédito / Débito (Double-Entry)'
      : 'Credit / Debit (Double-Entry)';
    const tc50Label = isPt ? 'Envio TC50 (Base II)' : 'TC50 Send (Base II)';
    const arrowFill = isLight ? '#64748B' : '#6B7280';

    svgRef.current.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${arrowFill}" />
        </marker>
        <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="${arrowFill}" />
        </marker>
      </defs>
      ${drawLine('node-softpos', 'node-merchant', false, true)}
      ${drawLine('node-merchant', 'node-switch', false, true)}
      ${drawLine('node-switch', 'node-softhsm', false, true, true)}
      ${drawLine('node-switch', 'node-gateway-visa', false, true)}
      ${drawLine('node-gateway-visa', 'node-visanet', false, true)}
      
      ${drawLine('node-merchant', 'node-db', false, true)}
      ${drawLine('node-db', 'node-relay', false, true)}
      ${drawLine('node-relay', 'node-rmq', false, true)}
      ${drawLine('node-rmq', 'node-listener', false, true)}
      ${drawElbowLine('node-listener', 'node-db', true, 44, 34)}
      
      ${drawLine('node-db', 'node-batch', true, true, false, partitionLabel, 18)}
      ${drawLine('node-batch', 'node-payout', false, true, false, doubleEntryLabel)}
      ${drawBottomElbowLine('node-batch', 'node-visanet', tc50Label)}
    `;
  }, [drawLine, drawElbowLine, drawBottomElbowLine, isPt, isLight]);

  useEffect(() => {
    renderLines();
    const timer1 = setTimeout(renderLines, 200);
    const timer2 = setTimeout(renderLines, 600);
    window.addEventListener('resize', renderLines);

    const container = canvasRef.current;
    if (container) {
      container.addEventListener('scroll', renderLines);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', renderLines);
      if (container) {
        container.removeEventListener('scroll', renderLines);
      }
    };
  }, [renderLines, isTerminalOpen]);

  // --- Particle Engine ---
  const createParticle = useCallback((startNodeId, colorClass) => {
    const el = document.createElement('i');
    el.className = `particle fa-solid fa-file-invoice-dollar ${colorClass}`;
    if (particlesContainerRef.current) {
      particlesContainerRef.current.appendChild(el);
    }

    const node = document.getElementById(startNodeId);
    const c = canvasRef.current;
    if (node && c) {
      const r = node.getBoundingClientRect();
      const cRect = c.getBoundingClientRect();
      el.style.left = `${r.left - cRect.left + c.scrollLeft + r.width / 2}px`;
      el.style.top = `${r.top - cRect.top + c.scrollTop + r.height / 2}px`;
    }

    return {
      el,
      async moveTo(nodeId, duration = 500) {
        return new Promise((resolve) => {
          void el.offsetWidth;
          const targetNode = document.getElementById(nodeId);
          const canvas = canvasRef.current;
          if (targetNode && canvas) {
            const r = targetNode.getBoundingClientRect();
            const cRect = canvas.getBoundingClientRect();

            el.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
            el.style.left = `${r.left - cRect.left + canvas.scrollLeft + r.width / 2}px`;
            el.style.top = `${r.top - cRect.top + canvas.scrollTop + r.height / 2}px`;
          }
          setTimeout(resolve, duration);
        });
      },
      async moveBottomElbowTo(nodeId, duration = 1100) {
        const targetNode = document.getElementById(nodeId);
        const canvas = canvasRef.current;
        if (!targetNode || !canvas) return;

        const startY = parseFloat(el.style.top || '0');

        const r = targetNode.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();
        const targetX = r.left - cRect.left + canvas.scrollLeft + r.width / 2;
        const targetY = r.top - cRect.top + canvas.scrollTop + r.height / 2;
        const xOuter = targetX + r.width / 2 + 32;

        const yMid = startY + 93;

        void el.offsetWidth;

        // Segment 1: Down to bottom elbow
        const dur1 = duration * 0.2;
        el.style.transition = `left ${dur1}ms linear, top ${dur1}ms linear`;
        el.style.top = `${yMid}px`;
        await sleep(dur1);

        // Segment 2: Horizontal across to outer right lane
        const dur2 = duration * 0.42;
        el.style.transition = `left ${dur2}ms linear, top ${dur2}ms linear`;
        el.style.left = `${xOuter}px`;
        await sleep(dur2);

        // Segment 3: Up along outer lane to VisaNet row
        const dur3 = duration * 0.28;
        el.style.transition = `left ${dur3}ms linear, top ${dur3}ms linear`;
        el.style.top = `${targetY}px`;
        await sleep(dur3);

        // Segment 4: Enter VisaNet node
        const dur4 = duration * 0.1;
        el.style.transition = `left ${dur4}ms linear, top ${dur4}ms linear`;
        el.style.left = `${targetX}px`;
        await sleep(dur4);
      },
      setType(newColorClass) {
        el.className = `particle fa-solid fa-file-invoice-dollar ${newColorClass}`;
      },
      destroy() {
        el.remove();
      },
    };
  }, []);

  // --- Timeline 1: Hot & Warm Path (Real-Time Authorization + Transactional Outbox) ---
  const simulateAuthFlowAnimation = useCallback(async () => {
    const softposBox = document.getElementById('node-softpos');
    const merchantBox = document.getElementById('node-merchant');
    const switchBox = document.getElementById('node-switch');
    const softhsmBox = document.getElementById('node-softhsm');
    const gatewayVisaBox = document.getElementById('node-gateway-visa');
    const visaNetBox = document.getElementById('node-visanet');
    const dbBox = document.getElementById('node-db');

    // 0. Disparo inicial do SoftPOS
    if (softposBox) softposBox.classList.add('node-active-cyan');
    const p = createParticle('node-softpos', 'bg-cyan-400 text-cyan-400');
    await sleep(300);
    if (softposBox) softposBox.classList.remove('node-active-cyan');

    // 1. Chegada no Merchant Service (API Orquestradora)
    await p.moveTo('node-merchant', 400);
    if (merchantBox) merchantBox.classList.add('node-active-purple');

    // FORK DB (Commit direto no PostgreSQL Core: Tabela Particionada + Outbox)
    const forkDb = async () => {
      const pDb = createParticle('node-merchant', 'bg-cyan-400 text-cyan-400');
      await pDb.moveTo('node-db', 600);
      if (dbBox) dbBox.classList.add('node-active-db');

      if (!chaosRef.current.db) {
        addLog('[ERROR] DB Core Offline! Falha no Insert.', 'error');
        pDb.setType('bg-red-500 text-red-500');
        await sleep(500);
        if (dbBox) dbBox.classList.remove('node-active-db');
        pDb.destroy();
        return;
      }

      metricsRef.current.dbQueue++;
      metricsRef.current.partitionCount++;
      updateMetrics();

      await sleep(500);
      if (dbBox) dbBox.classList.remove('node-active-db');
      pDb.destroy();
    };
    forkDb();

    await sleep(300);
    if (merchantBox) merchantBox.classList.remove('node-active-purple');

    // 2. Encaminhamento para o Switch Adq (C++)
    await p.moveTo('node-switch', 400);
    if (switchBox) switchBox.classList.add('node-active-blue');

    if (!chaosRef.current.gw) {
      addLog('[ERROR] Switch Adq (C++) Offline. Autorização negada.', 'error');
      p.setType('bg-red-500 text-red-500');
      await sleep(500);
      if (switchBox) switchBox.classList.remove('node-active-blue');
      await p.moveTo('node-merchant', 400);
      await p.moveTo('node-softpos', 400);
      p.destroy();
      return;
    }

    await sleep(250);

    // 2.1 Tradução de PIN Block no SoftHSM (Ida e volta síncrona)
    const hsmParticle = createParticle('node-switch', 'bg-red-400 text-red-400');
    await hsmParticle.moveTo('node-softhsm', 300);
    if (softhsmBox) softhsmBox.classList.add('node-active-red');
    await sleep(200);
    if (softhsmBox) softhsmBox.classList.remove('node-active-red');
    await hsmParticle.moveTo('node-switch', 300);
    hsmParticle.destroy();

    // 2.2 Encaminhamento para o Gateway Visa
    await p.moveTo('node-gateway-visa', 400);
    if (gatewayVisaBox) gatewayVisaBox.classList.add('node-active-blue');
    await sleep(300);
    if (gatewayVisaBox) gatewayVisaBox.classList.remove('node-active-blue');

    // 2.3 Chegada na VisaNet
    await p.moveTo('node-visanet', 400);
    if (visaNetBox) visaNetBox.classList.add('node-active-blue');
    await sleep(500);
    if (visaNetBox) visaNetBox.classList.remove('node-active-blue');

    // 3. Caminho de Retorno Síncrono (Resposta HTTP/ISO 0110 até o SoftPOS)
    p.setType('bg-green-400 text-green-400');

    await p.moveTo('node-gateway-visa', 300);
    if (gatewayVisaBox) gatewayVisaBox.classList.add('node-active-blue');
    await sleep(200);
    if (gatewayVisaBox) gatewayVisaBox.classList.remove('node-active-blue');

    await p.moveTo('node-switch', 300);
    if (switchBox) switchBox.classList.remove('node-active-blue');

    await p.moveTo('node-merchant', 400);
    if (merchantBox) merchantBox.classList.add('node-active-purple');
    await sleep(300);
    if (merchantBox) merchantBox.classList.remove('node-active-purple');

    await p.moveTo('node-softpos', 400);
    if (softposBox) softposBox.classList.add('node-active-cyan');

    metricsRef.current.pdvCount++;
    updateMetrics();

    await sleep(600);
    if (softposBox) softposBox.classList.remove('node-active-cyan');

    p.destroy();
  }, [addLog, createParticle, updateMetrics]);

  const simulateRelayAnimation = useCallback(async () => {
    if (metricsRef.current.dbQueue <= 0) return;

    if (!chaosRef.current.relay) {
      addLog('[WARN] Outbox Relay Offline: Eventos permanecem retidos no PostgreSQL (Outbox).', 'warn');
      return;
    }

    metricsRef.current.dbQueue--;
    updateMetrics();

    const p = createParticle('node-db', 'bg-indigo-400 text-indigo-400');
    await p.moveTo('node-relay', 700);

    const relayBox = document.getElementById('node-relay');
    if (relayBox) {
      relayBox.classList.add('node-active-relay');
    }

    await sleep(600);

    if (relayBox) {
      relayBox.classList.remove('node-active-relay');
    }

    if (!chaosRef.current.rmq) {
      addLog('[ERROR] Outbox Relay: RabbitMQ indisponível. Revertendo para o banco.', 'error');
      p.setType('bg-red-500 text-red-500');
      await p.moveTo('node-db', 700);

      metricsRef.current.dbQueue++;
      updateMetrics();

      p.destroy();
      return;
    }

    await p.moveTo('node-rmq', 700);
    p.setType('bg-orange-400 text-orange-400');

    const rmqBox = document.getElementById('node-rmq');
    if (rmqBox) {
      rmqBox.classList.add('node-active-relay');
    }

    metricsRef.current.rmqQueue++;
    updateMetrics();

    const rmqClock = document.getElementById('rmq-clock-icon');
    if (rmqClock) {
      rmqClock.classList.add('spin-waiting', 'fa-spin');
    }

    await sleep(800);

    if (rmqBox) {
      rmqBox.classList.remove('node-active-relay');
    }

    p.destroy();
  }, [addLog, createParticle, updateMetrics]);

  const simulateListenerAnimation = useCallback(async () => {
    if (metricsRef.current.rmqQueue <= 0) return;

    if (!chaosRef.current.rmq) {
      addLog('[ERROR] Falha de Consumo: RabbitMQ fora do ar.', 'error');
      return;
    }

    if (metricsRef.current.rmqQueue > 0) {
      metricsRef.current.rmqQueue--;
      updateMetrics();
    }

    if (metricsRef.current.rmqQueue === 0) {
      const rmqClock = document.getElementById('rmq-clock-icon');
      if (rmqClock) {
        rmqClock.classList.remove('spin-waiting', 'fa-spin');
      }
    }

    const p = createParticle('node-rmq', 'bg-orange-400 text-orange-400');

    await p.moveTo('node-listener', 700);

    const mdrIcon = document.getElementById('mdr-engine-icon');
    const listenerBox = document.getElementById('node-listener');

    if (mdrIcon) {
      mdrIcon.classList.add('spin-calculating', 'fa-spin');
    }
    if (listenerBox) {
      listenerBox.classList.add('node-active-engine');
    }

    p.setType('bg-yellow-400 text-yellow-400 shadow-yellow-500');
    await sleep(1200);

    if (mdrIcon) {
      mdrIcon.classList.remove('spin-calculating', 'fa-spin');
    }
    if (listenerBox) {
      listenerBox.classList.remove('node-active-engine');
    }

    p.setType('bg-green-400 text-green-400');

    const dbNode = document.getElementById('node-db');
    const listenerNode = document.getElementById('node-listener');
    const c = canvasRef.current;

    if (dbNode && listenerNode && c) {
      const rDb = dbNode.getBoundingClientRect();
      const rList = listenerNode.getBoundingClientRect();
      const cRect = c.getBoundingClientRect();

      const dbX = rDb.left - cRect.left + c.scrollLeft + rDb.width / 2 + 34;
      const listY = rList.top - cRect.top + c.scrollTop + rList.height / 2;
      const yMid = listY + rList.height / 2 + 44;

      p.el.style.transition = 'top 280ms linear';
      p.el.style.top = `${yMid}px`;
      await sleep(280);

      p.el.style.transition = 'left 550ms linear';
      p.el.style.left = `${dbX}px`;
      await sleep(550);

      await p.moveTo('node-db', 280);
    } else {
      await p.moveTo('node-db', 900);
    }

    const dbBox = document.getElementById('node-db');
    if (dbBox) dbBox.classList.add('node-active-db');

    await sleep(500);
    if (dbBox) dbBox.classList.remove('node-active-db');

    p.destroy();
  }, [addLog, createParticle, updateMetrics]);

  // --- Timeline 2: Cold Path (Cut-Off / Leitura Paginada & Partition Pruning direto do PostgreSQL Core) ---
  const simulateBatchAnimation = useCallback(async () => {
    if (metricsRef.current.partitionCount > 0) {
      metricsRef.current.partitionCount--;
      updateMetrics();
    }

    // 1. Origem do Pulso: nasce diretamente de DB & Outbox (PostgreSQL Core)
    const p = createParticle(
      'node-db',
      'bg-indigo-400 text-indigo-400 shadow-[0_0_15px_#6366f1]'
    );

    const dbBox = document.getElementById('node-db');
    if (dbBox) {
      dbBox.classList.add('scanning');
      setTimeout(() => dbBox.classList.remove('scanning'), 600);
    }

    // 2. Trajeto: desce de DB & Outbox diretamente para o Spring Batch (Leitura Paginada / Partition Pruning)
    await p.moveTo('node-batch', 650);

    const batchBox = document.getElementById('node-batch');
    if (batchBox) batchBox.classList.add('node-active-batch');

    p.setType('bg-yellow-400 text-yellow-400');
    await sleep(400);

    if (batchBox) batchBox.classList.remove('node-active-batch');

    // 3. Bifurcação de Saída no Spring Batch:
    // Frente A: Sobe para VisaNet (Envio TC50 Base II via SFTP)
    const tc50Particle = createParticle('node-batch', 'bg-blue-400 text-blue-400');
    tc50Particle.moveBottomElbowTo('node-visanet', 1100).then(async () => {
      const visaNetBox = document.getElementById('node-visanet');
      if (visaNetBox) visaNetBox.classList.add('node-active-blue');
      await sleep(400);
      if (visaNetBox) visaNetBox.classList.remove('node-active-blue');
      tc50Particle.destroy();
    });

    // Frente B: Segue para Payout & Ledger (Crédito / Débito Double-Entry)
    p.setType('bg-green-400 text-green-400');
    await p.moveTo('node-payout', 650);

    const payoutBox = document.getElementById('node-payout');
    if (payoutBox) payoutBox.classList.add('node-active-engine');
    p.setType('bg-emerald-400 text-emerald-400');
    await sleep(450);
    if (payoutBox) payoutBox.classList.remove('node-active-engine');

    p.destroy();
  }, [createParticle, updateMetrics]);

  const runBatch = useCallback(() => {
    if (!chaosRef.current.db) {
      addLog(
        '[ERROR] Spring Batch (Cut-Off): PostgreSQL Core offline! Impossível executar leitura paginada.',
        'error'
      );
      return;
    }

    // Se o usuário clicar em Rodar Batch sem transações prévias, simula um lote de 3 registros da partição diária D-1
    let count = metricsRef.current.partitionCount;
    if (count === 0) {
      count = 3;
      metricsRef.current.partitionCount = count;
      updateMetrics();
      addLog(
        '[INFO] Spring Batch (Cut-Off): Carregando partição diária (p_transactions_d_minus_1) com 3 registros no PostgreSQL Core...'
      );
    }

    addLog(
      `[INFO] Spring Batch: Executando Leitura Paginada com Partition Pruning no PostgreSQL Core (${count} registro(s))...`,
      'live'
    );

    const dbBox = document.getElementById('node-db');
    if (dbBox) {
      dbBox.classList.add('node-active-db-pulse');
    }

    const clockIcon = document.getElementById('batch-clock-icon');
    if (clockIcon) {
      clockIcon.classList.remove('text-gray-600');
      clockIcon.classList.add('text-yellow-400', 'fa-spin');
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        simulateBatchAnimation();
      }, i * 750);
    }

    const readDuration = (count - 1) * 750 + 700;
    const totalDuration = (count - 1) * 750 + 2800;

    setTimeout(() => {
      if (dbBox) {
        dbBox.classList.remove('node-active-db-pulse');
      }
    }, readDuration);

    setTimeout(() => {
      if (clockIcon) {
        clockIcon.classList.remove('text-yellow-400', 'fa-spin');
        clockIcon.classList.add('text-gray-600');
      }
      addLog(
        `[INFO] Cut-Off Concluído: ${count} liquidação(ões) escrituradas em Partidas Dobradas (Payout & Ledger) e arquivo TC50 (Base II) transmitido à VisaNet.`,
        'live'
      );
    }, totalDuration);
  }, [addLog, simulateBatchAnimation, updateMetrics]);

  const routeTelemetryEvent = useCallback(
    (event) => {
      let transactionId = 'N/A';
      let amount = 0;
      let stepName = '';
      let isRealBackendEvent = false;

      if (event.transactionId && event.amount) {
        transactionId = String(event.transactionId).substring(0, 8);
        amount = parseFloat(event.amount);
        stepName = event.step || event.status || 'EVENT';
        isRealBackendEvent = true;
      } else if (event.serviceName && event.payload) {
        transactionId = event.payload.transactionId || 'N/A';
        amount = parseFloat(event.payload.amount || 0);
        stepName = event.action || 'EVENT';
      } else {
        addLog('[DEBUG] Evento descartado: Formato desconhecido.', 'error');
        return;
      }

      const logPrefix = isRealBackendEvent ? '[REAL-BACKEND]' : `[${event.serviceName || 'SIM'}]`;
      addLog(`${logPrefix} ${stepName} - TX: ${transactionId} (R$ ${amount.toFixed(2)})`, 'live');

      if (transactionId === 'TX-RELAY') {
        return;
      }

      metricsRef.current.lastEvent = transactionId;
      metricsRef.current.totalVolume += amount;
      updateMetrics();

      if (processedTxIdsRef.current.has(transactionId)) {
        return;
      }

      processedTxIdsRef.current.add(transactionId);

      simulateAuthFlowAnimation();
      setTimeout(() => simulateRelayAnimation(), 3200);
      setTimeout(() => simulateListenerAnimation(), 6400);
    },
    [addLog, simulateAuthFlowAnimation, simulateListenerAnimation, simulateRelayAnimation, updateMetrics]
  );

  const simulateLocalTest = useCallback(() => {
    const amount = (Math.random() * 500 + 10).toFixed(2);
    const txId = 'TX-' + Math.floor(Math.random() * 900000 + 100000);

    routeTelemetryEvent({
      serviceName: 'orionpay-merchant-service',
      action: 'TRANSACTION_AUTHORIZED',
      payload: { transactionId: txId, amount },
    });

    setTimeout(() => {
      routeTelemetryEvent({
        serviceName: 'OUTBOX-RELAY',
        action: 'EVENT_PUBLISHED',
        payload: { transactionId: 'TX-RELAY', amount },
      });
    }, 3500);
  }, [routeTelemetryEvent]);

  const toggleChaos = useCallback(
    (key) => {
      const nextState = !chaosRef.current[key];
      chaosRef.current[key] = nextState;
      setUiChaos({ ...chaosRef.current });

      if (nextState) {
        addLog(`[SYSTEM] Serviço ${key.toUpperCase()} restaurado.`, 'info');
        if ((key === 'rmq' || key === 'relay') && chaosRef.current.relay && chaosRef.current.rmq) {
          const stuck = metricsRef.current.dbQueue;
          if (stuck > 0) {
            addLog(
              `[SYSTEM] Outbox Recovery: Drenando ${stuck} evento(s) retido(s) no PostgreSQL para o RabbitMQ...`,
              'live'
            );
            for (let i = 0; i < stuck; i++) {
              setTimeout(() => {
                simulateRelayAnimation();
                setTimeout(() => simulateListenerAnimation(), 3200);
              }, i * 950);
            }
          }
        }
      } else {
        addLog(`[SYSTEM] CHAOS: Serviço ${key.toUpperCase()} derrubado!`, 'error');
      }
    },
    [addLog, simulateListenerAnimation, simulateRelayAnimation]
  );

  const resetAllMetrics = useCallback(() => {
    metricsRef.current = {
      pdvCount: 0,
      dbQueue: 0,
      rmqQueue: 0,
      partitionCount: 0,
      totalVolume: 0,
      lastEvent: '',
    };
    chaosRef.current = { gw: true, db: true, relay: true, rmq: true };
    processedTxIdsRef.current.clear();
    setUiMetrics({ ...metricsRef.current });
    setUiChaos({ ...chaosRef.current });
    if (particlesContainerRef.current) {
      particlesContainerRef.current.innerHTML = '';
    }
    const dbBox = document.getElementById('node-db');
    if (dbBox) dbBox.classList.remove('node-active-db-pulse', 'scanning');
    const rmqClock = document.getElementById('rmq-clock-icon');
    if (rmqClock) rmqClock.classList.remove('spin-waiting', 'fa-spin');
    const mdrIcon = document.getElementById('mdr-engine-icon');
    if (mdrIcon) mdrIcon.classList.remove('spin-calculating', 'fa-spin');
    const batchClock = document.getElementById('batch-clock-icon');
    if (batchClock) {
      batchClock.classList.remove('text-yellow-400', 'fa-spin');
      batchClock.classList.add('text-gray-600');
    }
    addLog('[SYSTEM] Simulador resetado. Contadores zerados e todos os serviços ONLINE.', 'info');
  }, [addLog]);

  return (
    <section id="simulator" className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Portfolio Header & Simulation Disclaimer */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold tracking-wide shadow-sm">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isPt
              ? 'SIMULAÇÃO · DADOS SINTÉTICOS · SEM REDES DE PAGAMENTO REAIS'
              : 'SIMULATION · SYNTHETIC DATA · NO LIVE PAYMENT NETWORKS'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Payment Systems Lab
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          {isPt
            ? 'Explore autorização de pagamentos, idempotência transacional, o padrão Transactional Outbox, recuperação de mensageria e clearing em lote por meio de simulações determinísticas.'
            : 'Explore payment authorization, transaction idempotency, the Transactional Outbox pattern, message recovery, and batch clearing through deterministic simulations.'}
        </p>
      </div>

      {/* ORIONPAY DATADOG LIVE APM & TRANSACTIONAL OUTBOX SIMULATOR (M3 Dark & Light Elevated Surface) */}
      <div
        id="orionpay-datadog-wrapper"
        className="rounded-[28px] border border-[#384152] bg-[#151B28] text-white shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
      >
        {/* OrionPay Datadog Header (M3 Surface Container) */}
        <header className="bg-[#1A2130] border-b border-[#384152] p-4 sm:px-6 shrink-0 shadow-md z-20 relative transition-colors duration-300">
          <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_4px_16px_rgba(99,102,241,0.4)] flex items-center justify-center">
                <i className="fa-solid fa-network-wired text-white text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 tracking-wide">
                    OrionPay Datadog
                  </h2>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-indigo-200 font-semibold">
                    OrionPay Switch Lab
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center mt-0.5">
                  Transactional Outbox &amp; Range Partitioning <span className="mx-2">|</span>
                  <div
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      wsConnected
                        ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]'
                        : 'bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,1)]'
                    }`}
                  ></div>
                  <span className="text-cyan-300 text-[10px] font-semibold">
                    {wsConnected ? 'WS CONNECTED' : 'LOCAL SIMULATION READY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chaos Engineering Quick Toggles (M3 Filter Chips) */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#111622] px-3.5 py-2 rounded-2xl border border-[#384152]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 mr-1 flex items-center gap-1">
                <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
                Chaos:
              </span>
              <button
                type="button"
                onClick={() => toggleChaos('gw')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  uiChaos.gw
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                }`}
                title={isPt ? 'Derrubar / Restaurar Switch Adq (C++)' : 'Toggle Switch Adq (C++) UP/DOWN'}
              >
                Switch C++: {uiChaos.gw ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => toggleChaos('db')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  uiChaos.db
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                }`}
                title={isPt ? 'Derrubar / Restaurar PostgreSQL Core' : 'Toggle PostgreSQL Core UP/DOWN'}
              >
                DB Core: {uiChaos.db ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => toggleChaos('relay')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  uiChaos.relay
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                }`}
                title={isPt ? 'Derrubar / Restaurar Outbox Relay' : 'Toggle Outbox Relay UP/DOWN'}
              >
                Relay: {uiChaos.relay ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => toggleChaos('rmq')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  uiChaos.rmq
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                }`}
                title={
                  isPt
                    ? 'Derrubar / Restaurar RabbitMQ (Testar retenção Outbox no BD)'
                    : 'Toggle RabbitMQ UP/DOWN (Test Outbox DB retention)'
                }
              >
                RabbitMQ: {uiChaos.rmq ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:space-x-4">
              {/* Metrics (M3 Surface Container High Cards) */}
              <div className="flex flex-wrap gap-2 sm:space-x-2.5">
                <div className="bg-[#232B3D] rounded-2xl px-3 py-2 border border-[#384152] min-w-[92px] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-slate-300 uppercase font-medium">
                    {isPt ? 'Transações Live' : 'Live Tx'}
                  </span>
                  <span className="text-lg font-bold text-cyan-300">{uiMetrics.pdvCount}</span>
                </div>
                <div className="bg-[#232B3D] rounded-2xl px-3 py-2 border border-[#384152] min-w-[104px] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-slate-300 uppercase font-medium">Volume (R$)</span>
                  <span className="text-lg font-bold text-emerald-300">
                    {uiMetrics.totalVolume.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="bg-[#232B3D] rounded-2xl px-3 py-2 border border-red-500/40 min-w-[92px] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-slate-300 uppercase text-center leading-tight font-medium">
                    {isPt ? 'Presos no DB' : 'Stuck in DB'}
                  </span>
                  <span className="text-lg font-bold text-red-400">{uiMetrics.dbQueue}</span>
                </div>
                <div className="bg-[#232B3D] rounded-2xl px-3 py-2 border border-[#384152] min-w-[92px] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] text-slate-300 uppercase font-medium">
                    {isPt ? 'Fila RMQ' : 'RMQ Queue'}
                  </span>
                  <span className="text-lg font-bold text-orange-300">{uiMetrics.rmqQueue}</span>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-[#384152]" />

              {/* Action Buttons (M3 Filled Tonal Pill Buttons & Icon Buttons) */}
              <div className="flex items-center gap-2">
                {/* Simular Local */}
                <button
                  type="button"
                  onClick={simulateLocalTest}
                  className="px-4 h-10 rounded-full border border-cyan-400/50 bg-cyan-950/60 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/70 hover:border-cyan-300 flex items-center gap-2 justify-center transition-all active:scale-95 text-xs font-mono font-bold shadow-sm"
                  title={isPt ? 'Simular Transação em Tempo Real (Caminho Quente & Morno)' : 'Simulate Real-Time Transaction (Hot & Warm Path)'}
                >
                  <i className="fa-solid fa-rocket text-sm"></i>
                  <span className="hidden xl:inline">{isPt ? 'Simular Transação' : 'Simulate Tx'}</span>
                </button>

                {/* Rodar Batch (Fase 3 - Cold Path) */}
                <button
                  type="button"
                  onClick={runBatch}
                  className="px-4 h-10 rounded-full border border-amber-400/50 bg-amber-950/60 text-amber-300 hover:text-amber-100 hover:bg-amber-900/70 hover:border-amber-300 flex items-center gap-2 justify-center transition-all active:scale-95 text-xs font-mono font-bold shadow-sm"
                  title={isPt ? 'Simular Liquidação Batch (Cut-Off / Partition Pruning)' : 'Simulate Batch Settlement (Cut-Off / Partition Pruning)'}
                >
                  <i className="fa-solid fa-business-time text-sm"></i>
                  <span className="hidden xl:inline">{isPt ? 'Simular Liquidação Batch' : 'Run Batch'}</span>
                </button>

                {/* Resetar */}
                <button
                  type="button"
                  onClick={resetAllMetrics}
                  className="w-10 h-10 rounded-full border border-[#384152] bg-[#232B3D] text-slate-300 hover:text-white hover:bg-[#2E374D] flex items-center justify-center transition-all active:scale-95"
                  title={isPt ? 'Resetar Simulador' : 'Reset Simulator'}
                >
                  <i className="fa-solid fa-rotate-left text-sm"></i>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-10 h-10 rounded-full border border-[#384152] bg-[#232B3D] text-slate-300 hover:text-white hover:bg-[#2E374D] hover:border-indigo-400/60 flex items-center justify-center transition-all active:scale-95"
                  title={isPt ? 'Configurações de Conexão' : 'Connection Settings'}
                >
                  <i className="fa-solid fa-gear text-sm"></i>
                </button>

                {/* Toggle Terminal */}
                <button
                  type="button"
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`w-10 h-10 rounded-full border border-[#384152] ${
                    isTerminalOpen
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#232B3D] text-slate-300 hover:text-white hover:bg-[#2E374D]'
                  } flex items-center justify-center transition-all active:scale-95`}
                  title={isPt ? 'Ver Logs / Terminal' : 'Toggle Logs / Terminal'}
                >
                  <i className="fa-solid fa-terminal text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={() => {
            window.location.reload();
          }}
        />

        {/* Interactive Architecture Canvas (4-row x 5-col clean layout without legacy TC57 node) */}
        <div className="relative w-full overflow-x-auto sim-canvas-surface transition-colors duration-300">
          <div
            ref={canvasRef}
            className="relative min-w-[980px] min-h-[720px] w-full h-full pr-12"
          >
            {/* Phase 1 Header Badge (Positioned cleanly above SoftPOS in Column 1, never overlapping any node) */}
            <div className="absolute left-8 top-[140px] z-10 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2130]/90 border border-[#384152] text-[11px] font-bold text-slate-300 uppercase tracking-wider shadow-sm">
                <i className="fa-solid fa-bolt text-cyan-400"></i>
                <span>
                  {isPt ? 'Fase 1: Autorização (Síncrona)' : 'Phase 1: Authorization (Synchronous)'}
                </span>
              </div>
            </div>

            {/* Phase Divider 1: Between Fase 1 (Row 2) and Fase 2 (Row 3) */}
            <div className="absolute inset-x-0 top-[324px] border-b-2 border-dashed border-[#384152] w-full z-0 pointer-events-none">
              <div className="absolute left-8 top-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2130]/90 border border-[#384152] text-[11px] font-bold text-slate-300 uppercase tracking-wider shadow-sm">
                <i className="fa-solid fa-network-wired text-purple-400"></i>
                <span>
                  {isPt ? 'Fase 2: Mensageria (Assíncrona)' : 'Phase 2: Messaging (Asynchronous)'}
                </span>
              </div>
            </div>

            {/* Phase Divider 2: Between Fase 2 (Row 3) and Fase 3 (Row 4) */}
            <div className="absolute inset-x-0 top-[520px] border-b-2 border-dashed border-[#384152] w-full z-0 pointer-events-none">
              <div className="absolute left-8 top-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2130]/90 border border-[#384152] text-[11px] font-bold text-slate-300 uppercase tracking-wider shadow-sm">
                <i className="fa-solid fa-clock text-blue-400"></i>
                <span>
                  {isPt ? 'Fase 3: Liquidação (Cold Path)' : 'Phase 3: Settlement (Cold Path)'}
                </span>
              </div>
            </div>

            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            ></svg>
            <div
              ref={particlesContainerRef}
              className="absolute inset-0 pointer-events-none z-50"
            ></div>

            <div className="grid grid-cols-5 gap-6 w-full max-w-7xl mx-auto h-full pt-8 pb-24 relative z-10 items-center justify-items-center">
              {/* Row 1: Crypto Vault */}
              <div className="col-start-3 row-start-1 mb-10">
                <SoftHSM subtitle={isPt ? 'Cofre Criptográfico' : 'Crypto Vault'} />
              </div>

              {/* Row 2: Hot Path (Fase 1) */}
              <div className="col-start-1 row-start-2">
                <SoftPOS subtitle={isPt ? 'App Lojista' : 'Merchant App'} />
              </div>
              <div className="col-start-2 row-start-2">
                <MerchantService subtitle={isPt ? 'API Orquestradora' : 'Orchestrator API'} />
              </div>
              <div
                onClick={() => toggleChaos('gw')}
                title={isPt ? 'Clique para alternar Switch Adq (ON/OFF)' : 'Click to toggle Switch Adq (ON/OFF)'}
                className={`col-start-3 row-start-2 transition-all duration-300 cursor-pointer ${
                  !uiChaos.gw ? 'opacity-50 grayscale' : ''
                }`}
              >
                <SwitchAdq subtitle={isPt ? 'Maestro Central' : 'Central Switch'} />
              </div>
              <div className="col-start-4 row-start-2">
                <GatewayVisa subtitle={isPt ? 'Conector Bandeira' : 'Scheme Connector'} />
              </div>
              <div className="col-start-5 row-start-2">
                <VisaNet subtitle={isPt ? 'Rede Externa' : 'External Network'} />
              </div>

              {/* Row 3: Warm / Event Path (Fase 2) */}
              <div
                onClick={() => toggleChaos('db')}
                title={isPt ? 'Clique para alternar PostgreSQL Core (ON/OFF)' : 'Click to toggle PostgreSQL Core (ON/OFF)'}
                className={`col-start-2 row-start-3 mt-14 transition-all duration-300 cursor-pointer ${
                  !uiChaos.db ? 'opacity-50 grayscale' : ''
                }`}
              >
                <PostgreSQL
                  queueCount={uiMetrics.dbQueue}
                  partitionCount={uiMetrics.partitionCount}
                  subtitle="PostgreSQL Core"
                />
              </div>
              <div
                onClick={() => toggleChaos('relay')}
                title={isPt ? 'Clique para alternar Outbox Relay (ON/OFF)' : 'Click to toggle Outbox Relay (ON/OFF)'}
                className={`col-start-3 row-start-3 mt-14 transition-all duration-300 cursor-pointer ${
                  !uiChaos.relay ? 'opacity-50 grayscale' : ''
                }`}
              >
                <OutboxRelay subtitle="Debezium / Worker" />
              </div>
              <div
                onClick={() => toggleChaos('rmq')}
                title={isPt ? 'Clique para alternar RabbitMQ (ON/OFF)' : 'Click to toggle RabbitMQ (ON/OFF)'}
                className={`col-start-4 row-start-3 mt-14 transition-all duration-300 cursor-pointer ${
                  !uiChaos.rmq ? 'opacity-50 grayscale' : ''
                }`}
              >
                <RabbitMQ
                  queueCount={uiMetrics.rmqQueue}
                  subtitle={isPt ? 'Fila de Eventos' : 'Event Queue'}
                />
              </div>
              <div className="col-start-5 row-start-3 mt-14">
                <Settlement subtitle={isPt ? 'Cálculo Real-Time' : 'Real-Time MDR'} />
              </div>

              {/* Row 4: Cold Path / Batch Path (Fase 3) - Directly aligned below DB & Outbox */}
              <div className="col-start-2 row-start-4 mt-24">
                <Reconciliation subtitle={isPt ? 'Job Noturno (Recon)' : 'Nightly Job (Recon)'} />
              </div>
              <div className="col-start-4 row-start-4 mt-24">
                <Payout subtitle={isPt ? 'Liquidação Financeira' : 'Financial Settlement'} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal Logs */}
        {isTerminalOpen && <SimulatorTerminal logs={logs} />}
      </div>
    </section>
  );
}
