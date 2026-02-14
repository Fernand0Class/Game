// Utilitarios para el jugador
import { playerConfig } from '../../../domain/config/GameConfig.js';

// Funcion para obtener punto de spawn del jugador
export function getSpawnPoint(width, height) {
    return {
        x: width / 2,
        y: height - 230
    };
}

// Funcion para verificar si jugador cayo del mundo
export function hasPlayerFallenOffWorld(player, height) {
    return player.y > height + playerConfig.fallLimit;
}

// Funcion para hacer que el jugador salte
export function makePlayerJump(player) {
    player.setVelocityY(playerConfig.jumpForce);
}

// Funcion para mover jugador horizontalmente
export function movePlayer(player, direction) {
    if (direction === 'left') {
        player.setVelocityX(-playerConfig.moveSpeed);
        player.setAngularVelocity(0);
        player.setAngle(0);
    } else if (direction === 'right') {
        player.setVelocityX(playerConfig.moveSpeed);
        player.setAngularVelocity(0);
        player.setAngle(0);
    } else {
        player.setVelocityX(0);
        player.setAngularVelocity(0);
        player.setAngle(0);
    }
}

// Funcion para resetear velocidad horizontal
export function resetPlayerVelocityX(player) {
    player.setVelocityX(0);
    player.setAngularVelocity(0);
    player.setAngle(0);
}

// Helpers de estado para Matter
export function isBodyGroundLike(body) {
    return !!(body && (body.label === 'platform' || body.isStatic));
}

export function isPlayerGroundedByPair(playerBody, pair) {
    if (!playerBody || !pair) return false;

    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;
    const playerRoot = playerBody.parent || playerBody;
    const rootA = bodyA?.parent || bodyA;
    const rootB = bodyB?.parent || bodyB;

    const isPlayerInPair = rootA === playerRoot || rootB === playerRoot;
    if (!isPlayerInPair) return false;

    const otherBody = rootA === playerRoot ? rootB : rootA;

    if (!otherBody || !isBodyGroundLike(otherBody)) return false;

    const playerBottom = playerRoot.bounds.max.y;
    const otherTop = otherBody.bounds.min.y;
    const isNearTopFace = playerBottom <= otherTop + 20;
    const isFallingOrStill = playerBody.velocity.y >= -1;

    return isNearTopFace && isFallingOrStill;
}

