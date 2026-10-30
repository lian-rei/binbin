export class InputManager {
  constructor() {
    this.keyStates = new Set();
    this.jumpHeld = false;
    this.jumpPressed = false;
    this.resetRequested = false;
  }

  bind() {
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
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

    return direction;
  }

  isJumpHeld() {
    return this.jumpHeld;
  }

  consumeJumpPressed() {
    const pressed = this.jumpPressed;
    this.jumpPressed = false;
    return pressed;
  }

  consumeResetRequest() {
    const requested = this.resetRequested;
    this.resetRequested = false;
    return requested;
  }
}
