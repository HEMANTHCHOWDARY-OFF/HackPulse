// HackPulse Theme Initializer
// Runs immediately to prevent flash of wrong theme

(function () {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Prevent transition flash
        const style = document.createElement('style');
        style.innerHTML = '* { transition: none !important; }';
        style.id = 'theme-transition-blocker';
        document.head.appendChild(style);

        window.addEventListener('load', () => {
            requestAnimationFrame(() => {
                const blocker = document.getElementById('theme-transition-blocker');
                if (blocker) blocker.remove();
            });
        });
    } catch (e) {
        console.error('Theme init failed:', e);
    }
})();
