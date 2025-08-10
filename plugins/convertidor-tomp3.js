import {toAudio} from '../lib/converter2.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';
  if (!/video|audio/.test(mime)) throw "💙 *RESPONDA AL VIDEO O NOTA DE VOZ QUE DESEE CONVERTIR A AUDIO/MP3*";
  
  try {
    const media = await q.download();
    if (!media) throw "💙 *LO LAMENTO, OCURRIO UN ERROR AL DESCARGAR SU VIDEO, POR FAVOR VUELVA A INTENTARLO*";
    
    const audio = await toAudio(media, 'mp4');
    if (!audio.data) throw "💙 *LO LAMENTO, OCURRIO UN ERROR AL CONVERTIR SU NOTA DE VOZ A AUDIO/MP3, POR FAVOR VUELVA A INTENTARLO*";
    
    conn.sendMessage(m.chat, {audio: audio.data, mimetype: 'audio/mpeg'}, {quoted: m});
  } catch (error) {
    console.error('Error in tomp3 handler:', error);
    throw `💙 *OCURRIO UN ERROR*: ${error.message}`;
  }
};

handler.alias = ['tomp3', 'toaudio'];
handler.command = ['tomp3','toaudio'];
handler.register = true;
export default handler;
