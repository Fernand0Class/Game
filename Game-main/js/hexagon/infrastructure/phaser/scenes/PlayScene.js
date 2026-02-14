import { playWalkAnimation, playIdleAnimation, playJumpAnimation } from '../services/animations.service.js';
import { playAudio, syncAudio, toggleMute, setBgmTrack, playJumpSfxForCharacter, playWalkSfxForCharacter, playDeathSfxForCharacter, playAttackSfxForCharacter, playLifeLostFxSfx } from '../services/audio.service.js';
import { getCharacterTexture, getCharacterScale, getCharacterAnimationConfig } from '../../../domain/entities/Character.js';
import {
    getSpawnPoint,
    hasPlayerFallenOffWorld,
    makePlayerJump,
    movePlayer,
    resetPlayerVelocityX,
    isPlayerGroundedByPair
} from '../services/playerUtils.service.js';

const ATTACK_PROFILE_BY_CHARACTER = {
    // hitFrameIndex usa indice de animacion 1-based: 2 = segundo frame.
    0: { activeFrames: [2], hitFrameIndex: 2, box: { forwardMin: -16, forwardMax: 118, vertical: 88 }, damageNear: 8, damageFar: 5 },
    1: { activeFrames: [1], hitFrameIndex: 1, box: { forwardMin: -16, forwardMax: 118, vertical: 88 }, damageNear: 8, damageFar: 5 },
    2: { activeFrames: [2], hitFrameIndex: 2, box: { forwardMin: -20, forwardMax: 135, vertical: 92 }, damageNear: 10, damageFar: 6 },
    3: { activeFrames: [2], hitFrameIndex: 2, box: { forwardMin: -16, forwardMax: 120, vertical: 88 }, damageNear: 8, damageFar: 5 },
    4: { activeFrames: [2], hitFrameIndex: 2, box: { forwardMin: -16, forwardMax: 126, vertical: 90 }, damageNear: 9, damageFar: 5 }
};

