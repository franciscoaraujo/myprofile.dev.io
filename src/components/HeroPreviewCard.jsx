'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Cpu, Play, RotateCcw, ArrowDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HERO_STAGES = [
  {
    id: 'hero-stage-1',
    shortTitleEn: '1. AUTHORIZATION REQUEST',
    shortTitlePt: '1. AUTHORIZATION REQUEST',
    titleEn: '1. AUTHORIZATION REQUEST (Synthetic POS Input)',
    titlePt: '1. AUTHORIZATION REQUEST (Captura Sintética POS)',
    badgeDone: 'REQ OK',
    mode: 'LOCAL SYNTHETIC INPUT',
    payload: 'Amount: BRL 84.50 | Token: tok_synth_4091 | Idempotency-Key: idem-a104-9c02',
    whatEn:
      'Receives a synthetic payment authorization request with non-sensitive demo parameters (`BRL 84.50`, masked token `tok_synth_4091`, and client key `idem-a104-9c02`).',
    whatPt:
      'Recebe uma requisição sintética de pagamento contactless (`BRL 84.50`, token mascarado `tok_synth_4091`) com `Idempotency-Key: idem-a104-9c02` gerada pelo cliente.',
    whyEn:
      'Establishes a deterministic request boundary and client-supplied idempotency key before invoking downstream validation.',
    whyPt:
      'Estabelece um identificador único de tentativa na borda antes de tocar no roteamento do switch ou em bloqueios de banco de dados.',
    scopeEn: 'Simulated locally in browser memory — no real cardholder PAN/PIN or POS terminal is connected.',
    scopePt: 'Execução local no navegador — nenhum cartão real ou terminal de hardware está conectado.',
    log: '[1/7] AUTH_REQUEST: Synthetic request received (BRL 84.50, idem-a104-9c02).',
  },
  {
    id: 'hero-stage-2',
    shortTitleEn: '2. VALIDATION',
    shortTitlePt: '2. VALIDATION',
    titleEn: '2. VALIDATION (Schema & ISO 8583 Fields)',
    titlePt: '2. VALIDATION (Validação de Esquema & Campos ISO 8583)',
    badgeDone: 'VALIDATED',
    mode: 'SYNCHRONOUS CHECK',
    payload: 'MTI: 0100 | DE3: 003000 | DE4: 000000008450 | DE11: 840192 | Schema: VALID',
    whatEn:
      'Validates required authorization fields (positive amount, currency code `986`, merchant ID, and mandatory ISO 8583 `MTI 0100` data elements).',
    whatPt:
      'Valida os Data Elements obrigatórios da mensagem ISO 8583 `MTI 0100` (`DE3`, `DE4`, `DE11`, `DE41`, `DE52`) e a integridade do esquema.',
    whyEn:
      'Rejects malformed requests early at the API gateway boundary before acquiring database locks or switch sockets.',
    whyPt:
      'Rejeita pacotes malformados antecipadamente antes de alocar bloqueios no banco de dados ou sockets no switch.',
    scopeEn: 'Local validation check over the synthetic request object.',
    scopePt: 'Validação determinística executada localmente em memória.',
    log: '[2/7] VALIDATION: Required fields verified (MTI 0100, DE3=003000, DE4=8450).',
  },
  {
    id: 'hero-stage-3',
    shortTitleEn: '3. IDEMPOTENCY CHECK',
    shortTitlePt: '3. IDEMPOTENCY CHECK',
    titleEn: '3. IDEMPOTENCY CHECK (Synthetic Key Lookup)',
    titlePt: '3. IDEMPOTENCY CHECK (Verificação de Chave Sintética)',
    badgeDone: 'KEY MISS (NEW)',
    mode: 'ATOMIC KEY VERIFICATION',
    payload: 'Key: idem-a104-9c02 | Payload Hash: sha256:4b91e0 | Lookup: MISS -> LOCKED',
    whatEn:
      'Checks whether `Idempotency-Key: idem-a104-9c02` already exists in the simulated `idempotency_keys` store and locks the key with its SHA-256 payload hash.',
    whatPt:
      'Consulta a chave `idem-a104-9c02` e o hash SHA-256 do payload no armazenamento transacional simulado antes de invocar o autorizador.',
    whyEn:
      'Prevents duplicate authorization side effects if the client retries after a network timeout.',
    whyPt:
      'Diferencia idempotência real de backend de um simples bloqueio visual de botão: evita cobrança dupla em retentativas de rede.',
    scopeEn: 'In-memory lookup simulation; see Scenario B in the full simulator for duplicate replay behavior.',
    scopePt: 'Simula a tabela `idempotency_keys` em memória; veja o Cenário B no simulador completo.',
    log: '[3/7] IDEMPOTENCY: Key idem-a104-9c02 verified as new (MISS) -> reserved.',
  },
  {
    id: 'hero-stage-4',
    shortTitleEn: '4. TRANSACTION PERSISTENCE',
    shortTitlePt: '4. TRANSACTION PERSISTENCE',
    titleEn: '4. TRANSACTION PERSISTENCE (Simulated DB Record)',
    titlePt: '4. TRANSACTION PERSISTENCE (Persistência da Transação)',
    badgeDone: 'PERSISTED',
    mode: 'LOCAL ACID TRANSACTION',
    payload: 'Table: transactions | TxID: TX-4091A | MTI: 0110 (DE39=00) | State: APPROVED',
    whatEn:
      'Evaluates synthetic authorizer rules (`MTI 0110 • DE39=00`) and persists the `transactions` record (`TX-4091A`) in the local state model.',
    whatPt:
      'Após receber a aprovação sintética `MTI 0110 (DE39=00)`, persiste o registro de negócio `transactions` (`TX-4091A`) para commit relacional.',
    whyEn:
      'Creates a durable audit record of the authorization decision before returning the response to the caller.',
    whyPt:
      'Persiste o resultado imutável da autorização e o código de resposta para conciliação financeira e auditoria.',
    scopeEn:
      'Executed as an in-memory state transition in the browser; illustrates a PostgreSQL `INSERT INTO transactions` commit.',
    scopePt:
      'Diferencia o que é executado localmente (estado em memória) de um banco PostgreSQL real em produção.',
    log: '[4/7] PERSISTENCE: Simulated tx TX-4091A recorded (MTI 0110, DE39=00).',
  },
  {
    id: 'hero-stage-5',
    shortTitleEn: '5. TRANSACTIONAL OUTBOX',
    shortTitlePt: '5. TRANSACTIONAL OUTBOX',
    titleEn: '5. TRANSACTIONAL OUTBOX (Same-DB Transaction Commit)',
    titlePt: '5. TRANSACTIONAL OUTBOX (Mesma Transação de BD)',
    badgeDone: 'OUTBOX COMMITTED',
    mode: 'SAME DB TRANSACTION (NO DUAL-WRITE)',
    payload: 'Table: outbox_events | Event: EVT-4091 | Status: PENDING -> Committed with TX-4091A',
    whatEn:
      'Records `outbox_events` (`EVT-4091`) alongside the `transactions` row (`TX-4091A`) within the **exact same database transaction**.',
    whatPt:
      'Registra o evento `outbox_events` (`EVT-4091`) junto com a alteração de negócio na **mesma transação local de banco de dados** (`COMMIT`).',
    whyEn:
      'Eliminates dual-write inconsistencies without claiming distributed atomicity between the database and the message broker.',
    whyPt:
      'Elimina o problema de dual-write entre banco de dados e mensageria sem alegar atomicidade distribuída entre o banco e o broker.',
    scopeEn: 'Simulated Outbox table commit in local state; broker publishing happens asynchronously in Stage 6.',
    scopePt: 'Modela o padrão Transactional Outbox localmente; a publicação ocorre de forma assíncrona na Etapa 6.',
    log: '[5/7] OUTBOX: Event EVT-4091 committed in same DB tx as TX-4091A (Status: PENDING).',
  },
  {
    id: 'hero-stage-6',
    shortTitleEn: '6. ASYNCHRONOUS MESSAGING',
    shortTitlePt: '6. ASYNCHRONOUS MESSAGING',
    titleEn: '6. ASYNCHRONOUS MESSAGING (Publish & Consumer Separation)',
    titlePt: '6. ASYNCHRONOUS MESSAGING (Publicação & Consumo)',
    badgeDone: 'PUBLISHED & ACKED',
    mode: 'LOCAL ASYNC SIMULATION (2 SUB-STAGES)',
    payload: '1) Relay Publish -> Broker ACK (PUBLISHED) | 2) Consumer Dedup (EVT-4091) -> ACK',
    whatEn:
      'Simulates two distinct asynchronous operations: **(a) Relay Publishing** (`Outbox -> Broker Confirm ACK`) and **(b) Consumer Processing** (`Settlement Listener` deduplicating `EVT-4091` before sending consumer `ACK`).',
    whatPt:
      'Demonstra a **publicação** do evento (`Outbox Relay -> Broker ACK`) e o **processamento assíncrono do consumidor** (`Settlement Listener` com deduplicação por `event_id`) como etapas distintas.',
    whyEn:
      'Decouples downstream clearing from synchronous POS latency while handling At-Least-Once delivery safely.',
    whyPt:
      'Desacopla a latência de liquidação da resposta síncrona do POS e trata entregas At-Least-Once com segurança.',
    scopeEn:
      'Local simulation of relay publishing and consumer deduplication — no live RabbitMQ broker is connected.',
    scopePt: 'Simulação local de relay e consumidor idempotente — nenhum broker RabbitMQ real está conectado.',
    log: '[6/7] ASYNC_MSG: (a) Relay published EVT-4091 -> (b) Consumer deduplicated & ACKed.',
  },
  {
    id: 'hero-stage-7',
    shortTitleEn: '7. RESULT',
    shortTitlePt: '7. RESULT',
    titleEn: '7. RESULT (Coherent Synthetic Outcome)',
    titlePt: '7. RESULT (Resultado Sintético Verificado)',
    badgeDone: 'COMPLETED',
    mode: 'FINAL VERIFIED STATE',
    payload: 'Result: SIMULATED APPROVAL (DE39=00) | Tx: TX-4091A | Outbox: PUBLISHED & CONSUMED',
    whatEn:
      'Presents the final outcome coherent with all executed stages: authorization approved (`DE39=00`), transaction & Outbox persisted, and async settlement event consumed.',
    whatPt:
      'Apresenta o estado final coerente com as etapas executadas: Autorização `APPROVED (DE39=00)`, registro persistido, Outbox `PUBLISHED` e recebível processado.',
    whyEn:
      'Confirms end-to-end state consistency across synchronous authorization and asynchronous settlement staging without fabricating production metrics.',
    whyPt:
      'Confirma a consistência ponta a ponta entre a decisão síncrona de autorização e a fila assíncrona de liquidação sem inventar métricas de produção.',
    scopeEn: '100% local deterministic simulation complete. Click "Explore the payment flow" for full scenarios.',
    scopePt: 'Simulação determinística local concluída. Clique em "Explorar o fluxo de pagamento" para ver todos os cenários.',
    log: '[7/7] RESULT: Synthetic authorization TX-4091A completed coherently (7/7 stages).',
  },
];

