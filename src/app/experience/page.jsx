'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, TrendingUp, Landmark, Shield, ArrowRight, Layers, Cpu, Code2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EXPERIENCE_DATA, CAREER_ERAS } from '../../data/portfolio-data';

export default function ExperiencePage() {
  const { lang } = useApp();
  const isPt = lang === 'pt';

  return (
    <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3 mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-xs">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isPt ? 'Trajetória Profissional de 13 Anos' : '13-Year Verifiable Career Trajectory'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isPt ? 'Experiência Profissional & Trajetória' : 'Professional Experience & Career History'}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {isPt
            ? '13 anos de evolução contínua em backend: desde a fundação técnica em baixo nível e visão computacional em C++, passando por escala bancária corporativa (Rabobank, B3, Serasa Experian), até a especialização sênior em adquirência e motores transacionais de meios de pagamento.'
            : '13 years of continuous backend evolution: from foundational low-level systems & computer vision in C++, through enterprise banking scale (Rabobank, B3, Serasa Experian), to senior specialization in transaction acquiring & payment engines.'}
        </p>
      </div>

      {/* 3 Career Eras / Narrative Hierarchy */}
      <div className="mb-14">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{isPt ? 'Narrativa de Carreira • 3 Fases de Maturidade Técnica' : 'Career Narrative • 3 Technical Maturity Eras'}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {CAREER_ERAS.map((era) => {
            const isPayments = era.id === 'era-payments';
            const isCorporate = era.id === 'era-corporate';
            const borderColor = isPayments
              ? 'border-[#00D47E]/40 hover:border-[#00D47E]'
              : isCorporate
              ? 'border-cyan-500/40 hover:border-cyan-400'
              : 'border-indigo-500/40 hover:border-indigo-400';
            const badgeColor = isPayments
              ? 'text-[#00D47E] bg-emerald-950/80 border-emerald-700/60'
              : isCorporate
              ? 'text-cyan-300 bg-cyan-950/80 border-cyan-700/60'
              : 'text-indigo-300 bg-indigo-950/80 border-indigo-700/60';
            const Icon = isPayments ? Cpu : isCorporate ? Landmark : Code2;

            return (
              <div
                key={era.id}
                className={`p-5 rounded-2xl border bg-[#080E1E]/90 ${borderColor} transition-all space-y-3 glass-metal flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                      {isPt ? era.badgePt : era.badgeEn}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {isPt ? era.eraPt : era.eraEn}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    {isPt ? era.periodPt : era.periodEn}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {isPt ? era.descPt : era.descEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#152342] flex flex-wrap gap-1.5">
                  {era.institutions.map((inst) => (
                    <span
                      key={inst}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#040711] text-slate-300 border border-[#152342]"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological Timeline */}
      <div className="space-y-4 mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#00D47E]" />
          <span>{isPt ? 'Histórico Cronológico Detalhado' : 'Detailed Chronological Timeline'}</span>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l border-[#152342] ml-4 sm:ml-8 space-y-10">
        {EXPERIENCE_DATA.map((job, idx) => (
          <div key={job.company} className="relative pl-6 sm:pl-10 group">
            <span
              className={`absolute -left-3 top-2 w-6 h-6 rounded-full bg-[#040711] border-2 flex items-center justify-center ${
                job.current
                  ? 'border-[#00D47E]'
                  : idx === 1
                  ? 'border-blue-500'
                  : 'border-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  job.current
                    ? 'bg-[#00D47E] animate-pulse'
                    : idx === 1
                    ? 'bg-blue-400'
                    : 'bg-slate-400'
                }`}
              ></span>
            </span>

            <div className="p-6 rounded-2xl border border-[#152342] bg-[#080E1E]/80 hover:border-[#00D47E]/50 transition-all space-y-4 glass-metal">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">{job.company}</h2>
                    {job.current && (
                      <span className="text-xs font-mono font-bold text-[#00D47E] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60">
                        {isPt ? job.badgePt : job.badgeEn}
                      </span>
                    )}
                    {job.eraBadgePt && (
                      <span className="text-[10px] font-mono text-slate-300 bg-[#040711] px-2 py-0.5 rounded border border-[#152342]">
                        {isPt ? job.eraBadgePt : job.eraBadgeEn}
                      </span>
                    )}
                    {job.domainEn && (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {isPt ? job.domainPt : job.domainEn}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-semibold mt-0.5 ${
                      job.current ? 'text-[#00D47E]' : idx === 1 ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    {isPt ? job.rolePt : job.roleEn}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-[#040711] px-3 py-1 rounded-full border border-[#152342]">
                  {isPt ? job.periodPt : job.periodEn}
                </span>
              </div>

              {job.descEn && (
                <p className="text-sm text-slate-300 leading-relaxed">{isPt ? job.descPt : job.descEn}</p>
              )}

              {job.clients && (
                <div className="space-y-3 pt-1">
                  {job.clients.map((client, cIdx) => {
                    const ClientIcon = cIdx === 0 ? TrendingUp : cIdx === 1 ? Landmark : Shield;
                    const textColor =
                      cIdx === 0 ? 'text-[#00D47E]' : cIdx === 1 ? 'text-cyan-400' : 'text-indigo-400';
                    return (
                      <div
                        key={client.nameEn}
                        className="p-4 rounded-xl bg-[#040711] border border-[#152342] hover:border-[#00D47E]/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className={`text-xs font-bold ${textColor} font-mono uppercase tracking-wider flex items-center gap-2`}>
                            <ClientIcon className="w-3.5 h-3.5" />
                            <span>{isPt ? client.namePt : client.nameEn}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {isPt ? client.sectorPt : client.sectorEn}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300">
                          {isPt ? client.descPt : client.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {job.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#040711] text-slate-300 border border-[#152342]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation CTA */}
      <div className="mt-12 p-6 rounded-2xl border border-[#152342] bg-[#080E1E]/90 flex flex-wrap items-center justify-between gap-4 glass-metal">
        <div>
          <h3 className="text-base font-bold text-white">
            {isPt ? 'Explore a Matriz de Habilidades Técnicas' : 'Explore the Technical Skills Matrix'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPt
              ? 'Veja as competências técnicas centrais organizadas por domínio com evidências verificáveis de produção corporativa e projetos autorais.'
              : 'Browse core technical competencies structured by domain with verifiable evidence across corporate production and authorial projects.'}
          </p>
        </div>
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D47E] to-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider"
        >
          <span>{isPt ? 'Ir para Matriz de Habilidades' : 'Go to Skills Matrix'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

