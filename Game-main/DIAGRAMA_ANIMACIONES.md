# 🎯 Diagrama de Flujo - Sistema de Animaciones de Salto

## Lógica de Estados del Salto

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSONAJE 1 SALTA                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Presiona ESPACIO │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ makePlayerJump()         │
                    │ setVelocityY(-500)       │
                    └──────────────────────────┘
                              │
                              ▼
          ┌─────────────────────────────────────────┐
          │  En cada FRAME (update loop)            │
          │  playJumpStateAnimation() se ejecuta    │
          └─────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   EN AIRE?  │ │  SUBIENDO?  │ │  CAYENDO?   │
        │(not Floor)  │ │(Vel.y<-50)  │ │(Vel.y>50)   │
        └─────────────┘ └─────────────┘ └─────────────┘
             │               │               │
             ├─── NO ────────┼─── NO ────────┤
             │               │               │
             │               ▼               │
             │          ┌──────────┐         │
             │          │ SUBIENDO │         │
             │          └──────────┘         │
             │               │               │
             │               ▼               │
             │       ┌───────────────┐       │
             │       │ Sprite-aire.png       │
             │       │ (JUMP_AIR)    │       │
             │       └───────────────┘       │
             │                               │
             │          ┌──────────┐         │
             │          │ CAYENDO  │ ◄──────┤
             │          └──────────┘         │
             │               │               │
             │               ▼               │
             │       ┌───────────────┐       │
             │       │Sprite-caida.png      │
             │       │ (JUMP_FALL)   │       │
             │       └───────────────┘       │
             │                               │
             │                   ┌─────────────┐
             │                   │  TOCA PISO? │
             │                   │ (onFloor)   │
             │                   └─────────────┘
             │                         │
             ▼                         ▼
        ┌───────────────┐       ┌───────────────┐
        │ EN EL SUELO   │       │ EN EL SUELO   │
        │ (onFloor)     │       │ (onFloor)     │
        └───────────────┘       └───────────────┘
                │                     │
                └──────────┬──────────┘
                           ▼
                  ┌───────────────────┐
                  │ Sprite-tierra.png │
                  │ (JUMP_GROUND)     │
                  └───────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ FIN DEL SALTO   │
                    └─────────────────┘
```

---

## Tabla de Velocidades y Estados

| Velocidad Y (player.body.velocity.y) | Estado | Sprite | Descripción |
|--------------------------------------|--------|--------|-------------|
| **< -50** | SUBIENDO | Sprite-aire.png | Personaje va hacia arriba rápidamente |
| **-50 a 0** | SUBIENDO (lento) | Sprite-aire.png | Personaje casi llega al pico |
| **0 a 50** | BAJANDO (lento) | Sprite-aire.png | Comienza a bajar |
| **> 50** | CAYENDO | Sprite-caida.png | Personaje cae rápidamente |
| **0** (En piso) | EN TIERRA | Sprite-tierra.png | Personaje está en el suelo |

---

## Secuencia Temporal de un Salto Completo

```
Tiempo    │ Evento              │ Velocidad Y │ Estado    │ Sprite
──────────┼─────────────────────┼─────────────┼───────────┼──────────────────
0ms       │ Presiona ESPACIO    │ 0           │ EN TIERRA │ Sprite-tierra
          │                     │             │           │
50ms      │ Aplica fuerza jump  │ -500        │ SUBIENDO  │ Sprite-aire
          │                     │             │           │
100ms     │ Resistencia aire    │ -400        │ SUBIENDO  │ Sprite-aire
          │                     │             │           │
200ms     │ Llega al pico       │ 0           │ PICO      │ Sprite-aire
          │                     │             │           │
300ms     │ Comienza a bajar    │ +100        │ BAJANDO   │ Sprite-aire
          │                     │             │           │
400ms     │ Cae más rápido      │ +300        │ CAYENDO   │ Sprite-caida
          │                     │             │           │
