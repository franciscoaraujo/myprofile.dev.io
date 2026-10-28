'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Info,
  Sliders,
  CheckCircle2,
  CopyCheck,
  RefreshCw,
  Layers,
  Boxes,
  Play,
  StepForward,
  RotateCcw,
  Terminal,
  Zap,
  Smartphone,
  Cpu,
  Shield,
  Server,
  Globe,
  GitMerge,
  Database,
  Truck,
  CornerDownRight,
  Inbox,
  Settings,
  Headphones,
  Clock,
  FileText,
  Landmark,
  ListOrdered,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SwitchSimulator() {
  const { lang } = useApp();
  const isPt = lang === 'pt';
  const initializedRef = useRef(false);

  // Sync window.currentLang and trigger existing deterministic state machine UI updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.currentLang = lang;
      if (typeof window.renderStepCardsList === 'function') window.renderStepCardsList();
      if (typeof window.renderStepInspector === 'function') {
        const idx = typeof window.currentStepIndex === 'number' && window.currentStepIndex >= 0 ? window.currentStepIndex : 0;
        window.renderStepInspector(idx, false);
      }
      if (typeof window.renderSimulatedStorageTables === 'function') window.renderSimulatedStorageTables();
      if (typeof window.updateControlButtonsUI === 'function') window.updateControlButtonsUI();
      if (typeof window.drawArchitectureArrows === 'function') {
        setTimeout(() => window.drawArchitectureArrows(), 120);
      }
    }
  }, [lang]);

  // Initialize simulator when mounting the /simulator route
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.currentLang = lang;

    const boot = () => {
      if (typeof window.initSimulatorLab === 'function') {
        window.initSimulatorLab();
        setTimeout(() => {
          if (typeof window.drawArchitectureArrows === 'function') {
            window.drawArchitectureArrows();
          }
        }, 200);
      }
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      setTimeout(boot, 80);
    }

    const handleResize = () => {
      if (typeof window.drawArchitectureArrows === 'function') {
        window.drawArchitectureArrows();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (typeof window.cancelAllActiveTimers === 'function') {
        window.cancelAllActiveTimers();
      }
    };
  }, []);

  return (
    <section id="simulator" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        {/* Required Transparency & Simulation Scope Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold tracking-wide shadow-sm">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isPt
              ? 'SIMULAÇÃO · DADOS SINTÉTICOS · SEM REDES DE PAGAMENTO REAIS'
              : 'SIMULATION · SYNTHETIC DATA · NO LIVE PAYMENT NETWORKS'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Payment Systems Lab
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          {isPt
            ? 'Explore autorização de pagamentos, idempotência transacional, o padrão Transactional Outbox, recuperação de mensageria e clearing em lote por meio de simulações determinísticas.'
            : 'Explore payment authorization, transaction idempotency, the Transactional Outbox pattern, message recovery, and batch clearing through deterministic simulations.'}
        </p>
        <p className="text-xs font-mono text-slate-400 bg-[#080E1E]/90 border border-[#152342] p-3 rounded-xl max-w-2xl mx-auto leading-relaxed">
          <strong className="text-slate-200">
            {isPt ? 'Escopo da Simulação:' : 'Simulation Scope:'}
          </strong>{' '}
          {isPt ? (
            <>
              Todos os cenários são executados localmente em uma máquina de estados determinística no navegador (
              <code className="text-cyan-300">simulator.js</code>) utilizando payloads sintéticos. Nenhum servidor
              externo, rede de bandeira real ou transação financeira de produção está envolvido.
            </>
          ) : (
            <>
              All scenarios execute locally in a deterministic client-side browser state machine (
              <code className="text-cyan-300">simulator.js</code>) using synthetic payloads. No external servers, live
              card networks, or real financial transactions are involved.
            </>
          )}
        </p>
      </div>

      {/* SCENARIO SELECTOR TABS */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00D47E]" />
            <span>
              {isPt
                ? 'Selecione o Cenário de Engenharia (Clique em um cenário e depois em Executar ou Avançar Etapa):'
                : 'Select Engineering Scenario (Click a scenario, then Run or Step Forward):'}
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {isPt
              ? 'Dica: Clique em qualquer nó da arquitetura ou card de etapa para inspecionar sua justificativa técnica'
              : 'Tip: Click any architecture node or stage card to inspect its technical rationale'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3" role="tablist" aria-label="Simulation Scenarios">
          <button
            type="button"
            role="tab"
            aria-selected="true"
            data-scenario="scenario-a"
            onClick={() => typeof window.selectScenario === 'function' && window.selectScenario('scenario-a', false)}
            className="sim-scenario-btn text-left p-3.5 rounded-xl border border-[#00D47E] bg-[#081229] text-white shadow-lg transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-[#00D47E] border border-[#00D47E]/40">
                {isPt ? 'Cenário A' : 'Scenario A'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#00D47E]" />
            </div>
            <div className="text-xs font-bold pt-1">
              {isPt ? 'Autorização Aprovada' : 'Approved Authorization'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isPt
                ? 'ISO 8583 0100→0110, commit atômico BD + Outbox e consumidor assíncrono.'
                : 'ISO 8583 0100→0110, atomic DB + Outbox commit & async consumer.'}
            </p>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected="false"
            data-scenario="scenario-b"
            onClick={() => typeof window.selectScenario === 'function' && window.selectScenario('scenario-b', false)}
            className="sim-scenario-btn text-left p-3.5 rounded-xl border border-[#152342] bg-[#040816]/80 text-slate-300 hover:border-amber-400/50 transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                {isPt ? 'Cenário B' : 'Scenario B'}
              </span>
              <CopyCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs font-bold pt-1">
              {isPt ? 'Requisição Duplicada (Idempotência)' : 'Duplicate Request (Idempotency)'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isPt
                ? 'Retentativa do cliente com mesma Idempotency-Key e reuso da resposta salva.'
                : 'Client retry with same Idempotency-Key & cached response replay.'}
            </p>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected="false"
            data-scenario="scenario-c"
            onClick={() => typeof window.selectScenario === 'function' && window.selectScenario('scenario-c', false)}
            className="sim-scenario-btn text-left p-3.5 rounded-xl border border-[#152342] bg-[#040816]/80 text-slate-300 hover:border-red-400/50 transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                {isPt ? 'Cenário C' : 'Scenario C'}
              </span>
              <RefreshCw className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xs font-bold pt-1">
              {isPt ? 'Falha e Recuperação da Mensageria' : 'Broker Failure & Recovery'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isPt
                ? 'Queda do RabbitMQ, Outbox PENDING_RETRY, backoff e deduplicação no consumidor.'
                : 'RabbitMQ outage, Outbox PENDING_RETRY, backoff & consumer dedup.'}
            </p>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected="false"
            data-scenario="scenario-d"
            onClick={() => typeof window.selectScenario === 'function' && window.selectScenario('scenario-d', false)}
            className="sim-scenario-btn text-left p-3.5 rounded-xl border border-[#152342] bg-[#040816]/80 text-slate-300 hover:border-cyan-400/50 transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-500/40">
                {isPt ? 'Cenário D' : 'Scenario D'}
              </span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs font-bold pt-1">
              {isPt ? 'Clearing em Lote (Base II / TC50)' : 'Batch Clearing (Base II / TC50)'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isPt
                ? 'Cut-off diário, chunks no Spring Batch e livro-razão de partidas dobradas.'
                : 'End-of-day cut-off, Spring Batch chunks & double-entry ledger.'}
            </p>
          </button>
        </div>
      </div>

      {/* ORIONPAY SWITCH LAB / ARCHITECTURAL PIPELINE SIMULATOR */}
      <div
        id="arch-canvas-container"
        className="relative rounded-2xl border border-[#152342] bg-[#040816] shadow-2xl overflow-hidden glass-metal"
      >
        {/* Top Control Bar */}
        <div className="px-4 py-2.5 bg-[#060B1C] border-b border-[#152342] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
                OrionPay Switch Lab
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                  {isPt ? 'Máquina de Estados Determinística' : 'Deterministic State Machine'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-1.5">
                <span>{isPt ? 'Execução Local no Navegador' : 'Local Browser Runtime'}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{' '}
                  {isPt ? 'PAYLOADS SINTÉTICOS (SEM REDE EXTERNA)' : 'SYNTHETIC PAYLOADS (NO LIVE NETWORK)'}
                </span>
              </div>
            </div>
          </div>

          {/* Session State Counters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-[#030610] border border-[#152342] text-center min-w-[78px]">
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">
                {isPt ? 'Tx Aprovadas (Sim)' : 'Sim Approved Tx'}
              </div>
              <div id="stat-live-tx" className="text-xs font-bold text-cyan-400">
                0
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#030610] border border-[#152342] text-center min-w-[86px]">
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">
                {isPt ? 'Volume Sintético (BRL)' : 'Synthetic (BRL)'}
              </div>
              <div id="stat-volume" className="text-xs font-bold text-[#00D47E]">
                0.00
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#030610] border border-[#152342] text-center min-w-[78px]">
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">
                {isPt ? 'Outbox Pendente' : 'Outbox Pending'}
              </div>
              <div id="stat-db-stuck" className="text-xs font-bold text-red-400">
                0
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#030610] border border-[#152342] text-center min-w-[78px]">
              <div className="text-[8px] text-slate-400 uppercase tracking-wider">
                {isPt ? 'Fila do Broker' : 'Broker Queue'}
              </div>
              <div id="stat-rmq-queue" className="text-xs font-bold text-amber-400">
                0
              </div>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="btn-fire-tx"
              onClick={() => typeof window.runSelectedScenario === 'function' && window.runSelectedScenario()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPt ? 'Executar Cenário' : 'Run Scenario'}</span>
            </button>
            <button
              type="button"
              id="btn-step-tx"
              onClick={() => typeof window.stepScenarioForward === 'function' && window.stepScenarioForward()}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span className="step-btn-label">{isPt ? 'Avançar Etapa' : 'Step Forward'}</span>
            </button>
            <button
              type="button"
              id="btn-reset-tx"
              onClick={() => typeof window.resetSimulationStats === 'function' && window.resetSimulationStats()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:text-white flex items-center gap-1.5 text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isPt ? 'Resetar' : 'Reset'}</span>
            </button>
            <button
              type="button"
              onClick={() => typeof window.toggleTerminalView === 'function' && window.toggleTerminalView()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:text-white flex items-center gap-1.5 text-xs font-mono"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logs</span>
            </button>
          </div>
        </div>

        {/* Scenario Summary & Visual Legend Bar */}
        <div className="px-4 py-1.5 bg-[#030610] border-b border-[#152342] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <div id="sim-scenario-summary" className="text-slate-300 truncate max-w-3xl">
            {isPt
              ? 'Demonstra o caminho padrão (happy path): a autorização síncrona conclui na Fase 1 e realiza commit atômico junto ao evento Outbox.'
              : 'Demonstrates the standard happy path: synchronous authorization completes in Phase 1 and commits atomically with an Outbox event.'}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-cyan-400 inline-block"></span> {isPt ? 'Chamada Síncrona' : 'Sync Call'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-400 inline-block"></span>{' '}
              {isPt ? 'Assíncrono / Outbox / Batch' : 'Async / Outbox / Batch'}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00D47E]"></span> OK
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Retry / Dedup
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> {isPt ? 'Falha' : 'Fault'}
            </span>
          </div>
        </div>

        {/* Mobile Toggle for Full SVG Architecture Map */}
        <div className="lg:hidden px-4 py-2 bg-[#050A18] border-b border-[#152342] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-300">
            {isPt
              ? 'Visão Mobile: Cards verticais de etapas ativos abaixo'
              : 'Mobile View: Vertical step cards active below'}
          </span>
          <button
            type="button"
            onClick={() => typeof window.toggleMobileDiagramView === 'function' && window.toggleMobileDiagramView()}
            className="px-2.5 py-1 rounded-lg bg-[#081229] border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-semibold"
          >
            <span id="btn-mobile-diagram-text">
              {isPt
                ? 'Mostrar Diagrama Completo da Arquitetura (Rolável)'
                : 'Show Full Architecture Diagram (Scrollable)'}
            </span>
          </button>
        </div>

        {/* Architectural Mesh Map Canvas (3 Phases) */}
        <div id="arch-desktop-diagram-wrapper" className="hidden lg:block overflow-x-auto">
          <div id="arch-mesh-area" className="px-5 pt-2 pb-3 space-y-3.5 relative min-w-[780px]">
            <div id="data-packet-token" className="data-packet-token opacity-0" aria-hidden="true"></div>
            <svg
              id="arch-connections-svg"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 2 }}
              aria-hidden="true"
            >
              <g id="arch-connections-group"></g>
            </svg>

            {/* PHASE 1: SYNCHRONOUS AUTHORIZATION */}
            <div className="relative pt-5">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-3">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">
                  {isPt
                    ? 'Fase 1: Autorização Síncrona (Requisição / Resposta Bloqueante)'
                    : 'Phase 1: Synchronous Authorization (Blocking Request / Response)'}
                </span>
                <div className="flex-1 h-px bg-slate-800/80 border-t border-dashed border-slate-700/60 ml-2"></div>
              </div>

              <div className="grid grid-cols-5 gap-5 sm:gap-6 items-center relative">
                <div
                  id="node-softpos"
                  className="arch-node p-2.5 rounded-xl border-2 border-cyan-500/70 bg-[#061124] text-center shadow-lg shadow-cyan-950/40"
                >
                  <Smartphone className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                  <div className="text-xs font-bold text-white">SoftPOS</div>
                  <div className="text-[9px] font-mono text-cyan-300">
                    {isPt ? 'Captura Lojista' : 'Merchant Capture'}
                  </div>
                </div>

                <div
                  id="node-merchant"
                  className="arch-node p-2.5 rounded-xl border-2 border-purple-500/70 bg-[#120B24] text-center shadow-lg shadow-purple-950/40"
                >
                  <Cpu className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                  <div className="text-xs font-bold text-white">Merchant Service</div>
                  <div className="text-[9px] font-mono text-purple-300">
                    {isPt ? 'Orquestrador & Idem' : 'Orchestrator & Idem'}
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div
                    id="node-softhsm"
                    className="arch-node absolute -top-[3.6rem] py-1 px-3 rounded-xl border-2 border-red-500/70 bg-[#240A10] text-center shadow-lg shadow-red-950/40 z-20 whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 mx-auto text-red-400" />
                    <div className="text-[10px] font-bold text-white leading-tight">SoftHSM (C++ Sim)</div>
                    <div className="text-[8px] font-mono text-red-300 leading-tight">
                      {isPt ? 'Tradução PIN TMK → ZPK' : 'TMK → ZPK PIN Trans'}
                    </div>
                  </div>
                  <div
                    id="node-switch"
                    className="arch-node w-full p-2.5 rounded-xl border-2 border-blue-500/80 bg-[#091530] text-center shadow-lg shadow-blue-950/40"
                  >
                    <Server className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                    <div className="text-xs font-bold text-white">Acquiring Switch</div>
                    <div className="text-[9px] font-mono text-blue-300">
                      {isPt ? 'Core ISO 8583' : 'ISO 8583 Core'}
                    </div>
                  </div>
                </div>

                <div
                  id="node-visagateway"
                  className="arch-node p-2.5 rounded-xl border-2 border-blue-600/70 bg-[#07132B] text-center shadow-lg shadow-blue-950/40"
                >
                  <div className="w-6 h-3.5 mx-auto bg-blue-600 rounded text-[8px] font-black text-white flex items-center justify-center mb-1">
                    VISA
                  </div>
                  <div className="text-xs font-bold text-white">Visa Gateway</div>
                  <div className="text-[9px] font-mono text-blue-300">
                    {isPt ? 'Conector Bandeira' : 'Scheme Connector'}
                  </div>
                </div>

                <div
                  id="node-visanet"
                  className="arch-node p-2.5 rounded-xl border-2 border-indigo-500/70 bg-[#0C102E] text-center shadow-lg shadow-indigo-950/40"
                >
                  <Globe className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                  <div className="text-xs font-bold text-white">VisaNet Emulator</div>
                  <div className="text-[9px] font-mono text-indigo-300">
                    {isPt ? 'Autorizador Base I' : 'Base I Authorizer'}
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 2: ASYNCHRONOUS MESSAGING */}
            <div className="relative pt-1">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                <GitMerge className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold text-slate-200">
                  {isPt
                    ? 'Fase 2: Mensageria Assíncrona (Transactional Outbox & Relay At-Least-Once)'
                    : 'Phase 2: Asynchronous Messaging (Transactional Outbox & At-Least-Once Relay)'}
                </span>
                <div className="flex-1 h-px bg-slate-800/80 border-t border-dashed border-slate-700/60 ml-2"></div>
              </div>

              <div className="grid grid-cols-5 gap-5 sm:gap-6 items-center relative">
                <div className="hidden sm:block"></div>

                <div
                  id="node-dboutbox"
                  className="arch-node p-2.5 rounded-xl border-2 border-indigo-500/70 bg-[#0D1230] text-center shadow-lg relative"
                >
                  <Database className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                  <div className="text-xs font-bold text-white">DB &amp; Outbox</div>
                  <div className="text-[9px] font-mono text-indigo-300">PostgreSQL ACID</div>
                </div>

                <div
                  id="node-outboxrelay"
                  className="arch-node p-2.5 rounded-xl border-2 border-orange-500/70 bg-[#261208] text-center shadow-lg relative"
                >
                  <Truck className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                  <div className="text-xs font-bold text-white">Outbox Relay</div>
                  <div className="text-[9px] font-mono text-orange-300">CDC / Backoff Worker</div>
                </div>

                <div
                  id="node-rabbitmq"
                  className="arch-node p-2.5 rounded-xl border-2 border-amber-500/70 bg-[#261807] text-center shadow-lg relative"
                >
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500/80 text-white flex items-center justify-center">
                    <CornerDownRight className="w-2.5 h-2.5" />
                  </div>
                  <Inbox className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                  <div className="text-xs font-bold text-white">RabbitMQ</div>
                  <div className="text-[9px] font-mono text-amber-300">Quorum Queue &amp; DLQ</div>
                  <div
                    id="badge-rmq-count"
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-md"
                  >
                    0
                  </div>
                </div>

                <div
                  id="node-settlementlistener"
                  className="arch-node p-2.5 rounded-xl border-2 border-emerald-500/70 bg-[#072417] text-center shadow-lg relative"
                >
                  <Settings className="w-3 h-3 text-slate-400 absolute top-1.5 right-1.5" />
                  <Headphones className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                  <div className="text-xs font-bold text-white">Settlement Listener</div>
                  <div className="text-[9px] font-mono text-emerald-300">
                    {isPt ? 'Consumidor Idempotente' : 'Idempotent Consumer'}
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 3: BATCH SETTLEMENT */}
            <div className="relative pt-1">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-slate-200">
                  {isPt
                    ? 'Fase 3: Clearing & Liquidação em Lote (Cut-Off / Base II TC50)'
                    : 'Phase 3: Batch Clearing & Settlement (Cut-Off / Base II TC50)'}
                </span>
                <div className="flex-1 h-px bg-slate-800/80 border-t border-dashed border-slate-700/60 ml-2"></div>
              </div>

              <div className="grid grid-cols-5 gap-5 sm:gap-6 items-start relative">
                <div className="hidden sm:block"></div>
                <div className="hidden sm:block"></div>

                <div className="space-y-3.5">
                  <div
                    id="node-tc57log"
                    className="arch-node p-2.5 rounded-xl border-2 border-slate-500/60 bg-[#0E1524] text-center shadow-lg relative"
                  >
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <FileText className="w-4 h-4 mx-auto text-slate-300 mb-1" />
                    <div className="text-xs font-bold text-white">Clearing Log (TC57)</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {isPt ? 'Staging Base II' : 'Base II Staging'}
                    </div>
                  </div>

                  <div
                    id="node-springbatch"
                    className="arch-node p-2.5 rounded-xl border-2 border-amber-400/70 bg-[#292008] text-center shadow-lg relative"
                  >
                    <Clock className="w-3 h-3 text-slate-400 absolute top-1.5 right-1.5" />
                    <Layers className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <div className="text-xs font-bold text-white">Spring Batch</div>
                    <div className="text-[9px] font-mono text-amber-300">
                      {isPt ? 'Conciliação Chunk + ShedLock' : 'Chunk Recon + ShedLock'}
                    </div>
                  </div>
                </div>

                <div className="pt-[3.2rem]">
                  <div
                    id="node-payout"
                    className="arch-node p-2.5 rounded-xl border-2 border-emerald-500/70 bg-[#06261A] text-center shadow-lg"
                  >
                    <Landmark className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <div className="text-xs font-bold text-white">Payout &amp; Ledger</div>
                    <div className="text-[9px] font-mono text-emerald-300">
                      {isPt ? 'Liquidação Partidas Dobradas' : 'Double-Entry Settlement'}
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 text-center mt-1">
                    {isPt ? 'Saída TC50' : 'TC50 Output'}
                  </div>
                </div>

                <div className="hidden sm:block"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress Scrubber */}
        <div className="px-5 py-2 bg-[#030610] border-t border-[#152342] flex items-center gap-4">
          <span id="sim-timeline-time" className="text-xs font-mono font-bold text-cyan-400 shrink-0">
            STEP 0
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              id="sim-timeline-progress"
              className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-[#00D47E] w-0 transition-all duration-300"
            ></div>
          </div>
          <span id="sim-timeline-total" className="text-xs font-mono text-slate-400 shrink-0">
            OF 7
          </span>
        </div>

        {/* INTERACTIVE STEP-BY-STEP PIPELINE & TECHNICAL EXPLANATION PANEL */}
        <div className="p-5 sm:p-6 bg-[#050A18] border-t border-[#152342] grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sequential Stage Cards */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#00D47E]" />
                <span>
                  {isPt
                    ? 'Sequência de Etapas do Cenário (Clique para Inspecionar)'
                    : 'Scenario Stage Sequence (Click to Inspect)'}
                </span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                {isPt ? 'Alternativa Textual' : 'Text Alternative'}
              </span>
            </div>
            <div id="sim-steps-list" className="space-y-2" role="region" aria-label="Scenario Step Sequence"></div>
          </div>

          {/* Right Column: Detailed Technical Stage Breakdown & Simulated DB State Inspector */}
          <div className="lg:col-span-7 space-y-4">
            <div
              id="sim-step-detail-card"
              aria-live="polite"
              className="p-4 sm:p-5 rounded-2xl bg-[#080E1E] border border-[#152342] space-y-3"
            ></div>

            {/* Simulated Relational & Broker State Inspector */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#080E1E] border border-[#152342] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#152342] pb-2.5">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {isPt
                      ? 'Inspetor de Persistência & Estado Simulado (Modelo em Memória)'
                      : 'Simulated Persistence & State Inspector (In-Memory Model)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {isPt ? 'Atualizado a cada etapa executada' : 'Updates per executed step'}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="rounded-xl border border-[#152342] bg-[#040711] overflow-x-auto">
                  <div className="px-2.5 py-1.5 bg-[#060C1A] border-b border-[#152342] text-[10px] text-cyan-300 font-bold">
                    TABLE: idempotency_keys
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 uppercase">
                        <th className="py-1 px-2.5">Key</th>
                        <th className="py-1 px-2.5">Hash</th>
                        <th className="py-1 px-2.5">Status</th>
                        <th className="py-1 px-2.5">Replayed</th>
                      </tr>
                    </thead>
                    <tbody id="sim-table-idem" className="text-[10px]"></tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-[#152342] bg-[#040711] overflow-x-auto">
                  <div className="px-2.5 py-1.5 bg-[#060C1A] border-b border-[#152342] text-[10px] text-emerald-300 font-bold">
                    TABLE: transactions
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 uppercase">
                        <th className="py-1 px-2.5">Tx ID</th>
                        <th className="py-1 px-2.5">Amount</th>
                        <th className="py-1 px-2.5">Protocol</th>
                        <th className="py-1 px-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody id="sim-table-tx" className="text-[10px]"></tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-[#152342] bg-[#040711] overflow-x-auto">
                  <div className="px-2.5 py-1.5 bg-[#060C1A] border-b border-[#152342] text-[10px] text-purple-300 font-bold">
                    TABLE: outbox_events
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 uppercase">
                        <th className="py-1 px-2.5">Event</th>
                        <th className="py-1 px-2.5">Topic</th>
                        <th className="py-1 px-2.5">Tries</th>
                        <th className="py-1 px-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody id="sim-table-outbox" className="text-[10px]"></tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-[#152342] bg-[#040711] overflow-x-auto">
                  <div className="px-2.5 py-1.5 bg-[#060C1A] border-b border-[#152342] text-[10px] text-amber-300 font-bold">
                    TABLE: processed_events (Consumer Dedup)
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 uppercase">
                        <th className="py-1 px-2.5">Event</th>
                        <th className="py-1 px-2.5">Dedup Check</th>
                        <th className="py-1 px-2.5">Ledger</th>
                        <th className="py-1 px-2.5">State</th>
                      </tr>
                    </thead>
                    <tbody id="sim-table-consumer" className="text-[10px]"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synthetic Execution Trace Console */}
        <div id="sim-terminal-container" className="p-4 bg-[#02040A] border-t border-[#152342] font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[10px] pb-2 border-b border-[#152342]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              {isPt
                ? 'TRACE DE EXECUÇÃO SINTÉTICO • LOGS LOCAIS DA MÁQUINA DE ESTADOS'
                : 'SYNTHETIC EXECUTION TRACE • LOCAL CLIENT-SIDE STATE MACHINE LOGS'}
            </span>
            <span id="sim-latency-badge" role="status" aria-live="polite" className="text-slate-400">
              STATE: IDLE &bull; SCENARIO A
            </span>
          </div>
          <div
            id="sim-console-output"
            role="log"
            aria-live="polite"
            className="pt-3 space-y-1.5 text-slate-300 min-h-[85px] max-h-[140px] overflow-y-auto"
          ></div>
        </div>
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
            href="https://github.com/franciscoaraujo/myprofile.dev.io/blob/master/js/components/simulator.js"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] hover:border-[#00D47E]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {isPt ? 'Implementação da Máquina de Estados' : 'State Machine Implementation'}
              </div>
              <div className="text-white font-bold mt-0.5 group-hover:text-[#00D47E]">js/components/simulator.js</div>
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

