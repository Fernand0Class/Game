/* ==============================
   Smash 2D - game.js
   - PreloadScene: carga audio y assets
   - MenuScene: entrada nombre, fullscreen y música
   - SelectScene: selección y personalización de personajes
   - PlayScene: escena principal del juego
   ============================== */

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

let playerName = "";
let selectedCharacterIndex = 0;

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.audio('bgm', ['audio/musica retro.mp3']);
        this.load.image('personaje1', 'Personajes/Personaje 1.png');
        this.load.image('personaje2', 'Personajes/Personaje 2.png');
        this.load.spritesheet('sprite_caminar', 'sprites/Sprite Caminar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('sprite_respirar', 'sprites/sprite respirar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('bg', 'Textures/Imagen de fonder.png');
        this.load.spritesheet('tileset', 'Tiles/Tileset.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const defaultVolume = 0.2;
        const music = this.sound.add('bgm', { loop: true, volume: defaultVolume });
        this.registry.set('bgm', music);
        this.registry.set('volume', defaultVolume);
        this.registry.set('muted', false);

        if (this.textures.exists('personaje2') && typeof document !== 'undefined') {
            try {
                const src = this.textures.get('personaje2').getSourceImage();
                const w = src.width;
                const h = src.height;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(src, 0, 0);
                const imgData = ctx.getImageData(0, 0, w, h);
                const data = imgData.data;
                const r0 = data[0], g0 = data[1], b0 = data[2];
                const threshold = 60;
                for (let i = 0; i < data.length; i += 4) {
                    const dr = Math.abs(data[i] - r0);
                    const dg = Math.abs(data[i + 1] - g0);
                    const db = Math.abs(data[i + 2] - b0);
                    if (dr + dg + db < threshold) {
                        data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                this.textures.addCanvas('personaje2_clean', canvas);
            } catch (e) {
                console.warn('No se pudo limpiar Personaje 2:', e);
            }
        }

        if (this.textures.exists('sprite_caminar')) {
            try {
                const total = this.textures.get('sprite_caminar').frameTotal;
                const end = Math.max(0, total - 1);
                if (!this.anims.exists('sprite_caminar')) {
                    this.anims.create({
                        key: 'sprite_caminar',
                        frames: this.anims.generateFrameNumbers('sprite_caminar', { start: 0, end }),
                        frameRate: 10,
                        repeat: -1
                    });
                }
            } catch (e) {
                console.warn('No se pudo crear animación sprite_caminar:', e);
            }
        }

        if (this.textures.exists('sprite_respirar')) {
            try {
                const total = this.textures.get('sprite_respirar').frameTotal;
                const end = Math.max(0, total - 1);
                if (!this.anims.exists('sprite_respirar')) {
                    this.anims.create({
                        key: 'sprite_respirar',
                        frames: this.anims.generateFrameNumbers('sprite_respirar', { start: 0, end }),
                        frameRate: 4,
                        repeat: -1
                    });
                }
            } catch (e) {
                console.warn('No se pudo crear animación sprite_respirar:', e);
            }
        }

        try {
            const ld = document.getElementById('loading');
            if (ld) ld.style.display = 'none';
        } catch (e) { }

        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 80, 'SMASH 2D', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5);

        const nameText = this.add.text(width / 2, 200, '_', { fontSize: '24px', backgroundColor: '#222', padding: 10 }).setOrigin(0.5);

        // Asegurar que el canvas pueda recibir foco y eventos de teclado
        if (this.game && this.game.canvas) {
            this.game.canvas.setAttribute('tabindex', '0');
            this.game.canvas.focus();
        }

        // Empezar música al primer input por restricciones de autoplay en navegadores
        const tryPlayMusic = () => {
            const music = this.registry.get('bgm');
            if (music && !music.isPlaying) music.play();
            this.input.off('pointerdown', tryPlayMusic);
            this.input.keyboard.off('keydown', tryPlayMusic);
        };
        this.input.on('pointerdown', tryPlayMusic);
        this.input.keyboard.on('keydown', tryPlayMusic);

        const keyHandler = (event) => {
            if (event.key === 'keyup' || event.key === 'Shift' || event.key === 'Alt' || event.key === 'Control' || event.key === 'Meta') {
                playerName = playerName.slice(0, -1);
            } else if (event.key === 'Enter' && playerName.length > 0) {
                this.scene.start('SelectScene');
            } else if (playerName.length < 10 && event.key.length === 1) {
                playerName += event.key;
            }
            nameText.setText(playerName || '_');
        };

        this.input.keyboard.on('keydown', keyHandler);

        this.add.text(width / 2, 300, 'Presiona ENTER para continuar', { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);

        // Botón de fullscreen
        const fsButton = this.add.text(width - 20, 20, '[Pantalla completa]', { fontSize: '14px', color: '#00ffcc' }).setOrigin(1, 0).setInteractive();
        fsButton.on('pointerdown', () => {
            if (!this.scale.isFullscreen) this.scale.startFullscreen(); else this.scale.stopFullscreen();
        });

        // Mostrar nota de control
        this.add.text(20, height - 40, 'Flechas: mover | Espacio: saltar', { fontSize: '14px', color: '#cccccc' }).setOrigin(0, 0);

        // Controles de volumen (bajar/subir + silencio)
        const volText = this.add.text(width / 2, height - 100, 'Volumen: ' + Math.round((this.registry.get('volume') || 0.2) * 100) + '%', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
        const minus = this.add.text(width / 2 - 80, height - 60, '-', { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
        const mute = this.add.text(width / 2, height - 60, this.registry.get('muted') ? '🔇' : '🔈', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
        const plus = this.add.text(width / 2 + 80, height - 60, '+', { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5).setInteractive();

        const updateVolumeDisplay = () => {
            const v = this.registry.get('volume') ?? 0.2;
            volText.setText('Volumen: ' + Math.round(v * 100) + '%');
            const music = this.registry.get('bgm');
            const muted = this.registry.get('muted');
            if (music) {
                music.setVolume(muted ? 0 : v);
                music.setMute(!!muted);
            }
            mute.setText(muted ? '🔇' : '🔈');
        };

        minus.on('pointerdown', () => {
            let v = (this.registry.get('volume') || 0.2) - 0.1;
            v = Phaser.Math.Clamp(Number(v.toFixed(2)), 0, 1);
            this.registry.set('volume', v);
            this.registry.set('muted', false);
            updateVolumeDisplay();
        });
        plus.on('pointerdown', () => {
            let v = (this.registry.get('volume') || 0.2) + 0.1;
            v = Phaser.Math.Clamp(Number(v.toFixed(2)), 0, 1);
            this.registry.set('volume', v);
            this.registry.set('muted', false);
            updateVolumeDisplay();
        });
        mute.on('pointerdown', () => {
            const m = !this.registry.get('muted');
            this.registry.set('muted', m);
            updateVolumeDisplay();
        });

        // Inicializar display de volumen
        updateVolumeDisplay();
    }
}

class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });

        this.characters = [
            { name: 'Personaje 1', color: 0xffffff, unlocked: true, texture: 'personaje1' },
            { name: 'Personaje 2', color: 0xffffff, unlocked: true, texture: 'personaje2' },
            { name: 'Rayo', color: 0xff5555, unlocked: true },
            { name: 'Sombra', color: 0x5555ff, unlocked: true },
            { name: 'Verde', color: 0x55ff55, unlocked: false },
            { name: 'Dorado', color: 0xffdd55, unlocked: false }
        ];

        this.customizations = []; // guarda personalizaciones por personaje
    }

    create() {
        const { width } = this.scale;

        // Nombre del jugador arriba
        this.add.text(width / 2, 40, playerName || 'JUGADOR', { fontSize: '22px', color: '#00ffcc' }).setOrigin(0.5);

        // Índice y mostrar personaje
        this.index = selectedCharacterIndex || 0;

        // Crear textura simple para personajes (si no existe)
        if (!this.textures.exists('char')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRoundedRect(0, 0, 80, 100, 10);
            g.generateTexture('char', 80, 100);
            g.destroy();
        }

        this.preview = this.add.image(width / 2, 220, 'char').setOrigin(0.5);
        this.nameText = this.add.text(width / 2, 320, '', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

        // Flechas para cambiar
        const left = this.add.text(width / 2 - 180, 220, '<', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
        const right = this.add.text(width / 2 + 180, 220, '>', { fontSize: '40px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
        left.on('pointerdown', () => { this.changeIndex(-1); });
        right.on('pointerdown', () => { this.changeIndex(1); });

        // Personalización: colores predefinidos
        this.add.text(width / 2, 380, 'Personaliza color:', { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
        const colors = [0xff5555, 0x5555ff, 0x55ff55, 0xffdd55, 0xffffff];
        colors.forEach((c, i) => {
            const btn = this.add.rectangle(width / 2 - 100 + i * 50, 420, 36, 36, c).setStrokeStyle(2, 0x000000).setInteractive();
            btn.on('pointerdown', () => {
                this.setCustomization({ color: c });
            });
        });

        // Sombrero opcional
        this.hatText = this.add.text(width / 2, 470, 'Sombrero: No', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5).setInteractive();
        this.hatText.on('pointerdown', () => {
            const cur = this.getCustomization().hat || false;
            this.setCustomization({ hat: !cur });
        });

        // Botón iniciar partida
        const start = this.add.text(width / 2, 540, 'INICIAR PARTIDA', { fontSize: '20px', color: '#00ffcc', backgroundColor: '#222', padding: 10 }).setOrigin(0.5).setInteractive();
        start.on('pointerdown', () => {
            selectedCharacterIndex = this.index;
            this.scene.start('PlayScene');
        });

        this.updatePreview();
    }

    changeIndex(dir) {
        this.index = Phaser.Math.Wrap(this.index + dir, 0, this.characters.length);
        this.updatePreview();
    }

    getCustomization() {
        if (!this.customizations[this.index]) this.customizations[this.index] = {};
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
        // Selección de textura: preferimos versión limpia si existe
        let tex = 'char';
        if (char.texture) {
            // Preferir versión limpia
            if (this.textures.exists(char.texture + '_clean')) tex = char.texture + '_clean';
            // Si hay spritesheet de caminata, usar el spritesheet (frame 0)
            else if (this.textures.exists(char.texture + '_walk')) tex = char.texture + '_walk';
            else if (this.textures.exists(char.texture)) tex = char.texture;
        }
        // Si es spritesheet, poner frame 0
        if (tex.endsWith('_walk')) this.preview.setTexture(tex, 0);
        else this.preview.setTexture(tex);
        // Escalar vista previa para que el personaje se vea más grande en el menú
        let previewScale = 1.2;
        if (tex === 'char') previewScale = 1.2;
        else if (tex.endsWith('_walk') || tex.endsWith('_respirar')) previewScale = 1.6;
        else previewScale = 1.3;
        this.preview.setScale(previewScale);
        this.preview.setTint(color);
        this.nameText.setText(char.name + (char.unlocked ? '' : ' (BLOQUEADO)'));
        this.hatText.setText('Sombrero: ' + (custom.hat ? 'Sí' : 'No'));
    }
}

class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const { width, height } = this.scale;

        if (this.textures.exists('bg')) {
            this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height).setScrollFactor(0);
        } else {
            this.cameras.main.setBackgroundColor('#1b1b2f');
        }

        const platforms = this.physics.add.staticGroup();

        // Plataforma 1: base grande en el medio (Y = height - 80)
        for (let x = width / 2 - 192; x < width / 2 + 192; x += 32) {
            platforms.create(x, height - 80, 'tileset').setOrigin(0, 1).refreshBody();
        }

        // Plataforma 2: izquierda (Y = height - 180)
        for (let x = width / 2 - 280 - 96; x < width / 2 - 280 + 96; x += 32) {
            platforms.create(x, height - 180, 'tileset').setOrigin(0, 1).refreshBody();
        }

        // Plataforma 3: derecha (Y = height - 210)
        for (let x = width / 2 + 200 - 96; x < width / 2 + 200 + 96; x += 32) {
            platforms.create(x, height - 210, 'tileset').setOrigin(0, 1).refreshBody();
        }

        // Plataforma 4: encima (Y = height - 340)
        for (let x = width / 2 - 64; x < width / 2 + 64; x += 32) {
            platforms.create(x, height - 340, 'tileset').setOrigin(0, 1).refreshBody();
        }

        this.physics.world.setBounds(0, 0, width, height);

        this.lives = 3;
        this.spawnPoint = { x: width / 2, y: height - 140 };
        this.livesText = this.add.text(20, 50, 'Vidas: ' + this.lives, { fontSize: '18px', color: '#ffdddd' });

        const chars = this.scene.get('SelectScene').characters;
        const custom = this.scene.get('SelectScene').customizations[selectedCharacterIndex] || {};
        const base = chars[selectedCharacterIndex] || chars[0];
        const color = custom.color || base.color;

        let textureKey = 'char';
        if (base.texture) {
            if (base.texture === 'personaje2' && this.textures.exists('sprite_caminar')) textureKey = 'sprite_caminar';
            else if (this.textures.exists(base.texture + '_clean')) textureKey = base.texture + '_clean';
            else if (this.textures.exists(base.texture)) textureKey = base.texture;
        }

        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, textureKey).setTint(color).setCollideWorldBounds(true);
        if (textureKey === 'char') {
            this.player.setScale(1.6);
        } else if (textureKey.endsWith('_walk')) {
            this.player.setScale(2.0);
        } else {
            this.player.setScale(1.4);
        }

        if (this.player.body && this.player.body.setSize) {
            const w = this.player.displayWidth;
            const h = this.player.displayHeight;
            const bw = Math.round(w * 0.45);
            const bh = Math.round(h * 0.6);
            this.player.body.setSize(bw, bh);
            const oy = Math.round((h - bh) * 0.4);
            this.player.body.setOffset(Math.round((w - bw) / 2), oy);
        }

        // Sombrero deshabilitado

        this.physics.add.collider(this.player, platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.text(20, 20, 'Presiona ESC para volver al menú', { fontSize: '14px', color: '#ffffff' });

        const music = this.registry.get('bgm');
        if (music && !music.isPlaying) music.play();
        if (music) {
            music.setVolume(this.registry.get('volume') ?? 0.2);
            music.setMute(!!this.registry.get('muted'));
        }

        const muteBtn = this.add.text(width - 20, 20 + 30, this.registry.get('muted') ? '🔇' : '🔈', { fontSize: '20px', color: '#ffffff' }).setOrigin(1, 0).setInteractive();
        muteBtn.on('pointerdown', () => {
            const m = !this.registry.get('muted');
            this.registry.set('muted', m);
            const music = this.registry.get('bgm');
            if (music) music.setMute(m);
            muteBtn.setText(m ? '🔇' : '🔈');
        });

        this.isDying = false;
        this.loseLife = () => {
            if (this.isDying) return;
            this.isDying = true;
            this.lives -= 1;
            this.livesText.setText('Vidas: ' + this.lives);
            if (this.lives > 0) {
                this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
                this.player.setVelocity(0, 0);
                setTimeout(() => { this.isDying = false; }, 800);
            } else {
                this.add.text(width / 2, height / 2, 'GAME OVER', { fontSize: '48px', color: '#ff4444' }).setOrigin(0.5);
                setTimeout(() => { this.scene.start('MenuScene'); }, 1500);
            }
        };
    }

    update() {
        if (!this.player) return;

        const { height } = this.scale;
        // Si te caes de la isla mueres (pierdes una vida)
        if (this.player.y > height + 150) {
            this.loseLife();
            return; // prevenir acciones mientras respawneando
        }

        const speed = 200;
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            // animación caminar sólo si está en el suelo
            if (this.player.body.onFloor() && this.anims.exists('sprite_caminar')) {
                this.player.anims.play('sprite_caminar', true);
            }
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            if (this.player.body.onFloor() && this.anims.exists('sprite_caminar')) {
                this.player.anims.play('sprite_caminar', true);
            }
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            // si hay animación de respirar, reproducirla
            if (this.player.body.onFloor() && this.anims.exists('sprite_respirar')) {
                this.player.anims.play('sprite_respirar', true);
            } else if (this.anims.exists('sprite_caminar')) {
                // detener animación y poner frame de reposo
                this.player.anims.stop();
                this.player.setFrame(0);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.onFloor()) {
            this.player.setVelocityY(-360);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1200,
        height: 600
    },
    scene: [PreloadScene, MenuScene, SelectScene, PlayScene],
    physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: true } }
};

new Phaser.Game(config);

