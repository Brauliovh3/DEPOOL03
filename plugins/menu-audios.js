import fs from 'fs';
import path from 'path';

const audioDir = path.join(process.cwd(), 'src', 'audios');

const mikuAudios = {
    'mundo': '🎵 World is Mine',
    'senbonzakura': '🌸 Senbonzakura', 
    'tellworld': '🌍 Tell Your World',
    'lovewar': '💕 Love is War',
    'rolling': '🎵 Rolling Girl',
    'disappear': '💫 The Disappearance',
    'hola': '👋 Hola Miku',
    'arigatou': '🙏 Arigatou',
    'kawaii': '💖 Kawaii desu',
    'ganbatte': '💪 Ganbatte',
    'risa': '😂 Risa Miku',
    'sorpresa': '😱 Eh?!',
    'feliz': '😊 Felicidad',
    'buenasnoches': '🌙 Buenas noches'
};

let handler = async (m, { conn, command, args, usedPrefix, isGroup, isAdmin, isBotAdmin }) => {
    const chat = global.db.data.chats[m.chat];
    
    // Comandos para activar/desactivar audios
    if (command === 'enable' || command === 'disable') {
        if (!args[0]) return;
        if (args[0] === 'audios' || args[0] === 'miku') {
            if (m.isGroup) {
                if (!isAdmin) return m.reply('❌ Solo los administradores pueden cambiar esta configuración.');
                if (!isBotAdmin) return m.reply('❌ El bot necesita ser administrador para esta función.');
            }
            
            if (command === 'enable') {
                chat.miku = true;
                m.reply(`✅ *AUDIOS MIKU ACTIVADOS*\n\n🎤 Escribe: mundo, hola, kawaii, etc.\n📋 Menu: *menuaudios*`);
            } else {
                chat.miku = false;
                m.reply(`❌ *AUDIOS MIKU DESACTIVADOS*\n\n💡 Para reactivar: *enable audios*`);
            }
        }
        return;
    }
    
    // Mostrar menú de audios
    if (command === 'menuaudios' || (command === 'menu' && args[0] === 'audios')) {
        return await showAudioMenu(m, conn, usedPrefix);
    }
    
    // Reproducir audio específico si los audios están activados
    if (chat.miku && Object.keys(mikuAudios).includes(command)) {
        return await playAudio(m, conn, command);
    }
};

async function showAudioMenu(m, conn, usedPrefix) {
    const chat = global.db.data.chats[m.chat];
    const isEnabled = chat.miku;
    
    const status = isEnabled ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
    const audioList = Object.keys(mikuAudios).map(key => `• ${key}`).join('\n');
    
    const message = `┏━━『 🎵 MIKU AUDIOS 』━━┓
┃ ${status}
┣━━━━━━━━━━━━━━━━━━━━
┃ 🎤 *Audios:*
┃ ${audioList.replace(/\n/g, '\n┃ ')}
┣━━━━━━━━━━━━━━━━━━━━
┃ 🔧 *Comandos:*
┃ • enable audios
┃ • disable audios
┣━━━━━━━━━━━━━━━━━━━━
┃ 💡 Escribe la palabra clave
┗━━━━━━━━━━━━━━━━━━━━`;

    m.reply(message);
}

async function playAudio(m, conn, audioKey) {
    const audioInfo = mikuAudios[audioKey];
    const audioPath = path.join(audioDir, `${audioKey}.mp3`);
    
    try {
        // Verificar si el archivo existe
        if (fs.existsSync(audioPath)) {
            // Enviar el audio real
            await conn.sendMessage(m.chat, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4',
                fileName: `miku-${audioKey}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: '🎵 Hatsune Miku',
                        body: audioInfo,
                        thumbnailUrl: 'https://i.imgur.com/DlAzgpK.jpg',
                        sourceUrl: 'https://github.com/Brauliovh3/HATSUNE-MIKU',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
        } else {
            m.reply(`🎵 *${audioInfo}*\n\n💡 Audio simulado\n📁 Archivo: src/audios/${audioKey}.mp3`);
        }
    } catch (error) {
        console.error('Error al reproducir audio:', error);
        m.reply('❌ Error al reproducir el audio.');
    }
}

handler.help = ['enable audios', 'disable audios', 'menu audios'];
handler.tags = ['enable', 'audio', 'entertainment'];
handler.command = /^(enable|disable|menuaudios?|mundo|senbonzakura|tellworld|lovewar|rolling|disappear|hola|arigatou|kawaii|ganbatte|risa|sorpresa|feliz|buenasnoches)$/i;

export default handler;
