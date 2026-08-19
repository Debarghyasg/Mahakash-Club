/* =========================================================
   MAHAKASH CLUB — app.js
   Cleaned up (old duplicate star/shooting-star functions
   removed) and extended with a few extra motion touches:
     - single source of truth for the starfield
     - ambient cursor glow (desktop only, respects reduced motion)
     - top scroll-progress bar
     - scroll-reveal for content sections / cards
     - smooth-scroll for in-page anchor links
   Everything else (menu, PDF modal, join popup) is unchanged.
   ========================================================= */

const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

/* ---------------------------------------------------------
   STARFIELD
   --------------------------------------------------------- */
function createStars() {
    // Support either #starfield or .stars, whichever is present on the page
    const container =
        document.getElementById('starfield') ||
        document.querySelector('.stars');

    if (!container) return;

    const numberOfStars = 200;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        // subtle tint variation so the field doesn't read as flat white noise
        const tint = Math.random();
        if (tint > 0.85) {
            star.style.background = '#c9b3d4'; // lavender
        } else if (tint > 0.7) {
            star.style.background = '#8fd6ff'; // pale cyan
        }

        const duration = Math.random() * 3 + 2;
        star.style.animationDuration = duration + 's';

        const delay = Math.random() * 3;
        star.style.animationDelay = delay + 's';

        fragment.appendChild(star);
    }

    container.appendChild(fragment);
}

/* ---------------------------------------------------------
   SHOOTING STARS
   --------------------------------------------------------- */
function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';

    const startY = Math.random() * 50; // top half of screen
    shootingStar.style.top = startY + '%';
    shootingStar.style.left = '0';

    document.body.appendChild(shootingStar);

    setTimeout(() => {
        shootingStar.remove();
    }, 2000);
}

function startShootingStars() {
    if (prefersReducedMotion) return;
    setInterval(createShootingStar, Math.random() * 4000 + 4000);
}

/* ---------------------------------------------------------
   AMBIENT CURSOR GLOW
   A soft trailing glow that follows the pointer — desktop
   only, skipped on touch devices and reduced-motion.
   --------------------------------------------------------- */
function initCursorGlow() {
    if (prefersReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    function animate() {
        // gentle easing so the glow trails slightly behind the cursor
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

/* ---------------------------------------------------------
   SCROLL PROGRESS BAR
   --------------------------------------------------------- */
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    function update() {
        const scrollTop = window.scrollY;
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

/* ---------------------------------------------------------
   SCROLL-REVEAL
   Adds a fade/slide-in the first time each section or card
   enters the viewport. Falls back to "just show everything"
   if reduced motion is requested.
   --------------------------------------------------------- */
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.content-section, .card, .fact-card, .team-card, .card2'
    );
    if (!targets.length) return;

    if (prefersReducedMotion) {
        targets.forEach((el) => el.classList.add('reveal', 'in-view'));
        return;
    }

    targets.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   SMOOTH SCROLL for in-page anchors (#discoveries, #location, etc.)
   --------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return; // skip bare "#"
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start',
            });
            // close mobile menu if it was open
            navMenu?.classList.remove('active');
            navOverlay?.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });
}

/* ---------------------------------------------------------
   MOBILE MENU TOGGLE (+ blurred background overlay)
   --------------------------------------------------------- */
const menuIcon = document.getElementById('menu-icon');
const navMenu = document.getElementById('nav-menu');
const navOverlay = document.getElementById('nav-blur-overlay');

menuIcon?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navOverlay?.classList.toggle('active');
    document.body.classList.toggle('nav-open');
});

// tapping the blurred background closes the menu
navOverlay?.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('nav-open');
});

/* ---------------------------------------------------------
   PDF MODAL
   --------------------------------------------------------- */
function togglePDF(file) {
    const modal = document.getElementById('pdf-modal');
    if (!modal) return;
    const iframe = modal.querySelector('iframe');

    if (modal.style.display === 'none' || modal.style.display === '') {
        if (file) iframe.src = file;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('pdf-modal');
    if (modal && event.target == modal) {
        togglePDF();
    }
};

/* ===================================================
   JOIN CLUB POPUP
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('joinPopupOverlay');
    const closeBtn = document.getElementById('joinPopupClose');
    const popupImg = document.getElementById('joinPopupImg');
    const formLink = 'https://forms.gle/c5zASLmAqaCn7MSt5';

    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('active');
        }, 800);

        popupImg?.addEventListener('click', () => {
            window.open(formLink, '_blank');
        });

        closeBtn?.addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });


        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.classList.remove('active');
            }
        });
    }

    // ---- init everything else once the DOM is ready ----
    createStars();
    startShootingStars();
    initCursorGlow();
    initScrollProgress();
    initScrollReveal();
    initSmoothScroll();

    // hide the welcome/loading screen after its CSS animation finishes
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        setTimeout(() => welcomeScreen.classList.add('hidden'), 4000);
    }
});