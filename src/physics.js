export const CONFIG = {
  gravity: 1700,
  maxMoveSpeed: 260,
  groundAcceleration: 2200,
  airAcceleration: 1500,
  groundFriction: 2100,
  airDrag: 500,
  jumpStrength: 720,
  jumpCutoffMultiplier: 0.48,
  maxFallSpeed: 980,
  coyoteTime: 0.12,
  jumpBufferTime: 0.12,
};

export function approach(value, target, amount) {
  if (value < target) {
    return Math.min(value + amount, target);
  }

  if (value > target) {
    return Math.max(value - amount, target);
  }

  return target;
}

export function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function resolvePlayerMovement(player, dt, platforms) {
  const previousX = player.x;
  const previousY = player.y;

  player.x += player.vx * dt;

  for (const platform of platforms) {
    if (!rectsIntersect(player, platform)) {
      continue;
    }

    if (player.vx > 0) {
      player.x = platform.x - player.width;
    } else if (player.vx < 0) {
      player.x = platform.x + platform.width;
    }

    player.vx = 0;
  }

  player.y += player.vy * dt;
  player.onGround = false;

  for (const platform of platforms) {
    if (!rectsIntersect(player, platform)) {
      continue;
    }

    const landingTolerance = 6;
    const wasAbovePlatform = previousY + player.height <= platform.y + landingTolerance;
    const wasBelowPlatform = previousY >= platform.y + platform.height - landingTolerance;

    if (player.vy >= 0 && wasAbovePlatform) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.coyoteTimer = CONFIG.coyoteTime;
      continue;
    }

    if (player.vy < 0 && wasBelowPlatform) {
      player.y = platform.y + platform.height;
      player.vy = 0;
      continue;
    }

    if (previousX + player.width <= platform.x + 10 && player.x + player.width > platform.x) {
      player.x = platform.x - player.width;
      player.vx = 0;
    } else if (previousX >= platform.x + platform.width - 10 && player.x < platform.x + platform.width) {
      player.x = platform.x + platform.width;
      player.vx = 0;
    }
  }
}
