import { InputManager } from "./input.js";
import { Player } from "./player.js";
import { rectsIntersect } from "./physics.js";
import { COLLECTIBLE_VALUES, createLevel } from "./level.js";
import { loadFoodSpriteMap, loadPlayerSpriteMap } from "./assets.js";
import { ParallaxBackground } from "./background.js";

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const foodValue = document.getElementById("foodValue");

const input = new InputManager();
input.bind();

const level = createLevel(Date.now());
const world = {
  width: canvas.width,
  height: canvas.height,
  lastTime: 0,
  player: null,
  playerSpriteMap: null,
  foodSpriteMap: null,
  collectibles: [],
  score: 0,
  collectedCount: 0,
  camera: { x: 0, y: 0 },
  level,
  background: null,
  ready: false,
};

world.player = new Player(level.startX, level.startY);
world.collectibles = level.collectibles.map((item) => ({ ...item, collected: false }));
window.__binbinLevel = world.level;

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
  const targetX = clamp(playerCenterX - visibleWidth / 2, 0, Math.max(0, world.level.width - visibleWidth));
  const targetY = playerCenterY - 180;

  world.camera.x += (targetX - world.camera.x) * 0.12;
  world.camera.x = clamp(world.camera.x, 0, Math.max(0, world.level.width - visibleWidth));

  world.camera.y += (targetY - world.camera.y) * 0.09;
  world.camera.y = Math.max(world.camera.y, 0);
}

function resetPlayer() {
  if (!world.player) {
    return;
  }

  world.player.reset();
  const visibleWidth = canvas.width / 1.55;
  const playerCenterX = world.player.x + world.player.width / 2;
  world.camera.x = clamp(playerCenterX - visibleWidth / 2, 0, Math.max(0, world.level.width - visibleWidth));
  world.camera.y = 0;
}

function regenerateLevel() {
  const seed = Date.now() + Math.floor(Math.random() * 1000000);
  const nextLevel = createLevel(seed);
  world.level = nextLevel;
  window.__binbinLevel = world.level;
  world.player = new Player(nextLevel.startX, nextLevel.startY);

  if (world.playerSpriteMap) {
    world.player.loadAnimations(world.playerSpriteMap);
  }

  world.collectibles = nextLevel.collectibles.map((item) => ({ ...item, collected: false }));
  world.score = 0;
  world.collectedCount = 0;
  updateHud();
  resetPlayer();
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
    regenerateLevel();
    return;
  }

  world.player.update(deltaTime, input, world.level.platforms);
  collectFood();
  updateCamera();
}

function drawPlatformSilhouette(platform) {
  if (!platform.silhouette) {
    return;
  }

  if (platform.variant === "ground") {
    context.fillStyle = "#050505";
    context.fillRect(platform.silhouette.x, platform.silhouette.y, platform.silhouette.width, platform.silhouette.height);
    return;
  }
}

function drawPlatforms() {
  for (const building of world.level.buildings) {
    if (!building.silhouette) {
      continue;
    }

    const floorY = world.level.ground.y;
    const highestRoofY = Math.min(...building.platforms.filter((p) => p.variant === "roof").map((p) => p.y));
    const silhouetteY = highestRoofY + 18;
    const silhouetteHeight = Math.max(0, floorY - silhouetteY + building.silhouette.height);
    context.fillStyle = "#101847";
    context.fillRect(
      building.silhouette.x,
      silhouetteY,
      building.silhouette.width,
      silhouetteHeight
    );
  }

  for (const platform of world.level.platforms) {
    if (platform.variant === "ground") {
      context.fillStyle = "#121212";
      context.fillRect(platform.x, platform.y, platform.width, platform.height);
      continue;
    }

    if (platform.variant === "roof" || platform.variant === "balcony") {
      context.fillStyle = "#110d26";
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
    const sprite = world.foodSpriteMap?.[collectible.type];

    context.save();
    context.translate(x, y);

    if (sprite) {
      const maxDim = Math.max(sprite.width, sprite.height);
      const scale = (collectible.radius * 2.2) / maxDim;
      const drawWidth = sprite.width * scale;
      const drawHeight = sprite.height * scale;
      context.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else if (collectible.type === "rare") {
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
  try {
    const [playerResult, foodResult] = await Promise.allSettled([loadPlayerSpriteMap(), loadFoodSpriteMap()]);
    world.playerSpriteMap = playerResult.status === "fulfilled" ? playerResult.value : {};
    world.foodSpriteMap = foodResult.status === "fulfilled" ? foodResult.value : {};

    if (world.player && typeof world.player.loadAnimations === "function") {
      world.player.loadAnimations(world.playerSpriteMap);
    }

    world.background = new ParallaxBackground({ cityName: "city 1", canvasWidth: canvas.width, canvasHeight: canvas.height });
    await world.background.load();
  } catch (error) {
    console.warn("Game initialization failed, falling back to minimal startup:", error);
    world.background = new ParallaxBackground({ cityName: "city 1", canvasWidth: canvas.width, canvasHeight: canvas.height });
    world.background.ready = true;
    world.background.layers = [];
  }

  world.ready = true;
  updateHud();
  requestAnimationFrame(gameLoop);
}

initializeGame();
