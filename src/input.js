export class InputManager {
  constructor() {
    this.keyStates = new Set();
    this.jumpHeld = false;
    this.jumpPressed = false;
    this.resetRequested = false;
    this.touchAxis = 0;
    this.touchJumpHeld = false;
    this.touchJumpPressed = false;
    this.touchStick = null;
    this.touchStickKnob = null;
    this.touchJumpButton = null;
    this.touchPointerId = null;
  }

  bind() {
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
    this.bindTouchControls();
  }

  bindTouchControls() {
    const stick = document.getElementById("touchStick");
    const knob = document.getElementById("touchStickKnob");
    const jumpButton = document.getElementById("touchJumpButton");

    this.touchStick = stick;
    this.touchStickKnob = knob;
    this.touchJumpButton = jumpButton;

    if (!stick || !knob || !jumpButton) {
      return;
    }

    stick.addEventListener("pointerdown", (event) => {
      this.touchPointerId = event.pointerId;
      stick.setPointerCapture(event.pointerId);
      this.updateTouchStick(event);
    });

    stick.addEventListener("pointermove", (event) => {
      if (this.touchPointerId !== event.pointerId) {
        return;
      }
      this.updateTouchStick(event);
    });

    const releaseTouchStick = (event) => {
      if (event.pointerId !== this.touchPointerId) {
        return;
      }
      this.touchPointerId = null;
      this.touchAxis = 0;
      knob.style.transform = "translate(-50%, -50%)";
    };

    stick.addEventListener("pointerup", releaseTouchStick);
    stick.addEventListener("pointercancel", releaseTouchStick);
    stick.addEventListener("pointerleave", releaseTouchStick);

    jumpButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!this.touchJumpHeld) {
        this.touchJumpHeld = true;
        this.touchJumpPressed = true;
      }
    });

    const releaseJump = () => {
      this.touchJumpHeld = false;
    };

    jumpButton.addEventListener("pointerup", releaseJump);
    jumpButton.addEventListener("pointercancel", releaseJump);
    jumpButton.addEventListener("pointerleave", releaseJump);
  }

  updateTouchStick(event) {
    if (!this.touchStick || !this.touchStickKnob) {
      return;
    }

    const rect = this.touchStick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const clampRadius = rect.width * 0.28;
    const distance = Math.min(Math.hypot(dx, dy), clampRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * distance;
    const clampedY = Math.sin(angle) * distance;

    this.touchAxis = Math.max(-1, Math.min(1, clampedX / clampRadius));
    this.touchStickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  }

  handleKeyDown(event) {
    const code = event.code;
    const isMovementKey = [
      "KeyA",
      "KeyD",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "ArrowUp",
      "Space",
      "KeyR"
    ].includes(code);

    if (isMovementKey) {
      event.preventDefault();
    }

    if (this.keyStates.has(code)) {
      return;
    }

    this.keyStates.add(code);

    if (code === "Space" || code === "KeyW" || code === "ArrowUp") {
      if (!this.jumpHeld) {
        this.jumpHeld = true;
        this.jumpPressed = true;
      }
    }

    if (code === "KeyR") {
      this.resetRequested = true;
    }
  }

  handleKeyUp(event) {
    const code = event.code;
    this.keyStates.delete(code);

    if (code === "Space" || code === "KeyW" || code === "ArrowUp") {
      this.jumpHeld = false;
    }
  }

  getHorizontalAxis() {
    let direction = 0;

    if (this.keyStates.has("KeyA") || this.keyStates.has("ArrowLeft")) {
      direction -= 1;
    }

    if (this.keyStates.has("KeyD") || this.keyStates.has("ArrowRight")) {
      direction += 1;
    }

    return direction + this.touchAxis;
  }

  isJumpHeld() {
    return this.jumpHeld || this.touchJumpHeld;
  }

  consumeJumpPressed() {
    const pressed = this.jumpPressed || this.touchJumpPressed;
    this.jumpPressed = false;
    this.touchJumpPressed = false;
    return pressed;
  }

  consumeResetRequest() {
    const requested = this.resetRequested;
    this.resetRequested = false;
    return requested;
  }
}
