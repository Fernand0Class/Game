import { getCharacterAnimationConfig } from './characters.js';

// Función para crear todas las animaciones de personajes
export function createAnimations(scene) {
    // Personaje 1 - Con spritesheets
    if (scene.textures.exists('personaje1_walk')) {
        try {
            const total = scene.textures.get('personaje1_walk').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_walk')) {
                scene.anims.create({
                    key: 'personaje1_walk',
                    frames: scene.anims.generateFrameNumbers('personaje1_walk', { start: 0, end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_walk:', e);
        }
    }

    if (scene.textures.exists('personaje1_idle')) {
        try {
            const total = scene.textures.get('personaje1_idle').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_idle')) {
                scene.anims.create({
                    key: 'personaje1_idle',
                    frames: scene.anims.generateFrameNumbers('personaje1_idle', { start: 0, end }),
                    frameRate: 4,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_idle:', e);
        }
    }

    if (scene.textures.exists('personaje1_jump')) {
        try {
            const total = scene.textures.get('personaje1_jump').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_jump')) {
                scene.anims.create({
                    key: 'personaje1_jump',
                    frames: scene.anims.generateFrameNumbers('personaje1_jump', { start: 0, end }),
                    frameRate: 10,
                    repeat: 0
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_jump:', e);
        }
    }

    // Personaje 2 - Black and White (con spritesheets)
    if (scene.textures.exists('sprite_caminar')) {
        try {
            const total = scene.textures.get('sprite_caminar').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje2_walk')) {
                scene.anims.create({
                    key: 'personaje2_walk',
                    frames: scene.anims.generateFrameNumbers('sprite_caminar', { start: 0, end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje2_walk:', e);
        }
    }

    if (scene.textures.exists('sprite_respirar')) {
        try {
            const total = scene.textures.get('sprite_respirar').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje2_idle')) {
                scene.anims.create({
                    key: 'personaje2_idle',
                    frames: scene.anims.generateFrameNumbers('sprite_respirar', { start: 0, end }),
                    frameRate: 4,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje2_idle:', e);
        }
    }
}

// Función para reproducir animación de caminata
export function playWalkAnimation(player, scene, characterIndex) {
    if (player.body.onFloor()) {
        const config = getCharacterAnimationConfig(characterIndex);
        if (scene.anims.exists(config.walkAnimationKey)) {
            player.anims.play(config.walkAnimationKey, true);
        }
    }
}

// Función para reproducir animación de idle
export function playIdleAnimation(player, scene, characterIndex) {
    if (player.body.onFloor()) {
        const config = getCharacterAnimationConfig(characterIndex);
        if (scene.anims.exists(config.idleAnimationKey)) {
            player.anims.play(config.idleAnimationKey, true);
        }
    } else {
        player.anims.stop();
        player.setFrame(0);
    }
}

// Función para reproducir animación de salto
export function playJumpAnimation(player, scene, characterIndex) {
    const config = getCharacterAnimationConfig(characterIndex);
    if (config.jumpAnimationKey && scene.anims.exists(config.jumpAnimationKey)) {
        player.anims.play(config.jumpAnimationKey);
    }
}

// Función para detener animación
export function stopAnimation(player) {
    player.anims.stop();
    player.setFrame(0);
}
