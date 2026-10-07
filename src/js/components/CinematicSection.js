/**
 * CinematicSection
 * Manages full-screen 100vh pinned scroll sections linked to ScrollFrameAnimation.
 * Controls GSAP ScrollTrigger scrubbing, section entry/exit, and minimal UI indicators.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollFrameAnimation } from './ScrollFrameAnimation.js';

gsap.registerPlugin(ScrollTrigger);

export class CinematicSection {
  /**
   * @param {Object} config
   * @param {string} config.sectionId - DOM id for the section container
   * @param {string} config.canvasId - DOM id for the canvas
   * @param {number} config.frameCount - Number of frames in sequence
   * @param {function(number): string} config.getFramePath - Function returning frame URL
   * @param {string} config.label - Chapter label (e.g. '01 / GAMING PC')
   * @param {string} config.subtitle - Chapter subtitle (e.g. 'PORTAL ARRIVAL')
   * @param {number} [config.scrollDistanceRatio=2.5] - Multiplier of viewport height for scrub distance
   */
  constructor(config) {
    this.config = config;
    this.sectionEl = document.getElementById(config.sectionId);
    this.canvasEl = document.getElementById(config.canvasId);
    this.badgeEl = this.sectionEl?.querySelector('.cinematic__badge');
    this.progressBarEl = this.sectionEl?.querySelector('.cinematic__bar-fill');
    this.scrollTrigger = null;
    this.frameAnimation = null;
  }

  async init() {
    if (!this.sectionEl || !this.canvasEl) {
      console.warn(`[CinematicSection] Missing elements for ${this.config.sectionId}`);
      return;
    }

    // Initialize the frame sequence renderer
    this.frameAnimation = new ScrollFrameAnimation(this.canvasEl, {
      frameCount: this.config.frameCount,
      getFramePath: this.config.getFramePath,
      blend: true,
    });
    await this.frameAnimation.init();

    this._setupScrollTrigger();
  }

  _setupScrollTrigger() {
    const isMobile = window.innerWidth <= 768;
    const ratio = isMobile ? 1.8 : (this.config.scrollDistanceRatio || 2.2);

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.sectionEl,
      start: 'top top',
      end: () => `+=${window.innerHeight * ratio}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.3, // Silky smooth scrubbing without lag
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        // Strictly drive animation with user's scroll progress
        this.frameAnimation.setProgress(progress);

        // Update subtle corner progress bar if present
        if (this.progressBarEl) {
          this.progressBarEl.style.transform = `scaleX(${progress})`;
        }
      },
    });
  }

  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
    if (this.frameAnimation) {
      this.frameAnimation.destroy();
    }
  }
}
