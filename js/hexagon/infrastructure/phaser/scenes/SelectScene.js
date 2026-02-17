import { playerName } from './MenuScene.js';
import { charactersData, getCharacterTexture } from '../../../domain/entities/Character.js';
import { playClickSfx } from '../services/audio.service.js';

export class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
        this.characters = charactersData;
        this.maxPlayers = 4;
        this.activePlayers = 1;
        this.focusSlotIndex = 0;
        this.characterCells = [];
        this.playerSlots = [];
        this.playButton = null;
        this.playButtonLabel = null;
        this.addPlayerButton = null;
        this.addPlayerLabel = null;
    }

    create() {
        const { width, height } = this.scale;
        this.activePlayers = 1;
        this.focusSlotIndex = 0;
        this.playerSlots = [];
        this.characterCells = [];

        this.drawBackground(width, height);
        this.createHeader(width, height);
        this.buildCharacterGrid(width, height);
        this.createPlayerSlots();
        this.buildPlayerCards(width, height);
        this.buildAddPlayerButton(width, height);
        this.buildPlayButton(width, height);
        this.bindDragEvents();
        this.refreshSlotsUI();
        this.refreshPlayButton();
    }

    drawBackground(width, height) {
        const g = this.add.graphics();
        g.fillStyle(0x0c1023, 1);
        g.fillRect(0, 0, width, height);
        g.destroy();

        this.add.circle(width * 0.10, height * 0.20, 170, 0x00d4ff, 0.08);
        this.add.circle(width * 0.92, height * 0.75, 190, 0xff4da6, 0.08);
        this.add.circle(width * 0.54, height * 0.12, 130, 0x7b61ff, 0.08);
    }

    createHeader(width, height) {
        this.add.text(width / 2, height * 0.06, 'SELECCION DE PERSONAJES', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '44px',
            color: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.11, 'Arrastra cada ficha P sobre un personaje', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#8fe8ff'
        }).setOrigin(0.5);

        const backBtn = this.add.rectangle(96, 48, 150, 44, 0x0e1f3d, 0.72)
            .setStrokeStyle(2, 0xffde59, 1)
            .setInteractive({ useHandCursor: true });
        this.add.text(96, 48, 'VOLVER', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#ffde59',
            strokeThickness: 2
        }).setOrigin(0.5);

        backBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: backBtn,
                scaleX: 0.94,
                scaleY: 0.94,
                duration: 90,
                yoyo: true,
                onComplete: () => this.scene.start('MenuScene')
            });
        });
    }

    buildCharacterGrid(width, height) {
        const cols = Math.min(5, this.characters.length);
        const rows = Math.ceil(this.characters.length / cols);
        const cellW = 200;
        const cellH = 148;
        const gapX = 24;
        const gapY = 20;
        const totalW = (cols * cellW) + ((cols - 1) * gapX);
        const startX = (width - totalW) / 2;
        const startY = height * 0.18;

        this.characterCells = [];

        this.characters.forEach((char, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cellW + gapX);
            const y = startY + row * (cellH + gapY);
            const cx = x + cellW / 2;
            const cy = y + cellH / 2;

            const bg = this.add.rectangle(cx, cy, cellW, cellH, 0x111a3b, 0.88)
                .setStrokeStyle(2, 0x5ea9ff, 0.65)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(cx, y + 12, char.name.toUpperCase(), {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5, 0);

            const previewKey = getCharacterTexture(index, this);
            const preview = this.add.image(cx, cy + 22, previewKey, 0).setOrigin(0.5);
            const frameWidth = preview.frame?.width || 64;
            const frameHeight = preview.frame?.height || 64;
            const previewScale = Math.min((cellW * 0.54) / frameWidth, (cellH * 0.62) / frameHeight);
            preview.setScale(previewScale);

            const cell = { index, bg, label, bounds: new Phaser.Geom.Rectangle(x, y, cellW, cellH) };
            this.characterCells.push(cell);

            bg.on('pointerover', () => this.highlightCharacter(index));
            bg.on('pointerout', () => this.clearCharacterHover());
            bg.on('pointerdown', () => this.assignFocusedSlot(index));
        });
    }

    createPlayerSlots() {
        const tokenColors = [0x4db8ff, 0xff6666, 0xffdd55, 0x5dff8b];
        this.playerSlots = [];

        for (let i = 0; i < this.maxPlayers; i += 1) {
            this.playerSlots.push({
                index: i,
                active: i === 0,
                characterIndex: null,
                name: i === 0 ? (playerName || 'Jugador') : `Jugador ${i + 1}`,
                isCpu: false,
                tokenColor: tokenColors[i],
                ui: null
            });
        }
    }

    buildPlayerCards(width, height) {
        const cardTextureKeys = ['player_card_1', 'player_card_2', 'player_card_3', 'player_card_4'];
        const cardW = 280;
        const cardH = 176;
        const startX = width * 0.16;
        const spacing = width * 0.22;
        const y = height * 0.79;

        this.playerSlots.forEach((slot, i) => {
            const x = startX + i * spacing;
            const cardKey = cardTextureKeys[i];
            const cardBase = this.textures.exists(cardKey)
                ? this.add.image(x, y, cardKey).setDisplaySize(cardW, cardH)
                : this.add.rectangle(x, y, cardW, cardH, 0x1a254d, 0.95).setStrokeStyle(2, 0xffffff, 0.55);

            if (cardBase.setInteractive) cardBase.setInteractive({ useHandCursor: true });

            const characterName = this.add.text(x, y - cardH / 2 + 18, 'ELIGE PERSONAJE', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#041230',
                strokeThickness: 2
            }).setOrigin(0.5);

            const portraitWindowW = 124;
            const portraitWindowH = 80;
            const portraitX = x;
            const portraitY = y - 4;
            const portrait = this.add.image(portraitX, portraitY + 18, 'personaje1').setVisible(false);
            const maskGraphics = this.add.graphics();
            maskGraphics.fillStyle(0xffffff, 1);
            maskGraphics.fillRect(
                portraitX - portraitWindowW / 2,
                portraitY - portraitWindowH / 2,
                portraitWindowW,
                portraitWindowH
            );
            maskGraphics.setVisible(false);
            portrait.setMask(maskGraphics.createGeometryMask());

            const namePlate = this.add.rectangle(x, y + cardH / 2 - 21, 164, 28, 0x0b1733, 0.88)
                .setStrokeStyle(2, 0xffffff, 0.45);
            const playerNameText = this.add.text(x, y + cardH / 2 - 21, slot.name, {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '17px',
                color: '#ffffff'
            }).setOrigin(0.5);
            const cpuBtn = this.add.rectangle(x + cardW / 2 - 52, y - cardH / 2 + 20, 84, 28, 0x14345d, 0.92)
                .setStrokeStyle(2, 0x7fb8ff, 0.9)
                .setInteractive({ useHandCursor: true });
            const cpuTxt = this.add.text(cpuBtn.x, cpuBtn.y, 'HUMANO', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);

            const token = this.createPlayerToken(slot, x, y);

            if (cardBase.on) {
                cardBase.on('pointerdown', () => {
                    this.focusSlotIndex = slot.index;
                    this.refreshSlotFocus();
                });
            }
            cpuBtn.on('pointerdown', () => {
                if (slot.index === 0) return; // P1 siempre humano
                slot.isCpu = !slot.isCpu;
                playClickSfx(this);
                this.refreshSlotCard(slot);
            });

            slot.ui = {
                x,
                y,
                cardW,
                cardH,
                cardBase,
                characterName,
                portrait,
                portraitWindowW,
                portraitWindowH,
                namePlate,
                playerNameText,
                cpuBtn,
                cpuTxt,
                token,
                maskGraphics
            };
        });
    }

    createPlayerToken(slot, x, y) {
        const token = this.add.container(x, y);
        const circle = this.add.circle(0, 0, 23, slot.tokenColor, 1).setStrokeStyle(3, 0xffffff, 1);
        const text = this.add.text(0, 0, `P${slot.index + 1}`, {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '20px',
            color: '#101010'
        }).setOrigin(0.5);
        token.add([circle, text]);
        token.setSize(48, 48);
        token.setInteractive({ useHandCursor: true });
        token.slotRef = slot;
        this.input.setDraggable(token);
        return token;
    }

    buildAddPlayerButton(width, height) {
        const x = width - 140;
        const y = height * 0.82;

        this.addPlayerButton = this.add.circle(x, y, 30, 0x1b2f66, 1)
            .setStrokeStyle(3, 0x8fe8ff, 1)
            .setInteractive({ useHandCursor: true });
        this.addPlayerLabel = this.add.text(x, y, '+', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '34px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(x, y + 46, 'Agregar jugador', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#8fe8ff'
        }).setOrigin(0.5);

        this.addPlayerButton.on('pointerdown', () => this.addPlayerSlot());
        this.addPlayerButton.on('pointerdown', () => playClickSfx(this));
    }

    buildPlayButton(width, height) {
        this.playButton = this.add.rectangle(width / 2, height * 0.94, 250, 58, 0x0f2f1f, 0.42)
            .setStrokeStyle(2, 0x9fe9b5, 0.5);
        this.playButtonLabel = this.add.text(width / 2, height * 0.94, 'PLAY', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '30px',
            color: '#8aa091'
        }).setOrigin(0.5);
    }

    bindDragEvents() {
        this.input.on('dragstart', (pointer, gameObject) => {
            if (!gameObject.slotRef || !gameObject.slotRef.active) return;
            this.focusSlotIndex = gameObject.slotRef.index;
            this.refreshSlotFocus();
            gameObject.setDepth(2000);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!gameObject.slotRef || !gameObject.slotRef.active) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.updateCharacterHover(dragX, dragY);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (!gameObject.slotRef || !gameObject.slotRef.active) return;

            const targetCell = this.getCharacterCellAt(gameObject.x, gameObject.y);
            if (targetCell) {
                gameObject.slotRef.characterIndex = targetCell.index;
                this.placeTokenOnCharacter(gameObject.slotRef, targetCell.index);
            } else if (gameObject.slotRef.characterIndex !== null && gameObject.slotRef.characterIndex !== undefined) {
                this.placeTokenOnCharacter(gameObject.slotRef, gameObject.slotRef.characterIndex);
            } else {
                this.snapTokenToCard(gameObject.slotRef);
            }

            gameObject.setDepth(1000);
            this.clearCharacterHover();
            this.refreshSlotCard(gameObject.slotRef);
            this.refreshPlayButton();
        });
    }

    assignFocusedSlot(characterIndex) {
        const slot = this.playerSlots[this.focusSlotIndex];
        if (!slot || !slot.active) return;
        slot.characterIndex = characterIndex;
        this.placeTokenOnCharacter(slot, characterIndex);
        this.refreshSlotCard(slot);
        this.refreshPlayButton();
    }

    getCharacterCellAt(x, y) {
        return this.characterCells.find((cell) => cell.bounds.contains(x, y)) || null;
    }

    updateCharacterHover(x, y) {
        const cell = this.getCharacterCellAt(x, y);
        if (!cell) {
            this.clearCharacterHover();
            return;
        }
        this.highlightCharacter(cell.index);
    }

    highlightCharacter(index) {
        this.characterCells.forEach((cell) => {
            if (cell.index === index) {
                cell.bg.setStrokeStyle(4, 0xffde59, 1);
            } else {
                cell.bg.setStrokeStyle(2, 0x5ea9ff, 0.65);
            }
        });
    }

    clearCharacterHover() {
        this.characterCells.forEach((cell) => {
            cell.bg.setStrokeStyle(2, 0x5ea9ff, 0.65);
        });
    }

    addPlayerSlot() {
        if (this.activePlayers >= this.maxPlayers) return;
        const nextSlot = this.playerSlots.find((slot) => !slot.active);
        if (!nextSlot) return;
        nextSlot.active = true;
        nextSlot.characterIndex = null;
        this.activePlayers += 1;
        this.focusSlotIndex = nextSlot.index;
        this.refreshSlotsUI();
        this.refreshPlayButton();
    }

    snapTokenToCard(slot) {
        if (!slot?.ui?.token) return;
        slot.ui.token.setPosition(slot.ui.x, slot.ui.y);
    }

    placeTokenOnCharacter(slot, characterIndex) {
        if (!slot?.ui?.token) return;
        const cell = this.characterCells.find((c) => c.index === characterIndex);
        if (!cell) {
            this.snapTokenToCard(slot);
            return;
        }
        slot.ui.token.setPosition(cell.bounds.centerX, cell.bounds.centerY - 44);
    }

    refreshSlotCard(slot) {
        if (!slot || !slot.ui) return;
        const ui = slot.ui;

        if (!slot.active) {
            ui.cardBase.setVisible(false);
            ui.characterName.setVisible(false);
            ui.portrait.setVisible(false);
            ui.namePlate.setVisible(false);
            ui.playerNameText.setVisible(false);
            ui.cpuBtn.setVisible(false);
            ui.cpuTxt.setVisible(false);
            ui.token.setVisible(false);
            return;
        }

        ui.cardBase.setVisible(true);
        ui.characterName.setVisible(true);
        ui.namePlate.setVisible(true);
        ui.playerNameText.setVisible(true);
        ui.cpuBtn.setVisible(true);
        ui.cpuTxt.setVisible(true);
        ui.token.setVisible(true);
        ui.playerNameText.setText(slot.name);
        if (slot.index === 0) {
            slot.isCpu = false;
            ui.cpuBtn.setFillStyle(0x2d3a4f, 0.92).setStrokeStyle(2, 0x8a9db9, 0.9);
            ui.cpuTxt.setText('P1').setColor('#e2ecff');
        } else if (slot.isCpu) {
            ui.cpuBtn.setFillStyle(0x3f173f, 0.95).setStrokeStyle(2, 0xff7cff, 1);
            ui.cpuTxt.setText('IA').setColor('#ffd7ff');
        } else {
            ui.cpuBtn.setFillStyle(0x14345d, 0.92).setStrokeStyle(2, 0x7fb8ff, 0.9);
            ui.cpuTxt.setText('HUMANO').setColor('#ffffff');
        }

        if (slot.characterIndex === null || slot.characterIndex === undefined) {
            ui.characterName.setText('ELIGE PERSONAJE');
            ui.portrait.setVisible(false);
            return;
        }

        const char = this.characters[slot.characterIndex];
        const tex = getCharacterTexture(slot.characterIndex, this);
        ui.characterName.setText((char?.name || 'PERSONAJE').toUpperCase());
        if (tex.endsWith('_sheet')) ui.portrait.setTexture(tex, 0);
        else ui.portrait.setTexture(tex);

        const fw = ui.portrait.frame?.width || 64;
        const fh = ui.portrait.frame?.height || 64;
        const scale = Math.max(ui.portraitWindowW / fw, ui.portraitWindowH / fh) * 1.25;
        ui.portrait.setScale(scale);
        ui.portrait.setPosition(ui.x, ui.y + 18);
        ui.portrait.setVisible(true);
    }

    refreshSlotFocus() {
        this.playerSlots.forEach((slot) => {
            if (!slot.ui?.namePlate || !slot.active) return;
            if (slot.index === this.focusSlotIndex) {
                slot.ui.namePlate.setStrokeStyle(3, 0xffde59, 1);
            } else {
                slot.ui.namePlate.setStrokeStyle(2, 0xffffff, 0.45);
            }
        });
    }

    refreshSlotsUI() {
        this.playerSlots.forEach((slot) => {
            this.refreshSlotCard(slot);
            if (!slot.active) return;
            if (slot.characterIndex !== null && slot.characterIndex !== undefined) {
                this.placeTokenOnCharacter(slot, slot.characterIndex);
            } else {
                this.snapTokenToCard(slot);
            }
        });

        this.refreshSlotFocus();

        const canAddMore = this.activePlayers < this.maxPlayers;
        if (this.addPlayerButton) {
            this.addPlayerButton.setFillStyle(canAddMore ? 0x1b2f66 : 0x373737, 1);
            this.addPlayerButton.disableInteractive();
            if (canAddMore) this.addPlayerButton.setInteractive({ useHandCursor: true });
        }
        if (this.addPlayerLabel) this.addPlayerLabel.setAlpha(canAddMore ? 1 : 0.5);
    }

    areActiveSlotsReady() {
        const activeSlots = this.playerSlots.filter((slot) => slot.active);
        if (activeSlots.length === 0) return false;
        return activeSlots.every((slot) => slot.characterIndex !== null && slot.characterIndex !== undefined);
    }

    refreshPlayButton() {
        const enabled = this.areActiveSlotsReady();
        if (!this.playButton || !this.playButtonLabel) return;

        this.playButton.removeAllListeners('pointerdown');
        this.playButton.disableInteractive();

        if (enabled) {
            this.playButton.setFillStyle(0x0a5f2e, 0.9);
            this.playButton.setStrokeStyle(2, 0x9fe9b5, 1);
            this.playButtonLabel.setColor('#ffffff');
            this.playButton.setInteractive({ useHandCursor: true });
            this.playButton.once('pointerdown', () => this.startMatch());
        } else {
            this.playButton.setFillStyle(0x252525, 0.7);
            this.playButton.setStrokeStyle(2, 0x7a7a7a, 0.55);
            this.playButtonLabel.setColor('#8a8a8a');
        }
    }

    startMatch() {
        const selectedPlayers = this.playerSlots
            .filter((slot) => slot.active)
            .map((slot) => ({
                slot: slot.index + 1,
                playerName: slot.name,
                characterIndex: slot.characterIndex,
                isCpu: !!slot.isCpu
            }));

        this.registry.set('selectedPlayers', selectedPlayers);

        const firstCharacter = selectedPlayers[0]?.characterIndex ?? 0;
        this.registry.set('selectedCharacterIndex', firstCharacter);
        this.scene.start('MapSelectScene');
    }
}
