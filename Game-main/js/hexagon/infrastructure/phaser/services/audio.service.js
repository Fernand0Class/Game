// Configuracion de audio
export const audioConfig = {
    bgm: {
        defaultVolume: 0.6,
        transitionMs: 900,
        tracks: {
            menu: {
                key: 'bgm_menu',
                path: 'audio/musica retro.mp3',
                loop: true,
                volumeMultiplier: 1.12,
                description: 'Musica del menu'
            },
            game: {
                key: 'bgm_game',
                path: 'audio/Pantalla de Pixels.mp3',
                loop: true,
                volumeMultiplier: 0.55,
                description: 'Musica del mapa'
            }
        }
    },
    click: {
        key: 'ui_click',
        path: 'audio/click.mp3',
        volumeMultiplier: 1.5
    },
    rayo: {
        key: 'ui_rayo',
        path: 'efectos de sonido/Efecto de rayo Para boton de play.wav',
        volumeMultiplier: 1.35
    },
    lifeLost: {
        key: 'life_lost_fx',
        path: 'efectos de sonido/efecto para el fondo.wav',
        volumeMultiplier: 1.0
    },
    characterJump: {
        byCharacter: {
            0: { key: 'jump_chonier', path: 'efectos de sonido/efecto sonido salto personaje chonier.wav', volumeMultiplier: 0.95 },
            1: { key: 'jump_bw', path: 'efectos de sonido/Efecto de sonido salto personaje 2.wav', volumeMultiplier: 0.95 },
            2: { key: 'jump_titan', path: 'efectos de sonido/efecto sonido salto personaje titan.wav', volumeMultiplier: 0.95 },
            3: { key: 'jump_aurum', path: 'efectos de sonido/efecto de salto personaje Aurum.wav', volumeMultiplier: 0.95 },
            4: { key: 'jump_hollow', path: 'efectos de sonido/Efecto de saldo personaje Hollow Night.wav', volumeMultiplier: 0.95 }
        }
    },
    walk: {
        byCharacter: {
            0: { key: 'walk_chonier', path: 'efectos de sonido/Efecto de caminar personaje chonier .wav', volumeMultiplier: 0.9 },
            1: { key: 'walk_bw', path: 'efectos de sonido/Efecto de caminar personaje 2 .wav', volumeMultiplier: 1.2 },
            2: { key: 'walk_titan', path: 'efectos de sonido/Efecto caminar personaje Titan.wav', volumeMultiplier: 0.95 },
            3: { key: 'walk_aurum', path: 'efectos de sonido/Efecto de caminar personaje Aurum.wav', volumeMultiplier: 0.9 },
            4: { key: 'walk_hollow', path: 'efectos de sonido/Efecto de caminar Personaje hollow night.wav', volumeMultiplier: 0.9 }
        }
    },
    characterAttack: {
        byCharacter: {
            0: { key: 'attack_chonier', path: 'efectos de sonido/Efecto de ataque Personaje Chonier.wav', volumeMultiplier: 0.95, minIntervalMs: 0, maxInstances: 4, restartIfPlaying: false },
            1: { key: 'attack_bw', path: 'efectos de sonido/Efecto de ataque personaje 2.wav', volumeMultiplier: 0.95, minIntervalMs: 0, maxInstances: 4, restartIfPlaying: false },
            2: { key: 'attack_titan', path: 'efectos de sonido/Efecto de ataque Personaje Titan.wav', volumeMultiplier: 0.95, minIntervalMs: 0, maxInstances: 4, restartIfPlaying: false },
            3: { key: 'attack_aurum', path: 'efectos de sonido/Efecto de ataque Personaje Aurum.wav', volumeMultiplier: 0.95, minIntervalMs: 0, maxInstances: 4, restartIfPlaying: false },
            4: { key: 'attack_hollow', path: 'efectos de sonido/Efecto de ataque Hollow night.wav', volumeMultiplier: 0.95, minIntervalMs: 0, maxInstances: 4, restartIfPlaying: false }
        }
    },
    characterDeath: {
        byCharacter: {
            0: { key: 'death_chonier', path: 'efectos de sonido/Efecto de morir Personaje Chonier.wav', volumeMultiplier: 1.70 },
            1: { key: 'death_bw', path: 'efectos de sonido/Efecto de morir personaje 2.wav', volumeMultiplier: 1.55 },
            2: { key: 'death_titan', path: 'efectos de sonido/Efecto de morir Personaje Titan.wav', volumeMultiplier: 1.55 },
            3: { key: 'death_aurum', path: 'efectos de sonido/Efecto morir Personaje Aurum.wav', volumeMultiplier: 1.55 },
            4: { key: 'death_hollow', path: 'efectos de sonido/Efecto de morir Personaje Hollow Night.wav', volumeMultiplier: 1.55 }
        }
    }
};

