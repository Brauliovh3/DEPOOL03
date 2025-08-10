import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, command }) => {

  const contenido = {
    poemas: [
      "Rosas rojas, versos oscuros,\nla vida es corta, el destino es duro.\nBailamos sobre tumbas con zapatos de seda,\nsonriendo a la muerte que nunca se queda.",
      "El vino tinto mancha el mantel blanco,\ncomo tus pecados manchan este canto.\nBrindemos juntos por lo prohibido,\nque en este salón todo está permitido.",
      "Eres como el café de las mañanas frías:\namargo, intenso y lleno de energía.\nMe envuelves en tu aroma letal,\nveneno dulce que sabe a verdad."
    ],
    basados: [
      "La sociedad me pide ser 'correcto',\nprefiero ser sincero y directo.\nLa verdad no es bonita ni edulcorada,\nes cruda, es real, es una daga afilada.",
      "Dicen que soy polémico y sin filtro,\nprefiero eso a ser un títere tranquilo.\nMientras ellos aplauden lo establecido,\nyo rompo espejos con lo prohibido.",
      "No soy para todos, lo sé de antemano,\nmi humor es negro, mi estilo es villano.\nSi buscas algo light y convencional,\ncierra este libro que no es para ti."
    ],
    chistesNegros: [
      "¿Qué le dijo el cementerio al barrio nuevo?\n'La vecindad está que muere'",
      "¿Cómo se llama el concurso para niños con cáncer?\n'Quien pierde gana'",
      "¿Qué hace un niño con un martillo en un cementerio?\nJuega a los muertos vivientes"
    ]
  };

 
  let categoria;
  switch(command.toLowerCase()) {
    case 'poema':
    case 'versos':
      categoria = 'poemas';
      break;
    case 'basado':
      categoria = 'basados';
      break;
    case 'chistenegro':
    case 'humornegro':
      categoria = 'chistesNegros';
      break;
    default:
      categoria = Object.keys(contenido)[Math.floor(Math.random() * Object.keys(contenido).length)];
  }


  const item = contenido[categoria][Math.floor(Math.random() * contenido[categoria].length)];

 
  let header, body;
  switch(categoria) {
    case 'poemas':
      header = '✍️ *POEMA FINO* ✍️';
      body = `_${item}_\n\n📜 Un verso para almas refinadas`;
      break;
    case 'basados':
      header = '⚡ *VERDAD BASADA* ⚡';
      body = `_${item}_\n\n💀 Para mentes despiertas`;
      break;
    case 'chistesNegros':
      header = '🖤 *CHISTE OSCURO* 🖤';
      body = `_${item}_\n\n⚠️ Humor negro | No apto para todos`;
      break;
  }


  await conn.sendMessage(m.chat, {
    text: `${header}\n\n${body}\n\n*El arte no pide perdón*`,
    contextInfo: {
      externalAdReply: {
        title: 'Colección de Medianoche',
        body: 'Poesía, verdad y humor oscuro',
        thumbnailUrl: 'https://backiee.com/static/wallpapers/560x315/331664.jpg',
        sourceUrl: 'https://github.com/Brauliovh3',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = [
  ['poema', 'Envía un poema fino y oscuro'],
  ['basado', 'Frases políticamente incorrectas'],
  ['chistenegro', 'Humor negro para mentes fuertes']
];
handler.tags = ['fun'];
handler.command = /^(poema|versos|basado|chistenegro|humornegro)$/i;
handler.register = true;
handler.limit = true;

export default handler;
