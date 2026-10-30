const ASSET_ROOT = "./assets/sprites";

export const PLAYER_ANIMATION_SOURCES = {
  IDLE: `${ASSET_ROOT}/binbin/IDLE.png`,
  WALK: `${ASSET_ROOT}/binbin/WALK.png`,
  RUN: `${ASSET_ROOT}/binbin/RUN.png`,
  JUMP: `${ASSET_ROOT}/binbin/JUMP.png`,
  FALL: `${ASSET_ROOT}/binbin/RUNNING JUMP.png`,
  ATTACK_1: `${ASSET_ROOT}/binbin/ATTACK 1.png`,
  ATTACK_2: `${ASSET_ROOT}/binbin/ATTACK 1.png`,
  SCARE: `${ASSET_ROOT}/binbin/HURT.png`,
  HURT: `${ASSET_ROOT}/binbin/HURT.png`,
  LICK: `${ASSET_ROOT}/binbin/IDLE.png`,
  SLEEP: `${ASSET_ROOT}/binbin/IDLE.png`,
  WALL_SLIDE: `${ASSET_ROOT}/binbin/JUMP.png`,
  CLIMB: `${ASSET_ROOT}/binbin/WALK.png`,
  EAT: `${ASSET_ROOT}/binbin/IDLE.png`,
  DEATH: `${ASSET_ROOT}/binbin/HURT.png`,
};

export function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load asset: ${path}`));
    image.src = path;
  });
}

export async function loadPlayerSpriteMap() {
  const spriteMap = {};

  for (const [name, path] of Object.entries(PLAYER_ANIMATION_SOURCES)) {
    try {
      spriteMap[name] = await loadImage(path);
    } catch (error) {
      console.warn(`Missing player sprite for ${name}:`, error.message);
    }
  }

  return spriteMap;
}
