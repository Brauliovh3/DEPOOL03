import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import _ from "lodash"
import axios from 'axios'

let Reg = /\|?(.+?)([.|] *?)([0-9]+)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  console.log(`Comando recibido: ${usedPrefix}${command} ${text}`)
  
  let user = global.db.data.users[m.sender]
  let name2 = conn.getName(m.sender)
  

  if (!user) {
    global.db.data.users[m.sender] = {
      registered: false,
      name: '',
      age: 0,
      regTime: 0,
      money: 0,
      cebollines: 0,
      exp: 0,
      joincount: 0,
      descripcion: ''
    }
    user = global.db.data.users[m.sender]
  }

  if (user.registered === true) {
    return conn.reply(m.chat, `*💙 Ya estas registrado, para volver a registrarte, usa el comando: ${usedPrefix}unreg*`, m)
  }

  if (!text) {
    return conn.reply(m.chat, `*💙 El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n${usedPrefix}reg Nombre.edad\n\n\`\`\`Ejemplo:\`\`\`\n${usedPrefix}reg *${name2}.18*`, m)
  }
  
  text = text.trim()
  if (text.startsWith('(') && !text.includes(')')) {
    text = text.substring(1) 
  }

  let nameWithParentheses = false
  if (text.includes('(') && text.includes(')')) {
    const match = text.match(/(.+)\.([0-9]+)$/)
    if (match) {
      nameWithParentheses = true
      text = match[1] + '.' + match[2] 
      console.log(`Reformateado con paréntesis: ${text}`)
    }
  }
  
  if (!Reg.test(text)) {
    console.log(`Regex no coincidió con: ${text}`)
    return conn.reply(m.chat, `*💙 El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n${usedPrefix}reg Nombre.edad\n\n\`\`\`Ejemplo:\`\`\`\n${usedPrefix}reg *${name2}.18*`, m)
  }

  let [_, name, splitter, age] = text.match(Reg)
  
  
  if (!name) {
    return conn.reply(m.chat, '*💙 No puedes registrarte sin nombre, el nombre es obligatorio. Inténtelo de nuevo.*', m)
  }
  if (!age) {
    return conn.reply(m.chat, '*💙 No puedes registrarte sin la edad, la edad es obligatoria. Inténtelo de nuevo.*', m)
  }
  if (name.length >= 30) {
    return conn.reply(m.chat, '*💙 El nombre no debe de tener mas de 30 caracteres.*', m)
  }

  age = parseInt(age)
  if (isNaN(age)) {
    return conn.reply(m.chat, '*💙 La edad debe ser un número válido.*', m)
  }
  if (age > 999) {
    return conn.reply(m.chat, '*『😏』Viejo/a Sabroso/a*', m)
  }
  if (age < 5) {
    return conn.reply(m.chat, '*『🍼』Ven aquí, te adoptare!!*', m)
  }
  
  try {
    
    let mundo = 'Desconocido'
    try {
      let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
      let paisdata = delirius.data.result
      mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}` : 'Desconocido'
    } catch (countryError) {
      console.log('Error obteniendo país:', countryError.message)
    }

   
    let perfil = 'https://i.pinimg.com/736x/7b/c6/95/7bc6955d19ce9fa6e562e634d85c912b.jpg'
    try {
      perfil = await conn.profilePictureUrl(m.sender, 'image')
    } catch (profileError) {
      console.log('Error obteniendo foto de perfil:', profileError.message)
    }

   
    let bio = '😿 Es privada'
    let fechaBio = "Fecha no disponible"
    try {
      let biografia = await conn.fetchStatus(m.sender)
      if (biografia && biografia[0] && biografia[0].status !== null) {
        bio = biografia[0].status || '😿 Es privada'
        fechaBio = biografia[0].setAt ? new Date(biografia[0].setAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Fecha no disponible"
      }
    } catch (bioError) {
      console.log('Error obteniendo biografía:', bioError.message)
    }
    
    
    user.name = name.trim()
    user.age = age
    user.descripcion = bio
    user.regTime = +new Date()
    user.registered = true
    
   
    user.money = (user.money || 0) + 5
    user.cebollines = (user.cebollines || 0) + 15
    user.exp = (user.exp || 0) + 245
    user.joincount = (user.joincount || 0) + 12
    
    
    global.db.data.users[m.sender] = user
    
    let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)
    
   
    try {
      await m.react('📩')
    } catch (reactError) {
      console.log('Error reaccionando:', reactError.message)
    }
    
    let regbot = `💙 𝗥 𝗘 𝗚 𝗜 𝗦 𝗧 𝗥 𝗢 💙
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
「💭」𝗡𝗼𝗺𝗯𝗿𝗲: ${name}
「✨️」𝗘𝗱𝗮𝗱: ${age} años
「🌍」𝗣𝗮í𝘀: ${mundo}
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
「🎁」𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:
• 15 Cebollines 🌱
• 5 coins 🪙
• 245 Experiencia 💸
• 12 Tokens 💰
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
¡Registro completado exitosamente!
Serie número: ${sn}`

    
    const imagen3 = global.imagen3 || perfil
    const redes = global.redes || 'https://github.com/Brauliovh3/HATSUNE-MIKU'
    const packname = global.packname || 'HATSUNE-MIKU BOT'

    
    await conn.sendMessage(m.chat, {
      text: regbot,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: '¡Usuario registrado!',
          body: '💙 LA MELODIA MAS AGUDA!!',
          thumbnailUrl: imagen3,
          sourceUrl: redes,
          previewType: "PHOTO",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
    
    console.log(`Usuario registrado exitosamente: ${name} con edad ${age}`)
    
  } catch (error) {
    console.error('Error en el registro:', error)
    return conn.reply(m.chat, '*💙 Ocurrió un error durante el registro. Inténtelo de nuevo.*\n\nError: ' + error.message, m)
  }
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'] 

export default handler
