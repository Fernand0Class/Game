// Configuración general del juego
export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    }
};

// Configuración de mundo
export const worldConfig = {
    gravity: 800,
    worldBounds: {
        width: 1800,
        height: 600
    }
};

// Configuración de jugador
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
    fallLimit: 150,
    jumpForce: -500,
    moveSpeed: 260,
    respawnDelay: 800
};

// Configuración de plataformas
export const platformsConfig = [
    {
        name: 'P1',
        y: (height) => height - 80,
        startX: (width) => width / 2 - 320,
        endX: (width) => width / 2 + 320,
        tileSize: 32,
        description: 'Base grande en el medio (más ancha)'
    },
    {
        name: 'P2',
        y: (height) => height - 200,
        startX: (width) => width / 2 - 520,
        endX: (width) => width / 2 - 300,
        tileSize: 32,
        description: 'Plataforma izquierda (más lejana)'
    },
    {
        name: 'P3',
        y: (height) => height - 240,
        startX: (width) => width / 2 + 300,
        endX: (width) => width / 2 + 520,
        tileSize: 32,
        description: 'Plataforma derecha (más lejana)'
    },
    {
        name: 'P4',
        y: (height) => height - 380,
        startX: (width) => width / 2 - 160,
        endX: (width) => width / 2 + 160,
        tileSize: 32,
        description: 'Plataforma superior (más separada)'
    }
];

// Configuración de HUD
export const hudConfig = {
    fontSize: {
        title: '48px',
        label: '18px',
        button: '16px',
        info: '14px'
    },
    colors: {
        text: '#ffffff',
        error: '#ffdddd',
        success: '#00ffcc',
        warning: '#aaaaaa',
        gameOver: '#ff4444'
    }
};
