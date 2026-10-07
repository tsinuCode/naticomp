/**
 * ContinuousCinematicHero.js
 * NATI COMPUTER — Pinned Continuous Cinematic Hero Experience
 *
 * Sequence Flow:
 *  0% - 8%:   Hero Intro (hero_setup.jpg, headline, subtitle, buttons, scroll hint)
 *             -> Text smoothly glides up, fades, and shrinks to 0 opacity
 *  8% - 25%:  screen_2 (Empty Portal -> Gaming PC Emergence, 40 frames)
 *  25% - 40%: screen_3 (Gaming PC -> Empty Portal Exit, 40 frames)
 *  40% - 57%: screen_4 (Empty Portal -> Laptop Emergence, 40 frames)
 *  57% - 72%: screen_5 (Laptop -> Empty Portal Exit, 26 frames)
 *  72% - 94%: screen_6 (Empty Portal -> Monitor Emergence, 26 frames)
 *  94% - 100%:Cinematic Ending -> Smooth unpin into normal homepage content
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Natural numerical sort comparator
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Generate file paths with exact natural order
function generateFramePaths(folder, count) {
  const paths = [];
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(3, '0');
    paths.push(`/assets/${folder}/ezgif-frame-${num}.jpg`);
  }
  return paths.sort(naturalSort);
}

export class ContinuousCinematicHero {
  constructor() {
    this.heroSection = document.getElementById('hero');
    this.heroSticky = document.querySelector('.hero__sticky');
    this.heroText = document.querySelector('.hero__text-col');
    this.heroVisual = document.querySelector('.hero__visual-col');
    this.scrollHint = document.getElementById('hero-scroll-hint');
    this.canvas = document.getElementById('hero-cinematic-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.hudBadge = document.getElementById('hero-hud-badge');
    this.hudIndex = document.getElementById('hero-hud-index');
    this.hudTitle = document.getElementById('hero-hud-title');
    this.hudSub = document.getElementById('hero-hud-sub');
    this.hudProgress = document.getElementById('hero-hud-progress');

    // Stage configuration matching exact frame counts
    this.scenes = [
      {
        id: 'screen_2',
        name: 'GAMING RIG',
        action: 'PORTAL ARRIVAL',
        badgeIndex: '01',
        startProgress: 0.08,
        endProgress: 0.25,
        frameCount: 40,
        framePaths: generateFramePaths('screen_2', 40),
        images: [],
      },
      {
        id: 'screen_3',
        name: 'GAMING RIG',
        action: 'PORTAL EXIT',
        badgeIndex: '02',
        startProgress: 0.25,
        endProgress: 0.40,
        frameCount: 40,
        framePaths: generateFramePaths('screen_3', 40),
        images: [],
      },
      {
        id: 'screen_4',
        name: 'ULTRABOOK',
        action: 'PORTAL ARRIVAL',
        badgeIndex: '03',
        startProgress: 0.40,
        endProgress: 0.57,
        frameCount: 40,
        framePaths: generateFramePaths('screen_4', 40),
        images: [],
      },
      {
        id: 'screen_5',
        name: 'ULTRABOOK',
        action: 'PORTAL EXIT',
        badgeIndex: '04',
        startProgress: 0.57,
        endProgress: 0.72,
        frameCount: 26,
        framePaths: generateFramePaths('screen_5', 26),
        images: [],
      },
      {
        id: 'screen_6',
        name: 'CURVED MONITOR',
        action: 'PORTAL ARRIVAL',
        badgeIndex: '05',
        startProgress: 0.72,
        endProgress: 0.94,
        frameCount: 26,
        framePaths: generateFramePaths('screen_6', 26),
        images: [],
      },
    ];

    this.lastDrawnScene = null;
    this.lastDrawnFrameIndex = -1;
    this.scrollTriggerInstance = null;
    this.isReady = false;
  }

  async init() {
    if (!this.heroSection || !this.canvas || !this.ctx) return;

    this._setupCanvasResolution();
    window.addEventListener('resize', () => this._setupCanvasResolution(), { passive: true });

    // Preload stage 1 immediately so first interactive frames render instantly
    await this._preloadScene(this.scenes[0]);

    // Draw frame 0 to initialize canvas
    if (this.scenes[0].images[0] && this.scenes[0].images[0].complete) {
      this._drawFrame(this.scenes[0].images[0]);
    }

    // Set up single continuous GSAP ScrollTrigger
    this._initScrollTrigger();

    // Progressively prefetch subsequent scenes in background
    this._preloadRemainingScenes();

    this.isReady = true;
  }

  _setupCanvasResolution() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayW = width;
    this.displayH = height;

    // Redraw current frame if available
    if (this.currentImgToDraw) {
      this._drawFrame(this.currentImgToDraw);
    }
  }

  _preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Frame failed to load: ${src}`);
        resolve(img);
      };
    });
  }

  async _preloadScene(scene) {
    if (scene.images.length === scene.frameCount) return;
    const promises = scene.framePaths.map((path) => this._preloadImage(path));
    scene.images = await Promise.all(promises);
  }

  _preloadRemainingScenes() {
    // Load remaining scenes progressively with idle callback or gentle timeout
    const loadNext = async (index) => {
      if (index >= this.scenes.length) return;
      await this._preloadScene(this.scenes[index]);
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadNext(index + 1));
      } else {
        setTimeout(() => loadNext(index + 1), 50);
      }
    };

    setTimeout(() => loadNext(1), 100);
  }

  _drawFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    this.currentImgToDraw = img;

    const ctx = this.ctx;
    const cw = this.displayW;
    const ch = this.displayH;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover logic with subtle vertical centering to preserve framing
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, nx, ny, nw, nh);
  }

  _initScrollTrigger() {
    const totalScrollDistance = window.innerHeight * 5.8; // ~580vh continuous scroll distance

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.heroSection,
      start: 'top top',
      end: `+=${totalScrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.1, // Smooth scrub with immediate response to scroll stops
      onUpdate: (self) => this._onScrollUpdate(self.progress),
    });

    // Provide smooth navigation to the portal sequence
    window.addEventListener('scrollToPortalSequence', () => {
      if (this.scrollTriggerInstance) {
        const portalScrollTarget = this.scrollTriggerInstance.start + (totalScrollDistance * 0.082);
        window.scrollTo({
          top: portalScrollTarget,
          behavior: 'smooth',
        });
      }
    });
  }

  _onScrollUpdate(progress) {
    // 1. Text & Initial Hero Visual Transition (0% to 8%)
    // Hero text glides upward, drops opacity, scales down, and vanishes BEFORE 8%
    const textFadeProgress = Math.min(progress / 0.075, 1);
    if (this.heroText) {
      const translateY = -textFadeProgress * 70;
      const opacity = Math.max(0, 1 - textFadeProgress * 1.3);
      const scale = 1 - textFadeProgress * 0.06;
      this.heroText.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      this.heroText.style.opacity = String(opacity);
      this.heroText.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
    }

    if (this.heroVisual) {
      const opacity = Math.max(0, 1 - textFadeProgress * 1.5);
      const scale = 1 - textFadeProgress * 0.08;
      this.heroVisual.style.opacity = String(opacity);
      this.heroVisual.style.transform = `scale(${scale})`;
      this.heroVisual.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
    }

    if (this.scrollHint) {
      const opacity = Math.max(0, 1 - textFadeProgress * 2.5);
      this.scrollHint.style.opacity = String(opacity);
    }

    // 2. Cinematic Canvas Fade In & Out
    // Canvas becomes fully visible as initial hero setup fades out
    if (this.canvas) {
      let canvasOpacity = 1;
      if (progress < 0.06) {
        canvasOpacity = Math.max(0, (progress - 0.01) / 0.05);
      } else if (progress > 0.94) {
        canvasOpacity = Math.max(0, (1 - progress) / 0.06);
      }
      this.canvas.style.opacity = String(canvasOpacity);
    }

    // 3. Determine Active Cinematic Scene
    let activeScene = null;
    let sceneProgress = 0;

    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i];
      if (progress >= scene.startProgress && progress <= scene.endProgress) {
        activeScene = scene;
        sceneProgress = (progress - scene.startProgress) / (scene.endProgress - scene.startProgress);
        break;
      }
    }

    // If before first scene starts (during intro)
    if (progress < this.scenes[0].startProgress) {
      activeScene = this.scenes[0];
      sceneProgress = 0;
    }

    // If after last scene ends (during unpin finale)
    if (progress > this.scenes[this.scenes.length - 1].endProgress) {
      activeScene = this.scenes[this.scenes.length - 1];
      sceneProgress = 1;
    }

    if (!activeScene) return;

    // 4. Calculate Frame Index with Clamping
    const totalFrames = activeScene.frameCount;
    let frameIndex = Math.floor(sceneProgress * (totalFrames - 1));
    frameIndex = Math.max(0, Math.min(totalFrames - 1, frameIndex));

    // Draw only if scene or frame has changed
    if (activeScene !== this.lastDrawnScene || frameIndex !== this.lastDrawnFrameIndex) {
      this.lastDrawnScene = activeScene;
      this.lastDrawnFrameIndex = frameIndex;

      const targetImg = activeScene.images[frameIndex];
      if (targetImg && targetImg.complete) {
        this._drawFrame(targetImg);
      } else if (targetImg) {
        targetImg.onload = () => this._drawFrame(targetImg);
      }
    }

    // 5. Update HUD Badge & Progress Bar
    if (this.hudBadge) {
      const isCinematicActive = progress >= 0.06 && progress <= 0.95;
      this.hudBadge.classList.toggle('is-visible', isCinematicActive);

      if (isCinematicActive) {
        if (this.hudIndex) this.hudIndex.textContent = activeScene.badgeIndex;
        if (this.hudTitle) this.hudTitle.textContent = activeScene.name;
        if (this.hudSub) this.hudSub.textContent = activeScene.action;
        if (this.hudProgress) {
          const totalCinematicProgress = Math.max(0, Math.min(1, (progress - 0.08) / (0.94 - 0.08)));
          this.hudProgress.style.transform = `scaleX(${totalCinematicProgress})`;
        }
      }
    }
  }

  destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
  }
}
