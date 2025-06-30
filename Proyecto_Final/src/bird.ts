export class Bird {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  weight: number;
  image: HTMLImageElement;

  constructor() {
    this.x = 150;
    this.y = 200;
    this.vy = 0;
    this.width = 40;
    this.height = 30;
    this.weight = 1;

    this.image = new Image();
    this.image.src = 'assets/nave.png'; // Ajusta ruta según estructura
  }

  update(angle: number, canvasHeight: number, spacePressed: boolean) {
    // Movimiento vertical con curva suave
    const curve = Math.sin(angle) * 20;

    if (this.y > canvasHeight - this.height + curve) {
      this.y = canvasHeight - this.height + curve;
      this.vy = 0;
    } else {
      this.vy += this.weight;
      this.vy *= 0.9;
      this.y += this.vy;
    }

    if (this.y < 0 + this.height) {
      this.y = 0 + this.height;
      this.vy = 0;
    }

    // Si está presionada la barra espacio y no está muy arriba, hace flap
    if (spacePressed && this.y > this.height * 3) {
      this.flap();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  flap() {
    this.vy -= 2;
  }
}
