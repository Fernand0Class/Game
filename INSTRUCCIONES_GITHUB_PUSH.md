# Instrucciones para Subir a GitHub

## Estado Actual: ✅ LISTO PARA PUSH

### Repositorio Git Inicializado
- ✅ Repositorio local creado
- ✅ Todos los archivos agregados (45 archivos)
- ✅ Commit realizado: "feat: Sistema completo de animaciones de salto con tres estados"
- ✅ Branch: master
- ✅ Commit hash: 3cb307d

### Configuración Completada
```
Usuario Git: Developer
Email: dev@game.com
Remoto: origin (pendiente de reemplazar [username])
```

---

## PRÓXIMO PASO: Reemplazar URL de GitHub

Antes de hacer `git push`, necesitas actualizar la URL del remoto con tu usuario de GitHub:

### Opción 1: Actualizar la URL existente

```powershell
$env:Path += ";C:\Program Files\Git\cmd"
git remote set-url origin https://github.com/TU_USUARIO/game.git
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

### Opción 2: Remover y agregar nuevo remoto

```powershell
$env:Path += ";C:\Program Files\Git\cmd"
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/game.git
```

---

## Hacer Push a GitHub

Una vez actualizada la URL, ejecuta:

```powershell
$env:Path += ";C:\Program Files\Git\cmd"
git push -u origin master
```

O si tu repositorio usa `main` en lugar de `master`:

```powershell
$env:Path += ";C:\Program Files\Git\cmd"
git push -u origin main
```

---

## Qué se Está Subiendo

### Cambios en Código:
1. **js/assets/animations.js**
   - createJumpStateAnimations() mejorada
   - frameRate ajustados: tierra=3, caída=5
   - Último frame de caída repetido 6 veces

2. **js/scenes/PlayScene.js**
   - Sistema de colisión unificado
   - Lógica de 3 estados de salto
   - Detección a 170px del suelo
   - Delay de 300ms después de aterrizaje

3. **js/scenes/PreloadScene.js**
   - Rutas correctas de sprites
   - Case-sensitive verificado

4. **js/assets/characters.js**
   - Propiedades collisionBody removidas
   - getCharacterCollisionBodyConfig() eliminada

5. **js/assets/playerUtils.js**
   - setupPlayerCollision() removida

### Archivos de Documentación:
- ACTUALIZACIONES_JUMP_ANIMATIONS.md (nuevo)
- Y otros archivos de documentación existentes

### Assets de Sprites:
- Sprite-tierra-personaje1.png
- Sprite-aire-personaje1.png
- Sprite-caida-personaje1.png

---

## Verificación de Case-Sensitivity ✅

Todos los archivos han sido verificados para compatibilidad con sistemas Linux/Mac:

```
✅ Sprites/Animacion caminar personaje 1.png
✅ Sprites/Animacion Descanso personaje 1.png
✅ Sprites/Sprite-tierra-personaje1.png
✅ Sprites/Sprite-aire-personaje1.png
✅ Sprites/Sprite-caida-personaje1.png
✅ Sprites/Sprite Caminar.png
✅ Sprites/sprite respirar.png
```

Git registrará exactamente estos nombres, por lo que no habrá problemas en GitHub.

---

## Información del Commit

```
Commit: 3cb307d
Author: Developer <dev@game.com>
Date: 7 de Febrero de 2026

Mensaje:
feat: Sistema completo de animaciones de salto con tres estados (tierra, aire, caída)

- Implementar sprite-tierra-personaje1.png para salto inicial
- Implementar sprite-aire-personaje1.png para vuelo
- Implementar sprite-caida-personaje1.png para aterrizaje con transición suave
- Sistema basado en colisiones para cambio automático de sprites
- Animaciones de tierra (frameRate: 3) más lenta y notable
- Animaciones de caída (frameRate: 5) con último frame repetido 6 veces
- Detección de distancia para iniciar caída a 170px del suelo
- Delay de 300ms después de aterrizar para transición fluida
- Colisión unificada para todos los personajes
- Remover configuraciones de colisión por-personaje
- Verificar case-sensitivity en nombres de archivos para compatibilidad Linux/Mac
```

---

## Pasos Finales Resumidos

1. **Identifica tu usuario de GitHub** (ej: "fercho2000")

2. **Ejecuta en PowerShell:**
   ```powershell
   $env:Path += ";C:\Program Files\Git\cmd"
   git remote set-url origin https://github.com/fercho2000/game.git
   git push -u origin master
   ```

3. **GitHub te pedirá autenticación:**
   - Usa tu usuario y contraseña (o token de autenticación)
   - O configura SSH si lo prefieres

4. **Verifica en GitHub:**
   - Ve a https://github.com/TU_USUARIO/game
   - Deberías ver la rama "master" con 1 commit
   - Todos los 45 archivos estarán presentes

---

## Troubleshooting

### Error: "fatal: repository not found"
→ Verifica que la URL sea correcta y que el repositorio exista en GitHub

### Error: "could not read Username"
→ GitHub requiere autenticación. Usa un token de personal access (PAT) en lugar de contraseña

### Error: "Permission denied"
→ Configura una clave SSH o usa HTTPS con un token

---

**Estado:** ✅ COMPLETADO Y LISTO
**Acción Requerida:** Reemplazar [username] en la URL y hacer push
