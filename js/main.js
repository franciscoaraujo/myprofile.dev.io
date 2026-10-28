/**
 * Main Application Bootstrap
 * Orchestrates themes, data components, and lifecycle events
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme (Dark by default or restore from localStorage)
    if (typeof initTheme === 'function') {
        initTheme();
    }

    // 2. Initialize OrionPay Architecture Explorer
    if (typeof switchOrionTab === 'function') {
        switchOrionTab('switch');
    }

    // 3. Initialize Skills & Technical Matrix
    if (typeof filterSkills === 'function') {
        filterSkills('all');
    }

    // 4. Initialize Language (EN by default or restore PT/EN from localStorage)
    if (typeof initLanguage === 'function') {
        initLanguage();
    }

    // 5. Render Icons via Lucide
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    // 5. Update Current Year in Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
