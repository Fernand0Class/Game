// Definicion de personajes (6 unicos)
export const charactersData = [
    {
        id: 0,
        name: 'Chonier',
        color: 0xffffff,
        allowTint: false,
        unlocked: true,
        texture: 'personaje1',
        description: 'Luchador base',
        scale: 2.2,
        walkAnimationKey: 'aero_walk',
        idleAnimationKey: 'aero_idle',
        jumpAnimationKey: 'aero_jump_ground',
        walkSpritesheet: 'aero_walk_sheet',
        idleSpritesheet: 'aero_idle_sheet',
        jumpSpritesheet: 'aero_jump_ground_sheet',
        body: { width: 32, height: 48 }
    },
    {
        id: 1,
        name: 'Black and White',
        color: 0xffffff,
        allowTint: false,
        unlocked: true,
        texture: 'personaje2',
        description: 'Estilo monocromo',
        scale: 2.2,
        walkAnimationKey: 'bw_walk',
        idleAnimationKey: 'bw_idle',
        jumpAnimationKey: null,
        attackAnimationKey: 'bw_attack',
        walkSpritesheet: 'bw_walk_sheet',
        idleSpritesheet: 'bw_idle_sheet',
        jumpSpritesheet: null,
        attackSpritesheet: 'bw_attack_sheet',
        body: { width: 32, height: 48 }
    },
    {
        id: 2,
        name: 'Titan',
        color: 0xffffff,
        allowTint: false,
        unlocked: true,
        texture: 'personaje4',
        description: 'Luchador pesado',
        scale: 2.15,
        walkAnimationKey: 'titan_walk',
        idleAnimationKey: 'titan_idle',
        jumpAnimationKey: 'titan_jump_start',
        attackAnimationKey: 'titan_attack',
        walkSpritesheet: 'titan_walk_sheet',
        idleSpritesheet: 'titan_idle_sheet',
        jumpSpritesheet: 'titan_jump_start_sheet',
        attackSpritesheet: 'titan_attack_sheet',
        body: { width: 34, height: 52 }
    },
    {
        id: 3,
        name: 'Aurum',
        color: 0xffffff,
        allowTint: false,
        unlocked: true,
        texture: 'personaje5',
        description: 'Movilidad equilibrada',
        scale: 2.2,
        walkAnimationKey: 'aurum_walk',
        idleAnimationKey: 'aurum_idle',
        jumpAnimationKey: 'aurum_jump',
        attackAnimationKey: 'aurum_attack',
        walkSpritesheet: 'aurum_walk_sheet',
        idleSpritesheet: 'aurum_idle_sheet',
        jumpSpritesheet: 'aurum_jump_sheet',
        attackSpritesheet: 'aurum_attack_sheet',
        body: { width: 32, height: 48 }
    },
    {
        id: 4,
        name: 'Hollow Night',
        color: 0xffffff,
        allowTint: false,
        unlocked: true,
        texture: 'personaje6',
        description: 'Luchador veloz',
        scale: 2.2,
        walkAnimationKey: 'hollow_walk',
        idleAnimationKey: 'hollow_idle',
        jumpAnimationKey: 'hollow_jump',
        walkSpritesheet: 'hollow_walk_sheet',
        idleSpritesheet: 'hollow_jump_sheet',
        jumpSpritesheet: 'hollow_jump_sheet',
        attackAnimationKey: 'hollow_attack',
        attackSpritesheet: 'hollow_attack_sheet',
        body: { width: 32, height: 48 }
    }
];

export function getCharacter(index) {
    return charactersData[index] || charactersData[0];
}

export function getUnlockedCharacters() {
    return charactersData.filter(char => char.unlocked);
}

export function isCharacterUnlocked(index) {
    const char = getCharacter(index);
    return char.unlocked;
}

export function getCharacterTexture(index, scene) {
    const char = getCharacter(index);
    let textureKey = 'char';

    if (char.texture) {
        if (char.texture === 'personaje2') {
            if (scene.textures.exists('bw_walk_sheet')) {
                textureKey = 'bw_walk_sheet';
            } else {
                textureKey = 'personaje2';
            }
        } else if (char.texture === 'personaje6') {
            // Para la vista previa en SelectScene, usar personaje6
            // Para el juego, esto será sobreescrito por hollow_walk_sheet en PlayScene
            textureKey = 'personaje6';
        } else if (scene.textures.exists(char.texture + '_clean')) {
            textureKey = char.texture + '_clean';
        } else if (scene.textures.exists(char.texture)) {
            textureKey = char.texture;
        }
    }

    return textureKey;
}

export function getCharacterScale(index) {
    const char = getCharacter(index);
    return char.scale || 1.4;
}

export function getCharacterAnimationConfig(index) {
    const char = getCharacter(index);
    return {
        walkAnimationKey: char.walkAnimationKey,
        idleAnimationKey: char.idleAnimationKey,
        jumpAnimationKey: char.jumpAnimationKey,
        walkSpritesheet: char.walkSpritesheet,
        idleSpritesheet: char.idleSpritesheet,
        jumpSpritesheet: char.jumpSpritesheet,
        attackAnimationKey: char.attackAnimationKey,
        attackSpritesheet: char.attackSpritesheet
    };
}

export function getCharacterBodyConfig(index) {
    const char = getCharacter(index);
    return char.body || { width: 32, height: 48 };
}
