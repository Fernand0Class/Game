// Definición de personajes - Cada uno con su propia configuración
export const charactersData = [
    {
        id: 0,
        name: 'Personaje 1',
        color: 0xffffff,
        unlocked: true,
        texture: 'personaje1',
        description: 'Personaje base',
        scale: 1.4,
        walkAnimationKey: 'personaje1_walk',
        idleAnimationKey: 'personaje1_idle',
        jumpAnimationKey: 'personaje1_jump_ground',
        walkSpritesheet: 'personaje1_walk',
        idleSpritesheet: 'personaje1_idle',
        jumpSpritesheet: 'personaje1_jump_ground',
        jumpGroundSpritesheet: 'personaje1_jump_ground',
        jumpAirSpritesheet: 'personaje1_jump_air',
        jumpFallSpritesheet: 'personaje1_jump_fall',
        body: {
            width: 32,
            height: 48
        }
    },
    {
        id: 1,
        name: 'Black and White',
        color: 0xffffff,
        unlocked: true,
        texture: 'personaje2',
        description: 'Personaje secundario',
        scale: 1.4,
        walkAnimationKey: 'personaje2_walk',
        idleAnimationKey: 'personaje2_idle',
        jumpAnimationKey: null,
        walkSpritesheet: 'sprite_caminar',
        idleSpritesheet: 'sprite_respirar',
        jumpSpritesheet: null,
        body: {
            width: 32,
            height: 48
        }
    },
    {
        id: 2,
        name: 'Rayo',
        color: 0xff5555,
        unlocked: true,
        description: 'Personaje eléctrico',
        texture: 'personaje1',
        scale: 1.4,
        walkAnimationKey: 'rayo_walk',
        idleAnimationKey: 'rayo_idle',
        jumpAnimationKey: null,
        walkSpritesheet: null,
        idleSpritesheet: null,
        jumpSpritesheet: null,
        body: {
            width: 32,
            height: 48
        }
    },
    {
        id: 3,
        name: 'Sombra',
        color: 0x5555ff,
        unlocked: true,
        description: 'Personaje oscuro',
        texture: 'personaje1',
        scale: 1.4,
        walkAnimationKey: 'sombra_walk',
        idleAnimationKey: 'sombra_idle',
        jumpAnimationKey: null,
        walkSpritesheet: null,
        idleSpritesheet: null,
        jumpSpritesheet: null,
        body: {
            width: 32,
            height: 48
        }
    },
    {
        id: 4,
        name: 'Verde',
        color: 0x55ff55,
        unlocked: false,
        description: 'Personaje bloqueado',
        texture: 'personaje1',
        scale: 1.4,
        walkAnimationKey: 'verde_walk',
        idleAnimationKey: 'verde_idle',
        jumpAnimationKey: null,
        walkSpritesheet: null,
        idleSpritesheet: null,
        jumpSpritesheet: null,
        body: {
            width: 32,
            height: 48
        }
    },
    {
        id: 5,
        name: 'Dorado',
        color: 0xffdd55,
        unlocked: false,
        description: 'Personaje bloqueado',
        texture: 'personaje1',
        scale: 1.4,
        walkAnimationKey: 'dorado_walk',
        idleAnimationKey: 'dorado_idle',
        jumpAnimationKey: null,
        walkSpritesheet: null,
        idleSpritesheet: null,
        jumpSpritesheet: null,
        body: {
            width: 32,
            height: 48
        }
    }
];

// Función para obtener personaje por ID
export function getCharacter(index) {
    return charactersData[index] || charactersData[0];
}

// Función para obtener todas los personajes desbloqueados
export function getUnlockedCharacters() {
    return charactersData.filter(char => char.unlocked);
}

// Función para validar si personaje está desbloqueado
export function isCharacterUnlocked(index) {
    const char = getCharacter(index);
    return char.unlocked;
}

// Función para obtener textura del personaje
export function getCharacterTexture(index, scene) {
    const char = getCharacter(index);
    let textureKey = 'char';
    
    if (char.texture) {
        if (char.texture === 'personaje2') {
            // Para personaje 2, preferir la versión limpia del fondo o animaciones
            if (scene.textures.exists('personaje2_clean')) {
                textureKey = 'personaje2_clean';
            } else if (scene.textures.exists('sprite_caminar')) {
                textureKey = 'sprite_caminar';
            } else {
                textureKey = 'personaje2';
            }
        } else if (scene.textures.exists(char.texture + '_clean')) {
            textureKey = char.texture + '_clean';
        } else if (scene.textures.exists(char.texture)) {
            textureKey = char.texture;
        }
    }
    
    return textureKey;
}

// Función para obtener escala del personaje
export function getCharacterScale(index) {
    const char = getCharacter(index);
    return char.scale || 1.4;
}

// Función para obtener configuración de animaciones
export function getCharacterAnimationConfig(index) {
    const char = getCharacter(index);
    return {
        walkAnimationKey: char.walkAnimationKey,
        idleAnimationKey: char.idleAnimationKey,
        jumpAnimationKey: char.jumpAnimationKey,
        walkSpritesheet: char.walkSpritesheet,
        idleSpritesheet: char.idleSpritesheet,
        jumpSpritesheet: char.jumpSpritesheet
    };
}

// Función para obtener configuración del body
export function getCharacterBodyConfig(index) {
    const char = getCharacter(index);
    return char.body || { width: 32, height: 48 };
}

// Función para limpiar fondo del personaje 2
export function cleanPersonaje2Background(scene) {
    if (scene.textures.exists('personaje2') && typeof document !== 'undefined') {
        try {
            const src = scene.textures.get('personaje2').getSourceImage();
            const w = src.width;
            const h = src.height;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(src, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            const r0 = data[0], g0 = data[1], b0 = data[2];
            const threshold = 60;
            for (let i = 0; i < data.length; i += 4) {
                const dr = Math.abs(data[i] - r0);
                const dg = Math.abs(data[i + 1] - g0);
                const db = Math.abs(data[i + 2] - b0);
                if (dr + dg + db < threshold) {
                    data[i + 3] = 0;
                }
            }
            ctx.putImageData(imgData, 0, 0);
            scene.textures.addCanvas('personaje2_clean', canvas);
        } catch (e) {
            console.warn('No se pudo limpiar Personaje 2:', e);
        }
    }
}
