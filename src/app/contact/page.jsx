'use client';

import React from 'react';
import { Mail, Copy, Linkedin, Github, MapPin, Phone, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ContactPage() {
  const { lang, copyEmail } = useApp();
  const isPt = lang === 'pt';

  return (
    <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#00D47E]/40 bg-gradient-to-b from-[#080E1E] via-[#060B17] to-[#040711] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl glass-metal">
        <div
          className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-[#00D47E]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D47E]/10 text-[#00D47E] border border-[#00D47E]/30 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00D47E] animate-pulse"></span>
          {isPt
            ? 'Disponível para Vagas de Engenheiro Backend Sênior & Pagamentos'
            : 'Available for Senior Backend & Payments Engineering Roles'}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isPt
            ? 'Vamos Conversar sobre Oportunidades Backend Sênior'
            : 'Let’s Connect for Senior Backend Opportunities'}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          {isPt
            ? 'Estou avaliando ativamente oportunidades como Senior Backend Engineer, Java Engineer e Engenheiro de Pagamentos / Sistemas Distribuídos em equipes internacionais e no Brasil (Remoto Global ou Realocação).'
            : 'I am actively considering Senior Backend Engineer, Java Engineer, and Payments / Distributed Systems roles with Canadian and international teams (Remote Worldwide or Relocation).'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap justify-center gap-3.5 pt-4">
          <a
            href="mailto:chicoaraujo1063@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00D47E] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Email: chicoaraujo1063@gmail.com</span>
          </a>

          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] text-white font-medium text-xs font-mono transition-all"
          >
            <Copy className="w-4 h-4 text-[#00D47E]" />
            <span>{isPt ? 'Copiar E-mail' : 'Copy Email'}</span>
          </button>

          <a
            href="https://www.linkedin.com/in/francisco-jos%C3%A9-oliveira-araujo-b0185772/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] text-white font-medium text-xs font-mono transition-all"
          >
            <Linkedin className="w-4 h-4 text-blue-400" />
            <span>{isPt ? 'Perfil no LinkedIn' : 'LinkedIn Profile'}</span>
          </a>

          <a
            href="https://github.com/orgs/Orion-Payments/repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#152342] bg-[#080E1E] hover:bg-[#0D172F] text-white font-medium text-xs font-mono transition-all"
          >
            <Github className="w-4 h-4 text-slate-300" />
            <span>{isPt ? 'Repositórios GitHub' : 'GitHub Repositories'}</span>
          </a>
        </div>

        <div className="text-xs font-mono text-slate-400 pt-6 flex flex-wrap justify-center items-center gap-6 border-t border-[#152342]">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00D47E]" /> Barueri, SP &bull; {isPt ? 'Brasil' : 'Brazil'}
          </span>
          <a href="tel:+5511994554739" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-cyan-400" /> +55 11 99455-4739
          </a>
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />{' '}
            {isPt ? 'Fuso Horário: UTC-3 (São Paulo / BRT)' : 'Timezone: UTC-3 (São Paulo / BRT)'}
          </span>
        </div>
      </div>
    </section>
  );
}

