/**
 * THE AGEING GRACEFULLY FOUNDATION – app.js
 * Pure Vanilla JavaScript · No frameworks
 *
 * Sections:
 *  1. Config & Constants
 *  2. Navigation
 *  3. Counter Animation
 *  4. Amount Chip Selector
 *  5. Donation Form  ←— FastAPI placeholder
 *  6. Newsletter     ←— FastAPI placeholder
 *  7. Video Lightbox (placeholder)
 *  8. Init
 */

/* =========================================================
   1. CONFIG & CONSTANTS
   =========================================================
   When your FastAPI backend is ready, update BASE_API_URL
   to your deployed server (e.g. https://api.ageinggraciouslyfoundation.org)
   ======================================================= */
const BASE_API_URL = '';   // ← Set your FastAPI base URL here before going live

const ENDPOINTS = {
  /**
   * FastAPI endpoint: POST /api/v1/donations/process
   *
   * Expected request body:
   * {
   *   name:   string,
   *   email:  string,
   *   phone:  string,
   *   amount: number   (in UGX)
   * }
   *
   * Expected success response:
   * { success: true, reference: string, message: string }
   *
   * Wire up in processDonation() below.
   */
  donate: `${BASE_API_URL}/api/v1/donations/process`,

  /**
   * FastAPI endpoint: POST /api/v1/newsletter/subscribe
   *
   * Expected request body:
   * { email: string }
   *
   * Expected success response:
   * { success: true, message: string }
   *
   * Wire up in subscribeNewsletter() below.
   */
  newsletter: `${BASE_API_URL}/api/v1/newsletter/subscribe`,
};


/* =========================================================
   2. NAVIGATION
   ========================================================= */

/** Sticky header shadow on scroll */
function initNav() {
  const header    = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  hamburger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });

  // Close mobile menu when a nav link is clicked
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}


/* =========================================================
   3. COUNTER ANIMATION
   ========================================================= */

/**
 * Animates a numeric element from 0 to its data-target value.
 * Triggers once the element enters the viewport via IntersectionObserver.
 */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);  // ease-out cubic
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

function initCounters() {
  // Main headline counter
  const mainEl     = document.getElementById('counter-main');
  const mainTarget = 2000000;

  // Small stat counters
  const statEls = document.querySelectorAll('.stat-val[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target === mainEl) {
        animateCounter(mainEl, mainTarget, 2400);
      } else {
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  observer.observe(mainEl);
  statEls.forEach(el => observer.observe(el));
}


/* =========================================================
   4. AMOUNT CHIP SELECTOR
   ========================================================= */
function initAmountChips() {
  const chips       = document.querySelectorAll('#amount-chips .chip');
  const customInput = document.getElementById('custom-amount');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      customInput.value = '';          // clear custom field when preset chosen
    });
  });

  // Deactivate presets when user types a custom amount
  customInput.addEventListener('input', () => {
    chips.forEach(c => c.classList.remove('active'));
  });
}

/** Returns the currently selected donation amount in UGX */
function getSelectedAmount() {
  const active = document.querySelector('#amount-chips .chip.active');
  if (active) return parseInt(active.dataset.amount, 10);
  const custom = parseInt(document.getElementById('custom-amount').value, 10);
  return isNaN(custom) ? 0 : custom;
}


/* =========================================================
   5. DONATION FORM
   =========================================================
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   DEVELOPER NOTE:
   This function posts to ENDPOINTS.donate which is set to
     /api/v1/donations/process
   This is a PLACEHOLDER. Implement your FastAPI route:
     @app.post("/api/v1/donations/process")
   before releasing to production. The body schema is
   documented in the ENDPOINTS config above.
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   ======================================================= */

/**
 * Validates form fields and submits donation to FastAPI backend.
 * Called by the Donate button's onclick handler.
 */
