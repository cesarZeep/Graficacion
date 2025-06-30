export const obstaclesArray: Obstacle[] = [];

export class Obstacle {
  top: number;
  bottom: number;
  x: number;
  width: number;
  color: string;
  counted: boolean;

  constructor(canvasWidth: number, canvasHeight: number, hue: number) {
    this.top = Math.random() * (canvasHeight / 3) + 20;
    this.bottom = Math.random() * (canvasHeight / 3) + 20;
    this.x = canvasWidth;
    this.width = 20;
    this.color = `hsla(${hue}, 100%, 50%, 1)`;
    this.counted = false;
  }

  draw(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, 0, this.width, this.top);
    ctx.fillRect(this.x, canvasHeight - this.bottom, this.width, this.bottom);
  }

  update(gamespeed: number, birdX: number, incrementScore: () => void, ctx: CanvasRenderingContext2D, canvasHeight: number) {
    this.x -= gamespeed;
    if (!this.counted && this.x < birdX) {
      incrementScore();
      this.counted = true;
    }
    this.draw(ctx, canvasHeight);
  }
}

export function handleObstacles(
  frame: number,
  canvasWidth: number,
  canvasHeight: number,
  hue: number,
  gamespeed: number,
  birdX: number,
  incrementScore: () => void,
  ctx: CanvasRenderingContext2D
) {
  if (frame % 55 === 0) {
    obstaclesArray.unshift(new Obstacle(canvasWidth, canvasHeight, hue));
  }
  
  // Eliminar obstáculos que ya salieron de la pantalla
  for (let i = obstaclesArray.length - 1; i >= 0; i--) {
    if (obstaclesArray[i].x + obstaclesArray[i].width < 0) {
      obstaclesArray.splice(i, 1);
    }
  }
  
  for (let i = 0; i < obstaclesArray.length; i++) {
    obstaclesArray[i].update(gamespeed, birdX, incrementScore, ctx, canvasHeight);
  }
}
