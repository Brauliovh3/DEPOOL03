const handler = async (m, {conn, isAdmin, groupMetadata }) => {
  
  if (isAdmin) return m.reply('💙 *Ya eres adm*.', null, { mentions: [m.sender] });
  
 
  if (!m.chat || !m.chat.endsWith('@g.us')) {
    return m.reply('💙 Este comando solo funciona en grupos.');
  }
  
  try {
   
    console.log('Chat ID:', m.chat);
    console.log('Sender:', m.sender);
    
 
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    return m.reply('💙 *Promoción exitosa*.');
  } catch (error) {
    console.error('Error in autoadmin:', error);
    return m.reply(`💙 Ocurrió un error: ${error.message}`);
  }
};

handler.tags = ['mods'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.botAdmin = true;
export default handler;
