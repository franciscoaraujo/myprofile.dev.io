/**
 * OrionPay Interactive Architecture Showcase Component
 */

function switchOrionTab(tabKey) {
    if (typeof orionData === 'undefined' || !orionData[tabKey]) return;
    const data = orionData[tabKey];

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

    const highlightsHtml = data.highlights.map(h => `
        <div class="p-3.5 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
            <div class="text-xs font-bold text-white flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#00D47E]"></span>
                ${h.label}
            </div>
            <p class="text-xs text-slate-400 leading-relaxed pl-3.5">${h.desc}</p>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#152342] pb-4">
            <div>
                <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00D47E]">${data.stack}</span>
                <h3 class="text-xl sm:text-2xl font-black text-white mt-0.5">${data.title}</h3>
            </div>
            <span class="px-3 py-1 rounded-full bg-[#00D47E]/10 border border-[#00D47E]/30 text-[#00D47E] text-xs font-mono font-bold">
                ${data.badge}
            </span>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed font-normal">
            ${data.summary}
        </p>

        <!-- Flow strip -->
        <div class="p-3.5 rounded-xl bg-[#040711] border border-[#152342]">
            <div class="text-[10px] uppercase font-mono text-slate-500 mb-2">Pipeline Sequencial:</div>
            <div class="flex flex-wrap items-center gap-2">
                ${flowHtml}
            </div>
        </div>

        <!-- Deep highlights -->
        <div class="space-y-2.5 pt-1">
            <div class="text-xs font-mono uppercase text-slate-400 font-semibold">Destaques de Implementação:</div>
            <div class="space-y-2">
                ${highlightsHtml}
            </div>
        </div>
    `;

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}
