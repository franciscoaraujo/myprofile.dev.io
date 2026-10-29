'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Cpu,
  Shield,
  Network,
  Coins,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Scale,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ORION_TABS_LIST, ORION_CASE_STUDIES } from '../../data/portfolio-data';

const ICON_MAP = {
  cpu: Cpu,
  shield: Shield,
  network: Network,
  coins: Coins,
  smartphone: Smartphone,
};

export default function ProjectsPage() {
  const { lang } = useApp();
  const isPt = lang === 'pt';
  const [activeTab, setActiveTab] = useState('switch');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ORION_CASE_STUDIES.en[tabParam]) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const dataDict = isPt ? ORION_CASE_STUDIES.pt : ORION_CASE_STUDIES.en;
  const activeData = dataDict[activeTab] || dataDict.switch;

  return (
    <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00D47E]/10 border border-[#00D47E]/30 text-[#00D47E] font-mono text-xs font-bold">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>
            {isPt
              ? 'Projetos Autorais de Engenharia & Estudos de Caso'
              : 'Authorial Engineering Projects & Case Studies'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isPt
            ? 'OrionPay: Arquitetura de Pagamentos Ponta a Ponta'
            : 'OrionPay: End-to-End Payment Architecture'}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          {isPt
            ? 'Uma arquitetura de referência autoral e bancada de testes construída para modelar todo o ciclo de vida do pagamento com cartão: da captura mobile NFC e simulação criptográfica em C++ até a autorização síncrona ISO 8583 e pipelines batch de compensação (clearing).'
            : 'An authorial reference architecture and integration testbed built to model the entire card payment lifecycle: from NFC mobile capture and C++ cryptographic simulation to synchronous ISO 8583 authorization and end-of-day clearing batch pipelines.'}
        </p>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg max-w-2xl mx-auto">
          <strong>
            {isPt ? 'Nota de Transparência de Engenharia:' : 'Engineering Transparency Note:'}
          </strong>{' '}
          {isPt
            ? 'OrionPay é uma arquitetura de referência autoral e um ambiente de verificação de protocolos desenvolvido para demonstrar padrões de sistemas distribuídos e mensageria financeira.'
            : 'OrionPay is an authorial reference architecture and protocol verification harness developed to demonstrate distributed systems and financial messaging design patterns.'}
        </div>
      </div>

      {/* Interactive Architecture Explorer */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Selector Tabs */}
        <div className="lg:col-span-4 space-y-3">
          {ORION_TABS_LIST.map((tab) => {
            const IconComp = ICON_MAP[tab.icon] || Cpu;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#00D47E] bg-[#080E1E] shadow-lg shadow-emerald-500/10'
                    : 'border-[#152342] bg-[#080E1E]/50 hover:bg-[#080E1E]'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-[#00D47E]/10 text-[#00D47E] shrink-0">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isPt ? tab.titlePt : tab.titleEn}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {isPt ? tab.subtitlePt : tab.subtitleEn}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Direct CTA to Test in Switch Demo */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#061124]/80 space-y-2.5">
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              <span>{isPt ? 'Laboratório Interativo' : 'Interactive Switch Lab'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isPt
                ? 'Execute este módulo em tempo real na máquina de estados interativa (Cenários A, B, C e D).'
                : 'Execute this module in real time inside the interactive state machine (Scenarios A, B, C, and D).'}
            </p>
            <Link
              href="/simulator"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00D47E] hover:underline"
            >
              <span>{isPt ? 'Ir para Payment Systems Lab' : 'Go to Payment Systems Lab'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-[#152342] bg-[#080E1E] p-6 sm:p-8 glass-metal space-y-6">
            <div className="space-y-2 border-b border-[#152342] pb-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00D47E]/10 text-[#00D47E] font-mono text-xs font-bold">
                {activeData.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeData.title}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{activeData.subtitle}</p>
            </div>

            {/* Problem Statement */}
            <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isPt ? 'Problema de Engenharia Resolvido' : 'Engineering Problem Solved'}</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{activeData.problem}</p>
            </div>

            {/* Architecture & Implementation Decisions */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                {isPt ? 'Decisões de Arquitetura & Implementação' : 'Architecture & Implementation Decisions'}
              </h3>
              <ul className="space-y-2.5">
                {activeData.architecture.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#00D47E] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Implemented vs. Simulated Scope (Task 1 & Task 5) */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-[#041710]/80 border border-[#00D47E]/30 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-[#00D47E] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D47E]"></span>
                  <span>{isPt ? 'Implementado no Código (Local)' : 'Implemented in Code (Local)'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{activeData.implemented}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1205]/80 border border-amber-500/30 space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{isPt ? 'Simulado / Proposta Arquitetural' : 'Simulated / Design Scope'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeData.simulated}</p>
              </div>
            </div>

            {/* Trade-offs & Risk Mitigation */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                {isPt ? 'Trade-offs Arquiteturais & Mitigação de Riscos' : 'Architectural Trade-offs & Risk Mitigation'}
              </h3>
              <ul className="space-y-2">
                {activeData.tradeoffs.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies & Design Targets */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  {isPt ? 'Stack & Protocolos' : 'Technology Stack & Protocols'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeData.stack.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-[#080E1E] border border-[#152342] text-xs font-mono text-cyan-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#040711] border border-[#152342] flex flex-col justify-center space-y-2">
                <div className="flex items-center justify-between border-b border-[#152342] pb-2">
                  <span className="text-xs text-slate-400 font-mono">{activeData.metricsLabel1}</span>
                  <span className="text-sm font-bold text-[#00D47E] font-mono">{activeData.metricsVal1}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 font-mono">{activeData.metricsLabel2}</span>
                  <span className="text-sm font-bold text-white font-mono">{activeData.metricsVal2}</span>
                </div>
              </div>
            </div>

            {/* Scope & Limitations */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {isPt ? 'Escopo & Limitações Conhecidas' : 'Scope & Known Limitations'}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <Link href="/simulator" className="text-[#00D47E] hover:underline font-bold">
                    {isPt ? 'Testar no Simulador →' : 'Test in Simulator →'}
                  </Link>
                  <a
                    href="https://github.com/franciscoaraujo/myprofile.dev.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    {isPt ? 'Código no Repositório ↗' : 'Repository Source ↗'}
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{activeData.limitations}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
