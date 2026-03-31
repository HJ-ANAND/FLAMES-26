/* =========================================================
   THE ANGAAR BATCH — script.js
   Particles · Parallax · Counters · Tabs · Burning Scroll
   ========================================================= */

'use strict';

/* ── Helpers ─────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ── Navbar scroll behaviour ─────────────────────────── */
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

/* ── Mobile Menu ─────────────────────────────────────── */
const hamburger     = $('#hamburger');
const mobileDrawer  = $('#mobile-drawer');
const drawerClose   = $('#drawer-close');
const drawerOverlay = $('#drawer-overlay');

function openDrawer() {
  mobileDrawer.classList.add('open');
  drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
hamburger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerOverlay?.addEventListener('click', closeDrawer);
$$('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));

/* ── Ember Particle System (Canvas) ──────────────────── */
const canvas = $('#particles-canvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

const PARTICLE_COUNT = 60;
const COLORS = ['#FF6B1A', '#FFB347', '#FFD700', '#FF8C42'];
let particles = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function randomParticle(forceBottom = false) {
  const hero = $('#hero');
  const h    = hero ? hero.offsetHeight : window.innerHeight;
  return {
    x:       Math.random() * (canvas ? canvas.width : window.innerWidth),
    y:       forceBottom ? (canvas ? canvas.height : h) + Math.random() * 40
                         : Math.random() * (canvas ? canvas.height : h),
    size:    Math.random() * 2.5 + 0.5,
    speed:   Math.random() * 1.5 + 0.4,
    drift:   (Math.random() - 0.5) * 0.4,
    opacity: Math.random() * 0.8 + 0.2,
    maxOpacity: Math.random() * 0.8 + 0.2,
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    life:    0,
    maxLife: Math.random() * 200 + 100,
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(randomParticle(false));
  }
}

function animateParticles() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.y       -= p.speed;
    p.x       += p.drift;
    p.life    += 1;
    p.opacity  = p.maxOpacity * (1 - p.life / p.maxLife);

    if (p.opacity <= 0.01 || p.y < -10) {
      particles[i] = randomParticle(true);
      return;
    }

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = p.color;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(animateParticles);
}

if (canvas) {
  resizeCanvas();
  initParticles();
  animateParticles();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); }, { passive: true });
}

/* ── Parallax ─────────────────────────────────────────── */
const heroContent  = $('#hero-content');
const heroGlowTop  = document.querySelector('.hero-glow-top');
const isMobile     = () => window.innerWidth < 768;

window.addEventListener('scroll', () => {
  if (isMobile()) return;
  const sy = window.scrollY;
  if (canvas)       canvas.style.transform     = `translateY(${sy * 0.3}px)`;
  if (heroGlowTop)  heroGlowTop.style.transform = `translateY(${sy * 0.5}px)`;
  if (heroContent)  heroContent.style.transform = `translateY(${sy * 0.8}px)`;
}, { passive: true });

/* ── Scroll Reveal (IntersectionObserver) ────────────── */
const revealEls = $$('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* Stagger for program cards */
const programCards = $$('.program-card');
const cardObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const cards = e.target.querySelectorAll('.program-card');
      cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), i * 100);
      });
      cardObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
const cardsGrid = document.querySelector('.cards-grid');
if (cardsGrid) cardObs.observe(cardsGrid);

/* ── Stat Counter Animation ──────────────────────────── */
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.decimal || '0', 10);
  const duration = 2000;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = easeOutQuart(progress);
    const current  = target * ease;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(step);
}

const statNums = $$('.stat-number');
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      statNums.forEach(animateCounter);
      statsObs.disconnect();
    }
  });
}, { threshold: 0.4 });
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObs.observe(statsBar);

/* ── Tab Switcher ────────────────────────────────────── */
const tabBtns      = $$('.tab-btn');
const tabIndicator = $('#tab-indicator');
const tabBar       = $('#tabs-bar');

function setTabIndicator(btn) {
  if (!btn || !tabIndicator || !tabBar) return;
  const barRect = tabBar.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  tabIndicator.style.left  = (btn.offsetLeft) + 'px';
  tabIndicator.style.width = btn.offsetWidth + 'px';
}

function activateTab(btn) {
  const tabId = btn.dataset.tab;
  tabBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  setTabIndicator(btn);

  $$('.course-panel').forEach(p => p.classList.remove('active'));
  const panel = $(`#panel-${tabId}`);
  if (panel) {
    panel.classList.add('active');
    // Hex grids are already initialised — nothing to re-trigger
  }
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn));
});

// Init indicator
window.addEventListener('load', () => {
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) setTabIndicator(activeTab);
});

