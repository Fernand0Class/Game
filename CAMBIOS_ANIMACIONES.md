# 📝 Cambios en Animaciones de Salto - Personaje 1

## Resumen de Cambios
Se han implementado animaciones dinámicas para el salto del Personaje 1 que cambian según el estado del personaje en el aire.

---

## 🎨 Sprites Utilizados (Carpeta Sprites/)
1. **Sprite-tierra.png** - Se muestra cuando el personaje está en el suelo
2. **Sprite-aire.png** - Se muestra cuando el personaje salta (movimiento hacia arriba)
3. **Sprite-caida.png** - Se muestra cuando el personaje cae (movimiento hacia abajo)

---

## 📋 Archivos Modificados

### 1. **PreloadScene.js** (`js/scenes/PreloadScene.js`)
**Cambios:**
- Se agregaron 3 nuevos spritesheets en la sección `preload()`:
  ```javascript
  this.load.spritesheet('personaje1_jump_ground', 'Sprites/Sprite-tierra.png', {...});
  this.load.spritesheet('personaje1_jump_air', 'Sprites/Sprite-aire.png', {...});
  this.load.spritesheet('personaje1_jump_fall', 'Sprites/Sprite-caida.png', {...});
  ```
- Se importó `createJumpStateAnimations` para crear las animaciones

**Dependencia:** Requiere que los archivos PNG existan en la carpeta `Sprites/`

---

### 2. **animations.js** (`js/assets/animations.js`)
**Cambios principales:**

#### Función: `playJumpStateAnimation(player, scene, characterIndex)`
Nueva función que implementa la lógica inteligente de animación:
- **Si está saltando hacia arriba** (velocity.y < -50): Muestra `personaje1_jump_air`
- **Si está cayendo** (velocity.y > 50): Muestra `personaje1_jump_fall`
- **Si está en el suelo**: Muestra `personaje1_jump_ground`

#### Función: `createJumpStateAnimations(scene)`
Nueva función que crea las 3 animaciones de salto:
- `personaje1_jump_ground` - Desde Sprite-tierra.png
- `personaje1_jump_air` - Desde Sprite-aire.png
- `personaje1_jump_fall` - Desde Sprite-caida.png

#### Función: `createAnimations(scene)` - Actualizada
Ahora llama a `createJumpStateAnimations(scene)` para incluir las nuevas animaciones

---

### 3. **characters.js** (`js/assets/characters.js`)
**Cambios en el Personaje 1:**
```javascript
jumpGroundSpritesheet: 'personaje1_jump_ground',
jumpAirSpritesheet: 'personaje1_jump_air',
jumpFallSpritesheet: 'personaje1_jump_fall',
```
- Se cambió `jumpSpritesheet` de `'personaje1_jump'` a `'personaje1_jump_ground'`
- Se agregaron propiedades para los otros estados de salto

---

### 4. **PlayScene.js** (`js/scenes/PlayScene.js`)
**Cambios:**

#### Import:
```javascript
import { playWalkAnimation, playIdleAnimation, playJumpStateAnimation, stopAnimation } from '../assets/animations.js';
```
(Cambio de `playJumpAnimation` a `playJumpStateAnimation`)

#### Función `update()`:
- Removido: `playJumpAnimation()` que se ejecutaba solo al presionar espacio
- Agregado: `playJumpStateAnimation()` en cada frame que actualiza la animación continuamente según el estado del personaje

```javascript
// Actualizar animación de salto según estado (tierra, aire, caída)
playJumpStateAnimation(this.player, this, this.player.characterIndex);
```

---

## 🔄 Flujo de Ejecución

### Cuando el Personaje 1 Salta:
1. **Presiona Espacio** → `makePlayerJump()` aplica fuerza hacia arriba
2. **Frame Update** → `playJumpStateAnimation()` verifica el estado:
   - 🔼 Movimiento hacia arriba → Muestra **Sprite-aire.png**
   - 🔽 Movimiento hacia abajo → Muestra **Sprite-caida.png**
   - 🚶 Toca el suelo → Muestra **Sprite-tierra.png**
3. **Transición Suave** → Las animaciones cambian automáticamente según la velocidad vertical

---

## ✅ Compatibilidad
- **Personaje 1**: Implementación completa con 3 estados de salto ✓
- **Otros Personajes**: Se mantiene la funcionalidad original (usan animación de salto estándar) ✓

---

## 🐛 Nota Importante
La función `playJumpStateAnimation()` tiene lógica especial SOLO para `characterIndex === 0` (Personaje 1).
Para otros personajes, se ejecuta la animación estándar `playJumpAnimation()`.

---

## 📂 Estructura Esperada de Carpetas
```
Game-main/
├── Sprites/
│   ├── Sprite-tierra.png          ✓ Requerido
│   ├── Sprite-aire.png            ✓ Requerido
│   ├── Sprite-caida.png           ✓ Requerido
│   ├── Animacion caminar personaje 1.png
│   └── Animacion Descanso personaje 1.png
└── js/
    ├── assets/
    │   ├── animations.js          ✓ Modificado
    │   └── characters.js          ✓ Modificado
    └── scenes/
        ├── PlayScene.js           ✓ Modificado
        └── PreloadScene.js        ✓ Modificado
```

---

## 🎮 Cómo Probar
1. Abre el juego normalmente
2. Selecciona "Personaje 1"
3. En la escena de juego, presiona **Espacio** para saltar
4. Observa cómo la animación cambia:
   - Al iniciar el salto: Sprite-aire
   - Cuando alcanza el pico: Sprite-aire
   - Al caer: Sprite-caida
   - Al tocar el suelo: Sprite-tierra

---

## 📝 Notas Técnicas
- Las animaciones usan `repeat: -1` (bucle infinito) para mantener la fluidez visual
- El cambio de animación se calcula en cada frame según `player.body.velocity.y`
- Los thresholds (-50 y +50) pueden ajustarse si se desea cambiar la sensibilidad
- Las 3 animaciones se crean automáticamente en `PreloadScene`