export default function HeroPreviewCard() {
  const { lang } = useApp();
  const isPt = lang === 'pt';

  const [previewState, setPreviewState] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'COMPLETED'
  const [currentStage, setCurrentStage] = useState(-1);
  const [inspectedStage, setInspectedStage] = useState(0);
  const [logs, setLogs] = useState([]);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const runDemo = () => {
    if (previewState === 'RUNNING') return;
    clearTimers();
    setPreviewState('RUNNING');
    setCurrentStage(-1);
    setInspectedStage(0);
    setLogs([
      {
        text: isPt
          ? '// Iniciando demonstração sintética de autorização (7 etapas)...'
          : '// Starting synthetic authorization preview (7 stages)...',
        color: 'text-cyan-400',
      },
    ]);

    HERO_STAGES.forEach((stage, idx) => {
      const t = setTimeout(() => {
        setCurrentStage(idx);
        setInspectedStage(idx);
        setLogs((prev) => [
          ...prev,
          {
            text: `> ${stage.log}`,
            color: idx === HERO_STAGES.length - 1 ? 'text-[#00D47E] font-bold' : 'text-slate-300',
          },
        ]);
        if (idx === HERO_STAGES.length - 1) {
          setPreviewState('COMPLETED');
        }
      }, (idx + 1) * 420);
      timersRef.current.push(t);
    });
  };

  const resetDemo = () => {
    clearTimers();
    setPreviewState('IDLE');
    setCurrentStage(-1);
    setInspectedStage(0);
    setLogs([]);
  };

  const activeDetail = HERO_STAGES[inspectedStage] || HERO_STAGES[0];
  const isStageExecuted =
    inspectedStage < currentStage || (inspectedStage === currentStage && previewState !== 'IDLE');

  return (
    <div
      id="hero-orionpay-card"
      className="rounded-2xl border border-[#152342] bg-[#060B17]/95 shadow-2xl overflow-hidden terminal-glow"
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-[#03060E] border-b border-[#152342] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00D47E]/15 border border-[#00D47E]/40 flex items-center justify-center text-[#00D47E] shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-wider text-white">ORIONPAY</span>
              <span
                role="status"
                aria-live="polite"
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  previewState === 'RUNNING'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 animate-pulse'
                    : previewState === 'COMPLETED'
                    ? 'bg-emerald-950 text-[#00D47E] border-[#00D47E]/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {previewState === 'RUNNING'
                  ? `RUNNING (${currentStage + 1}/${HERO_STAGES.length})`
                  : previewState === 'COMPLETED'
                  ? isPt
                    ? `CONCLUÍDO (${HERO_STAGES.length}/${HERO_STAGES.length})`
                    : `COMPLETED (${HERO_STAGES.length}/${HERO_STAGES.length})`
                  : `IDLE (0/${HERO_STAGES.length})`}
              </span>
            </div>
            <div className="text-[11px] font-sans font-semibold text-cyan-300 leading-tight">
              {isPt ? 'Demo de Autorização de Pagamentos' : 'Payment Authorization Demo'}
            </div>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-1 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 uppercase">
          {isPt ? 'SIMULAÇÃO · DADOS SINTÉTICOS' : 'SIMULATION · SYNTHETIC DATA'}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 bg-[#040711]/90">
        {/* Subheader Context */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-400 border-b border-[#152342]/80 pb-2">
          <span>
            {isPt
              ? 'Execução Local no Navegador (Sem Rede Externa)'
              : 'Local Client-Side Execution (No Live Network)'}
          </span>
          <span className="text-cyan-400">
            {isPt ? 'Selecione uma etapa ou clique em Executar Demo' : 'Select a stage or click Run Demo'}
          </span>
        </div>

        {/* 7 Interactive Stages List */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-1.5"
          role="region"
          aria-label="OrionPay Authorization Preview Stages"
        >
          {HERO_STAGES.map((stage, idx) => {
            const isCompleted =
              idx < currentStage || (idx === currentStage && previewState === 'COMPLETED');
            const isActive = idx === currentStage && previewState === 'RUNNING';
            const isInspected = idx === inspectedStage;

            let badgeText = 'IDLE';
            let badgeStyle = 'bg-slate-900 text-slate-400 border-slate-700';
            let rowStyle = 'border-[#152342] bg-[#040711] text-slate-300';

            if (isCompleted) {
              badgeText = stage.badgeDone;
              badgeStyle = 'bg-emerald-950/90 text-[#00D47E] border-[#00D47E]/40';
              rowStyle = 'border-[#00D47E]/40 bg-[#071526] text-white';
            } else if (isActive) {
              badgeText = 'ACTIVE';
              badgeStyle = 'bg-cyan-500 text-slate-950 border-cyan-300';
              rowStyle = 'border-cyan-400 bg-[#081A33] text-white shadow-md';
            }

            const ringClass = isInspected ? 'ring-1 ring-cyan-400/70' : '';
            const spanClass = idx === HERO_STAGES.length - 1 ? 'sm:col-span-2' : '';

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setInspectedStage(idx)}
                className={`${spanClass} ${rowStyle} ${ringClass} px-2.5 py-1.5 rounded-lg border text-left transition-all hover:border-cyan-400/60 flex items-center justify-between gap-2`}
              >
                <span className="text-[10px] font-mono font-bold truncate">
                  {isPt ? stage.shortTitlePt : stage.shortTitleEn}
                </span>
                <span className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected / Active Stage Technical Explanation */}
        <div className="p-3 rounded-xl bg-[#080E1E] border border-[#152342] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              {isStageExecuted
                ? isPt
                  ? `ETAPA ${inspectedStage + 1} EXECUTADA`
                  : `EXECUTED STAGE ${inspectedStage + 1}`
                : isPt
                ? `INSPETOR DE ETAPA (${inspectedStage + 1}/7)`
                : `STAGE INSPECTOR (${inspectedStage + 1}/7)`}
            </span>
            <span className="text-[9px] font-mono text-slate-400">{activeDetail.mode}</span>
          </div>
          <div className="text-xs font-bold text-white">
            {isPt ? activeDetail.titlePt : activeDetail.titleEn}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {isPt ? activeDetail.whatPt : activeDetail.whatEn}
          </p>
          <div className="text-[10px] font-mono text-cyan-300 bg-[#040711] px-2 py-1 rounded border border-[#152342] truncate">
            {activeDetail.payload}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            <strong className="text-slate-300">{isPt ? 'Escopo:' : 'Scope:'}</strong>{' '}
            {isPt ? activeDetail.scopePt : activeDetail.scopeEn}
          </div>
        </div>

        {/* Explicit Result Banner */}
        <div
          role="status"
          aria-live="polite"
          className={`px-3 py-2 rounded-lg border font-mono text-[11px] flex items-center justify-between gap-2 ${
            previewState === 'COMPLETED'
              ? 'border-[#00D47E]/50 bg-emerald-950/30'
              : previewState === 'RUNNING'
              ? 'border-cyan-500/40 bg-cyan-950/20'
              : 'border-[#152342] bg-[#040711]'
          }`}
        >
          {previewState === 'COMPLETED' ? (
            <>
              <span className="text-[#00D47E] font-bold">
                {isPt
                  ? 'RESULTADO: APROVAÇÃO SIMULADA (DE39=00)'
                  : 'RESULT: SIMULATED APPROVAL (DE39=00)'}
              </span>
              <span className="text-emerald-300 text-[10px]">
                {isPt ? 'TX-4091A • Outbox Publicado' : 'TX-4091A • Outbox Published'}
              </span>
            </>
          ) : previewState === 'RUNNING' ? (
            <>
              <span className="text-cyan-300 font-bold">
                {isPt ? 'RESULTADO: PROCESSANDO ETAPAS...' : 'RESULT: EXECUTING STAGES...'}
              </span>
              <span className="text-slate-400 text-[10px]">
                {isPt
                  ? `Etapa ${currentStage + 1} de ${HERO_STAGES.length}`
                  : `Stage ${currentStage + 1} of ${HERO_STAGES.length}`}
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-400">
                {isPt ? 'RESULTADO: AGUARDANDO EXECUÇÃO' : 'RESULT: AWAITING EXECUTION'}
              </span>
              <span className="text-slate-500 text-[10px]">
                {isPt ? 'Nenhum resultado gerado ainda' : 'No authorization result generated yet'}
              </span>
            </>
          )}
        </div>

        {/* Compact Synthetic Terminal Log */}
        <div className="rounded-xl border border-[#152342] bg-[#03060E] p-2.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-slate-500 pb-1.5 mb-1.5 border-b border-[#152342]/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D47E]/80"></span>
              <span>orionpay-local-preview.log</span>
            </span>
            <span>{isPt ? 'TRACE SINTÉTICO' : 'SYNTHETIC TRACE'}</span>
          </div>
          <div role="log" aria-live="polite" className="space-y-1 text-slate-300 max-h-[68px] overflow-y-auto">
            {logs.length === 0 ? (
              <>
                <div className="text-slate-400">
                  {isPt
                    ? '// Simulação local em espera (sem chamadas de rede externas)'
                    : '// Local browser simulation standby (no external network calls)'}
                </div>
                <div className="text-slate-300">
                  &gt;{' '}
                  {isPt
                    ? 'Clique em "Executar Demo" para rodar as etapas 1–7 com dados sintéticos.'
                    : 'Click "Run Demo" to execute stages 1–7 with synthetic data.'}
                </div>
              </>
            ) : (
              logs.map((entry, i) => (
                <div key={i} className={entry.color}>
                  {entry.text}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Functional Controls */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#152342]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runDemo}
              disabled={previewState === 'RUNNING'}
              className={`px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D47E] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-emerald-500/10 active:scale-95 inline-flex items-center gap-1.5 ${
                previewState === 'RUNNING' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {previewState === 'RUNNING'
                  ? isPt
                    ? 'Executando...'
                    : 'Running...'
                  : isPt
                  ? 'Executar Demo'
                  : 'Run Demo'}
              </span>
            </button>

            <button
              type="button"
              onClick={resetDemo}
              className="px-3 py-2 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] hover:border-slate-600 text-slate-200 font-mono text-xs transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isPt ? 'Resetar' : 'Reset'}</span>
            </button>
          </div>

          <Link
            href="/simulator"
            className="px-3 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-white font-mono font-semibold text-xs transition-all inline-flex items-center gap-1.5"
          >
            <span>{isPt ? 'Explorar o fluxo de pagamento' : 'Explore the payment flow'}</span>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

