import { config } from './config.js';

const SYSTEM_PROMPT = `You are an expert API that returns data in strict JSON format. 
Do not include any explanation, markdown formatting (like \`\`\`json), or conversational text. 
Return ONLY the JSON array.`;

/**
 * Fetch data from Groq API
 * @param {string} prompt 
 * @returns {Promise<any>}
 */
async function fetchFromGroq(prompt) {
    if (!config.GROQ_API_KEY) {
        console.error("Groq API Key missing");
        return [];
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Valid Groq model
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                response_format: { "type": "json_object" }, // Crucial for valid JSON
                temperature: 0.3,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Groq API Error Details:", errText);
            throw new Error(`API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        return JSON.parse(content);
    } catch (error) {
        console.error("Error fetching from Groq:", error);
        throw error; // Re-throw to handle in UI
    }
}

let allHackathons = [];

export async function loadHackathons() {
    const grid = document.getElementById('hackathons-grid');
    if (!grid) return;

    try {
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const prompt = `List 8 CONFIRMED UPCOMING hackathons with registration OPEN as of today, ${today}.
        
        STRICT DATE RULES:
        1. **Event Date MUST be after ${today}**.
        2. DO NOT list events that have already happened or are currently finished.
        3. Double-check the year is 2026 (or late 2025 if applicable).

        Focus on:
        1. **Andhra Pradesh** (Vizag, etc.)
        2. **Government of India** (SIH, etc.)
        3. **All-India** / Global

        Return a JSON object with a key "hackathons".
        Example format:
        {
          "hackathons": [
            {
              "title": "Event Name",
              "date": "Oct 15 - 17, 2024",
              "location": "Online",
              "type": "AI", // Use categories like AI, Web, Mobile, Blockchain
              "description": "Short summary",
              "tags": ["tag1", "tag2"],
              "link": "https://example.com"
            }
          ]
        }
        `;

        grid.innerHTML = '<div class="loading">Searching the web via Groq...</div>';

        const responseData = await fetchFromGroq(prompt);
        // Extract array from the specific key, or fallback if the model returned flexible keys
        allHackathons = responseData.hackathons || responseData.events || responseData.data || [];

        if (!Array.isArray(allHackathons) || allHackathons.length === 0) {
            console.warn("API Response Structure:", responseData);
            grid.innerHTML = '<div class="error">No hackathons found or invalid format.</div>';
            return;
        }

        renderHackathons(allHackathons);
        setupHackathonFilters();

    } catch (err) {
        console.error("Full Error:", err);
        grid.innerHTML = `<div class="error">
            <i class="fas fa-exclamation-triangle"></i><br>
            Failed to load data.<br>
            <span style="font-size: 0.8rem; opacity: 0.7">${err.message}</span>
        </div>`;
    }
}

function renderHackathons(hackathons) {
    const grid = document.getElementById('hackathons-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (hackathons.length === 0) {
        grid.innerHTML = '<div class="error">No hackathons match this filter.</div>';
        return;
    }

    hackathons.forEach((hack, index) => {
        const card = document.createElement('div');
        // Added 'fade-in' class for animation
        card.className = 'hackathon-card magic-bento-card magic-bento-card--border-glow fade-in';
        card.style.setProperty('--glow-color', getGlowColor(hack.type));

        // Stagger animations by 0.1s for a faster list effect
        card.style.animationDelay = `${index * 0.1}s`;

        // Random gradient based on type
        const gradient = getGradient(hack.type);

        // Construct a reliable search URL
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(hack.title + ' hackathon official ' + (new Date().getFullYear()))}`;

        card.innerHTML = `
            <div class="magic-bento-card__header">
                <span class="badge ${hack.type ? hack.type.toLowerCase() : 'general'}">${hack.type || 'General'}</span>
                <span class="date"><i class="far fa-calendar"></i> ${hack.date}</span>
            </div>
            <div class="magic-bento-card__content">
                <h3 class="magic-bento-card__title">${hack.title}</h3>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${hack.location}</p>
                <p class="magic-bento-card__description">${hack.description}</p>
                <div class="tags">
                    ${(hack.tags || []).map(tag => `<span>#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="magic-bento-card__footer" style="margin-top: auto; padding-top: 15px; position: relative; z-index: 2;">
                <a href="${searchUrl}" target="_blank" class="btn-glass-sm func-link">
                    Search & Apply <i class="fas fa-search"></i>
                </a>
            </div>
             <div class="card-bg" style="background: ${gradient}"></div>
        `;

        grid.appendChild(card);

        // Attach effects
        if (window.attachBentoEffect) {
            window.attachBentoEffect(card, {
                glowColor: getGlowColor(hack.type),
                enableStars: true,
                enableTilt: true
            });
        }
    });

    // Init spotlight for the grid
    if (window.initGlobalSpotlight) {
        window.initGlobalSpotlight(grid, { glowColor: '100, 200, 255' });
    }
}

function setupHackathonFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            filterHackathons(filter);
        });
    });
}

function filterHackathons(filter) {
    if (filter === 'all') {
        renderHackathons(allHackathons);
        return;
    }

    const filtered = allHackathons.filter(hack => {
        const typeMatch = (hack.type && hack.type.toLowerCase() === filter.toLowerCase());
        const locationMatch = (hack.location && hack.location.toLowerCase().includes(filter.toLowerCase()));

        // "Online" vs "Offline"
        if (filter === 'Online') return hack.location && hack.location.toLowerCase().includes('online');
        if (filter === 'Offline') return hack.location && !hack.location.toLowerCase().includes('online');

        return typeMatch || locationMatch;
    });

    renderHackathons(filtered);
}

export async function loadWinners() {
    const grid = document.getElementById('winners-grid');
    if (!grid) return;

    try {
        const prompt = `List 8 distinct, REAL, and FAMOUS hackathon winning projects from major global hackathons (e.g., ETHGlobal, HackMIT, HackHarvard, Solana, Chainlink).
        
        Return a JSON object with a key "winners" containing an array of objects.
        
        Each winner object MUST have:
        - "teamName": Name of the winning team.
        - "projectName": Name of the project (Must be a real famous project).
        - "eventName": Name of the hackathon.
        - "description": Brief 1-sentence description.
        - "teamMembers": Array of strings (names).
        - "category": e.g., "AI", "Blockchain", "Health", "FinTech".
        
        Example format:
        {
          "winners": [
            {
              "teamName": "Team X",
              "projectName": "1Inch Exchange",
              "eventName": "ETHGlobal New York",
              "description": "DEX aggregator born at a hackathon.",
              "teamMembers": ["Sergej", "Anton"],
              "category": "Blockchain"
            }
          ]
        }
        `;

        grid.innerHTML = '<div class="loading">Fetching winners from previous hackathons...</div>';

        const responseData = await fetchFromGroq(prompt);
        const winners = responseData.winners || responseData.projects || responseData.data || [];

        grid.innerHTML = '';

        if (!Array.isArray(winners) || winners.length === 0) {
            console.warn("API Response Structure:", responseData);
            grid.innerHTML = '<div class="error">No winners found or invalid format.</div>';
            return;
        }

        winners.forEach((winner, index) => {
            const card = document.createElement('div');
            // Added 'fade-in' class for animation
            card.className = 'winner-card magic-bento-card magic-bento-card--border-glow fade-in';
            card.style.setProperty('--glow-color', '#FFD700'); // Gold for winners

            // Stagger animations by 0.2s for "slow motion" effect
            card.style.animationDelay = `${index * 0.2}s`;

            // Ensure Fallbacks
            const teamName = winner.teamName || winner.projectName;
            const projectTitle = winner.teamName ? winner.projectName : "Winning Project";

            // CONSTRUCT PROPER SEARCH LINKS
            // Since AI-generated direct links are often broken (404), we construct smart search queries.
            // This guarantees the user always finds the most relevant, real results.

            // Search for: "ProjectName HackathonName github source code"
            const githubSearch = `https://www.google.com/search?q=${encodeURIComponent(projectTitle + ' ' + winner.eventName + ' github source code')}`;

            // Search for: "ProjectName HackathonName demo"
            const projectSearch = `https://www.google.com/search?q=${encodeURIComponent(projectTitle + ' ' + winner.eventName + ' project demo')}`;

            card.innerHTML = `
                <div class="magic-bento-card__header">
                    <span class="badge winner"><i class="fas fa-trophy"></i> ${winner.category}</span>
                    <span class="event-name">@ ${winner.eventName}</span>
                </div>
                <div class="magic-bento-card__content">
                    <h3 class="magic-bento-card__title" style="font-size: 1.5rem; margin-bottom: 5px;">${teamName}</h3>
                    <div class="winner-project" style="color: var(--color-pink); font-size: 0.95rem; margin-bottom: 10px;">
                        <i class="fas fa-medal"></i> ${projectTitle}
                    </div>
                    
                    <div class="team-avatars">
                       ${(winner.teamMembers || []).map(m => `<div class="avatar" title="${m}">${m.charAt(0).toUpperCase()}</div>`).join('')}
                    </div>

                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <a href="${githubSearch}" target="_blank" class="btn-glass-sm func-link">
                            <i class="fab fa-github"></i> Search Code
                        </a>
                        <a href="${projectSearch}" target="_blank" class="btn-glass-sm func-link">
                            <i class="fas fa-external-link-alt"></i> Search Demo
                        </a>
                    </div>
                </div>
            `;

            grid.appendChild(card);

            if (window.attachBentoEffect) {
                window.attachBentoEffect(card, {
                    glowColor: '255, 215, 0',
                    enableStars: true
                });
            }
        });
        // Init spotlight for the grid
        if (window.initGlobalSpotlight) {
            window.initGlobalSpotlight(grid, { glowColor: '255, 215, 0' });
        }
    } catch (err) {
        console.error("Full Error:", err);
        grid.innerHTML = `<div class="error">
            <i class="fas fa-exclamation-triangle"></i><br>
            Failed to load winners.<br>
            <span style="font-size: 0.8rem; opacity: 0.7">${err.message}</span>
        </div>`;
    }
}

function getGlowColor(type) {
    const colors = {
        'AI': '0, 255, 136',
        'Web': '50, 100, 255',
        'Mobile': '255, 50, 100',
        'Blockchain': '200, 50, 255',
        'General': '255, 255, 255'
    };
    return colors[type] || colors['General'];
}

function getGradient(type) {
    // Subtle gradients for card backgrounds
    const gradients = {
        'AI': 'radial-gradient(circle at top right, rgba(0, 255, 136, 0.1), transparent 60%)',
        'Web': 'radial-gradient(circle at top right, rgba(50, 100, 255, 0.1), transparent 60%)',
        'Mobile': 'radial-gradient(circle at top right, rgba(255, 50, 100, 0.1), transparent 60%)',
        'Blockchain': 'radial-gradient(circle at top right, rgba(200, 50, 255, 0.1), transparent 60%)',
        'General': 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 60%)'
    };
    return gradients[type] || gradients['General'];
}
