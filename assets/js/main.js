import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc, query, where } from "firebase/firestore";

// Main Logic
document.addEventListener('DOMContentLoaded', async () => {
    console.log("HackPulse Initialized");

    // Auth State Listener
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is signed in:", user.uid);
            await loadUserProfile(user.uid);
        } else {
            console.log("User is signed out");
            // Redirect to login if not on a public page (or if we want to enforce login for index)
            // For this app, let's enforce login for index.html as well since it was the original intent
            const path = window.location.pathname;
            if (!path.includes('login.html') && !path.includes('signup.html')) {
                window.location.href = 'login.html';
            }
        }
    });

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

    // Initialize Data
    await initializeData();
});

async function initializeData() {
    // Hackathons
    // Hackathons
    /* 
    const hackathonGrid = document.getElementById('hackathons-grid');
    if (hackathonGrid) {
        let hackathons = await fetchData('hackathons');
        if (hackathons.length === 0) {
            console.log("Seeding Hackathons...");
            await seedHackathons();
            hackathons = await fetchData('hackathons');
        }
        renderHackathons(hackathons);
        initGlobalSpotlight(hackathonGrid, { glowColor: '132, 0, 255' });

        // Filter Logic
        setupFilters(hackathons);
    }
    */

    // Winners
    // Winners logic is now handled by hackathonService.js (Groq API)
    /*
    const winnersGrid = document.getElementById('winners-grid');
    if (winnersGrid) {
        let winners = await fetchData('winners');
        if (winners.length === 0) {
            console.log("Seeding Winners...");
            await seedWinners();
            winners = await fetchData('winners');
        }
        renderWinners(winners);
        initGlobalSpotlight(winnersGrid, { glowColor: '255, 215, 0' });
    }
    */

    // Team Requests
    /*
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        let teamRequests = await fetchData('teamRequests');
        if (teamRequests.length === 0) {
            console.log("Seeding Team Requests...");
            await seedTeamRequests();
            teamRequests = await fetchData('teamRequests');
        }
        renderTeamRequests(teamRequests);
        initGlobalSpotlight(teamGrid, { glowColor: '0, 255, 136' });
    }
    */
}

async function fetchData(collectionName) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}

// Seeding Functions (Run only if empty)
async function seedHackathons() {
    const data = [
        {
            title: "InnovateX 2026",
            organizer: "TechCorp Inc.",
            date: "Feb 15 - 17, 2026",
            mode: "Online",
            image: "https://images.unsplash.com/photo-1504384308090-c54be3855485?auto=format&fit=crop&q=80&w=600",
            tags: ["AI", "Blockchain"],
            deadline: "2026-02-10T23:59:59"
        },
        {
            title: "CodeSprint Global",
            organizer: "DevCommunity",
            date: "Mar 05 - 07, 2026",
            mode: "Offline - NYC",
            image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600",
            tags: ["Web", "Cloud"],
            deadline: "2026-03-01T23:59:59"
        },
        {
            title: "Hack The Future",
            organizer: "University of Tech",
            date: "Mar 20 - 22, 2026",
            mode: "Hybrid",
            image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600",
            tags: ["IoT", "GreenTech"],
            deadline: "2026-03-15T23:59:59"
        }
    ];
    for (const item of data) {
        await setDoc(doc(collection(db, "hackathons")), item);
    }
}

async function seedWinners() {
    const data = [
        {
            teamName: "Neural Ninjas",
            project: "AI Health Assistant",
            members: ["Alex", "Sam", "Jordan"],
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
            repo: "#",
            demo: "#"
        },
        {
            teamName: "BlockChain Gang",
            project: "Decentralized Vote",
            members: ["Chris", "Pat", "Taylor"],
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600",
            repo: "#",
            demo: "#"
        }
    ];
    for (const item of data) {
        await setDoc(doc(collection(db, "winners")), item);
    }
}

