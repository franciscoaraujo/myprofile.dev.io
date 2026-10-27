/**
 * Skills & Technical Specializations Matrix Component
 */

function filterSkills(category) {
    if (typeof skillList === 'undefined') return;

    const buttons = document.querySelectorAll('#skill-filter-buttons .skill-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-cat') === category) {
            btn.classList.add('bg-[#00D47E]', 'text-slate-950', 'font-bold', 'shadow-md');
            btn.classList.remove('bg-[#080E1E]', 'text-slate-300');
        } else {
            btn.classList.remove('bg-[#00D47E]', 'text-slate-950', 'font-bold', 'shadow-md');
            btn.classList.add('bg-[#080E1E]', 'text-slate-300');
        }
    });

    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    const filtered = category === 'all' 
        ? skillList 
        : skillList.filter(s => s.cat === category);

    grid.innerHTML = filtered.map(skill => `
        <div class="p-3.5 rounded-xl border border-[#152342] bg-[#080E1E]/80 hover:border-[#00D47E]/60 hover:bg-[#0D172F] transition-all flex flex-col justify-between group">
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-[#00D47E] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-900/60">${skill.badge}</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#00D47E] transition-colors"></span>
                </div>
                <h4 class="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">${skill.name}</h4>
            </div>
            <p class="text-[10px] text-slate-400 mt-2 font-mono leading-tight">${skill.desc}</p>
        </div>
    `).join('');

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}
