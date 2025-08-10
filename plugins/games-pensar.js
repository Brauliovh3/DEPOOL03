import { delay } from '@whiskeysockets/baileys';

const pensandoUsuarios = {};

const handler = async (m, { conn }) => {
    const senderId = m.sender;

    if (pensandoUsuarios[senderId]) {
        return conn.reply(m.chat, '💙 Ya estás en una sesión de pensamiento. Elige un número o escribe "cancelar".', m);
    }

    pensandoUsuarios[senderId] = true;

    // Enviar mensaje con botones del 1 al 10
    await conn.sendMessage(m.chat, {
        text: `🧠 *Piensa en un número* 🧠\n\n@${senderId.split('@')[0]}, elige un número del *1 al 10* o escribe otro número manualmente (1-100).`,
        mentions: [senderId],
        footer: 'Tienes 30 segundos.',
        buttons: [
            { buttonId: 'num_1', buttonText: { displayText: '1' }, type: 1 },
            { buttonId: 'num_2', buttonText: { displayText: '2' }, type: 1 },
            { buttonId: 'num_3', buttonText: { displayText: '3' }, type: 1 },
            { buttonId: 'num_4', buttonText: { displayText: '4' }, type: 1 },
            { buttonId: 'num_5', buttonText: { displayText: '5' }, type: 1 },
            { buttonId: 'num_6', buttonText: { displayText: '6' }, type: 1 },
            { buttonId: 'num_7', buttonText: { displayText: '7' }, type: 1 },
            { buttonId: 'num_8', buttonText: { displayText: '8' }, type: 1 },
            { buttonId: 'num_9', buttonText: { displayText: '9' }, type: 1 },
            { buttonId: 'num_10', buttonText: { displayText: '10' }, type: 1 },
        ],
        headerType: 1,
    }, { quoted: m });

    // Temporizador de 30 segundos
    setTimeout(() => {
        if (pensandoUsuarios[senderId]) {
            delete pensandoUsuarios[senderId];
            conn.sendMessage(m.chat, { text: '⌛ Tiempo agotado. Usa *!pensar* de nuevo.' });
        }
    }, 30000);
};

handler.command = ['pensar'];
export default handler;

// Manejador de botones y mensajes
handler.before = async (m, { conn }) => {
    const senderId = m.sender;
    const text = m.text?.trim();
    const buttonId = m.message?.buttonsResponseMessage?.selectedButtonId;

    // Si no está en modo "pensar", ignorar
    if (!pensandoUsuarios[senderId]) return;

    // Caso 1: Eligió un botón (1-10)
    if (buttonId?.startsWith('num_')) {
        const numero = buttonId.split('_')[1];

        if (numero === 'manual') {
            await conn.reply(m.chat, '✏️ Por favor, escribe un número del *1 al 100*:', m);
            return;
        }

        delete pensandoUsuarios[senderId];
        await mostrarAnimacion(conn, m, numero); // Función para la animación (ver abajo)
    }

    // Caso 2: Escribió un número manualmente (1-100)
    else if (/^\d+$/.test(text) && parseInt(text) >= 1 && parseInt(text) <= 100) {
        delete pensandoUsuarios[senderId];
        await mostrarAnimacion(conn, m, text);
    }

    // Caso 3: Cancelar
    else if (text?.toLowerCase() === 'cancelar') {
        delete pensandoUsuarios[senderId];
        await conn.reply(m.chat, '❌ Sesión cancelada. Usa *!pensar* para empezar de nuevo.', m);
    }
};

// Función para la animación de "adivinanza"
async function mostrarAnimacion(conn, m, numero) {
    const loadingMessages = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%\n- Analizando tu pensamiento...",
        "《 ████▒▒▒▒▒▒▒▒》30%\n- Leyendo tu mente...",
        "《 ███████▒▒▒▒▒》50%\n- Interpretando señales cerebrales...",
        "《 ██████████▒▒》80%\n- Conectando con el universo...",
        "《 ████████████》100%\n- ¡Número descubierto!"
    ];

    let { key } = await conn.sendMessage(m.chat, { text: "🔮 Conectando con tu mente..." }, { quoted: m });
    
    // Audio opcional
    await conn.sendMessage(m.chat, { 
        audio: { url: "https://qu.ax/nLbte.mp3" }, 
        mimetype: "audio/mp4", 
        ptt: true 
    });

    for (let msg of loadingMessages) {
        await delay(2000);
        await conn.sendMessage(m.chat, { text: msg, edit: key });
    }

    await conn.sendMessage(m.chat, { 
        text: `✨ *¡Tu número es...* *${numero}*! 🎉` 
    });
}
