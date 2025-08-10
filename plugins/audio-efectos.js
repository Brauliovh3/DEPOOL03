import {unlinkSync, readFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';
import {exec} from 'child_process';

const handler = async (m, {conn, args, __dirname, usedPrefix, command}) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
    let set;
    
   
    if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30';
    if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
    if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
    if (/earrape/.test(command)) set = '-af volume=12';
    if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
    if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
    if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
    if (/reverse/.test(command)) set = '-filter_complex "areverse"';
    if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
    if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
    if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
    if (/tupai|squirrel|chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
    
    if (!/audio/.test(mime)) {
      throw `> *💙RESPONDA AL AUDIO O NOTA DE VOZ QUE SERÁ MODIFICADO, USANDO EL COMANDO ${usedPrefix + command}*`;
    }

    
    const tmpDir = join(__dirname, '../miku/tmp');
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, { recursive: true });
    }

    const ran = getRandom('.mp3');
    const filename = join(tmpDir, ran);
    const media = await q.download(true);
    
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${media}" ${set} "${filename}"`, async (err) => {
        try {
          // Delete original media file
          if (existsSync(media)) {
            unlinkSync(media);
          }

          if (err) {
            // Delete output file if it exists
            if (existsSync(filename)) {
              unlinkSync(filename);
            }
            reject('_*Error al procesar el audio!*_');
            return;
          }

          if (!existsSync(filename)) {
            reject('_*El archivo procesado no se creó correctamente*_');
            return;
          }

          const buff = readFileSync(filename);
          await conn.sendFile(m.chat, buff, ran, null, m, true, {
            type: 'audioMessage',
            ptt: true,
          });

          
          if (existsSync(filename)) {
            unlinkSync(filename);
          }
          resolve();
        } catch (e) {
          
          [media, filename].forEach(file => {
            if (existsSync(file)) {
              unlinkSync(file);
            }
          });
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error('Error en el handler:', e);
    conn.reply(m.chat, `_*Ocurrió un error:*_ ${e.message || e}`, m);
  }
};

handler.help = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai'].map((v) => v + ' [vn]');
handler.tags = ['audio'];
handler.register = true;
handler.command = ['bass','blown','deep','earrape','fas?t','nightcore','reverse','robot','slow','smooth','tupai','squirrel','chipmunk'];
export default handler;

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};
