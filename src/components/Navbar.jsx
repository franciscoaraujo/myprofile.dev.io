'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Sun, Moon, FileText, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLanguage, theme, toggleTheme } = useApp();
  const isPt = lang === 'pt';

  const navLinks = [
    { href: '/', labelEn: 'Overview', labelPt: 'Visão Geral' },
    { href: '/projects', labelEn: 'Projects (Case Studies)', labelPt: 'Projetos (Estudos de Caso)' },
    { href: '/simulator', labelEn: 'Payment Systems Lab', labelPt: 'Payment Systems Lab', isHighlight: true },
    { href: '/experience', labelEn: 'Experience', labelPt: 'Experiência' },
    { href: '/skills', labelEn: 'Skills Matrix', labelPt: 'Matriz de Habilidades' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#152342]/90 bg-[#040711]/90 backdrop-blur-md no-print">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 py-3.5 flex items-center justify-between gap-4">
        {/* Corporate Brand Mark */}
        <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="Francisco Araújo Home">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-[#00D47E] to-cyan-400 p-[1.5px] shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#040711] rounded-[10px] flex items-center justify-center font-mono font-black text-white text-sm">
              <span className="text-[#00D47E]">F</span>A
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-slate-200 whitespace-nowrap">
                Francisco Araújo
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00D47E]/10 text-[#00D47E] border border-[#00D47E]/30 uppercase whitespace-nowrap">
                Senior IC
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
              {isPt ? 'Engenheiro Backend Sênior' : 'Senior Backend Engineer'}
            </span>
          </div>
        </Link>

        {/* Executive Desktop Navigation (M3 Pill Active Indicators) */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-mono text-slate-300">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            if (item.isHighlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap font-semibold border ${
                    isActive
                      ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-sm'
                      : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/40 border-cyan-500/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {isPt ? item.labelPt : item.labelEn}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#081229] text-[#00D47E] border border-[#00D47E]/40 font-bold shadow-sm'
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isPt ? item.labelPt : item.labelEn}
              </Link>
            );
          })}
        </nav>

        {/* Actions & CTAs (M3 Pill Chips & Filled Buttons) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Toggle Switch (EN / PT) */}
          <button
            type="button"
            onClick={toggleLanguage}
            id="lang-toggle"
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#384152] bg-[#1A2130] hover:bg-[#232B3D] hover:border-[#00D47E]/60 text-xs font-mono transition-all group select-none shadow-sm cursor-pointer"
            title={isPt ? 'Alternar idioma para Inglês (EN)' : 'Switch language to Portuguese (PT-BR)'}
            aria-label="Switch Language (EN / PT)"
          >
            <Globe className="w-3.5 h-3.5 text-[#00D47E]" />
            <span id="lang-text" className="text-[11px] font-bold text-slate-200">
              {isPt ? 'PT' : 'EN'}
            </span>
          </button>

          {/* Theme Toggle Switch (M3 Switch Track & Thumb) */}
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle"
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#384152] bg-[#1A2130] hover:bg-[#232B3D] hover:border-[#00D47E]/60 text-xs font-mono transition-all group select-none shadow-sm cursor-pointer"
            title="Toggle Dark / Light Theme"
            aria-label="Toggle Theme"
          >
            <div className="relative w-7 h-3.5 rounded-full bg-[#111622] border border-[#384152] flex items-center p-0.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${
                  theme === 'light' ? 'translate-x-3.5 bg-amber-500' : 'translate-x-0 bg-[#00D47E]'
                }`}
              ></div>
            </div>
            <span className="flex items-center gap-1 text-slate-300">
              {theme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="text-[11px] font-bold">
                {theme === 'light' ? (isPt ? 'Claro' : 'Light') : isPt ? 'Escuro' : 'Dark'}
              </span>
            </span>
          </button>

          {/* CV / Resume Action */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Print / Export Engineering CV"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#384152] bg-[#1A2130] hover:bg-[#232B3D] hover:border-slate-500 text-xs font-mono text-slate-300 transition-all whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{isPt ? 'Currículo (PDF)' : 'Resume (PDF)'}</span>
          </button>

          {/* Contact CTA (M3 Primary Filled Pill Button) */}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00D47E] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isPt ? 'Entrar em Contato' : 'Get in Touch'}</span>
          </Link>
        </div>
      </div>

      {/* Mobile & Tablet Page Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden border-t border-[#384152]/80 bg-[#151B28]/95 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono"
      >
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#00D47E]/15 text-[#00D47E] border border-[#00D47E]/40 font-bold'
                  : 'text-slate-300 hover:text-white bg-[#1A2130] border border-[#384152]'
              }`}
            >
              {isPt ? item.labelPt : item.labelEn}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

