# Smash 2D

Un juego 2D desarrollado con **Phaser 3** y JavaScript vanilla.

## Características

- ✅ Sistema de personajes individuales con animaciones propias (caminar, descanso/idle, salto)
- ✅ Múltiples personajes seleccionables con personalización de color
- ✅ Sistema de plataformas con colisiones
- ✅ Animaciones fluidas con spritesheets
- ✅ Música de fondo dinámica
- ✅ Sistema de vidas y respawn
- ✅ Debug mode de física activado

## Instalación y Ejecución

### Opción 1: Con Python (Recomendado)

```bash
# Python 3.x
python -m http.server 8000

# O Python 2.x
python -m SimpleHTTPServer 8000
```

Abre tu navegador en: **http://localhost:8000**

### Opción 2: Con Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server

# O si ya tienes http-server instalado
npx http-server
```

### Opción 3: Con PHP

```bash
php -S localhost:8000
```

## Estructura del Proyecto

```
Juego 2D/
├── index.html              # Archivo principal HTML
├── game.js                 # Configuración y utilidades
├── main.js                 # Punto de entrada
├── style.css               # Estilos CSS
├── audio/                  # Archivos de música
├── personajes/             # Imágenes estáticas de personajes
├── Sprites/                # Spritesheets de animaciones
├── textures/               # Fondos y texturas
├── tiles/                  # Tilesets para plataformas
└── js/
    ├── config/
    │   └── gameConfig.js   # Configuración del juego
    ├── assets/
    │   ├── characters.js   # Datos de personajes
    │   ├── animations.js   # Sistema de animaciones
    │   ├── platforms.js    # Sistema de plataformas
    │   ├── audio.js        # Control de audio
    │   └── playerUtils.js  # Utilidades del jugador
    └── scenes/
        ├── PreloadScene.js  # Carga de assets
        ├── MenuScene.js     # Menú inicial
        ├── SelectScene.js   # Selección de personajes
        └── PlayScene.js     # Escena principal del juego
```

## Personajes Disponibles

### Personaje 1 ✅
- Animaciones: Caminar, Descanso, Salto
- Color: Blanco
- Estado: Desbloqueado

### Black and White (Personaje 2) ✅
- Animaciones: Caminar, Respirar (idle)
- Color: Blanco
- Estado: Desbloqueado

### Rayo (Personaje 3)
- Color: Rojo/Naranja
- Estado: Desbloqueado

### Sombra (Personaje 4)
- Color: Azul oscuro
- Estado: Desbloqueado

### Verde y Dorado
- Estado: Bloqueados (requieren desbloqueo)

## Controles

- **Flechas de dirección (← →)**: Mover personaje
- **Espacio**: Saltar
- **ESC**: Volver al menú
- **Click en colores**: Cambiar color del personaje
- **Click en flechas**: Cambiar personaje

## Debug

El proyecto tiene **debug mode activado** para ver las hitboxes de colisión (rectángulos azules alrededor de sprites).

Para desactivarlo, edita `js/config/gameConfig.js`:
```javascript
arcade: {
    gravity: { y: 800 },
    debug: false  // Cambiar a false
}
```

## Tecnologías

- **Phaser 3** - Framework de juegos 2D
- **JavaScript ES6+** - Lenguaje de programación
- **HTML5 Canvas** - Renderizado

## Notas Importantes

1. **No uses `file://`**: El protocolo file:// no permite cargar módulos ES6. Usa un servidor local.
2. **Rutas case-sensitive en Linux/GitHub**: Todas las rutas usan paths con la capitalización correcta.
3. **Animaciones personalizadas**: Cada personaje puede tener sus propias animaciones y hitbox.

## Autor

Desarrollado con ❤️ usando Phaser 3
