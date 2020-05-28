'use strict';

// Главный скрипт
// ---------------

(function () {
  // Обработчики
  // ---------------
  var toggleMainNav = function () {
    if (mainNav.classList.contains('main-nav--closed')) {
      mainNav.classList.remove('main-nav--closed');
      mainNav.classList.add('main-nav--opened')
    } else {
      mainNav.classList.remove('main-nav--opened');
      mainNav.classList.add('main-nav--closed')
    }
  }

  // DOM
  // ---------------
  var mainNav = document.querySelector('.main-nav');
  var mainNavToggle = mainNav.querySelector('.main-nav__toggle');

  // Старт
  // ---------------
  mainNavToggle.addEventListener('click', toggleMainNav);
})();
