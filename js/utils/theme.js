/**
 * Theme Management Module (Dark / Light Mode)
 * Persists user preference via localStorage
 */

function setTheme(mode) {
    const html = document.documentElement;
    const knob = document.getElementById('theme-knob');
    const sunIcon = document.getElementById('theme-sun-icon');
    const moonIcon = document.getElementById('theme-moon-icon');
    const themeText = document.getElementById('theme-text');

    if (mode === 'light') {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (knob) knob.style.transform = 'translateX(16px)';
        if (sunIcon) sunIcon.classList.remove('hidden');
        if (moonIcon) moonIcon.classList.add('hidden');
        if (themeText) {
            themeText.textContent = window.currentLang === 'pt' ? 'Claro' : 'Light';
            themeText.classList.remove('text-slate-300');
            themeText.classList.add('text-slate-800');
        }
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (knob) knob.style.transform = 'translateX(0px)';
        if (sunIcon) sunIcon.classList.add('hidden');
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (themeText) {
            themeText.textContent = window.currentLang === 'pt' ? 'Escuro' : 'Dark';
            themeText.classList.add('text-slate-300');
            themeText.classList.remove('text-slate-800');
        }
    }

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}
