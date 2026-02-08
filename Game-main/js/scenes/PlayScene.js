import { createAllPlatforms } from '../assets/platforms.js';
import { playWalkAnimation, playIdleAnimation, stopAnimation } from '../assets/animations.js';
import { playAudio, syncAudio, toggleMute } from '../assets/audio.js';
import { getCharacter, getCharacterTexture, getCharacterScale, getCharacterBodyConfig } from '../assets/characters.js';
import { getSpawnPoint, hasPlayerFallenOffWorld, makePlayerJump, movePlayer, resetPlayerVelocityX } from '../assets/playerUtils.js';

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
        const selectScene = this.scene.get('SelectScene');
        // Obtener el índice del registro (más confiable) o de la escena
        let selectedCharacterIndex = this.registry.get('selectedCharacterIndex');
        if (selectedCharacterIndex === undefined || selectedCharacterIndex === null) {
            selectedCharacterIndex = selectScene?.index || 0;
        }
        const chars = selectScene?.characters || [];
        const custom = selectScene?.customizations?.[selectedCharacterIndex] || {};
        const base = chars[selectedCharacterIndex] || { color: 0xffffff };
        const color = custom.color || base.color;

        const textureKey = getCharacterTexture(selectedCharacterIndex, this);
        this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, textureKey)
            .setTint(color)
            .setCollideWorldBounds(true);
        
        const scale = getCharacterScale(selectedCharacterIndex);
        this.player.setScale(scale);
        
        // Guardar índice del personaje en el sprite para usarlo en update
        this.player.characterIndex = selectedCharacterIndex;
        
        // Configurar hitbox específica del personaje
        const bodyConfig = getCharacterBodyConfig(selectedCharacterIndex);
        this.player.body.setSize(bodyConfig.width, bodyConfig.height);
        
        // COLISIÓN UNIFICADA: Todos los personajes usan la misma configuración
        const standardCollisionConfig = {
            widthPercent: 0.30,
            heightPercent: 0.55,
            offsetYPercent: 0.34,
            offsetXPercent: -0.15
        };
        
        const w = this.player.displayWidth;
        const h = this.player.displayHeight;
        const bw = Math.round(w * standardCollisionConfig.widthPercent);
        const bh = Math.round(h * standardCollisionConfig.heightPercent);
        this.player.body.setSize(bw, bh);
        
        const centerX = Math.round((w - bw) / 2);
        const offsetXAdjust = Math.round(w * standardCollisionConfig.offsetXPercent);
        const ox = centerX + offsetXAdjust;
        const oy = Math.round((h - bh) * standardCollisionConfig.offsetYPercent);
        
        this.player.body.setOffset(ox, oy);

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
        
        // Rastrear estado del salto para detectar cambios de colisión
        this.wasJumping = false;
        this.isSaltoLanded = false;
        this.fallAnimationTime = 0;  // Controlar cuándo termina la animación de caída
        
        // Sistema de doble salto
        this.jumpsRemaining = 2;  // Cantidad de saltos disponibles
    }

    update() {
        if (!this.player) return;

        const { height } = this.scale;

        // Verificar si cayó del mundo
        if (hasPlayerFallenOffWorld(this.player, height)) {
            this.loseLife();
            return;
        }

        // Detectar si está en colisión con el suelo
        const isOnGround = this.player.body.onFloor();
        const isJumping = !isOnGround;

        // ========== LÓGICA DE ANIMACIONES BASADA EN COLISIÓN ==========
        
        // Si está EN EL SUELO (colisión activa)
        if (isOnGround) {
            // Verificar si ACABA DE ATERRIZAR después de saltar
            if (this.wasJumping && !this.isSaltoLanded) {
                // ATERRIZAJE: Mostrar animación de caída
                if (this.player.characterIndex === 0) {
                    // Cambiar a spritesheet de caída
                    if (this.player.texture.key !== 'personaje1_jump_fall') {
                        this.player.setTexture('personaje1_jump_fall');
                        this.player.setScale(getCharacterScale(this.player.characterIndex));
                    }
                    if (this.anims.exists('personaje1_jump_fall')) {
                        this.player.anims.play('personaje1_jump_fall', true);
                    }
                }
                this.fallAnimationTime = this.time.now + 300;  // Esperar 0.3 segundos
                this.isSaltoLanded = true;  // Marcar que ya se mostró
            }
            // Solo cambiar a otras animaciones si ya pasó la animación de caída (2 segundos)
            else if (this.time.now >= this.fallAnimationTime) {
                // Si está en el suelo y se mueve horizontalmente, mostrar caminar
                if (this.cursors.left.isDown || this.cursors.right.isDown) {
                    // CAMINAR: Mostrar animación de caminar (como antes)
                    playWalkAnimation(this.player, this, this.player.characterIndex);
                } else {
                    // REPOSO: Mostrar idle (como antes)
                    playIdleAnimation(this.player, this, this.player.characterIndex);
                }
            }
        }
        // Si está EN EL AIRE (sin colisión)
        else {
            // Mostrar sprite-aire-personaje1 con frames específicos según dirección
            if (this.player.characterIndex === 0) {
                // Determinar si está subiendo o bajando
                const isMovingUp = this.player.body.velocity.y < -50;
                const isMovingDown = this.player.body.velocity.y > 50;
                
                // Detectar si está muy cerca del suelo (dentro de ~170 píxeles)
                const isNearGround = this.player.y > this.scale.height - 170;
                
                if (isMovingDown && isNearGround && this.player.texture.key !== 'personaje1_jump_fall') {
                    // CASI TOCANDO SUELO: Comenzar animación de caída
                    this.player.setTexture('personaje1_jump_fall');
                    this.player.setScale(getCharacterScale(this.player.characterIndex));
                    if (this.anims.exists('personaje1_jump_fall')) {
                        this.player.anims.play('personaje1_jump_fall', true);
                    }
                } else if (this.player.texture.key !== 'personaje1_jump_air') {
                    // Por defecto mostrar sprite de aire
                    this.player.setTexture('personaje1_jump_air');
                    this.player.setScale(getCharacterScale(this.player.characterIndex));
                    
                    if (isMovingUp) {
                        // ASCENSO: Mostrar primer frame (frame 0)
                        this.player.setFrame(0);
                    } else if (isMovingDown) {
                        // CAÍDA: Mostrar segundo frame (frame 1)
                        this.player.setFrame(1);
                    } else {
                        // PICO del salto: Mostrar primer frame
                        this.player.setFrame(0);
                    }
                }
            }
        }

        // ========== CONTROLES DE MOVIMIENTO ==========
        if (this.cursors.left.isDown) {
            movePlayer(this.player, 'left');
        } else if (this.cursors.right.isDown) {
            movePlayer(this.player, 'right');
        } else {
            resetPlayerVelocityX(this.player);
        }

        // ========== SALTO ==========
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            const isOnGround = this.player.body.onFloor();
            
            if (isOnGround) {
                // PRIMER SALTO (desde el suelo)
                if (this.player.characterIndex === 0) {
                    if (this.anims.exists('personaje1_jump_ground')) {
                        this.player.anims.play('personaje1_jump_ground', true);
                    }
                }
                makePlayerJump(this.player);
                this.wasJumping = true;
                this.isSaltoLanded = false;
                this.jumpsRemaining = 1;  // Queda 1 salto (doble salto)
            } else if (this.jumpsRemaining > 0) {
                // DOBLE SALTO (en el aire)
                makePlayerJump(this.player);
                this.jumpsRemaining -= 1;
                this.wasJumping = true;
            }
        }
        
        // Restaurar saltos cuando aterriza en el suelo
        if (isOnGround && !this.wasJumping) {
            this.jumpsRemaining = 2;
        }
        
        // Actualizar estado de salto
        this.wasJumping = isJumping;

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
