import { createAnimations } from '../assets/animations.js';
import { initializeAudio } from '../assets/audio.js';
import { cleanPersonaje2Background } from '../assets/characters.js';
import { createJumpStateAnimations } from '../assets/animations.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Audio
        this.load.audio('bgm', ['audio/Pantalla de Pixels.mp3']);
        
        // Imágenes de personajes - Usar rutas case-sensitive
        this.load.image('personaje1', 'personajes/personaje 1.png');
        this.load.image('personaje2', 'personajes/personaje 2.png');
        
        // Spritesheets de animaciones - Personaje 1
        this.load.spritesheet('personaje1_walk', 'Sprites/Animacion caminar personaje 1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('personaje1_idle', 'Sprites/Animacion Descanso personaje 1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('personaje1_jump_ground', 'Sprites/Sprite-tierra-personaje1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('personaje1_jump_air', 'Sprites/Sprite-aire-personaje1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('personaje1_jump_fall', 'Sprites/Sprite-caida-personaje1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Spritesheets de animaciones - Personaje 2
        this.load.spritesheet('sprite_caminar', 'Sprites/Sprite Caminar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('sprite_respirar', 'Sprites/sprite respirar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Fondo y tileset
        this.load.image('bg', 'textures/imagen de fonder.png');
        this.load.spritesheet('tileset', 'tiles/tileset.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // Inicializar audio
        initializeAudio(this);
        
        // Limpiar fondo del personaje 2
        cleanPersonaje2Background(this);
        
        // Crear animaciones (incluye las nuevas de salto)
        createAnimations(this);
        
        // Ocultar indicador de carga
        try {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        } catch (e) { }
        
        // Iniciar MenuScene
        this.scene.start('MenuScene');
    }
}
