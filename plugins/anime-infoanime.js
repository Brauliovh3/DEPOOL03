import fetch from 'node-fetch'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        if (!text) return conn.reply(m.chat, `💙 *Ingrese el nombre de algún anime*\n\nEjemplo: ${usedPrefix + command} overlord`, m)
        
        
        let waiting = await conn.reply(m.chat, '🔍 *Buscando información del anime...*', m)
        
        let res = await fetch('https://api.jikan.moe/v4/manga?q=' + encodeURIComponent(text))
        if (!res.ok) {
            await conn.reply(m.chat, '❌ *Error al conectar con la API de anime*', m)
            return conn.sendMessage(m.chat, { delete: waiting.key })
        }

        let json = await res.json()
        if (!json.data || json.data.length === 0) {
            await conn.reply(m.chat, '❌ *No se encontró el anime solicitado*', m)
            return conn.sendMessage(m.chat, { delete: waiting.key })
        }

        let anime = json.data[0]
        let { 
            title, 
            title_japanese, 
            chapters, 
            url, 
            type, 
            score, 
            members, 
            status, 
            volumes, 
            synopsis, 
            favorites 
        } = anime
        
        let author = anime.authors?.[0]?.name || 'Desconocido'
        let background = anime.background || 'No disponible'
        
       
        let imgResponse = await fetch(anime.images.jpg.image_url)
        if (!imgResponse.ok) throw new Error('Error al obtener la imagen')
        let imgBuffer = await imgResponse.buffer()
        
        
        let animeInfo = `
🌟 *${title || title_japanese}* 🌟
${title_japanese ? `(${title_japanese})` : ''}

📚 *Tipo:* ${type}
📖 *Capítulos:* ${chapters || '?'}
🗂 *Volúmenes:* ${volumes || '?'}
⭐ *Puntuación:* ${score || '?'}
❤️ *Favoritos:* ${favorites || '?'}
👥 *Miembros:* ${members || '?'}
🔄 *Estado:* ${status || '?'}
✍️ *Autor:* ${author}

📝 *Sinopsis:*
${synopsis || 'No disponible'}

🌐 *Más info:* ${url}
`.trim()

        
        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: animeInfo,
            contextInfo: {
                externalAdReply: {
                    title: `Información de ${title}`,
                    body: 'Obtenido desde Jikan API',
                    thumbnail: imgBuffer,
                    sourceUrl: url
                }
            }
        }, { quoted: m })
        
       
        await conn.sendMessage(m.chat, { delete: waiting.key })

    } catch (error) {
        console.error('Error en handler infoanime:', error)
        conn.reply(m.chat, '❌ *Ocurrió un error al procesar la solicitud*', m)
    }
}

handler.help = ['infoanime <nombre>']
handler.tags = ['anime']
handler.command = ['infoanime', 'animeinfo']
handler.register = true

export default handler
