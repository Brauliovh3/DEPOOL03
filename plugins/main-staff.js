import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix }) => {
    try {
       
        let fkontak = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) }, message: { 'contactMessage': { 'displayName': global.botname, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${global.botname},;;;\nFN:${global.botname}\nitem1.TEL;waid=${global.ownernumber}:${global.ownernumber}\nitem1.X-ABLabel:Owner\nEND:VCARD`, 'jpegThumbnail': null } } }
        let emoji = '💙'
        let icono = 'https://somoskudasai.com/wp-content/uploads/2024/03/portada_-1.jpg'
        let redes = 'https://github.com/Brauliovh3' 
        
        
        let icons = await (await fetch(icono)).buffer()

       
        let staff = `💙 *EQUIPO DE AYUDANTES*\n`
        staff += `💙 *Bot:* ${global.botname}\n`
        staff += `✨️ *Versión:* ${global.vs}\n\n`
        
        staff += `👑 *Propietario:*\n\n`
        staff += `• (ㅎㅊDEPOOLㅊㅎ)\n`
        staff += `💮 *Rol:* Propietario\n`
        staff += `💙 *Número:* wa.me/51988514570\n`
        staff += `🌱 *GitHub:* https://github.com/Brauliovh3\n\n`
        
        staff += `💮 *Colaboradores:*\n\n`
        staff += `• RAFAEL\n`
        staff += `💮 *Rol:* Junior\n`
        staff += `💙 *Número:* Wa.me/51939508653`

        
        await conn.sendMessage(
            m.chat,
            {
                image: icons,
                caption: staff.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: `🌱 Developers 👑`,
                        body: `💙 Staff Oficial`,
                        mediaType: 1,
                        sourceUrl: redes,
                        thumbnail: icons
                    }
                }
            },
            { quoted: fkontak, mentions: [m.sender] }
        )
        
      
        await m.react(emoji)

    } catch (error) {
        console.error('❌ Error en el comando staff:', error)
        await conn.reply(m.chat, '🚨 Ocurrió un error al mostrar el equipo. Intenta de nuevo.', m)
    }
}


handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
