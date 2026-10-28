/**
 * OrionPay Interactive Architecture Showcase Component
 * Renders technical case studies with problem statements, architectural decisions, and explicit limitations.
 */

function switchOrionTab(tabKey) {
    if (typeof orionData === 'undefined' || !orionData[tabKey]) return;
    window.activeOrionTab = tabKey;
    const isPt = window.currentLang === 'pt';
    const data = (isPt && typeof orionDataPt !== 'undefined' && orionDataPt[tabKey])
        ? orionDataPt[tabKey]
        : orionData[tabKey];

    // Update Tab Button States
    document.querySelectorAll('.orion-tab-btn').forEach(btn => {
        btn.classList.remove('border-[#00D47E]', 'bg-[#080E1E]', 'shadow-lg');
        btn.classList.add('border-[#152342]', 'bg-[#080E1E]/50');
    });

    const activeBtn = document.getElementById(`tab-btn-${tabKey}`);
    if (activeBtn) {
        activeBtn.classList.add('border-[#00D47E]', 'bg-[#080E1E]', 'shadow-lg');
        activeBtn.classList.remove('border-[#152342]', 'bg-[#080E1E]/50');
    }

    const card = document.getElementById('orion-content-card');
    if (!card) return;
    
    const flowHtml = data.flow.map((step, idx) => `
        <div class="flex items-center gap-1.5 font-mono text-[11px] text-[#00D47E] bg-[#040711] px-2.5 py-1 rounded border border-[#152342]">
            <span>${idx + 1}. ${step}</span>
        </div>
    `).join('<span class="text-slate-600 font-mono text-xs">→</span>');

    const decisionsHtml = data.decisions.map(d => `
        <div class="p-3.5 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
            <div class="text-xs font-bold text-white flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#00D47E]"></span>
                ${d.topic}
            </div>
            <p class="text-xs text-slate-300 leading-relaxed pl-3.5">${d.detail}</p>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#152342] pb-4">
            <div>
                <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00D47E]">${data.stack}</span>
                <h3 class="text-xl sm:text-2xl font-black text-white mt-0.5">${data.title}</h3>
            </div>
            <span class="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold">
                ${data.status}
            </span>
        </div>

        <!-- Problem Statement -->
        <div class="p-3.5 rounded-xl bg-[#0B132B]/40 border border-blue-900/40 space-y-1">
            <div class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> ${isPt ? 'O Problema de Engenharia' : 'The Engineering Problem'}
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">${data.problem}</p>
        </div>

        <!-- Summary -->
        <p class="text-sm text-slate-300 leading-relaxed font-normal">
            ${data.summary}
        </p>

        <!-- Sequential Pipeline -->
        <div class="p-3.5 rounded-xl bg-[#040711] border border-[#152342]">
            <div class="text-[10px] uppercase font-mono text-slate-500 mb-2 font-semibold">${isPt ? 'Pipeline de Execução:' : 'Execution Pipeline:'}</div>
            <div class="flex flex-wrap items-center gap-2">
                ${flowHtml}
            </div>
        </div>

        <!-- Architectural Decisions -->
        <div class="space-y-2.5 pt-1">
            <div class="text-xs font-mono uppercase text-slate-400 font-semibold">${isPt ? 'Decisões Arquiteturais &amp; Recuperação de Falhas:' : 'Key Architectural Decisions &amp; Failure Recovery:'}</div>
            <div class="space-y-2">
                ${decisionsHtml}
            </div>
        </div>

        <!-- Known Limitations & Scope -->
        <div class="p-3 rounded-xl bg-[#060B17] border border-amber-900/30 text-xs space-y-1">
            <div class="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> ${isPt ? 'Escopo de Testes &amp; Restrições de Engenharia' : 'Test Scope &amp; Engineering Constraints'}
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">${data.limitations}</p>
        </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}
