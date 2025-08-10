import moment from 'moment-timezone';
import fetch from 'node-fetch';


const packname = "Hatsune Miku Bot";
const wm = "Powered by Brauliovh3";
const imagen1 = "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/02/colorful-stage-hatsune-miku-movie.jpg";

let handler = async (m, { conn, args }) => {
  try {
    let res = await fetch('https://api.github.com/repos/Brauliovh3/HATSUNE-MIKU');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    let json = await res.json();

    let updatedAt = moment(json.updated_at).format('DD/MM/YY - HH:mm:ss');
    let repoSize = (json.size / 1024).toFixed(2);

    let txt = `*💙 S C R I P T  -  M A I N 💙*\n\n`;
    txt += `💙  *Nombre* : ${json.name}\n`;
    txt += `💙  *Visitas* : ${json.watchers_count}\n`;
    txt += `💙  *Peso* : ${repoSize} MB\n`;
    txt += `💙  *Actualizado* : ${updatedAt}\n`;
    txt += `💙  *Url* : ${json.html_url}\n`;
    txt += `💙  *Forks* : ${json.forks_count}\n`;
    txt += `💙  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `🌱 *${packname}*`;

    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: packname,
          body: wm,
          thumbnailUrl: imagen1,
          sourceUrl: json.html_url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });

  } catch (error) {
    console.error('Error in script command:', error);
    await m.reply(`❌ Error al obtener información del repositorio: ${error.message}`);
    await m.react('❌'); 
  }
};

handler.help = ['script'];
handler.tags = ['main'];
handler.command = ['script', 'sc'];
handler.register = true;

export default handler;
