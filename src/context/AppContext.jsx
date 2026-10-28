'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const AppContext = createContext({
  lang: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  theme: 'dark',
  toggleTheme: () => {},
  copyEmail: () => {},
});

export function AppProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [theme, setThemeState] = useState('dark');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'pt' || savedLang === 'en') {
      setLangState(savedLang);
      document.documentElement.setAttribute('lang', savedLang === 'pt' ? 'pt-BR' : 'en');
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (mode) => {
    const html = document.documentElement;
    if (mode === 'light') {
      html.classList.remove('dark');
      html.classList.add('light-mode');
      setThemeState('light');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      html.classList.remove('light-mode');
      setThemeState('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setLanguage = (nextLang) => {
    const normalized = nextLang === 'pt' ? 'pt' : 'en';
    setLangState(normalized);
    localStorage.setItem('lang', normalized);
    document.documentElement.setAttribute('lang', normalized === 'pt' ? 'pt-BR' : 'en');
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'pt' ? 'en' : 'pt');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const copyEmail = () => {
    const email = 'chicoaraujo1063@gmail.com';
    const isPt = lang === 'pt';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          showToast(
            isPt
              ? 'E-mail (chicoaraujo1063@gmail.com) copiado!'
              : 'Email (chicoaraujo1063@gmail.com) copied to clipboard!'
          );
        })
        .catch(() => {
          showToast(isPt ? 'E-mail: ' + email : 'Email: ' + email);
        });
    } else {
      showToast(isPt ? 'E-mail: ' + email : 'Email: ' + email);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLanguage,
        toggleLanguage,
        theme,
        toggleTheme,
        copyEmail,
      }}
    >
      {children}

      {/* Notification Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-out flex items-center gap-3 px-5 py-3 rounded-xl bg-[#080E1E] text-white border border-[#00D47E]/40 shadow-2xl glass-metal ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 text-[#00D47E]" />
        <span className="text-xs font-mono font-medium">{toastMessage || ''}</span>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

