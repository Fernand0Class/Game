// Definición de personajes
export const charactersData = [
    {
        id: 0,
        name: 'Personaje 1',
        color: 0xffffff,
        unlocked: true,
        texture: 'personaje1',
        description: 'Personaje base'
    },
    {
        id: 1,
        name: 'Black and White',
        color: 0xffffff,
        unlocked: true,
        texture: 'personaje2',
        description: 'Personaje secundario',
        spritesheet: 'sprite_caminar'
    },
    {
        id: 2,
        name: 'Rayo',
        color: 0xff5555,
        unlocked: true,
        description: 'Personaje eléctrico'
    },
    {
        id: 3,
        name: 'Sombra',
        color: 0x5555ff,
        unlocked: true,
        description: 'Personaje oscuro'
    },
    {
        id: 4,
        name: 'Verde',
        color: 0x55ff55,
        unlocked: false,
        description: 'Personaje bloqueado'
    },
    {
        id: 5,
        name: 'Dorado',
        color: 0xffdd55,
        unlocked: false,
        description: 'Personaje bloqueado'
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
        if (char.texture === 'personaje2' && scene.textures.exists('sprite_caminar')) {
            textureKey = 'sprite_caminar';
        } else if (scene.textures.exists(char.texture + '_clean')) {
            textureKey = char.texture + '_clean';
        } else if (scene.textures.exists(char.texture)) {
            textureKey = char.texture;
        }
    }
    
    return textureKey;
}

// Función para obtener escala del personaje según textura
export function getCharacterScale(textureKey) {
    if (textureKey === 'char') {
        return 1.6;
    } else if (textureKey.endsWith('_walk') || textureKey === 'sprite_caminar') {
        return 2.0;
    } else {
        return 1.4;
    }
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
