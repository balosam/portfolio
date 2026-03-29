/* ============================================================
   PROJECTS.JS — Filter, case study accordion, video modal
============================================================ */

'use strict';

// ── FILTER ──
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.proj-card[data-cat]');
  if (!btns.length || !cards.length) return;

  function applyFilter(cat) {
    // Update buttons
    btns.forEach(b => b.classList.toggle('active', b.dataset.filter === cat));

    // Show / hide cards with stagger
    let visIndex = 0;
    cards.forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      if (match) {
        card.classList.remove('hidden');
        card.style.transitionDelay = (visIndex * 50) + 'ms';
        visIndex++;
      } else {
        card.classList.add('hidden');
        card.style.transitionDelay = '0ms';
      }
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Init
  applyFilter('all');
})();

// ── CASE STUDY ACCORDION ──
(function initCaseStudy() {
  const toggles = document.querySelectorAll('.proj-case-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    const panelId = toggle.getAttribute('data-panel');
    const panel   = document.getElementById(panelId);
    if (!panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.contains('open');

      // Close all other open panels
      document.querySelectorAll('.proj-case-toggle.open').forEach(t => {
        if (t !== toggle) {
          t.classList.remove('open');
          const pid = t.getAttribute('data-panel');
          const p   = document.getElementById(pid);
          if (p) p.classList.remove('open');
          const arrow = t.querySelector('.toggle-arrow');
          if (arrow) arrow.textContent = '+';
        }
      });

      // Toggle this one
      toggle.classList.toggle('open', !isOpen);
      panel.classList.toggle('open', !isOpen);
      const arrow = toggle.querySelector('.toggle-arrow');
      if (arrow) arrow.textContent = isOpen ? '+' : '−';
    });
  });
})();

// ── VIDEO MODAL ──
(function initVideoModal() {
  const overlay = document.getElementById('video-modal');
  const videoEl = document.getElementById('modal-video');
  if (!overlay || !videoEl) return;

  function openVideoModal() {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';
    videoEl.play().catch(() => {});
  }

  function closeVideoModal() {
    overlay.classList.remove('open');
    videoEl.pause();
    videoEl.currentTime = 0;
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  // Trigger button
  const playBtns = document.querySelectorAll('[data-open-video]');
  playBtns.forEach(btn => btn.addEventListener('click', openVideoModal));

  // Close button
  const closeBtn = document.getElementById('video-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);

  // Overlay click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeVideoModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeVideoModal();
  });
})();