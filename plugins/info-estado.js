import ws from 'ws'

let handler = async (m, { conn, usedPrefix, isRowner }) => {
    try {
        let muptime = process.uptime() * 1000
        let totalreg = 0
        let totalchats = 0
        
    
        try {
            totalreg = Object.keys(global.db.data.users || {}).length
            totalchats = Object.keys(global.db.data.chats || {}).length
        } catch (e) {
            console.log('Error obteniendo datos de DB')
        }
        
        let pp = "https://i.pinimg.com/736x/7b/c6/95/7bc6955d19ce9fa6e562e634d85c912b.jpg"
        let uptime = clockString(muptime)
        
       
        let totalUsers = 0
        try {
            if (global.conns && Array.isArray(global.conns)) {
                totalUsers = global.conns.filter(conn => 
                    conn && conn.user && conn.ws && conn.ws.socket && 
                    conn.ws.socket.readyState !== ws.CLOSED
                ).length
            }
        } catch (error) {
            totalUsers = 0
        }
        
    
        let chatsCount = 0
        let groupsCount = 0
        let privateChats = 0
        
        try {
            const chats = Object.entries(conn.chats || {}).filter(([id, data]) => id && data.isChats)
            const groups = chats.filter(([id]) => id.endsWith('@g.us'))
            
            chatsCount = chats.length
            groupsCount = groups.length
            privateChats = chats.length - groups.length
        } catch (e) {
            console.log('Error obteniendo chats')
        }
        
      
        let old = performance.now()
        let neww = performance.now()
        let speed = neww - old
        
      
        let memoryUsed = '0'
        try {
            const used = process.memoryUsage()
            memoryUsed = (used.heapUsed / 1024 / 1024).toFixed(2)
        } catch (e) {
            memoryUsed = 'N/A'
        }
        
       
        const version = global.vs || '1.0.0'
        
        
        let miku = `💙 \`\`\`Información - HatsuneMiku\`\`\` 💙\n\n`
        miku += `💙 ◜Creador◞ ⇢ (ㅎㅊDEPOOLㅊㅎ)\n`
        miku += `❗️ ◜Prefijo◞ ⇢ [ ${usedPrefix} ]\n`
        miku += `🌺꙰ ◜Versión◞ ⇢ ${version}\n`
        miku += `🌻꙰ ◜Chats Privados◞ ⇢ ${privateChats}\n`
        miku += `💥 ◜Total De Chats◞ ⇢ ${chatsCount}\n`
        miku += `👥️️ ◜Usuarios Registrados◞ ⇢ ${totalreg}\n`
        miku += `📌 ◜Grupos◞ ⇢ ${groupsCount}\n`
        miku += `🕝 ◜Actividad◞ ⇢ ${uptime}\n`
        miku += `🚀 ◜Velocidad◞ ⇢ ${speed.toFixed(3)}ms\n`
        miku += `🌱 ◜SubBots Activos◞ ⇢ ${totalUsers}\n`
        miku += `💾 ◜Memoria Usada◞ ⇢ ${memoryUsed} MB`
       
 
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: miku, 
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: 'Estado del Bot',
                    body: 'Hatsune Miku 🎶',
                    thumbnailUrl: pp,
                    sourceUrl: 'https://github.com/Brauliovh3',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
        
    } catch (error) {
        console.error('Error en estado:', error)
        
        let msg = `💙 HatsuneMiku Bot 💙\n\n`
        msg += `Prefijo: ${usedPrefix}\n`
        msg += `Estado: ✅ Online\n`
        msg += `Actividad: ${clockString(process.uptime() * 1000)}`
        
        await conn.reply(m.chat, msg, m)
    }
}

handler.help = ['status']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats']
handler.register = true

export default handler

function clockString(ms) {
    if (!ms || isNaN(ms)) return '00:00:00'
    
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
