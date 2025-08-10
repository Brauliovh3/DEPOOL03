import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  try {
    const pp = imagen1
    const d = new Date(new Date + 3600000);
    const locale = 'es-ES';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: '2-digit', month: '2-digit', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, limit, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const rtotal = Object.entries(global.db.data.users).length || '0'
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];

 await conn.sendMessage(m.chat, { react: { text: '☂️', key: m.key } })


const document = doc[Math.floor(Math.random() * doc.length)];
 const str = `╭━━━━･❪ *DIVERSIONES* ❫ ･━━━━╮
┃🌱 _!rw_
┃🌱 _!ob_
┃🌱 _!robarp *<nombre / @tag>*_
┃🌱 _!toprw_
┃🌱 _!darp *<nombre / @tag>*_
┃🌱 _!ruleta_
┃🌱 _!violar *<responder / @tag>*_
┃🌱 _!sexo *<responder / @tag>*_
┃🌱 _!nalguear *<responder / @tag>*_
┃🌱 _!anal *<responder / @tag>*_
┃🌱 _!kiss *<responder / @tag>*_
┃🌱 _!69 *<responder / @tag>*_
┃🌱 _!agarrartetas *<responder / @tag>*_
┃🌱 _!blush *<responder / @tag>*_
┃🌱 _!chupartetas *<responder / @tag>*_
┃🌱 _!nalguear *<responder / @tag>*_
┃🌱 _!dance *<responder / @tag>*_
┃🌱 _!hug *<responder / @tag>*_
┃🌱 _!laungh *<responder / @tag>*_
┃🌱 _!love *<responder / @tag>*_
┃🌱 _!mamada *<responder / @tag>*_
┃🌱 _!pat *<responder / @tag>*_
┃🌱 _!pout *<responder / @tag>*_
┃🌱 _!punch *<responder / @tag>*_
┃🌱 _!nalguear *<responder / @tag>*_
┃🌱 _!rusa *<responder / @tag>*_
┃🌱 _!sad *<responder / @tag>*_
┃🌱 _!asustado *<responder / @tag>*_
┃🌱 _!timido *<responder / @tag>*_
┃🌱 _!slap *<responder / @tag>*_
┃🌱 _!sleep *<responder / @tag>*_
┃🌱 _!yuri *<responder / @tag>*_
┃🌱 _!mates *<noob / easy / medium / hard / extreme /impossible /impossible2>*_
┃🌱 _!fake *<texto1> <@tag> <texto2>*_
┃🌱 _!ppt *<papel / tijera /piedra>*_
┃🌱 _!prostituto *<nombre / @tag>*_
┃🌱 _!prostituta *<nombre / @tag>*_
┃🌱 _!gay2 *<nombre / @tag>*_
┃🌱 _!lesbiana *<nombre / @tag>*_
┃🌱 _!pajero *<nombre / @tag>*_
┃🌱 _!pajera *<nombre / @tag>*_
┃🌱 _!follar *<nombre / @tag>*_
┃🌱 _!puto *<nombre / @tag>*_
┃🌱 _!puta *<nombre / @tag>*_
┃🌱 _!manco *<nombre / @tag>*_
┃🌱 _!manca *<nombre / @tag>*_
┃🌱 _!rata *<nombre / @tag>*_
┃🌱 _!love *<nombre / @tag>*_
┃🌱 _!doxear *<nombre / @tag>*_
┃🌱 _!pregunta *<texto>*_
┃🌱 _!suitpvp *<@tag>*_
┃🌱 _!slot *<apuesta>*_
┃🌱 _!ttt *<nombre sala>*_
┃🌱 _!delttt_
┃🌱 _!acertijo_
┃🌱 _!personalidad *<nombre / @tag>*_
┃🌱 _!simi *<texto>*_
┃🌱 _!top *<texto>*_
┃🌱 _!topgays_
┃🌱 _!topotakus_
┃🌱 _!formarpareja_
┃🌱 _!verdad_
┃🌱 _!crime_
┃🌱 _!reto_
┃🌱 _!cancion_
┃🌱 _!pista_
┃🌱 _!akinator_
┃🌱 _!wordfind_
╰•°• ✾ •°••°• ✾ •°••°• ✾ •°•°••°• ✾ •°•`.trim();     if (m.isGroup) { 
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {imageUrl: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: m});
    } else {
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {imageUrl: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: m});
    }
  } catch {
    conn.reply(m.chat, '*💙 Error Al Enviar!.*', m);
  }
};
handler.command = ['juegosmenu','games','juegos','menujuegos']
handler.register = true
handler.exp = 50;
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}