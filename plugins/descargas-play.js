import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];

  

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💙 Ingresa el nombre de la música a descargar.\n\nEjemplo: ${usedPrefix}${command} Coldplay Viva la Vida`, m, fake);
    }

    
    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    
    const videoInfo = search.all[0];
    if (!videoInfo) {
      return m.reply('No se pudo obtener información del video.');
    }

   
    const { 
      title = 'Desconocido', 
      thumbnail = '', 
      timestamp = 'Desconocido', 
      views = 0, 
      ago = 'Desconocido', 
      url = '', 
      author = { name: 'Desconocido' } 
    } = videoInfo;

    
    if (!url) {
      return m.reply('No se pudo obtener la URL del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';
    
   
    const infoMessage = `
*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ💙𝗠𝗶𝗸𝘂𝗺𝗶𝗻🌱ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*
> 💙 *Título:* ${title}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 🌱 *Duración:* ${timestamp}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 💙 *Vistas:* ${vistas}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 🌱 *Canal:* ${canal}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 💙 *Publicado:* ${ago}
*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*
> 💌 *Elige un formato:*
> 1️⃣ - MP3 (Audio)
> 2️⃣ - MP4 (Video)
> 3️⃣ - MP3 Documento (archivos grandes)
> 4️⃣ - MP4 Documento (archivos grandes)
> 🈹 Responde a este mensaje con el número`;

    try {
      const thumb = thumbnail ? (await conn.getFile(thumbnail))?.data : null;

      const JT = {
        contextInfo: {
          externalAdReply: {
            title: botname || 'Miku Bot',
            body: dev || 'YouTube Downloader',
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true,
          },
        },
      };

      
      const sentMsg = await conn.reply(m.chat, infoMessage, m, JT);
      
      
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
      }
      
      
      global.db.data.users[m.sender].lastYTSearch = {
        url,
        title,
        messageId: m.key.id,  
        timestamp: Date.now() 
      };
      
      console.log(`Stored search for user ${m.sender}: ${title} (ID: ${m.key.id})`);
      
    } catch (thumbError) {
      
      const sentMsg = await conn.reply(m.chat, infoMessage, m);
      
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
      }
      
      
      global.db.data.users[m.sender].lastYTSearch = {
        url,
        title,
        messageId: m.key.id,  
        timestamp: Date.now() 
      };
      
      console.log("Error al obtener la miniatura:", thumbError);
    }

  } catch (error) {
    console.error("Error completo:", error);
    return m.reply(`💙 Ocurrió un error: ${error.message || 'Desconocido'}`);
  }
};


async function processDownload(conn, m, url, title, option) {
  
  await conn.reply(m.chat, `💙 Procesando ${option === 1 || option === 3 ? 'audio' : 'video'}. Por favor espera...`, m);
  
  try {
    
    if (option === 1 || option === 3) {
    
      const audioUrl = await getAudioUrl(url);
      if (!audioUrl) {
        throw new Error("No se pudo obtener el enlace de audio.");
      }
      
      if (option === 1) {
       
        await conn.sendMessage(m.chat, { 
          audio: { url: audioUrl }, 
          fileName: `${title}.mp3`, 
          mimetype: 'audio/mpeg' 
        }, { quoted: m });
      } else {
       
        await conn.sendMessage(m.chat, { 
          document: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        }, { quoted: m });
      }
    } else {
      
      const videoUrl = await getVideoUrl(url);
      if (!videoUrl) {
        throw new Error("No se pudo obtener el enlace de video.");
      }
      
      if (option === 2) {
      
        await conn.sendMessage(m.chat, { 
          video: { url: videoUrl }, 
          fileName: `${title}.mp4`, 
          mimetype: 'video/mp4', 
          caption: `${title}`
        }, { quoted: m });
      } else {
     
        await conn.sendMessage(m.chat, { 
          document: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: `${title}`
        }, { quoted: m });
      }
    }
    
    
    const user = global.db.data.users[m.sender];
    if (!user.cebollinesDeducted) {
      user.chocolates -= 2;
      user.cebollinesDeducted = true;
      conn.reply(m.chat, `💙 Has utilizado 2 *Cebollines 🌱*`, m);
    }
    
    return true;
  } catch (error) {
    console.error("Error al procesar descarga:", error);
    conn.reply(m.chat, `💙 Error: ${error.message}`, m);
    return false;
  }
}


async function getAudioUrl(videoUrl) {
  const apis = [
    `https://api.vreden.my.id/api/ytmp3?url=${videoUrl}`,
    `https://api.botcahx.biz.id/api/dowloader/yt?url=${videoUrl}&apikey=Admin`,
    `https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=${videoUrl}`
  ];
  
  for (let i = 0; i < apis.length; i++) {
    try {
      const apiResponse = await fetch(apis[i]);
      const apiJson = await apiResponse.json();
      
   
      let audioUrl = null;
      if (i === 0) {
        audioUrl = apiJson.result?.download?.url;
      } else if (i === 1) {
        audioUrl = apiJson.result?.mp3;
      } else {
        audioUrl = apiJson.result?.link || apiJson.result?.audio?.link;
      }
      
      if (audioUrl) return audioUrl;
    } catch (e) {
      console.error(`API ${i+1} falló:`, e);
    }
  }
  
  return null;
}


