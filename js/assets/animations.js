// Definiciones de animaciones
export const animationsConfig = {
    caminar: {
        key: 'sprite_caminar',
        frameRate: 10,
        repeat: -1,
        description: 'Animación de caminata'
    },
    respirar: {
        key: 'sprite_respirar',
        frameRate: 4,
        repeat: -1,
        description: 'Animación de respiración (idle)'
    }
};

// Función para crear animaciones en una escena
export function createAnimations(scene) {
    if (scene.textures.exists('sprite_caminar')) {
        try {
            const total = scene.textures.get('sprite_caminar').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('sprite_caminar')) {
                scene.anims.create({
                    key: 'sprite_caminar',
                    frames: scene.anims.generateFrameNumbers('sprite_caminar', { start: 0, end }),
                    frameRate: animationsConfig.caminar.frameRate,
                    repeat: animationsConfig.caminar.repeat
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación sprite_caminar:', e);
        }
    }

    if (scene.textures.exists('sprite_respirar')) {
        try {
            const total = scene.textures.get('sprite_respirar').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('sprite_respirar')) {
                scene.anims.create({
                    key: 'sprite_respirar',
                    frames: scene.anims.generateFrameNumbers('sprite_respirar', { start: 0, end }),
                    frameRate: animationsConfig.respirar.frameRate,
                    repeat: animationsConfig.respirar.repeat
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación sprite_respirar:', e);
        }
    }
}

// Función para reproducir animación de caminata
export function playWalkAnimation(player, scene) {
    if (player.body.onFloor() && scene.anims.exists('sprite_caminar')) {
        player.anims.play('sprite_caminar', true);
    }
}

// Función para reproducir animación de idle
export function playIdleAnimation(player, scene) {
    if (player.body.onFloor() && scene.anims.exists('sprite_respirar')) {
        player.anims.play('sprite_respirar', true);
    } else if (scene.anims.exists('sprite_caminar')) {
        player.anims.stop();
        player.setFrame(0);
    }
}

// Función para detener animación
export function stopAnimation(player) {
    player.anims.stop();
    player.setFrame(0);
}
