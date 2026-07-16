/* FalqenView — components.js
   Injects shared nav and footer into every page.
   Usage: <script src="/assets/components.js"></script>
   Place a <div id="fv-nav"></div> before body content and
   <div id="fv-footer"></div> at the end of body.

   ── LOAD-BEARING CONSTRAINT — read before editing nav.html ──
   Components are injected via `el.outerHTML = responseText`. Per the
   HTML spec, <script> tags inserted through innerHTML/outerHTML are
   flagged "already started" and NEVER EXECUTE. Inline scripts placed
   in nav.html or footer.html are dead markup — they will parse into
   the DOM and silently do nothing.

   Therefore: ALL behavior for injected components lives in THIS file,
   wired through the loadComponent() callback. nav.html and footer.html
   are markup-only, always.

   Cost of forgetting: 2026-07-15, a self-initializing dropdown script
   was shipped inside nav.html. It never fired. Symptom presented as
   "the dropdown doesn't exist," which reads like a CSS or caching
   problem, not a JS one.
*/
(function () {
  'use strict';

  function loadComponent(id, url, callback) {
    var el = document.getElementById(id);
    if (!el) return;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        el.outerHTML = xhr.responseText;
        if (callback) callback();
      }
    };
    xhr.send();
  }

  /* Top-level nav links only. Dropdown-panel links live inside
     .nav-links too, but must never receive .active — the underline
     styling is for the top rail, not the panel rows. */
  function setActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('nav .nav-links > li > a').forEach(function (a) {
      var href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  /* Products dropdown (desktop rail).
     NOTE: this lives here, not in nav.html — component markup is
     injected via outerHTML, which never executes inline <script>. */
  function initNavDropdown() {
    var btn   = document.getElementById('navDropBtn');
    var panel = document.getElementById('navDropPanel');
    if (!btn || !panel) return;
    var wrap = btn.closest('.nav-drop');
    if (!wrap) return;

    function open(state) {
      wrap.classList.toggle('open', state);
      btn.setAttribute('aria-expanded', state ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      open(!wrap.classList.contains('open'));
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) open(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') open(false);
    });

    wrap.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!wrap.contains(document.activeElement)) open(false);
      }, 0);
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { open(false); });
    });

    /* Hover is the primary desktop interaction (pure CSS :hover on
       .nav-drop). Clicking the trigger sets .open, which would then
       survive after the cursor leaves and stay stuck until an outside
       click. Clearing .open on mouseleave hands control back to :hover
       so both behave as one menu. Pointer-devices only — this never
       fires on touch, where .open is the only way the panel opens. */
    wrap.addEventListener('mouseleave', function () {
      if (wrap.contains(document.activeElement)) return;
      open(false);
    });
  }

  /* Products accordion (mobile menu). */
  function initMobileAccordion() {
    var accBtn   = document.getElementById('mmAccBtn');
    var accPanel = document.getElementById('mmAccPanel');
    if (!accBtn || !accPanel) return;
    accBtn.addEventListener('click', function () {
      var isOpen = accPanel.classList.toggle('shown');
      accBtn.classList.toggle('open', isOpen);
      accBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initMobileMenu() {
    var mt = document.getElementById('menuToggle');
    var mm = document.getElementById('mobileMenu');
    if (!mt || !mm) return;

    /* Collapse the Products accordion whenever the menu closes, so it
       never reopens mid-expanded on the next tap. */
    function resetAccordion() {
      var accBtn   = document.getElementById('mmAccBtn');
      var accPanel = document.getElementById('mmAccPanel');
      if (!accBtn || !accPanel) return;
      accPanel.classList.remove('shown');
      accBtn.classList.remove('open');
      accBtn.setAttribute('aria-expanded', 'false');
    }

    mt.addEventListener('click', function () {
      var open = mm.classList.toggle('shown');
      mt.setAttribute('aria-expanded', open);
      mt.textContent = open ? '✕' : '≡';
      if (!open) resetAccordion();
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mm.classList.remove('shown');
        mt.textContent = '≡';
        mt.setAttribute('aria-expanded', false);
        resetAccordion();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadComponent('fv-nav', '/assets/nav.html', function () {
      setActiveNav();
      initMobileMenu();
      initNavDropdown();
      initMobileAccordion();
    });
    loadComponent('fv-footer', '/assets/footer.html');
  });
})();
