import { playAudio, setVolume, toggleMute, syncAudio } from '../assets/audio.js';

let playerName = 'Jugador';

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

        // Fondo degradado vibrante
        const g = this.add.graphics();
        g.fillStyle(0x0f0f2e, 1);
        g.fillRect(0, 0, width, height);
        g.destroy();

        // Orbes decorativos de fondo con colores vibrantes
        const orb1 = this.add.circle(width * 0.15, height * 0.2, 150, 0xff1493, 0.08);
        const orb2 = this.add.circle(width * 0.85, height * 0.7, 180, 0x00d4ff, 0.08);
        const orb3 = this.add.circle(width * 0.5, height * 0.9, 160, 0x7b61ff, 0.08);

        // Título principal con gradiente de colores
        const title = this.add.text(width / 2, height * 0.15, 'SMASH 2D', {
            fontFamily: 'Arial',
            fontSize: '72px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setShadow(0, 8, '#ff1493', 6);

        // Subtítulo con color más vibrante
        this.add.text(width / 2, height * 0.25, 'Ingresa tu nombre y prepárate para la batalla', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Input de nombre estilizado con colores vibrantes
        if (typeof document !== 'undefined') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Tu nombre aquí...';
            input.maxLength = 20;
            input.style.position = 'fixed';
            input.style.left = '50%';
            input.style.top = '50%';
            input.style.transform = 'translate(-50%, -50%)';
            input.style.width = '300px';
            input.style.padding = '16px 18px';
            input.style.fontSize = '18px';
            input.style.fontFamily = "'Segoe UI', Arial, sans-serif";
            input.style.borderRadius = '12px';
            input.style.border = '3px solid #ff1493';
            input.style.backgroundColor = 'rgba(15, 15, 46, 0.95)';
            input.style.color = '#00ff88';
            input.style.zIndex = '9999';
            input.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.6), inset 0 0 10px rgba(0, 212, 255, 0.2)';
            input.style.transition = 'all 0.3s ease';
            input.style.textAlign = 'center';
            input.style.fontSize = '20px';
            input.style.fontWeight = 'bold';
            
            // Estilos dinámicos con colores más vibrantes
            input.addEventListener('focus', function() {
                this.style.borderColor = '#00d4ff';
                this.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8), inset 0 0 15px rgba(255, 20, 147, 0.3)';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = '#ff1493';
                this.style.boxShadow = '0 0 20px rgba(255, 20, 147, 0.6), inset 0 0 10px rgba(0, 212, 255, 0.2)';
            });

            document.body.appendChild(input);
            input.focus();

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const name = input.value.trim() || 'Jugador';
                    setPlayerName(name);
                    playAudio(this);
                    document.body.removeChild(input);
                    this.scene.start('SelectScene');
                }
            });

            // Asegurar que el input permanezca centrado en pantalla completa
            const repositionInput = () => {
                input.style.left = '50%';
                input.style.top = '50%';
                input.style.transform = 'translate(-50%, -50%)';
            };

            document.addEventListener('fullscreenchange', repositionInput);
            window.addEventListener('resize', repositionInput);
            window.addEventListener('orientationchange', repositionInput);
        }

        // Botones de control en la parte inferior
        const controlY = height * 0.65;
        const controlsContainer = this.add.container(width / 2, controlY);

        const buttonColors = [0xff1493, 0x00d4ff, 0x7b61ff, 0x00ff88];
        let colorIndex = 0;

        const createControlButton = (x, label, cb) => {
            const color = buttonColors[colorIndex % buttonColors.length];
            colorIndex++;
            
            const bg = this.add.rectangle(x, 0, 150, 50, color, 0.2).setOrigin(0.5);
            bg.setStrokeStyle(2, color, 1);
            bg.setData('baseColor', color);
            bg.setData('baseAlpha', 0.2);
            
            const txt = this.add.text(x, 0, label, {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#ffffff',
                fontStyle: '700'
            }).setOrigin(0.5);
            
            bg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => { 
                    bg.setFillStyle(bg.getData('baseColor'), 0.4);
                    bg.setScale(1.08);
                })
                .on('pointerout', () => { 
                    bg.setFillStyle(bg.getData('baseColor'), bg.getData('baseAlpha'));
                    bg.setScale(1);
                })
                .on('pointerdown', () => {
                    this.tweens.add({ targets: bg, scale: 0.92, duration: 100, yoyo: true });
                    cb();
                });
            
            controlsContainer.add([bg, txt]);
        };

        createControlButton(-280, '⚙ Vol +', () => {
            setVolume(this, (this.registry.get('volume') || 0.6) + 0.1);
        });

        createControlButton(-93, '🔇 Vol -', () => {
            setVolume(this, (this.registry.get('volume') || 0.6) - 0.1);
        });

        createControlButton(93, '🔊 Silencio', () => {
            toggleMute(this);
        });

        createControlButton(280, '⛶ Pantalla', () => {
            this.scale.toggleFullscreen();
        });

        // Pista en la parte inferior con color vibrante
        this.add.text(width / 2, height * 0.92, 'Presiona ENTER para continuar', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#00ff88',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Tecla rápida ENTER
        this.input.keyboard.on('keydown-ENTER', () => {
            const inputEl = document.querySelector('input');
            if (inputEl) {
                const name = inputEl.value.trim() || 'Jugador';
                setPlayerName(name);
                playAudio(this);
                if (document.body.contains(inputEl)) {
                    document.body.removeChild(inputEl);
                }
                this.scene.start('SelectScene');
            }
        });

        // Sincronizar audio
        try { syncAudio(this); } catch (e) { }
    }
}
