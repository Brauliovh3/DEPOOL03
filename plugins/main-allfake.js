import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
  try {
    options ? options : {}
    var res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'User-Agent': 'GoogleBot',
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (e) {
    console.log(`Error : ${e}`)
    return null 
  }
}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
global.fotoperfil = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Frw5fheq9n8ie1.png%3Fwidth%3D640%26crop%3Dsmart%26auto%3Dwebp%26s%3Db72adb3e3c0716943d47acffca43613995814486')
let api = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}`).catch(e => ({ data: { result: null } }))
let userNationalityData = api.data?.result
global.userNationality = userNationalityData ? `${userNationalityData.name} ${userNationalityData.emoji}` : 'Desconocido'
let user = global.db.data.users[who]
let bot = global.db.data.settings[this.user.jid]
let pushname = m.pushName || 'Sin nombre'
global.opts['gconly'] = true


global.botcommandcount = bot.botcommandCount
global.creador = 'Wa.me/51988514570'
global.ofcbot = `${conn.user.jid.split('@')[0]}`
global.asistencia = 'Wa.me/51953073477'
global.namechannel = '(っ◔◡◔)っ 𝕄𝕚𝕜𝕦-ℂ𝕙𝕒𝕟 💙🎵'
global.namegrupo = '(/≧▽≦)/𝙍𝙚𝙖𝙙𝙮 𝙩𝙤 𝙎𝙞𝙣𝙜!🎧⚡'
global.namecomu = '𝗖𝗼𝗺𝘂𝗻𝗶𝗱𝗮𝗱 𝕄𝕚𝕜𝕦-ℂ𝕙𝕒𝕟 💙🎵'
global.colab1 = 'Rafael'
global.colab2 = 'xxxx'
global.colab3 = 'xxx'


global.idchannel = '120363315369913363@newsletter'
global.canalIdM = ["120363315369913363@newsletter", "120363315369913363@newsletter","120363315369913363@newsletter"]
global.canalNombreM = ["💙HATSUNE MIKU CHANNEL💙", "💙HATSUNE MIKU CHANNEL💙","💙HATSUNE MIKU CHANNEL💙"]
global.channelRD = await getRandomChannel()


global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'

global.emoji = '💙'
global.emoji2 = '🌱'
global.emoji3 = '💙🌱'
global.emoji4 = '💮'
global.emojis = [global.emoji, global.emoji2, global.emoji3, global.emoji4].getRandom()


global.wait = '🕒 *𝗘𝘀𝗽𝗲𝗿𝗮 𝗨𝗻 𝗠𝗼𝗺𝗲𝗻𝘁𝗼, 𝗦𝗼𝘆 𝗟𝗲𝗻𝘁𝗮 ...*';
global.waitt = '🕒 *𝗘𝘀𝗽𝗲𝗿𝗮 𝗨𝗻 𝗠𝗼𝗺𝗲𝗻𝘁𝗼, 𝗦𝗼𝘆 𝗟𝗲𝗻𝘁𝗮 ...*';
global.waittt = '🕒 *𝗘𝘀𝗽𝗲𝗿𝗮 𝗨𝗻 𝗠𝗼𝗺𝗲𝗻𝘁𝗼, 𝗦𝗼𝘆 𝗟𝗲𝗻𝘁𝗮 ...*';
global.waitttt = '🕒 *𝗘𝘀𝗽𝗲𝗿𝗮 𝗨𝗻 𝗠𝗼𝗺𝗲𝗻𝘁𝗼, 𝗦𝗼𝘆 𝗟𝗲𝗻𝘁𝗮 ...*';


var canal = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'  
let canal2 = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
var git = 'https://github.com/Brauliovh3' 
var youtube = 'https://youtube.com' 
var github = 'https://github.com/Brauliovh3/HATSUNE-MIKU' 
let correo = 'velasquezhuillcab@gmail.com'

global.redes = [canal, canal2, git, youtube, github, correo].getRandom()


global.iconURLs = [
  'https://i.pinimg.com/236x/87/ee/99/87ee997790825fd3d213b725fa73ab71.jpg',
  'https://i.pinimg.com/736x/d9/4d/ce/d94dce9187e7ed792b04563c684992fb.jpg',
  'https://cdn.rafled.com/anime-icons/images/193142ca5d8bcdd5b307ce40c8d4c17f4e7dd0e6c2591d85e5a3b4e4847ba454.jpg',
  'https://images.dwncdn.net/images/t_app-icon-l/p/737ce9a2-362d-11e7-846c-d53a176f41ee/959952612/2072_4-78395371-logo',
  'https://cdn-images.dzcdn.net/images/cover/9a46d14cf441da76aa3840a5a8265bb3/0x1900-000000-80-0-0.jpg',
  'https://i.pinimg.com/736x/bd/2e/40/bd2e40a925d5816fe6e3cccdd787e11e.jpg',
  'https://i.pinimg.com/236x/0f/ec/85/0fec8549471dd44832a611ec91dbedf4.jpg',
  'https://i.pinimg.com/564x/b5/d9/aa/b5d9aa309167149fed51961e0ea375aa.jpg'
]


async function loadIcon() {
  try {
   
    const randomURL = global.iconURLs[Math.floor(Math.random() * global.iconURLs.length)]
    console.log(`Intentando cargar ícono desde: ${randomURL}`)
    
    try {
      
      const response = await axios({
        method: 'get',
        url: randomURL,
        responseType: 'arraybuffer',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (response.status === 200) {
        console.log('Ícono cargado exitosamente desde URL')
        return response.data
      } else {
        throw new Error(`Error en la respuesta: ${response.status}`)
      }
    } catch (fetchError) {
      console.log(`Error al cargar desde URL: ${fetchError.message}`)
      
      
      const localPath = './src/JSON/miku.jpg'
      if (fs.existsSync(localPath)) {
        console.log('Cargando ícono desde archivo local')
        return fs.readFileSync(localPath)
      } else {
        console.log('Archivo local no encontrado, utilizando ícono predeterminado')
       
        return null
      }
    }
  } catch (error) {
    console.log(`Error general al cargar ícono: ${error.message}`)
    return null
  }
}


global.icons = await loadIcon()


global.icono = global.iconURLs.getRandom()


var ase = new Date(); var hour = ase.getHours(); switch(hour){ case 0: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 1: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 2: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 3: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 4: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 5: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 6: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 7: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅'; break; case 8: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 9: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break; case 10: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break; case 11: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break; case 12: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break; case 13: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break; case 14: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break; case 15: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break; case 16: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break; case 17: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break; case 18: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 19: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 20: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 21: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 22: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break; case 23: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break;}
global.saludo = hour;


global.nombre = conn.getName(m.sender)
global.taguser = '@' + m.sender.split("@s.whatsapp.net")[0]
var more = String.fromCharCode(8206)
global.readMore = more.repeat(850)


global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }


global.estilo = { 
  key: {  
    fromMe: false, 
    participant: `0@s.whatsapp.net`, 
    ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) 
  }, 
  message: { 
    orderMessage: { 
      itemCount: -999999, 
      status: 1, 
      surface: 1, 
      message: `${global.packname || 'Hatsune Miku Bot'}`, 
      orderTitle: 'Bang', 
      thumbnail: global.icons || Buffer.from([]),
      sellerJid: '0@s.whatsapp.net'
    }
  }
}

global.fake = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: -1 }}}


global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: channelRD.id, 
      serverMessageId: 100, 
      newsletterName: channelRD.name, 
    }, 
    externalAdReply: { 
      showAdAttribution: true, 
      title: global.textbot || 'Hatsune Miku Bot', 
      body: '💙 ꜞEl mundo es mio!', 
      mediaUrl: null, 
      description: null, 
      previewType: "PHOTO", 
      thumbnailUrl: global.icono,
      sourceUrl: global.redes, 
      mediaType: 1, 
      renderLargerThumbnail: false 
    } 
  }
}

} 

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
  let id = global.canalIdM[randomIndex]
  let name = global.canalNombreM[randomIndex]
  return { id, name }
}


if (!Array.prototype.getRandom) {
  Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)]
  }
}
