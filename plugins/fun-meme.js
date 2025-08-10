import axios from 'axios';
import { tiktokdl } from '@bochilteam/scraper';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const tiktokMemes = [
    'https://vm.tiktok.com/ZMBKuGoUk/',
    'https://vm.tiktok.com/ZMBKuGr64/',
    'https://vm.tiktok.com/ZMBKuEuwv/',
    'https://vm.tiktok.com/ZMBKup4A5/',
    'https://vm.tiktok.com/ZMBKH8dkX/',
    'https://vm.tiktok.com/ZMBKu7Xp8/',
    'https://vm.tiktok.com/ZMBKHenkb/',
    'https://vm.tiktok.com/ZMBKuENd9/',
    'https://vm.tiktok.com/ZMBK9Sdjm/'
  ];

  try {
    
    let index = args[0] ? parseInt(args[0]) - 1 : Math.floor(Math.random() * tiktokMemes.length);
    
    if (isNaN(index) || index < 0 || index >= tiktokMemes.length) {
      return conn.reply(m.chat, `⚠️ Usa un número del 1 al 8\nEjemplo: *${usedPrefix}${command} 2*`, m);
    }

    const selectedUrl = tiktokMemes[index];
    
    
    await m.react('🤣').catch(() => {});
    
    
    const downloadMethods = [
      
      async () => {
        if (!global.APIs?.CFROSAPI) throw new Error('CFROSAPI no configurada');
        const { data } = await axios.get(`${global.APIs.CFROSAPI}/api/tiktokv2?url=${encodeURIComponent(selectedUrl)}`);
        return {
          video: data,
          caption: `😂 Meme #${index + 1} de mi colección\n\nDescargado sin marca de agua`
        };
      },
      
      
      async () => {
        const { video } = await tiktokdl(selectedUrl);
        const url = video.no_watermark2 || video.no_watermark || 'https://tikcdn.net' + video.no_watermark_raw;
        return {
          video: { url },
          caption: `🔥 Meme #${index + 1} - Viral en TikTok`
        };
      },
      
      
      async () => {
        const { data } = await axios.get(`https://api.tikwm.com/api/video/info?url=${encodeURIComponent(selectedUrl)}`);
        return {
          video: { url: data.data.play },
          caption: `🎬 Meme #${index + 1}\n\nLikes: ${data.data.digg_count || 0}`
        };
      }
    ];

    
    const result = await Promise.any(downloadMethods.map(method => method().catch(e => {
      console.error(`Método fallido: ${e.message}`);
      throw e;
    })));

    
    await conn.sendMessage(
      m.chat, 
      {
        video: result.video,
        caption: result.caption,
        mentions: [m.sender]
      }, 
      { quoted: m }
    );
    
    
    await m.react('✅').catch(() => {});

  } catch (error) {
    console.error('Error al descargar meme:', error);
    await m.react('❌').catch(() => {});
    await conn.reply(m.chat, 
      `❌ Error al cargar el meme #${index + 1}\n\nPrueba con otro número o intenta más tarde`, 
      m
    );
  }
};

handler.help = ['meme <1-8>'];
handler.tags = ['fun'];
handler.command = /^(meme|memetk|tmeme)$/i;
handler.limit = true;
handler.group = true;
handler.register = true;

export default handler;