500ms     │ Aceleración máxima  │ +500        │ CAYENDO   │ Sprite-caida
          │                     │             │           │
600ms     │ Toca plataforma     │ 0           │ EN TIERRA │ Sprite-tierra
          │                     │             │           │
```

---

## Flujo de Código en PlayScene.js

```javascript
// En update() - se ejecuta cada frame (~60 veces por segundo)

// 1. Detectar entrada de salto (solo una vez)
if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
    makePlayerJump(this.player);  // Aplica velocidad negativa
}

// 2. Actualizar animación según estado ACTUAL (cada frame)
playJumpStateAnimation(this.player, this, this.player.characterIndex);
    ├─ Verifica si isJumping = !player.body.onFloor()
    ├─ Si NO está saltando:
    │   └─ Muestra Sprite-tierra
    ├─ Si está saltando hacia ARRIBA (velocity.y < -50):
    │   └─ Muestra Sprite-aire
    └─ Si está saltando hacia ABAJO (velocity.y > 50):
        └─ Muestra Sprite-caida
```

---

## Análisis de Dependencias

```
PlayScene.js
    │
    ├─→ playJumpStateAnimation() [animations.js]
    │        │
    │        └─→ getCharacterAnimationConfig() [characters.js]
    │
    └─→ makePlayerJump() [playerUtils.js]


PreloadScene.js
    │
    └─→ createAnimations() [animations.js]
            │
            └─→ createJumpStateAnimations()
                    └─ this.load.spritesheet() × 3
                        ├─ 'personaje1_jump_ground'
                        ├─ 'personaje1_jump_air'
                        └─ 'personaje1_jump_fall'


characters.js
    │
    └─ charactersData[0] (Personaje 1)
            ├─ jumpGroundSpritesheet: 'personaje1_jump_ground'
            ├─ jumpAirSpritesheet: 'personaje1_jump_air'
            └─ jumpFallSpritesheet: 'personaje1_jump_fall'
```

---

## Pseudocódigo de playJumpStateAnimation()

```javascript
function playJumpStateAnimation(player, scene, characterIndex) {
    // Solo para Personaje 1
    if (characterIndex === 0) {
        
        // ¿Está saltando?
        const isJumping = !player.body.onFloor();
        
        // ¿Hacia dónde va?
        const isMovingUp = player.body.velocity.y < -50;
        const isMovingDown = player.body.velocity.y > 50;
        
        if (isJumping) {
            // Está en el aire
            if (isMovingUp) {
                // Subiendo rápido
                reproducir('personaje1_jump_air');
            } else if (isMovingDown) {
                // Cayendo
                reproducir('personaje1_jump_fall');
            }
        } else {
            // En el suelo
            reproducir('personaje1_jump_ground');
        }
    }
}
```

---

## Variables Clave en Phaser

```javascript
// Velocidad vertical (pixels por segundo)
player.body.velocity.y
    ├─ Negativa (< 0) = Movimiento hacia arriba
    ├─ Positiva (> 0) = Movimiento hacia abajo
    └─ Cero (0) = Sin movimiento vertical

// Posición
player.body.onFloor()
    ├─ true = Tocando una plataforma
    └─ false = En el aire

// Animación
player.anims.play('clave_animacion', true)
    └─ true = ignora si la animación ya está en reproducción
```

---

## Optimización de Thresholds

Si quieres ajustar cuándo cambia de Sprite-aire a Sprite-caida:

```javascript
// Actual (sensible)
const isMovingUp = player.body.velocity.y < -50;
const isMovingDown = player.body.velocity.y > 50;

// Más sensible (cambia más rápido)
const isMovingUp = player.body.velocity.y < -100;
const isMovingDown = player.body.velocity.y > 100;

// Menos sensible (mantiene más tiempo en aire)
const isMovingUp = player.body.velocity.y < -10;
const isMovingDown = player.body.velocity.y > 10;
```

