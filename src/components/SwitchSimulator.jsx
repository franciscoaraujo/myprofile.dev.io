'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Info, FileCheck2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

import SoftPOS from './nodes/SoftPOS';
import MerchantService from './nodes/MerchantService';
import GatewayVisa from './nodes/GatewayVisa';
import SwitchAdq from './nodes/SwitchAdq';
import SoftHSM from './nodes/SoftHSM';
import VisaNet from './nodes/VisaNet';
import NetworkLog from './nodes/NetworkLog';
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
  const { lang } = useApp();
  const isPt = lang === 'pt';

  const [wsConnected, setWsConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const metricsRef = useRef({
    pdvCount: 0,
    dbQueue: 0,
    rmqQueue: 0,
    logQueue: 0,
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
    addLog(
      isPt
        ? '[SYSTEM] OrionPay Switch Lab inicializado em modo Simulação Determinística Local.'
        : '[SYSTEM] OrionPay Switch Lab initialized in Local Deterministic Simulation mode.',
      'info'
    );
    addLog(
      isPt
        ? '[INFO] Clique no botão 🚀 (Simular Transação Local) para disparar o fluxo ISO 8583 + Outbox ou em 💼 (Batch) para liquidar o TC57/TC50.'
        : '[INFO] Click the 🚀 button (Simulate Local Transaction) to fire the ISO 8583 + Outbox flow or 💼 (Batch) to settle TC57/TC50.',
      'info'
    );
  }, [addLog, isPt]);

  // --- SVG Drawing (Exact port from orionpay-datadog) ---
  const drawLine = useCallback((id1, id2, dashed = false, arrow = true, twoWay = false) => {
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
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#374151" stroke-width="2" ${dash} ${markerEnd} ${markerStart} />`;
  }, []);

  const drawElbowLine = useCallback((id1, id2, dashed = false, offsetY = 70, label = '') => {
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
    const x2 = cx2;
    const y2 = cy2 + r2.height / 2 + 5;
    const yMid = cy1 + offsetY;

    const dash = dashed ? 'stroke-dasharray="6 6"' : '';
    const d = `M ${x1} ${y1} L ${x1} ${yMid} L ${x2} ${yMid} L ${x2} ${y2}`;

    let labelSvg = '';
    if (label) {
      const midX = (x1 + x2) / 2;
      labelSvg = `
        <rect x="${midX - 45}" y="${yMid - 10}" width="90" height="20" fill="#111827" />
        <text x="${midX}" y="${yMid + 4}" fill="#9CA3AF" font-size="12" text-anchor="middle" font-weight="bold">${label}</text>`;
    }

    return `<path d="${d}" stroke="#374151" stroke-width="2" fill="none" ${dash} marker-end="url(#arrowhead)" />${labelSvg}`;
  }, []);

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
    const x2 = cx2;
    const y2 = cy2 + r2.height / 2 + 5;

    const yMid = cy1 + 70;
    const d = `M ${x1} ${y1} L ${x1} ${yMid} L ${x2} ${yMid} L ${x2} ${y2}`;

    let labelSvg = '';
    if (label) {
      const midX = (x1 + x2) / 2;
      labelSvg = `
        <rect x="${midX - 45}" y="${yMid - 10}" width="90" height="20" fill="#111827" />
        <text x="${midX}" y="${yMid + 4}" fill="#9CA3AF" font-size="12" text-anchor="middle" font-weight="bold">${label}</text>`;
    }

    return `<path d="${d}" stroke="#374151" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />${labelSvg}`;
  }, []);

  const renderLines = useCallback(() => {
    if (!svgRef.current) return;
    svgRef.current.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
        <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
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
      ${drawElbowLine('node-listener', 'node-db', true, 70)}
      
      ${drawLine('node-switch', 'node-network-log', false, true)}
      ${drawLine('node-network-log', 'node-batch', false, true)}
      ${drawLine('node-batch', 'node-payout', false, true)}
      ${drawBottomElbowLine('node-batch', 'node-visanet', isPt ? 'Envio TC50' : 'TC50 Send')}
    `;
  }, [drawLine, drawElbowLine, drawBottomElbowLine, isPt]);

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

  // --- Particle Engine (Exact port from orionpay-datadog) ---
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
      async moveBottomElbowTo(nodeId, duration = 1000) {
        const targetNode = document.getElementById(nodeId);
        const canvas = canvasRef.current;
        if (!targetNode || !canvas) return;

        const startX = parseFloat(el.style.left || '0');
        const startY = parseFloat(el.style.top || '0');

        const r = targetNode.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();
        const targetX = r.left - cRect.left + canvas.scrollLeft + r.width / 2;
        const targetY = r.top - cRect.top + canvas.scrollTop + r.height / 2;

        const yMid = startY + 70;

        void el.offsetWidth;

        // Segment 1: Down to elbow
        const dur1 = duration * 0.25;
        el.style.transition = `left ${dur1}ms linear, top ${dur1}ms linear`;
        el.style.top = `${yMid}px`;
        await sleep(dur1);

        // Segment 2: Horizontal across
        const dur2 = duration * 0.5;
        el.style.transition = `left ${dur2}ms linear, top ${dur2}ms linear`;
        el.style.left = `${targetX}px`;
        await sleep(dur2);

        // Segment 3: Up to target node
        const dur3 = duration * 0.25;
        el.style.transition = `left ${dur3}ms linear, top ${dur3}ms linear`;
        el.style.top = `${targetY}px`;
        await sleep(dur3);
      },
      setType(newColorClass) {
        el.className = `particle fa-solid fa-file-invoice-dollar ${newColorClass}`;
      },
      destroy() {
        el.remove();
      },
    };
  }, []);

  // --- Animations (Exact port from orionpay-datadog) ---
  const simulateAuthFlowAnimation = useCallback(async () => {
    const softposBox = document.getElementById('node-softpos');
    const merchantBox = document.getElementById('node-merchant');
    const switchBox = document.getElementById('node-switch');
    const softhsmBox = document.getElementById('node-softhsm');
    const gatewayVisaBox = document.getElementById('node-gateway-visa');
    const visaNetBox = document.getElementById('node-visanet');
    const dbBox = document.getElementById('node-db');
    const networkLogBox = document.getElementById('node-network-log');

    // 0. Disparo inicial do PDV
    if (softposBox) softposBox.classList.add('node-active-cyan');
    const p = createParticle('node-softpos', 'bg-cyan-400 text-cyan-400');
    await sleep(300);
    if (softposBox) softposBox.classList.remove('node-active-cyan');

    // 1. Chegada no Orquestrador
    await p.moveTo('node-merchant', 400);
    if (merchantBox) merchantBox.classList.add('node-active-purple');

    // FORK DB (Mensageria Assíncrona Fire-and-Forget)
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
      updateMetrics();

      await sleep(500);
      if (dbBox) dbBox.classList.remove('node-active-db');
      pDb.destroy();
    };
    forkDb();

    await sleep(300);
    if (merchantBox) merchantBox.classList.remove('node-active-purple');

    // 2. Encaminhamento para o Switch Adq
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

    // FORK TC57 (Log de Rede Fire-and-Forget) - Desacoplado do Batch
    const forkLog = async () => {
      const pLog = createParticle('node-switch', 'bg-gray-400 text-gray-400');
      await pLog.moveTo('node-network-log', 500);
      if (networkLogBox) networkLogBox.classList.add('node-active-gray');
      await sleep(300);
      if (networkLogBox) networkLogBox.classList.remove('node-active-gray');
      pLog.destroy();

      metricsRef.current.logQueue++;
      updateMetrics();
    };
    forkLog();

    await sleep(300);

    // 2.1 Tradução de PIN Block no SoftHSM (Desvio síncrono)
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

    // 3. CAMINHO DE RETORNO (Autorização Síncrona)
    p.setType('bg-green-400 text-green-400');

    // Retorno: VisaNet -> Gateway
    await p.moveTo('node-gateway-visa', 300);
    if (gatewayVisaBox) gatewayVisaBox.classList.add('node-active-blue');
    await sleep(200);
    if (gatewayVisaBox) gatewayVisaBox.classList.remove('node-active-blue');

    // Retorno: Gateway -> Switch
    await p.moveTo('node-switch', 300);
    if (switchBox) switchBox.classList.remove('node-active-blue');

    // Retorno: Switch -> Merchant
    await p.moveTo('node-merchant', 400);
    if (merchantBox) merchantBox.classList.add('node-active-purple');
    await sleep(300);
    if (merchantBox) merchantBox.classList.remove('node-active-purple');

    // Retorno: Merchant -> SoftPOS
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
      addLog('[WARN] Outbox Relay Offline: Eventos permanecem retidos com segurança no PostgreSQL (Outbox).', 'warn');
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

    // Verificação de destino (RabbitMQ)
    if (!chaosRef.current.rmq) {
      addLog('[ERROR] Outbox Relay: RabbitMQ indisponível. Revertendo para o banco.', 'error');
      p.setType('bg-red-500 text-red-500');
      await p.moveTo('node-db', 700);

      metricsRef.current.dbQueue++;
      updateMetrics();

      p.destroy();
      return;
    }

    // Entrega com sucesso no RMQ
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

      const dbX = rDb.left - cRect.left + c.scrollLeft + rDb.width / 2;
      const listY = rList.top - cRect.top + c.scrollTop + rList.height / 2;

      p.el.style.transition = 'top 300ms linear';
      p.el.style.top = `${listY + 70}px`;
      await sleep(300);

      p.el.style.transition = 'left 600ms linear';
      p.el.style.left = `${dbX}px`;
      await sleep(600);

      await p.moveTo('node-db', 300);
    } else {
      await p.moveTo('node-db', 900);
    }

    const dbBox = document.getElementById('node-db');
    if (dbBox) dbBox.classList.add('node-active-db');

    await sleep(500);
    if (dbBox) dbBox.classList.remove('node-active-db');

    p.destroy();
  }, [addLog, createParticle, updateMetrics]);

  const simulateBatchAnimation = useCallback(
    async () => {
      if (metricsRef.current.logQueue > 0) {
        metricsRef.current.logQueue--;
        updateMetrics();
      }

      const p = createParticle(
        'node-network-log',
        'bg-yellow-400 text-yellow-400 shadow-[0_0_15px_#facc15]'
      );

      const logBox = document.getElementById('node-network-log');
      if (logBox) logBox.classList.add('node-active-gray');
      await sleep(300);
      if (logBox) logBox.classList.remove('node-active-gray');

      await p.moveTo('node-batch', 600);

      const batchBox = document.getElementById('node-batch');
      if (batchBox) batchBox.classList.add('node-active-batch');

      p.setType('bg-green-400 text-green-400');
      await sleep(400);

      if (batchBox) batchBox.classList.remove('node-active-batch');

      // Fork: One goes to Payout, one goes to VisaNet (Envio TC50)
      const tc50Particle = createParticle('node-batch', 'bg-blue-400 text-blue-400');
      tc50Particle.moveBottomElbowTo('node-visanet', 1000).then(async () => {
        const visaNetBox = document.getElementById('node-visanet');
        if (visaNetBox) visaNetBox.classList.add('node-active-blue');
        await sleep(400);
        if (visaNetBox) visaNetBox.classList.remove('node-active-blue');
        tc50Particle.destroy();
      });

      await p.moveTo('node-payout', 600);

      p.setType('bg-emerald-400 text-emerald-400');
      await sleep(500);
      p.destroy();
    },
    [createParticle, updateMetrics]
  );

  const runBatch = useCallback(() => {
    const count = metricsRef.current.logQueue;

    if (count === 0) {
      addLog('[INFO] Settlement: O Log de Rede (TC57) está vazio. Nenhuma liquidação a processar.');
      return;
    } else {
      addLog(`[INFO] Spring Batch: Extraindo ${count} registros do Log de Rede para liquidação...`);
    }

    const clockIcon = document.getElementById('batch-clock-icon');
    if (clockIcon) {
      clockIcon.classList.remove('text-gray-600');
      clockIcon.classList.add('text-yellow-400', 'fa-spin');
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        simulateBatchAnimation();
      }, i * 700);
    }

    const totalDuration = (count - 1) * 700 + 2700;

    setTimeout(() => {
      if (clockIcon) {
        clockIcon.classList.remove('text-yellow-400', 'fa-spin');
        clockIcon.classList.add('text-gray-600');
      }
      addLog(
        `[INFO] Spring Batch: Lote TC50 enviado à VisaNet e ${count} liquidação(ões) registradas no Payout & Ledger.`,
        'live'
      );
    }, totalDuration);
  }, [addLog, simulateBatchAnimation]);

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
        // Se o Relay e o RabbitMQ estão ativos e existem mensagens presas no DB, drena automaticamente!
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
      logQueue: 0,
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

      {/* ORIONPAY DATADOG LIVE APM & TRANSACTIONAL OUTBOX SIMULATOR (Ported from http://localhost:3002/) */}
      <div
        id="orionpay-datadog-wrapper"
        className="rounded-2xl border border-gray-800 bg-[#030712] text-white shadow-2xl overflow-hidden flex flex-col"
      >
        {/* OrionPay Datadog Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 shrink-0 shadow-lg z-20 relative">
          <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center">
                <i className="fa-solid fa-network-wired text-white"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-wide">
                    OrionPay Datadog
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                    OrionPay Switch Lab
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono flex items-center">
                  Transactional Outbox <span className="mx-2">|</span>
                  <div
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      wsConnected
                        ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]'
                        : 'bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,1)]'
                    }`}
                  ></div>
                  <span className="text-cyan-400 text-[10px]">
                    {wsConnected
                      ? 'WS CONNECTED'
                      : isPt
                      ? 'LOCAL SIMULATION READY'
                      : 'LOCAL SIMULATION READY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Chaos Engineering Quick Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-950/80 px-3 py-1.5 rounded-xl border border-gray-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
                Chaos:
              </span>
              <button
                type="button"
                onClick={() => toggleChaos('gw')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
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
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
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
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
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
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
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
              {/* Metrics */}
              <div className="flex flex-wrap gap-2 sm:space-x-3">
                <div className="bg-gray-800/50 rounded p-2 border border-gray-700 min-w-[90px] flex flex-col items-center justify-center">
                  <span className="text-[9px] text-gray-400 uppercase">
                    {isPt ? 'Transações Live' : 'Live Tx'}
                  </span>
                  <span className="text-lg font-bold text-cyan-400">{uiMetrics.pdvCount}</span>
                </div>
                <div className="bg-gray-800/50 rounded p-2 border border-gray-700 min-w-[100px] flex flex-col items-center justify-center">
                  <span className="text-[9px] text-gray-400 uppercase">Volume (R$)</span>
                  <span className="text-lg font-bold text-green-400">
                    {uiMetrics.totalVolume.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded p-2 border border-red-900/50 min-w-[90px] flex flex-col items-center justify-center">
                  <span className="text-[9px] text-gray-400 uppercase text-center leading-tight">
                    {isPt ? 'Presos no DB' : 'Stuck in DB'}
                  </span>
                  <span className="text-lg font-bold text-red-400">{uiMetrics.dbQueue}</span>
                </div>
                <div className="bg-gray-800/50 rounded p-2 border border-gray-700 min-w-[90px] flex flex-col items-center justify-center">
                  <span className="text-[9px] text-gray-400 uppercase">
                    {isPt ? 'Fila RMQ' : 'RMQ Queue'}
                  </span>
                  <span className="text-lg font-bold text-orange-400">{uiMetrics.rmqQueue}</span>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-800" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Simular Local */}
                <button
                  type="button"
                  onClick={simulateLocalTest}
                  className="px-3 h-10 rounded-lg border border-cyan-500/50 bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/50 hover:border-cyan-400 flex items-center gap-2 justify-center transition-all active:scale-95 text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  title={isPt ? 'Simular Transação Local' : 'Simulate Local Transaction'}
                >
                  <i className="fa-solid fa-rocket text-base"></i>
                  <span className="hidden xl:inline">{isPt ? 'Simular Transação' : 'Simulate Tx'}</span>
                </button>

                {/* Rodar Batch (Fase 3) */}
                <button
                  type="button"
                  onClick={runBatch}
                  className="px-3 h-10 rounded-lg border border-yellow-500/50 bg-yellow-950/30 text-yellow-400 hover:text-yellow-200 hover:bg-yellow-900/40 hover:border-yellow-400 flex items-center gap-2 justify-center transition-all active:scale-95 text-xs font-mono font-bold"
                  title={isPt ? 'Simular Liquidação (Batch / Pull)' : 'Simulate Settlement (Batch / Pull)'}
                >
                  <i className="fa-solid fa-business-time text-base"></i>
                  <span className="hidden xl:inline">{isPt ? 'Rodar Batch' : 'Run Batch'}</span>
                </button>

                {/* Resetar */}
                <button
                  type="button"
                  onClick={resetAllMetrics}
                  className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all active:scale-95"
                  title={isPt ? 'Resetar Simulador' : 'Reset Simulator'}
                >
                  <i className="fa-solid fa-rotate-left text-base"></i>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-indigo-500/50 flex items-center justify-center transition-all active:scale-95"
                  title={isPt ? 'Configurações de Conexão' : 'Connection Settings'}
                >
                  <i className="fa-solid fa-gear text-base"></i>
                </button>

                {/* Toggle Terminal */}
                <button
                  type="button"
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`w-10 h-10 rounded-lg border border-gray-700 ${
                    isTerminalOpen
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  } flex items-center justify-center transition-all active:scale-95`}
                  title={isPt ? 'Ver Logs / Terminal' : 'Toggle Logs / Terminal'}
                >
                  <i className="fa-solid fa-terminal text-base"></i>
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

        {/* Interactive Architecture Canvas (Exact 5-col x 5-row layout from orionpay-datadog) */}
        <div className="relative w-full overflow-x-auto bg-[#030712]">
          <div
            ref={canvasRef}
            className="relative min-w-[960px] min-h-[780px] w-full h-full"
          >
            {/* Phase Dividers */}
            <div className="absolute inset-x-0 top-[26%] border-b-2 border-dashed border-gray-800 w-full z-0">
              <div className="absolute left-10 -top-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <i className="fa-solid fa-bolt text-cyan-500 mr-2"></i>
                {isPt ? 'Fase 1: Autorização (Síncrona)' : 'Phase 1: Authorization (Synchronous)'}
              </div>
            </div>
            <div className="absolute inset-x-0 top-[60%] border-b-2 border-dashed border-gray-800 w-full z-0">
              <div className="absolute left-10 -top-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <i className="fa-solid fa-network-wired text-purple-500 mr-2"></i>
                {isPt ? 'Fase 2: Mensageria (Assíncrona)' : 'Phase 2: Messaging (Asynchronous)'}
              </div>
              <div className="absolute left-10 top-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <i className="fa-solid fa-clock text-blue-500 mr-2"></i>
                {isPt ? 'Fase 3: Liquidação (Batch / Pull)' : 'Phase 3: Settlement (Batch / Pull)'}
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

            <div className="grid grid-cols-5 gap-6 w-full max-w-7xl mx-auto h-full pt-8 pb-28 relative z-10 items-center justify-items-center">
              {/* Row 1: Crypto Vault */}
              <div className="col-start-3 row-start-1 mb-12">
                <SoftHSM subtitle={isPt ? 'Cofre Criptográfico' : 'Crypto Vault'} />
              </div>

              {/* Row 2: Hot Path */}
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

              {/* Row 3: Event Path */}
              <div
                onClick={() => toggleChaos('db')}
                title={isPt ? 'Clique para alternar PostgreSQL Core (ON/OFF)' : 'Click to toggle PostgreSQL Core (ON/OFF)'}
                className={`col-start-2 row-start-3 mt-12 transition-all duration-300 cursor-pointer ${
                  !uiChaos.db ? 'opacity-50 grayscale' : ''
                }`}
              >
                <PostgreSQL
                  queueCount={uiMetrics.dbQueue}
                  subtitle="PostgreSQL Core"
                />
              </div>
              <div
                onClick={() => toggleChaos('relay')}
                title={isPt ? 'Clique para alternar Outbox Relay (ON/OFF)' : 'Click to toggle Outbox Relay (ON/OFF)'}
                className={`col-start-3 row-start-3 mt-12 transition-all duration-300 cursor-pointer ${
                  !uiChaos.relay ? 'opacity-50 grayscale' : ''
                }`}
              >
                <OutboxRelay subtitle="Debezium / Worker" />
              </div>
              <div
                onClick={() => toggleChaos('rmq')}
                title={isPt ? 'Clique para alternar RabbitMQ (ON/OFF)' : 'Click to toggle RabbitMQ (ON/OFF)'}
                className={`col-start-4 row-start-3 mt-12 transition-all duration-300 cursor-pointer ${
                  !uiChaos.rmq ? 'opacity-50 grayscale' : ''
                }`}
              >
                <RabbitMQ
                  queueCount={uiMetrics.rmqQueue}
                  subtitle={isPt ? 'Fila de Eventos' : 'Event Queue'}
                />
              </div>
              <div className="col-start-5 row-start-3 mt-12">
                <Settlement subtitle={isPt ? 'Cálculo Real-Time' : 'Real-Time MDR'} />
              </div>

              {/* Row 4: Log */}
              <div className="col-start-3 row-start-4 mt-8">
                <NetworkLog
                  queueCount={uiMetrics.logQueue}
                  title={isPt ? 'Log de Rede (TC57)' : 'Network Log (TC57)'}
                  subtitle={isPt ? 'Registro Transacional' : 'Transaction Log'}
                />
              </div>

              {/* Row 5: Batch Path */}
              <div className="col-start-3 row-start-5 mt-8">
                <Reconciliation subtitle={isPt ? 'Job Noturno (Recon)' : 'Nightly Job (Recon)'} />
              </div>
              <div className="col-start-4 row-start-5 mt-8">
                <Payout subtitle={isPt ? 'Liquidação Financeira' : 'Financial Settlement'} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal Logs */}
        {isTerminalOpen && <SimulatorTerminal logs={logs} />}
      </div>

      {/* CORE PAYMENT & DISTRIBUTED SYSTEMS CONCEPTS REFERENCE */}
      <div className="mt-8 rounded-2xl border border-[#152342] bg-[#080E1E]/90 p-6 sm:p-8 glass-metal space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#152342] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D47E] font-bold">
              {isPt ? 'Guia de Referência Arquitetural' : 'Architectural Reference Guide'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {isPt
                ? 'Conceitos de Processamento de Pagamentos & Sistemas Distribuídos'
                : 'Payment Processing & Distributed Systems Concepts'}
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono text-cyan-400 hover:text-[#00D47E] transition-colors font-semibold"
          >
            {isPt ? 'Ver Estudos de Caso OrionPay →' : 'View OrionPay Case Studies →'}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-cyan-300">ISO 8583 &amp; MTI / Data Elements</div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  Padrão internacional para mensagens financeiras originadas por cartão. Cada mensagem inicia com um{' '}
                  <strong>Message Type Indicator (MTI)</strong> de 4 dígitos (ex.:{' '}
                  <code className="text-white">0100</code> Requisição de Autorização,{' '}
                  <code className="text-white">0110</code> Resposta de Autorização,{' '}
                  <code className="text-white">0420</code> Desfazimento/Reversal) seguido por um bitmap binário indicando
                  quais <strong>Data Elements (DE)</strong> estão presentes (<code className="text-white">DE3</code>,{' '}
                  <code className="text-white">DE4</code>, <code className="text-white">DE11</code>,{' '}
                  <code className="text-white">DE39</code>, <code className="text-white">DE52</code>).
                </>
              ) : (
                <>
                  International standard for card-originated financial messages. Each message starts with a 4-digit{' '}
                  <strong>Message Type Indicator (MTI)</strong> (e.g., <code className="text-white">0100</code>{' '}
                  Authorization Request, <code className="text-white">0110</code> Authorization Response,{' '}
                  <code className="text-white">0420</code> Reversal Advice) followed by a binary bitmap indicating which{' '}
                  <strong>Data Elements (DE)</strong> are present (<code className="text-white">DE3</code>,{' '}
                  <code className="text-white">DE4</code>, <code className="text-white">DE11</code>,{' '}
                  <code className="text-white">DE39</code>, <code className="text-white">DE52</code>).
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-amber-300">
              {isPt ? 'Idempotência vs. Verificação Visual de Duplicidade' : 'Idempotency vs. Visual Duplicate Check'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  Desabilitar um botão na interface evita apenas cliques duplos acidentais; não impede retentativas de
                  rede quando um socket móvel sofre timeout. A verdadeira <strong>idempotência de backend</strong> impõe
                  unicidade sobre <code className="text-white">Idempotency-Key</code> no PostgreSQL, valida o hash do
                  payload e armazena atomicamente o snapshot da resposta.
                </>
              ) : (
                <>
                  Disabling a submit button in the UI only prevents accidental double clicks; it does not prevent
                  network-level retries when a mobile socket times out. True <strong>backend idempotency</strong>{' '}
                  enforces a unique constraint on <code className="text-white">Idempotency-Key</code> in PostgreSQL,
                  verifies the payload hash, and atomically stores the response snapshot.
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-[#00D47E]">
              {isPt ? 'Padrão Transactional Outbox' : 'Transactional Outbox Pattern'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  Resolve o problema de dual-write entre um banco relacional e um broker de mensageria. Em vez de
                  publicar diretamente no RabbitMQ dentro da thread HTTP, o serviço insere a linha em{' '}
                  <code className="text-white">transactions</code> e o evento em{' '}
                  <code className="text-white">outbox_events</code> na mesma transação local{' '}
                  <code className="text-white">ACID</code> do PostgreSQL.
                </>
              ) : (
                <>
                  Solves the dual-write problem between a relational database and a message broker. Instead of
                  publishing directly to RabbitMQ inside the HTTP thread, the service inserts both the{' '}
                  <code className="text-white">transactions</code> row and an{' '}
                  <code className="text-white">outbox_events</code> row within the same local PostgreSQL{' '}
                  <code className="text-white">ACID</code> transaction.
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-purple-300">
              {isPt ? 'Entrega, Deduplicação no Consumidor & DLQ' : 'Delivery, Consumer Dedup & DLQ'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  Como Outbox + Relay garante entrega <strong>At-Least-Once</strong> (e não <em>Exactly-Once</em>), os
                  consumidores devem deduplicar por <code className="text-white">event_id</code>. Mensagens que falham
                  repetidamente por erros irrecuperáveis são encaminhadas para uma{' '}
                  <strong>Dead-Letter Queue (DLQ)</strong>.
                </>
              ) : (
                <>
                  Because Outbox + Relay guarantees <strong>At-Least-Once</strong> delivery (not <em>Exactly-Once</em>),
                  consumers must deduplicate by <code className="text-white">event_id</code>. Messages failing
                  repeatedly due to unrecoverable errors are routed to a <strong>Dead-Letter Queue (DLQ)</strong>.
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-blue-300">
              {isPt ? 'Modelos de Consistência Transacional' : 'Transactional Consistency Models'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  Combina <strong>consistência ACID local forte</strong> para o registro síncrono da autorização no
                  PostgreSQL com <strong>consistência eventual</strong> para a pré-alocação de liquidação via Outbox
                  Relay, evitando commits distribuídos (2PC) bloqueantes.
                </>
              ) : (
                <>
                  Combines <strong>strong local ACID consistency</strong> for the synchronous authorization record in
                  PostgreSQL with <strong>eventual consistency</strong> for downstream settlement pre-allocation via the
                  Outbox relay, avoiding blocking distributed 2PC.
                </>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
            <div className="font-mono font-bold text-emerald-300">
              {isPt ? 'Autorização vs. Liquidação (Settlement)' : 'Authorization vs. Settlement'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isPt ? (
                <>
                  A <strong>Autorização (Base I / Online)</strong> verifica o saldo e sensibiliza o limite em
                  milissegundos. O <strong>Clearing &amp; Liquidação (Base II / TC50)</strong> ocorre de forma assíncrona
                  após o cut-off diário, calculando tarifas de intercâmbio/MDR e escriturando repasses em partidas
                  dobradas.
                </>
              ) : (
                <>
                  <strong>Authorization (Base I / Online)</strong> verifies cardholder funds and places a hold in
                  milliseconds. <strong>Clearing &amp; Settlement (Base II / TC50 Batch)</strong> occurs asynchronously
                  after daily cut-off, calculating interchange/MDR fees and booking double-entry ledger payouts.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* TECHNICAL EVIDENCE PANEL */}
      <div className="mt-6 rounded-2xl border border-[#152342] bg-[#060B17]/90 p-5 sm:p-6 text-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#00D47E]" />
            <span>
              {isPt
                ? 'Evidências Técnicas, Links de Código & Escopo do Repositório'
                : 'Technical Evidence, Source Links & Repository Scope'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isPt ? 'Verificado em relação ao conteúdo atual do repositório' : 'Verified against current repository contents'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <a
            href="https://github.com/franciscoaraujo/myprofile.dev.io"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] hover:border-[#00D47E]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {isPt ? 'Repositório do Portfólio & Simulador' : 'Portfolio & Simulator Repo'}
              </div>
              <div className="text-white font-bold mt-0.5 group-hover:text-[#00D47E]">
                franciscoaraujo/myprofile.dev.io
              </div>
            </div>
            <div className="text-[10px] text-cyan-400 mt-2">
              {isPt ? 'Ver Repositório no GitHub →' : 'View GitHub Repository →'}
            </div>
          </a>

          <a
            href="https://github.com/franciscoaraujo/myprofile.dev.io/blob/master/src/components/SwitchSimulator.jsx"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] hover:border-[#00D47E]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {isPt ? 'Motor de Simulação & Partículas' : 'Particle & Flow Engine'}
              </div>
              <div className="text-white font-bold mt-0.5 group-hover:text-[#00D47E]">
                src/components/SwitchSimulator.jsx
              </div>
            </div>
            <div className="text-[10px] text-cyan-400 mt-2">
              {isPt ? 'Inspecionar Código do Simulador →' : 'Inspect Simulator Source →'}
            </div>
          </a>

          <a
            href="https://github.com/franciscoaraujo/myprofile.dev.io/blob/master/src/data/portfolio-data.js"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] hover:border-[#00D47E]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {isPt ? 'Dados dos Estudos de Caso de Arquitetura' : 'Architecture Case Study Data'}
              </div>
              <div className="text-white font-bold mt-0.5 group-hover:text-[#00D47E]">src/data/portfolio-data.js</div>
            </div>
            <div className="text-[10px] text-cyan-400 mt-2">
              {isPt ? 'Inspecionar Especificações →' : 'Inspect Architectural Specs →'}
            </div>
          </a>

          <a
            href="https://github.com/franciscoaraujo?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] hover:border-[#00D47E]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {isPt ? 'Perfil GitHub do Autor' : 'Author GitHub Profile'}
              </div>
              <div className="text-white font-bold mt-0.5 group-hover:text-[#00D47E]">github.com/franciscoaraujo</div>
            </div>
            <div className="text-[10px] text-cyan-400 mt-2">
              {isPt ? 'Explorar Repositórios Públicos →' : 'Browse Public Repositories →'}
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
