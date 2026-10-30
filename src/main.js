import { InputManager } from "./input.js";
import { Player } from "./player.js";
import { rectsIntersect } from "./physics.js";
import { COLLECTIBLE_VALUES, createLevel } from "./level.js";
import { loadPlayerSpriteMap } from "./assets.js";
import { ParallaxBackground } from "./background.js";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const foodValue = document.getElementById("foodValue");

const input = new InputManager();
input.bind();

const level = createLevel();
const world = {
  width: canvas.width,
  height: canvas.height,
  lastTime: 0,
  player: new Player(level.startX, level.startY),
  collectibles: level.collectibles.map((item) => ({ ...item, collected: false })),
  score: 0,
  collectedCount: 0,
  camera: { x: 0, y: 0 },
  level,
  background: null,
  ready: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHud() {
  scoreValue.textContent = String(world.score);
  foodValue.textContent = `${world.collectedCount} / ${world.collectibles.length}`;
}

function updateCamera() {
  const worldZoom = 1.55;
  const visibleWidth = canvas.width / worldZoom;
  const playerCenterX = world.player.x + world.player.width / 2;
  const playerCenterY = world.player.y + world.player.height / 2;
  const targetX = clamp(playerCenterX - visibleWidth / 2, 0, Math.max(0, level.width - visibleWidth));
  const targetY = playerCenterY - 180;

  world.camera.x += (targetX - world.camera.x) * 0.12;
  world.camera.x = clamp(world.camera.x, 0, Math.max(0, level.width - visibleWidth));

  world.camera.y += (targetY - world.camera.y) * 0.09;
  world.camera.y = Math.max(world.camera.y, 0);
}

function resetPlayer() {
  world.player.reset();
  const visibleWidth = canvas.width / 1.55;
  const playerCenterX = world.player.x + world.player.width / 2;
  world.camera.x = clamp(playerCenterX - visibleWidth / 2, 0, Math.max(0, level.width - visibleWidth));
  world.camera.y = 0;
}

function collectFood() {
  const playerBox = {
    x: world.player.x,
    y: world.player.y,
    width: world.player.width,
    height: world.player.height,
  };

  for (const collectible of world.collectibles) {
    if (collectible.collected) {
      continue;
    }

    const itemBox = {
      x: collectible.x - collectible.radius,
      y: collectible.y - collectible.radius,
      width: collectible.radius * 2,
      height: collectible.radius * 2,
    };

    if (rectsIntersect(playerBox, itemBox)) {
      collectible.collected = true;
      world.collectedCount += 1;
      world.score += COLLECTIBLE_VALUES[collectible.type] ?? 0;
      updateHud();
    }
  }
}

function update(deltaTime) {
  if (input.consumeResetRequest()) {
    resetPlayer();
  }

  world.player.update(deltaTime, input, level.platforms);
  collectFood();
  updateCamera();
}

function drawPlatformSilhouette(platform) {
  if (!platform.silhouette) {
    return;
  }

  const { silhouette } = platform;

  if (platform.variant === "ground") {
    context.fillStyle = "#050505";
    context.fillRect(silhouette.x, silhouette.y, silhouette.width, silhouette.height);
    return;
  }

  context.fillStyle = platform.variant === "balcony" ? "#0a0d12" : "#090b0d";
  context.fillRect(silhouette.x, silhouette.y, silhouette.width, silhouette.height);
}

function drawPlatforms() {
  for (const platform of level.platforms) {
    drawPlatformSilhouette(platform);

    if (platform.variant === "ground") {
      context.fillStyle = "#000000";
      context.fillRect(platform.x, platform.y, platform.width, platform.height);
      continue;
    }

    if (platform.variant === "roof" || platform.variant === "balcony") {
      context.fillStyle = platform.variant === "roof" ? "#3e4348" : "#4a4d52";
      context.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
  }
}

function drawCollectibles() {
  for (const collectible of world.collectibles) {
    if (collectible.collected) {
      continue;
    }

    const x = collectible.x;
    const y = collectible.y;

    context.save();
    context.translate(x, y);

    if (collectible.type === "rare") {
      context.fillStyle = "#ff9d77";
      context.beginPath();
      context.arc(0, 0, collectible.radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff";
      context.fillRect(-2, -3, 4, 6);
      context.fillRect(-3, -2, 6, 4);
    } else if (collectible.type === "special") {
      context.fillStyle = "#f7c94c";
      context.beginPath();
      context.moveTo(0, -collectible.radius);
      context.lineTo(6, -8);
      context.lineTo(collectible.radius, -4);
      context.lineTo(10, 6);
      context.lineTo(0, 10);
      context.lineTo(-10, 6);
      context.lineTo(-collectible.radius, -4);
      context.lineTo(-6, -8);
      context.closePath();
      context.fill();
    } else {
      context.fillStyle = "#d77e48";
      context.beginPath();
      context.arc(0, 0, collectible.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#4d7d4a";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(-4, -9);
      context.quadraticCurveTo(6, -18, 10, -7);
      context.stroke();
    }

    context.restore();
  }
}

function render() {
  if (!world.ready) {
    return;
  }

  const zoom = 1.55;
  const leftOffset = 0;
  const topOffset = 80;

  context.clearRect(0, 0, world.width, world.height);
  world.background.render(context, world.camera.x);

  context.save();
  context.setTransform(zoom, 0, 0, zoom, -world.camera.x * zoom + leftOffset, -world.camera.y * zoom + topOffset);
  drawPlatforms();
  drawCollectibles();
  world.player.draw(context);
  context.restore();
}

function gameLoop(timestamp) {
  if (!world.lastTime) {
    world.lastTime = timestamp;
  }

  const deltaTime = Math.min((timestamp - world.lastTime) / 1000, 0.033);
  world.lastTime = timestamp;

  update(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}

async function initializeGame() {
  const spriteMap = await loadPlayerSpriteMap();
  world.player.loadAnimations(spriteMap);

  world.background = new ParallaxBackground({ cityName: "city 1", canvasWidth: canvas.width, canvasHeight: canvas.height });
  await world.background.load();
  world.ready = true;
  updateHud();
  requestAnimationFrame(gameLoop);
}

initializeGame();
