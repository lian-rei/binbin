import { loadImage } from "./assets.js";

export const CITY_ASSET_CONFIG = {
  "city 1": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
  "city 2": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82, 1.08],
  },
  "city 3": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
  "city 4": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
  "city 5": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
  "city 6": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82, 1.08],
  },
  "city 7": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
  "city 8": {
    files: ["1.png", "2.png", "3.png", "4.png", "5.png"],
    speeds: [0.12, 0.22, 0.36, 0.56, 0.82],
  },
};

export class ParallaxBackground {
  constructor({ cityName = "city 1", canvasWidth, canvasHeight }) {
    this.cityName = cityName;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.layers = [];
    this.ready = false;
  }

  async load() {
    const config = CITY_ASSET_CONFIG[this.cityName];
    if (!config) {
      throw new Error(`Unknown city background: ${this.cityName}`);
    }

    this.layers = [];
    const folderName = this.cityName;

    for (let index = 0; index < config.files.length; index += 1) {
      const fileName = config.files[index];
      const imagePath = `./assets/sprites/street bg/${folderName}/${fileName}`;

      try {
        const image = await loadImage(imagePath);

        if (image.width > 1000 || image.height > 700) {
          console.info(`Skipping composite reference layer: ${imagePath}`);
          continue;
        }

        this.layers.push({
          image,
          speed: config.speeds[index] ?? 0.15,
          offset: 0,
        });
      } catch (error) {
        console.warn(`Missing background layer: ${imagePath}`, error.message);
      }
    }

    this.ready = this.layers.length > 0;
    return this;
  }

  render(context, cameraX) {
    if (!this.ready) {
      return;
    }

    const zoom = 1.18;
    const sky = context.createLinearGradient(0, 0, 0, this.canvasHeight);
    sky.addColorStop(0, "#0f2447");
    sky.addColorStop(1, "#1a325e");
    context.fillStyle = sky;
    context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let index = 0; index < this.layers.length; index += 1) {
      const layer = this.layers[index];
      const image = layer.image;
      const drawHeight = (this.canvasHeight + 30) * zoom;
      const drawWidth = (image.width / image.height) * drawHeight;
      const drawY = -48;
      const offset = (-cameraX * layer.speed * zoom) % drawWidth;

      for (let drawX = offset - drawWidth; drawX < this.canvasWidth + drawWidth; drawX += drawWidth) {
        context.imageSmoothingEnabled = false;
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      }
    }
  }
}
