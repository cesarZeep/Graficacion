export const particlesArray: Particle[] = [];

export class Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  color: string;

  constructor(birdX: number, birdY: number, hue: number) {
    this.x = birdX;
    this.y = birdY;
    this.size = Math.random() * 7 + 3;
    this.speedY = Math.random() * 1 - 0.5;
    this.color = `hsla(${hue}, 100%, 50%, 0.8)`;
  }

  update(gamespeed: number) {
    this.x -= gamespeed;
    this.y += this.speedY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function handleParticles(
  birdX: number,
  birdY: number,
  hue: number,
  gamespeed: number,
  ctx: CanvasRenderingContext2D
) {
  particlesArray.unshift(new Particle(birdX, birdY, hue));

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update(gamespeed);
    particlesArray[i].draw(ctx);
  }

  if (particlesArray.length > 200) {
    particlesArray.splice(180, 20);
  }
}
