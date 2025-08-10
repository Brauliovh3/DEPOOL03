import fs from 'fs'
import acrcloud from 'acrcloud'

let acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (/audio|video/.test(mime)) {
    if ((q.msg || q).seconds > 20) return m.reply('💙◗ El archivo es demasiado grande, recórtalo a 10-20 segundos para buscar resultados.')
    
    await m.reply('🔍 Identificando música...')
    
    try {
      let media = await q.download()
      let ext = mime.split('/')[1]
      const tmpPath = `./miku/tmp/${m.sender}.${ext}`
      
      
      if (!fs.existsSync('./miku/tmp')) {
        fs.mkdirSync('./miku/tmp', { recursive: true })
      }
      
      fs.writeFileSync(tmpPath, media)
      let res = await acr.identify(fs.readFileSync(tmpPath))
      
      let { code, msg } = res.status
      if (code !== 0) throw msg
      
      let { title, artists, album, genres, release_date } = res.metadata.music[0]
      let txt = `
💙 NOMBRE: ${title}
💙 ARTISTA: ${artists !== undefined ? artists.map(v => v.name).join(', ') : 'No encontrado'}
💙 ÁLBUM: ${album?.name || 'No disponible'}
💙 GÉNERO: ${genres !== undefined ? genres.map(v => v.name).join(', ') : 'No disponible'}
💙 FECHA: ${release_date || 'No disponible'}
`.trim()
      
      fs.unlinkSync(tmpPath)
      m.reply(txt)
      
    } catch (e) {
      console.error(e)
      m.reply('❌ Error al identificar la música. Intenta con un audio más claro.')
    }
    
  } else {
    m.reply('💙◗ Responde a un audio o video para identificar la música.')
  }
}

handler.help = ['quemusica']
handler.tags = ['herramientas']
handler.command = ['quemusica', 'quemusicaes', 'whatmusic']
export default handler
