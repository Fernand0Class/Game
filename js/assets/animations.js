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

    // Crear animaciones de salto por estado (tierra, aire, caída)
    createJumpStateAnimations(scene);

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

// Función para reproducir animación según estado del salto
export function playJumpStateAnimation(player, scene, characterIndex) {
    // Solo aplicar lógica de salto avanzada para personaje 1
    if (characterIndex === 0) {
        // Determinar si está subiendo, en el aire o cayendo
        const isJumping = !player.body.onFloor();
        const isMovingUp = player.body.velocity.y < -50;
        const isMovingDown = player.body.velocity.y > 50;
        
        if (isJumping) {
            if (isMovingUp) {
                // Subiendo - mostrar sprite de aire
                if (scene.anims.exists('personaje1_jump_air')) {
                    player.anims.play('personaje1_jump_air', true);
                }
            } else if (isMovingDown) {
                // Cayendo - mostrar sprite de caída
                if (scene.anims.exists('personaje1_jump_fall')) {
                    player.anims.play('personaje1_jump_fall', true);
                }
            }
        } else {
            // En el suelo - mostrar sprite de tierra
            if (scene.anims.exists('personaje1_jump_ground')) {
                player.anims.play('personaje1_jump_ground', true);
            }
        }
    } else {
        // Para otros personajes, usar animación de salto por defecto
        const config = getCharacterAnimationConfig(characterIndex);
        if (config.jumpAnimationKey && scene.anims.exists(config.jumpAnimationKey)) {
            player.anims.play(config.jumpAnimationKey);
        }
    }
}

// Función para reproducir animación de salto (compatibilidad)
export function playJumpAnimation(player, scene, characterIndex) {
    playJumpStateAnimation(player, scene, characterIndex);
}

// Función para detener animación
export function stopAnimation(player) {
    player.anims.stop();
    player.setFrame(0);
}

// Función para crear animaciones de estados de salto (tierra, aire, caída)
export function createJumpStateAnimations(scene) {
    // Personaje 1 - Animaciones de salto por estado
    if (scene.textures.exists('personaje1_jump_ground')) {
        try {
            const total = scene.textures.get('personaje1_jump_ground').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_jump_ground')) {
                scene.anims.create({
                    key: 'personaje1_jump_ground',
                    frames: scene.anims.generateFrameNumbers('personaje1_jump_ground', { start: 0, end }),
                    frameRate: 3,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_jump_ground:', e);
        }
    }

    if (scene.textures.exists('personaje1_jump_air')) {
        try {
            const total = scene.textures.get('personaje1_jump_air').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_jump_air')) {
                scene.anims.create({
                    key: 'personaje1_jump_air',
                    frames: scene.anims.generateFrameNumbers('personaje1_jump_air', { start: 0, end }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_jump_air:', e);
        }
    }

    if (scene.textures.exists('personaje1_jump_fall')) {
        try {
            const total = scene.textures.get('personaje1_jump_fall').frameTotal;
            const end = Math.max(0, total - 1);
            if (!scene.anims.exists('personaje1_jump_fall')) {
                // Generar frames con el último frame repetido para transición suave
                const frames = scene.anims.generateFrameNumbers('personaje1_jump_fall', { start: 0, end });
                // Repetir el último frame 6 veces más para transición suave
                for (let i = 0; i < 6; i++) {
                    frames.push(end);
                }
                scene.anims.create({
                    key: 'personaje1_jump_fall',
                    frames: frames,
                    frameRate: 5,
                    repeat: 0
                });
            }
        } catch (e) {
            console.warn('No se pudo crear animación personaje1_jump_fall:', e);
        }
    }
}
