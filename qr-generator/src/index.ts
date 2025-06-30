class SimpleQR {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private moduleSize = 8;
  private margin = 4;
  private dark = '#000';
  private light = '#fff';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener contexto 2D');
    this.ctx = ctx;
  }

  generate(text: string) {
    if (!text || text.length === 0) {
      alert('Escribe algo para generar el QR');
      return;
    }

    // Vamos a crear un patrón de prueba (una cruz grande + borde)
    const size = 21;
    const data: boolean[][] = Array(size).fill(0).map(() => Array(size).fill(false));

    // Dibujar bordes y cruz
    for (let i = 0; i < size; i++) {
      data[0][i] = true;
      data[size - 1][i] = true;
      data[i][0] = true;
      data[i][size - 1] = true;

      if (i >= 5 && i <= 15) {
        data[10][i] = true;
        data[i][10] = true;
      }
    }

    this.draw(data);
  }

  private draw(data: boolean[][]) {
    const size = data.length;
    const offset = this.margin * this.moduleSize;

    this.ctx.fillStyle = this.light;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        this.ctx.fillStyle = data[y][x] ? this.dark : this.light;
        this.ctx.fillRect(offset + x * this.moduleSize, offset + y * this.moduleSize, this.moduleSize, this.moduleSize);
      }
    }
  }
}

function init() {
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const input = document.getElementById('qr-input') as HTMLInputElement;
  const btnGenerate = document.getElementById('generate-btn') as HTMLButtonElement;

  if (!canvas || !input || !btnGenerate) {
    console.error('No se encontraron los elementos necesarios');
    return;
  }

  const qr = new SimpleQR(canvas);

  btnGenerate.addEventListener('click', () => {
    qr.generate(input.value);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      qr.generate(input.value);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