async function getVideoUrl(videoUrl) {
  const apis = [
    `https://api.vreden.my.id/api/ytmp4?url=${videoUrl}`,
    `https://api.botcahx.biz.id/api/dowloader/yt?url=${videoUrl}&apikey=Admin`,
    `https://api.lolhuman.xyz/api/ytvideo?apikey=GataDios&url=${videoUrl}`
  ];
  
  for (let i = 0; i < apis.length; i++) {
    try {
      const apiResponse = await fetch(apis[i]);
      const apiJson = await apiResponse.json();
      
     
      let url = null;
      if (i === 0) {
        url = apiJson.result?.download?.url;
      } else if (i === 1) {
        url = apiJson.result?.mp4;
      } else {
        url = apiJson.result?.link;
      }
      
      if (url) return url;
    } catch (e) {
      console.error(`API ${i+1} falló:`, e);
    }
  }
  
  return null;
}


handler.before = async (m, { conn }) => {
 
  if (!/^[1-4]$/.test(m.text)) return false;
  
  const user = global.db.data.users[m.sender];
  if (!user || !user.lastYTSearch) return false;
  
  console.log(`Received option: ${m.text} from user ${m.sender}`);
  console.log(`User has active search: ${user.lastYTSearch.title}`);
  
 
  const currentTime = Date.now();
  const searchTime = user.lastYTSearch.timestamp || 0;
  
  if (currentTime - searchTime > 10 * 60 * 1000) {
    console.log("Search expired");
    return false; 
  }
  
 
  const option = parseInt(m.text);
  if (isNaN(option) || option < 1 || option > 4) return false;
  
  console.log(`Processing option ${option} for ${user.lastYTSearch.title}`);
  

  user.cebollinesDeducted = false;
  

  await processDownload(
    conn, 
    m, 
    user.lastYTSearch.url, 
    user.lastYTSearch.title, 
    option
  );
  

  user.lastYTSearch = null;
  
  return true;
};


function formatViews(views) {
  if (views === undefined) {
    return "No disponible";
  }

  try {
    if (views >= 1_000_000_000) {
      return `${(views / 1_000_000_000).toFixed(1)}B`;
    } else if (views >= 1_000_000) {
      return `${(views / 1_000_000).toFixed(1)}M`;
    } else if (views >= 1_000) {
      return `${(views / 1_000).toFixed(1)}k`;
    }
    return views.toLocaleString();
  } catch (e) {
    return String(views);
  }
}


handler.command = handler.help = ['play'];
handler.tags = ['downloader'];

export default handler;
