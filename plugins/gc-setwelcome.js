const handler = async (m, {conn, text, isROwner, isOwner}) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text;
    m.reply('💙 MENSAJE DE BIENVENIDA CONFIGURADO CORRECTAMENTE PARA ESTE GRUPO*');
  } else throw `💙 INGRESE EL MENSAJE DE BIENVENIDA QUE DESEE AGREGAR, USE:*\n*- @user (mención)*\n*- @group (nombre de grupo)*\n*- @desc (description de grupo)*`;
};
handler.help = ['setwelcome <text>'];
handler.tags = ['group'];
handler.command = ['setwelcome'];
handler.admin = true;
export default handler;