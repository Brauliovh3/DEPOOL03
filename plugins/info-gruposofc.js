import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    try {
      
        const mediaPath = './src/legend/miku_legend.jpg'
        const wm = '͟͞(っ◔◡◔)っ 𝕄𝕚𝕜𝕦-ℂ𝕙𝕒𝕟 💙🎵'
        const gp4 = 'Grupo Oficial de Hatsune Miku'
        const md = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
        
        
        if (!fs.existsSync(mediaPath)) {
            throw new Error('El archivo multimedia no existe')
        }

        
        const media = fs.readFileSync(mediaPath)
        
        
        let str = `*💙 GRUPO OFICIAL*\n\n` +
                `   *🎵⊹⋆𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾⋆⊹🎵*\n` +
                `  ┃🧸❏ ${gp4}\n\n` +
                `   *💙🌱HATSUNE MIKU OFICIAL GROUP🌱💙*\n` +
                `┃🧸❏ https://chat.whatsapp.com/FQ78boTUpJ7Ge3oEtn8pRE?mode=ac_t\n\n` +
                `   *_Canal Oficial_*\n` +
                `┃💙❏ ${md}`

       
        let fkontak = { 
            key: { 
                participants: "0@s.whatsapp.net", 
                remoteJid: "status@broadcast", 
                fromMe: false, 
                id: "Halo" 
            }, 
            message: { 
                contactMessage: { 
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
                }
            }, 
            participant: "0@s.whatsapp.net" 
        }

        
        await m.react('⚡️')

       
        await conn.sendMessage(m.chat, {
            image: media,
            caption: str,
            footer: wm,
            buttons: [
                { buttonId: '/lista', buttonText: { displayText: 'Menu Lista 💙' }, type: 1 },
                { buttonId: 'https://chat.whatsapp.com/FQ78boTUpJ7Ge3oEtn8pRE?mode=ac_t', buttonText: { displayText: 'Grupo Oficial' }, type: 1 }
            ],
            headerType: 4,
            contextInfo: {
                externalAdReply: {
                    title: '(っ◔◡◔)っ 𝕄𝕚𝕜𝕦-ℂ𝕙𝕒𝕟 💙🎵',
                    body: md,
                    thumbnail: media,
                    mediaType: 2,
                    mediaUrl: md,
                    sourceUrl: md
                }
            }
        }, { quoted: fkontak })

    } catch (error) {
        console.error('Error en el handler:', error)
      
        await conn.sendMessage(m.chat, {
            text: 'Ocurrió un error al enviar el contenido multimedia. Por favor intenta nuevamente más tarde.'
        })
    }
}

handler.command = ['grupos', 'linksk', 'gruposofc', 'gruposoficiales']
handler.register = true
handler.exp = 33

export default handler
