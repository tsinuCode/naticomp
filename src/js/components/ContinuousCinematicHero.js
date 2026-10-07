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
    this.setupCard = document.querySelector('.hero__setup-card');
    this.ambientGlow = document.querySelector('.hero__ambient-glow');
    this.scrollHint = document.getElementById('hero-scroll-hint');
    this.canvas = document.getElementById('hero-cinematic-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: false }) : null;

    this.hudBadge = document.getElementById('hero-hud-badge');
    this.hudIndex = document.getElementById('hero-hud-index');
    this.hudTitle = document.getElementById('hero-hud-title');
    this.hudSub = document.getElementById('hero-hud-sub');
    this.hudProgress = document.getElementById('hero-hud-progress');

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        images: new Array(40).fill(null),
        loadedCount: 0,
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
        images: new Array(40).fill(null),
        loadedCount: 0,
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
        images: new Array(40).fill(null),
        loadedCount: 0,
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
        images: new Array(26).fill(null),
        loadedCount: 0,
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
        images: new Array(26).fill(null),
        loadedCount: 0,
      },
    ];

    this.currentProgress = 0;
    this.lastRenderedProgress = -1;
    this.scrollTriggerInstance = null;
    this.isReady = false;
    this.rafPending = false;
    this.displayW = window.innerWidth;
    this.displayH = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }

  async init() {
    if (!this.heroSection || !this.canvas || !this.ctx) return;

    this._setupCanvasResolution();
    window.addEventListener('resize', () => {
      this._setupCanvasResolution();
      this._requestRender();
    }, { passive: true });

    // 1. Entrance animation & mouse parallax on hero intro
    this._initEntrance();
    this._initMouseParallax();

    // 2. Set up single continuous GSAP ScrollTrigger
    this._initScrollTrigger();

    // 3. Immediately preload frame 0 of all scenes so keyframes render instantly
    await this._preloadInitialKeyframes();

    // 4. Initial paint of first scene frame 0
    this._requestRender();

    // 5. Proactively load all remaining frames in background
    this._startProactiveLoader();

    this.isReady = true;
  }

  _initEntrance() {
    if (this.prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
    tl.fromTo(
      '.hero__location-tag',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.1 }
    )
    .fromTo(
      '.hero__title-heading',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9 },
      '-=0.4'
    )
    .fromTo(
      '.hero__sub-text',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    )
    .fromTo(
      '.hero__cta-group',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7 },
      '-=0.5'
    )
    .fromTo(
      this.heroVisual,
      { opacity: 0, scale: 0.94, x: 20 },
      { opacity: 1, scale: 1, x: 0, duration: 1.1, ease: 'power2.out' },
      '-=0.8'
    );
  }

  _initMouseParallax() {
    if (!this.setupCard || window.innerWidth < 992 || this.prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const onMouseMove = (e) => {
      if (this.currentProgress > 0.08) return; // Disable when scrolled into portal
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx;
      targetY = (e.clientY - cy) / cy;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const loop = () => {
      if (this.currentProgress <= 0.08 && this.setupCard) {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;
        this.setupCard.style.transform = `perspective(900px) rotateY(${currentX * 5}deg) rotateX(${-currentY * 4}deg) translate3d(${currentX * 12}px, ${currentY * 8}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  _setupCanvasResolution() {
    if (!this.canvas || !this.ctx) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = this.heroSticky || this.heroSection;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const width = Math.max(rect.width || window.innerWidth, 320);
    const height = Math.max(rect.height || window.innerHeight, 320);

    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.displayW = width;
    this.displayH = height;
  }

  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`[ContinuousCinematicHero] Failed to load frame: ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  }

  async _preloadInitialKeyframes() {
    // Load frame 0 of all 5 scenes so each section has its anchor image immediately
    const promises = this.scenes.map(async (scene) => {
      const img = await this._loadImage(scene.framePaths[0]);
      if (img) {
        scene.images[0] = img;
        scene.loadedCount++;
      }
    });

    await Promise.all(promises);
  }

  _startProactiveLoader() {
    // Sequentially prioritize scenes while downloading in batches of 4
    const loadRemainingForScene = async (scene) => {
      const batchSize = 4;
      for (let i = 1; i < scene.frameCount; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, scene.frameCount); j++) {
          if (!scene.images[j]) {
            batch.push(
              this._loadImage(scene.framePaths[j]).then((img) => {
                if (img) {
                  scene.images[j] = img;
                  scene.loadedCount++;
                  // If user is currently looking at this scene, request smooth redraw
                  if (this._isSceneActive(scene)) {
                    this._requestRender();
                  }
                }
              })
            );
          }
        }
        await Promise.all(batch);
      }
    };

    (async () => {
      for (const scene of this.scenes) {
        await loadRemainingForScene(scene);
      }
    })();
  }

  _isSceneActive(scene) {
    return this.currentProgress >= scene.startProgress - 0.05 && this.currentProgress <= scene.endProgress + 0.05;
  }

  _initScrollTrigger() {
    const totalScrollDistance = window.innerHeight * 5.8; // ~580vh continuous scroll distance

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.heroSection,
      start: 'top top',
      end: `+=${totalScrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.1, // Smooth scrub response
      onUpdate: (self) => this._onScrollUpdate(self.progress),
    });

    // Provide smooth navigation to the portal sequence from navbar
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
    this.currentProgress = progress;

    // 1. Hero text & setup card fade out cleanly between 0% and 8%
    const textFadeProgress = Math.min(progress / 0.075, 1);
    if (this.heroText) {
      const translateY = -textFadeProgress * 65;
      const opacity = Math.max(0, 1 - textFadeProgress * 1.3);
      const scale = 1 - textFadeProgress * 0.05;
      this.heroText.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      this.heroText.style.opacity = String(opacity);
      this.heroText.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
      this.heroText.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    }

    if (this.heroVisual) {
      const opacity = Math.max(0, 1 - textFadeProgress * 1.4);
      const scale = 1 - textFadeProgress * 0.08;
      this.heroVisual.style.opacity = String(opacity);
      this.heroVisual.style.transform = `scale(${scale})`;
      this.heroVisual.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
      this.heroVisual.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    }

    if (this.scrollHint) {
      const opacity = Math.max(0, 1 - textFadeProgress * 2.2);
      this.scrollHint.style.opacity = String(opacity);
    }

    // 2. Cinematic Canvas Fade In & Out
    if (this.canvas) {
      let canvasOpacity = 1;
      if (progress < 0.06) {
        canvasOpacity = Math.max(0, (progress - 0.01) / 0.05);
      } else if (progress > 0.94) {
        canvasOpacity = Math.max(0, (1 - progress) / 0.06);
      }
      this.canvas.style.opacity = String(canvasOpacity);
      this.canvas.style.visibility = canvasOpacity <= 0 ? 'hidden' : 'visible';
    }

    // 3. Request animation frame for canvas render
    this._requestRender();
  }

  _requestRender() {
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this._renderCanvas();
    });
  }

  _renderCanvas() {
    if (!this.ctx || !this.canvas) return;

    const progress = this.currentProgress;

    // Determine Active Cinematic Scene
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

    if (progress < this.scenes[0].startProgress) {
      activeScene = this.scenes[0];
      sceneProgress = 0;
    } else if (progress > this.scenes[this.scenes.length - 1].endProgress) {
      activeScene = this.scenes[this.scenes.length - 1];
      sceneProgress = 1;
    }

    if (!activeScene) return;

    // Update HUD Badge & Progress Bar
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

    // Draw active scene frames with nearest-frame fallback & cross-blend
    this._drawScene(activeScene, sceneProgress);
  }

  _drawScene(scene, progress) {
    const ctx = this.ctx;
    const cw = this.displayW;
    const ch = this.displayH;
    const totalFrames = scene.frameCount;

    // Background fill to ensure no seams or transparent gaps
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, cw, ch);

    const floatIndex = progress * (totalFrames - 1);
    const indexA = Math.floor(floatIndex);
    const indexB = Math.min(indexA + 1, totalFrames - 1);
    const blend = floatIndex - indexA;

    // Find nearest loaded frame for indexA
    let imgA = scene.images[indexA];
    if (!imgA || !imgA.complete || imgA.naturalWidth === 0) {
      for (let i = indexA; i >= 0; i--) {
        if (scene.images[i] && scene.images[i].complete && scene.images[i].naturalWidth > 0) {
          imgA = scene.images[i];
          break;
        }
      }
      if (!imgA) {
        for (let i = indexA; i < totalFrames; i++) {
          if (scene.images[i] && scene.images[i].complete && scene.images[i].naturalWidth > 0) {
            imgA = scene.images[i];
            break;
          }
        }
      }
    }

    // Fallback: If current scene has no frames yet, use last frame of previous scene or first frame of next scene
    if (!imgA) {
      for (const otherScene of this.scenes) {
        for (let i = 0; i < otherScene.frameCount; i++) {
          if (otherScene.images[i] && otherScene.images[i].complete && otherScene.images[i].naturalWidth > 0) {
            imgA = otherScene.images[i];
            break;
          }
        }
        if (imgA) break;
      }
    }

    if (!imgA) return;

    const imgB = scene.images[indexB];
    const canBlend = imgB && imgB.complete && imgB.naturalWidth > 0 && imgB !== imgA && blend > 0.02;

    const drawCover = (img, alpha = 1) => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const nx = (cw - nw) / 2;
      const ny = (ch - nh) / 2;

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, nx, ny, nw, nh);
      ctx.globalAlpha = 1;
    };

    if (canBlend) {
      drawCover(imgA, 1 - blend);
      drawCover(imgB, blend);
    } else {
      drawCover(imgA, 1);
    }
  }

  destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
  }
}
