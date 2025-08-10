import axios from 'axios';
import {generateWAMessageFromContent} from '@whiskeysockets/baileys';
import {tiktokdl} from '@bochilteam/scraper';
const CFROSAPI = global.APIs.CFROSAPI;

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  if (!text) throw `_*< DESCARGAS - TIKTOK />*_\n\n*💙 Ingrese Un Enlace De Video De TikTok.*\n\n*💙 Ejemplo:* _${usedPrefix + command} https://vm.tiktok.com/ZM6UHJYtE/_`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `*< DESCARGAS - TIKTOK />*\n\n*💙 Ingrese Un Enlace De Video De TikTok.*\n\n*💙 Ejemplo:* _${usedPrefix + command} https://vm.tiktok.com/ZM6UHJYtE /_`;
  
 
  m.react('🕒').catch(() => {});
  

  try {
    const successMessage = `💙 Tiktok sin marca de agua descargado con éxito`;
    
    const downloadMethods = [
      
      async () => {
        const dataFn = await conn.getFile(`${CFROSAPI}/api/tiktokv2?url=${args[0]}`);
        return {video: dataFn.data, caption: successMessage};
      },
      
     
      async () => {
        const {video} = await tiktokdl(args[0]);
        const url = video.no_watermark2 || video.no_watermark || 'https://tikcdn.net' + video.no_watermark_raw || video.no_watermark_hd;
        return {video: {url}, caption: successMessage};
      }
    ];
    
    
    const result = await Promise.any(downloadMethods.map(method => method()));
    
    
    await conn.sendMessage(m.chat, {video: result.video, caption: result.caption}, {quoted: fkontak});
    
    
    m.react('✅').catch(() => {});
    
  } catch (error) {
   
    m.react('❌').catch(() => {});
    throw `_*< DESCARGAS - TIKTOK />*_\n\n*💙 Ocurrió un error. Por favor, inténtalo de nuevo más tarde.*`;
  }
};

handler.tags = ['descargas'];
handler.help = ['tiktok'];
handler.command = ['tiktok','ttdl','tiktokdl','tiktoknowm','tt','ttnowm','tiktokaudio'];
handler.group = true;
handler.register = true;

export default handler;
