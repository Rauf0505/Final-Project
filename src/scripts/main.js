import '../stylesheets/style.css';

/**
 * Times To Trend - Main JavaScript
 * Handles Header, Navigation, Search, and Global UI interactions.
 */

// ============================================
// GLOBAL STATE
// ============================================
const state = {
  isMenuOpen: false,
  isSearchOpen: false,
  isHeaderScrolled: false,
  isWaHidden: false,
  lastScrollY: 0,
  scrollTicking: false,
  resizeTicking: false
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSearch();
  initWhatsApp();
  initGlobalEvents();
  initSmoothScroll();
});

// ============================================
// 1. HEADER & NAVIGATION LOGIC
// ============================================

function initHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  // Active Link Highlighting
  highlightActiveLinks();
}

function highlightActiveLinks() {
  const navLinks = document.querySelectorAll('nav a');

  // Get current path details
  const currentPath = window.location.pathname;
  const currentFile = (currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html')
    .split('?')[0].split('#')[0];

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalize href
    const hrefFile = (href.split('/').pop() || 'index.html')
      .split('?')[0].split('#')[0];

    // Match logic
    if (currentFile === hrefFile) {
      // Style active link
      link.classList.add('text-gold');
      link.classList.remove('text-neutral-600', 'text-neutral-800');

      // Style underscore (Desktop)
      const underscore = link.querySelector('span');
      if (underscore) {
        underscore.classList.remove('w-0');
        underscore.classList.add('w-full');
      }
    }
  });
}

// ============================================
// 2. MOBILE MENU LOGIC
// ============================================

const mobileMenuElements = {
  get btn() { return document.getElementById('mobile-menu-btn'); },
  get menu() { return document.getElementById('mobile-menu'); },
  get header() { return document.querySelector('header'); },
  get links() { return document.querySelectorAll('#mobile-menu a'); }
};

function initMobileMenu() {
  const btn = mobileMenuElements.btn;
  const menu = mobileMenuElements.menu;
  const links = mobileMenuElements.links;

  if (!btn || !menu) return;

  // Toggle Button
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close on Link Click
  links.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

function toggleMobileMenu() {
  state.isMenuOpen ? closeMobileMenu() : openMobileMenu();
}

function openMobileMenu() {
  const btn = mobileMenuElements.btn;
  const menu = mobileMenuElements.menu;
  const header = mobileMenuElements.header;

  if (!menu || !header) return;

  // Ensure Search is closed
  if (state.isSearchOpen) closeSearch();

  state.isMenuOpen = true;

  // Update Attributes
  if (btn) btn.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Calculate Height
  updateMobileMenuHeight();

  // Add Focus Trap & Listeners
  menu.addEventListener('keydown', handleMenuFocusTrap);

  // Auto-focus first link
  requestAnimationFrame(() => {
    const firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus();
  });
}

function closeMobileMenu() {
  const btn = mobileMenuElements.btn;
  const menu = mobileMenuElements.menu;

  if (!menu) return;

  state.isMenuOpen = false;

  // Update Attributes
  if (btn) btn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');

  // Restore scroll only if search is also closed
  if (!state.isSearchOpen) document.body.style.overflow = '';

  // Collapse
  menu.style.maxHeight = '0px';
  menu.classList.add('overflow-hidden');
  menu.classList.remove('overflow-y-auto');

  // Remove Listeners
  menu.removeEventListener('keydown', handleMenuFocusTrap);

  if (btn) btn.focus();
}

function updateMobileMenuHeight() {
  const menu = mobileMenuElements.menu;
  const header = mobileMenuElements.header;

  if (!state.isMenuOpen || !menu || !header) return;

  const headerBottom = header.getBoundingClientRect().bottom;
  const availableHeight = window.innerHeight - headerBottom;
  const contentHeight = menu.scrollHeight;

  const finalHeight = Math.min(contentHeight, availableHeight);
  menu.style.maxHeight = `${finalHeight}px`;

  // Manage Overflow
  if (contentHeight > availableHeight) {
    setTimeout(() => {
      if (state.isMenuOpen) {
        menu.classList.remove('overflow-hidden');
        menu.classList.add('overflow-y-auto');
      }
    }, 300);
  } else {
    menu.classList.add('overflow-hidden');
    menu.classList.remove('overflow-y-auto');
  }
}

function handleMenuFocusTrap(e) {
  if (e.key !== 'Tab') return;
  const menu = mobileMenuElements.menu;

  const focusables = menu.querySelectorAll('a, button:not([disabled])');
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// ============================================
// 3. SEARCH BAR LOGIC
// ============================================

const searchElements = {
  get toggleBtn() { return document.getElementById('search-toggle-btn'); },
  get bar() { return document.getElementById('search-bar'); },
  get input() { return document.getElementById('search-input'); },
  get closeBtn() { return document.getElementById('search-close-btn'); }
};

function initSearch() {
  const toggleBtn = searchElements.toggleBtn;
  const bar = searchElements.bar;
  const closeBtn = searchElements.closeBtn;

  if (!toggleBtn || !bar) return;

  // Toggle Button
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSearch();
  });

  // Close Button
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSearch();
    });
  }
}