// Inicializa audio en el registro global de Phaser
export function initializeAudio(scene) {
    const defaultVolume = audioConfig.bgm.defaultVolume;
    const menuMusic = scene.sound.add(audioConfig.bgm.tracks.menu.key, {
        loop: audioConfig.bgm.tracks.menu.loop,
        volume: getTrackTargetVolume(scene, 'menu', defaultVolume)
    });
    const gameMusic = scene.sound.add(audioConfig.bgm.tracks.game.key, {
        loop: audioConfig.bgm.tracks.game.loop,
        volume: getTrackTargetVolume(scene, 'game', defaultVolume)
    });

    const tracks = {
        menu: menuMusic,
        game: gameMusic
    };

    scene.registry.set('bgmTracks', tracks);
    scene.registry.set('bgmTrackName', 'menu');
    scene.registry.set('bgm', menuMusic);
    scene.registry.set('volume', defaultVolume);
    scene.registry.set('muted', false);

    return menuMusic;
}

// Cambia pista de fondo activa (menu o game) sin reiniciar de forma innecesaria
export function setBgmTrack(scene, trackName) {
    const tracks = scene.registry.get('bgmTracks');
    if (!tracks || !tracks[trackName]) return;

    const currentName = scene.registry.get('bgmTrackName');
    const current = scene.registry.get('bgm');
    const next = tracks[trackName];
    const muted = !!scene.registry.get('muted');
    const targetVolume = muted ? 0 : getTrackTargetVolume(scene, trackName);
    const transitionMs = audioConfig.bgm.transitionMs;

    if (currentName === trackName && current === next) return;

    scene.registry.set('bgmTrackName', trackName);
    scene.registry.set('bgm', next);
    syncAudio(scene);

    if (!current || current === next || !current.isPlaying) {
        if (!next.isPlaying) {
            next.play();
        }
        if (!muted) {
            next.setVolume(0);
            scene.tweens.add({
                targets: next,
                volume: targetVolume,
                duration: transitionMs,
                ease: 'Sine.Out'
            });
        }
        return;
    }

    if (!next.isPlaying) {
        next.play();
    }
    next.setVolume(0);

    scene.tweens.add({
        targets: current,
        volume: 0,
        duration: transitionMs,
        ease: 'Sine.Out',
        onComplete: () => {
            if (current && current.isPlaying) current.stop();
        }
    });
    if (!muted) {
        scene.tweens.add({
            targets: next,
            volume: targetVolume,
            duration: transitionMs,
            ease: 'Sine.Out'
        });
    }
}

// Reproduce musica de fondo activa si no esta sonando
export function playAudio(scene) {
    const music = scene.registry.get('bgm');
    if (music && !music.isPlaying) {
        music.play();
    }
}

// Ajusta volumen global
export function setVolume(scene, volume) {
    const clampedVolume = Phaser.Math.Clamp(volume, 0, 1);
    scene.registry.set('volume', clampedVolume);
    const tracks = scene.registry.get('bgmTracks');
    if (tracks) {
        Object.entries(tracks).forEach(([trackName, music]) => {
            if (music) music.setVolume(clampedVolume);
            if (music) music.setVolume(getTrackTargetVolume(scene, trackName, clampedVolume));
        });
    } else {
        const music = scene.registry.get('bgm');
        if (music) music.setVolume(clampedVolume);
    }
}

// Alterna modo mute
export function toggleMute(scene) {
    const muted = !scene.registry.get('muted');
    scene.registry.set('muted', muted);
    const tracks = scene.registry.get('bgmTracks');
    if (tracks) {
        Object.values(tracks).forEach((music) => {
            if (music) music.setMute(muted);
        });
    } else {
        const music = scene.registry.get('bgm');
        if (music) music.setMute(muted);
    }
    return muted;
}

// Sincroniza estado de audio (volumen + mute)
export function syncAudio(scene) {
    const volume = scene.registry.get('volume') ?? audioConfig.bgm.defaultVolume;
    const muted = !!scene.registry.get('muted');
    const tracks = scene.registry.get('bgmTracks');

    if (tracks) {
        Object.entries(tracks).forEach(([trackName, music]) => {
            if (!music) return;
            music.setVolume(muted ? 0 : getTrackTargetVolume(scene, trackName, volume));
            music.setMute(muted);
        });
    } else {
        const music = scene.registry.get('bgm');
        if (music) {
            music.setVolume(volume);
            music.setMute(muted);
        }
    }
}

// SFX de UI para botones/menu
export function playClickSfx(scene) {
    if (!scene || !scene.sound || !scene.cache?.audio?.exists(audioConfig.click.key)) return;
    if (scene.registry?.get('muted')) return;
    const baseVolume = scene.registry?.get('volume') ?? audioConfig.bgm.defaultVolume;
    const volume = Phaser.Math.Clamp(baseVolume * audioConfig.click.volumeMultiplier, 0, 1);
    try {
        scene.sound.play(audioConfig.click.key, { volume });
    } catch (e) {
        // Evitar romper flujo de UI por fallo puntual de audio.
    }
}

// SFX de rayo para hover del boton Play
export function playRayoSfx(scene) {
    if (!scene || !scene.sound || !scene.cache?.audio?.exists(audioConfig.rayo.key)) return;
    if (scene.registry?.get('muted')) return;
    const baseVolume = scene.registry?.get('volume') ?? audioConfig.bgm.defaultVolume;
    const volume = Phaser.Math.Clamp(baseVolume * audioConfig.rayo.volumeMultiplier, 0, 1);
    try {
        scene.sound.play(audioConfig.rayo.key, { volume });
    } catch (e) {
        // Evitar romper flujo de UI por fallo puntual de audio.
    }
}

