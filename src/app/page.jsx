'use client';

import React from 'react';
import Link from 'next/link';
import {
  Server,
  Code2,
  Layers,
  MapPin,
  FolderCode,
  Download,
  Mail,
  Linkedin,
  Github,
  Clock,
  Gauge,
  Database,
  Shield,
  ArrowRight,
  Briefcase,
  Cpu,
  Terminal,
  ShieldCheck,
  Check,
  Languages,
  Repeat,
  Lock,
  FileSpreadsheet,
  Workflow,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import HeroPreviewCard from '../components/HeroPreviewCard';

export default function OverviewPage() {
  const { lang } = useApp();
  const isPt = lang === 'pt';

  const sectionCards = [
    {
      href: '/projects',
      icon: FolderCode,
      badgeEn: '5 ARCHITECTURE MODULES',
      badgePt: '5 MÓDULOS DE ARQUITETURA',
      titleEn: 'Projects (OrionPay Case Studies)',
      titlePt: 'Projetos (Estudos de Caso OrionPay)',
      descEn:
        'Deep dive into Acquiring Switch (Java 21), C++ SoftHSM, VisaNet Base I Emulator, Spring Batch Clearing (TC50), and Android SoftPOS.',
      descPt:
        'Análise profunda do Acquiring Switch (Java 21), C++ SoftHSM, Emulador VisaNet Base I, Clearing em Spring Batch (TC50) e Android SoftPOS.',
      color: 'text-[#00D47E]',
      border: 'hover:border-[#00D47E]/60',
    },
    {
      href: '/simulator',
      icon: Terminal,
      badgeEn: '4 INTERACTIVE SCENARIOS',
      badgePt: '4 CENÁRIOS INTERATIVOS',
      titleEn: 'Payment Systems Lab (ISO 8583 & Outbox)',
      titlePt: 'Payment Systems Lab (ISO 8583 & Outbox)',
      descEn:
        'Step-by-step state machine simulating Approved Authorization, Duplicate Request Idempotency, RabbitMQ Outage Recovery, and Batch Settlement.',
      descPt:
        'Máquina de estados passo a passo simulando Autorização Aprovada, Idempotência em Duplicidade, Recuperação de Falha no RabbitMQ e Liquidação Batch.',
      color: 'text-cyan-400',
      border: 'hover:border-cyan-400/60',
    },
    {
      href: '/experience',
      icon: Briefcase,
      badgeEn: '13+ YEARS CAREER',
      badgePt: '13+ ANOS DE CARREIRA',
      titleEn: 'Professional Experience',
      titlePt: 'Experiência Profissional',
      descEn:
        'Verifiable corporate trajectory across RedeFlex (Card Acquiring), Grupo GFT (B3 Stock Exchange, Rabobank, Serasa Experian), Duel Midia, and Grupo Criar.',
      descPt:
        'Trajetória corporativa verificável na RedeFlex (Adquirência), Grupo GFT (B3, Rabobank Brasil, Serasa Experian), Duel Midia e Grupo Criar.',
      color: 'text-blue-400',
      border: 'hover:border-blue-400/60',
    },
    {
      href: '/skills',
      icon: Cpu,
      badgeEn: '26 VERIFIED COMPETENCIES',
      badgePt: '26 COMPETÊNCIAS VERIFICADAS',
      titleEn: 'Technical Skills Matrix',
      titlePt: 'Matriz de Habilidades Técnicas',
      descEn:
        'Filterable domain matrix spanning Backend & C++, Payment Protocols, Distributed Messaging, Databases, Cloud/DevOps, and Cryptographic Security.',
      descPt:
        'Matriz filtrável por domínio cobrindo Backend & C++, Protocolos de Pagamento, Mensageria Distribuída, Bancos de Dados, Cloud/DevOps e Criptografia.',
      color: 'text-amber-400',
      border: 'hover:border-amber-400/60',
    },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Candidate Bio & Photo */}
            <div className="flex items-center gap-4 sm:gap-6 pb-2">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-[2px] bg-gradient-to-br from-[#00D47E] via-cyan-500 to-blue-600 shadow-xl shadow-cyan-950/40">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#060B17] relative flex items-center justify-center">
                    <img
                      src="/assets/profile.jpg"
                      alt="Francisco Araújo - Senior Backend Engineer"
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://github.com/franciscoaraujo.png';
                      }}
                    />
                  </div>
                </div>
                <div
                  className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#080E1E] border-2 border-[#00D47E] shadow-md"
                  title="Active & Open to Global Roles"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D47E] animate-pulse"></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-950/40 text-blue-300 text-xs font-mono">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {isPt
                      ? 'Engenheiro Backend Sênior | Java & Sistemas de Pagamento'
                      : 'Senior Backend Engineer | Java & Payment Systems'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  Francisco Araújo
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D47E]/10 text-[#00D47E] border border-[#00D47E]/30 uppercase tracking-wider">
                    Senior IC
                  </span>
                </h2>
                <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-slate-300 font-medium">
                    {isPt ? '13+ Anos de Experiência' : '13+ Years Experience'}
                  </span>
                  <span>&bull;</span>
                  <span className="text-cyan-400 font-medium">
                    {isPt ? 'Infraestrutura de Pagamentos' : 'Payment Infrastructure'}
                  </span>
                </p>
              </div>
            </div>

            {/* Main Heading & Tagline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {isPt ? 'Engenharia Backend para ' : 'Backend Engineering for '}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D47E] via-cyan-300 to-blue-400">
                  {isPt ? 'Sistemas Financeiros de Missão Crítica' : 'Mission-Critical Financial Systems'}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
                {isPt
                  ? '“Construo sistemas backend confiáveis para processamento de pagamentos, integrações financeiras e aplicações distribuídas.”'
                  : '“I build reliable backend systems for payment processing, financial integrations, and distributed applications.”'}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {isPt ? (
                  <>
                    Contribuidor Individual Especialista com{' '}
                    <strong className="text-white font-semibold">
                      mais de 13 anos de experiência em desenvolvimento backend
                    </strong>{' '}
                    no ecossistema Java, switches de autorização transacional (
                    <span className="font-mono text-cyan-300">ISO 8583 / VisaNet</span>), simulação de hardware
                    criptográfico (
                    <span className="font-mono text-[#00D47E]">C++ SoftHSM, Tradução de PIN Block</span>), clearing em
                    lote de alto volume e mensageria distribuída.
                  </>
                ) : (
                  <>
                    Specialized Individual Contributor with{' '}
                    <strong className="text-white font-semibold">13+ years of backend development experience</strong> in
                    Java ecosystem, transaction authorization switches (
                    <span className="font-mono text-cyan-300">ISO 8583 / VisaNet</span>), cryptographic hardware
                    simulation (<span className="font-mono text-[#00D47E]">C++ SoftHSM, PIN Block Translation</span>),
                    high-volume batch clearing, and distributed messaging.
                  </>
                )}
              </p>
            </div>

            {/* Core Technologies Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#152342] bg-[#080E1E]/80">
                <Code2 className="w-4 h-4 text-[#00D47E]" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">
                    {isPt ? 'Stack Principal' : 'Core Stack'}
                  </div>
                  <div className="text-slate-200 font-bold">Java 21 • Spring Boot • C++</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#152342] bg-[#080E1E]/80">
                <Layers className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">
                    {isPt ? 'Sistemas Distribuídos' : 'Distributed'}
                  </div>
                  <div className="text-slate-200 font-bold">RabbitMQ • Kafka • PostgreSQL</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#152342] bg-[#080E1E]/80 col-span-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">
                    {isPt ? 'Localização & Escopo' : 'Location & Work Scope'}
                  </div>
                  <div className="text-slate-200 font-bold">
                    {isPt ? 'Barueri, Brasil • Remoto Global' : 'Barueri, Brazil • Remote World'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00D47E] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <FolderCode className="w-4 h-4" />
                <span>{isPt ? 'Ver Projetos' : 'View Projects'}</span>
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#152342] bg-[#080E1E] hover:border-slate-500 text-slate-200 text-xs font-mono transition-all"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>{isPt ? 'Baixar Currículo (CV)' : 'Download Resume (CV)'}</span>
              </button>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#152342] bg-[#080E1E] hover:border-slate-500 text-slate-200 text-xs font-mono transition-all"
              >
                <Mail className="w-4 h-4 text-[#00D47E]" />
                <span>{isPt ? 'Fale Comigo' : 'Contact Me'}</span>
              </Link>

              <a
                href="https://www.linkedin.com/in/francisco-jos%C3%A9-oliveira-araujo-b0185772/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] text-slate-300 text-xs font-medium transition-all hover:text-white"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/franciscoaraujo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] text-slate-300 text-xs font-medium transition-all hover:text-white"
              >
                <Github className="w-4 h-4 text-slate-300" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive OrionPay Preview Card */}
          <div className="lg:col-span-5">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* VERIFIABLE ENGINEERING INDICATORS */}
      <section className="border-y border-[#152342] bg-[#060B17]/90 py-8 relative" aria-label="Key Engineering Metrics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="p-4 rounded-xl border border-[#152342] bg-[#080E1E]/80 space-y-1.5 hover:border-[#00D47E]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {isPt ? 'Experiência Contínua' : 'Continuous Experience'}
                </span>
                <Clock className="w-4 h-4 text-[#00D47E]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                13+ <span className="text-[#00D47E] text-lg font-sans">{isPt ? 'Anos' : 'Years'}</span>
              </div>
              <p className="text-xs text-slate-400">
                {isPt
                  ? 'Atuação prática em sistemas backend para adquirentes, consultorias financeiras e bancos corporativos.'
                  : 'Hands-on backend systems in acquirers, financial consulting, and enterprise banking.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#152342] bg-[#080E1E]/80 space-y-1.5 hover:border-cyan-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {isPt ? 'Janela de Autorização' : 'Authorization Window'}
                </span>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                &lt; 200<span className="text-cyan-400 text-lg font-sans">ms</span>
              </div>
              <p className="text-xs text-slate-400">
                {isPt
                  ? 'Meta de arquitetura ponta a ponta cobrindo captura no terminal, tradução criptográfica e roteamento no switch.'
                  : 'End-to-end design target spanning terminal capture, crypto translation, and switch routing.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#152342] bg-[#080E1E]/80 space-y-1.5 hover:border-blue-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {isPt ? 'Confiabilidade de Dados' : 'Data Reliability'}
                </span>
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                Outbox <span className="text-blue-400 text-lg font-sans">Pattern</span>
              </div>
              <p className="text-xs text-slate-400">
                {isPt
                  ? 'Eliminação de dual-write com commits atômicos no banco de dados e Change Data Capture (CDC).'
                  : 'Dual-write elimination with atomic database commits and Change Data Capture (CDC).'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#152342] bg-[#080E1E]/80 space-y-1.5 hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {isPt ? 'Escopo de Segurança' : 'Security Scope'}
                </span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                HSM <span className="text-amber-400 text-lg font-sans">{isPt ? 'Conceitos' : 'Concepts'}</span>
              </div>
              <p className="text-xs text-slate-400">
                {isPt
                  ? 'Gerenciamento de chaves 3DES/AES, recriptografia de PIN block TMK-para-ZPK e verificação matemática de KCV.'
                  : '3DES, AES key management, TMK-to-ZPK PIN block re-encryption, and KCV math checks.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED PORTFOLIO PAGES EXPLORER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-[#00D47E] font-bold">
            {isPt ? 'Arquitetura Modular em Páginas Dedicadas' : 'Dedicated Multi-Page Engineering Portfolio'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isPt ? 'Explore Cada Domínio Técnico em Detalhes' : 'Explore Each Technical Domain in Detail'}
          </h2>
          <p className="text-sm text-slate-400">
            {isPt
              ? 'Navegue pelas páginas dedicadas abaixo para inspecionar estudos de caso, rodar cenários no simulador ISO 8583, revisar a trajetória corporativa ou filtrar competências.'
              : 'Navigate through the dedicated pages below to inspect architectural case studies, run ISO 8583 simulator scenarios, review corporate history, or filter technical skills.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {sectionCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`p-6 rounded-2xl border border-[#152342] bg-[#080E1E]/85 ${card.border} transition-all group flex flex-col justify-between space-y-4 glass-metal`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${card.color}`}>
                      {isPt ? card.badgePt : card.badgeEn}
                    </span>
                    <IconComponent className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00D47E] transition-colors">
                    {isPt ? card.titlePt : card.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isPt ? card.descPt : card.descEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#152342]/80 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-[#00D47E]">
                  <span>{isPt ? 'Abrir página dedicada' : 'Open dedicated page'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
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
                      ? 'Consistência transacional entre autorização online síncrona e clearing em lote via padrão Outbox'
                      : 'Transactional consistency between synchronous online authorization and batch clearing via Outbox pattern'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D47E] shrink-0" />
                  <span>
                    {isPt
                      ? 'Emuladores de bandeira para testes de carga e pré-certificação com excelente custo-benefício'
                      : 'Scheme emulator harnesses for cost-effective pre-certification load tests'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D47E] shrink-0" />
                  <span>
                    {isPt
                      ? 'Diagnóstico de deadlocks distribuídos e otimização fina de pools de conexão no PostgreSQL'
                      : 'Troubleshooting distributed deadlocks and tuning PostgreSQL connection pools'}
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
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-[#00D47E] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" /> {isPt ? 'Resiliência' : 'Resilience'}
                </div>
                <h3 className="text-white font-bold text-sm">Transactional Outbox &amp; ShedLock</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Prevenção de falhas de dual-write com persistência relacional Outbox, streaming CDC e travas distribuídas para idempotência estrita em requisições duplicadas de gateway.'
                    : 'Preventing dual-write failures with relational outbox persistence, CDC streaming, and distributed locks for strict idempotency on duplicate gateway requests.'}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#152342] bg-[#080E1E] space-y-2 glass-metal">
                <div className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> {isPt ? 'Criptografia' : 'Cryptography'}
                </div>
                <h3 className="text-white font-bold text-sm">
                  {isPt ? 'Simulação de Hardware Security Module (HSM)' : 'Hardware Security Module (HSM) Simulation'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isPt
                    ? 'Gerenciamento de chaves simétricas com hierarquias TMK, ZPK e LMK. Tradução de PIN blocks em memória volátil segura sem nunca persistir o PIN do portador.'
                    : 'Symmetric key management with TMK, ZPK, and LMK hierarchies. Translating PIN blocks in secure volatile memory without persisting cardholder PIN data.'}
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
                    ? 'Pipelines Spring Batch projetados para processar transações em layouts posicionais padronizados (Visa Base II TC50) com batimento automatizado de taxas.'
                    : 'Spring Batch pipelines capable of streaming transactions into standardized positional layouts (Visa Base II TC50) with automated fee balancing.'}
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

