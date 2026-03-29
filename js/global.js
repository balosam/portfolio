/* ============================================================
   GLOBAL.JS — Abd'samad Balogun Portfolio
   Cursor · Scroll · Nav · Mobile Menu · Reveal · Modal
============================================================ */

'use strict';

// ── DEVICE DETECTION ──
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
               || window.innerWidth <= 768;

// ── SCROLL PROGRESS BAR ──
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── CUSTOM CURSOR (desktop only) ──
(function initCursor() {
  if (isMobile) return;

  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with slight lag
  function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const interactables = 'a, button, [role="button"], input, textarea, .glass, .nav-link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

// ── NAVBAR SCROLL EFFECT ──
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── ACTIVE NAV LINK ──
(function initActiveLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── MOBILE MENU ──
const mobileMenu   = document.getElementById('mobile-menu');
const hamburgerBtn = document.getElementById('nav-hamburger');
const closeMenuBtn = document.getElementById('mobile-close');

function openMobileMenu() {
  if (!mobileMenu || !hamburgerBtn) return;
  mobileMenu.classList.add('open');
  hamburgerBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!mobileMenu || !hamburgerBtn) return;
  mobileMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);

// Close on link click
document.querySelectorAll('.mobile-menu-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeCVModal();
  }
});

// ── SCROLL REVEAL ──
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left');
  if (!elements.length) return;

  // Immediately show hero elements
  document.querySelectorAll('#hero .reveal, #hero .reveal-left').forEach(el => {
    el.classList.add('show');
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    // Skip hero elements (already shown)
    if (!el.closest('#hero')) observer.observe(el);
  });
})();

// ── BACK TO TOP ──
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── CV MODAL ──
function openCVModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('open'), 10);
  document.body.style.overflow = 'hidden';
}

function closeCVModal() {
  const modal = document.getElementById('cv-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function handleModalOverlay(e) {
  if (e.target === e.currentTarget) closeCVModal();
}

// Expose to global scope
window.openCVModal  = openCVModal;
window.closeCVModal = closeCVModal;
window.handleModalOverlay = handleModalOverlay;

// ── PAGE TRANSITIONS ──
(function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on load
  overlay.classList.remove('active');

  // Fade out on link click (internal pages only)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept same-origin, non-hash, non-external links
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        href.startsWith('javascript') || link.target === '_blank') return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 280);
    });
  });
})();

// ── VISIBILITY PAUSE (battery save) ──
let pageVisible = true;
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
});

// Export for use in other scripts
window.isMobile    = isMobile;
window.pageVisible = () => pageVisible;