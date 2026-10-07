/**
 * WebsiteSections.js
 * NATI COMPUTER — Interactive Logic for All Homepage Sections & Modals
 *
 * Handles:
 *  - Sticky Nav & Scrolled State
 *  - Active Section ScrollSpy
 *  - Mobile Drawer Navigation
 *  - Portal Navigation Anchor -> Scrolls to Cinematic Timeline
 *  - Interactive Cart Drawer (State, Quantities, Remove, Subtotal, Checkout)
 *  - Live Search Modal (Search products, categories, services)
 *  - Product Quick View Modal (Populate specs, price, gallery, Add to Cart)
 *  - Animated Stats Counters
 *  - Smooth Scroll Anchors & Circular Back-To-Top Button
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Product Catalog Data for Quick View & Cart
export const PRODUCTS_CATALOG = {
  'optiplex-7010': {
    id: 'optiplex-7010',
    name: 'Dell OptiPlex 7010',
    category: 'Desktop · Business',
    badge: 'BEST SELLER',
    badgeType: 'violet',
    specs: 'Intel Core i5 12th Gen · 8GB DDR4 · 256GB NVMe SSD · Intel UHD Graphics 770 · Windows 11 Pro',
    price: 42500,
    priceFormatted: 'ETB 42,500',
    image: '/assets/dell_optiplex.jpg',
    description: 'Enterprise-grade desktop built for relentless productivity, reliability, and security in demanding office and home workspace environments.',
  },
  'pavilion-15': {
    id: 'pavilion-15',
    name: 'HP Pavilion 15',
    category: 'Laptop · Productivity',
    badge: 'NEW',
    badgeType: 'cyan',
    specs: 'Intel Core i5 13th Gen · 8GB DDR4 · 512GB NVMe SSD · 15.6" FHD IPS Micro-Edge Display · Fast Charge',
    price: 62000,
    priceFormatted: 'ETB 62,000',
    image: '/assets/hp_pavilion.jpg',
    description: 'Sleek silver ultrabook designed for effortless everyday productivity, long battery endurance, and stunning media playback.',
  },
  'rog-strix-g16': {
    id: 'rog-strix-g16',
    name: 'ASUS ROG Strix G16',
    category: 'Gaming Laptop',
    badge: 'POPULAR',
    badgeType: 'violet',
    specs: 'Intel Core i7 13650HX · RTX 4060 8GB · 16GB DDR5 4800MHz · 1TB PCIe 4.0 SSD · 165Hz ROG Nebula Display',
    price: 78600,
    priceFormatted: 'ETB 78,600',
    image: '/assets/asus_rog_strix.jpg',
    description: 'Dominating AAA gaming rig featuring advanced liquid metal cooling, customizable per-key RGB, and high-FPS tournament display performance.',
  },
  'odyssey-g5': {
    id: 'odyssey-g5',
    name: 'Samsung Odyssey G5',
    category: 'Monitor · 27"',
    badge: 'CURVED',
    badgeType: 'cyan',
    specs: '27-inch 1000R Curved Panel · WQHD (2560x1440) · 165Hz Refresh Rate · 1ms Response (MPRT) · HDR10',
    price: 24500,
    priceFormatted: 'ETB 24,500',
    image: '/assets/samsung_odyssey.jpg',
    description: 'Deep 1000R curved gaming immersion matching the human eye field of view for razor-sharp visual clarity without eye fatigue.',
  },
  'archer-ax3000': {
    id: 'archer-ax3000',
    name: 'TP-Link Archer AX3000',
    category: 'Networking',
    badge: 'WI-FI 6',
    badgeType: 'cyan',
    specs: 'Dual-Band Wi-Fi 6 · Up to 3.0 Gbps (2402 Mbps 5GHz + 574 Mbps 2.4GHz) · 4 High-Gain Antennas · OFDMA & MU-MIMO',
    price: 8500,
    priceFormatted: 'ETB 8,500',
    image: '/assets/tplink_router.jpg',
    description: 'Next-generation Wi-Fi 6 technology with ultra-low latency, beamforming coverage, and capacity for over 50 simultaneous high-bandwidth devices.',
  },
};

export class WebsiteSections {
  constructor() {
    this.cart = [];
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    this._initNav();
    this._initScrollSpy();
    this._initSmoothAnchors();
    this._initBackToTop();
    this._initStatsCounters();
    this._initSectionReveals();
    this._initCartDrawer();
    this._initSearchModal();
    this._initQuickViewModal();
  }

  _initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-links');

    // Sticky nav appearance on scroll
    ScrollTrigger.create({
      start: 'top -40',
      onUpdate: (self) => {
        nav?.classList.toggle('is-scrolled', self.scroll() > 40);
      },
    });

    // Mobile hamburger menu toggle
    toggle?.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking any nav link
    menu?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle?.classList.remove('is-active');
        toggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  _initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav__links a');
    const sections = [
      { id: 'hero', selector: '#hero' },
      { id: 'categories', selector: '#categories' },
      { id: 'products', selector: '#products' },
      { id: 'brands', selector: '#brands' },
      { id: 'services', selector: '#services' },
      { id: 'why', selector: '#why' },
      { id: 'about', selector: '#about' },
      { id: 'location', selector: '#location' },
      { id: 'contact', selector: '#contact' },
    ];

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 120;
      let currentSectionId = 'hero';

      sections.forEach(({ id, selector }) => {
        const el = document.querySelector(selector);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSectionId = id;
          }
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}` || (currentSectionId === 'hero' && href === '#hero')) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }, { passive: true });
  }

  _initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        // Special handling for Portal link
        if (href === '#portal' || href === '#cinematic-pc') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('scrollToPortalSequence'));
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navOffset = 76;
          const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;

          window.scrollTo({
            top: targetY,
            behavior: this.prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
      });
    });
  }

  _initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: this.prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  _initStatsCounters() {
    const stats = document.querySelectorAll('.about__stat-value');
    if (!stats.length) return;

    stats.forEach((stat) => {
      const target = Number(stat.dataset.target) || 100;
      const suffix = stat.dataset.suffix || '%';

      if (this.prefersReducedMotion) {
        stat.textContent = `${target}${suffix}`;
        return;
      }

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(stat, {
            textContent: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate: function () {
              stat.textContent = `${Math.round(this.targets()[0].textContent)}${suffix}`;
            },
          });
        },
      });
    });
  }

  _initSectionReveals() {
    if (this.prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.utils.toArray('.reveal').forEach((el) => {
      const delay = el.dataset.delay ? Number(el.dataset.delay) * 0.1 : 0;

      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
      });
    });
  }

  _initCartDrawer() {
    const cartToggleBtns = document.querySelectorAll('.js-cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartCheckoutBtn = document.getElementById('cart-checkout');

    const updateCartUI = () => {
      // Update badge count
      const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      if (cartBadge) {
        cartBadge.textContent = String(totalCount);
        cartBadge.classList.toggle('has-items', totalCount > 0);
        // Subtle badge pulse
        cartBadge.classList.remove('pulse-anim');
        void cartBadge.offsetWidth; // reflow
        cartBadge.classList.add('pulse-anim');
      }

      // Update items list
      if (cartItemsContainer) {
        if (this.cart.length === 0) {
          cartItemsContainer.innerHTML = `
            <div class="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <p>Your shopping cart is currently empty.</p>
              <a href="#products" class="btn btn--outline btn--sm" id="cart-start-shopping">Explore Products</a>
            </div>
          `;
          document.getElementById('cart-start-shopping')?.addEventListener('click', () => closeCart());
        } else {
          cartItemsContainer.innerHTML = this.cart.map((item) => `
            <div class="cart-item" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}" class="cart-item__img" />
              <div class="cart-item__info">
                <h4 class="cart-item__title">${item.name}</h4>
                <div class="cart-item__price">ETB ${(item.price * item.quantity).toLocaleString()}</div>
                <div class="cart-item__controls">
                  <div class="cart-item__qty">
                    <button class="cart-qty-btn js-qty-minus" aria-label="Decrease quantity">−</button>
                    <span class="cart-qty-val">${item.quantity}</span>
                    <button class="cart-qty-btn js-qty-plus" aria-label="Increase quantity">+</button>
                  </div>
                  <button class="cart-remove-btn js-cart-remove" aria-label="Remove item">Remove</button>
                </div>
              </div>
            </div>
          `).join('');

          // Wire item quantity & removal buttons
          cartItemsContainer.querySelectorAll('.cart-item').forEach((itemEl) => {
            const id = itemEl.dataset.id;
            itemEl.querySelector('.js-qty-minus')?.addEventListener('click', () => this.changeQuantity(id, -1));
            itemEl.querySelector('.js-qty-plus')?.addEventListener('click', () => this.changeQuantity(id, 1));
            itemEl.querySelector('.js-cart-remove')?.addEventListener('click', () => this.removeFromCart(id));
          });
        }
      }

      // Update subtotal
      const subtotalVal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (cartSubtotal) {
        cartSubtotal.textContent = `ETB ${subtotalVal.toLocaleString()}`;
      }
    };

    const openCart = () => {
      cartDrawer?.classList.add('is-open');
      cartOverlay?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      updateCartUI();
    };

    const closeCart = () => {
      cartDrawer?.classList.remove('is-open');
      cartOverlay?.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    cartToggleBtns.forEach((btn) => btn.addEventListener('click', openCart));
    cartCloseBtn?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    // Checkout notification
    cartCheckoutBtn?.addEventListener('click', () => {
      if (this.cart.length === 0) {
        alert('Your cart is empty. Please select products to continue.');
        return;
      }
      alert('Order initiated! NATI COMPUTER team will confirm your order in Dire Dawa via phone/Telegram.');
      closeCart();
    });

    // Wire up Add-To-Cart buttons across the site
    document.querySelectorAll('.js-add-to-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.dataset.productId;
        const product = PRODUCTS_CATALOG[productId];
        if (product) {
          this.addToCart(product);
          openCart();
        }
      });
    });

    // Save update method
    this._updateCartUI = updateCartUI;
  }

  addToCart(product) {
    const existing = this.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this._updateCartUI?.();
  }

  changeQuantity(productId, delta) {
    const item = this.cart.find((i) => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this._updateCartUI?.();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this._updateCartUI?.();
  }

  _initSearchModal() {
    const searchToggleBtn = document.getElementById('search-toggle');
    const searchModal = document.getElementById('search-modal');
    const searchCloseBtn = document.getElementById('search-close');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const searchableItems = [
      { type: 'Product', name: 'Dell OptiPlex 7010', desc: 'Business Desktop · Intel i5 · 8GB · 256GB SSD', url: '#products' },
      { type: 'Product', name: 'HP Pavilion 15', desc: 'Ultrabook Laptop · Intel i5 · 8GB · 512GB SSD', url: '#products' },
      { type: 'Product', name: 'ASUS ROG Strix G16', desc: 'Gaming Laptop · Intel i7 · RTX 4060 · 16GB DDR5', url: '#products' },
      { type: 'Product', name: 'Samsung Odyssey G5', desc: '27" Curved Gaming Display · 165Hz · 1ms', url: '#products' },
      { type: 'Product', name: 'TP-Link Archer AX3000', desc: 'Wi-Fi 6 Router · Dual-Band · 3.0 Gbps', url: '#products' },
      { type: 'Category', name: 'Gaming Computers', desc: 'Custom high-FPS liquid-cooled rigs', url: '#categories' },
      { type: 'Category', name: 'Ultrabooks & Laptops', desc: 'Creator & portable ultrabooks', url: '#categories' },
      { type: 'Category', name: 'Networking Solutions', desc: 'Enterprise switches, mesh Wi-Fi, routers', url: '#categories' },
      { type: 'Service', name: 'Computer & Laptop Repair', desc: 'Board-level micro-soldering and diagnostics', url: '#services' },
      { type: 'Service', name: 'Hardware Upgrades', desc: 'DDR5 RAM, NVMe SSDs, GPU installation', url: '#services' },
      { type: 'Service', name: 'IT Support & Networking', desc: 'Office infrastructure & on-site maintenance', url: '#services' },
    ];

    const openSearch = () => {
      searchModal?.classList.add('is-open');
      searchOverlay?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput?.focus(), 50);
      renderResults(searchInput?.value || '');
    };

    const closeSearch = () => {
      searchModal?.classList.remove('is-open');
      searchOverlay?.classList.remove('is-open');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
    };

    const renderResults = (query) => {
      if (!searchResults) return;
      const q = query.trim().toLowerCase();
      const filtered = q
        ? searchableItems.filter((item) => item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.type.toLowerCase().includes(q))
        : searchableItems.slice(0, 5);

      if (filtered.length === 0) {
        searchResults.innerHTML = `<div class="search-empty">No matching products or services found for "${query}".</div>`;
        return;
      }

      searchResults.innerHTML = filtered.map((item) => `
        <a href="${item.url}" class="search-result-item">
          <span class="search-result-type">${item.type}</span>
          <div class="search-result-content">
            <strong>${item.name}</strong>
            <p>${item.desc}</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      `).join('');

      searchResults.querySelectorAll('.search-result-item').forEach((item) => {
        item.addEventListener('click', closeSearch);
      });
    };

    searchToggleBtn?.addEventListener('click', openSearch);
    searchCloseBtn?.addEventListener('click', closeSearch);
    searchOverlay?.addEventListener('click', closeSearch);

    searchInput?.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  _initQuickViewModal() {
    const modal = document.getElementById('quickview-modal');
    const overlay = document.getElementById('quickview-overlay');
    const closeBtn = document.getElementById('quickview-close');

    const modalImg = document.getElementById('quickview-img');
    const modalBadge = document.getElementById('quickview-badge');
    const modalTitle = document.getElementById('quickview-title');
    const modalCategory = document.getElementById('quickview-category');
    const modalSpecs = document.getElementById('quickview-specs');
    const modalDesc = document.getElementById('quickview-desc');
    const modalPrice = document.getElementById('quickview-price');
    const modalAddToCart = document.getElementById('quickview-add-to-cart');

    let currentProduct = null;

    const openModal = (product) => {
      if (!product || !modal) return;
      currentProduct = product;

      if (modalImg) modalImg.src = product.image;
      if (modalBadge) {
        modalBadge.textContent = product.badge;
        modalBadge.className = `product-badge product-badge--${product.badgeType}`;
      }
      if (modalTitle) modalTitle.textContent = product.name;
      if (modalCategory) modalCategory.textContent = product.category;
      if (modalSpecs) modalSpecs.textContent = product.specs;
      if (modalDesc) modalDesc.textContent = product.description;
      if (modalPrice) modalPrice.textContent = product.priceFormatted;

      modal.classList.add('is-open');
      overlay?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal?.classList.remove('is-open');
      overlay?.classList.remove('is-open');
      document.body.style.overflow = '';
      currentProduct = null;
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // Wire up "View Product" buttons
    document.querySelectorAll('.js-quick-view').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.productId;
        const product = PRODUCTS_CATALOG[id];
        if (product) openModal(product);
      });
    });

    modalAddToCart?.addEventListener('click', () => {
      if (currentProduct) {
        this.addToCart(currentProduct);
        closeModal();
        document.getElementById('cart-drawer')?.classList.add('is-open');
        document.getElementById('cart-overlay')?.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  }
}
