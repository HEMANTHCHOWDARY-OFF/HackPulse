// HackPulse Theme Initializer
// Runs immediately to prevent flash of wrong theme

(function () {
    try {
        const path = window.location.pathname;
        const isAuthPage = path.includes('login') || path.includes('signup');

        let savedTheme = localStorage.getItem('theme') || 'light';

        // Force dark mode for auth pages
        if (isAuthPage) {
            savedTheme = 'dark';
        }

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
