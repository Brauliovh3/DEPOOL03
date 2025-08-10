import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

var handler = async (m, { conn }) => {
    try {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
        
        
        let pp;
        try {
            pp = await conn.profilePictureUrl(who, 'image');
        } catch (e) {
            console.error('Error al obtener imagen de perfil:', e);
            pp = 'https://i.pinimg.com/236x/87/ee/99/87ee997790825fd3d213b725fa73ab71.jpg'; 
        }
        
        
        if (!global.db.data.users[m.sender].cebollines) {
            global.db.data.users[m.sender].cebollines = 0;
        }
        
        let { premium, level, cebollines, exp, lastclaim, registered, regTime, age, role } = global.db.data.users[m.sender];
        let username = conn.getName(who);
        
        let noprem = `
💙 *PERFIL DE USUARIO*
☁️ *Nombre:* ${username}
🈶 *Tag:* @${who.replace(/@.+/, '')}
🌀 *Registrado:* ${registered ? '✅' : '❌'}

👑 *RECURSOS*
🌱 *Cebollines:* ${cebollines || 0}
💥 *Nivel:* ${level}
💫 *Experiencia:* ${exp}
✨️ *Rango:* ${role}

💖 *Premium:* ${premium ? '✅' : '❌'}
`.trim();
        
        let prem = `
╭──⪩ 𝐔𝐒𝐔𝐀𝐑𝐈𝐎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 ⪨
│⧼👤⧽ *ᴜsᴜᴀʀɪᴏ:* 「${username}」
│⧼💌⧽ *ʀᴇɢɪsᴛʀᴀᴅᴏ:* ${registered ? '✅' : '❌'}
│⧼🔱⧽ *ʀᴏʟ:* Vip 👑
╰───⪨

╭────⪩ 𝐑𝐄𝐂𝐔𝐑𝐒𝐎𝐒 ⪨
│⧼🌱⧽ *ᴄebollines:* ${cebollines || 0}
│⧼🔰⧽ *ɴɪᴠᴇʟ:* ${level}
│⧼💫⧽ *ᴇxᴘᴇʀɪᴇɴᴄɪᴀ:* ${exp}
│⧼⚜️⧽ *ʀᴀɴɢᴏ:* ${role}
╰───⪨ *𝓤𝓼𝓾𝓪𝓻𝓲𝓸 𝓓𝓮𝓼𝓽𝓪𝓬𝓪𝓭𝓸* ⪩`.trim();

        
        try {
            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption: `${premium ? prem.trim() : noprem.trim()}`,
                mentions: [who]
            }, { quoted: m });
        } catch (sendError) {
            console.error('Error al enviar imagen:', sendError);
            
            await conn.sendMessage(m.chat, {
                text: `${premium ? prem.trim() : noprem.trim()}`,
                mentions: [who]
            }, { quoted: m });
        }
        
    } catch (globalError) {
        console.error('Error en el handler de perfil:', globalError);
        await conn.sendMessage(m.chat, {
            text: '💙 Ocurrió un error al mostrar el perfil. Inténtalo de nuevo más tarde.',
            mentions: [m.sender]
        }, { quoted: m });
    }
};

handler.help = ['profile'];
handler.register = true;
handler.tags = ['rg'];
handler.command = ['profile', 'perfil'];
export default handler;
