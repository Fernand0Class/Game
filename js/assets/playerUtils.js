// Utilitarios para el jugador
import { playerConfig } from '../config/gameConfig.js';

// Función para configurar cuerpo de colisión del jugador
export function setupPlayerCollision(player, collisionConfig) {
    if (player.body && player.body.setSize) {
        const w = player.displayWidth;
        const h = player.displayHeight;
        // Usar configuración del personaje o la global por defecto
        const config = collisionConfig || playerConfig.collisionBody;
        const bw = Math.round(w * config.widthPercent);
        const bh = Math.round(h * config.heightPercent);
        player.body.setSize(bw, bh);
        
        // Offset X: centrado + ajuste configurado
        const centerX = Math.round((w - bw) / 2);
        const offsetXAdjust = Math.round(w * (config.offsetXPercent || 0));
        const ox = centerX + offsetXAdjust;
        
        // Offset Y
        const oy = Math.round((h - bh) * config.offsetYPercent);
        
        player.body.setOffset(ox, oy);
    }
}

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
