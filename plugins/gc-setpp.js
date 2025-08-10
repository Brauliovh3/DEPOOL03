import { makeWASocket } from '@whiskeysockets/baileys';
import fs from 'fs';

let handler = async (m, { conn, args }) => {

  let newImage = args[0];
  if (!newImage || !fs.existsSync(newImage)) {
    return m.reply('💙 Por favor, proporciona una ruta válida para la nueva imagen.');
  }

  try {
    let groupId = m.chat;
    await conn.updateProfilePicture(groupId, { url: newImage });
    m.reply('💙 Imagen de perfil del grupo actualizada exitosamente.');
  } catch (e) {
    m.reply(`💙 *Error:* ${e.message}`);
  }
};

handler.command = ['setppgroup', 'setgrouppic'];
handler.admin = true;
handler.botAdmin = true;

export default handler;