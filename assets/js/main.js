// Imports removed for global scope compatibility

// Main Logic
document.addEventListener('DOMContentLoaded', () => {
    console.log("HackPulse Initialized");

    // Theme Logic
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };

    const updateThemeIcon = (theme) => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (theme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        }
    };

    initTheme();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // Smooth scrolling for anchor links removed for multi-page nav

    // Render Hackathons if grid exists
    const hackathonGrid = document.getElementById('hackathons-grid');
    if (hackathonGrid) {
        renderHackathons(hackathons);
        // Apply Magic Bento Spotlight
        initGlobalSpotlight(hackathonGrid, { glowColor: '132, 0, 255' });
    }

    // Render Winners if grid exists
    const winnersGrid = document.getElementById('winners-grid');
    if (winnersGrid) {
        renderWinners(winners);
        initGlobalSpotlight(winnersGrid, { glowColor: '255, 215, 0' }); // Gold for winners
    }

    // Render Team Requests if grid exists
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        renderTeamRequests(teamRequests);
        initGlobalSpotlight(teamGrid, { glowColor: '0, 255, 136' }); // Green for team
    }

    // Render Profile if elements exist (moved from modal to page)
    const profileName = document.getElementById('profile-name');
    if (profileName) {
        renderProfile();
        const profileStats = document.querySelector('.profile-stats');
        if (profileStats) initGlobalSpotlight(profileStats, { glowColor: '0, 150, 255' });
    }

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                if (filterValue === 'all') {
                    renderHackathons(hackathons);
                } else {
                    const filtered = hackathons.filter(h =>
                        h.mode.includes(filterValue) ||
                        h.tags.includes(filterValue)
                    );
                    renderHackathons(filtered);
                }
            });
        });
    }

    // Scroll Indicator Logic
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '0.8';
                scrollIndicator.style.pointerEvents = 'all';
            }
        });
    }
});

function renderHackathons(data) {
    const grid = document.getElementById('hackathons-grid');
    if (!grid) return;

    grid.innerHTML = data.map(hack => `
        <div class="glass-card hackathon-card fade-in" style="position: relative; overflow: hidden;">
            <img src="${hack.image}" alt="${hack.title}" class="hackathon-img">
            <div class="hackathon-info">
                <h3>${hack.title}</h3>
                <div class="hackathon-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${hack.date}</span>
                </div>
                <div class="hackathon-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${hack.mode}</span>
                </div>
                <div class="timer-badge" id="timer-${hack.id}">
                    <i class="far fa-clock"></i> Loading...
                </div>
                <div class="tags">
                    ${hack.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: auto;">Apply Now</button>
            </div>
        </div>
    `).join('');

    // Apply Magic Bento Effects
    const cards = grid.querySelectorAll('.hackathon-card');
    cards.forEach(card => {
        attachBentoEffect(card, {
            enableStars: true,
            enableTilt: true,
            clickEffect: true,
            enableMagnetism: true,
            glowColor: '132, 0, 255', // Purple
            enableBorderGlow: true
        });
    });

    // Start timers after rendering
    startCountdowns(data);
}

function renderWinners(data) {
    const grid = document.getElementById('winners-grid');
    if (!grid) return;

    grid.innerHTML = data.map(winner => `
        <div class="glass-card winner-card fade-in" style="position: relative; overflow: hidden;">
            <img src="${winner.image}" alt="${winner.teamName}" class="winner-img">
            <div class="winner-info">
                <h3>${winner.teamName}</h3>
                <span class="winner-project">🏆 ${winner.project}</span>
                <div class="team-members">
                    ${winner.members.map(m => `<span class="member-badge">${m}</span>`).join('')}
                </div>
                <div style="margin-top: 10px;">
                    <a href="${winner.repo}" class="text-gradient" style="font-size: 0.9rem; margin-right: 10px;"><i class="fab fa-github"></i> Mono</a>
                    <a href="${winner.demo}" class="text-gradient" style="font-size: 0.9rem;"><i class="fas fa-external-link-alt"></i> Demo</a>
                </div>
            </div>
        </div>
    `).join('');

    // Apply Magic Bento Effects
    const cards = grid.querySelectorAll('.winner-card');
    cards.forEach(card => {
        attachBentoEffect(card, {
            enableStars: true,
            enableTilt: true,
            clickEffect: true,
            enableMagnetism: true,
            glowColor: '255, 215, 0' // Gold
        });
    });
}

function renderTeamRequests(data) {
    const grid = document.getElementById('team-grid');
    if (!grid) return;

    grid.innerHTML = data.map(req => `
        <div class="glass-card team-card fade-in" style="position: relative; overflow: hidden;">
            <img src="${req.avatar}" alt="${req.user}" class="user-avatar">
            <div class="team-info">
                <h3>${req.user}</h3>
                <span class="role-badge">${req.role}</span>
                <div class="looking-for">
                    Looking for: <span>${req.lookingFor.join(', ')}</span>
                </div>
                <button class="btn-primary" style="padding: 5px 15px; font-size: 0.8rem; margin-top: 10px;">Connect</button>
            </div>
        </div>
    `).join('');

    // Apply Magic Bento Effects
    const cards = grid.querySelectorAll('.team-card');
    cards.forEach(card => {
        attachBentoEffect(card, {
            enableStars: true,
            enableTilt: true,
            clickEffect: true,
            enableMagnetism: true,
            glowColor: '0, 255, 136' // Green
        });
    });
}

// Countdown Logic
function startCountdowns(hackathons) {
    setInterval(() => {
        hackathons.forEach(hack => {
            const el = document.getElementById(`timer-${hack.id}`);
            if (el) {
                const deadline = new Date(hack.deadline).getTime();
                const now = new Date().getTime();
                const diff = deadline - now;

                if (diff < 0) {
                    el.innerHTML = "Expired";
                    el.classList.add('expired');
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                    el.innerHTML = `<i class="far fa-clock"></i> ${days}d ${hours}h ${minutes}m left`;
                }
            }
        });
    }, 1000);
}

function renderProfile() {
    const nameEl = document.getElementById('profile-name');
    if (!nameEl) return;

    nameEl.textContent = currentUser.name;
    document.getElementById('profile-role').textContent = currentUser.role;
    document.getElementById('stat-hackathons').textContent = currentUser.hackathons;
    document.getElementById('stat-wins').textContent = currentUser.wins;
    document.getElementById('stat-projects').textContent = currentUser.projects;

    document.getElementById('profile-skills').innerHTML = currentUser.skills
        .map(skill => `<span class="tag">${skill}</span>`).join('');

    document.getElementById('profile-achievements').innerHTML = currentUser.achievements
        .map(ach => `<li><i class="fas fa-crown"></i> ${ach}</li>`).join('');
}
