# 🧪 GUÍA DE PRUEBA Y SOLUCIÓN DE PROBLEMAS

## ✅ Checklist Pre-Prueba

Antes de probar, verifica que:

```
☑ Los 3 sprites existen en Sprites/:
  ☑ Sprite-tierra.png
  ☑ Sprite-aire.png
  ☑ Sprite-caida.png

☑ Los archivos fueron modificados:
  ☑ js/scenes/PreloadScene.js
  ☑ js/assets/animations.js
  ☑ js/assets/characters.js
  ☑ js/scenes/PlayScene.js

☑ No hay errores de sintaxis en los archivos

☑ El tamaño de frame de los spritesheets es 64x64
  (Si es diferente, actualiza en PreloadScene.js)
```

---

## 🎮 Pasos para Probar

### Paso 1: Iniciar el Juego
```
1. Abre index.html en un navegador
2. Espera a que cargue (debe ver "JUEGO 2D")
```

### Paso 2: Seleccionar Personaje 1
```
1. Ingresa tu nombre en el input
2. Presiona ENTER
3. En SelectScene, verifica que esté seleccionado "Personaje 1"
   (Usa flechas < > si es necesario)
4. Haz clic en "INICIAR PARTIDA"
```

### Paso 3: Probar el Salto
```
1. En PlayScene, presiona ESPACIO para saltar
2. Observa los cambios de sprite:
   
   SUBIDA (primeros 100-200ms):
   ┌─────────────────────┐
   │   DEBE VERSE:       │
   │ Sprite-aire.png     │
   │ (personaje flotando)│
   └─────────────────────┘
   
   BAJADA (últimos 200-300ms):
   ┌─────────────────────┐
   │   DEBE VERSE:       │
   │ Sprite-caida.png    │
   │ (personaje cayendo) │
   └─────────────────────┘
   
   ATERRIZAJE (al tocar piso):
   ┌─────────────────────┐
   │   DEBE VERSE:       │
   │ Sprite-tierra.png   │
   │ (personaje de pie)  │
   └─────────────────────┘
```

### Paso 4: Probar Múltiples Saltos
```
Presiona ESPACIO varias veces seguidas para ver:
- Transiciones suaves
- Sin lag o parpadeos
- Las 3 animaciones en secuencia correcta
```

---

## 🔍 Pruebas Específicas

### Prueba A: Velocidad Correcta de Sprites
**Objetivo:** Verificar que el sprite cambia cuando la velocidad lo requiere

```javascript
// Para verificar, abre la consola (F12) y escribe:
// Esto mostrará la velocidad vertical en tiempo real

// En PlayScene.update(), agregue temporalmente:
console.log('Vel Y:', this.player.body.velocity.y, 
            'Anim:', this.player.anims.currentAnim?.key);
```

**Resultado esperado:**
```
Vel Y: -450 Anim: personaje1_jump_air     ✓
Vel Y: -200 Anim: personaje1_jump_air     ✓
Vel Y: -10  Anim: personaje1_jump_air     ✓
Vel Y: 50   Anim: personaje1_jump_fall    ✓
Vel Y: 300  Anim: personaje1_jump_fall    ✓
Vel Y: 0    Anim: personaje1_jump_ground  ✓
```

---

### Prueba B: Sin Movimiento Horizontal
**Objetivo:** Verifica que funciona sin caminar

```
1. En PlayScene, no presiones flechas izq/der
2. Solo presiona ESPACIO
3. El personaje debe saltar en línea recta
4. Las animaciones deben cambiar correctamente
```

---

### Prueba C: Saltar Mientras Caminas
**Objetivo:** Verifica que funciona mientras se mueve

```
1. Mantén presionada la flecha DERECHA
2. Presiona ESPACIO para saltar
3. El personaje debe:
   - Verse caminando + saltando
   - Mostrar sprites de salto (aire, caida)
   - NO mostrar sprite de caminar durante el salto
```

---

### Prueba D: Caída Libre
**Objetivo:** Verifica que muestra caida al caer desde plataforma

```
1. Sube a una plataforma alta
2. Camina y cae del borde
3. Durante la caída, DEBE verse:
   - Sprite-caida.png
   - NO debe cambiar hasta tocar el suelo
```

---

## ⚠️ Problemas Comunes y Soluciones

### ❌ Problema 1: El sprite no cambia al saltar

**Síntoma:** Siempre muestra el mismo sprite

**Causas posibles:**
1. Los archivos PNG no se cargaron
2. El nombre del spritesheet no coincide
3. createJumpStateAnimations() no se ejecutó

**Solución:**

```javascript
// En PreloadScene, add debug:
create() {
    // ... código existente ...
    
    // DEBUG: Verificar que se cargaron
    console.log('✓ personaje1_jump_ground loaded:', 
        this.textures.exists('personaje1_jump_ground'));
    console.log('✓ personaje1_jump_air loaded:', 
        this.textures.exists('personaje1_jump_air'));
    console.log('✓ personaje1_jump_fall loaded:', 
        this.textures.exists('personaje1_jump_fall'));
    
    // Verificar animaciones creadas
    console.log('✓ jump_ground anim exists:', 
        this.anims.exists('personaje1_jump_ground'));
    console.log('✓ jump_air anim exists:', 
        this.anims.exists('personaje1_jump_air'));
    console.log('✓ jump_fall anim exists:', 
        this.anims.exists('personaje1_jump_fall'));
}
```

