'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { lang } = useApp();
  const isPt = lang === 'pt';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#152342] bg-[#020409] py-8 text-xs text-slate-400 font-mono no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00D47E]"></span>
          <span className="text-slate-300 font-semibold">Francisco José Oliveira Araújo</span>
          <span>&bull; {isPt ? 'Engenheiro Backend Sênior' : 'Senior Backend Engineer'}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <Link href="/" className="hover:text-[#00D47E] transition-colors">
            {isPt ? 'Visão Geral' : 'Overview'}
          </Link>
          <Link href="/projects" className="hover:text-[#00D47E] transition-colors">
            {isPt ? 'Projetos' : 'Projects'}
          </Link>
          <Link href="/simulator" className="hover:text-cyan-400 transition-colors">
            {isPt ? 'Demo do Switch' : 'Switch Demo'}
          </Link>
          <Link href="/experience" className="hover:text-[#00D47E] transition-colors">
            {isPt ? 'Experiência' : 'Experience'}
          </Link>
          <Link href="/skills" className="hover:text-[#00D47E] transition-colors">
            {isPt ? 'Habilidades' : 'Skills'}
          </Link>
          <Link href="/contact" className="hover:text-[#00D47E] transition-colors">
            {isPt ? 'Contato' : 'Contact'}
          </Link>
        </div>

        <div className="text-center md:text-right">
          &copy; <span>{year}</span> &bull;{' '}
          {isPt
            ? 'Processamento de Pagamentos, Sistemas Financeiros & Arquitetura Distribuída'
            : 'Payment Processing, Financial Systems & Distributed Architecture'}
        </div>
      </div>
    </footer>
  );
}

