import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('./src/database/casados.json');


function loadMarriages() {
  try {
    if (fs.existsSync(marriagesFile)) {
      return JSON.parse(fs.readFileSync(marriagesFile, 'utf8'));
    }
    return {};
  } catch (e) {
    console.error('Error loading marriages:', e);
    return {};
  }
}

function saveMarriages(data) {
  try {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving marriages:', e);
  }
}

let marriages = loadMarriages();
let proposals = {};

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    const sender = m.sender;
    const cmd = command.toLowerCase();
    
    
    if (cmd !== 'marry' && cmd !== 'casarse' && cmd !== 'divorce' && cmd !== 'divorcio') {
      return;
    }

    const isMarry = cmd === 'marry' || cmd === 'casarse';
    const isDivorce = cmd === 'divorce' || cmd === 'divorcio';

    
    if (isMarry) {
      
      if (marriages[sender]) {
        const partner = marriages[sender];
        return await conn.reply(
          m.chat,
          `💙 Ya estás casado/a con @${partner.split('@')[0]}\nUsa *${usedPrefix}divorce* para divorciarte`,
          m,
          { mentions: [partner] }
        );
      }

      
      if (!m.mentionedJid?.length) {
        return await conn.reply(
          m.chat,
          `💙 Debes mencionar a alguien\nEjemplo: *${usedPrefix}marry @usuario*`,
          m
        );
      }

      const mentioned = m.mentionedJid[0];

      
      if (mentioned === sender) {
        return await m.reply('💙 ¡No puedes casarte contigo mismo!');
      }
      if (mentioned === conn.user.jid) {
        return await m.reply('💙 ¡No puedo casarme contigo, solo soy un bot!');
      }
      if (marriages[mentioned]) {
        return await conn.reply(
          m.chat,
          `💙 @${mentioned.split('@')[0]} ya está casado/a con @${marriages[mentioned].split('@')[0]}`,
          m,
          { mentions: [mentioned, marriages[mentioned]] }
        );
      }

      
      if (proposals[mentioned] === sender) {
        
        delete proposals[mentioned];
        
        
        marriages[sender] = mentioned;
        marriages[mentioned] = sender;
        saveMarriages(marriages);
        
        
        return await conn.reply(
          m.chat,
          `🎉 ¡Felicidades! @${sender.split('@')[0]} 💍 @${mentioned.split('@')[0]}\n` +
          `📅 ${new Date().toLocaleDateString()}`,
          m,
          { mentions: [sender, mentioned] }
        );
      } else {
        
        proposals[sender] = mentioned;
        
        return await conn.reply(
          m.chat,
          `💌 @${sender.split('@')[0]} le propone matrimonio a @${mentioned.split('@')[0]}\n` +
          `Para aceptar escribe: *${usedPrefix}marry @${sender.split('@')[0]}*`,
          m,
          { mentions: [sender, mentioned] }
        );
      }
    }

    
    if (isDivorce) {
      if (!marriages[sender]) {
        return await m.reply('💙 No estás casado/a con nadie.');
      }

      const partner = marriages[sender];
      
      
      delete marriages[sender];
      delete marriages[partner];
      saveMarriages(marriages);
      
      return await conn.reply(
        m.chat,
        `💔 @${sender.split('@')[0]} y @${partner.split('@')[0]} se han divorciado\n` +
        `📅 ${new Date().toLocaleDateString()}`,
        m,
        { mentions: [sender, partner] }
      );
    }

  } catch (error) {
    console.error('Error en comando matrimonio:', error);
    await m.reply('💙 Ocurrió un error, por favor intenta nuevamente.');
  }
};

handler.help = ['marry @usuario', 'divorce'];
handler.tags = ['social'];
handler.command = ['marry', 'casarse', 'divorce', 'divorcio'];
handler.group = true;
handler.register = true;

export default handler;
