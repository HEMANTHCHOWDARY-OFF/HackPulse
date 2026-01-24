// import gsap from 'gsap';

const DEFAULT_PARTICLE_COUNT = 12;

const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const cardData = [
    {
        color: '#060010',
        title: 'Hackathon Stats',
        description: 'Real-time analytics on participation, submissions, and judging progress.',
        label: 'Insights',
        image: 'assets/img/stats.png'
    },
    {
        color: '#060010',
        title: 'Organizer Hub',
        description: 'Centralized control panel to manage hackers, teams, and schedules.',
        label: 'Overview',
        image: 'assets/img/organizer.png'
    },
    {
        color: '#060010',
        title: 'Team Building',
        description: 'Find perfect teammates with matching skills and form dream teams.',
        label: 'Collaboration',
        image: 'assets/img/team.png'
    },
    {
        color: '#060010',
        title: 'Seamless Judging',
        description: 'Automated scoring systems and custom rubrics for fair evaluation.',
        label: 'Automation',
        image: 'assets/img/judging.png'
    },
    {
        color: '#060010',
        title: 'Dev Tools',
        description: 'Native integration with GitHub, Figma, and Discord for smooth workflows.',
        label: 'Integration',
        image: 'assets/img/devtools.png'
    },
    {
        color: '#060010',
        title: 'Secure Platform',
        description: 'Enterprise-grade data protection for all participant information.',
        label: 'Security',
        image: 'assets/img/security.png'
    }
];

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = radius => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

class ParticleCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            particleCount: DEFAULT_PARTICLE_COUNT,
            glowColor: DEFAULT_GLOW_COLOR,
            enableTilt: true,
            clickEffect: false,
            enableMagnetism: false,
            disableAnimations: false,
            ...options
        };

        if (this.options.disableAnimations) return;

        this.particles = [];
        this.timeouts = [];
        this.isHovered = false;
        this.memoizedParticles = [];
        this.particlesInitialized = false;
        this.magnetismAnimation = null;

        this.init();
    }

    init() {
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('click', this.handleClick.bind(this));
    }

    initializeParticles() {
        if (this.particlesInitialized) return;

        const { width, height } = this.element.getBoundingClientRect();
        this.memoizedParticles = Array.from({ length: this.options.particleCount }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, this.options.glowColor)
        );
        this.particlesInitialized = true;
    }

    clearAllParticles() {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        if (this.magnetismAnimation) {
            this.magnetismAnimation.kill();
        }

        this.particles.forEach(particle => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    particle.parentNode?.removeChild(particle);
                }
            });
        });
        this.particles = [];
    }

    animateParticles() {
        if (!this.isHovered) return;

        if (!this.particlesInitialized) {
            this.initializeParticles();
        }

        this.memoizedParticles.forEach((particle, index) => {
            const timeoutId = setTimeout(() => {
                if (!this.isHovered) return;

                const clone = particle.cloneNode(true);
                this.element.appendChild(clone);
                this.particles.push(clone);

                gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

                gsap.to(clone, {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotation: Math.random() * 360,
                    duration: 2 + Math.random() * 2,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true
                });

                gsap.to(clone, {
                    opacity: 0.3,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    repeat: -1,
                    yoyo: true
                });
            }, index * 100);

            this.timeouts.push(timeoutId);
        });
    }

    handleMouseEnter() {
        this.isHovered = true;
        this.animateParticles();

        if (this.options.enableTilt) {
            gsap.to(this.element, {
                rotateX: 5,
                rotateY: 5,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        }
    }

    handleMouseLeave() {
        this.isHovered = false;
        this.clearAllParticles();

        if (this.options.enableTilt) {
            gsap.to(this.element, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        if (this.options.enableMagnetism) {
            gsap.to(this.element, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }

    handleMouseMove(e) {
        if (!this.options.enableTilt && !this.options.enableMagnetism) return;

        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (this.options.enableTilt) {
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(this.element, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        }

        if (this.options.enableMagnetism) {
            const magnetX = (x - centerX) * 0.05;
            const magnetY = (y - centerY) * 0.05;

            this.magnetismAnimation = gsap.to(this.element, {
                x: magnetX,
                y: magnetY,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }

    handleClick(e) {
        if (!this.options.clickEffect) return;

        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const maxDistance = Math.max(
            Math.hypot(x, y),
            Math.hypot(x - rect.width, y),
            Math.hypot(x, y - rect.height),
            Math.hypot(x - rect.width, y - rect.height)
        );

        const ripple = document.createElement('div');
        ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(${this.options.glowColor}, 0.4) 0%, rgba(${this.options.glowColor}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      pointer-events: none;
      z-index: 1000;
    `;

        this.element.appendChild(ripple);

        gsap.fromTo(
            ripple,
            {
                scale: 0,
                opacity: 1
            },
            {
                scale: 1,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => ripple.remove()
            }
        );
    }
}

window.initGlobalSpotlight = (gridElement, options = {}) => {
    const {
        disableAnimations = false,
        spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
        glowColor = DEFAULT_GLOW_COLOR
    } = options;

    if (disableAnimations || !gridElement) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
    position: fixed;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle,
      rgba(${glowColor}, 0.15) 0%,
      rgba(${glowColor}, 0.08) 15%,
      rgba(${glowColor}, 0.04) 25%,
      rgba(${glowColor}, 0.02) 40%,
      rgba(${glowColor}, 0.01) 65%,
      transparent 70%
    );
    z-index: 1;
    opacity: 0;
    transform: translate(-50%, -50%);
    mix-blend-mode: screen;
  `;
    document.body.appendChild(spotlight);

    const handleMouseMove = e => {
        // Check if mouse is near the grid section
        const rect = gridElement.getBoundingClientRect();
        const mouseInside =
            // Added partial check to ensure rect is valid and visible
            rect.width > 0 && rect.height > 0 &&
            e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        // Use a generic selector for cards since we are applying this to multiple types
        const cards = gridElement.querySelectorAll('.magic-bento-card, .hackathon-card, .winner-card, .team-card, .stat-box');

        if (!mouseInside) {
            gsap.to(spotlight, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
            cards.forEach(card => {
                card.style.setProperty('--glow-intensity', '0');
            });
            return;
        }

        const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
        let minDistance = Infinity;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            const distance =
                Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
            const effectiveDistance = Math.max(0, distance);

            minDistance = Math.min(minDistance, effectiveDistance);

            let glowIntensity = 0;
            if (effectiveDistance <= proximity) {
                glowIntensity = 1;
            } else if (effectiveDistance <= fadeDistance) {
                glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
            }

            updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
        });

        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        const targetOpacity =
            minDistance <= proximity
                ? 0.8
                : minDistance <= fadeDistance
                    ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                    : 0;

        gsap.to(spotlight, {
            opacity: targetOpacity,
            duration: targetOpacity > 0 ? 0.2 : 0.5,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        // Generic selector
        const cards = gridElement.querySelectorAll('.magic-bento-card, .hackathon-card, .winner-card, .team-card, .stat-box');
        cards.forEach(card => {
            card.style.setProperty('--glow-intensity', '0');
        });
        gsap.to(spotlight, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
};


window.attachBentoEffect = (element, options = {}) => {
    if (!element) return;
    const {
        enableStars = true,
        enableTilt = true,
        clickEffect = true,
        enableMagnetism = true,
        particleCount = DEFAULT_PARTICLE_COUNT,
        glowColor = DEFAULT_GLOW_COLOR,
        disableAnimations = false
    } = options;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const shouldDisableAnimations = disableAnimations || isMobile;

    // Add base styles if needed via class
    element.classList.add('magic-bento-card');
    // Note: changing class might affect existing styles if not careful. 
    // magic-bento-card adds border, bg, etc.
    // We should perhaps just add specific effect classes or set styles.
    // But user wants "Magic Bento" animation.
    // Let's rely on MagicBento.css providing the glow vars and ::after element for border glow.
    element.classList.add('magic-bento-card--border-glow');
    element.style.setProperty('--glow-color', glowColor);


    if (enableStars) {
        new ParticleCard(element, {
            disableAnimations: shouldDisableAnimations,
            particleCount,
            glowColor,
            enableTilt,
            clickEffect,
            enableMagnetism
        });
        element.classList.add('particle-container');
    }
};

window.initMagicBento = (container, options = {}) => {
    if (!container) return;

    const {
        textAutoHide = true,
        enableStars = true,
        enableSpotlight = true,
        enableBorderGlow = true,
        disableAnimations = false,
        spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
        particleCount = DEFAULT_PARTICLE_COUNT,
        enableTilt = false,
        glowColor = DEFAULT_GLOW_COLOR,
        clickEffect = true,
        enableMagnetism = true
    } = options;

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const shouldDisableAnimations = disableAnimations || isMobile;

    // Create Grid
    const grid = document.createElement('div');
    grid.className = 'card-grid bento-section';
    container.appendChild(grid);

    // Initialize Spotlight
    if (enableSpotlight) {
        initGlobalSpotlight(grid, {
            disableAnimations: shouldDisableAnimations,
            spotlightRadius,
            glowColor
        });
    }

    // Create Cards
    cardData.forEach(data => {
        const card = document.createElement('div');
        const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
        card.className = baseClassName;
        // card.style.backgroundColor = data.color; // Removed to allow CSS variables to control theme
        card.style.setProperty('--glow-color', glowColor);

        card.innerHTML = `
            <div class="magic-bento-card__header">
                <div class="magic-bento-card__label">${data.label}</div>
            </div>
            <div class="magic-bento-card__content">
                <h2 class="magic-bento-card__title">${data.title}</h2>
                <p class="magic-bento-card__description">${data.description}</p>
            </div>
            ${data.image ? `<img src="${data.image}" alt="${data.title}" class="magic-bento-card__image">` : ''}
        `;

        grid.appendChild(card);

        if (enableStars) {
            // Initialize Particle Card Logic
            new ParticleCard(card, {
                disableAnimations: shouldDisableAnimations,
                particleCount,
                glowColor,
                enableTilt,
                clickEffect,
                enableMagnetism
            });
            card.classList.add('particle-container');
        }
    });

};
