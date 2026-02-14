# Smash 2D - Documentacion Unificada

## Resumen
Este repositorio contiene un juego 2D en Phaser 3 con arquitectura modular (ES Modules) y fisicas con Matter.
La documentacion previa estaba fragmentada en multiples archivos; ahora se consolida en este unico documento.

## Estado del Proyecto
- Estado general: funcional y jugable.
- Enfoque reciente: correccion y mejora del sistema de animaciones de salto del Personaje 1.
- Resultado: flujo de animaciones mas claro, sin perdida de animaciones de caminar/reposo.

## Tecnologias
- Phaser 3 (CDN) para motor del juego.
- Matter Physics (integrado en Phaser) para colisiones/fisicas.
- JavaScript ES Modules para estructura modular.
- HTML5 y CSS3 para contenedor e interfaz.
- JSON para mapas/configuracion de recursos.
- Audio WAV/MP3 cargado desde escenas de preload.

## Estructura Base
- `index.html`: entrada principal.
- `main.js`: bootstrap de la aplicacion.
- `style.css`: estilos de pagina.
- `js/hexagon/...`: dominio, aplicacion e infraestructura Phaser (escenas, recursos, assets).

## Ejecucion
1. Opcion Python:
```bash
python -m http.server 8000
```
2. Opcion Node.js:
```bash
npx serve .
```
3. Abrir en navegador:
```text
http://localhost:8000
```

## Controles
- Flecha izquierda: mover a la izquierda.
- Flecha derecha: mover a la derecha.
- Espacio: saltar.

## Cambios Tecnicos Relevantes (Animaciones)
Se unifico la logica de salto con deteccion por estado de personaje (suelo/aire/aterrizaje), manteniendo caminar e idle.

Archivos impactados en la documentacion historica:
- `js/hexagon/infrastructure/phaser/scenes/PreloadScene.js`
- `js/hexagon/infrastructure/phaser/scenes/PlayScene.js`
- `js/hexagon/infrastructure/phaser/assets/animations.js`
- `js/hexagon/infrastructure/phaser/assets/characters.js`

Sprites de salto usados:
- `tierra-personaje 1.png`
- `aire-personaje 1.png`
- `caida-personaje 1.png`

Ciclo esperado:
1. Suelo (idle/caminar).
2. Inicio salto (tierra).
3. En aire (aire).
4. Aterrizaje (caida una vez).
5. Vuelve a idle/caminar.

## QA Rapido
Checklist minimo:
1. Seleccionar Personaje 1.
2. Caminar con flechas y validar animacion de caminar.
3. Saltar con espacio y validar transicion tierra -> aire -> caida.
4. Repetir saltos para confirmar que no hay parpadeos anormales.

## Troubleshooting Rapido
- Si no cambian sprites: verificar rutas/nombres exactos de archivos PNG.
- Si no carga animacion: confirmar que se crean animaciones en `createAnimations`.
- Si solo funciona en un personaje: revisar configuracion por `characterIndex`.

## Git y Publicacion
Resumen de pasos:
1. Verificar remoto:
```bash
git remote -v
```
2. Agregar/actualizar remoto si hace falta:
```bash
git remote set-url origin <URL_REPO>
```
3. Subir cambios:
```bash
git add .
git commit -m "docs: unificar documentacion"
git push -u origin main
```

## Nota de Consolidacion
Este archivo reemplaza la documentacion anterior:
- CAMBIOS_ANIMACIONES.md
- DOCUMENTACION_PROYECTO.md
- TECNOLOGIAS_Y_ARQUITECTURA.md
- GUIA_PRUEBA_ANIMACIONES.md
- REFERENCIA_RAPIDA.md
- REGISTRO_CAMBIOS.md
- COMPARATIVA_ANTES_DESPUES.md
- README_SISTEMA.md
- CORRECCION_COMPLETADA.md
- RESUMEN_FINAL_CORRECCION.md
- CODIGO_FINAL_IMPLEMENTADO.md
- CORRECCION_SISTEMA_COLISION.md
- ACTUALIZACIONES_JUMP_ANIMATIONS.md
- DIAGRAMA_ANIMACIONES.md
- INDICE_DOCUMENTACION.md
- GITHUB_AUTENTICACION_GUIA.md
- INSTRUCCIONES_GITHUB_PUSH.md

Ultima consolidacion: 13 de febrero de 2026.
