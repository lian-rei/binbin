export class SpriteAnimation {
  constructor({ image, frameWidth, frameHeight, frameCount, fps = 12, loop = true, sourceX = 0, sourceY = 0, sourceWidth = frameWidth, sourceHeight = frameHeight }) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.fps = fps;
    this.loop = loop;
    this.frameDuration = 1 / fps;
    this.elapsed = 0;
    this.currentFrame = 0;
    this.finished = false;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.sourceWidth = sourceWidth;
    this.sourceHeight = sourceHeight;
  }

  reset() {
    this.elapsed = 0;
    this.currentFrame = 0;
    this.finished = false;
  }

  update(dt) {
    if (this.finished) {
      return;
    }

    this.elapsed += dt;
    const frameStep = this.frameDuration;

    while (this.elapsed >= frameStep) {
      this.elapsed -= frameStep;

      if (this.currentFrame < this.frameCount - 1) {
        this.currentFrame += 1;
      } else if (this.loop) {
        this.currentFrame = 0;
      } else {
        this.finished = true;
        this.currentFrame = this.frameCount - 1;
        return;
      }
    }
  }

  draw(context, x, y, options = {}) {
    const {
      flipX = false,
      scale = 1,
      alpha = 1,
      sourceX = this.sourceX,
      sourceY = this.sourceY,
      sourceWidth = this.sourceWidth,
      sourceHeight = this.sourceHeight,
    } = options;

    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;

    context.save();
    context.globalAlpha = alpha;
    context.translate(x + drawWidth / 2, y + drawHeight / 2);
    if (flipX) {
      context.scale(-1, 1);
    }
    context.translate(-drawWidth / 2, -drawHeight / 2);

    const sx = this.currentFrame * this.frameWidth + sourceX;
    context.imageSmoothingEnabled = false;
    context.drawImage(this.image, sx, sourceY, sourceWidth, sourceHeight, 0, 0, drawWidth, drawHeight);
    context.restore();
  }
}

export class AnimationController {
  constructor() {
    this.animations = new Map();
    this.currentKey = null;
    this.currentAnimation = null;
  }

  add(name, animation) {
    this.animations.set(name, animation);
  }

  play(name, { force = false } = {}) {
    if (this.currentKey === name && !force) {
      return;
    }

    const animation = this.animations.get(name);
    if (!animation) {
      return;
    }

    if (this.currentAnimation && name !== this.currentKey) {
      this.currentAnimation.reset();
    }

    this.currentKey = name;
    this.currentAnimation = animation;
    this.currentAnimation.reset();
  }

  update(dt) {
    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
  }

  draw(context, x, y, facing = 1, options = {}) {
    if (!this.currentAnimation) {
      return;
    }

    this.currentAnimation.draw(context, x, y, {
      flipX: facing > 0,
      scale: options.scale ?? 0.5,
      sourceWidth: options.sourceWidth ?? this.currentAnimation.sourceWidth,
      sourceHeight: options.sourceHeight ?? this.currentAnimation.sourceHeight,
      sourceX: options.sourceX ?? this.currentAnimation.sourceX,
      sourceY: options.sourceY ?? this.currentAnimation.sourceY,
    });
  }
}
