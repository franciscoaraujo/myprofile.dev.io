'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [config, setConfig] = useState({
    apiUrl: 'http://192.168.15.187:8085',
    wsUrl: 'http://192.168.15.187:8085/ws-orionpay-live',
    healthPath: '/actuator/health',
    email: 'chicoaraujo1063@gmail.com',
    pass: 'Admin@123456',
  });

  useEffect(() => {
    const saved = localStorage.getItem('orionpay-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          healthPath: parsed.healthPath || '/actuator/health',
        }));
      } catch (e) {}
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('orionpay-config', JSON.stringify(config));
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A2130] border border-[#384152] w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden zoom-in-95 transform duration-200 transition-all">
        {/* Header */}
        <div className="bg-[#232B3D] px-6 py-4 border-b border-[#384152] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <i className="fa-solid fa-gear text-indigo-400"></i>
            Configuração do Backend
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2E374D] transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-gray-300">
          <div className="space-y-1.5">
            <label className="font-medium">Base API URL</label>
            <input
              type="text"
              className="w-full bg-[#111622] border border-[#384152] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all font-mono text-xs"
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder="http://localhost:8085"
            />
            <p className="text-[10px] text-gray-400">Usado para login e chamadas REST.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium">WebSocket Endpoint</label>
            <input
              type="text"
              className="w-full bg-[#111622] border border-[#384152] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all font-mono text-xs"
              value={config.wsUrl}
              onChange={(e) => setConfig({ ...config, wsUrl: e.target.value })}
              placeholder="http://localhost:8085/ws-orionpay"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium flex justify-between">
              <span>Auto Health Check Path</span>
              <span className="text-[9px] text-indigo-300 font-mono">NOVO</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#111622] border border-[#384152] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all font-mono text-xs"
              value={config.healthPath}
              onChange={(e) => setConfig({ ...config, healthPath: e.target.value })}
              placeholder="/actuator/health"
            />
            <p className="text-[10px] text-gray-400">Monitora o status REAL das filas via Spring Actuator.</p>
          </div>

          <hr className="border-[#384152] my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium">E-mail</label>
              <input
                type="email"
                className="w-full bg-[#111622] border border-[#384152] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-400 text-xs"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium">Senha</label>
              <input
                type="password"
                className="w-full bg-[#111622] border border-[#384152] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-400 text-xs"
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-800/50 p-3.5 rounded-2xl mt-4 text-xs text-blue-200 leading-relaxed flex gap-2">
            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
            <p>
              Ao salvar, a aplicação irá recarregar a página para reestabelecer a conexão com as novas credenciais.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#151B28] px-6 py-4 border-t border-[#384152] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#232B3D] rounded-full transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-full shadow-lg shadow-indigo-900/30 transition-all text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-save"></i>
            Salvar &amp; Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

