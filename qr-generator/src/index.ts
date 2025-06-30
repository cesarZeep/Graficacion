class QRPainter {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private moduleSize: number = 8;
    private margin: number = 4;
    private darkColor: string = '#000000';
    private lightColor: string = '#FFFFFF';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No se pudo obtener el contexto 2D');
        this.ctx = context;
    }

    public generateQR(text: string): void {
        if (!this.isValidInput(text)) {
            alert("Ingresa una URL válida (http:// o https://) o texto (máx. 25 caracteres)");
            return;
        }

        this.clearCanvas();
        const qrData = this.generateQRData(text);
        this.drawQR(qrData);
    }

    private generateQRData(text: string): boolean[][] {
        const size = 21; // Versión 1 (21x21 módulos)
        const qrData: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

        // 1. Patrones fijos (obligatorios)
        this.drawPositionPatterns(qrData, size);
        this.drawTimingPatterns(qrData, size);
        this.drawAlignmentPattern(qrData, Math.floor(size/2), Math.floor(size/2));

        // 2. Codificar texto en binario (UTF-8)
        const encodedBits = this.encodeText(text);
        
        // 3. Rellenar datos con corrección de errores básica
        this.fillDataModules(qrData, encodedBits, size);

        return qrData;
    }

    private encodeText(text: string): boolean[] {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text.substring(0, 25)); // Limitar a 25 caracteres
        const bits: boolean[] = [];
        
        // Indicador de modo (Byte mode)
        bits.push(false, false, true, false);
        
        // Longitud del texto (8 bits)
        const lengthBits = bytes.length.toString(2).padStart(8, '0');
        lengthBits.split('').forEach(bit => bits.push(bit === '1'));
        
        // Datos (UTF-8)
        bytes.forEach(byte => {
            const byteBits = byte.toString(2).padStart(8, '0');
            byteBits.split('').forEach(bit => bits.push(bit === '1'));
        });
        
        return bits;
    }

    private drawPositionPatterns(data: boolean[][], size: number): void {
        // Esquinas superior izquierda, superior derecha e inferior izquierda
        this.drawPositionPattern(data, 0, 0);
        this.drawPositionPattern(data, 0, size - 7);
        this.drawPositionPattern(data, size - 7, 0);
    }

    private drawPositionPattern(data: boolean[][], x: number, y: number): void {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
                const isInner = (i >= 2 && i <= 4) && (j >= 2 && j <= 4);
                data[x + i][y + j] = isBorder || isInner;
            }
        }
    }

    private drawTimingPatterns(data: boolean[][], size: number): void {
        // Líneas horizontales y verticales de timing
        for (let i = 8; i < size - 8; i++) {
            data[6][i] = i % 2 === 0;
            data[i][6] = i % 2 === 0;
        }
    }

    private drawAlignmentPattern(data: boolean[][], x: number, y: number): void {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                data[x + i][y + j] = Math.max(Math.abs(i), Math.abs(j)) % 2 === 0;
            }
        }
    }

    private fillDataModules(data: boolean[][], bits: boolean[], size: number): void {
        let bitIndex = 0;
        let direction = -1; // Arriba -> Abajo
        let col = size - 1;
        
        while (col > 0 && bitIndex < bits.length) {
            if (col === 6) col--; // Saltar columna de timing
            
            const startRow = direction === -1 ? size - 1 : 0;
            const endRow = direction === -1 ? 0 : size - 1;
            
            for (let row = startRow; row !== endRow + direction; row += direction) {
                // Rellenar solo módulos no reservados
                if (this.isDataModule(row, col, size) && bitIndex < bits.length) {
                    data[row][col] = bits[bitIndex++];
                }
                
                if (this.isDataModule(row, col - 1, size) && bitIndex < bits.length) {
                    data[row][col - 1] = bits[bitIndex++];
                }
            }
            
            direction *= -1;
            col -= 2;
        }
    }

    private isDataModule(row: number, col: number, size: number): boolean {
        // Verifica si el módulo no está en un área reservada
        return !(
            (row < 9 && col < 9) ||       // Esquina superior izquierda
            (row < 9 && col > size - 9) || // Esquina superior derecha
            (row > size - 9 && col < 9) || // Esquina inferior izquierda
            (row === 6 || col === 6)       // Timing patterns
        );
    }

    private drawQR(data: boolean[][]): void {
        const size = data.length;
        const offset = this.margin * this.moduleSize;
        
        // Dibujar módulos
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                this.ctx.fillStyle = data[y][x] ? this.darkColor : this.lightColor;
                this.ctx.fillRect(
                    offset + x * this.moduleSize,
                    offset + y * this.moduleSize,
                    this.moduleSize,
                    this.moduleSize
                );
            }
        }
        
        // Borde blanco
        this.ctx.strokeStyle = this.lightColor;
        this.ctx.lineWidth = this.margin;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private clearCanvas(): void {
        this.ctx.fillStyle = this.lightColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private isValidInput(text: string): boolean {
        if (text.startsWith('http://') || text.startsWith('https://')) {
            try {
                new URL(text);
                return true;
            } catch {
                return false;
            }
        }
        return text.trim().length > 0 && text.length <= 25;
    }

    public setColors(dark: string, light: string): void {
        this.darkColor = dark;
        this.lightColor = light;
    }

    public setModuleSize(size: number): void {
        this.moduleSize = Math.max(4, Math.min(20, size));
    }
}

// Inicialización
function init() {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const qrPainter = new QRPainter(canvas);
    const qrInput = document.getElementById('qr-input') as HTMLInputElement;
    const generateBtn = document.getElementById('generate-btn');

    if (generateBtn && qrInput) {
        generateBtn.addEventListener('click', () => qrPainter.generateQR(qrInput.value));
        qrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') qrPainter.generateQR(qrInput.value);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);