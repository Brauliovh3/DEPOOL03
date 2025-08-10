import fs from 'fs';  
import path from 'path';  

let handler = async (m, { conn, usedPrefix }) => {  
    try {  
        if (!db.data.chats[m.chat].nsfw && m.isGroup) {  
            return m.reply('💙 *¡Estos comandos están desactivados!*');  
        }  

        let who;  
        if (m.isGroup) {  
            who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;  
        } else {  
            who = m.chat;  
        }  

        if (!who) throw 'Etiqueta o menciona a alguien';  
        
        let user = global.db.data.users[who];  
        let name = conn.getName(who);  
        let name2 = conn.getName(m.sender);  
        m.react('🔥');  

        let str = `💙 ${name2} le está dando una mamada a ${name}`.trim();   
        
        if (m.isGroup) {  
            const videos = [  
                'https://telegra.ph/file/0260766c6b36537aa2802.mp4',  
                'https://telegra.ph/file/2c1c68c9e310f60f1ded1.mp4',  
                'https://telegra.ph/file/e14f5a31d3b3c279f5593.mp4',   
                'https://telegra.ph/file/e020aa808f154a30b8da7.mp4',   
                'https://telegra.ph/file/1cafb3e72664af94d45c0.mp4',   
                'https://telegra.ph/file/72b49d3b554df64e377bb.mp4',   
                'https://telegra.ph/file/9687aedfd58a3110c7f88.mp4',  
                'https://telegra.ph/file/c799ea8a1ed0fd336579c.mp4',  
                'https://telegra.ph/file/7352d18934971201deed5.mp4',  
                'https://telegra.ph/file/379edd38bac6de4258843.mp4',  
                'https://qu.ax/dYARO.mp4',  
                'https://qu.ax/pgUHh.mp4',  
                'https://qu.ax/ZrUkJ.mp4',  
                'https://qu.ax/yyqRx.mp4',  
                'https://qu.ax/Yccxx.mp4',  
                'https://qu.ax/dYARO.mp4'  
            ];  

            const video = videos[Math.floor(Math.random() * videos.length)];  
            await conn.sendMessage(m.chat, {   
                video: { url: video },   
                gifPlayback: true,   
                caption: str,   
                mentions: [m.sender]   
            }, { quoted: m });  
        }  
    } catch (error) {  
        console.error(error);  
        conn.reply(m.chat, error.message || 'Ocurrio un error.', m);  
    }  
}  

handler.help = ['mamada @tag'];  
handler.tags = ['fun'];  
handler.command = ['mamada', 'blowjob', 'mamar'];  
handler.group = true;  

export default handler;
