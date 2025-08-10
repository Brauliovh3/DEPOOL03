import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  
  try {

    const mikuDir = './miku/tmp'
    if (!fs.existsSync(mikuDir)) {
      fs.mkdirSync(mikuDir, { recursive: true })
    }
    

    try {
      const testFile = path.join(mikuDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      console.log('✅ Directorio temporal verificado')
    } catch (e) {
      console.error('❌ Error de permisos:', e)
      return m.reply('💙 Error interno: Problema con permisos de directorios.')
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
  
    console.log('🔍 MIME detectado:', mime)
    console.log('🔍 Tipo de mensaje:', typeof q)
    console.log('🔍 Tiene download?:', typeof q.download)
    
   
    if (/webp|image|video/g.test(mime)) {
   
      if (/video/g.test(mime)) {
        const duration = (q.msg || q).seconds || 0
        console.log('🎥 Duración del video:', duration, 'segundos')
        if (duration > 8) {
          return m.reply(`💙 *¡El video no puede durar más de 8 segundos!* (Duración actual: ${duration}s)`)
        }
      }
      
      
      let img
      try {
        console.log('📥 Intentando descargar archivo...')
        img = await q.download?.()
        if (!img) {
          throw new Error('No se pudo descargar el archivo')
        }
        console.log('✅ Archivo descargado, tamaño:', img.length, 'bytes')
      } catch (downloadErr) {
        console.error('❌ Error al descargar:', downloadErr)
        return m.reply(`💙 Error al descargar el archivo. Intenta reenviar la imagen/video/gif.`)
      }
      
     
      try {
        console.log('🎯 Método 1: Creación directa del sticker')
        stiker = await sticker(img, false, global.packsticker || 'Hatsune-Miku', global.author || '@bot')
        if (stiker && stiker.length > 0) {
          console.log('✅ Sticker creado exitosamente (Método 1)')
        } else {
          throw new Error('Sticker vacío o nulo')
        }
      } catch (e) {
        console.error('❌ Método 1 falló:', e.message)
        stiker = false
      }
      
    
      if (!stiker) {
        console.log('🎯 Método 2: Procesamiento alternativo')
        let processedUrl
        
        try {
          if (/webp/g.test(mime)) {
            console.log('🔄 Convirtiendo WEBP a PNG...')
            processedUrl = await webp2png(img)
          } else if (/image/g.test(mime)) {
            console.log('🔄 Subiendo imagen...')
            processedUrl = await uploadImage(img)
          } else if (/video/g.test(mime)) {
            console.log('🔄 Subiendo video...')
            processedUrl = await uploadFile(img)
          }
          
          if (processedUrl && typeof processedUrl === 'string') {
            console.log('✅ Archivo procesado, URL:', processedUrl)
            stiker = await sticker(false, processedUrl, global.packsticker || 'Hatsune-Miku', global.author || '@bot')
            if (stiker && stiker.length > 0) {
              console.log('✅ Sticker creado exitosamente (Método 2)')
            }
          } else {
            throw new Error('URL procesada inválida')
          }
        } catch (e) {
          console.error('❌ Método 2 falló:', e.message)
        }
      }
      
     
      if (!stiker) {
        console.log('🎯 Método 3: Fallback final')
        try {
          const fallbackUrl = await uploadImage(img)
          if (fallbackUrl && typeof fallbackUrl === 'string') {
            stiker = await sticker(false, fallbackUrl, global.packsticker || 'Hatsune-Miku', global.author || '@bot')
            if (stiker && stiker.length > 0) {
              console.log('✅ Sticker creado exitosamente (Método 3)')
            }
          }
        } catch (e) {
          console.error('❌ Método 3 falló:', e.message)
        }
      }
      
    } else if (args[0]) {
      
      console.log('🌐 Procesando URL:', args[0])
      if (isUrl(args[0])) {
        try {
          stiker = await sticker(false, args[0], global.packsticker || 'Hatsune-Miku', global.author || '@bot')
          if (stiker && stiker.length > 0) {
            console.log('✅ Sticker desde URL creado exitosamente')
          }
        } catch (e) {
          console.error('❌ Error creando sticker desde URL:', e)
          return m.reply(`💙 Error al procesar la URL: ${e.message}`)
        }
      } else {
        return m.reply(`💙 La URL proporcionada no es válida o no contiene una imagen compatible.`)
      }
    } else {
      return m.reply(`💙 *Envía una imagen, video, GIF o responde a un mensaje multimedia con el comando.*\n\n*Uso:*\n• ${usedPrefix + command} (respondiendo a multimedia)\n• ${usedPrefix + command} <url de imagen>`)
    }
    
  } catch (e) {
    console.error('❌ Error principal:', e)
    return m.reply(`💙 Error inesperado: ${e.message}`)
  }
  

  if (stiker && stiker.length > 0) {
    try {
      console.log('📤 Enviando sticker...')
      const tempStickerPath = path.join('./miku/tmp', `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`)
      
     
      fs.writeFileSync(tempStickerPath, stiker)
      console.log('💾 Sticker guardado temporalmente en:', tempStickerPath)
      
      
      await conn.sendFile(m.chat, tempStickerPath, 'sticker.webp', '', m, false, {
        asSticker: true,
        contextInfo: {
          'forwardingScore': 200,
          'isForwarded': false,
          externalAdReply: {
            showAdAttribution: false,
            title: global.packname || 'Hatsune-Miku',
            body: `💙 Sticker Bot 💙`,
            mediaType: 2,
            sourceUrl: global.redes || '',
            thumbnail: global.icons || null
          }
        }
      })
      
    
      if (fs.existsSync(tempStickerPath)) {
        fs.unlinkSync(tempStickerPath)
        console.log('🧹 Archivo temporal eliminado')
      }
      
      console.log('✅ Sticker enviado exitosamente')
      
    } catch (sendErr) {
      console.error('❌ Error al enviar sticker:', sendErr)
      return m.reply(`💙 Error al enviar el sticker: ${sendErr.message}`)
    }
  } else {
    console.error('❌ No se pudo crear el sticker')
    return m.reply(`💙 *No se pudo crear el sticker.*\n\n*Posibles causas:*\n• El archivo es muy grande\n• Formato no compatible\n• Error en las librerías de conversión\n\n*Intenta con:*\n• Una imagen más pequeña\n• Un video más corto (máx 8 segundos)\n• Un formato diferente (JPG, PNG, MP4, GIF)`)
  }
}

handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.register = true
handler.command = ['s', 'sticker', 'stiker']

export default handler


const isUrl = (text) => {
  try {
    const url = new URL(text)
   
    return /^https?:$/i.test(url.protocol) && /\.(jpe?g|png|gif|webp)$/i.test(url.pathname)
  } catch {
   
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)\.(jpe?g|gif|png|webp)/, 'gi'))
  }
}
