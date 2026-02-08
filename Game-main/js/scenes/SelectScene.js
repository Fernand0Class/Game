import { playerName } from './MenuScene.js';
import { charactersData, getCharacterTexture, getCharacterScale } from '../assets/characters.js';

let selectedCharacterIndex = 0;

export { selectedCharacterIndex };
export function setSelectedCharacterIndex(index) {
    selectedCharacterIndex = index;
}

export class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
        this.characters = charactersData;
        this.customizations = [];
    }

    create() {
        const { width, height } = this.scale;

        // Fondo degradado vibrante similar a MenuScene
        const g = this.add.graphics();
        g.fillStyle(0x0f0f2e, 1);
        g.fillRect(0, 0, width, height);
        g.destroy();

        // Orbes decorativos de fondo con colores vibrantes
        const orb1 = this.add.circle(width * 0.1, height * 0.15, 140, 0xff1493, 0.08);
        const orb2 = this.add.circle(width * 0.9, height * 0.8, 160, 0x00d4ff, 0.08);
        const orb3 = this.add.circle(width * 0.5, height * 0.05, 120, 0x7b61ff, 0.08);

        // Nombre del jugador - Encabezado
        this.add.text(width / 2, height * 0.06, playerName || 'JUGADOR', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#00ff88',
            fontStyle: '700'
        }).setOrigin(0.5);

        // Título "Selecciona personaje"
        this.add.text(width / 2, height * 0.12, 'SELECCIONA TU PERSONAJE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#00d4ff',
            fontStyle: '600'
        }).setOrigin(0.5);

        this.index = selectedCharacterIndex || 0;

        // Crear textura simple si no existe
        if (!this.textures.exists('char')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRoundedRect(0, 0, 80, 100, 10);
            g.generateTexture('char', 80, 100);
            g.destroy();
        }

        this.preview = this.add.image(width / 2, height * 0.38, 'char').setOrigin(0.5);
        
        this.nameText = this.add.text(width / 2, height * 0.55, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: '700'
        }).setOrigin(0.5);

        // Flechas de navegación con colores vibrantes
        const leftArrow = this.add.text(width * 0.1, height * 0.38, '◀', {
            fontFamily: 'Arial',
            fontSize: '50px',
            color: '#ff1493'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const rightArrow = this.add.text(width * 0.9, height * 0.38, '▶', {
            fontFamily: 'Arial',
            fontSize: '50px',
            color: '#00d4ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        leftArrow.on('pointerover', () => { leftArrow.setScale(1.1); });
        leftArrow.on('pointerout', () => { leftArrow.setScale(1); });
        leftArrow.on('pointerdown', () => { this.changeIndex(-1); });
        
        rightArrow.on('pointerover', () => { rightArrow.setScale(1.1); });
        rightArrow.on('pointerout', () => { rightArrow.setScale(1); });
        rightArrow.on('pointerdown', () => { this.changeIndex(1); });

        // Personalización de color
        this.add.text(width / 2, height * 0.63, 'Personaliza color:', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#00d4ff',
            fontStyle: '600'
        }).setOrigin(0.5);
        
        const colorPalette = [
            { hex: 0xff5555, name: 'Rojo' },
            { hex: 0x5555ff, name: 'Azul' },
            { hex: 0x55ff55, name: 'Verde' },
            { hex: 0xffdd55, name: 'Amarillo' },
            { hex: 0xff1493, name: 'Rosa' }
        ];
        
        const colorStartX = width / 2 - 120;
        colorPalette.forEach((c, i) => {
            const btn = this.add.rectangle(colorStartX + i * 55, height * 0.70, 44, 44, c.hex, 1)
                .setStrokeStyle(2, 0xffffff, 0.4)
                .setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => { 
                btn.setScale(1.1);
                btn.setStrokeStyle(3, 0xffffff, 1);
            });
            btn.on('pointerout', () => { 
                btn.setScale(1);
                btn.setStrokeStyle(2, 0xffffff, 0.4);
            });
            
            btn.on('pointerdown', () => {
                this.setCustomization({ color: c.hex });
            });
        });

        // Botón iniciar partida - Mejorado
        const startBtn = this.add.rectangle(width / 2, height * 0.82, 240, 56, 0x00ff88, 0.15).setOrigin(0.5);
        startBtn.setStrokeStyle(2, 0x00ff88, 1);
        
        const startText = this.add.text(width / 2, height * 0.82, 'INICIAR PARTIDA', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#00ff88',
            fontStyle: '700'
        }).setOrigin(0.5);
        
        startBtn.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                startBtn.setFillStyle(0x00ff88, 0.25);
                startText.setScale(1.05);
            })
            .on('pointerout', () => {
                startBtn.setFillStyle(0x00ff88, 0.15);
                startText.setScale(1);
            })
            .on('pointerdown', () => {
                setSelectedCharacterIndex(this.index);
                this.registry.set('selectedCharacterIndex', this.index);
                this.tweens.add({ targets: startBtn, scale: 0.95, duration: 100, yoyo: true });
                this.time.delayedCall(150, () => {
                    this.scene.start('PlayScene');
                });
            });

        this.updatePreview();
    }

    changeIndex(dir) {
        this.index = Phaser.Math.Wrap(this.index + dir, 0, this.characters.length);
        this.updatePreview();
    }

    getCustomization() {
        if (!this.customizations[this.index]) {
            this.customizations[this.index] = {};
        }
        return this.customizations[this.index];
    }

    setCustomization(obj) {
        const cur = this.getCustomization();
        Object.assign(cur, obj);
        this.updatePreview();
    }

    updatePreview() {
        const char = this.characters[this.index];
        const custom = this.getCustomization();
        const color = custom.color || char.color;
        
        let tex = getCharacterTexture(this.index, this);
        
        if (tex.endsWith('_walk') || tex === 'sprite_caminar') {
            this.preview.setTexture(tex, 0);
        } else {
            this.preview.setTexture(tex);
        }
        
        const scale = getCharacterScale(this.index);
        this.preview.setScale(scale);
        this.preview.setTint(color);
        
        this.nameText.setText(char.name + (char.unlocked ? '' : ' (BLOQUEADO)'));
    }
}
