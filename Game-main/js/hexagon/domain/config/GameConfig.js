// Configuracion general del juego
export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    pixelArt: true,
    render: {
        antialias: false,
        roundPixels: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1800,
        height: 900
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1.8 },
            debug: true
        }
    }
};

// Configuracion de jugador
export const playerConfig = {
    collisionBody: {
        widthPercent: 0.52,
        heightPercent: 0.72,
        offsetYPercent: -0.1,
        offsetXPercent: -0.10
    },
    scales: {
        char: 1.1,
        spritesheet: 1.3,
        default: 0.9
    },
    fallLimit: 260,
    jumpForce: -17,
    moveSpeed: 6.8,
    respawnDelay: 800
};
