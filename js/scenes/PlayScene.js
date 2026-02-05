import { selectedCharacterIndex } from './SelectScene.js';
import { createAllPlatforms } from '../assets/platforms.js';
import { playWalkAnimation, playIdleAnimation, stopAnimation } from '../assets/animations.js';
import { playAudio, syncAudio, toggleMute } from '../assets/audio.js';
import { getCharacter, getCharacterTexture, getCharacterScale } from '../assets/characters.js';
import { setupPlayerCollision, getSpawnPoint, hasPlayerFallenOffWorld, makePlayerJump, movePlayer, resetPlayerVelocityX } from '../assets/playerUtils.js';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Fondo
        if (this.textures.exists('bg')) {
            this.add.image(width / 2, height / 2, 'bg')
                .setDisplaySize(width, height)
                .setScrollFactor(0);
        } else {
            this.cameras.main.setBackgroundColor('#1b1b2f');
        }

        // Crear plataformas
        const platforms = createAllPlatforms(this, this.physics);
        
        // Configurar mundo
        this.physics.world.setBounds(0, 0, width, height);

        // Vidas
        this.lives = 3;
        this.spawnPoint = getSpawnPoint(width, height);
        this.livesText = this.add.text(20, 50, 'Vidas: ' + this.lives, {
            fontSize: '18px',
            color: '#ffdddd'
        });

        // Crear jugador
        const chars = this.scene.get('SelectScene').characters;
        const custom = this.scene.get('SelectScene').customizations[selectedCharacterIndex] || {};
        const base = chars[selectedCharacterIndex] || chars[0];
        const color = custom.color || base.color;

        const textureKey = getCharacterTexture(selectedCharacterIndex, this);
        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, textureKey)
            .setTint(color)
            .setCollideWorldBounds(true);
        
        const scale = getCharacterScale(textureKey);
        this.player.setScale(scale);
        
        // Configurar colisión del jugador
        setupPlayerCollision(this.player);

        // Colisiones con plataformas (normal, pero permitir atravesar desde abajo)
        this.physics.add.collider(this.player, platforms);
        this.platforms = platforms;

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.add.text(20, 20, 'Presiona ESC para volver al menú', {
            fontSize: '14px',
            color: '#ffffff'
        });

        // Audio
        playAudio(this);
        syncAudio(this);

        // Botón de mute
        const muteBtn = this.add.text(width - 20, 20 + 30, this.registry.get('muted') ? '🔇' : '🔈', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(1, 0).setInteractive();
        
        muteBtn.on('pointerdown', () => {
            const muted = toggleMute(this);
            muteBtn.setText(muted ? '🔇' : '🔈');
        });

        // Sistema de vidas
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
                this.add.text(width / 2, height / 2, 'GAME OVER', {
                    fontSize: '48px',
                    color: '#ff4444'
                }).setOrigin(0.5);
                setTimeout(() => { this.scene.start('MenuScene'); }, 1500);
            }
        };
    }

    update() {
        if (!this.player) return;

        const { height } = this.scale;

        // Verificar si cayó del mundo
        if (hasPlayerFallenOffWorld(this.player, height)) {
            this.loseLife();
            return;
        }

        // Controles de movimiento
        if (this.cursors.left.isDown) {
            movePlayer(this.player, 'left');
            playWalkAnimation(this.player, this);
        } else if (this.cursors.right.isDown) {
            movePlayer(this.player, 'right');
            playWalkAnimation(this.player, this);
        } else {
            resetPlayerVelocityX(this.player);
            playIdleAnimation(this.player, this);
        }

        // Salto
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            makePlayerJump(this.player);
        }

        // Lógica para permitir atravesar plataformas desde abajo
        this.platforms.children.entries.forEach((platform) => {
            const playerBottom = this.player.body.bottom;
            const platformTop = platform.body.top;
            const playerCenterY = this.player.body.center.y;
            
            // Si el jugador venía desde abajo saltando hacia arriba, permitir atravesar
            if (this.player.body.velocity.y < 0) {
                // Salto hacia arriba: separar al jugador de la plataforma temporalmente
                if (playerBottom < platformTop + 30) {
                    this.physics.overlap(this.player, platform, null, null, this);
                }
            }
        });
    }
}
