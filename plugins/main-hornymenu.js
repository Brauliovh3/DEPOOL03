import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, isPrems }) => {

  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply('💙 *¡Estos comandos están desactivados en este grupo!*\nUsa *' + usedPrefix + 'enable nsfw* para activarlos.');
  }

  try {
  
    const imagenadult = 'https://images.steamusercontent.com/ugc/1928123044154294449/70F811A7474838BAAF511189C48760078E022D92/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
    const pp = await (await fetch(imagenadult)).buffer();

  
    const user = global.db.data.users[m.sender];
    const { level, exp, role } = user;

    
    const str = `*╭━━━━•『  MENU +🔞 』•━━━━╮*
*│╭─────━───────━────*
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}pack
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}pack2
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}pack3
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}videoxxx
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}videolesbixxx
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}tetas
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}booty
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}ecchi
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}furro
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}imagenlesbians
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}panties
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}pene
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}porno
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}randomxxx
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}pechos
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}yaoi
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}yaoi2
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}yuri
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}yuri2
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}trapito
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}hentai
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwloli
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfworgy
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwfoot
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwass
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwbdsm
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwcum
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwero
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwfemdom
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}nsfwglass
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}hentaipdf *<texto>*
││ ◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸🔞 ${usedPrefix}hentaisearch *<texto>*
*│╰人人人人人人人人人人人人╯*
*╰─ - 🌱⢄⢁💙*⢄⢁🔞⡠*💙⡈⡠🌱 - ─╯*`.trim();

   
    await conn.sendMessage(
      m.chat,
      {
        image: pp,
        caption: str,
        mentions: [m.sender],
        contextInfo: {
          externalAdReply: {
            title: '🔞 Menú NSFW 🔞',
            body: `Nivel: ${level} | Rol: ${role}`,
            thumbnail: pp,
            mediaType: 1,
            mediaUrl: '',
            sourceUrl: ''
          }
        }
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error en el menú NSFW:', error);
    m.reply('💙 *¡Ocurrió un error!* Intenta nuevamente.');
  }
};


handler.help = ['hornymenu'];
handler.tags = ['nsfw'];
handler.command = ['menuhorny', 'hornymenu'];
handler.group = true;
handler.register = true;
handler.exp = 50;

export default handler;
