/**
 * Subtle ambient particle field for gaming/CTA sections.
 */

export class ParticleField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.count = options.count || 40;
    this.color = options.color || 'rgba(14, 165, 233, 0.4)';
    this.maxSpeed = options.maxSpeed || 0.15;
    this._raf = null;
    this._visible = false;
  }

  init() {
    if (this.reducedMotion) return;

    this._resize();
    this._createParticles();

    const observer = new IntersectionObserver(
      ([entry]) => {
        this._visible = entry.isIntersecting;
        if (this._visible) this.start();
        else this.stop();
      },
      { threshold: 0.1 }
    );
    observer.observe(this.canvas.parentElement || this.canvas);
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  _createParticles() {
    this.particles = Array.from({ length: this.count }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.maxSpeed,
      vy: (Math.random() - 0.5) * this.maxSpeed,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }

  start() {
    if (this.running || this.reducedMotion) return;
    this.running = true;
    this._tick();
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  _tick() {
    if (!this.running) return;

    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('0.4', String(p.opacity));
      ctx.fill();
    });

    this._raf = requestAnimationFrame(() => this._tick());
  }
}
