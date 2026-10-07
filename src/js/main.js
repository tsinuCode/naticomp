/**
 * NATI COMPUTER — Main Application Entry Point
 * Coordinates Continuous Cinematic Hero, Homepage Sections, and Interactive Modals.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContinuousCinematicHero } from './components/ContinuousCinematicHero.js';
import { WebsiteSections } from './components/WebsiteSections.js';

gsap.registerPlugin(ScrollTrigger);

async function initApp() {
  // 1. Initialize Continuous Cinematic Hero (single pinned continuous canvas sequence)
  const cinematicHero = new ContinuousCinematicHero();
  await cinematicHero.init();

  // 2. Initialize Standard Website Sections (nav, reveals, cart, search, quickview, counters)
  const websiteSections = new WebsiteSections();
  websiteSections.init();

  // 3. Update ScrollTrigger calculations after all canvases and layouts are initialized
  ScrollTrigger.refresh();

  // Handle resize debouncing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  }, { passive: true });
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
