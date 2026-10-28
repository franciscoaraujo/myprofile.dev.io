'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  Check,
  Languages,
  Repeat,
  Lock,
  FileSpreadsheet,
  Workflow,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SKILLS_DATA } from '../../data/portfolio-data';

const CATEGORIES = [
  { id: 'all', labelEn: 'All Domains', labelPt: 'Todos os Domínios' },
  { id: 'backend', labelEn: 'Backend Engineering', labelPt: 'Engenharia Backend' },
  { id: 'payment', labelEn: 'Payment Systems', labelPt: 'Sistemas de Pagamento' },
  { id: 'distributed', labelEn: 'Distributed Systems', labelPt: 'Sistemas Distribuídos' },
  { id: 'messaging', labelEn: 'Messaging & Persistence', labelPt: 'Mensageria & Persistência' },
  { id: 'security', labelEn: 'Security & Cryptography', labelPt: 'Segurança & Criptografia' },
  { id: 'observability', labelEn: 'Testing & Observability', labelPt: 'Testes & Observabilidade' },
  { id: 'cloud', labelEn: 'Cloud & Infrastructure', labelPt: 'Cloud & Infraestrutura' },
];

export default function SkillsPage() {
  const { lang } = useApp();
  const isPt = lang === 'pt';
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredSkills =
    selectedCat === 'all' ? SKILLS_DATA : SKILLS_DATA.filter((s) => s.cat === selectedCat);

  const catColorMap = {
    backend: 'text-[#00D47E] border-[#00D47E]/30 bg-[#00D47E]/10',
    payment: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    distributed: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    messaging: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    security: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    observability: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    cloud: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  };

  const contextMap = {
    corporate: {
      badgeEn: 'Corporate Production',
      badgePt: 'Produção Corporativa',
      color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
    },
    authorial: {
      badgeEn: 'Authorial Project',
      badgePt: 'Projeto Autoral',
      color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/40',
    },
    standard: {
      badgeEn: 'Industry Standard',
      badgePt: 'Padrão / Domínio',
      color: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/40',
    },
  };

  return (
    <div>
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00D47E]/10 border border-[#00D47E]/30 text-[#00D47E] font-mono text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{isPt ? 'Competências Técnicas Centrais' : 'Core Technical Competencies'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPt ? 'Habilidades Técnicas & Evidências de Engenharia' : 'Technical Skills & Engineering Evidence'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {isPt
                ? 'Matriz estruturada de competências com evidências técnicas verificáveis, diferenciando experiência corporativa em produção, projetos de arquitetura autoral e padrões de mercado.'
                : 'Structured skills matrix with verifiable technical evidence, distinguishing corporate production experience, authorial reference architectures, and industry domain standards.'}
            </p>
          </div>

          {/* Evidence Type Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-400 font-semibold uppercase">{isPt ? 'Origem:' : 'Evidence:'}</span>
            <span className="px-2 py-0.5 rounded-full border text-emerald-300 border-emerald-500/30 bg-emerald-950/40 font-medium">
              {isPt ? '● Produção Corporativa' : '● Corporate Production'}
            </span>
            <span className="px-2 py-0.5 rounded-full border text-cyan-300 border-cyan-500/30 bg-cyan-950/40 font-medium">
              {isPt ? '● Projeto Autoral' : '● Authorial Project'}
            </span>
            <span className="px-2 py-0.5 rounded-full border text-indigo-300 border-indigo-500/30 bg-indigo-950/40 font-medium">
              {isPt ? '● Padrão de Mercado' : '● Industry Standard'}
            </span>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Skills Filter">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-[#00D47E] text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-[#080E1E] text-slate-300 border border-[#152342] hover:border-slate-500 font-medium'
                }`}
              >
                {isPt ? cat.labelPt : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Skill Cards Grid with Evidence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const badgeStyle =
              catColorMap[skill.cat] || 'text-slate-400 border-slate-700 bg-slate-800';
            const contextInfo = contextMap[skill.context] || contextMap.corporate;
            return (
              <div
                key={skill.name}
                className="p-5 rounded-2xl border border-[#152342] bg-[#080E1E]/90 hover:border-[#00D47E]/50 transition-all flex flex-col justify-between gap-3 group glass-metal"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-[#00D47E] transition-colors">
                      {skill.name}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${badgeStyle}`}>
                      {skill.cat}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    {isPt && skill.descPt ? skill.descPt : skill.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#152342]/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {isPt ? 'Evidência Técnica:' : 'Technical Evidence:'}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${contextInfo.color}`}>
                      {isPt ? contextInfo.badgePt : contextInfo.badgeEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {isPt && skill.evidencePt ? skill.evidencePt : skill.evidenceEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ENGINEERING PILLARS & INTERNATIONAL READINESS */}
      <section className="py-16 border-t border-[#152342] bg-[#040711]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{isPt ? 'Valor de Engenharia Sênior' : 'Senior Engineering Value'}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {isPt ? 'Por Que Contratar para o Seu Core Backend?' : 'Why Hire for Your Core Backend?'}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {isPt ? (
                  <>
                    Profunda familiaridade com padrões de meios de pagamento (
                    <span className="font-mono text-cyan-300">ISO 8583, EMV, SPB Banco Central</span>), rotinas
                    criptográficas de baixo nível em C++ e arquitetura de microsserviços moderna em Java 21 me permitem
                    resolver casos extremos antes que se tornem divergências de conciliação ou deadlocks de
                    concorrência.
                  </>
                ) : (
                  <>
                    Deep familiarity with payment standards (
                    <span className="font-mono text-cyan-300">ISO 8583, EMV, Central Bank SPB</span>), low-level
                    cryptographic routines in C++, and modern Java 21 microservice design allows me to solve edge cases
                    before they escalate into reconciliation debt or concurrency locks.
                  </>
                )}
              </p>

              <div className="pt-2 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D47E] shrink-0" />
                  <span>
                    {isPt
                      ? 'Consistência transacional entre autorização síncrona e fila de liquidação via padrão Outbox'
                      : 'Transactional consistency between synchronous authorization and settlement queues via Outbox pattern'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D47E] shrink-0" />
                  <span>
                    {isPt
                      ? 'Bancadas de teste de protocolo para validação de fluxos e testes de carga antes de homologações formais'
                      : 'Protocol testbed harnesses for preliminary integration and load testing prior to formal scheme compliance'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D47E] shrink-0" />
                  <span>
                    {isPt
                      ? 'Diagnóstico de concorrência distribuída e otimização fina de pools de conexão no PostgreSQL'
                      : 'Troubleshooting distributed concurrency and tuning PostgreSQL connection pools'}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  {isPt ? 'Proficiência em Idiomas:' : 'Language Proficiency:'}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#080E1E] border border-[#152342]">
                    <Languages className="w-3.5 h-3.5 text-[#00D47E]" />
                    <strong>{isPt ? 'Português:' : 'Portuguese:'}</strong> {isPt ? 'Nativo' : 'Native'}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#080E1E] border border-[#152342]">
                    <Languages className="w-3.5 h-3.5 text-cyan-400" />
                    <strong>{isPt ? 'Inglês:' : 'English:'}</strong>{' '}
                    {isPt ? 'Técnico / Profissional (B1-B2)' : 'Technical / Professional Working (B1-B2)'}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#080E1E] border border-[#152342]">
                    <Languages className="w-3.5 h-3.5 text-indigo-400" />
                    <strong>{isPt ? 'Francês:' : 'French:'}</strong> {isPt ? 'Intermediário' : 'Intermediate'}
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00D47E] to-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isPt ? 'Entrar em Contato' : 'Get in Touch'}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-[#00D47E] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" /> {isPt ? 'Resiliência' : 'Resilience'}
                </div>
                <h3 className="text-white font-bold text-sm">Transactional Outbox &amp; ShedLock</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Prevenção de inconsistências de dual-write com persistência local ACID no Outbox, relay assíncrono para o broker e travas de idempotência para retentativas de rede.'
                    : 'Preventing dual-write inconsistencies with local ACID Outbox persistence, asynchronous broker relay, and distributed locks for idempotency on network retries.'}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> {isPt ? 'Criptografia' : 'Cryptography'}
                </div>
                <h3 className="text-white font-bold text-sm">
                  {isPt ? 'Simulador C++ SoftHSM (Educacional & Testes)' : 'C++ SoftHSM Simulator (Testbed)'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Simulação em software (C++17 e OpenSSL) para testes e fins educacionais de gerenciamento de chaves (TMK, ZPK, LMK) e tradução de PIN block ISO 9564 em memória sem persistir PIN em texto aberto.'
                    : 'Educational/testbed software simulation of Financial HSM key management (TMK, ZPK, LMK) and in-memory ISO 9564 PIN block translation using C++17 and OpenSSL without persisting plaintext PINs.'}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-blue-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> {isPt ? 'Compensação (Clearing)' : 'Clearing'}
                </div>
                <h3 className="text-white font-bold text-sm">
                  {isPt ? 'Pipelines Batch Orientados a Chunks' : 'Chunk-Oriented Batch Pipelines'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Pipelines Spring Batch projetados para processar transações em layouts posicionais padronizados (Visa Base II TC50) com conciliação contábil em partidas dobradas (Débito = Crédito Lojista + Receita MDR).'
                    : 'Spring Batch pipelines designed to process transactions into standardized positional layouts (Visa Base II TC50) with balanced double-entry accounting (Debit = Credit + MDR fee revenue).'}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5" /> {isPt ? 'Modernização' : 'Modernization'}
                </div>
                <h3 className="text-white font-bold text-sm">
                  {isPt ? 'Arquitetura de Domínio Desacoplada' : 'Decoupled Domain Architecture'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Transição de monólitos legados em Java EE para microsserviços em arquitetura hexagonal limpa, elevando a vazão e a manutenibilidade sob normas bancárias.'
                    : 'Transitioning legacy Java EE monoliths to clean hexagonal microservices, improving throughput and maintainability under stringent banking regulations.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