### ❌ Problema 2: El sprite parpadea rápido

**Síntoma:** La animación se ve inestable

**Causa:** Los thresholds (-50, 50) están saltando constantemente

**Solución:** Aumenta los thresholds en animations.js:

```javascript
// Cambiar de:
const isMovingUp = player.body.velocity.y < -50;
const isMovingDown = player.body.velocity.y > 50;

// A:
const isMovingUp = player.body.velocity.y < -100;
const isMovingDown = player.body.velocity.y > 100;
```

### ❌ Problema 3: Error "getCharacterAnimationConfig is not defined"

**Síntoma:** Error en consola al cargar

**Causa:** Falta importar la función en animations.js

**Solución:** Asegúrate que animations.js tenga:

```javascript
import { getCharacterAnimationConfig } from './characters.js';
```

### ❌ Problema 4: Solo funciona para Personaje 1

**Síntoma:** Otros personajes no saltan correctamente

**Causa:** Es INTENCIONAL - solo Personaje 1 tiene animaciones de salto

**Solución:** Si quieres agregar para otro personaje:

```javascript
// En animations.js, playJumpStateAnimation()

if (characterIndex === 0) {
    // Lógica actual para Personaje 1
} else if (characterIndex === 1) {
    // Agregar lógica similar para Personaje 2
} else {
    // Mantener funcionalidad original
}
```

### ❌ Problema 5: El personaje desaparece

**Síntoma:** Al saltar, el personaje no se ve

**Causa:** Frame incorrecto del spritesheet

**Solución:** Verifica el tamaño del frame:

```javascript
// En PreloadScene, si el sprite no es 64x64, cambia:
this.load.spritesheet('personaje1_jump_ground', 'Sprites/Sprite-tierra.png', {
    frameWidth: 64,  // ← Cambiar si es diferente
    frameHeight: 64
});
```

### ❌ Problema 6: Sprite cargado pero sin frames

**Síntoma:** El sprite muestra como imagen estática

**Causa:** El spritesheet no tiene múltiples frames

**Solución:** Abre los PNG y verifica que tengan:
- Múltiples frames horizontales o en grid
- Tamaño correcto
- Si no tienen frames, úsalos como imágenes:

```javascript
// En PreloadScene:
this.load.image('personaje1_jump_ground', 'Sprites/Sprite-tierra.png');

// En animations.js:
// No crear animación, solo setTexture
player.setTexture('personaje1_jump_ground');
```

---

## 📊 Verificación Completa

### Script para verificar todo en consola:

```javascript
// Ejecuta en la consola (F12) durante PlayScene

function verificarAnimaciones() {
    console.log('=== VERIFICACIÓN DE ANIMACIONES ===');
    
    // 1. Verificar texturas
    console.log('\n📦 TEXTURAS CARGADAS:');
    console.log('- jump_ground:', this.scene.get('PreloadScene').textures.exists('personaje1_jump_ground'));
    console.log('- jump_air:', this.scene.get('PreloadScene').textures.exists('personaje1_jump_air'));
    console.log('- jump_fall:', this.scene.get('PreloadScene').textures.exists('personaje1_jump_fall'));
    
    // 2. Verificar animaciones
    console.log('\n🎬 ANIMACIONES CREADAS:');
    console.log('- jump_ground:', this.anims.exists('personaje1_jump_ground'));
    console.log('- jump_air:', this.anims.exists('personaje1_jump_air'));
    console.log('- jump_fall:', this.anims.exists('personaje1_jump_fall'));
    
    // 3. Estado del jugador
    console.log('\n👾 ESTADO DEL JUGADOR:');
    console.log('- En piso:', this.player.body.onFloor());
    console.log('- Velocidad Y:', this.player.body.velocity.y);
    console.log('- Animación actual:', this.player.anims.currentAnim?.key || 'ninguna');
}

// Llámalo cuando estés en PlayScene
```

---

## ✨ Indicadores de Éxito

```
✓ ÉXITO 1: Al saltar, el sprite es Sprite-aire.png
✓ ÉXITO 2: Al caer, el sprite es Sprite-caida.png  
✓ ÉXITO 3: Al aterrizar, el sprite es Sprite-tierra.png
✓ ÉXITO 4: Las transiciones son suaves sin parpadeos
✓ ÉXITO 5: Funciona con múltiples saltos seguidos
✓ ÉXITO 6: Funciona al saltar mientras caminas
```

---

## 📝 Log de Pruebas

Usa esta tabla para documentar tus pruebas:

```
| Prueba | Fecha | Resultado | Notas |
|--------|-------|-----------|-------|
| Carga PreloadScene | | ✓/✗ | |
| Selecciona Personaje 1 | | ✓/✗ | |
| Primer salto | | ✓/✗ | |
| Múltiples saltos | | ✓/✗ | |
| Saltar + Caminar | | ✓/✗ | |
| Caída libre | | ✓/✗ | |
| Transiciones suaves | | ✓/✗ | |
```

---

## 🆘 Necesitas Más Ayuda?

Si algo sigue sin funcionar:

1. **Revisa la consola (F12)** para mensajes de error
2. **Verifica los nombres de archivos** (mayúsculas/minúsculas)
3. **Comprueba que los PNG existen** en Sprites/
4. **Limpia el caché del navegador** (Ctrl+Shift+Supr)
5. **Prueba en otro navegador** (Chrome, Firefox, Edge)

