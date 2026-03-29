/* ============================================================
   CONTACT.JS — Form validation, char count, submission
============================================================ */

'use strict';

(function initContactForm() {

  const form       = document.getElementById('contact-form');
  const successEl  = document.getElementById('form-success');
  const submitBtn  = document.getElementById('form-submit-btn');
  const textarea   = document.getElementById('cf-message');
  const charCount  = document.getElementById('char-count');

  if (!form) return;

  // ── CHARACTER COUNT ──
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 900 ? 'var(--amber)' : '';
      if (len > 1000) textarea.value = textarea.value.slice(0, 1000);
    });
  }

  // ── VALIDATION HELPERS ──
  function getField(id) { return document.getElementById(id); }
  function getError(id) { return document.getElementById('err-' + id); }

  function showError(fieldId, msg) {
    const field = getField('cf-' + fieldId);
    const err   = getError(fieldId);
    if (field) field.classList.add('error');
    if (err)   err.textContent = msg;
  }

  function clearError(fieldId) {
    const field = getField('cf-' + fieldId);
    const err   = getError(fieldId);
    if (field) { field.classList.remove('error'); field.classList.remove('success'); }
    if (err)   err.textContent = '';
  }

  function markSuccess(fieldId) {
    const field = getField('cf-' + fieldId);
    if (field) { field.classList.remove('error'); field.classList.add('success'); }
  }

  // Clear errors on input
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const el = getField('cf-' + id);
    if (!el) return;
    el.addEventListener('input', () => clearError(id));
    el.addEventListener('change', () => clearError(id));
  });

  // ── VALIDATE ──
  function validate() {
    let valid = true;

    const name    = getField('cf-name');
    const email   = getField('cf-email');
    const subject = getField('cf-subject');
    const message = getField('cf-message');

    // Name
    if (!name.value.trim()) {
      showError('name', 'Please enter your name.');
      valid = false;
    } else if (name.value.trim().length < 2) {
      showError('name', 'Name must be at least 2 characters.');
      valid = false;
    } else {
      markSuccess('name');
    }

    // Email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError('email', 'Please enter your email address.');
      valid = false;
    } else if (!emailRe.test(email.value.trim())) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    } else {
      markSuccess('email');
    }

    // Subject
    if (!subject.value) {
      showError('subject', 'Please select a subject.');
      valid = false;
    } else {
      markSuccess('subject');
    }

    // Message
    if (!message.value.trim()) {
      showError('message', 'Please write a message.');
      valid = false;
    } else if (message.value.trim().length < 20) {
      showError('message', 'Message must be at least 20 characters.');
      valid = false;
    } else {
      markSuccess('message');
    }

    return valid;
  }

  // ── SUBMIT ──
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validate()) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    const labelEl = submitBtn.querySelector('.submit-label');
    if (labelEl) labelEl.textContent = 'Sending';

    // Build mailto href and trigger it — this is a no-backend approach
    // that works correctly without a server, using the user's mail client
    const name    = getField('cf-name').value.trim();
    const email   = getField('cf-email').value.trim();
    const subject = getField('cf-subject').value;
    const message = getField('cf-message').value.trim();

    const mailSubject = encodeURIComponent(subject + ' — from ' + name);
    const mailBody    = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Subject: ' + subject + '\n\n' +
      'Message:\n' + message
    );

    const mailto = 'mailto:balogunabdsamad6@gmail.com'
      + '?subject=' + mailSubject
      + '&body='    + mailBody;

    // Small delay for loading feel, then open mail client and show success
    setTimeout(() => {
      window.location.href = mailto;

      // Show success state after a brief pause
      setTimeout(() => {
        form.hidden    = true;
        successEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        if (labelEl) labelEl.textContent = 'Send Message';
      }, 600);
    }, 800);
  });

})();