function toggleSearch() {
  state.isSearchOpen ? closeSearch() : openSearch();
}

function openSearch() {
  const toggleBtn = searchElements.toggleBtn;
  const bar = searchElements.bar;
  const input = searchElements.input;

  if (!bar) return;

  // Ensure Menu is closed
  if (state.isMenuOpen) closeMobileMenu();

  state.isSearchOpen = true;

  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Expand
  bar.style.maxHeight = bar.scrollHeight + 'px';

  // Focus
  requestAnimationFrame(() => {
    if (input) input.focus();
  });
}

function closeSearch() {
  const toggleBtn = searchElements.toggleBtn;
  const bar = searchElements.bar;

  if (!bar) return;

  state.isSearchOpen = false;

  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');

  if (!state.isMenuOpen) document.body.style.overflow = '';

  bar.style.maxHeight = '0px';

  if (toggleBtn) toggleBtn.focus();
}

// ============================================
// 4. WHATSAPP FLOATING BUTTON
// ============================================

function initWhatsApp() {
  // Logic handled in updateUI loop
}

// ============================================
// 5. GLOBAL EVENTS & SMOOTH SCROLL
// ============================================

function initGlobalEvents() {
  // 1. Click Outside Handler
  document.addEventListener('click', (e) => {
    // Close Mobile Menu
    const menu = mobileMenuElements.menu;
    const btn = mobileMenuElements.btn;
    if (state.isMenuOpen && menu) {
      if (!menu.contains(e.target) && !btn?.contains(e.target)) {
        closeMobileMenu();
      }
    }

    // Close Search
    const searchBar = searchElements.bar;
    const searchBtn = searchElements.toggleBtn;
    if (state.isSearchOpen && searchBar) {
      if (!searchBar.contains(e.target) && !searchBtn?.contains(e.target)) {
        closeSearch();
      }
    }
  });

  // 2. Global Escape Key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.isMenuOpen) closeMobileMenu();
      if (state.isSearchOpen) closeSearch();
    }
  });

  // 3. Scroll Loop
  window.addEventListener('scroll', () => {
    if (!state.scrollTicking) {
      requestAnimationFrame(updateUI);
      state.scrollTicking = true;
    }
  }, { passive: true });

  // 4. Resize Loop
  window.addEventListener('resize', () => {
    if (!state.resizeTicking) {
      requestAnimationFrame(handleResize);
      state.resizeTicking = true;
    }
  }, { passive: true });

  // Initial UI check
  updateUI();
}

function handleResize() {
  const width = window.innerWidth;

  if (width >= 768) {
    if (state.isMenuOpen) closeMobileMenu();
    if (state.isSearchOpen) closeSearch();
  } else {
    // Recalc height if menu is open on mobile
    if (state.isMenuOpen) updateMobileMenuHeight();
  }

  state.resizeTicking = false;
}

function updateUI() {
  const currentScrollY = window.scrollY;
  const header = document.querySelector('header');
  const waFloat = document.getElementById('whatsapp-float');

  // A. Sticky Header Logic
  if (header) {
    const shouldBeScrolled = currentScrollY > 20;
    if (shouldBeScrolled !== state.isHeaderScrolled) {
      state.isHeaderScrolled = shouldBeScrolled;
      const addCls = state.isHeaderScrolled ? 'add' : 'remove';
      const remCls = state.isHeaderScrolled ? 'remove' : 'add';

      header.classList[addCls]('shadow-lg', 'bg-white/95', 'backdrop-blur-sm');
      header.classList[remCls]('bg-white');
    }
  }

  // B. WhatsApp Scroll Logic
  if (waFloat) {
    // Hide if scrolling DOWN (>100px), Show if scrolling UP
    const isScrollingDown = currentScrollY > state.lastScrollY;
    const shouldHide = isScrollingDown && currentScrollY > 100;

    if (shouldHide !== state.isWaHidden) {
      state.isWaHidden = shouldHide;
      const addCls = state.isWaHidden ? 'add' : 'remove';
      const remCls = state.isWaHidden ? 'remove' : 'add';

      waFloat.classList[addCls]('translate-y-24', 'opacity-0');
      waFloat.classList[remCls]('translate-y-0', 'opacity-100');
    }
  }

  state.lastScrollY = currentScrollY;
  state.scrollTicking = false;
}

function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          if (state.isMenuOpen) closeMobileMenu();
          if (state.isSearchOpen) closeSearch();

          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}
