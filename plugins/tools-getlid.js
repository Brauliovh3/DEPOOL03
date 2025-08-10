import { areJidsSameUser } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, participants, args, usedPrefix, command }) => {
    try {
        await m.react('🔍')

        // Verificar que sea un grupo
        if (!m.isGroup) return m.reply('💙 *Este comando solo funciona en grupos*')

        // Si no se proporciona número, mostrar todos los LIDs del grupo
        if (!text || !args[0]) {
            let response = `🔍 *LIDS DE TODOS LOS MIEMBROS DEL GRUPO*\n\n`
            
            participants.forEach((participant, index) => {
                const phoneNumber = participant.id.split('@')[0]
                const userName = participant.notify || 'Sin nombre'
                const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
                const isSuperAdmin = participant.admin === 'superadmin'
                
                let adminStatus = '👤'
                if (isSuperAdmin) adminStatus = '👑'
                else if (isAdmin) adminStatus = '🛡️'
                
                response += `${adminStatus} *${userName}*\n`
                response += `📱 LID: \`${phoneNumber}\`\n`
                response += `// <-- ${userName} @lid -->\n`
                response += `  ['${phoneNumber}', '${userName}', true]\n\n`
            })
            
            response += `📋 *Total de miembros:* ${participants.length}`
            return conn.reply(m.chat, response, m)
        }

        // Limpiar el número (remover espacios, guiones, paréntesis, etc.)
        let phoneNumber = text.replace(/[^\d]/g, '')
        
        // Si no empieza con código de país, asumir que es peruano (51)
        if (!phoneNumber.startsWith('51') && !phoneNumber.startsWith('52') && !phoneNumber.startsWith('1') && !phoneNumber.startsWith('34') && !phoneNumber.startsWith('54')) {
            // Agregar código de país de Perú (51) por defecto
            phoneNumber = '51' + phoneNumber
        }

        // Crear el JID
        const targetJid = phoneNumber + '@s.whatsapp.net'

        // Buscar el usuario en los participantes del grupo
        const participant = participants.find(p => areJidsSameUser(p.id, targetJid))

        if (!participant) {
            return m.reply(`💙 *El numero ${phoneNumber} no se encuentra en este grupo*\n\n*Usa:* ${usedPrefix + command} (sin parametros) para ver todos los LIDs`)
        }

        // Obtener información adicional del participante
        const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
        const isSuperAdmin = participant.admin === 'superadmin'
        
        let adminStatus = '👤 Miembro'
        if (isSuperAdmin) adminStatus = '👑 Creador'
        else if (isAdmin) adminStatus = '🛡️ Administrador'

        // Obtener el nombre del usuario
        let userName = participant.notify || 'Sin nombre'

        // Extraer solo el número (LID) del JID completo
        const numberOnly = targetJid.split('@')[0]

        const response = `🔍 *INFORMACION DEL USUARIO*

👤 *Nombre:* ${userName}
🏷️ *Estado:* ${adminStatus}
📱 *Numero:* +${phoneNumber}
🆔 *JID completo:* \`${targetJid}\`
🔢 *LID:* \`${numberOnly}\`

💙 *LID listo para copiar:*
\`${numberOnly}\`

📋 *Formato para listas:*
\`\`\`
// <-- ${userName} @lid -->
  ['${numberOnly}', '${userName}', true]
\`\`\`

💡 *Tip:* Usa \`${usedPrefix + command}\` sin parametros para ver todos los LIDs del grupo`

        await conn.reply(m.chat, response, m, { mentions: [targetJid] })
        await m.react('✅')

    } catch (error) {
        console.error('Error en getlid:', error)
        await m.react('❌')
        return m.reply(`💙 *Error al obtener informacion:*\n${error.message}`)
    }
}

handler.help = ['lid', 'getlid']
handler.tags = ['tools']
handler.command = ['lid', 'getlid', 'lids', 'obtenerid']
handler.group = true
handler.register = true

export default handler
