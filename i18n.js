(function () {
  var STORAGE_KEY = 'site_lang';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'hi';
  }

  function applyLang(lang) {
    document.querySelectorAll('[data-hi]').forEach(function (el) {
      var text = lang === 'en' ? (el.getAttribute('data-en') || el.getAttribute('data-hi')) : el.getAttribute('data-hi');
      el.textContent = text;
    });
    var btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = lang === 'en' ? 'हिं' : 'EN';
    document.documentElement.lang = lang;
  }

  window.toggleLang = function () {
    var next = getLang() === 'en' ? 'hi' : 'en';
    localStorage.setItem(STORAGE_KEY, next);
    applyLang(next);
  };

  window.addEventListener('DOMContentLoaded', function () {
    applyLang(getLang());
  });
})();
