/* ============================================================
   SKILLS.JS — Category filter tab switching
============================================================ */

'use strict';

(function initSkillTabs() {
  const tabs   = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skill-panel');
  if (!tabs.length || !panels.length) return;

  function switchTab(targetCat) {
    // Update tab states
    tabs.forEach(tab => {
      const isActive = tab.dataset.cat === targetCat;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Show matching panel, hide others
    panels.forEach(panel => {
      if (panel.dataset.panel === targetCat) {
        panel.removeAttribute('hidden');
        panel.classList.add('active');

        // Re-trigger scroll reveal for newly visible skill cards
        panel.querySelectorAll('.reveal:not(.show)').forEach(el => {
          // Small delay so the panel animation fires first
          requestAnimationFrame(() => {
            el.classList.add('show');
          });
        });
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('active');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.cat));
  });

  // Init: show first tab's panel cards immediately
  const firstPanel = document.querySelector('.skill-panel.active');
  if (firstPanel) {
    firstPanel.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
  }
})();