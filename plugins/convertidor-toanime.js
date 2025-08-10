import uploadImage from '../lib/uploadImage.js';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) throw '💙 *Responde a una imagen*';
  
  await m.reply('💙 *Convirtiendo imagen a anime, por favor espera...*');
  
  try {
    const data = await q.download?.();
    const imageUrl = await uploadImage(data);
    
    const apis = [
      {
        name: 'Lolhuman',
        url: `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${imageUrl}`,
        headers: {}
      },
      {
        name: 'Zahwazein',
        url: `https://api.zahwazein.xyz/photoeditor/jadianime?url=${imageUrl}&apikey=${keysxxx}`,
        headers: {}
      },
      {
        name: 'Caliph',
        url: `https://api.caliph.biz.id/api/animeai?img=${imageUrl}&apikey=caliphkey`,
        headers: {}
      }
    ];

    for (const api of apis) {
      try {
        const response = await axios.get(api.url, {
          responseType: 'arraybuffer',
          headers: api.headers,
          timeout: 30000
        });

        const buffer = Buffer.from(response.data);
        const type = await fileTypeFromBuffer(buffer);

        if (!type || !type.mime.startsWith('image/')) {
          console.log(`API ${api.name} devolvió un tipo no válido:`, type);
          continue;
        }

        const filename = `anime.${type.ext}`;
        await conn.sendFile(m.chat, buffer, filename, '💙 *Imagen convertida a anime*', m);
        return;

      } catch (e) {
        console.error(`Error con API ${api.name}:`, e.message);
        continue;
      }
    }

    throw '💙 *Todos los servicios fallaron. Intenta con otra imagen o más tarde.*';

  } catch (e) {
    console.error('Error general:', e);
    throw '💙 *Ocurrió un error al procesar tu imagen. Por favor intenta nuevamente.*';
  }
};

handler.help = ['toanime'];
handler.tags = ['tools'];
handler.register = true;
handler.command = ['jadianime', 'toanime'];
export default handler;
