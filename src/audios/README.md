# 🎵 Audios de Hatsune Miku

Esta carpeta contiene los archivos de audio que el bot puede reproducir.

## 📁 Estructura de Archivos

Los audios deben estar en formato MP3 y seguir esta nomenclatura:

### Saludos 👋
- `miku-hola.mp3` - "Hola! Soy Miku"
- `miku-buenos-dias.mp3` - "Buenos días!"
- `miku-buenas-tardes.mp3` - "Buenas tardes!"
- `miku-buenas-noches.mp3` - "Buenas noches!"

### Canciones 🎤
- `miku-world-is-mine.mp3` - World is Mine
- `miku-senbonzakura.mp3` - Senbonzakura
- `miku-tell-your-world.mp3` - Tell Your World
- `miku-love-is-war.mp3` - Love is War
- `miku-rolling-girl.mp3` - Rolling Girl

### Reacciones 😊
- `miku-risa.mp3` - Risa kawaii
- `miku-sorpresa.mp3` - Sorpresa
- `miku-feliz.mp3` - Felicidad
- `miku-triste.mp3` - Tristeza
- `miku-enojada.mp3` - Enojo

### Frases 🗾
- `miku-arigato.mp3` - "Arigato!"
- `miku-ganbatte.mp3` - "Ganbatte!"
- `miku-kawaii.mp3` - "Kawaii desu!"
- `miku-sugoi.mp3` - "Sugoi!"
- `miku-sayonara.mp3` - "Sayonara!"

## 📥 Cómo Agregar Audios

1. Descarga o graba audios de Hatsune Miku
2. Convierte a formato MP3
3. Renombra según la nomenclatura arriba
4. Coloca en esta carpeta (`src/audios/`)
5. ¡El bot los detectará automáticamente!

## 🎵 Uso en el Bot

```
.audios                    # Ver menú principal
.audios activar           # Activar audios
.audios menu              # Ver todos los audios
.audios saludos           # Ver saludos disponibles
.audios 1 canciones       # Reproducir canción #1
```

## ⚙️ Configuración

- Los audios se pueden activar/desactivar por usuario en privado
- En grupos, solo los admins pueden activar/desactivar
- La configuración se guarda en `src/database/audio-config.json`

## 📝 Notas

- Formatos soportados: MP3, OGG, WAV
- Tamaño máximo recomendado: 10MB por archivo
- Duración recomendada: Máximo 30 segundos para reacciones/frases
- Para canciones completas se permite hasta 5 minutos

## 🔗 Recursos

- Página oficial de Hatsune Miku: https://ec.crypton.co.jp/pages/prod/vocaloid/cv01
- Banco de voces libres: https://freesound.org/
- Herramientas de conversión: Audacity, FFmpeg

## ⚠️ Derechos de Autor

Asegúrate de usar solo audios con licencia apropiada o de dominio público.
Los audios de Hatsune Miku tienen derechos de Crypton Future Media.
