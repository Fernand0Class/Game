// Main.js - Archivo principal que orquesta el juego
import { gameConfig } from './js/config/gameConfig.js';
import { PreloadScene } from './js/scenes/PreloadScene.js';
import { MenuScene } from './js/scenes/MenuScene.js';
import { SelectScene } from './js/scenes/SelectScene.js';
import { PlayScene } from './js/scenes/PlayScene.js';

// Instalar overlay de errores si estamos en navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    (function installErrorOverlay() {
        function createOverlay() {
            const o = document.createElement('div');
            o.id = 'error-overlay';
            o.style.position = 'fixed';
            o.style.left = '10px';
            o.style.right = '10px';
            o.style.top = '10px';
            o.style.background = 'rgba(0,0,0,0.85)';
            o.style.color = '#ffdddd';
            o.style.padding = '12px';
            o.style.fontFamily = 'monospace';
            o.style.zIndex = 99999;
            o.style.maxHeight = '40vh';
            o.style.overflow = 'auto';
            o.style.border = '2px solid #ff4444';
            o.style.display = 'none';
            document.body.appendChild(o);
            return o;
        }
        const overlay = createOverlay();
        function showError(text) {
            overlay.style.display = 'block';
            overlay.innerText = '[Error] ' + text;
            console.error(text);
        }
        window.addEventListener('error', function (e) {
            showError((e && e.error && e.error.stack) ? e.error.stack : (e.message || String(e)));
        });
        window.addEventListener('unhandledrejection', function (e) {
            showError(e && e.reason ? (e.reason.stack || e.reason) : String(e));
        });
        window.__showGameError = showError;
    })();
}

// Configurar escenas
const config = {
    ...gameConfig,
    scene: [PreloadScene, MenuScene, SelectScene, PlayScene]
};

// Crear y ejecutar el juego
new Phaser.Game(config);

console.log('🎮 Juego iniciado con arquitectura modular');