async function seedTeamRequests() {
    const data = [
        {
            user: "Sarah Chen",
            role: "Frontend Dev",
            lookingFor: ["Backend", "UI/UX"],
            event: "InnovateX 2026",
            skills: ["React", "Tailwind"],
            avatar: "https://i.pravatar.cc/150?u=sarah"
        },
        {
            user: "Mike Ross",
            role: "Full Stack",
            lookingFor: ["AI/ML Engineer"],
            event: "CodeSprint Global",
            skills: ["Node.js", "Python"],
            avatar: "" // Placeholder
        }
    ];
    for (const item of data) {
        await setDoc(doc(collection(db, "teamRequests")), item);
    }
}


async function loadUserProfile(uid) {
    const profileName = document.getElementById('profile-name');
    if (!profileName) return;

    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            renderProfile(userData);
        } else {
            console.log("No such user!");
        }
    } catch (e) {
        console.error("Error loading profile:", e);
    }
}

function setupFilters(hackathons) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
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
}


function renderHackathons(data) {
    const grid = document.getElementById('hackathons-grid');
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<p>No hackathons found.</p>';
        return;
    }

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
                    ${hack.tags ? hack.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: auto;">Apply Now</button>
            </div>
        </div>
    `).join('');

    // Apply Magic Bento Effects
    const cards = grid.querySelectorAll('.hackathon-card');
    cards.forEach(card => {
        if (window.attachBentoEffect) {
            attachBentoEffect(card, {
                enableStars: true,
                enableTilt: true,
                clickEffect: true,
                enableMagnetism: true,
                glowColor: '132, 0, 255', // Purple
                enableBorderGlow: true
            });
        }
    });

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

    const cards = grid.querySelectorAll('.winner-card');
    cards.forEach(card => {
        if (window.attachBentoEffect) {
            attachBentoEffect(card, {
                enableStars: true,
                enableTilt: true,
                clickEffect: true,
                enableMagnetism: true,
                glowColor: '255, 215, 0' // Gold
            });
        }
    });
}

function renderTeamRequests(data) {
    const grid = document.getElementById('team-grid');
    if (!grid) return;

    grid.innerHTML = data.map(req => `
        <div class="glass-card team-card fade-in" style="position: relative; overflow: hidden;">
            <img src="${req.avatar || 'https://via.placeholder.com/150'}" alt="${req.user}" class="user-avatar">
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

    const cards = grid.querySelectorAll('.team-card');
    cards.forEach(card => {
        if (window.attachBentoEffect) {
            attachBentoEffect(card, {
                enableStars: true,
                enableTilt: true,
                clickEffect: true,
                enableMagnetism: true,
                glowColor: '0, 255, 136' // Green
            });
        }
    });
}

function renderProfile(currentUser) {
    const nameEl = document.getElementById('profile-name');
    if (!nameEl) return;

    nameEl.textContent = currentUser.name || "User";
    document.getElementById('profile-role').textContent = currentUser.role || "Member";
    document.getElementById('stat-hackathons').textContent = currentUser.hackathons || 0;
    document.getElementById('stat-wins').textContent = currentUser.wins || 0;
    document.getElementById('stat-projects').textContent = currentUser.projects || 0;

    const skillsContainer = document.getElementById('profile-skills');
    if (currentUser.skills && currentUser.skills.length > 0) {
        skillsContainer.innerHTML = currentUser.skills
            .map(skill => `<span class="tag">${skill}</span>`).join('');
    } else {
        skillsContainer.innerHTML = '<span class="text-muted">No skills listed</span>';
    }

    const achievementsContainer = document.getElementById('profile-achievements');
    if (currentUser.achievements && currentUser.achievements.length > 0) {
        achievementsContainer.innerHTML = currentUser.achievements
            .map(ach => `<li><i class="fas fa-crown"></i> ${ach}</li>`).join('');
    } else {
        achievementsContainer.innerHTML = '<li class="text-muted">No achievements yet</li>';
    }
}


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
