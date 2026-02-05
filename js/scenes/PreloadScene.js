import { createAnimations } from '../assets/animations.js';
import { initializeAudio } from '../assets/audio.js';
import { cleanPersonaje2Background } from '../assets/characters.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Audio
        this.load.audio('bgm', ['audio/musica retro.mp3']);
        
        // Imágenes de personajes
        this.load.image('personaje1', 'Personajes/Personaje 1.png');
        this.load.image('personaje2', 'Personajes/Personaje 2.png');
        
        // Spritesheets de animaciones
        this.load.spritesheet('sprite_caminar', 'sprites/Sprite Caminar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('sprite_respirar', 'sprites/sprite respirar.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Fondo y tileset
        this.load.image('bg', 'Textures/Imagen de fonder.png');
        this.load.spritesheet('tileset', 'Tiles/Tileset.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // Inicializar audio
        initializeAudio(this);
        
        // Limpiar fondo del personaje 2
        cleanPersonaje2Background(this);
        
        // Crear animaciones
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