// SFX del fondo de perder vida
export function playLifeLostFxSfx(scene) {
    if (!scene || !scene.sound || !scene.cache?.audio?.exists(audioConfig.lifeLost.key)) return;
    if (scene.registry?.get('muted')) return;
    const baseVolume = scene.registry?.get('volume') ?? audioConfig.bgm.defaultVolume;
    const volume = Phaser.Math.Clamp(baseVolume * audioConfig.lifeLost.volumeMultiplier, 0, 1);
    try {
        scene.sound.play(audioConfig.lifeLost.key, { volume });
    } catch (e) {
        // Evitar romper gameplay por fallo puntual de audio.
    }
}

// SFX de salto por personaje (si existe para ese personaje)
export function playJumpSfxForCharacter(scene, characterIndex) {
    playCharacterSfx(scene, audioConfig.characterJump.byCharacter?.[characterIndex]);
}

// SFX de caminar por personaje (pasos)
export function playWalkSfxForCharacter(scene, characterIndex) {
    playCharacterSfx(scene, audioConfig.walk.byCharacter?.[characterIndex]);
}

// SFX de ataque por personaje (preparado, aun no usado en gameplay)
export function playAttackSfxForCharacter(scene, characterIndex) {
    const idx = normalizeCharacterIndex(characterIndex);
    const entry = audioConfig.characterAttack.byCharacter?.[idx];
    if (!entry) return;
    stopCharacterAttackSfxGroup(scene, entry.key);
    playCharacterSfx(scene, entry);
}

// SFX de muerte por personaje
export function playDeathSfxForCharacter(scene, characterIndex) {
    playCharacterSfx(scene, audioConfig.characterDeath.byCharacter?.[characterIndex]);
}

function getTrackTargetVolume(scene, trackName, baseVolumeOverride) {
    const baseVolume = baseVolumeOverride ?? scene?.registry?.get('volume') ?? audioConfig.bgm.defaultVolume;
    const mul = audioConfig.bgm.tracks?.[trackName]?.volumeMultiplier ?? 1;
    return Phaser.Math.Clamp(baseVolume * mul, 0, 1);
}

function playCharacterSfx(scene, entry) {
    if (!entry) return;
    if (!scene || !scene.sound || !scene.cache?.audio?.exists(entry.key)) return;
    if (scene.registry?.get('muted')) return;
    if (!canPlaySfxNow(scene, entry)) return;
    if (entry.restartIfPlaying) stopActiveSfxByKey(scene, entry.key);
    const baseVolume = scene.registry?.get('volume') ?? audioConfig.bgm.defaultVolume;
    const volume = Phaser.Math.Clamp(baseVolume * (entry.volumeMultiplier ?? 1), 0, 1);
    try {
        scene.sound.play(entry.key, { volume });
    } catch (e) {
        // No bloquear gameplay por error puntual de audio.
    }
}

function canPlaySfxNow(scene, entry) {
    const now = scene.time?.now ?? Date.now();
    const key = entry.key;
    const minIntervalMs = Number(entry.minIntervalMs) || 0;
    const maxInstances = Number(entry.maxInstances) || 0;

    if (minIntervalMs > 0) {
        const lastMap = scene.registry.get('sfxLastPlayedAtByKey') || {};
        const last = Number(lastMap[key]) || 0;
        if (now - last < minIntervalMs) return false;
        lastMap[key] = now;
        scene.registry.set('sfxLastPlayedAtByKey', lastMap);
    }

    if (maxInstances > 0) {
        const activeSameKey = scene.sound
            .getAll()
            .filter((s) => s?.key === key && s?.isPlaying).length;
        if (activeSameKey >= maxInstances) return false;
    }

    return true;
}

function stopActiveSfxByKey(scene, key) {
    if (!scene?.sound || !key) return;
    const active = scene.sound.getAll().filter((s) => s?.key === key && s?.isPlaying);
    active.forEach((s) => {
        try {
            s.stop();
        } catch (e) {
            // Ignorar errores puntuales de stop.
        }
    });
}

function stopCharacterAttackSfxGroup(scene, exceptKey) {
    if (!scene?.sound) return;
    const attackEntries = audioConfig.characterAttack?.byCharacter || {};
    const attackKeys = Object.values(attackEntries)
        .map((e) => e?.key)
        .filter(Boolean)
        .filter((k, i, arr) => arr.indexOf(k) === i && k !== exceptKey);
    if (attackKeys.length === 0) return;
    scene.sound.getAll()
        .filter((s) => attackKeys.includes(s?.key) && s?.isPlaying)
        .forEach((s) => {
            try {
                s.stop();
            } catch (e) {
                // Ignorar errores puntuales de stop.
            }
        });
}

function normalizeCharacterIndex(characterIndex) {
    const n = Number(characterIndex);
    return Number.isFinite(n) ? n : characterIndex;
}
