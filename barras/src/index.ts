import { CanvasLocal } from './canvasLocal.js';

// Extender la interfaz Window para TypeScript
declare global {
    interface Window {
        miCanvas?: CanvasLocal;
    }
}

// Variables globales
let canvas: HTMLCanvasElement | null = null;
let graphics: CanvasRenderingContext2D | null = null;
let miCanvas: CanvasLocal | null = null;

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
function init() {
    try {
        // Obtener elementos del canvas
        canvas = document.getElementById('circlechart') as HTMLCanvasElement;
        if (!canvas) throw new Error('Elemento canvas no encontrado');
        
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No se pudo obtener el contexto 2D');
        graphics = context;

        // Crear instancia de CanvasLocal
        miCanvas = new CanvasLocal(graphics, canvas);
        
        // Configurar controles
        setupSliders();
        setupColorPickers();
        setupButtons();
        
        // Dibujar inicialmente
        miCanvas.paint();

        // Exponer para debugging (solo en desarrollo local)
        setupDebugMode();
    } catch (error) {
        console.error('Error de inicialización:', error);
        showErrorToUser();
    }
}

/**
 * Configura los controles deslizantes
 */
function setupSliders() {
    const sliders = document.querySelectorAll<HTMLInputElement>('.slider');
    
    sliders.forEach(slider => {
        const barIndex = parseInt(slider.dataset.bar || '0');
        const initialValue = parseInt(slider.value);
        
        // Actualizar label inicial
        updateSliderLabel(slider, initialValue);
        
        // Configurar evento input
        slider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const percentage = parseInt(target.value);
            
            updateSliderLabel(target, percentage);
            miCanvas?.updateBar(barIndex, percentage);
        });
    });
}

/**
 * Actualiza la etiqueta del slider con el porcentaje actual
 */
function updateSliderLabel(slider: HTMLInputElement, value: number) {
    const label = slider.closest('.control-group')?.querySelector('label');
    if (label) {
        const labelText = label.textContent?.split('(')[0] || '';
        label.textContent = `${labelText.trim()} (${value}%)`;
    }
}

/**
 * Configura los selectores de color
 */
function setupColorPickers() {
    const colorOptions = document.querySelectorAll<HTMLElement>('.color-option');
    const defaultColors = ['#3498db', '#2ecc71', '#e91e63', '#f39c12'];
    
    colorOptions.forEach(option => {
        // Configurar evento click
        option.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const color = target.dataset.color || '#3498db';
            const barIndex = parseInt(target.dataset.bar || '0');
            
            // Obtener el valor actual del slider
            const slider = document.querySelector(`.slider[data-bar="${barIndex}"]`) as HTMLInputElement;
            const currentValue = parseInt(slider.value);
            
            // Actualizar solo el color manteniendo el porcentaje
            miCanvas?.updateBar(barIndex, currentValue, color);
            
            // Actualizar interfaz
            updateActiveColor(barIndex, target);
        });
        
        // Marcar colores predeterminados como activos
        if (option.dataset.color && defaultColors.includes(option.dataset.color)) {
            option.classList.add('active');
        }
    });
}

/**
 * Actualiza el estado activo de los selectores de color
 */
function updateActiveColor(barIndex: number, selectedOption: HTMLElement) {
    document.querySelectorAll(`.color-option[data-bar="${barIndex}"]`).forEach(opt => {
        opt.classList.remove('active');
    });
    selectedOption.classList.add('active');
}

/**
 * Configura los botones de control
 */
function setupButtons() {
    // Botón de alternar 3D
    const toggle3dBtn = document.getElementById('toggle-3d');
    if (toggle3dBtn) {
        toggle3dBtn.addEventListener('click', () => {
            miCanvas?.toggle3DEffect();
            toggle3dBtn.textContent = toggle3dBtn.textContent === '3D: ON' ? '3D: OFF' : '3D: ON';
        });
    }
    
    // Botón de animación con verificación completa
    const animateBtn = document.getElementById('animate-btn');
    if (animateBtn) {
        animateBtn.addEventListener('click', () => {
            if (!miCanvas) return;
            
            miCanvas.animateBars();
            animateBtn.textContent = animateBtn.textContent === 'Animación' ? 'Detener' : 'Animación';
        });
    }
    
    // Botón de reinicio con verificación completa
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!miCanvas) return;
            
            miCanvas.resetBars();
            resetSliders();
        });
    }
}

/**
 * Restablece los sliders a valores iniciales
 */
function resetSliders() {
    const initialValues = [73, 61, 53, 52];
    document.querySelectorAll<HTMLInputElement>('.slider').forEach((slider, index) => {
        slider.value = initialValues[index].toString();
        updateSliderLabel(slider, initialValues[index]);
    });
    
    // Restablecer colores activos
    const defaultColors = ['#3498db', '#2ecc71', '#e91e63', '#f39c12'];
    document.querySelectorAll<HTMLElement>('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.color && defaultColors.includes(option.dataset.color)) {
            option.classList.add('active');
        }
    });
}

/**
 * Configura el modo de depuración
 */
function setupDebugMode() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost && miCanvas) {
        window.miCanvas = miCanvas;
        console.log('Modo depuración: miCanvas disponible en consola');
        console.log('Usa window.miCanvas para acceder a los métodos:');
        console.log('- miCanvas.toggle3DEffect()');
        console.log('- miCanvas.animateBars()');
        console.log('- miCanvas.resetBars()');
    }
}

/**
 * Muestra errores al usuario
 */
function showErrorToUser() {
    const errorElement = document.createElement('div');
    errorElement.style.position = 'fixed';
    errorElement.style.top = '0';
    errorElement.style.left = '0';
    errorElement.style.right = '0';
    errorElement.style.padding = '1rem';
    errorElement.style.backgroundColor = '#dc3545';
    errorElement.style.color = 'white';
    errorElement.style.textAlign = 'center';
    errorElement.style.zIndex = '1000';
    errorElement.textContent = 'Error al cargar la aplicación. Por favor recarga la página.';
    document.body.prepend(errorElement);
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);