async function processDonation() {
  const statusEl = document.getElementById('donation-status');
  const btn      = document.getElementById('donate-btn');

  const payload = {
    name:   document.getElementById('donor-name').value.trim(),
    email:  document.getElementById('donor-email').value.trim(),
    phone:  document.getElementById('donor-phone').value.trim(),
    amount: getSelectedAmount(),
  };

  // ── Client-side validation ──
  if (!payload.name)          return showStatus(statusEl, 'error', 'Please enter your full name.');
  if (!payload.email)         return showStatus(statusEl, 'error', 'Please enter your email address.');
  if (!payload.amount || payload.amount < 1000)
    return showStatus(statusEl, 'error', 'Please select or enter a minimum amount of UGX 1,000.');

  // ── Optimistic UI ──
  btn.disabled = true;
  showStatus(statusEl, 'loading', 'Processing your donation…');

  // ================================================================
  // FASTAPI ENDPOINT PLACEHOLDER — Replace the catch block mock
  // with real error handling once FastAPI is connected.
  // ================================================================
  try {
    const response = await fetch(ENDPOINTS.donate, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

    const data = await response.json();

    if (data.success) {
      showStatus(statusEl, 'success',
        `Thank you, ${payload.name}! Your donation of UGX ${payload.amount.toLocaleString()} was received. Reference: ${data.reference || 'N/A'}`
      );
      resetDonationForm();
    } else {
      throw new Error(data.message || 'Donation could not be processed.');
    }

  } catch (err) {
    // ----------------------------------------------------------------
    // MOCK RESPONSE — Remove this block once FastAPI is live.
    // It simulates a successful donation for UI development purposes.
    // ----------------------------------------------------------------
    if (!BASE_API_URL) {
      console.warn('[DEV MODE] FastAPI not connected. Simulating success response.');
      showStatus(statusEl, 'success',
        `[DEV] Thank you, ${payload.name || 'Donor'}! Mock reference: AGF-${Date.now()}`
      );
      resetDonationForm();
    } else {
      showStatus(statusEl, 'error', `Error: ${err.message}. Please try again or call +256 759 208 729.`);
    }
    // ----------------------------------------------------------------
  } finally {
    btn.disabled = false;
  }
}

function resetDonationForm() {
  document.getElementById('donor-name').value  = '';
  document.getElementById('donor-email').value = '';
  document.getElementById('donor-phone').value = '';
  document.getElementById('custom-amount').value = '';
  document.querySelectorAll('#amount-chips .chip').forEach((c, i) => {
    c.classList.toggle('active', i === 0);
  });
}


/* =========================================================
   6. NEWSLETTER
   =========================================================
   DEVELOPER NOTE:
   POST /api/v1/newsletter/subscribe
   Implement this FastAPI route before going to production.
   ======================================================= */

/**
 * Subscribes an email address to the foundation newsletter.
 * Called by the Subscribe button's onclick handler.
 */
async function subscribeNewsletter() {
  const emailInput = document.getElementById('newsletter-email');
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  // ================================================================
  // FASTAPI ENDPOINT PLACEHOLDER — POST /api/v1/newsletter/subscribe
  // ================================================================
  try {
    const response = await fetch(ENDPOINTS.newsletter, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`You're subscribed! Thank you for staying connected with us.`);
      emailInput.value = '';
    } else {
      throw new Error(data.message || 'Subscription failed.');
    }

  } catch (err) {
    // ── DEV MODE mock ──
    if (!BASE_API_URL) {
      console.warn('[DEV MODE] Newsletter endpoint not connected. Simulating.');
      alert(`[DEV] Subscribed: ${email}`);
      emailInput.value = '';
    } else {
      alert(`Could not subscribe: ${err.message}. Please try again later.`);
    }
  }
}


/* =========================================================
   7. VIDEO LIGHTBOX (PLACEHOLDER)
   =========================================================
   Replace the src below with your YouTube / Vimeo embed URL.
   ======================================================= */
function initVideoLightbox() {
  const playBtn = document.getElementById('video-play-btn');
  if (!playBtn) return;

  // ── PLACEHOLDER: swap this URL with your real embed link ──
  const VIDEO_EMBED_URL = 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1';

  playBtn.addEventListener('click', openVideoModal);
  playBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openVideoModal(); });

  function openVideoModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.92);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;cursor:pointer;
    `;

    const iframe = document.createElement('iframe');
    iframe.src              = VIDEO_EMBED_URL;
    iframe.width            = '90%';
    iframe.style.aspectRatio = '16/9';
    iframe.style.maxWidth    = '900px';
    iframe.style.border      = 'none';
    iframe.allow             = 'autoplay; fullscreen';
    iframe.allowFullscreen   = true;

    const close = document.createElement('button');
    close.innerHTML  = '&times;';
    close.style.cssText = `
      position:absolute;top:1.5rem;right:2rem;
      background:none;border:none;color:#fff;font-size:2.5rem;cursor:pointer;
    `;
    close.addEventListener('click', () => document.body.removeChild(overlay));

    overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.contains(overlay)) document.body.removeChild(overlay); }, { once: true });

    overlay.appendChild(iframe);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
  }
}


/* =========================================================
   8. INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCounters();
  initAmountChips();
  initVideoLightbox();
});