// Ajustes finos por personaje para hitbox de ataque basada en JSON (PhysicsEditor).
// Empieza configurando aqui Black and White (id 1).
const ATTACK_HITBOX_TUNING_BY_CHARACTER = {
    1: { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
};

export class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const { width, height } = this.scale;
        const selectedMap = this.registry.get('selectedMap') || {};
        const chosenMapKey = selectedMap.mapKey || 'mapa1';
        const chosenBgKey = selectedMap.bgKey || 'bg';
        const chosenDeathOverlayKey = selectedMap.deathOverlayKey || null;
        this.chosenDeathOverlayKey = chosenDeathOverlayKey;
        this.selectedMap = selectedMap;
        const mapKey = this.cache.tilemap.exists(chosenMapKey) ? chosenMapKey : 'mapa1';
        const bgKey = this.textures.exists(chosenBgKey) ? chosenBgKey : 'bg';
        // Escala entera para evitar seams/cortes de 1px entre tiles.
        const MAP_TILE_SCALE = 2;
        this.mapTileScale = MAP_TILE_SCALE;
        this.spawnObjects = [];
        this.extraPlayers = [];
        this.fighters = [];
        this.fighterByBody = new Map();
        this.hitCooldownByPair = new Map();
        this.walkSfxCooldownBySlot = new Map();
        this.matchEnded = false;
        this.backgroundFxChance = 0.06;
        this.backgroundFxCooldownMs = 3200;
        this.nextBackgroundFxAt = 0;
        this.attackDebugGraphics = this.add.graphics().setDepth(9998);
        this.attackHitboxSourceByCharacter = new Map([
            [1, this.cache.json.get('bw_attack_hitbox_shape') || null],
            [2, this.cache.json.get('titan_attack_hitbox_shape') || null],
            [3, this.cache.json.get('aurum_attack_hitbox_shape') || null]
        ]);
        this.PLATFORM_CATEGORY = 0x0001;
        this.PLAYER_CATEGORY = 0x0002;
        this.cameras.main.roundPixels = true;

        // Fondo
        if (this.textures.exists(bgKey)) {
            this.bgImage = this.add.image(width / 2, height / 2, bgKey)
                .setDisplaySize(width, height)
                .setScrollFactor(0)
                .setDepth(-1000);
            this.bgDepth = this.bgImage.depth;
        } else {
            this.cameras.main.setBackgroundColor('#1b1b2f');
            this.bgDepth = -100;
        }

        // Crear mapa desde Tiled (Matter)
        const map = this.make.tilemap({ key: mapKey });
        if (map) {
            const tileset = map.addTilesetImage('Plataformas', 'tilesetImage');
            const layerName = map.layers?.[0]?.name;
            const groundLayer = (layerName && tileset) ? map.createLayer(layerName, tileset, 0, 0) : null;

            if (groundLayer) {
                groundLayer.setScale(MAP_TILE_SCALE);
                groundLayer.setCollisionByExclusion([0, -1]);
                const tiles = groundLayer.getTilesWithin(0, 0, map.width, map.height, { isColliding: true });

                // Crear colision Matter escalada tile por tile para mantener sync visual/fisica.
                tiles.forEach((tile) => {
                    const tw = map.tileWidth * MAP_TILE_SCALE;
                    const th = map.tileHeight * MAP_TILE_SCALE;
                    const tx = (tile.pixelX * MAP_TILE_SCALE) + (tw / 2);
                    const ty = (tile.pixelY * MAP_TILE_SCALE) + (th / 2);

                    const body = this.matter.add.rectangle(tx, ty, tw, th, {
                        isStatic: true
                    });
                    body.label = 'platform';
                    body.collisionFilter.category = this.PLATFORM_CATEGORY;
                    body.collisionFilter.mask = this.PLAYER_CATEGORY;
                });

                const worldWidth = (map.widthInPixels * MAP_TILE_SCALE) || width;
                const worldHeight = (map.heightInPixels * MAP_TILE_SCALE) || height;
                // Sin borde inferior para permitir caida fuera del mundo.
                this.matter.world.setBounds(0, 0, worldWidth, worldHeight, 64, true, true, true, false);
                this.scale.resize(worldWidth, worldHeight);
                this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
                this.cameras.main.setSize(worldWidth, worldHeight);
                if (this.bgImage) {
                    this.bgImage.setPosition(worldWidth / 2, worldHeight / 2);
                    this.bgImage.setDisplaySize(worldWidth, worldHeight);
                }

                // Spawns desde object layer "spawns"
                const spawnsLayer = map.getObjectLayer('spawns');
                this.spawnObjects = spawnsLayer?.objects || [];
                this.spawnPoint = this.resolveSpawnPoint(1, getSpawnPoint(width, height));
            } else {
                this.matter.world.setBounds(0, 0, width, height, 64, true, true, true, false);
                this.scale.resize(width, height);
                this.cameras.main.setBounds(0, 0, width, height);
                this.cameras.main.setSize(width, height);
                this.spawnPoint = getSpawnPoint(width, height);
            }
        } else {
            this.matter.world.setBounds(0, 0, width, height, 64, true, true, true, false);
            this.scale.resize(width, height);
            this.cameras.main.setBounds(0, 0, width, height);
            this.cameras.main.setSize(width, height);
            this.spawnPoint = getSpawnPoint(width, height);
        }

        if (!this.spawnPoint) this.spawnPoint = getSpawnPoint(width, height);

        // Crear jugador
        const selectScene = this.scene.get('SelectScene');
        let selectedCharacterIndex = this.registry.get('selectedCharacterIndex');
        let selectedPlayers = this.registry.get('selectedPlayers') || [];
        if (!Array.isArray(selectedPlayers) || selectedPlayers.length === 0) {
            selectedPlayers = [{
                slot: 1,
                playerName: 'Jugador 1',
                characterIndex: selectedCharacterIndex ?? 0
            }];
        }
        if ((selectedCharacterIndex === undefined || selectedCharacterIndex === null) && selectedPlayers.length > 0) {
            selectedCharacterIndex = selectedPlayers[0].characterIndex;
        }
        if (selectedCharacterIndex === undefined || selectedCharacterIndex === null) {
            selectedCharacterIndex = selectScene?.index || 0;
        }

        const chars = selectScene?.characters || [];
        const base = chars[selectedCharacterIndex] || { color: 0xffffff, allowTint: false };
        const color = base.color;

        let textureKey = getCharacterTexture(selectedCharacterIndex, this);
        if (selectedCharacterIndex === 1 && this.textures.exists('bw_walk_sheet')) {
            // Personaje 2 usa spritesheet como base para alinear animaciones + hitbox PhysicsEditor.
            textureKey = 'bw_walk_sheet';
        }
        this.player = this.matter.add.sprite(this.spawnPoint.x, this.spawnPoint.y, textureKey);
        this.player.setOrigin(0.5, 0.5);
        this.player.body.label = 'player';

        if (base.allowTint && color !== 0xffffff && color !== '#ffffff') this.player.setTint(color);

        const scale = getCharacterScale(selectedCharacterIndex);
        this.playerBaseScale = scale;
        this.player.characterIndex = selectedCharacterIndex;
        this.playerFacing = 'right';
        this.playerUsesCustomShape = false;
        this.playerCanSwapCollisionByFacing = false;
        this.playerShapeRight = null;
        this.playerShapeLeft = null;

        // Hitbox unificada en Matter
        const standardCollisionConfig = {
            widthPercent: 0.30,
            heightPercent: 0.55
        };

        const w = this.player.displayWidth;
        const h = this.player.displayHeight;
        const bw = Math.round(w * standardCollisionConfig.widthPercent);
        const bh = Math.round(h * standardCollisionConfig.heightPercent);
        let appliedPhysicsEditorShape = false;
        const shapePairMain = this.getCollisionShapePair(selectedCharacterIndex);
        if (shapePairMain?.right) {
            try {
                this.playerShapeRight = clonePhysicsShape(shapePairMain.right);
                // Evitar deformaciones: solo usar shape Left explicita (si existe).
                // Si no existe, mantener misma colision a ambos lados.
                this.playerShapeLeft = clonePhysicsShape(shapePairMain.left || shapePairMain.right);
                // Black and White (id 1): mantener colision fija para evitar deformacion al girar.
                this.playerCanSwapCollisionByFacing = (selectedCharacterIndex !== 1) && !!shapePairMain.left;
                this.playerUsesCustomShape = true;
                this.player.setBody(clonePhysicsShape(this.playerShapeRight));
                appliedPhysicsEditorShape = true;
            } catch (e) {
                console.warn('No se pudo aplicar shape de PhysicsEditor al jugador principal:', e);
            }
        }

        if (!appliedPhysicsEditorShape) {
            this.player.setRectangle(bw, Math.round(bh * 1.1));
        }

        this.applyFacingScale(this.playerBaseScale);
        this.player.setFixedRotation();
        this.player.setFriction(0.85);
        this.player.setFrictionStatic(6);
        this.player.setFrictionAir(0.02);
        this.player.setBounce(0);
        this.player.body.label = 'player';
        this.setPlayerCollisionFilter(this.player);
        const mainSelected = selectedPlayers.find((p) => p.slot === 1) || selectedPlayers[0];
        const mainState = {
            slot: 1,
            playerName: mainSelected?.playerName || 'Jugador 1',
            characterIndex: selectedCharacterIndex,
            sprite: this.player,
            facing: 'right',
            spawn: { x: this.spawnPoint.x, y: this.spawnPoint.y },
            lives: 3,
            percent: 0,
            eliminated: false,
            attackLockUntil: 0,
            attackActiveUntil: 0,
            attackHitFrameDone: false,
            attackHeld: false,
            pendingAttack: false,
            isAttacking: false,
            currentAttack: null,
            hitstunUntil: 0,
            baseFrictionAir: 0.02,
            attackedInCurrent: new Set(),
            hud: null
        };
        this.mainFighter = mainState;
        this.fighters.push(mainState);

        // Jugadores extra (si se agregaron en seleccion): cada uno usa su spawn correspondiente.
        selectedPlayers
            .filter((p) => p.slot > 1)
            .forEach((p) => {
                const fallbackSpawn = { x: this.spawnPoint.x + ((p.slot - 1) * 60), y: this.spawnPoint.y };
                const spawn = this.resolveSpawnPoint(p.slot, fallbackSpawn);
                const extra = this.createSecondaryPlayer(p.characterIndex, spawn, p.slot, p.playerName, !!p.isCpu);
                if (extra) {
                    this.extraPlayers.push(extra);
                    this.fighters.push(extra);
                }
            });
        this.fighters.forEach((f) => {
            const root = f.sprite?.body?.parent || f.sprite?.body;
            if (root) this.fighterByBody.set(root, f);
        });
        this.createFighterHud();
        this.refreshAllFighterHud();

        // Referencias
        this.platforms = [];

        // Deteccion de suelo en Matter (reemplazo de onFloor)
        this.isOnGround = false;
        this.matter.world.on('beforeupdate', () => {
            this.isOnGround = false;
            this.extraPlayers.forEach((p) => { p.isOnGround = false; });
        });

        const updateGroundState = (event) => {
            event.pairs.forEach((pair) => {
                if (isPlayerGroundedByPair(this.player.body, pair)) {
                    this.isOnGround = true;
                }
                this.extraPlayers.forEach((p) => {
                    if (isPlayerGroundedByPair(p.sprite.body, pair)) {
                        p.isOnGround = true;
                    }
                });
            });
        };
        const updateFighterHits = (event) => this.handleFighterHits(event);

        this.matter.world.on('collisionstart', updateGroundState);
        this.matter.world.on('collisionactive', updateGroundState);
        this.matter.world.on('collisionstart', updateFighterHits);

        // Controles
        this.playerControlMap = this.getPlayerControls(1);
        this.playerInputKeys = this.buildInputKeys(this.playerControlMap);
        this.attackFallbackKeyP1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.attackDebugText = this.add.text(20, 72, '', {
            fontFamily: 'monospace',
            fontSize: '34px',
            color: '#fff16e',
            stroke: '#000000',
            strokeThickness: 7,
            backgroundColor: 'rgba(0,0,0,0.35)',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(10000);
        this.onFallbackAttackDown = (ev) => {
            if (ev?.repeat) return;
            if (!this.scene.isActive('PlayScene')) return;
            if (!this.mainFighter || this.mainFighter.eliminated || this.matchEnded) return;
            this.mainFighter.pendingAttack = true;
        };
        this.input.keyboard.on('keydown-J', this.onFallbackAttackDown);
        // Fallback defensivo: si por algun motivo no existiera la animacion de ataque de Titan, crearla en runtime.
        if (!this.anims.exists('titan_attack') && this.textures.exists('titan_attack_sheet')) {
            const total = this.textures.get('titan_attack_sheet').frameTotal;
            this.anims.create({
                key: 'titan_attack',
                frames: this.anims.generateFrameNumbers('titan_attack_sheet', { start: 0, end: Math.max(0, total - 1) }),
                frameRate: 12,
                repeat: 0
            });
        }
        this.add.text(20, 20, 'Presiona ESC para volver al menu', {
            fontSize: '14px',
            color: '#ffffff'
        });
        this.onEscToMenu = () => {
            if (!this.scene.isActive('PlayScene')) return;
            this.scene.start('MenuScene');
        };
        this.input.keyboard.on('keydown-ESC', this.onEscToMenu);
        this.events.once('shutdown', () => this.cleanupInputHandlers());
        this.events.once('destroy', () => this.cleanupInputHandlers());

        // Audio
        setBgmTrack(this, 'game');
        playAudio(this);
        syncAudio(this);

        const muteBtn = this.add.text(width - 20, 50, this.registry.get('muted') ? 'MUTE' : 'SOUND', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(1, 0).setInteractive();

        muteBtn.on('pointerdown', () => {
            const muted = toggleMute(this);
            muteBtn.setText(muted ? 'MUTE' : 'SOUND');
        });

        // Sistema de vidas
        this.isDying = false;
        const viewportW = this.cameras.main.width;
        const viewportH = this.cameras.main.height;
        const deathBgWidth = this.bgImage ? this.bgImage.displayWidth : viewportW;
        const deathBgHeight = this.bgImage ? this.bgImage.displayHeight : viewportH;
        const deathBgX = this.bgImage ? this.bgImage.x : (viewportW / 2);
        const deathBgY = this.bgImage ? this.bgImage.y : (viewportH / 2);
        if (chosenDeathOverlayKey && this.textures.exists(chosenDeathOverlayKey)) {
            if (!this.anims.exists('life_lost_bg_anim')) {
                const total = this.textures.get(chosenDeathOverlayKey).frameTotal;
                this.anims.create({
                    key: 'life_lost_bg_anim',
                    frames: this.anims.generateFrameNumbers(chosenDeathOverlayKey, { start: 0, end: Math.max(0, total - 1) }),
                    frameRate: 60,
                    repeat: 0
                });
            }

            this.deathOverlay = this.add.sprite(deathBgX, deathBgY, chosenDeathOverlayKey, 0)
                .setAlpha(0)
                .setScrollFactor(0)
                .setDepth(this.bgDepth + 1)
                .setVisible(false);
            this.fitSpriteWithoutStretch(this.deathOverlay, deathBgWidth, deathBgHeight);
        } else {
            this.deathOverlay = this.add.rectangle(deathBgX, deathBgY, deathBgWidth, deathBgHeight, 0xff2d55, 0)
                .setScrollFactor(0)
                .setDepth(this.bgDepth + 1)
                .setVisible(false);
        }
        this.deathText = this.add.text(viewportW / 2, 80, '-1 VIDA', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '40px',
            color: '#ffccd5',
            stroke: '#6b0012',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9999).setAlpha(0);

        this.showLifeLostFx = () => {
            // 25% de probabilidad de que aparezca el overlay
            if (Phaser.Math.FloatBetween(0, 1) < 0.75) return;
            
            playLifeLostFxSfx(this);
            this.trySpawnAmbientBackgroundSprite(this.chosenDeathOverlayKey, this.selectedMap);
            this.cameras.main.shake(180, 0.006);
            this.tweens.killTweensOf(this.deathOverlay);
            this.tweens.killTweensOf(this.deathText);
            this.deathOverlay.setVisible(true).setAlpha(1);
            if (this.deathOverlay.anims) {
                this.deathOverlay.setFrame(0);
                this.deathOverlay.play('life_lost_bg_anim', true);
            }
            this.deathText.setAlpha(1).setY(80);
            this.time.delayedCall(1200, () => {
                this.deathOverlay.setAlpha(0).setVisible(false);
            });
            this.tweens.add({
                targets: this.deathText,
                y: 45,
                alpha: 0,
                duration: 520,
                ease: 'Sine.Out'
            });
        };

        // Estado de salto
        this.wasJumping = false;
        this.isSaltoLanded = false;
        this.fallAnimationTime = 0;
        this.jumpsRemaining = 2;
    }

    update() {
        if (!this.player || this.matchEnded) return;
        if (this.attackDebugGraphics) this.attackDebugGraphics.clear();

        const { width, height } = this.scale;

        this.fighters.forEach((f) => {
            if (f.eliminated || !f.sprite?.body) return;
            const halfW = (f.sprite.displayWidth || 0) * 0.5;
            const halfH = (f.sprite.displayHeight || 0) * 0.5;
            const touchingWorldEdge = (
                (f.sprite.x - halfW) <= 0
                || (f.sprite.x + halfW) >= width
                || (f.sprite.y - halfH) <= 0
                || (f.sprite.y + halfH) >= height
            );
            const outByBottom = hasPlayerFallenOffWorld(f.sprite, height);
            const outBySides = f.sprite.x < -80 || f.sprite.x > (width + 80) || f.sprite.y < -120;
            // Muerte por tocar cualquier borde visual del mundo.
            if (touchingWorldEdge || outByBottom || outBySides) {
                this.handleFighterFall(f);
            }
        });
        if (this.matchEnded || this.mainFighter?.eliminated) {
            this.extraPlayers.forEach((p) => this.updateSecondaryPlayer(p));
            this.processActiveAttacks();
            return;
        }

        const isOnGround = this.isOnGround;
        this.player.isOnGround = isOnGround;
        const isJumping = !isOnGround;
        if (this.tryStartAttack(this.mainFighter, this.playerInputKeys)) {
            this.extraPlayers.forEach((p) => this.updateSecondaryPlayer(p));
            this.processActiveAttacks();
            return;
        }
        this.updateHitstunState(this.mainFighter);
        if (this.isInHitstun(this.mainFighter)) {
            this.extraPlayers.forEach((p) => this.updateSecondaryPlayer(p));
            this.processActiveAttacks();
            return;
        }

        // Animaciones por estado
        if (isOnGround) {
            if (this.wasJumping && !this.isSaltoLanded) {
                if (this.player.characterIndex === 0) {
                    if (this.player.texture.key !== 'aero_jump_fall_sheet') {
                        this.player.setTexture('aero_jump_fall_sheet');
                        this.applyFacingScale(getCharacterScale(this.player.characterIndex));
                    }
                    if (this.anims.exists('aero_jump_fall')) {
                        this.player.anims.play('aero_jump_fall', true);
                    }
                } else if (this.player.characterIndex === 2) {
                    if (this.anims.exists('titan_jump_fall')) {
                        this.player.anims.play('titan_jump_fall', true);
                    }
                } else {
                    playJumpAnimation(this.player, this, this.player.characterIndex);
                }
                this.fallAnimationTime = this.time.now + 300;
                this.isSaltoLanded = true;
            } else if (this.time.now >= this.fallAnimationTime) {
                const leftDown = this.isControlDown('left');
                const rightDown = this.isControlDown('right');
                if (leftDown || rightDown) {
                    playWalkAnimation(this.player, this, this.player.characterIndex, isOnGround);
                } else {
                    playIdleAnimation(this.player, this, this.player.characterIndex, isOnGround);
                }
            }
        } else {
            if (this.player.characterIndex === 0) {
                const isMovingUp = this.player.body.velocity.y < -50;
                const isMovingDown = this.player.body.velocity.y > 50;
                const isNearGround = this.player.y > this.scale.height - 170;

                if (isMovingDown && isNearGround && this.player.texture.key !== 'aero_jump_fall_sheet') {
                    this.player.setTexture('aero_jump_fall_sheet');
                    this.applyFacingScale(getCharacterScale(this.player.characterIndex));
                    if (this.anims.exists('aero_jump_fall')) {
                        this.player.anims.play('aero_jump_fall', true);
                    }
                } else if (this.player.texture.key !== 'aero_jump_air_sheet') {
                    this.player.setTexture('aero_jump_air_sheet');
                    this.applyFacingScale(getCharacterScale(this.player.characterIndex));

                    if (isMovingUp) {
                        this.player.setFrame(0);
                    } else if (isMovingDown) {
                        this.player.setFrame(1);
                    } else {
                        this.player.setFrame(0);
                    }
                }
            } else if (this.player.characterIndex === 2) {
                const isMovingDown = this.player.body.velocity.y > 40;
                if (isMovingDown) {
                    if (this.anims.exists('titan_jump_fall')) this.player.anims.play('titan_jump_fall', true);
                } else {
                    if (this.anims.exists('titan_jump_start')) this.player.anims.play('titan_jump_start', true);
                }
            } else {
                playJumpAnimation(this.player, this, this.player.characterIndex);
            }
        }

        // Movimiento
        const leftDown = this.isControlDown('left');
        const rightDown = this.isControlDown('right');
        if (leftDown) {
            movePlayer(this.player, 'left');
            this.setPlayerFacing('left');
        } else if (rightDown) {
            movePlayer(this.player, 'right');
            this.setPlayerFacing('right');
        } else {
            resetPlayerVelocityX(this.player);
        }

        // Salto
        if (this.isControlJustDown('jump')) {
            if (isOnGround) {
                if (this.player.characterIndex === 0) {
                    if (this.anims.exists('aero_jump_ground')) {
                        this.player.anims.play('aero_jump_ground', true);
                    }
                } else if (this.player.characterIndex === 2) {
                    if (this.anims.exists('titan_jump_start')) {
                        this.player.anims.play('titan_jump_start', true);
                    }
                } else {
                    playJumpAnimation(this.player, this, this.player.characterIndex);
                }

                makePlayerJump(this.player);
                playJumpSfxForCharacter(this, this.player.characterIndex);
                this.wasJumping = true;
                this.isSaltoLanded = false;
                this.jumpsRemaining = 1;
            } else if (this.jumpsRemaining > 0) {
                makePlayerJump(this.player);
                playJumpSfxForCharacter(this, this.player.characterIndex);
                this.jumpsRemaining -= 1;
                this.wasJumping = true;
            }
        }

        this.tryPlayWalkSfx(this.mainFighter, leftDown || rightDown);

        if (isOnGround && !this.wasJumping) {
            this.jumpsRemaining = 2;
        }

        this.wasJumping = isJumping;
        this.extraPlayers.forEach((p) => this.updateSecondaryPlayer(p));
        this.processActiveAttacks();
    }

    resolveSpawnPoint(slotNumber, fallback) {
        const names = [
            `Jugador ${slotNumber}`,
            `jugador ${slotNumber}`,
            `Player ${slotNumber}`,
            `player ${slotNumber}`,
            `P${slotNumber}`,
            `p${slotNumber}`
        ];
        const obj = this.spawnObjects.find((o) => names.includes(o?.name));
        if (!obj) return fallback;

        const scale = this.mapTileScale || 1;
        return {
            x: obj.x * scale,
            y: (obj.y - ((obj.height || 0) / 2)) * scale
        };
    }

    createSecondaryPlayer(characterIndex, spawn, slotNumber, playerName, isCpu = false) {
        const textureKey = (characterIndex === 1 && this.textures.exists('bw_walk_sheet'))
            ? 'bw_walk_sheet'
            : getCharacterTexture(characterIndex, this);
        const sprite = this.matter.add.sprite(spawn.x, spawn.y, textureKey);
        sprite.setOrigin(0.5, 0.5);
        sprite.characterIndex = characterIndex;
        sprite.body.label = `player_${slotNumber}`;
        let usesCustomShape = false;
        let shapeRight = null;
        let shapeLeft = null;
        const shapePair = this.getCollisionShapePair(characterIndex);
        if (shapePair?.right) {
            try {
                shapeRight = clonePhysicsShape(shapePair.right);
                shapeLeft = clonePhysicsShape(shapePair.left || shapePair.right);
                sprite.setBody(clonePhysicsShape(shapeRight));
                usesCustomShape = true;
            } catch (e) {
                console.warn(`No se pudo aplicar shape de PhysicsEditor al jugador ${slotNumber}:`, e);
            }
        }
        if (!usesCustomShape) {
            sprite.setRectangle(Math.round(sprite.displayWidth * 0.30), Math.round(sprite.displayHeight * 0.60));
        }
        sprite.setScale(Math.abs(getCharacterScale(characterIndex)));
        sprite.setFixedRotation();
        sprite.setFriction(0.85);
        sprite.setFrictionStatic(6);
        sprite.setFrictionAir(0.02);
        sprite.setBounce(0);
        sprite.setDepth(10 + slotNumber);
        this.setPlayerCollisionFilter(sprite);

        // Animacion base en reposo para jugadores no controlados.
        playIdleAnimation(sprite, this, characterIndex, true);
        return {
            slot: slotNumber,
            playerName: playerName || `Jugador ${slotNumber}`,
            spawn,
            sprite,
            characterIndex,
            lives: 3,
            percent: 0,
            eliminated: false,
            attackLockUntil: 0,
            attackActiveUntil: 0,
            attackHitFrameDone: false,
            attackHeld: false,
            pendingAttack: false,
            isAttacking: false,
            currentAttack: null,
            hitstunUntil: 0,
            baseFrictionAir: 0.02,
            attackedInCurrent: new Set(),
            hud: null,
            isCpu: !!isCpu,
            aiNextAttackAt: this.time.now + Phaser.Math.Between(850, 1500),
            aiNextJumpAt: 0,
            baseScale: Math.abs(getCharacterScale(characterIndex)),
            facing: 'right',
            usesCustomShape,
            shapeRight,
            shapeLeft,
            inputKeys: this.buildInputKeys(this.getPlayerControls(slotNumber)),
            isOnGround: false,
            wasJumping: false,
            isSaltoLanded: false,
            fallAnimationTime: 0,
            jumpsRemaining: 2
        };
    }

    getPlayerControls(slotNumber) {
        const defaults = [
            { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', attack: 'KeyJ' },
            { left: null, right: null, up: null, down: null, jump: null, attack: null },
            { left: null, right: null, up: null, down: null, jump: null, attack: null },
            { left: null, right: null, up: null, down: null, jump: null, attack: null }
        ];
        const cfg = this.registry.get('controlsConfig');
        const p = cfg?.players?.[slotNumber - 1];
        return p || defaults[slotNumber - 1] || defaults[0];
    }

    buildInputKeys(controlMap) {
        const keys = {};
        Object.entries(controlMap || {}).forEach(([action, code]) => {
            if (!code) return;
            const keyCode = this.resolvePhaserKeyCode(code);
            if (keyCode) keys[action] = this.input.keyboard.addKey(keyCode);
        });
        return keys;
    }

    resolvePhaserKeyCode(code) {
        if (!code) return null;
        const KC = Phaser.Input.Keyboard.KeyCodes;
        if (code === 'Space') return KC.SPACE;
        if (code === 'ArrowLeft') return KC.LEFT;
        if (code === 'ArrowRight') return KC.RIGHT;
        if (code === 'ArrowUp') return KC.UP;
        if (code === 'ArrowDown') return KC.DOWN;
        if (code.startsWith('Key')) return KC[code.slice(3).toUpperCase()] || null;
        if (code.startsWith('Digit')) {
            const digitNames = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
            const n = Number(code.slice(5));
            return Number.isInteger(n) && n >= 0 && n <= 9 ? KC[digitNames[n]] : null;
        }
        return KC[code.toUpperCase()] || null;
    }

    isControlDown(action) {
        return !!this.playerInputKeys?.[action]?.isDown;
    }

    isControlJustDown(action) {
        const key = this.playerInputKeys?.[action];
        return key ? Phaser.Input.Keyboard.JustDown(key) : false;
    }

    isControlDownFor(inputKeys, action) {
        return !!inputKeys?.[action]?.isDown;
    }

    isControlJustDownFor(inputKeys, action) {
        const key = inputKeys?.[action];
        return key ? Phaser.Input.Keyboard.JustDown(key) : false;
    }

    setSecondaryFacing(playerState, direction) {
        if (playerState.facing === direction) return;
        playerState.facing = direction;
        playerState.sprite.setScale(Math.abs(playerState.baseScale), Math.abs(playerState.baseScale));
        playerState.sprite.setFlipX(direction === 'left');
        // Jugadores secundarios: solo espejo visual para evitar conflictos de colision.
    }

    updateSecondaryPlayer(playerState) {
        if (!playerState?.sprite) return;
        if (playerState.eliminated) return;
        if (playerState.isCpu) {
            this.updateCpuPlayer(playerState);
            return;
        }
        if (this.tryStartAttack(playerState, playerState.inputKeys)) return;
        this.updateHitstunState(playerState);
        if (this.isInHitstun(playerState)) return;
        const sprite = playerState.sprite;
        const isOnGround = !!playerState.isOnGround;
        sprite.isOnGround = isOnGround;
        const isJumping = !isOnGround;

        if (isOnGround) {
            if (playerState.wasJumping && !playerState.isSaltoLanded) {
                if (sprite.characterIndex === 0) {
                    if (sprite.texture.key !== 'aero_jump_fall_sheet') {
                        sprite.setTexture('aero_jump_fall_sheet');
                        this.setSecondaryFacing(playerState, playerState.facing);
                    }
                    if (this.anims.exists('aero_jump_fall')) {
                        sprite.anims.play('aero_jump_fall', true);
                    }
                } else if (sprite.characterIndex === 2) {
                    if (this.anims.exists('titan_jump_fall')) {
                        sprite.anims.play('titan_jump_fall', true);
                    }
                } else {
                    playJumpAnimation(sprite, this, sprite.characterIndex);
                }
                playerState.fallAnimationTime = this.time.now + 300;
                playerState.isSaltoLanded = true;
            } else if (this.time.now >= playerState.fallAnimationTime) {
                const leftDown = this.isControlDownFor(playerState.inputKeys, 'left');
                const rightDown = this.isControlDownFor(playerState.inputKeys, 'right');
                if (leftDown || rightDown) {
                    playWalkAnimation(sprite, this, sprite.characterIndex, true);
                } else {
                    playIdleAnimation(sprite, this, sprite.characterIndex, true);
                }
            }
        } else {
            if (sprite.characterIndex === 2) {
                const isMovingDown = sprite.body.velocity.y > 40;
                if (isMovingDown) {
                    if (this.anims.exists('titan_jump_fall')) sprite.anims.play('titan_jump_fall', true);
                } else {
                    if (this.anims.exists('titan_jump_start')) sprite.anims.play('titan_jump_start', true);
                }
            } else {
                playJumpAnimation(sprite, this, sprite.characterIndex);
            }
        }

        const leftDown = this.isControlDownFor(playerState.inputKeys, 'left');
        const rightDown = this.isControlDownFor(playerState.inputKeys, 'right');
        if (leftDown) {
            movePlayer(sprite, 'left');
            this.setSecondaryFacing(playerState, 'left');
        } else if (rightDown) {
            movePlayer(sprite, 'right');
            this.setSecondaryFacing(playerState, 'right');
        } else {
            resetPlayerVelocityX(sprite);
        }

        if (this.isControlJustDownFor(playerState.inputKeys, 'jump')) {
            if (isOnGround) {
                if (sprite.characterIndex === 0) {
                    if (this.anims.exists('aero_jump_ground')) {
                        sprite.anims.play('aero_jump_ground', true);
                    }
                } else if (sprite.characterIndex === 2) {
                    if (this.anims.exists('titan_jump_start')) {
                        sprite.anims.play('titan_jump_start', true);
                    }
                } else {
                    playJumpAnimation(sprite, this, sprite.characterIndex);
                }
                makePlayerJump(sprite);
                playJumpSfxForCharacter(this, sprite.characterIndex);
                playerState.wasJumping = true;
                playerState.isSaltoLanded = false;
                playerState.jumpsRemaining = 1;
            } else if (playerState.jumpsRemaining > 0) {
                makePlayerJump(sprite);
                playJumpSfxForCharacter(this, sprite.characterIndex);
                playerState.jumpsRemaining -= 1;
                playerState.wasJumping = true;
            }
        }

        this.tryPlayWalkSfx(playerState, leftDown || rightDown);

        if (isOnGround && !playerState.wasJumping) {
            playerState.jumpsRemaining = 2;
        }
        playerState.wasJumping = isJumping;
    }

    updateCpuPlayer(playerState) {
        const sprite = playerState.sprite;
        this.updateHitstunState(playerState);
        if (this.isInHitstun(playerState)) return;
        if (playerState.isAttacking) return;

        const target = this.findNearestTarget(playerState);
        if (!target?.sprite) {
            resetPlayerVelocityX(sprite);
            playIdleAnimation(sprite, this, sprite.characterIndex, !!playerState.isOnGround);
            return;
        }

        const dx = target.sprite.x - sprite.x;
        const dy = target.sprite.y - sprite.y;
        const absDx = Math.abs(dx);
        const isOnGround = !!playerState.isOnGround;
        const isJumping = !isOnGround;
        const now = this.time.now;

        if (absDx > 85) {
            if (dx < 0) {
                movePlayer(sprite, 'left');
                this.setSecondaryFacing(playerState, 'left');
            } else {
                movePlayer(sprite, 'right');
                this.setSecondaryFacing(playerState, 'right');
            }
            if (isOnGround) playWalkAnimation(sprite, this, sprite.characterIndex, true);
        } else {
            resetPlayerVelocityX(sprite);
            if (isOnGround) playIdleAnimation(sprite, this, sprite.characterIndex, true);
        }

        if (dy < -32 && now >= (playerState.aiNextJumpAt || 0)) {
            const canJumpFromGround = isOnGround;
            const canAirJump = !isOnGround && (playerState.jumpsRemaining > 0);
            if (canJumpFromGround || canAirJump) {
                makePlayerJump(sprite);
                playJumpSfxForCharacter(this, sprite.characterIndex);
                if (canJumpFromGround) playerState.jumpsRemaining = 1;
                else playerState.jumpsRemaining -= 1;
                playerState.wasJumping = true;
                playerState.aiNextJumpAt = now + Phaser.Math.Between(500, 900);
            }
        }

        const inAttackRange = absDx < 140 && Math.abs(dy) < 110;
        const veryCloseRange = absDx < 90 && Math.abs(dy) < 110;
        if (inAttackRange && now >= (playerState.aiNextAttackAt || 0)) {
            if (!playerState.isAttacking) {
                playerState.pendingAttack = true;
            }
            playerState.aiNextAttackAt = now + (veryCloseRange ? 500 : Phaser.Math.Between(900, 1400));
        }

        this.tryStartAttack(playerState, playerState.inputKeys || {});
        this.tryPlayWalkSfx(playerState, isOnGround && absDx > 85);
        if (isOnGround && !playerState.wasJumping) {
            playerState.jumpsRemaining = 2;
        }
        playerState.wasJumping = isJumping;
    }

    findNearestTarget(playerState) {
        const candidates = this.fighters.filter((f) => f !== playerState && !f.eliminated && f.sprite?.body);
        if (candidates.length === 0) return null;
        let best = candidates[0];
        let bestDist = Phaser.Math.Distance.Between(
            playerState.sprite.x, playerState.sprite.y, best.sprite.x, best.sprite.y
        );
        for (let i = 1; i < candidates.length; i += 1) {
            const c = candidates[i];
            const d = Phaser.Math.Distance.Between(playerState.sprite.x, playerState.sprite.y, c.sprite.x, c.sprite.y);
            if (d < bestDist) {
                best = c;
                bestDist = d;
            }
        }
        return best;
    }

    createFighterHud() {
        const cardKeys = ['player_card_1', 'player_card_2', 'player_card_3', 'player_card_4'];
        const active = this.fighters.filter((f) => !f.eliminated);
        const count = active.length;
        const spacing = count <= 2 ? 520 : 450;
        const baseY = this.cameras.main.height - 182;
        const startX = (this.cameras.main.width / 2) - ((count - 1) * spacing / 2);

        active.forEach((f, i) => {
            const x = startX + (i * spacing);
            const cardKey = cardKeys[(f.slot - 1) % cardKeys.length];
            const card = this.textures.exists(cardKey)
                ? this.add.image(x, baseY, cardKey).setDisplaySize(540, 320)
                : this.add.rectangle(x, baseY, 540, 320, 0x1a254d, 0.95).setStrokeStyle(2, 0xffffff, 0.55);
            card.setScrollFactor(0).setDepth(3000);

            const nameText = this.add.text(x, baseY - 122, (f.playerName || `P${f.slot}`).toUpperCase(), {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '36px',
                color: '#ffffff',
                stroke: '#0d1f3f',
                strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            const livesText = this.add.text(x - 220, baseY - 136, 'x3', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '40px',
                color: '#ffffff',
                stroke: '#08142f',
                strokeThickness: 2
            }).setOrigin(0, 0).setScrollFactor(0).setDepth(3001);

            const percentText = this.add.text(x + 138, baseY + 50, '0%', {
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '66px',
                color: '#ffefcc',
                stroke: '#431500',
                strokeThickness: 4
            }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

            const portraitTex = getCharacterTexture(f.characterIndex, this);
            const portrait = this.add.image(x - 88, baseY + 48, portraitTex, 0).setScrollFactor(0).setDepth(3001);
            const fw = portrait.frame?.width || 64;
            const fh = portrait.frame?.height || 64;
            const sc = Math.max(188 / fw, 140 / fh) * 1.08;
            portrait.setScale(sc);
            if (portraitTex.endsWith('_sheet')) portrait.setFrame(0);

            const maskG = this.add.graphics().setScrollFactor(0).setDepth(3002);
            maskG.fillStyle(0xffffff, 1);
            // Mostrar solo media figura aprox (mitad superior del personaje).
            maskG.fillRect(x - 190, baseY - 66, 196, 136);
            maskG.setVisible(false);
            portrait.setMask(maskG.createGeometryMask());

            f.hud = { card, nameText, livesText, percentText, portrait, maskG };
        });
    }

    refreshAllFighterHud() {
        this.fighters.forEach((f) => this.refreshFighterHud(f));
    }

    refreshFighterHud(fighter) {
        if (!fighter?.hud) return;
        const { livesText, percentText, card, nameText, portrait } = fighter.hud;
        livesText.setText(`x${Math.max(0, fighter.lives)}`);
        percentText.setText(`${Math.round(fighter.percent)}%`);
        const pct = fighter.percent || 0;
        if (pct < 50) percentText.setColor('#ffefcc');
        else if (pct < 100) percentText.setColor('#ffd07a');
        else if (pct < 180) percentText.setColor('#ff8c4a');
        else percentText.setColor('#ff4a4a');

        const alive = !fighter.eliminated;
        card.setAlpha(alive ? 1 : 0.45);
        nameText.setAlpha(alive ? 1 : 0.6);
        portrait.setAlpha(alive ? 1 : 0.45);
    }

    handleFighterHits(event) {
        if (!event?.pairs || this.matchEnded) return;
        event.pairs.forEach((pair) => {
            const rootA = pair.bodyA?.parent || pair.bodyA;
            const rootB = pair.bodyB?.parent || pair.bodyB;
            if (!rootA || !rootB) return;
            const a = this.fighterByBody.get(rootA);
            const b = this.fighterByBody.get(rootB);
            if (!a || !b || a === b) return;
            if (a.eliminated || b.eliminated) return;

            const key = a.slot < b.slot ? `${a.slot}-${b.slot}` : `${b.slot}-${a.slot}`;
            const now = this.time.now;
            const last = this.hitCooldownByPair.get(key) || 0;
            if (now - last < 170) return;
            this.hitCooldownByPair.set(key, now);

            const dist = Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, b.sprite.x, b.sprite.y);
            const dmg = dist < 90 ? 4 : 2;
            this.applyHit(a, b, dmg);
            this.applyHit(b, a, dmg);
        });
    }

    applyHit(target, source, damage) {
        if (!target?.sprite?.body || !source?.sprite?.body) return;
        target.percent = Math.min(999, (target.percent || 0) + damage);
        const dir = Math.sign(target.sprite.x - source.sprite.x) || 1;
        const kbX = 3.0 + (target.percent * 0.055) + (damage >= 4 ? 1.8 : 0.9);
        const kbY = 7.5 + (target.percent * 0.025) + (damage >= 4 ? 2.2 : 1.1);
        target.sprite.setVelocityX(dir * kbX);
        target.sprite.setVelocityY(-Math.min(24, kbY));
        this.refreshFighterHud(target);
    }

    handleFighterFall(fighter) {
        if (!fighter || fighter.eliminated) return;
        playDeathSfxForCharacter(this, fighter.characterIndex);
        this.spawnDeathShards(fighter.sprite);
        fighter.lives -= 1;
        fighter.percent = 0;
        fighter.attackLockUntil = 0;
        fighter.attackActiveUntil = 0;
        fighter.attackHitFrameDone = false;
        fighter.attackHeld = false;
        fighter.pendingAttack = false;
        fighter.isAttacking = false;
        fighter.currentAttack = null;
        fighter.hitstunUntil = 0;
        if (fighter.sprite?.setFrictionAir) fighter.sprite.setFrictionAir(fighter.baseFrictionAir ?? 0.02);
        fighter.attackedInCurrent?.clear?.();
        this.refreshFighterHud(fighter);
        this.showLifeLostFx();

        if (fighter.lives > 0) {
            fighter.sprite.setPosition(fighter.spawn.x, fighter.spawn.y);
            fighter.sprite.setVelocity(0, 0);
            fighter.sprite.setAngularVelocity(0);
            fighter.jumpsRemaining = 2;
            fighter.isOnGround = false;
            // Al reaparecer, volver al estado original (mirando a la derecha)
            // y recuperar la colision base derecha.
            if (fighter.slot === 1) {
                this.playerFacing = 'left'; // forzar cambio real en setPlayerFacing
                this.setPlayerFacing('right');
            } else {
                fighter.facing = 'left'; // forzar cambio real en setSecondaryFacing
                this.setSecondaryFacing(fighter, 'right');
            }
            return;
        }

        fighter.eliminated = true;
        fighter.sprite.setVisible(false);
        fighter.sprite.setActive(false);
        if (fighter.sprite.body) {
            this.matter.world.remove(fighter.sprite.body);
        }
        this.checkMatchEnd();
    }

    checkMatchEnd() {
        const alive = this.fighters.filter((f) => !f.eliminated);
        if (alive.length > 1) return;
        this.matchEnded = true;
        const msg = alive.length === 1 ? `GANA ${alive[0].playerName || `P${alive[0].slot}`}` : 'SIN GANADOR';
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, msg, {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '48px',
            color: '#ffefcc',
            stroke: '#451600',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(9999);
        this.time.delayedCall(1700, () => this.scene.start('MenuScene'));
    }

    spawnDeathShards(sprite) {
        if (!sprite?.texture) return;

        const textureKey = sprite.texture.key;
        const currentFrameName = sprite.frame?.name ?? '__BASE';
        const baseScaleX = Math.abs(sprite.scaleX || 1);
        const baseScaleY = Math.abs(sprite.scaleY || 1);
        const count = 128;
        const texture = this.textures.get(textureKey);
        const availableFrames = texture?.getFrameNames
            ? texture.getFrameNames().filter((n) => n !== '__BASE')
            : [];

        for (let i = 0; i < count; i += 1) {
            const frameToUse = availableFrames.length > 0
                ? availableFrames[Phaser.Math.Between(0, availableFrames.length - 1)]
                : currentFrameName;
            const piece = this.add.image(
                sprite.x + Phaser.Math.Between(-12, 12),
                sprite.y + Phaser.Math.Between(-18, 18),
                textureKey,
                frameToUse
            );

            const shardScale = Phaser.Math.FloatBetween(0.07, 0.20);
            piece.setScale(baseScaleX * shardScale, baseScaleY * shardScale);
            piece.setDepth((sprite.depth || 10) + 2);
            piece.setAlpha(Phaser.Math.FloatBetween(0.85, 1));

            this.tweens.add({
                targets: piece,
                x: piece.x + Phaser.Math.Between(-280, 280),
                y: piece.y + Phaser.Math.Between(120, 300),
                angle: Phaser.Math.Between(-170, 170),
                alpha: 0,
                duration: Phaser.Math.Between(520, 860),
                ease: 'Cubic.In',
                onComplete: () => piece.destroy()
            });
        }
    }

    tryPlayWalkSfx(fighterState, shouldStep) {
        if (!fighterState || !shouldStep) return;
        const slot = fighterState.slot || 1;
        const now = this.time.now;
        const last = this.walkSfxCooldownBySlot.get(slot) || 0;
        if (now - last < 120) return;
        this.walkSfxCooldownBySlot.set(slot, now);
        playWalkSfxForCharacter(this, fighterState.characterIndex);
    }

    tryStartAttack(fighterState, inputKeys) {
        if (!fighterState?.sprite) return false;
        if (fighterState.isAttacking) return true;
        const now = this.time.now;
        const cfgAttackDown = this.isControlDownFor(inputKeys, 'attack');
        const cfgAttackJust = this.isControlJustDownFor(inputKeys, 'attack');
        const fallbackDown = fighterState.slot === 1 ? !!this.attackFallbackKeyP1?.isDown : false;
        const fallbackJust = fighterState.slot === 1 ? Phaser.Input.Keyboard.JustDown(this.attackFallbackKeyP1) : false;
        const pendingEvent = !!fighterState.pendingAttack;
        const attackDown = cfgAttackDown || fallbackDown;
        const attackJustPressed = cfgAttackJust || fallbackJust || pendingEvent;
        fighterState.attackHeld = attackDown;
        fighterState.pendingAttack = false;
        if (fighterState.attackLockUntil && now < fighterState.attackLockUntil) return true;
        if (!attackJustPressed) return false;

        const cfg = getCharacterAnimationConfig(fighterState.characterIndex);
        let attackAnimKey = null;
        if (cfg?.attackAnimationKey && !this.anims.exists(cfg.attackAnimationKey) && cfg?.attackSpritesheet && this.textures.exists(cfg.attackSpritesheet)) {
            const total = this.textures.get(cfg.attackSpritesheet).frameTotal;
            this.anims.create({
                key: cfg.attackAnimationKey,
                frames: this.anims.generateFrameNumbers(cfg.attackSpritesheet, { start: 0, end: Math.max(0, total - 1) }),
                frameRate: 12,
                repeat: 0
            });
        }

        if (cfg?.attackAnimationKey && this.anims.exists(cfg.attackAnimationKey)) {
            attackAnimKey = cfg.attackAnimationKey;
        }
        if (!attackAnimKey) return false;

        const sprite = fighterState.sprite;
        const attackProfile = this.getAttackProfile(fighterState.characterIndex);
        sprite.setVelocityX(0);
        playAttackSfxForCharacter(this, fighterState.characterIndex);
        sprite.anims.play(attackAnimKey, true);
        if (fighterState.slot === 1) {
            this.setAttackDebugMessage(`ATK START anim=${attackAnimKey} active=[${(attackProfile.activeFrames || []).join(',')}]`);
        }
        fighterState.attackLockUntil = now + 220;
        fighterState.attackActiveUntil = now + 600;
        fighterState.attackHitFrameDone = false;
        fighterState.isAttacking = true;
        fighterState.currentAttack = { ...attackProfile, animKey: attackAnimKey };
        fighterState.attackedInCurrent = new Set();
        sprite.once(`animationcomplete-${attackAnimKey}`, () => {
            this.finishAttackState(fighterState, 'complete');
        });
        return true;
    }

    finishAttackState(fighterState, reason = '') {
        if (!fighterState) return;
        if (fighterState.slot === 1 && reason) this.setAttackDebugMessage(`ATK END (${reason})`);
        fighterState.isAttacking = false;
        fighterState.currentAttack = null;
        fighterState.attackLockUntil = 0;
        fighterState.attackActiveUntil = 0;
        fighterState.attackHitFrameDone = false;
        fighterState.attackedInCurrent?.clear?.();
    }

    processActiveAttacks() {
        if (this.matchEnded) return;
        const now = this.time.now;
        const alive = this.fighters.filter((f) => !f.eliminated && f.sprite?.body);
        alive.forEach((attacker) => {
            if (!attacker.isAttacking || !attacker.currentAttack) return;
            const attackAnimKey = attacker.currentAttack.animKey;
            const currentAnimKey = attacker.sprite?.anims?.currentAnim?.key || null;
            const outOfWindow = now > ((attacker.attackActiveUntil || 0) + 60);
            const interrupted = !!attackAnimKey && !!currentAnimKey && attackAnimKey !== currentAnimKey;
            if (outOfWindow || interrupted) {
                this.finishAttackState(attacker, outOfWindow ? 'timeout' : 'interrupt');
                return;
            }
            this.drawAttackDebug(attacker);
            const localFrame = this.getCurrentAttackLocalFrame(attacker);
            const active = this.isOnAttackActiveFrame(attacker);
            if (attacker.slot === 1) {
                this.setAttackDebugMessage(`ATK frameLocal=${localFrame} active=${active ? 'SI' : 'NO'} posibles=${alive.length - 1}`);
            }
            if (!active) return;
            alive.forEach((target) => {
                if (target === attacker) return;
                if (attacker.attackedInCurrent?.has(target.slot)) return;
                if (!this.isTargetInAttackRange(attacker, target)) return;
                this.applyAttackHit(attacker, target);
                attacker.attackedInCurrent?.add(target.slot);
            });
        });
    }

    isTargetInAttackRange(attacker, target) {
        const polys = this.getAttackWorldPolygons(attacker);
        if (polys.length > 0) {
            const b = target.sprite?.body?.bounds;
            if (!b) return false;
            const targetPts = [
                { x: target.sprite.x, y: target.sprite.y },
                { x: b.min.x, y: b.min.y },
                { x: b.max.x, y: b.min.y },
                { x: b.min.x, y: b.max.y },
                { x: b.max.x, y: b.max.y }
            ];
            const targetRect = { left: b.min.x, right: b.max.x, top: b.min.y, bottom: b.max.y };
            return polys.some((p) => {
                const targetPointInsidePoly = targetPts.some((pt) => Phaser.Geom.Polygon.Contains(p, pt.x, pt.y));
                if (targetPointInsidePoly) return true;
                // Caso inverso: que un vertice del hitbox caiga dentro del cuerpo objetivo.
                return p.points.some((pt) =>
                    pt.x >= targetRect.left
                    && pt.x <= targetRect.right
                    && pt.y >= targetRect.top
                    && pt.y <= targetRect.bottom
                );
            });
        }

        const ax = attacker.sprite.x;
        const ay = attacker.sprite.y;
        const tx = target.sprite.x;
        const ty = target.sprite.y;
        const profile = this.getAttackProfile(attacker.characterIndex);
        const facing = this.getFighterFacing(attacker);
        const dir = facing === 'left' ? -1 : 1;
        const dx = tx - ax;
        const forward = dx * dir;
        const vertical = Math.abs(ty - ay);
        return forward >= profile.box.forwardMin && forward <= profile.box.forwardMax && vertical <= profile.box.vertical;
    }

    getFighterFacing(fighter) {
        if (fighter?.slot === 1) return this.playerFacing || 'right';
        return fighter?.facing || 'right';
    }

    applyAttackHit(attacker, target) {
        if (!target?.sprite?.body || !attacker?.sprite?.body) return;
        const profile = this.getAttackProfile(attacker.characterIndex);
        const dist = Phaser.Math.Distance.Between(attacker.sprite.x, attacker.sprite.y, target.sprite.x, target.sprite.y);
        const damage = dist < 80 ? profile.damageNear : profile.damageFar;
        target.percent = Math.min(999, (target.percent || 0) + damage);
        const pct = target.percent || 0;

        const fallbackDir = this.getFighterFacing(attacker) === 'left' ? -1 : 1;
        const dir = Math.sign(target.sprite.x - attacker.sprite.x) || fallbackDir;
        // Knockback diagonal con fuerte escalado por porcentaje (a mas %, mas retroceso).
        const scale = 1 + (pct / 95);
        const kbX = (8.8 + (damage >= 8 ? 3.4 : 2.2) + (pct * 0.14)) * scale;
        const kbY = (5.8 + (damage >= 8 ? 2.1 : 1.15) + (pct * 0.034)) * Math.min(2.6, 1 + (pct / 220));
        const knockbackScale = 0.5;
        target.sprite.setVelocityX(dir * kbX * knockbackScale);
        target.sprite.setVelocityY(-Math.min(22, kbY) * knockbackScale);
        const stunMs = Math.min(720, 180 + (damage * 24) + (pct * 1.5));
        target.hitstunUntil = this.time.now + stunMs;
        target.sprite.setFrictionAir(0.004);
        this.refreshFighterHud(target);
        if (attacker.slot === 1) {
            this.setAttackDebugMessage(`HIT a P${target.slot} dmg=${damage} pct=${Math.round(target.percent)}`);
        }
    }

    tryTriggerBackgroundFx() {
        // No longer used - probability is now handled in showLifeLostFx()
    }

    setPlayerCollisionFilter(sprite) {
        const body = sprite?.body;
        if (!body?.collisionFilter) return;
        body.collisionFilter.category = this.PLAYER_CATEGORY;
        body.collisionFilter.mask = this.PLATFORM_CATEGORY;
    }

    isInHitstun(fighterState) {
        return (fighterState?.hitstunUntil || 0) > this.time.now;
    }

    updateHitstunState(fighterState) {
        if (!fighterState?.sprite) return;
        if (this.isInHitstun(fighterState)) return;
        const base = fighterState.baseFrictionAir ?? 0.02;
        if (fighterState.sprite.body?.frictionAir !== base) {
            fighterState.sprite.setFrictionAir(base);
        }
    }

    isOnAttackHitFrame(attacker) {
        const profile = attacker?.currentAttack || this.getAttackProfile(attacker.characterIndex);
        const localFrame = this.getCurrentAttackLocalFrame(attacker);
        return localFrame === (profile?.hitFrameIndex ?? 2);
    }

    isOnAttackActiveFrame(attacker) {
        const profile = attacker?.currentAttack || this.getAttackProfile(attacker.characterIndex);
        const localFrame = this.getCurrentAttackLocalFrame(attacker);
        const active = profile?.activeFrames;
        if (!Array.isArray(active) || active.length === 0) return this.isOnAttackHitFrame(attacker);
        return active.includes(localFrame);
    }

    getCurrentAttackLocalFrame(attacker) {
        const state = attacker?.sprite?.anims;
        const currentAnim = state?.currentAnim;
        const currentFrame = state?.currentFrame;
        if (!currentAnim || !currentFrame || !Array.isArray(currentAnim.frames)) return -1;
        const idx = currentAnim.frames.findIndex((f) => f.index === currentFrame.index);
        return idx >= 0 ? idx + 1 : -1;
    }

    getAttackProfile(characterIndex) {
        return ATTACK_PROFILE_BY_CHARACTER[characterIndex] || ATTACK_PROFILE_BY_CHARACTER[0];
    }

    drawAttackDebug(attacker) {
        const polys = this.getAttackWorldPolygons(attacker);
        if (polys.length > 0) {
            this.drawTitanAttackDebug(polys);
            return;
        }
        this.drawAttackDebugBox(attacker);
    }

    drawAttackDebugBox(attacker) {
        if (!this.attackDebugGraphics || !attacker?.sprite) return;
        const profile = this.getAttackProfile(attacker.characterIndex);
        const facing = this.getFighterFacing(attacker);
        const dir = facing === 'left' ? -1 : 1;
        const x = attacker.sprite.x + ((dir === 1) ? profile.box.forwardMin : -profile.box.forwardMax);
        const y = attacker.sprite.y - profile.box.vertical;
        const w = profile.box.forwardMax - profile.box.forwardMin;
        const h = profile.box.vertical * 2;
        this.attackDebugGraphics.lineStyle(2, 0xffe44d, 0.95);
        this.attackDebugGraphics.fillStyle(0xffe44d, 0.12);
        this.attackDebugGraphics.fillRect(x, y, w, h);
        this.attackDebugGraphics.strokeRect(x, y, w, h);
    }

    getAttackWorldPolygons(attacker) {
        if (!attacker?.sprite) return [];
        const source = this.attackHitboxSourceByCharacter?.get(attacker.characterIndex) || null;
        if (!source) return [];
        const root = this.getAttackHitboxRoot(source);
        const vertsGroups = root?.fixtures?.[0]?.vertices;
        if (!Array.isArray(vertsGroups) || vertsGroups.length === 0) return [];

        const profile = this.getAttackProfile(attacker.characterIndex);
        const frameW = attacker.sprite.frame?.realWidth || attacker.sprite.frame?.width || 64;
        const frameH = attacker.sprite.frame?.realHeight || attacker.sprite.frame?.height || 64;
        const hitFrame = profile.hitFrameIndex || profile.activeFrames?.[0] || 2;
        const frameBaseX = (hitFrame - 1) * frameW;
        const sx = Math.abs(attacker.sprite.scaleX || 1);
        const sy = Math.abs(attacker.sprite.scaleY || 1);
        const facing = this.getFighterFacing(attacker);
        const dir = facing === 'left' ? -1 : 1;
        const originX = attacker.sprite.x;
        const originY = attacker.sprite.y;
        const tuning = this.getAttackHitboxTuning(attacker.characterIndex);
        const tuneScaleX = tuning.scaleX ?? 1;
        const tuneScaleY = tuning.scaleY ?? 1;
        const tuneOffsetX = tuning.offsetX ?? 0;
        const tuneOffsetY = tuning.offsetY ?? 0;

        return vertsGroups.map((group) => {
            const points = group.map((v) => {
                // PhysicsEditor exporta coordenadas absolutas del sheet (192x64).
                // Ajustamos al frame 2 y luego al centro del sprite.
                const localX = (((v.x - frameBaseX) - (frameW / 2)) * tuneScaleX) + tuneOffsetX;
                const localY = ((v.y - (frameH / 2)) * tuneScaleY) + tuneOffsetY;
                return {
                    x: originX + (localX * sx * dir),
                    y: originY + (localY * sy)
                };
            });
            return new Phaser.Geom.Polygon(points);
        });
    }

    getAttackHitboxTuning(characterIndex) {
        return ATTACK_HITBOX_TUNING_BY_CHARACTER[characterIndex] || {};
    }

    getAttackHitboxRoot(source) {
        if (!source || typeof source !== 'object') return null;
        const keys = Object.keys(source);
        if (keys.length === 0) return null;
        // Priorizar entrada con fixtures validos.
        for (let i = 0; i < keys.length; i += 1) {
            const candidate = source[keys[i]];
            const verts = candidate?.fixtures?.[0]?.vertices;
            if (Array.isArray(verts) && verts.length > 0) return candidate;
        }
        return source[keys[0]] || null;
    }

    drawTitanAttackDebug(polys) {
        if (!this.attackDebugGraphics || !Array.isArray(polys)) return;
        this.attackDebugGraphics.lineStyle(2, 0xffe44d, 0.95);
        this.attackDebugGraphics.fillStyle(0xffe44d, 0.12);
        polys.forEach((poly) => {
            this.attackDebugGraphics.fillPoints(poly.points, true);
            this.attackDebugGraphics.strokePoints(poly.points, true);
        });
        // Punto visible en la "punta" de la hitbox para ver donde realmente pega la varita.
        const first = polys[0]?.points;
        if (Array.isArray(first) && first.length > 0) {
            const tip = first.reduce((best, p) => (p.x > best.x ? p : best), first[0]);
            this.attackDebugGraphics.fillStyle(0xff4040, 1);
            this.attackDebugGraphics.fillCircle(tip.x, tip.y, 8);
        }
    }

    setAttackDebugMessage(message) {
        if (!this.attackDebugText) return;
        this.attackDebugText.setText(message || '');
        if (this.attackDebugClearTimer) this.attackDebugClearTimer.remove(false);
        this.attackDebugClearTimer = this.time.delayedCall(1200, () => {
            if (this.attackDebugText) this.attackDebugText.setText('');
        });
    }

    setPlayerFacing(direction) {
        if (this.playerFacing === direction) return;
        this.playerFacing = direction;
        this.applyFacingScale(this.playerBaseScale);
        const canSwap = this.playerUsesCustomShape && this.playerCanSwapCollisionByFacing;
        if (canSwap) {
            this.applySpriteFacingCollisionShape(this.player, direction, this.playerShapeRight, this.playerShapeLeft, true);
        }
    }

    applyFacingScale(baseScale) {
        this.player.setScale(Math.abs(baseScale), Math.abs(baseScale));
        this.player.setFlipX(this.playerFacing === 'left');
    }

    getCollisionShapePair(characterIndex) {
        const map = {
            0: { cacheKey: 'chonier_collision_shape', rightLabel: 'Personaje choiner reposo' },
            1: { cacheKey: 'personaje2_collision_shape', rightLabel: 'Sprite Colicion Personaje 2', leftLabel: 'Sprite Colicion Personaje 2 Left' },
            2: { cacheKey: 'titan_collision_shape', rightLabel: 'Personaje Titan reposo' },
            3: { cacheKey: 'aurum_collision_shape', rightLabel: 'Personaje Aurum reposo' },
            4: { cacheKey: 'hollow_collision_shape', rightLabel: 'Personaje Hollow reposo' }
        };
        const cfg = map[characterIndex];
        if (!cfg) return null;
        const json = this.cache.json.get(cfg.cacheKey);
        if (!json) return null;
        const right = json?.[cfg.rightLabel];
        if (!right) return null;
        const left = cfg.leftLabel ? json?.[cfg.leftLabel] : null;
        return { right, left };
    }

    buildMirroredShape(shape, frameWidth = 64) {
        const base = clonePhysicsShape(shape);
        const fixtures = base?.fixtures;
        if (!Array.isArray(fixtures)) return base;
        const out = clonePhysicsShape(base);
        const outFixtures = out?.fixtures;
        if (!Array.isArray(outFixtures)) return out;
        const mirrorAxisSum = Number(frameWidth) || 64; // x' = frameWidth - x (espejo sobre centro del frame)
        outFixtures.forEach((fix) => {
            if (!Array.isArray(fix.vertices)) return;
            fix.vertices.forEach((poly) => {
                if (!Array.isArray(poly) || poly.length === 0) return;
                poly.forEach((v) => { v.x = mirrorAxisSum - v.x; });
                // Mantener winding valido tras espejo.
                poly.reverse();
            });
        });
        return out;
    }

    applySpriteFacingCollisionShape(sprite, direction, shapeRight, shapeLeft, usesCustomShape) {
        if (!sprite || !usesCustomShape) return;
        const desired = direction === 'left' ? shapeLeft : shapeRight;
        if (!desired) return;
        try {
            const prevX = sprite.x;
            const prevY = sprite.y;
            const prevVX = sprite.body?.velocity?.x || 0;
            const prevVY = sprite.body?.velocity?.y || 0;
            const prevCategory = sprite.body?.collisionFilter?.category;
            const prevMask = sprite.body?.collisionFilter?.mask;
            const prevLabel = sprite.body?.label;
            const prevFriction = sprite.body?.friction ?? 0.1;
            const prevFrictionStatic = sprite.body?.frictionStatic ?? 0.5;
            const prevFrictionAir = sprite.body?.frictionAir ?? 0.01;
            const prevBounce = sprite.body?.restitution ?? 0;
            sprite.setBody(clonePhysicsShape(desired));
            sprite.setFixedRotation();
            sprite.setPosition(prevX, prevY);
            sprite.setVelocity(prevVX, prevVY);
            sprite.setFriction(prevFriction);
            sprite.setFrictionStatic(prevFrictionStatic);
            sprite.setFrictionAir(prevFrictionAir);
            sprite.setBounce(prevBounce);
            if (sprite.body?.collisionFilter) {
                if (prevCategory != null) sprite.body.collisionFilter.category = prevCategory;
                if (prevMask != null) sprite.body.collisionFilter.mask = prevMask;
            }
            if (prevLabel) sprite.body.label = prevLabel;
            this.setPlayerCollisionFilter(sprite);
        } catch (e) {
            console.warn('No se pudo invertir shape de colision por direccion:', e);
        }
    }

    fitSpriteWithoutStretch(sprite, targetWidth, targetHeight) {
        const frame = sprite.frame;
        if (!frame || !frame.width || !frame.height) return;
        // Escala proporcional tipo "cover": llena pantalla sin deformar.
        const scaleX = targetWidth / frame.width;
        const scaleY = targetHeight / frame.height;
        const scale = Math.max(scaleX, scaleY);
        sprite.setScale(scale, scale);
    }

    cleanupInputHandlers() {
        if (!this.input?.keyboard) return;
        if (this.onFallbackAttackDown) {
            this.input.keyboard.off('keydown-J', this.onFallbackAttackDown);
            this.onFallbackAttackDown = null;
        }
        if (this.onEscToMenu) {
            this.input.keyboard.off('keydown-ESC', this.onEscToMenu);
            this.onEscToMenu = null;
        }
        if (this.attackFallbackKeyP1) {
            this.input.keyboard.removeKey(this.attackFallbackKeyP1, true);
            this.attackFallbackKeyP1 = null;
        }
    }

    trySpawnAmbientBackgroundSprite(chosenDeathOverlayKey, selectedMap = {}) {
        const preferredKey = selectedMap?.bgSpriteKey || selectedMap?.bgFxSpriteKey || chosenDeathOverlayKey || 'life_lost_bg_sheet';
        if (!preferredKey || !this.textures.exists(preferredKey)) return;

        const viewportW = this.cameras.main.width;
        const viewportH = this.cameras.main.height;
        const targetWidth = this.bgImage ? this.bgImage.displayWidth : viewportW;
        const targetHeight = this.bgImage ? this.bgImage.displayHeight : viewportH;
        const centerX = this.bgImage ? this.bgImage.x : (viewportW / 2);
        const centerY = this.bgImage ? this.bgImage.y : (viewportH / 2);
        const fxDepth = 50; // Aumentar profundidad para que sea visible

        const fx = this.add.sprite(centerX, centerY, preferredKey, 0)
            .setScrollFactor(0)
            .setDepth(fxDepth)
            .setAlpha(0.3)
            .setVisible(true);
        this.fitSpriteWithoutStretch(fx, targetWidth, targetHeight);

        const tex = this.textures.get(preferredKey);
        const total = tex?.frameTotal || 1;
        if (total > 1) {
            const animKey = `ambient_bg_fx_${preferredKey}`;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(preferredKey, { start: 0, end: Math.max(0, total - 1) }),
                    frameRate: 24,
                    repeat: 0
                });
            }
            fx.play(animKey, true);
        }

        this.tweens.add({
            targets: fx,
            alpha: { from: 0.3, to: 0.65 },
            duration: 300,
            yoyo: true,
            hold: 600,
            ease: 'Sine.Out',
            onComplete: () => fx.destroy()
        });
    }
}

function clonePhysicsShape(shape) {
    return JSON.parse(JSON.stringify(shape));
}
