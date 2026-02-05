import { playAudio, setVolume, toggleMute } from '../assets/audio.js';

let playerName = '';

export { playerName };
export function setPlayerName(name) {
    playerName = name;
}

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Título
        this.add.text(width / 2, height / 4, 'JUEGO 2D', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Input de nombre
        if (typeof document !== 'undefined') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Ingresa tu nombre';
            input.style.position = 'fixed';
            input.style.left = (width / 2 - 75) + 'px';
            input.style.top = (height / 2 - 100) + 'px';
            input.style.width = '150px';
            input.style.padding = '8px';
            input.style.fontSize = '16px';
            input.style.fontFamily = 'Arial';
            input.style.borderRadius = '5px';
            input.style.border = '2px solid #ffcc00';
            input.style.backgroundColor = '#333333';
            input.style.color = '#ffffff';
            input.style.zIndex = '9999';
            document.body.appendChild(input);
            input.focus();

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    setPlayerName(input.value.trim() || 'Jugador');
                    playAudio(this);
                    document.body.removeChild(input);
                    this.scene.start('SelectScene');
                }
            });
        }

        // Botones de control
        const buttonY = height / 2 + 50;
        
        this.add.text(100, buttonY, 'Pantalla Completa', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            this.scale.toggleFullscreen();
        });

        this.add.text(width / 2 - 100, buttonY, 'Vol +', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            setVolume(this, (this.registry.get('volume') || 0.2) + 0.1);
        });

        this.add.text(width / 2, buttonY, 'Vol -', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            setVolume(this, (this.registry.get('volume') || 0.2) - 0.1);
        });

        this.add.text(width / 2 + 100, buttonY, 'Silencio', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            toggleMute(this);
        });
    }
}
