export class CanvasLocal {
  animateBars() {
      throw new Error('Method not implemented.');
  }
  resetBars() {
      throw new Error('Method not implemented.');
  }
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;
  private bars: Bar3D[] = [];
  private show3DEffect: boolean = true;
  private animationFrameId: number | null = null;

  // Colores para la gráfica
  private readonly CONTAINER_COLOR = '#e0e0e0';
  private readonly GRID_COLOR = '#f0f0f0';
  private readonly AXIS_COLOR = '#333333';
  private readonly TEXT_COLOR = '#000000';

  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = canvas.width;
    this.rHeight = canvas.height;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 2;
    this.centerY = this.maxY / 2;

    this.initializeBars();
  }

  private initializeBars(): void {
    const baseY = this.maxY * 0.8;
    const barWidth = 60;
    const depth = 20;
    const spacing = 50; // Espacio aumentado entre barras
    const maxHeight = this.maxY * 0.6;

    // Crear barras con valores iniciales
    this.bars = [
      new Bar3D(100, baseY, barWidth, maxHeight * 0.73, depth, '#3498db', '(73%)', 73),
      new Bar3D(100 + (barWidth + spacing), baseY, barWidth, maxHeight * 0.61, depth, '#2ecc71', '(61%)', 61),
      new Bar3D(100 + 2 * (barWidth + spacing), baseY, barWidth, maxHeight * 0.53, depth, '#e91e63', '(53%)', 53),
      new Bar3D(100 + 3 * (barWidth + spacing), baseY, barWidth, maxHeight * 0.52, depth, '#f39c12', '(52%)', 52)
    ];
  }

  public toggle3DEffect(): void {
    this.show3DEffect = !this.show3DEffect;
    this.paint();
  }

  public updateBar(index: number, heightPercentage: number, color?: string): void {
    if (index >= 0 && index < this.bars.length) {
      const maxHeight = this.maxY * 0.6;
      
      if (heightPercentage >= 0) {
        const height = (heightPercentage / 100) * maxHeight;
        this.bars[index].height = height;
        this.bars[index].percentage = heightPercentage;
        this.bars[index].label = `${this.bars[index].label.split('(')[0].trim()} (${heightPercentage}%)`;
      }
      
      if (color) {
        this.bars[index].color = color;
      }
      
      this.paint();
    }
  }

  private drawGrid(): void {
    this.graphics.strokeStyle = this.GRID_COLOR;
    this.graphics.lineWidth = 1;

    // Líneas verticales
    for (let x = 0; x <= this.maxX; x += 50) {
      this.drawLine(x, 0, x, this.maxY);
    }

    // Líneas horizontales
    for (let y = 0; y <= this.maxY; y += 50) {
      this.drawLine(0, y, this.maxX, y);
    }
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number): void {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.stroke();
  }

  private drawAxes(): void {
    const baseY = this.maxY * 0.8;
    const scaleHeight = this.maxY * 0.6;
    
    // Ajustar el final del eje X al final de la última barra
    const lastBar = this.bars[this.bars.length - 1];
    const xEnd = lastBar.x + lastBar.width + lastBar.depth + 40;
    
    this.graphics.strokeStyle = this.AXIS_COLOR;
    this.graphics.lineWidth = 1.5;
    this.graphics.font = '12px Arial';
    this.graphics.fillStyle = this.TEXT_COLOR;
    this.graphics.textAlign = 'right';
    this.graphics.textBaseline = 'middle';

    // Eje Y (vertical)
    this.drawLine(40, baseY + 10, 40, baseY - scaleHeight - 10);

    // Marcas y etiquetas del eje Y (0% a 100% en pasos de 20%)
    for (let i = 0; i <= 5; i++) {
      const percentage = i * 20;
      const y = baseY - (scaleHeight * (percentage / 100));
      
      // Marca de escala
      this.drawLine(35, y, 45, y);
      
      // Etiqueta de porcentaje
      this.graphics.fillText(`${percentage}%`, 30, y);
    }

    // Eje X (horizontal)
    this.graphics.textAlign = 'center';
    this.drawLine(40, baseY, xEnd, baseY);

    // Etiqueta del eje X
    this.graphics.fillText('Categorías', this.centerX, baseY + 30);
  }

  private drawContainerAndBars(): void {
    this.bars.forEach(bar => {
      // Dibujar contenedor completo (100%)
      this.draw3DBox(
        bar.x, bar.y, bar.width, this.maxY * 0.6, bar.depth,
        this.CONTAINER_COLOR, true, false
      );

      // Dibujar relleno (porcentaje actual)
      this.draw3DBox(
        bar.x, bar.y, bar.width, bar.height, bar.depth,
        bar.color, true, false
      );

      // Dibujar marco del contenedor (todas las aristas)
      this.draw3DBox(
        bar.x, bar.y, bar.width, this.maxY * 0.6, bar.depth,
        'transparent', false, true
      );
    });
  }

  private draw3DBox(
    x: number, y: number, width: number, height: number, depth: number,
    color: string, isFill: boolean, isFrame: boolean = false
  ): void {
    this.graphics.save();

    if (isFill) {
      // Cara frontal (relleno)
      this.graphics.fillStyle = color;
      this.graphics.fillRect(x, y - height, width, height);

      if (this.show3DEffect) {
        // Cara lateral derecha
        this.graphics.fillStyle = this.darkenColor(color, 20);
        this.graphics.beginPath();
        this.graphics.moveTo(x + width, y - height);
        this.graphics.lineTo(x + width + depth, y - height - depth);
        this.graphics.lineTo(x + width + depth, y - depth);
        this.graphics.lineTo(x + width, y);
        this.graphics.closePath();
        this.graphics.fill();

        // Cara superior
        this.graphics.fillStyle = this.darkenColor(color, 10);
        this.graphics.beginPath();
        this.graphics.moveTo(x, y - height);
        this.graphics.lineTo(x + width, y - height);
        this.graphics.lineTo(x + width + depth, y - height - depth);
        this.graphics.lineTo(x + depth, y - height - depth);
        this.graphics.closePath();
        this.graphics.fill();
      }
    }

    if (isFrame) {
      // Marco del contenedor (todas las aristas visibles)
      this.graphics.strokeStyle = this.darkenColor(this.CONTAINER_COLOR, 30);
      this.graphics.lineWidth = 2;
      
      // Cara frontal
      this.graphics.strokeRect(x, y - height, width, height);
      
      if (this.show3DEffect) {
        // Aristas 3D completas
        this.graphics.beginPath();
        
        // Aristas verticales derechas
        this.graphics.moveTo(x + width, y - height);
        this.graphics.lineTo(x + width + depth, y - height - depth);
        this.graphics.moveTo(x + width, y);
        this.graphics.lineTo(x + width + depth, y - depth);
        
        // Aristas horizontales superiores
        this.graphics.moveTo(x, y - height);
        this.graphics.lineTo(x + width, y - height);
        this.graphics.moveTo(x + width + depth, y - height - depth);
        this.graphics.lineTo(x + depth, y - height - depth);
        
        // Aristas horizontales inferiores
        this.graphics.moveTo(x, y);
        this.graphics.lineTo(x + width, y);
        this.graphics.moveTo(x + width + depth, y - depth);
        this.graphics.lineTo(x + depth, y - depth);
        
        // Aristas verticales izquierdas
        this.graphics.moveTo(x, y - height);
        this.graphics.lineTo(x + depth, y - height - depth);
        this.graphics.moveTo(x, y);
        this.graphics.lineTo(x + depth, y - depth);
        
        this.graphics.stroke();
      }
    }

    this.graphics.restore();
  }

  private drawLabels(): void {
    this.graphics.save();
    this.graphics.fillStyle = this.TEXT_COLOR;
    this.graphics.font = '14px Arial';
    this.graphics.textAlign = 'center';
    this.graphics.textBaseline = 'top';

    // Etiquetas de las barras
    this.bars.forEach(bar => {
      this.graphics.fillText(
        bar.label, 
        bar.x + bar.width / 2, 
        bar.y + 10
      );
    });

    this.graphics.restore();
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  paint() {
    // Limpiar el canvas
    this.graphics.clearRect(0, 0, this.maxX + 1, this.maxY + 1);

    // Dibujar elementos en orden
    this.drawGrid();
    this.drawAxes();
    this.drawContainerAndBars();
    this.drawLabels();
  }
}

class Bar3D {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public depth: number,
    public color: string,
    public label: string,
    public percentage: number
  ) {}
}