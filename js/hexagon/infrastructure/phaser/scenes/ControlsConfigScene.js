const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'attack'];

const ACTION_LABELS = {
    left: 'LEFT',
    right: 'RIGHT',
    up: 'UP',
    down: 'DOWN',
    jump: 'JUMP',
    attack: 'ATTACK'
};

function buildDefaultControlsConfig() {
    return {
        players: [
            { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', attack: 'KeyJ' },
            { left: null, right: null, up: null, down: null, jump: null, attack: null },
            { left: null, right: null, up: null, down: null, jump: null, attack: null },
            { left: null, right: null, up: null, down: null, jump: null, attack: null }
        ]
    };
}

function toDisplayKey(code) {
    if (!code) return 'Sin asignar';
    if (code === 'Space') return 'SPACE';
    if (code.startsWith('Key')) return code.slice(3).toUpperCase();
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.slice(5).toUpperCase();
    return code.toUpperCase();
}

export function ensureControlsConfig(scene) {
    let cfg = scene.registry.get('controlsConfig');
    if (!cfg || !Array.isArray(cfg.players) || cfg.players.length < 4) {
        cfg = buildDefaultControlsConfig();
        scene.registry.set('controlsConfig', cfg);
    }
    return cfg;
}

export class ControlsConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlsConfigScene' });
        this.controlsConfig = null;
        this.selectedPlayerIndex = 0;
        this.actionRows = [];
        this.playerTabs = [];
        this.captureModal = null;
        this.captureText = null;
        this.captureAction = null;
        this.isCapturing = false;
        this.escHandler = null;
        this.captureKeyHandler = null;
    }

    create() {
        const { width, height } = this.scale;
        this.cleanupInputHandlers();
        this.controlsConfig = ensureControlsConfig(this);

        this.drawBackground(width, height);
        this.drawHeader(width);
        this.buildBackButton();
        this.buildPlayerTabs(width);
        this.buildActionRows(width, height);
        this.buildFooter(width, height);
        this.bindEscBehavior();
        this.bindSceneCleanup();
        this.events.on('wake', () => {
            this.stopKeyCapture(false);
            this.refreshPlayerTabs();
            this.refreshRows();
        });
        this.refreshPlayerTabs();
        this.refreshRows();
    }

    drawBackground(width, height) {
        const g = this.add.graphics();
        g.fillStyle(0x0b1229, 1);
        g.fillRect(0, 0, width, height);
        g.destroy();
        this.add.circle(width * 0.15, height * 0.20, 160, 0x00d4ff, 0.08);
        this.add.circle(width * 0.85, height * 0.28, 170, 0xffde59, 0.08);
        this.add.circle(width * 0.50, height * 0.82, 220, 0x29ff9b, 0.06);
    }

    drawHeader(width) {
        this.add.text(width / 2, 62, 'CONFIGURACION DE CONTROLES', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#00d4ff',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    buildBackButton() {
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
            this.stopKeyCapture(false);
            if (this.scene.isSleeping('MenuScene')) {
                this.scene.wake('MenuScene');
            } else if (!this.scene.isActive('MenuScene')) {
                this.scene.launch('MenuScene');
            }
            this.scene.sleep();
        });
    }

    buildPlayerTabs(width) {
        const panel = this.add.rectangle(width / 2, 150, 940, 96, 0x0d1a3a, 0.76)
            .setStrokeStyle(2, 0x7fb8ff, 0.9);

        const startX = width / 2 - 330;
        for (let i = 0; i < 4; i += 1) {
            const x = startX + i * 220;
            const tab = this.add.rectangle(x, 150, 180, 60, 0x13214a, 0.92)
                .setStrokeStyle(2, 0xffffff, 0.6)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(x, 150, `JUGADOR ${i + 1}`, {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);

            tab.on('pointerdown', () => {
                this.selectedPlayerIndex = i;
                this.refreshPlayerTabs();
                this.refreshRows();
            });
            this.playerTabs.push({ tab, label });
        }
        this.panelTop = panel;
    }

    buildActionRows(width, height) {
        const startY = 250;
        const rowGap = 72;

        ACTIONS.forEach((action, i) => {
            const y = startY + i * rowGap;
            const rowBg = this.add.rectangle(width / 2, y, 740, 54, 0x101b3d, 0.82)
                .setStrokeStyle(1, 0x4b6fbf, 0.8);
            const actionText = this.add.text(width / 2 - 320, y, `${ACTION_LABELS[action]}:`, {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '25px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            const keyBox = this.add.rectangle(width / 2 + 175, y, 240, 40, 0x08122f, 0.95)
                .setStrokeStyle(2, 0x89a9ff, 0.95)
                .setInteractive({ useHandCursor: true });
            const keyText = this.add.text(width / 2 + 175, y, '', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '22px',
                color: '#dff0ff'
            }).setOrigin(0.5);

            keyBox.on('pointerdown', () => this.startKeyCapture(action));
            this.actionRows.push({ action, rowBg, actionText, keyBox, keyText });
        });

        this.captureModal = this.add.rectangle(width / 2, height / 2, 560, 120, 0x050b1a, 0.96)
            .setStrokeStyle(3, 0xffde59, 1)
            .setVisible(false)
            .setDepth(2000);
        this.captureText = this.add.text(width / 2, height / 2, '', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '30px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false).setDepth(2001);
    }

    buildFooter(width, height) {
        this.add.text(width / 2, height - 56, 'ESC: cancelar asignacion actual | Usa VOLVER para regresar', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#9fd3ff'
        }).setOrigin(0.5);
    }

    bindEscBehavior() {
        this.escHandler = () => {
            if (this.isCapturing) {
                this.stopKeyCapture(false);
            }
        };
        this.input.keyboard.on('keydown-ESC', this.escHandler);
    }

    bindSceneCleanup() {
        this.events.once('shutdown', () => this.cleanupInputHandlers());
        this.events.once('destroy', () => this.cleanupInputHandlers());
    }

    cleanupInputHandlers() {
        if (this.input?.keyboard) {
            if (this.escHandler) {
                this.input.keyboard.off('keydown-ESC', this.escHandler);
            }
            if (this.captureKeyHandler) {
                this.input.keyboard.off('keydown', this.captureKeyHandler);
            }
        }
        this.escHandler = null;
        this.captureKeyHandler = null;
        this.isCapturing = false;
    }

    refreshPlayerTabs() {
        this.playerTabs.forEach((p, i) => {
            const active = i === this.selectedPlayerIndex;
            p.tab.setFillStyle(active ? 0x1e3d8b : 0x13214a, 0.95);
            p.tab.setStrokeStyle(2, active ? 0xffde59 : 0xffffff, active ? 1 : 0.6);
        });
    }

    refreshRows() {
        const playerCfg = this.controlsConfig.players[this.selectedPlayerIndex];
        this.actionRows.forEach((row) => {
            row.keyText.setText(toDisplayKey(playerCfg[row.action]));
            const unassigned = !playerCfg[row.action];
            row.keyText.setColor(unassigned ? '#ffb8b8' : '#dff0ff');
        });
    }

    startKeyCapture(action) {
        if (this.captureKeyHandler) {
            this.input.keyboard.off('keydown', this.captureKeyHandler);
            this.captureKeyHandler = null;
        }
        this.captureAction = action;
        this.isCapturing = true;
        this.captureModal.setVisible(true);
        this.captureText.setText(`Presiona una tecla para ${ACTION_LABELS[action]}\n(ESC cancela)`);
        this.captureText.setVisible(true);

        this.captureKeyHandler = (event) => {
            if (!this.isCapturing) return;
            if (!event || !event.code || event.code === 'Escape') {
                this.stopKeyCapture(false);
                return;
            }

            const playerCfg = this.controlsConfig.players[this.selectedPlayerIndex];
            playerCfg[action] = event.code;
            this.registry.set('controlsConfig', this.controlsConfig);
            this.stopKeyCapture(true);
            this.refreshRows();
        };
        this.input.keyboard.on('keydown', this.captureKeyHandler);
    }

    stopKeyCapture(applied) {
        this.isCapturing = false;
        this.captureAction = null;
        if (this.captureKeyHandler) {
            this.input.keyboard.off('keydown', this.captureKeyHandler);
            this.captureKeyHandler = null;
        }
        if (this.captureModal && this.captureModal.scene) this.captureModal.setVisible(false);
        if (this.captureText && this.captureText.scene) this.captureText.setVisible(false);
        if (applied) {
            this.cameras.main.flash(100, 40, 90, 40, false);
        }
    }
}
