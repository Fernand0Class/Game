import { playAudio, setVolume, syncAudio, playClickSfx, playRayoSfx, setBgmTrack } from '../services/audio.service.js';

let playerName = 'Jugador';

export { playerName };
export function setPlayerName(name) {
    playerName = name;
}

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.nameInputEl = null;
        this.menuContainer = null;
        this.settingsPanel = null;
        this.controlsPanel = null;
        this.volumePanel = null;
        this.volumeFill = null;
        this.volumeIcon = null;
        this.playerNameText = null;
    }

    create() {
        const baseWidth = Number(this.game.config.width) || 1800;
        const baseHeight = Number(this.game.config.height) || 900;
        if (this.scale.width !== baseWidth || this.scale.height !== baseHeight) {
            this.scale.resize(baseWidth, baseHeight);
            this.cameras.main.setSize(baseWidth, baseHeight);
            this.cameras.main.setBounds(0, 0, baseWidth, baseHeight);
        }

        const { width, height } = this.scale;

        this.drawBackground(width, height);
        setBgmTrack(this, 'menu');
        playAudio(this);
        syncAudio(this);

        this.menuContainer = this.add.container(0, 0).setVisible(false);
        this.buildQuadrantMenu(width, height);
        if (this.playerNameText) this.playerNameText.setText(playerName || 'Jugador');
        const hasConfirmedName = !!this.registry.get('menuNameConfirmed');
        if (hasConfirmedName) {
            this.menuContainer.setVisible(true);
        } else {
            this.showNameInput();
        }

        this.events.once('shutdown', () => {
            this.removeNameInput();
        });
    }

    drawBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillStyle(0x0b1229, 1);
        bg.fillRect(0, 0, width, height);
        bg.destroy();

        this.add.circle(width * 0.16, height * 0.20, 160, 0x00d4ff, 0.09);
        this.add.circle(width * 0.84, height * 0.24, 160, 0xffde59, 0.09);
        this.add.circle(width * 0.50, height * 0.86, 220, 0x29ff9b, 0.05);

        this.add.text(width / 2, height * 0.08, 'SMASH MENU', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '56px',
            color: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.playerNameText = this.add.text(width / 2, height * 0.15, '', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '24px',
            color: '#29ff9b'
        }).setOrigin(0.5);
    }

    buildQuadrantMenu(width, height) {
        const centerX = width / 2;
        const leftColumnX = centerX - 390;
        const rightColumnX = centerX + 390;
        const anchors = {
            play: { x: leftColumnX, y: height * 0.30 },
            rename: { x: rightColumnX, y: height * 0.70 },
            rightColumn: { x: rightColumnX, y: height * 0.50 },
            settings: { x: rightColumnX, y: height * 0.32 },
            controls: { x: leftColumnX, y: height * 0.70 }
        };

        this.ensurePlayHoverAnimations();

        // Subcuadro 1: PLAY (mas grande y distinto)
        const playGroup = this.add.container(0, 0);
        const playCenterX = anchors.play.x;
        const playCenterY = anchors.play.y;
        const playBgScale = 1.0;
        const playBg = this.textures.exists('menu_play_bg')
            ? this.add.image(playCenterX, playCenterY, 'menu_play_bg')
            : this.add.rectangle(playCenterX, playCenterY, 400, 180, 0x13214a, 0.55).setStrokeStyle(2, 0x7fb8ff, 0.7);
        playBg.setScale(playBgScale);
        const playHitWidth = Math.max(80, playBg.displayWidth || playBg.width || 400);
        const playHitHeight = Math.max(80, playBg.displayHeight || playBg.height || 180);
        const playContentOffsetX = -54;

        const playRayoStatic = this.add.image(playCenterX + playContentOffsetX, playCenterY, 'menu_play_rayo_estatico')
            .setScale(1);
        const playTextStatic = this.add.image(playCenterX + playContentOffsetX, playCenterY, 'menu_play_texto_estatico')
            .setScale(1);

        const playRayoAnim = this.add.sprite(playCenterX + playContentOffsetX, playCenterY, 'menu_play_rayo_anim', 0)
            .setScale(1)
            .setVisible(false);
        const playTextAnim = this.add.sprite(playCenterX + playContentOffsetX, playCenterY, 'menu_play_texto_anim', 0)
            .setScale(1)
            .setVisible(false);

        const fitCover = (node, targetW, targetH) => {
            const fw = node.frame?.realWidth || node.width || 1;
            const fh = node.frame?.realHeight || node.height || 1;
            const s = Math.max(targetW / fw, targetH / fh);
            node.setScale(s);
        };
        // Elementos internos ligeramente mas grandes que el fondo para que sobresalgan, sin deformar.
        fitCover(playRayoStatic, playHitWidth * 0.60, playHitHeight * 1.06);
        fitCover(playRayoAnim, playHitWidth * 0.60, playHitHeight * 1.06);
        fitCover(playTextStatic, playHitWidth * 0.62, playHitHeight * 1.08);
        fitCover(playTextAnim, playHitWidth * 0.62, playHitHeight * 1.08);

        const playHoverText = this.add.text(playCenterX, playCenterY + (playHitHeight * 0.52), 'CLICK PARA JUGAR', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '18px',
            color: '#d8f3ff',
            stroke: '#0b2740',
            strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0);

        const playHitArea = this.add.rectangle(playCenterX, playCenterY, playHitWidth, playHitHeight, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true });

        playHitArea.on('pointerover', () => {
            playRayoSfx(this);
            this.input.setDefaultCursor('pointer');
            playRayoStatic.setVisible(false);
            playTextStatic.setVisible(false);
            playRayoAnim.setVisible(true).play('menu_play_rayo_anim_loop', true);
            playTextAnim.setVisible(true).play('menu_play_texto_anim_once', true);
            playBg.setScale(playBgScale * 1.02);
            playHoverText.setAlpha(1);
        });

        playHitArea.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            playRayoAnim.stop().setVisible(false);
            playTextAnim.stop().setVisible(false);
            playRayoStatic.setVisible(true);
            playTextStatic.setVisible(true);
            playBg.setScale(playBgScale);
            playHoverText.setAlpha(0);
        });

        playTextAnim.on('animationcomplete-menu_play_texto_anim_once', () => {
            playTextAnim.setVisible(false);
            playTextStatic.setVisible(true);
        });

        playHitArea.on('pointerdown', () => {
            playClickSfx(this);
            this.tweens.add({
                targets: [playRayoStatic, playTextStatic, playRayoAnim, playTextAnim],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 90,
                yoyo: true,
                onComplete: () => this.scene.start('SelectScene')
            });
        });

        playGroup.add([
            playBg,
            playRayoStatic,
            playRayoAnim,
            playTextStatic,
            playTextAnim,
            playHitArea,
            playHoverText
        ]);

        // Subcuadro 2: settings 4 botones (bordes tenues)
        const settingsGroup = this.add.container(0, 0);
        const rightColumnExtraWidth = 180;
        const rightColumnShiftX = rightColumnExtraWidth / 2;
        const rightBgCenterX = anchors.rightColumn.x + rightColumnShiftX;

        const rightColumnBg = this.textures.exists('menu_panel_bg')
            ? this.add.image(rightBgCenterX, anchors.rightColumn.y, 'menu_panel_bg')
            : this.add.rectangle(rightBgCenterX, anchors.rightColumn.y, 320 + rightColumnExtraWidth, 500, 0x0d162c, 0.22).setStrokeStyle(2, 0x7fb8ff, 0.55);
        if (this.textures.exists('menu_panel_bg')) {
            rightColumnBg.setDisplaySize(
                (rightColumnBg.displayWidth || rightColumnBg.width || 320) + rightColumnExtraWidth,
                rightColumnBg.displayHeight || rightColumnBg.height || 500
            );
        }
        const columnCenterX = anchors.rightColumn.x;
        const settingsRowY = anchors.rightColumn.y - 120;
        const gap = 96;

        const settingsBtn = this.createIconButton(columnCenterX - (gap / 2), settingsRowY, '\u2699', 0x7fb8ff, 0.6);
        const soundBtn = this.createIconButton(columnCenterX + (gap / 2), settingsRowY, this.getVolumeIcon(), 0x7fb8ff, 0.55);
        this.volumeIcon = soundBtn.icon;

        this.bindPulseClick(settingsBtn.bg, () => this.toggleSettingsPanel());
        this.bindPulseClick(soundBtn.bg, () => this.toggleVolumePanel(soundBtn.bg.x, soundBtn.bg.y));

        this.volumePanel = this.buildVolumePanel(soundBtn.bg.x, soundBtn.bg.y + 58);

        settingsGroup.add([
            rightColumnBg,
            settingsBtn.bg, settingsBtn.icon,
            soundBtn.bg, soundBtn.icon,
            this.volumePanel
        ]);

        // Subcuadro 3: Controles solo icono (sin fondo)
        const controlsGroup = this.add.container(0, 0);
        const controlsCenterX = anchors.controls.x;
        const controlsCenterY = anchors.controls.y;
        const controlsIconOffsetX = -34;
        const controlsIconOffsetY = 14;
        const controlsBgScale = 1.78;
        const controlsIconScale = 1.92;
        const controlsBg = this.textures.exists('menu_controls_bg')
            ? this.add.image(controlsCenterX, controlsCenterY, 'menu_controls_bg')
            : null;
        if (controlsBg) {
            controlsBg.setScale(controlsBgScale);
            controlsBg.setPosition(controlsCenterX, controlsCenterY);
        }
        const controlsIcon = this.textures.exists('menu_controls_icon')
            ? this.add.image(controlsCenterX + controlsIconOffsetX, controlsCenterY + controlsIconOffsetY, 'menu_controls_icon')
            : this.add.text(controlsCenterX + controlsIconOffsetX, controlsCenterY + controlsIconOffsetY, 'CONTROLES', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#29ff9b',
                strokeThickness: 2
            }).setOrigin(0.5);
        if (controlsIcon.setScale) {
            controlsIcon.setScale(controlsIconScale);
            controlsIcon.setPosition(controlsCenterX + controlsIconOffsetX, controlsCenterY + controlsIconOffsetY);
        }

        controlsIcon.setInteractive({ useHandCursor: true });

        const controlsHoverText = this.add.text(controlsCenterX + controlsIconOffsetX, controlsCenterY + controlsIconOffsetY + 84, 'CLICK PARA VER', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '18px',
            color: '#b9ffdd',
            stroke: '#0e2f20',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0);

        controlsIcon.on('pointerover', () => {
            controlsIcon.setScale(controlsIconScale * 1.08);
            controlsHoverText.setAlpha(1);
        });
        controlsIcon.on('pointerout', () => {
            controlsIcon.setScale(controlsIconScale);
            controlsHoverText.setAlpha(0);
        });
        controlsIcon.on('pointerdown', () => {
            playClickSfx(this);
            if (this.scene.isSleeping('ControlsConfigScene')) {
                this.scene.wake('ControlsConfigScene');
            } else if (!this.scene.isActive('ControlsConfigScene')) {
                this.scene.launch('ControlsConfigScene');
            }
            this.scene.sleep();
        });

        controlsGroup.add([
            ...(controlsBg ? [controlsBg] : []),
            controlsIcon,
            controlsHoverText
        ]);

        // Subcuadro 4: Cambio de nombre
        const renameGroup = this.add.container(0, 0);
        const renameBox = this.add.rectangle(anchors.rightColumn.x, anchors.rightColumn.y + 152, 220, 78, 0x0f2b1d, 0.10)
            .setStrokeStyle(2, 0x7dffb2, 0.8)
            .setInteractive({ useHandCursor: true });
        const renameTxt = this.add.text(renameBox.x, renameBox.y, 'CAMBIAR NOMBRE', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#0f4f2f',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.bindPulseClick(renameBox, () => this.showNameInput());

        renameGroup.add([renameBox, renameTxt]);

        // Panels
        this.settingsPanel = this.buildInfoPanel(width, height, 'SETTINGS', [
            'Tuerca: opciones de sistema',
            'Sonido: abre barra de volumen'
        ]);

        this.controlsPanel = this.buildInfoPanel(width, height, 'CONTROLES', [
            'Mover: Flechas Izq / Der',
            'Saltar: Espacio',
            'Salir partida: ESC'
        ]);

        this.menuContainer.add([
            playGroup,
            settingsGroup,
            controlsGroup,
            renameGroup,
            this.settingsPanel,
            this.controlsPanel
        ]);
    }

    ensurePlayHoverAnimations() {
        if (!this.anims.exists('menu_play_rayo_anim_loop') && this.textures.exists('menu_play_rayo_anim')) {
            const totalRayoLoop = this.textures.get('menu_play_rayo_anim').frameTotal;
            this.anims.create({
                key: 'menu_play_rayo_anim_loop',
                frames: this.anims.generateFrameNumbers('menu_play_rayo_anim', {
                    start: 0,
                    end: Math.max(0, totalRayoLoop - 1)
                }),
                frameRate: 40,
                repeat: -1
            });
        }

        if (!this.anims.exists('menu_play_rayo_anim_once') && this.textures.exists('menu_play_rayo_anim')) {
            const totalRayo = this.textures.get('menu_play_rayo_anim').frameTotal;
            this.anims.create({
                key: 'menu_play_rayo_anim_once',
                frames: this.anims.generateFrameNumbers('menu_play_rayo_anim', {
                    start: 0,
                    end: Math.max(0, totalRayo - 1)
                }),
                frameRate: 24,
                repeat: 0
            });
        }

        if (!this.anims.exists('menu_play_texto_anim_once') && this.textures.exists('menu_play_texto_anim')) {
            const totalTexto = this.textures.get('menu_play_texto_anim').frameTotal;
            this.anims.create({
                key: 'menu_play_texto_anim_once',
                frames: this.anims.generateFrameNumbers('menu_play_texto_anim', {
                    start: 0,
                    end: Math.max(0, totalTexto - 1)
                }),
                frameRate: 24,
                repeat: 0
            });
        }
    }

    createIconButton(x, y, iconText, color, alpha) {
        const bg = this.add.rectangle(x, y, 58, 58, 0x0d162c, 0.55)
            .setStrokeStyle(2, color, alpha)
            .setInteractive({ useHandCursor: true });
        const icon = this.add.text(x, y, iconText, {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        return { bg, icon };
    }

    bindPulseClick(target, action) {
        target.on('pointerdown', () => {
            this.tweens.add({
                targets: target,
                scaleX: 0.93,
                scaleY: 0.93,
                duration: 90,
                yoyo: true,
                onComplete: action
            });
        });
    }

    buildVolumePanel(x, y) {
        const panel = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 130, 28, 0x02060f, 0.92).setStrokeStyle(1, 0x7fb8ff, 0.7);
        const barBg = this.add.rectangle(0, 0, 96, 8, 0x28405f, 0.85);
        const fill = this.add.rectangle(-48, 0, 60, 8, 0x29ff9b, 0.95).setOrigin(0, 0.5);

        const hitArea = this.add.rectangle(0, 0, 110, 18, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', (pointer) => {
            const localX = Phaser.Math.Clamp(pointer.x - (x - 48), 0, 96);
            const volume = localX / 96;
            setVolume(this, volume);
            this.refreshVolumeUI();
        });

        panel.add([bg, barBg, fill, hitArea]);
        panel.setVisible(false);
        this.volumeFill = fill;
        this.refreshVolumeUI();

        return panel;
    }

    refreshVolumeUI() {
        const volume = Phaser.Math.Clamp(this.registry.get('volume') ?? 0.6, 0, 1);
        if (this.volumeFill) {
            this.volumeFill.width = Math.max(4, 96 * volume);
        }
        if (this.volumeIcon) {
            this.volumeIcon.setText(this.getVolumeIcon());
        }
    }

    toggleVolumePanel(x, y) {
        if (!this.volumePanel) return;
        this.settingsPanel.setVisible(false);
        this.controlsPanel.setVisible(false);
        this.volumePanel.setPosition(x, y - 58);
        this.volumePanel.setVisible(!this.volumePanel.visible);
        this.refreshVolumeUI();
    }

    buildInfoPanel(width, height, title, lines) {
        const panel = this.add.container(width / 2, height / 2);
        const backplate = this.add.polygon(0, 0, [0, -130, 220, -60, 220, 60, 0, 130, -220, 60, -220, -60], 0x050b1a, 0.95)
            .setStrokeStyle(2, 0x00d4ff, 1);

        const titleText = this.add.text(0, -72, title, {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const content = this.add.text(-165, -22, lines.join('\n'), {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#dbe9ff'
        });

        const backBtn = this.add.rectangle(0, 86, 132, 40, 0x0d203f, 0.9)
            .setStrokeStyle(2, 0xffde59, 1)
            .setInteractive({ useHandCursor: true });
        const backTxt = this.add.text(0, 86, 'VOLVER', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#ffde59',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.bindPulseClick(backBtn, () => panel.setVisible(false));

        panel.add([backplate, titleText, content, backBtn, backTxt]);
        panel.setVisible(false);
        return panel;
    }

    toggleSettingsPanel() {
        if (!this.settingsPanel) return;
        if (this.controlsPanel) this.controlsPanel.setVisible(false);
        if (this.volumePanel) this.volumePanel.setVisible(false);
        this.settingsPanel.setVisible(!this.settingsPanel.visible);
    }

    toggleControlsPanel() {
        if (!this.controlsPanel) return;
        if (this.settingsPanel) this.settingsPanel.setVisible(false);
        if (this.volumePanel) this.volumePanel.setVisible(false);
        this.controlsPanel.setVisible(!this.controlsPanel.visible);
    }

    getVolumeIcon() {
        const volume = this.registry.get('volume') ?? 0.6;
        if (volume <= 0.01) return '\ud83d\udd07';
        if (volume < 0.34) return '\ud83d\udd08';
        if (volume < 0.67) return '\ud83d\udd09';
        return '\ud83d\udd0a';
    }

    showNameInput() {
        this.removeNameInput();
        if (this.menuContainer) this.menuContainer.setVisible(false);

        if (typeof document === 'undefined' || !document.body) {
            if (this.playerNameText) this.playerNameText.setText(playerName || 'Jugador');
            if (this.menuContainer) this.menuContainer.setVisible(true);
            return;
        }

        let input = null;
        try {
            input = document.createElement('input');
        } catch (e) {
            if (this.playerNameText) this.playerNameText.setText(playerName || 'Jugador');
            if (this.menuContainer) this.menuContainer.setVisible(true);
            return;
        }

        input.type = 'text';
        input.placeholder = 'Ingresa tu nombre';
        input.maxLength = 20;
        input.value = playerName || '';

        input.style.position = 'fixed';
        input.style.left = '50%';
        input.style.top = '50%';
        input.style.transform = 'translate(-50%, -50%)';
        input.style.width = '360px';
        input.style.padding = '14px 16px';
        input.style.fontSize = '20px';
        input.style.fontWeight = '700';
        input.style.fontFamily = 'Impact, Arial Black, sans-serif';
        input.style.border = '3px solid #00d4ff';
        input.style.background = '#091024';
        input.style.color = '#ffffff';
        input.style.zIndex = '9999';
        input.style.outline = 'none';

        try {
            document.body.appendChild(input);
        } catch (e) {
            if (this.playerNameText) this.playerNameText.setText(playerName || 'Jugador');
            if (this.menuContainer) this.menuContainer.setVisible(true);
            return;
        }
        input.focus();
        this.nameInputEl = input;

        const confirmName = () => {
            const finalName = input.value.trim() || 'Jugador';
            setPlayerName(finalName);
            this.registry.set('menuNameConfirmed', true);
            if (this.playerNameText) this.playerNameText.setText(finalName);
            this.removeNameInput();
            if (this.menuContainer) this.menuContainer.setVisible(true);
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmName();
        });
    }

    removeNameInput() {
        if (this.nameInputEl && document.body.contains(this.nameInputEl)) {
            document.body.removeChild(this.nameInputEl);
        }
        this.nameInputEl = null;
    }
}
