import { createAnimations } from '../services/animations.service.js';
import { initializeAudio } from '../services/audio.service.js';
import { ensureControlsConfig } from './ControlsConfigScene.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Audio
        this.load.audio('bgm_menu', ['js/hexagon/infrastructure/phaser/resources/assets/audio/musica retro.mp3']);
        this.load.audio('bgm_game', ['js/hexagon/infrastructure/phaser/resources/assets/audio/Pantalla de Pixels.mp3']);
        this.load.audio('ui_click', ['js/hexagon/infrastructure/phaser/resources/assets/audio/click.mp3']);
        this.load.audio('ui_rayo', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de rayo Para boton de play.wav']);
        this.load.audio('life_lost_fx', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/efecto para el fondo.wav']);
        this.load.audio('jump_chonier', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/efecto sonido salto personaje chonier.wav']);
        this.load.audio('jump_bw', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de sonido salto personaje 2.wav']);
        this.load.audio('jump_titan', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/efecto sonido salto personaje titan.wav']);
        this.load.audio('jump_aurum', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/efecto de salto personaje Aurum.wav']);
        this.load.audio('jump_hollow', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de saldo personaje Hollow Night.wav']);
        this.load.audio('walk_chonier', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de caminar personaje chonier .wav']);
        this.load.audio('walk_bw', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de caminar personaje 2 .wav']);
        this.load.audio('walk_titan', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto caminar personaje Titan.wav']);
        this.load.audio('walk_aurum', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de caminar personaje Aurum.wav']);
        this.load.audio('walk_hollow', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de caminar Personaje hollow night.wav']);
        this.load.audio('attack_chonier', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de ataque Personaje Chonier.wav']);
        this.load.audio('attack_bw', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de ataque personaje 2.wav']);
        this.load.audio('attack_titan', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de ataque Personaje Titan.wav']);
        this.load.audio('attack_aurum', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de ataque Personaje Aurum.wav']);
        this.load.audio('attack_hollow', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de ataque Hollow night.wav']);
        this.load.audio('death_chonier', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de morir Personaje Chonier.wav']);
        this.load.audio('death_bw', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de morir personaje 2.wav']);
        this.load.audio('death_titan', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de morir Personaje Titan.wav']);
        this.load.audio('death_aurum', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto morir Personaje Aurum.wav']);
        this.load.audio('death_hollow', ['js/hexagon/infrastructure/phaser/resources/assets/efectos de sonido/Efecto de morir Personaje Hollow Night.wav']);

        // Imagenes base de personajes (carpeta Personajes)
        this.load.image('personaje1', 'js/hexagon/infrastructure/phaser/resources/assets/Personajes/Personaje 1.png');
        this.load.image('personaje2', 'js/hexagon/infrastructure/phaser/resources/assets/Personajes/Personaje 2.png');
        this.load.image('personaje4', 'js/hexagon/infrastructure/phaser/resources/assets/Personajes/Personaje 4.png');
        this.load.image('personaje5', 'js/hexagon/infrastructure/phaser/resources/assets/Personajes/Personaje 5.png');
        this.load.image('personaje6', 'js/hexagon/infrastructure/phaser/resources/assets/Personajes/Personaje 6.png');

        // Spritesheets de animaciones - Aero (Personaje 1)
        this.load.spritesheet('aero_walk_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aero_caminar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('aero_idle_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aero_reposo.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('aero_jump_ground_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aero_salto_tierra.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('aero_jump_air_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aero_salto_aire.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('aero_jump_fall_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aero_salto_caida.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Spritesheets de animaciones - Black and White (Personaje 2)
        this.load.spritesheet('bw_walk_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/blackwhite_caminar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('bw_idle_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/blackwhite_reposo.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('bw_attack_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/sprite ataque personaje black and white.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Spritesheets de Aurum (Personaje 5)
        this.load.spritesheet('aurum_walk_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aurum_caminar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('aurum_jump_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aurum_saltar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('aurum_idle_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/aurum_reposo.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('aurum_attack_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/sprite de ataque araum.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('titan_walk_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/titan_caminar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('titan_jump_start_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Titan saltando.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('titan_jump_fall_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Titan callendo.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('titan_idle_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/titan_reposo.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hollow_walk_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Caminata6.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hollow_attack_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Ataque pj 6.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hollow_jump_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Animacion de saltar pj6.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('titan_attack_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/Sprite ataque personaje Titan.png', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('life_lost_bg_sheet', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/fondo_perder_vida.png', {
            frameWidth: 1312,
            frameHeight: 704
        });
        this.load.image('menu_play_rayo_estatico', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Icono rayo estatico .png');
        this.load.image('menu_play_texto_estatico', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/boton play estatico .png');
        this.load.image('menu_controls_icon', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Icono de mando Controles.png');
        this.load.image('menu_play_bg', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/fondo para el boton de play.png');
        this.load.image('menu_controls_bg', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Fondo para los controles.png');
        this.load.image('menu_panel_bg', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Fondo para los settings y el cambio de nombre.png');
        this.load.image('player_card_1', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/tarjeta1 azul.png');
        this.load.image('player_card_2', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/tarjeta2 Roja.png');
        this.load.image('player_card_3', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/tarjeta3 amarilla.png');
        this.load.image('player_card_4', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/tarjeta4 verde.png');
        this.load.spritesheet('menu_play_rayo_anim', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/Icono rayo animacion rayo .png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('menu_play_texto_anim', 'js/hexagon/infrastructure/phaser/resources/assets/Sprites/boton play animacion .png', {
            frameWidth: 128,
            frameHeight: 128
        });

        // Fondo y tileset
        this.load.image('bg', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Imagen de fonder.png');
        this.load.image('bg2', 'js/hexagon/infrastructure/phaser/resources/assets/Textures/Imagen de fonder 2.png');
        this.load.image('tilesetImage', 'js/hexagon/infrastructure/phaser/resources/assets/Tiles/Tileset.png');
        this.load.spritesheet('tileset', 'js/hexagon/infrastructure/phaser/resources/assets/Tiles/Tileset.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.tilemapTiledJSON('mapa1', 'js/hexagon/infrastructure/phaser/resources/mapa 1.json');

        // Colision Matter exportada desde PhysicsEditor (Personaje 2)
        this.load.json('personaje2_collision_shape', 'js/hexagon/infrastructure/phaser/resources/coliciones personaje black and white.json');
        this.load.json('chonier_collision_shape', 'js/hexagon/infrastructure/phaser/resources/coliciones personaje chonier.json');
        this.load.json('titan_collision_shape', 'js/hexagon/infrastructure/phaser/resources/coliciones personaje Titan.json');
        this.load.json('aurum_collision_shape', 'js/hexagon/infrastructure/phaser/resources/coliciones personaje Aurum.json');
        this.load.json('hollow_collision_shape', 'js/hexagon/infrastructure/phaser/resources/coliciones personaje hollow.json');
        // Hitbox de ataque de Titan (frame 2) exportada desde PhysicsEditor
        this.load.json('titan_attack_hitbox_shape', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/hutbox personaje Titan.json');
        // Hitbox de ataque de Aurum/Araum (frame 2) exportada desde PhysicsEditor
        this.load.json('aurum_attack_hitbox_shape', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/hutbox personaje Araum.json');
        // Hitbox de ataque de Black and White exportada desde PhysicsEditor
        this.load.json('bw_attack_hitbox_shape', 'js/hexagon/infrastructure/phaser/resources/assets/Ataques de personajes/hutbox personaje black and white.json');
    }

    create() {
        initializeAudio(this);
        ensureControlsConfig(this);
        createAnimations(this);

        try {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) loadingElement.style.display = 'none';
        } catch (e) { }

        this.scene.start('MenuScene');
    }
}
