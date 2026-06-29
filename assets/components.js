/* FalqenView — components.js
   Injects shared nav and footer into every page.
   Usage: <script src="/assets/components.js"></script>
   Place a <div id="fv-nav"></div> before body content and
   <div id="fv-footer"></div> at the end of body.
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

  function setActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('nav .nav-links a').forEach(function (a) {
      var href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  function initMobileMenu() {
    var mt = document.getElementById('menuToggle');
    var mm = document.getElementById('mobileMenu');
    if (!mt || !mm) return;
    mt.addEventListener('click', function () {
      var open = mm.classList.toggle('shown');
      mt.setAttribute('aria-expanded', open);
      mt.textContent = open ? '✕' : '≡';
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mm.classList.remove('shown');
        mt.textContent = '≡';
        mt.setAttribute('aria-expanded', false);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadComponent('fv-nav', '/assets/nav.html', function () {
      setActiveNav();
      initMobileMenu();
    });
    loadComponent('fv-footer', '/assets/footer.html');
  });
})();
