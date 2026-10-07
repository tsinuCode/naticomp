/**
 * ScrollFrameAnimation
 * High-performance, scroll-scrubbed frame sequence renderer for HTML5 Canvas.
 * Supports DPR-aware scaling, progressive batch loading, and aspect-fill rendering.
 */

export class ScrollFrameAnimation {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Object} options
   * @param {number} options.frameCount - Total number of frames in sequence
   * @param {function(number): string} options.getFramePath - Given index (0..frameCount-1), returns URL
   * @param {function(number): void} [options.onLoadProgress] - Progress callback (0..1)
   * @param {boolean} [options.blend=true] - Blend between adjacent frames for cinematic smoothness
   */
  constructor(canvas, options = {}) {
    if (!canvas) throw new Error('Canvas element is required for ScrollFrameAnimation');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.frameCount = options.frameCount;
    this.getFramePath = options.getFramePath;
    this.onLoadProgress = options.onLoadProgress || (() => {});
    this.blend = options.blend !== false;

    this.frames = new Array(this.frameCount).fill(null);
    this.loadedCount = 0;
    this.progress = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this._resizeObserver = null;
    this._isDestroyed = false;
  }

  async init() {
    this._setupResize();
    // Load frame 0 immediately to ensure first frame is painted without delay
    await this._loadImage(0);
    this.render(this.progress);
    // Asynchronously load remaining frames
    this._loadRemainingFrames();
  }

  _setupResize() {
    const parent = this.canvas.parentElement;
    const resize = () => {
      if (this._isDestroyed || !parent) return;
      const rect = parent.getBoundingClientRect();
      const w = Math.max(rect.width, window.innerWidth);
      const h = Math.max(rect.height, window.innerHeight);

      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.render(this.progress);
    };

    resize();
    this._resizeObserver = new ResizeObserver(resize);
    this._resizeObserver.observe(parent);
    window.addEventListener('resize', resize, { passive: true });
    this._handleWindowResize = resize;
  }

  _loadImage(index) {
    if (this.frames[index]) return Promise.resolve(this.frames[index]);

    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!this.naturalWidth && img.naturalWidth) {
          this.naturalWidth = img.naturalWidth;
          this.naturalHeight = img.naturalHeight;
        }
        this.frames[index] = img;
        this.loadedCount++;
        this.onLoadProgress(this.loadedCount / this.frameCount);
        // If current progress maps to this frame, re-render immediately
        const currentIdx = Math.round(this.progress * (this.frameCount - 1));
        if (currentIdx === index) {
          this.render(this.progress);
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[ScrollFrameAnimation] Failed to load frame ${index}: ${img.src}`);
        resolve(null);
      };
      img.src = this.getFramePath(index);
    });
  }

  async _loadRemainingFrames() {
    const batchSize = 4;
    for (let i = 1; i < this.frameCount; i += batchSize) {
      if (this._isDestroyed) break;
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, this.frameCount); j++) {
        batch.push(this._loadImage(j));
      }
      await Promise.all(batch);
    }
  }

  setProgress(val) {
    const clamped = Math.max(0, Math.min(1, val));
    if (Math.abs(clamped - this.progress) > 0.0001) {
      this.progress = clamped;
      this.render(this.progress);
    }
  }

  render(progress) {
    const ctx = this.ctx;
    const parent = this.canvas.parentElement;
    if (!parent || !ctx) return;

    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    if (!w || !h) return;

    // Fill background deep black/obsidian
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    const floatIndex = progress * (this.frameCount - 1);
    const indexA = Math.floor(floatIndex);
    const indexB = Math.min(indexA + 1, this.frameCount - 1);
    const blend = floatIndex - indexA;

    // Find nearest loaded frame if indexA isn't loaded yet
    let imgA = this.frames[indexA];
    if (!imgA) {
      for (let i = indexA; i >= 0; i--) {
        if (this.frames[i]) { imgA = this.frames[i]; break; }
      }
      if (!imgA) {
        for (let i = indexA; i < this.frameCount; i++) {
          if (this.frames[i]) { imgA = this.frames[i]; break; }
        }
      }
    }

    if (!imgA) return;

    const imgB = this.blend ? this.frames[indexB] : null;

    const drawCover = (img, alpha = 1) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const imgRatio = nw / nh;
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

    if (this.blend && imgB && imgB !== imgA && blend > 0.01) {
      drawCover(imgA, 1 - blend);
      drawCover(imgB, blend);
    } else {
      drawCover(imgA, 1);
    }
  }

  destroy() {
    this._isDestroyed = true;
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    if (this._handleWindowResize) {
      window.removeEventListener('resize', this._handleWindowResize);
    }
  }
}
