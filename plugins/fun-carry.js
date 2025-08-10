import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw '💙 Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('🤲');
    let str = `💙${name2} Esta cargando a ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://files.catbox.moe/6zum3j.mp4'
    let pp2 = 'https://files.catbox.moe/qcl01g.mp4'
    let pp3 = 'https://files.catbox.moe/t5n0z9.mp4'
    let pp4 = 'https://files.catbox.moe/h2nbfu.mp4'
    let pp5 = 'https://files.catbox.moe/d7ayqi.mp4'
    let pp6 = 'https://files.catbox.moe/782t52.mp4' 
    let pp7 = 'https://files.catbox.moe/aly431.mp4' 
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['carry @tag'];
handler.tags = ['fun'];
handler.command = ['carry','cargar','levantar'];
handler.group = true;

export default handler;