/* ── Honeycomb Hex Grid ──────────────────────────────────── */
function initHexGrid(panelId) {
  const wrap = document.getElementById('hex-' + panelId);
  if (!wrap) return;

  const grid   = wrap.querySelector('.hex-grid');
  const detail = wrap.querySelector('.hex-detail');
  const items  = grid ? grid.querySelectorAll('.hex-item') : [];

  // Inject SVG shape and content into each hex
  items.forEach(item => {
    const id    = item.dataset.id    || '';
    const label = item.dataset.label || '';

    // Truncate label for display (max ~3 words)
    const words      = label.split(' ');
    const shortLabel = words.slice(0, 3).join(' ') + (words.length > 3 ? '…' : '');

    item.innerHTML = `
      <svg class="hex-svg" viewBox="0 0 76 88" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon class="hex-polygon"
          points="38,4 72,23 72,65 38,84 4,65 4,23"
          stroke-width="${item.classList.contains('active') ? '2' : '1.5'}" />
      </svg>
      <div class="hex-content">
        <span class="hex-num">${id}</span>
        <span class="hex-label-text">${shortLabel}</span>
      </div>
    `;

    // Click handler — only non-locked hexes are interactive
    if (!item.classList.contains('locked')) {
      item.addEventListener('click', () => {
        selectHex(item, detail);
      });
    }
  });

  // Auto-select the active hex on load
  const activeHex = grid ? grid.querySelector('.hex-item.active') : null;
  if (activeHex) selectHex(activeHex, detail);
  else {
    // Fall back to first done hex if no active
    const firstDone = grid ? grid.querySelector('.hex-item.done') : null;
    if (firstDone) selectHex(firstDone, detail);
  }
}

function selectHex(item, detail) {
  if (!detail) return;
  const id    = item.dataset.id    || '';
  const label = item.dataset.label || '';
  const tag   = (item.dataset.tag  || 'Concept').toLowerCase();
  const done  = item.classList.contains('done');

  const tagLabel = done ? '✓ Done' : item.dataset.tag || 'Concept';
  const tagClass = done ? 'hd-tag--assessment'
    : tag === 'project'    ? 'hd-tag--project'
    : tag === 'workshop'   ? 'hd-tag--workshop'
    : tag === 'assessment' ? 'hd-tag--assessment'
    : 'hd-tag--concept';

  detail.innerHTML = `
    <span class="hd-num">${id}</span>
    <span class="hd-title">${label}</span>
    <span class="hd-tag ${tagClass}">${tagLabel}</span>
  `;

  // Brief flash animation on the panel
  detail.style.borderColor = 'rgba(255,107,26,0.5)';
  setTimeout(() => { detail.style.borderColor = ''; }, 300);
}

// Initialise all 5 grids on page load
['c', 'python', 'java', 'fullstack', 'flames'].forEach(id => initHexGrid(id));

/* ── Section Background Parallax ───────────────────────────── */
const sectionOrbs = document.querySelectorAll('.sbg-orb');

function updateSectionParallax() {
  if (window.innerWidth < 768) return; // disabled on mobile
  sectionOrbs.forEach(orb => {
    const section = orb.closest('section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewCenter    = window.innerHeight / 2;
    const offset        = (sectionCenter - viewCenter) * 0.06;
    // Apply translateY on top of the CSS animation via parent wrapper
    orb.parentElement.style.transform = `translateY(${offset}px)`;
  });
}

window.addEventListener('scroll', updateSectionParallax, { passive: true });

/* ── Marquee Duplication ─────────────────────────────── */
function duplicateMarquee(trackId) {
  const track = $(`#${trackId}`);
  if (!track) return;
  const original = track.innerHTML;
  track.innerHTML = original + original;
}
duplicateMarquee('marquee-track-1');
duplicateMarquee('marquee-track-2');

/* ── Smooth scroll for nav links ─────────────────────── */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = this.getAttribute('href');
    if (target === '#') return;
    const el = document.querySelector(target);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Timeline entry animation ───────────────────────── */
const timelineItems = $$('.timeline-item');
const timelineObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = Array.from(timelineItems).indexOf(e.target);
      e.target.style.opacity = '0';
      e.target.style.transform = 'translateY(24px)';
      e.target.style.transition = 'opacity .6s ease, transform .6s ease';
      setTimeout(() => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }, idx * 150);
      timelineObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
timelineItems.forEach(item => timelineObs.observe(item));

/* ── Resize handler for tab indicator ───────────────── */
window.addEventListener('resize', () => {
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) setTabIndicator(activeTab);
}, { passive: true });
