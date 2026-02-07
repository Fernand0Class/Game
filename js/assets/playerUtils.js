// Utilitarios para el jugador
import { playerConfig } from '../config/gameConfig.js';

// Función para obtener punto de spawn del jugador
export function getSpawnPoint(width, height) {
    return {
        x: width / 2,
        y: height - 230
    };
}

// Función para verificar si jugador cayó del mundo
export function hasPlayerFallenOffWorld(player, height) {
    return player.y > height + playerConfig.fallLimit;
}

// Función para hacer que el jugador salte
export function makePlayerJump(player) {
    if (player.body.onFloor()) {
        player.setVelocityY(playerConfig.jumpForce);
    }
}

// Función para mover jugador horizontalmente
export function movePlayer(player, direction) {
    if (direction === 'left') {
        player.setVelocityX(-playerConfig.moveSpeed);
        player.flipX = true;
    } else if (direction === 'right') {
        player.setVelocityX(playerConfig.moveSpeed);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }
}

// Función para resetear velocidad horizontal
export function resetPlayerVelocityX(player) {
    player.setVelocityX(0);
}
