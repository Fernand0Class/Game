import { getCharacterAnimationConfig } from '../../../domain/entities/Character.js';

export function createAnimations(scene) {
    createAnimationFromSheet(scene, 'aero_walk', 'aero_walk_sheet', 10, -1);
    createAnimationFromSheet(scene, 'aero_idle', 'aero_idle_sheet', 4, -1);
    createAnimationFromSheet(scene, 'bw_walk', 'bw_walk_sheet', 10, -1);
    createAnimationFromSheet(scene, 'bw_idle', 'bw_idle_sheet', 4, -1);
    createAnimationFromSheet(scene, 'bw_attack', 'bw_attack_sheet', 12, 0);
    createAnimationFromSheet(scene, 'titan_walk', 'titan_walk_sheet', 10, -1);
    createAnimationFromSheet(scene, 'titan_idle', 'titan_idle_sheet', 4, -1);
    createAnimationFromSheet(scene, 'titan_attack', 'titan_attack_sheet', 12, 0);
    createAnimationFromSheet(scene, 'titan_jump_start', 'titan_jump_start_sheet', 10, 0);
    createAnimationFromSheet(scene, 'titan_jump_fall', 'titan_jump_fall_sheet', 10, 0);
    createAnimationFromSheet(scene, 'aurum_walk', 'aurum_walk_sheet', 10, -1);
    createAnimationFromSheet(scene, 'aurum_idle', 'aurum_idle_sheet', 4, -1);
    createAnimationFromSheet(scene, 'aurum_jump', 'aurum_jump_sheet', 8, 0);
    createAnimationFromSheet(scene, 'aurum_attack', 'aurum_attack_sheet', 12, 0);
    createAnimationFromSheet(scene, 'hollow_walk', 'hollow_walk_sheet', 10, -1);
    createAnimationFromSheet(scene, 'hollow_attack', 'hollow_attack_sheet', 12, 0);
    createAnimationFromSheet(scene, 'hollow_jump', 'hollow_jump_sheet', 8, 0);
    createJumpStateAnimations(scene);
}

export function playWalkAnimation(player, scene, characterIndex, isOnGround = true) {
    if (!isOnGround) return;
    const config = getCharacterAnimationConfig(characterIndex);
    if (config.walkAnimationKey && scene.anims.exists(config.walkAnimationKey)) {
        player.anims.play(config.walkAnimationKey, true);
    }
}

export function playIdleAnimation(player, scene, characterIndex, isOnGround = true) {
    if (!isOnGround) {
        player.anims.stop();
        player.setFrame(0);
        return;
    }
    const config = getCharacterAnimationConfig(characterIndex);
    if (config.idleAnimationKey && scene.anims.exists(config.idleAnimationKey)) {
        player.anims.play(config.idleAnimationKey, true);
    } else {
        player.anims.stop();
        player.setFrame(0);
    }
}

export function playJumpStateAnimation(player, scene, characterIndex) {
    if (characterIndex === 0) {
        const isJumping = player.isOnGround !== true;
        const isMovingUp = player.body.velocity.y < -50;
        const isMovingDown = player.body.velocity.y > 50;

        if (isJumping) {
            if (isMovingUp && scene.anims.exists('aero_jump_air')) {
                player.anims.play('aero_jump_air', true);
            } else if (isMovingDown && scene.anims.exists('aero_jump_fall')) {
                player.anims.play('aero_jump_fall', true);
            }
        } else if (scene.anims.exists('aero_jump_ground')) {
            player.anims.play('aero_jump_ground', true);
        }
        return;
    }

    const config = getCharacterAnimationConfig(characterIndex);
    if (config.jumpAnimationKey && scene.anims.exists(config.jumpAnimationKey)) {
        player.anims.play(config.jumpAnimationKey);
    }
}

export function playJumpAnimation(player, scene, characterIndex) {
    playJumpStateAnimation(player, scene, characterIndex);
}

export function stopAnimation(player) {
    player.anims.stop();
    player.setFrame(0);
}

export function createJumpStateAnimations(scene) {
    createAnimationFromSheet(scene, 'aero_jump_ground', 'aero_jump_ground_sheet', 3, -1);
    createAnimationFromSheet(scene, 'aero_jump_air', 'aero_jump_air_sheet', 10, -1);

    if (!scene.textures.exists('aero_jump_fall_sheet') || scene.anims.exists('aero_jump_fall')) return;

    try {
        const total = scene.textures.get('aero_jump_fall_sheet').frameTotal;
        const end = Math.max(0, total - 1);
        const frames = scene.anims.generateFrameNumbers('aero_jump_fall_sheet', { start: 0, end });
        for (let i = 0; i < 6; i += 1) frames.push({ key: 'aero_jump_fall_sheet', frame: end });

        scene.anims.create({
            key: 'aero_jump_fall',
            frames,
            frameRate: 5,
            repeat: 0
        });
    } catch (e) {
        console.warn('No se pudo crear animacion aero_jump_fall:', e);
    }
}

function createAnimationFromSheet(scene, animKey, sheetKey, frameRate, repeat) {
    if (!scene.textures.exists(sheetKey) || scene.anims.exists(animKey)) return;

    try {
        const total = scene.textures.get(sheetKey).frameTotal;
        const end = Math.max(0, total - 1);
        scene.anims.create({
            key: animKey,
            frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end }),
            frameRate,
            repeat
        });
    } catch (e) {
        console.warn(`No se pudo crear animacion ${animKey}:`, e);
    }
}
