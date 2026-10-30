import { CONFIG, approach, resolvePlayerMovement } from "./physics.js";
import { SpriteAnimation, AnimationController } from "./animation.js";

export class Player {
  constructor(startX, startY) {
    this.spawnX = startX;
    this.spawnY = startY;
    this.width = 40;
    this.height = 32;
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.facing = 1;
    this.animations = new AnimationController();
    this.spriteScale = 1.25;
    this.animationState = "IDLE";
  }

  loadAnimations(spriteMap) {
    const spriteCanvasWidth = 80;
    const spriteCanvasHeight = 64;
    const spriteVisibleWidth = 32;
    const spriteVisibleHeight = 32;

    const animationConfigs = {
      IDLE: { image: spriteMap.IDLE, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 7, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      WALK: { image: spriteMap.WALK, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 12, fps: 12, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      RUN: { image: spriteMap.RUN, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 15, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      JUMP: { image: spriteMap.JUMP, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 3, fps: 10, loop: false, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      FALL: { image: spriteMap.FALL, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 3, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      ATTACK_1: { image: spriteMap.ATTACK_1, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 12, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      ATTACK_2: { image: spriteMap.ATTACK_2, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 12, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      SCARE: { image: spriteMap.SCARE, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 4, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      HURT: { image: spriteMap.HURT, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 4, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      LICK: { image: spriteMap.LICK, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      SLEEP: { image: spriteMap.SLEEP, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 8, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      WALL_SLIDE: { image: spriteMap.WALL_SLIDE, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 3, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      CLIMB: { image: spriteMap.CLIMB, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 8, fps: 12, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      EAT: { image: spriteMap.EAT, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 7, fps: 10, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
      DEATH: { image: spriteMap.DEATH, frameWidth: spriteCanvasWidth, frameHeight: spriteCanvasHeight, frameCount: 9, fps: 10, loop: false, sourceX: 24, sourceY: 16, sourceWidth: spriteVisibleWidth, sourceHeight: spriteVisibleHeight },
    };

    for (const [name, settings] of Object.entries(animationConfigs)) {
      if (!settings.image) {
        continue;
      }
      this.animations.add(name, new SpriteAnimation(settings));
    }

    this.animations.play("IDLE", { force: true });
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.facing = 1;
    this.animationState = "IDLE";
    this.animations.play("IDLE", { force: true });
  }

  handleInput(dt, input) {
    const moveInput = input.getHorizontalAxis();

    if (moveInput !== 0) {
      this.facing = moveInput > 0 ? 1 : -1;
    }

    const acceleration = this.onGround ? CONFIG.groundAcceleration : CONFIG.airAcceleration;
    const targetSpeed = moveInput * CONFIG.maxMoveSpeed;

    if (moveInput !== 0) {
      this.vx = approach(this.vx, targetSpeed, acceleration * dt);
    } else {
      const friction = this.onGround ? CONFIG.groundFriction : CONFIG.airDrag;
      this.vx = approach(this.vx, 0, friction * dt);
    }

    if (input.consumeJumpPressed()) {
      this.jumpBufferTimer = CONFIG.jumpBufferTime;
    }

    if (this.onGround) {
      this.coyoteTimer = CONFIG.coyoteTime;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    const canJump = this.jumpBufferTimer > 0 && (this.onGround || this.coyoteTimer > 0);

    if (canJump) {
      this.vy = -CONFIG.jumpStrength;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    this.vy += CONFIG.gravity * dt;

    if (!input.isJumpHeld() && this.vy < 0) {
      this.vy += CONFIG.gravity * CONFIG.jumpCutoffMultiplier * dt;
    }

    if (this.vy > CONFIG.maxFallSpeed) {
      this.vy = CONFIG.maxFallSpeed;
    }
  }

  updateAnimationState() {
    const absoluteSpeed = Math.abs(this.vx);
    const currentState = this.onGround
      ? (absoluteSpeed > 180 ? "RUN" : (absoluteSpeed > 10 ? "WALK" : "IDLE"))
      : (this.vy < 0 ? "JUMP" : "FALL");

    if (this.animationState !== currentState) {
      this.animationState = currentState;
      if (this.animations.currentKey !== currentState) {
        this.animations.play(currentState, { force: true });
      }
    }
  }

  update(dt, input, platforms) {
    this.handleInput(dt, input);
    resolvePlayerMovement(this, dt, platforms);
    this.updateAnimationState();
    this.animations.update(dt);
  }

  draw(context) {
    const drawX = this.x - 6;
    const drawY = this.y - 2;

    if (!this.animations.currentAnimation || !this.animations.currentAnimation.image) {
      return;
    }

    this.animations.draw(context, drawX, drawY, this.facing, {
      scale: 1.1,
      sourceX: 24,
      sourceY: 16,
      sourceWidth: 32,
      sourceHeight: 32,
    });
  }
}
