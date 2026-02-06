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
        const { width } = this.scale;

        // Nombre del jugador
        this.add.text(width / 2, 40, playerName || 'JUGADOR', {
            fontSize: '22px',
            color: '#00ffcc'
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

        this.preview = this.add.image(width / 2, 220, 'char').setOrigin(0.5);
        this.nameText = this.add.text(width / 2, 320, '', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Flechas de navegación
        const left = this.add.text(width / 2 - 180, 220, '<', {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        
        const right = this.add.text(width / 2 + 180, 220, '>', {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        
        left.on('pointerdown', () => { this.changeIndex(-1); });
        right.on('pointerdown', () => { this.changeIndex(1); });

        // Personalización de color
        this.add.text(width / 2, 380, 'Personaliza color:', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        const colors = [0xff5555, 0x5555ff, 0x55ff55, 0xffdd55, 0xffffff];
        colors.forEach((c, i) => {
            const btn = this.add.rectangle(width / 2 - 100 + i * 50, 420, 36, 36, c)
                .setStrokeStyle(2, 0x000000)
                .setInteractive();
            btn.on('pointerdown', () => {
                this.setCustomization({ color: c });
            });
        });

        // Botón iniciar partida
        const start = this.add.text(width / 2, 540, 'INICIAR PARTIDA', {
            fontSize: '20px',
            color: '#00ffcc',
            backgroundColor: '#222',
            padding: 10
        }).setOrigin(0.5).setInteractive();
        
        start.on('pointerdown', () => {
            setSelectedCharacterIndex(this.index);
            // Asegurar que SelectScene tenga el índice antes de iniciar PlayScene
            this.registry.set('selectedCharacterIndex', this.index);
            this.scene.start('PlayScene');
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
