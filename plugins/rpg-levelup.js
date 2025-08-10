import { canLevelUp, xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    try {
      
        let name = conn.getName(m.sender)
        let user = global.db.data.users[m.sender]
        
        
        let img = await (await fetch('https://telegra.ph/file/b97148e2154508f63d909.jpg')).buffer()
        
       
        if (!canLevelUp(user.level, user.exp, global.multiplier)) {
            let { min, xp, max } = xpRange(user.level, global.multiplier)
            let txt = `💙 *Nombre:* ${name}\n`
            txt += `✨ *Nivel:* ${user.level}\n`
            txt += `⚡ *XP:* ${user.exp - min} / ${xp}\n\n`
            txt += `🔻 Te faltan *${max - user.exp}* XP para subir de nivel.`
            
            
            await conn.sendMessage(
                m.chat,
                { image: img, caption: txt },
                { quoted: m }
            )
            return
        }

       
        let before = user.level
        while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

        if (before !== user.level) {
            let txt = `🎉 *¡Felicidades, ${name}!* 🎉\n`
            txt += `⬆️ *Subiste de nivel:* ${before} → ${user.level}\n`
            txt += `👑 *Rol:* ${user.role || 'Usuario'}\n`
            txt += `📅 *Fecha:* ${new Date().toLocaleString('es-ES')}\n\n`
            txt += `💡 *Consejo:* Interactúa más con el bot para subir más rápido.`

            
            await conn.sendMessage(
                m.chat,
                { image: img, caption: txt },
                { quoted: m }
            )
        }
    } catch (error) {
        console.error('💙 Error en el comando levelup:', error)
        await conn.reply(m.chat, '💙 Ocurrió un error al procesar tu nivel. Intenta de nuevo.', m)
    }
}


handler.help = ['levelup']
handler.tags = ['rpg']
handler.command = ['nivel', 'lvl', 'levelup', 'level']
handler.register = true

export default handler
