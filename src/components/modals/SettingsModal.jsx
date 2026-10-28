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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden zoom-in-95 transform duration-200 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <i className="fa-solid fa-gear text-indigo-400"></i>
            Configuração do Backend
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-gray-300">
          <div className="space-y-1.5">
            <label className="font-medium">Base API URL</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-xs"
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder="http://localhost:8085"
            />
            <p className="text-[10px] text-gray-500">Usado para login e chamadas REST.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium">WebSocket Endpoint</label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-xs"
              value={config.wsUrl}
              onChange={(e) => setConfig({ ...config, wsUrl: e.target.value })}
              placeholder="http://localhost:8085/ws-orionpay"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium flex justify-between">
              <span>Auto Health Check Path</span>
              <span className="text-[9px] text-indigo-400 font-mono">NOVO</span>
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-xs"
              value={config.healthPath}
              onChange={(e) => setConfig({ ...config, healthPath: e.target.value })}
              placeholder="/actuator/health"
            />
            <p className="text-[10px] text-gray-500">Monitora o status REAL das filas via Spring Actuator.</p>
          </div>

          <hr className="border-gray-800 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium">E-mail</label>
              <input
                type="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium">Senha</label>
              <input
                type="password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                value={config.pass}
                onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-900/50 p-3 rounded-lg mt-4 text-xs text-blue-300 leading-relaxed flex gap-2">
            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
            <p>
              Ao salvar, a aplicação irá recarregar a página para reestabelecer a conexão com as novas credenciais.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-950 px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition-all text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-save"></i>
            Salvar &amp; Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

