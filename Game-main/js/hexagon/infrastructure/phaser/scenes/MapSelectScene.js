import { playClickSfx } from '../services/audio.service.js';

export class MapSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectScene' });
        this.selectedIndex = 0;
        this.mapCards = [];
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.graphics();
        bg.fillStyle(0x0b1021, 1);
        bg.fillRect(0, 0, width, height);
        bg.destroy();

        this.add.text(width / 2, 62, 'SELECCION DE MAPA', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '44px',
            color: '#ffffff',
            stroke: '#4bb8ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, 104, 'Elige el mapa y luego presiona INICIAR', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#a7dfff'
        }).setOrigin(0.5);

        const maps = [
            { id: 0, name: 'MAPA 1', mapKey: 'mapa1', bgKey: 'bg', deathOverlayKey: 'life_lost_bg_sheet' },
            { id: 1, name: 'MAPA 2', mapKey: 'mapa2', bgKey: 'bg2', deathOverlayKey: null }
        ];

        const cardW = 430;
        const cardH = 270;
        const spacing = 520;
        const startX = (width / 2) - (spacing / 2);
        const y = height * 0.48;

        this.mapCards = maps.map((map, i) => {
            const x = startX + (i * spacing);
            const panel = this.add.rectangle(x, y, cardW, cardH, 0x111d40, 0.92)
                .setStrokeStyle(3, 0x6daeff, 0.75)
                .setInteractive({ useHandCursor: true });

            const preview = this.textures.exists(map.bgKey)
                ? this.add.image(x, y - 10, map.bgKey)
                : this.add.rectangle(x, y - 10, cardW - 24, cardH - 74, 0x24345f, 1);

            if (preview.setDisplaySize) preview.setDisplaySize(cardW - 24, cardH - 74);
            preview.setDepth(panel.depth + 1);

            const title = this.add.text(x, y + cardH / 2 - 24, map.name, {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '26px',
                color: '#ffffff',
                stroke: '#13264e',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(panel.depth + 2);

            panel.on('pointerdown', () => {
                playClickSfx(this);
                this.selectedIndex = i;
                this.refreshSelection();
            });

            return { ...map, panel, preview, title };
        });

        const backBtn = this.add.rectangle(102, 48, 160, 46, 0x112248, 0.9)
            .setStrokeStyle(2, 0xffde59, 1)
            .setInteractive({ useHandCursor: true });
        const backTxt = this.add.text(102, 48, 'VOLVER', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        backBtn.on('pointerdown', () => {
            playClickSfx(this);
            this.scene.start('SelectScene');
        });

        const startBtn = this.add.rectangle(width / 2, height - 70, 280, 62, 0x0a5f2e, 0.92)
            .setStrokeStyle(2, 0x9fe9b5, 1)
            .setInteractive({ useHandCursor: true });
        const startTxt = this.add.text(width / 2, height - 70, 'INICIAR', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '34px',
            color: '#ffffff'
        }).setOrigin(0.5);
        startBtn.on('pointerdown', () => {
            playClickSfx(this);
            const chosen = this.mapCards[this.selectedIndex] || this.mapCards[0];
            this.registry.set('selectedMap', {
                id: chosen.id,
                name: chosen.name,
                mapKey: chosen.mapKey,
                bgKey: chosen.bgKey,
                deathOverlayKey: chosen.deathOverlayKey
            });
            this.scene.start('PlayScene');
        });

        this.input.keyboard.on('keydown-ESC', () => this.scene.start('SelectScene'));
        this.refreshSelection();
        backTxt.setDepth(backBtn.depth + 1);
        startTxt.setDepth(startBtn.depth + 1);
    }

    refreshSelection() {
        this.mapCards.forEach((card, i) => {
            const selected = i === this.selectedIndex;
            card.panel.setStrokeStyle(selected ? 5 : 3, selected ? 0xffde59 : 0x6daeff, selected ? 1 : 0.75);
            card.panel.setFillStyle(selected ? 0x17295d : 0x111d40, selected ? 0.98 : 0.92);
            card.title.setColor(selected ? '#fff7d1' : '#ffffff');
        });
    }
}
