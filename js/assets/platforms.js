// Definición de plataformas
export const platformsConfig = [
    {
        name: 'Plataforma base',
        y: (height) => height - 130,
        startX: (width) => width / 2 - 192,
        endX: (width) => width / 2 + 192,
        tileSize: 32,
        description: 'Base grande en el medio'
    },
    {
        name: 'Plataforma izquierda',
        y: (height) => height - 250,
        startX: (width) => width / 2 - 450 - 110,
        endX: (width) => width / 2 - 320 + 96,
        tileSize: 32,
        description: 'Plataforma izquierda'
    },
    {
        name: 'Plataforma derecha',
        y: (height) => height - 250,
        startX: (width) => width / 2 + 450 - 110,
        endX: (width) => width / 2 + 320 + 96,
        tileSize: 32,
        description: 'Plataforma derecha'
    },
    {
        name: 'Plataforma superior',
        y: (height) => height - 365,
        startX: (width) => width / 2 - 60,
        endX: (width) => width / 2 + 75,
        tileSize: 32,
        description: 'Plataforma superior'
    }
];

// Función para crear todas las plataformas
export function createAllPlatforms(scene, physics) {
    const { width, height } = scene.scale;
    const platforms = physics.add.staticGroup();

    platformsConfig.forEach((platform) => {
        for (let x = platform.startX(width); x < platform.endX(width); x += platform.tileSize) {
            platforms.create(x, platform.y(height), 'tileset', 0)
                .setOrigin(0, 1)
                .setDisplaySize(platform.tileSize, platform.tileSize)
                .refreshBody();
        }
    });

    return platforms;
}

// Función para obtener información de plataforma
export function getPlatformInfo(platformName) {
    return platformsConfig.find(p => p.name === platformName);
}

// Función para obtener todas las plataformas
export function getAllPlatforms() {
    return platformsConfig;
}
