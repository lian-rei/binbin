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

  const floors = balconyLevels.map((storyIndex) =>
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

export function createLevel() {
  const ground = {
    x: 0,
    y: GRID.groundY,
    width: GRID.mapWidth,
    height: GRID.mapHeight - GRID.groundY + 36,
    variant: "ground",
  };

  const buildings = [
    createBuilding({
      buildingId: "A",
      x: 80,
      width: 180,
      maxHeight: 3,
      balconyLevels: [],
    }),
    createBuilding({
      buildingId: "B",
      x: 420,
      width: 200,
      maxHeight: 4,
      balconyLevels: [2],
    }),
    createBuilding({
      buildingId: "C",
      x: 820,
      width: 180,
      maxHeight: 3,
      balconyLevels: [],
    }),
    createBuilding({
      buildingId: "D",
      x: 1190,
      width: 210,
      maxHeight: 5,
      balconyLevels: [2],
    }),
    createBuilding({
      buildingId: "E",
      x: 1610,
      width: 180,
      maxHeight: 4,
      balconyLevels: [2],
    }),
    createBuilding({
      buildingId: "F",
      x: 2050,
      width: 190,
      maxHeight: 4,
      balconyLevels: [],
    }),
    createBuilding({
      buildingId: "G",
      x: 2490,
      width: 200,
      maxHeight: 5,
      balconyLevels: [2],
    }),
  ];

  const platforms = [ground, ...buildings.flatMap((building) => building.platforms)];

  for (const platform of platforms) {
    if (platform.variant === "ground") continue;
    platform.y += 20;
    platform.silhouette.y += 20;
  }

  const collectibles = [
    { x: 150, y: 242, radius: 12, type: "snack" },
    { x: 520, y: 170, radius: 12, type: "snack" },
    { x: 540, y: 314, radius: 12, type: "rare" },
    { x: 860, y: 278, radius: 12, type: "snack" },
    { x: 930, y: 312, radius: 12, type: "snack" },
    { x: 1260, y: 244, radius: 12, type: "rare" },
    { x: 1460, y: 220, radius: 12, type: "snack" },
    { x: 1710, y: 188, radius: 13, type: "rare" },
    { x: 2090, y: 222, radius: 12, type: "snack" },
    { x: 2535, y: 146, radius: 13, type: "special" },
    { x: 2720, y: 210, radius: 12, type: "snack" },
    { x: 2860, y: 260, radius: 12, type: "snack" },
    { x: 2950, y: 304, radius: 12, type: "rare" },
    { x: 3150, y: 330, radius: 12, type: "snack" },
    { x: 3320, y: 390, radius: 13, type: "special" },
  ];

  const background = {
    clouds: [
      { x: 120, y: 90, w: 80, h: 30 },
      { x: 420, y: 120, w: 100, h: 34 },
      { x: 760, y: 100, w: 90, h: 28 },
      { x: 1180, y: 82, w: 86, h: 28 },
      { x: 1550, y: 120, w: 96, h: 30 },
      { x: 2010, y: 110, w: 90, h: 32 },
      { x: 2480, y: 96, w: 84, h: 28 },
      { x: 2910, y: 120, w: 100, h: 32 },
    ],
    hills: [
      { x: 0, y: 385, width: 380, height: 120 },
      { x: 420, y: 360, width: 360, height: 140 },
      { x: 820, y: 395, width: 330, height: 110 },
      { x: 1200, y: 360, width: 380, height: 140 },
      { x: 1600, y: 390, width: 340, height: 120 },
      { x: 1980, y: 360, width: 370, height: 140 },
      { x: 2380, y: 390, width: 330, height: 110 },
      { x: 2760, y: 360, width: 380, height: 140 },
      { x: 3160, y: 395, width: 350, height: 110 },
    ],
    buildings: [
      { x: 50, y: 365, width: 120, height: 120, roof: 16 },
      { x: 220, y: 355, width: 140, height: 130, roof: 18 },
      { x: 860, y: 358, width: 140, height: 120, roof: 16 },
      { x: 1240, y: 345, width: 110, height: 135, roof: 18 },
      { x: 1700, y: 360, width: 150, height: 120, roof: 16 },
      { x: 2300, y: 350, width: 120, height: 130, roof: 18 },
      { x: 2860, y: 355, width: 150, height: 120, roof: 16 },
      { x: 3270, y: 365, width: 120, height: 110, roof: 16 },
    ],
  };

  return {
    width: GRID.mapWidth,
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
