import fs from 'fs'
import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn, usedPrefix, __dirname }) => {
  try {
    let user = global.db.data.users[m.sender]
    let { exp, chocolates, level, role } = user
    let { min, xp, max } = xpRange(level, global.multiplier)
    
    let name = await conn.getName(m.sender)
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length
    
    let perfil = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/5e7042bf17cde23989e71.jpg')
    const vid = [
      'https://i.ytimg.com/vi/AufydOsiD6M/maxresdefault.jpg',
      'https://i.ytimg.com/vi/jsQXgDZIIrY/maxresdefault.jpg',
      'https://revulsionmx.com/wp-content/uploads/2025/03/Hatsune-Miku-pelicula-Colorful-Stage.jpg'
    ]
    
    const saludo = getGreeting()
    const dev = '🈹 DEPOOL - Creador de Miku'
    const emojis = ['🎀', '💙', '🎵']
    const redes = 'https://github.com/Brauliovh3'

    let menu = `┏━━『 💙 HATSUNE MIKU 💙 』━━┓
┃ 🎵 *Digital Diva Vocaloid* 🎤
┃ Hola *${taguser}*, ${saludo}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🎧 *Bot:* ${conn.user.jid == global.conn.user.jid ? 'Principal' : 'MikuBot'}
┃ ⏰ *Activo:* ${uptime}
┃ 👥 *Usuarios:* ${totalreg}
┃ 🎼 *Creador:* DEPOOL
┗━━━━━━━━━━━━━━━━━━━━━━━━━━

┏━━『 📋 MENÚS PRINCIPALES 』━━┓
┃ 🔸 *.menuaudios* - Audios Miku
┃ 🔸 *.menubuscador* - Buscadores 
┃ 🔸 *.menujuegos* - Juegos
┃ 🔸 *.menuwaifu* - Waifu/RPG
┃ 🔸 *.menuserbot* - Sub-bots
┃ 🔸 *.menurpg* - RPG Sistema
┃ 🔸 *.menusticker* - Stickers
┃ 🔸 *.menuanime* - Anime
┃ 🔸 *.menugrupos* - Administración

┣━━『 🎵 AUDIOS MIKU 』━━━━━━┓
┃ ✨ *enable audios* - Activar
┃ ✨ *disable audios* - Desactivar
┃ 🎤 mundo, hola, kawaii, risa
┃ 🎼 senbonzakura, feliz, etc.

┣━━『 🔍 BUSCADORES 』━━━━━━┓
┃ 🔸 .google <texto>
┃ 🔸 .imagen <query>
┃ 🔸 .pinterest <búsqueda>
┃ 🔸 .githubsearch <repo>
┃ 🔸 .mercadolibre <producto>

┣━━『 🎮 JUEGOS 』━━━━━━━━━━┓
┃ 🔸 .acertijo - Adivinanzas
┃ 🔸 .ppt - Piedra papel tijera
┃ 🔸 .math <modo> - Matemáticas
┃ 🔸 .slot <cantidad> - Casino
┃ 🔸 .apostar <cantidad>

┣━━『 💖 WAIFU/RPG 』━━━━━━━┓
┃ 🔸 .character - Ver personaje
┃ 🔸 .roll - Obtener waifu
┃ 🔸 .guardar <nombre>
┃ 🔸 .obtenidos - Lista
┃ 🔸 .toprw - Top waifus

┣━━『 💰 ECONOMIA 』━━━━━━━━┓
┃ 🔸 .daily - Recompensa diaria
┃ 🔸 .bank - Banco
┃ 🔸 .trabajar - Ganar dinero
┃ 🔸 .minar - Obtener recursos
┃ 🔸 .rob <usuario> - Robar

┣━━『 🖼️ STICKERS 』━━━━━━━┓
┃ 🔸 .sticker <imagen>
┃ 🔸 .toimg - Convertir a imagen
┃ 🔸 .qc <texto> - Quote

┣━━『 🌸 ANIME 』━━━━━━━━━━┓
┃ 🔸 .waifu - Imagen waifu
┃ 🔸 .akira, .miku, .naruto
┃ 🔸 .infoanime <nombre>
┃ 🔸 .cosplay - Cosplay

┣━━『 👥 GRUPOS 』━━━━━━━━━┓
┃ 🔸 .enable <función>
┃ 🔸 .disable <función>
┃ 🔸 .kick <usuario>
┃ 🔸 .promote <usuario>
┃ 🔸 .group abrir/cerrar

┣━━『 🤖 SUB-BOTS 』━━━━━━━┓
┃ 🔸 .serbot - Ser sub-bot
┃ 🔸 .jadibot - Conectar
┃ 🔸 .bots - Lista bots
┃ 🔸 .deletebot - Eliminar

┗━━━━━━━━━━━━━━━━━━━━━━━━━━

🎵 *¡Disfruta de la música con Miku!* 🎵
> ${dev}`

    await conn.sendMessage(m.chat, { 
      image: { url: vid[Math.floor(Math.random() * vid.length)] }, 
      caption: menu.trim(),
      contextInfo: { 
        mentionedJid: [m.sender],
        externalAdReply: { 
          title: '💙Hatsune Miku💙',
          body: dev,
          thumbnailUrl: perfil,
          sourceUrl: redes
        }
      }
    })

    await m.react(emojis[Math.floor(Math.random() * emojis.length)])

  } catch (e) {
    console.error(e)
    await m.reply(`✘ Ocurrió un error al enviar el menú\n\n${e.message}`)
    await m.react('❌')
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
}

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menú', 'allmenú', 'allmenu', 'menucompleto']
handler.register = true

export default handler
