export const COLLECTIBLE_VALUES = {
  snack: 100,
  rare: 200,
  special: 500,
};

export const GRID = {
  tileSize: 32,
  storyHeight: 72,
  platformHeight: 18,
  mapHeight: 540,
  mapWidth: 3600,
  groundY: 430,
};

function mulberry32(seed) {
  let value = seed >>> 0;
  return function () {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createPlatform({ x, y, width, variant, index, maxHeight, maxLength, buildingId }) {
  return {
    x,
    y,
    width,
    height: GRID.platformHeight,
    variant,
    index,
    maxHeight,
    maxLength,
    buildingId,
    silhouette: {
      x,
      y,
      width,
      height: GRID.mapHeight - y,
    },
  };
}

function createBuilding({
  buildingId,
  x,
  width,
  maxHeight,
  balconyLevels = [],
  baseY = GRID.groundY,
}) {
  const verticalOffset = 20;
  const roofY = baseY - maxHeight * GRID.storyHeight + verticalOffset;
  const validBalconyLevels = [...new Set(
    (balconyLevels ?? [])
      .filter((storyIndex) => Number.isInteger(storyIndex) && storyIndex > 0 && storyIndex < maxHeight)
      .map((storyIndex) => Number(storyIndex))
  )].sort((a, b) => a - b);

  const roof = createPlatform({
    x,
    y: roofY,
    width,
    variant: "roof",
    index: 0,
    maxHeight,
    maxLength: width,
    buildingId,
  });

  const floors = validBalconyLevels.map((storyIndex) =>
    createPlatform({
      x,
      y: baseY - storyIndex * GRID.storyHeight + verticalOffset,
      width,
      variant: "balcony",
      index: storyIndex,
      maxHeight,
      maxLength: width,
      buildingId,
    })
  );

  return {
    buildingId,
    x,
    width,
    maxHeight,
    roofY,
    baseY,
    roof,
    floors,
    silhouette: {
      x,
      y: roofY,
      width,
      height: baseY - roofY + 18,
    },
    platforms: [roof, ...floors],
  };
}

export function createLevel(seed = 1) {
  const random = mulberry32(seed);
  const totalWidth = 3200 + Math.floor(random() * 1100);
  const buildingCount = 7 + Math.floor(random() * 3);
  const buildings = [];
  let cursor = 90;

  for (let i = 0; i < buildingCount; i += 1) {
    const width = 160 + Math.floor(random() * 120);
    const maxHeight = 2 + Math.floor(random() * 3);
    const validLevels = Array.from({ length: Math.max(0, maxHeight - 1) }, (_, index) => index + 1);
    const balconyLevels = [];

    if (validLevels.length > 0) {
      const lowBalcony = validLevels[Math.floor(random() * validLevels.length)];
      balconyLevels.push(lowBalcony);

      if (validLevels.length > 1 && random() < 0.8) {
        const remainingLevels = validLevels.filter((level) => level !== lowBalcony);
        const secondBalcony = remainingLevels[Math.floor(random() * remainingLevels.length)];
        balconyLevels.push(secondBalcony);
      }

      if (validLevels.length > 2 && random() < 0.35) {
        const remainingLevels = validLevels.filter((level) => !balconyLevels.includes(level));
        if (remainingLevels.length > 0) {
          balconyLevels.push(remainingLevels[Math.floor(random() * remainingLevels.length)]);
        }
      }
    }

    const uniqueBalconyLevels = [...new Set(balconyLevels)].sort((a, b) => a - b);

    buildings.push(
      createBuilding({
        buildingId: String.fromCharCode(65 + i),
        x: cursor,
        width,
        maxHeight,
        balconyLevels: uniqueBalconyLevels,
      })
    );

    cursor += width + 60 + Math.floor(random() * 180);
  }

  const finalWidth = Math.max(totalWidth, cursor + 220);
  const ground = {
    x: 0,
    y: GRID.groundY,
    width: finalWidth,
    height: GRID.mapHeight - GRID.groundY + 36,
    variant: "ground",
  };

  const platforms = [ground, ...buildings.flatMap((building) => building.platforms)];

  for (const platform of platforms) {
    if (platform.variant === "ground") continue;
    platform.y += 20;
    platform.silhouette.y += 20;
  }

  const collectibleChoices = ["snack", "snack", "snack", "rare", "rare", "special"];
  const collectibleCount = 12 + Math.floor(random() * 5);
  const collectiblePlatforms = platforms.filter((platform) => platform.variant !== "ground");
  const collectibles = [];

  for (let i = 0; i < collectibleCount; i += 1) {
    const platform = collectiblePlatforms[Math.floor(random() * collectiblePlatforms.length)];
    const safePadding = 20;
    const x = platform.x + safePadding + random() * (platform.width - safePadding * 2);
    const y = platform.y - 18 - random() * 30;
    const type = collectibleChoices[Math.floor(random() * collectibleChoices.length)];
    const radius = type === "special" ? 13 : type === "rare" ? 12 : 11;

    collectibles.push({ x, y, radius, type });
  }

  const background = {
    clouds: Array.from({ length: 8 }, (_, index) => ({
      x: 100 + index * 290 + random() * 120,
      y: 70 + random() * 75,
      w: 70 + random() * 60,
      h: 20 + random() * 18,
    })),
    hills: Array.from({ length: 9 }, (_, index) => ({
      x: index * 360 + random() * 100,
      y: 355 + random() * 50,
      width: 240 + random() * 180,
      height: 90 + random() * 80,
    })),
    buildings: Array.from({ length: 8 }, (_, index) => ({
      x: index * 410 + random() * 120,
      y: 360 + random() * 26,
      width: 100 + random() * 80,
      height: 90 + random() * 90,
      roof: 12 + Math.floor(random() * 8),
    })),
  };

  return {
    width: finalWidth,
    height: GRID.mapHeight,
    startX: 20,
    startY: GRID.groundY - 32,
    ground,
    buildings,
    platforms,
    background,
    collectibles,
  };
}
