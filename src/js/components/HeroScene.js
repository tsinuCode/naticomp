/**
 * HeroScene
 * Coordinates luxury static/interactive hero visual, ambient glow, subtle mouse parallax,
 * and seamless scroll-out transition into the digital portal sequence.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class HeroScene {
  constructor(sectionSelector = '#hero') {
    this.section = document.querySelector(sectionSelector);
    this.textWrap = document.querySelector('.hero__text-col');
    this.visualWrap = document.querySelector('.hero__visual-col');
    this.visualImg = document.querySelector('.hero__setup-img');
    this.glowLayer = document.querySelector('.hero__ambient-glow');
    this.particleCanvas = document.getElementById('hero-particles');
    this.scrollHint = document.getElementById('hero-scroll-hint');
    this._rafId = null;
  }

  init() {
    if (!this.section) return;

    this._initParticles();
    this._initMouseParallax();
    this._initScrollTransition();
    this._initEntrance();
  }

  _initEntrance() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

    tl.fromTo(
      '.hero__brand-tag',
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
    )
    .fromTo(
      '.hero__title-heading',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1 },
      '-=0.5'
    )
    .fromTo(
      '.hero__sub-text',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9 },
      '-=0.7'
    )
    .fromTo(
      '.hero__cta-group',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.6'
    )
    .fromTo(
      this.visualWrap,
      { opacity: 0, scale: 0.95, x: 20 },
      { opacity: 1, scale: 1, x: 0, duration: 1.4, ease: 'power2.out' },
      '-=1.2'
    );
  }

  _initMouseParallax() {
    if (!this.visualWrap || window.matchMedia('(max-width: 992px)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx; // -1 to 1
      targetY = (e.clientY - cy) / cy; // -1 to 1
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (this.visualImg) {
        this.visualImg.style.transform = `
          perspective(1000px)
          rotateY(${currentX * 4}deg)
          rotateX(${-currentY * 3}deg)
          translate3d(${currentX * 10}px, ${currentY * 8}px, 0)
        `;
      }

      if (this.glowLayer) {
        this.glowLayer.style.transform = `translate(${currentX * 25}px, ${currentY * 20}px)`;
      }

      this._rafId = requestAnimationFrame(updateParallax);
    };

    this._rafId = requestAnimationFrame(updateParallax);
  }

  _initScrollTransition() {
    // When scrolling down from the hero, smoothly fade out the hero content and scale gently into darkness
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    if (this.textWrap) {
      scrollTl.to(this.textWrap, {
        opacity: 0,
        y: -40,
        scale: 0.94,
        ease: 'none',
      }, 0);
    }

    if (this.visualWrap) {
      scrollTl.to(this.visualWrap, {
        opacity: 0,
        scale: 0.92,
        y: -20,
        ease: 'none',
      }, 0);
    }

    if (this.scrollHint) {
      scrollTl.to(this.scrollHint, {
        opacity: 0,
        ease: 'none',
      }, 0);
    }
  }

  _initParticles() {
    if (!this.particleCanvas) return;
    const canvas = this.particleCanvas;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const onResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(this.section);

    const animate = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (const p of particles) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.02;

          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
          ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }
}
