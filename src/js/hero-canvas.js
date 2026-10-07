/**
 * Scroll-driven frame sequence renderer for hero PC assembly animation.
 * Uses all frames with smooth interpolation — no autoplay.
 */

const FRAME_COUNT = 40;
const FRAME_BASE = '/comp/ezgif-frame-';

function framePath(index) {
  return `${FRAME_BASE}${String(index + 1).padStart(3, '0')}.jpg`;
}

export class FrameSequence {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.frames = new Array(FRAME_COUNT).fill(null);
    this.loadedCount = 0;
    this.progress = 0;
    this.onLoadProgress = options.onLoadProgress || (() => {});
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this._resizeObserver = null;
  }

  async init() {
    this._setupResize();
    await this._loadFramesProgressive();
    this.render(this.progress);
  }

  _setupResize() {
    const wrap = this.canvas.parentElement;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      this.canvas.width = rect.width * this.dpr;
      this.canvas.height = rect.height * this.dpr;
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.render(this.progress);
    };

    resize();
    this._resizeObserver = new ResizeObserver(resize);
    this._resizeObserver.observe(wrap);
    window.addEventListener('resize', resize);
  }

  _loadImage(index) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!this.naturalWidth) {
          this.naturalWidth = img.naturalWidth;
          this.naturalHeight = img.naturalHeight;
        }
        this.frames[index] = img;
        this.loadedCount++;
        this.onLoadProgress(this.loadedCount / FRAME_COUNT);
        resolve(img);
      };
      img.onerror = reject;
      img.src = framePath(index);
    });
  }

  async _loadFramesProgressive() {
    // Load first frame immediately for initial render
    await this._loadImage(0);

    // Load remaining frames in batches
    const batchSize = 4;
    for (let i = 1; i < FRAME_COUNT; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, FRAME_COUNT); j++) {
        batch.push(this._loadImage(j));
      }
      await Promise.all(batch);
    }
  }

  setProgress(value) {
    this.progress = Math.max(0, Math.min(1, value));
    this.render(this.progress);
  }

  render(progress) {
    const ctx = this.ctx;
    const wrap = this.canvas.parentElement;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    if (!w || !h) return;

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    const floatIndex = progress * (FRAME_COUNT - 1);
    const indexA = Math.floor(floatIndex);
    const indexB = Math.min(indexA + 1, FRAME_COUNT - 1);
    const blend = floatIndex - indexA;

    const imgA = this.frames[indexA];
    const imgB = this.frames[indexB];

    if (!imgA) return;

    const drawFrame = (img, alpha = 1) => {
      if (!img || !img.complete) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = w / h;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = h;
        drawW = h * imgRatio;
        drawX = (w - drawW) / 2;
        drawY = 0;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        drawX = 0;
        drawY = (h - drawH) / 2;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.globalAlpha = 1;
    };

    drawFrame(imgA, 1 - blend);
    if (blend > 0.001 && imgB) {
      drawFrame(imgB, blend);
    }
  }

  getLastFrame() {
    return this.frames[FRAME_COUNT - 1];
  }

  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }
}
