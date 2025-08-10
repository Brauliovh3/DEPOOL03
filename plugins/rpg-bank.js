import fetch from 'node-fetch'
import db from '../lib/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


let img = 'https://static.wikia.nocookie.net/ficcion-sin-limites/images/a/a3/S.jpg/revision/latest?cb=20221014161424&path-prefix=es'

let handler = async (m, {conn, usedPrefix}) => {
   let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
   
   if (who == conn.user.jid) return m.react('✖️')
   if (!(who in global.db.data.users)) return m.reply(`*💙 El usuario no se encuentra en mi base de datos*`)
   
   let user = global.db.data.users[who]
   let name = conn.getName(who);
   
   let txt = (`${who == m.sender ? `╭━〔  ${global.packname}  〕⬣\n┋ Usuario: ${name}\n┋ Cebollines En Cartera: ${user.cebollines}\n┋ Cebollines En Banco: ${user.bank}\n┋ Experiencia: ${user.exp}\n┋ Nivel: ${user.level}\n┋ Rol: ${user.role}\n┋ Fecha: ${new Date().toLocaleString('id-ID')}\n╰━━━━━━━━━━━━⬣` : `╭━〔  ${global.packname}  〕⬣\n┋ Usuario: @${who.split('@')[0]}\n┋ Cebollines En Cartera: ${user.cebollines}\n┋ Cebollines En Banco: ${user.bank}\n┋ Experiencia: ${user.exp}\n┋ Nivel: ${user.level}\n┋ Rol: ${user.role}\n┋ Fecha: ${new Date().toLocaleString('id-ID')}\n╰━━━━━━━━━━━━⬣`}`)
   
   try {
     
     await conn.sendMessage(m.chat, { 
       image: { url: img }, 
       caption: txt,
       mentions: [who]
     }, { quoted: m })
     
   } catch (error) {
     console.log('Error sending image:', error)
     
     await conn.reply(m.chat, txt, m, { mentions: [who] })
   }
}

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = ['bank', 'banco'] 
handler.register = true 
export default handler
