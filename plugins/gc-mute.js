import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
  // MUTE command
  if (command === 'mute') {
    // Check if command executor is admin
    if (!isAdmin) throw '💙 *Solo un administrador puede ejecutar este comando';
    
    // Get owner's WhatsApp ID
    const ownerJid = global.owner[0][0] + '@s.whatsapp.net';
    
    // Prevent muting the bot owner
    if (m.mentionedJid[0] === ownerJid) throw '👑 *El creador del bot no puede ser mutado*';
    
    // Get target user (either mentioned, quoted, or from text)
    let targetJid = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
    
    // Prevent muting the bot itself
    if (targetJid === conn.user.jid) throw '💙 *No puedes mutar el bot*';
    
    // Get group metadata and creator
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupCreator = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    
    // Prevent muting the group creator
    if (m.mentionedJid[0] === groupCreator) throw '👑 *No puedes mutar el creador del grupo*';
    
    // Get user data
    let userData = global.db.data.users[targetJid];
    
    // Create a fake message for the reply
    const fakeMsg = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };
    
    // Message to display if no user is mentioned
    const helpMsg = '💙 *Menciona a la persona que deseas mutar*';
    
    // Check if a user was mentioned or quoted
    if (!m.mentionedJid[0] && !m.quoted) return conn.reply(m.chat, helpMsg, m);
    
    // Check if user is already muted
    if (userData.muto === true) throw '💙 *Este usuario ya ha sido mutado*';
    
    // Mute the user
    conn.reply(m.chat, '*Tus mensajes serán eliminados*', fakeMsg, null, { mentions: [targetJid] });
    global.db.data.users[targetJid].muto = true;
  } 
  // UNMUTE command
  else if (command === 'unmute') {
    // Check if command executor is admin
    if (!isAdmin) throw m.reply('💙 *Solo un administrador puede ejecutar este comando');
    
    // Get target user (either mentioned, quoted, or from text)
    let targetJid = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
    
    // Get user data
    let userData = global.db.data.users[targetJid];
    
    // Create a fake message for the reply
    const fakeMsg = {
      key: {
        participants: '0@s.whatsapp.net',
        fromMe: false,
        id: 'Halo'
      },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
          vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\nX-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD'
        }
      },
      participant: '0@s.whatsapp.net'
    };
    
    // Message to display if no user is mentioned
    const helpMsg = '💙 *Menciona a la persona que deseas demutar*';
    
    // Prevent unmuting yourself
    if (targetJid === m.sender) throw '✨️ *Sólo otro administrador puede desmutarte*';
    
    // Check if a user was mentioned or quoted
    if (!m.mentionedJid[0] && !m.quoted) return conn.reply(m.chat, helpMsg, m);
    
    // Check if user is already unmuted
    if (userData.muto === false) throw '☁️ *Este usuario no ha sido mutado*';
    
    // Unmute the user
    global.db.data.users[targetJid].muto = false;
    conn.reply(m.chat, '*Tus mensajes no serán eliminados*', fakeMsg, null, { mentions: [targetJid] });
  }
};

handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;