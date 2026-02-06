// Configuración de audio
export const audioConfig = {
    bgm: {
        key: 'bgm',
        path: 'audio/Pantalla de Pixels.mp3',
        loop: true,
        defaultVolume: 0.6,
        description: 'Música de fondo del juego'
    }
};

// Función para inicializar audio en el registro
export function initializeAudio(scene) {
    const defaultVolume = audioConfig.bgm.defaultVolume;
    const music = scene.sound.add(audioConfig.bgm.key, {
        loop: audioConfig.bgm.loop,
        volume: defaultVolume
    });
    
    scene.registry.set('bgm', music);
    scene.registry.set('volume', defaultVolume);
    scene.registry.set('muted', false);
    
    return music;
}

// Función para reproducir audio
export function playAudio(scene) {
    const music = scene.registry.get('bgm');
    if (music && !music.isPlaying) {
        music.play();
    }
}

// Función para ajustar volumen
export function setVolume(scene, volume) {
    const clampedVolume = Phaser.Math.Clamp(volume, 0, 1);
    scene.registry.set('volume', clampedVolume);
    const music = scene.registry.get('bgm');
    if (music) {
        music.setVolume(clampedVolume);
    }
}

// Función para alternar silencio
export function toggleMute(scene) {
    const muted = !scene.registry.get('muted');
    scene.registry.set('muted', muted);
    const music = scene.registry.get('bgm');
    if (music) {
        music.setMute(muted);
    }
    return muted;
}

// Función para sincronizar audio con configuración guardada
export function syncAudio(scene) {
    const music = scene.registry.get('bgm');
    if (music) {
        music.setVolume(scene.registry.get('volume') ?? audioConfig.bgm.defaultVolume);
        music.setMute(!!scene.registry.get('muted'));
    }
}
