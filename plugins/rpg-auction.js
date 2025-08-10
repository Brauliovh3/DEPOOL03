import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const auctionsFilePath = path.join(dbPath, 'auctions.json');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

// ⚡ Sistema de subastas para waifus épicas y legendarias
function loadDatabase() {
    if (!fs.existsSync(databaseFilePath)) {
        return { users: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(databaseFilePath, 'utf-8'));
    } catch (error) {
        console.error('❌ Error al cargar database:', error);
        return { users: {} };
    }
}

function loadAuctions() {
    if (!fs.existsSync(auctionsFilePath)) {
        return { activeAuctions: {}, auctionHistory: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(auctionsFilePath, 'utf-8'));
    } catch (error) {
        console.error('❌ Error al cargar subastas:', error);
        return { activeAuctions: {}, auctionHistory: [] };
    }
}

function saveDatabase(data) {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
        fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error al guardar database:', error);
    }
}

function saveAuctions(data) {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
        fs.writeFileSync(auctionsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error al guardar subastas:', error);
    }
}

// Verificar si una waifu puede ser subastada
function canBeAuctioned(rarity) {
    return ['épica', 'ultra rara', 'legendaria'].includes(rarity.toLowerCase());
}

// Calcular precio base según rareza
function getBasePrice(rarity) {
    const basePrices = {
        'épica': 200,
        'ultra rara': 500,
        'legendaria': 1000
    };
    return basePrices[rarity.toLowerCase()] || 100;
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const userId = m.sender;
    const db = loadDatabase();
    const auctions = loadAuctions();

    // Inicializar usuario si no existe
    if (!db.users[userId]) {
        db.users[userId] = { characters: [], money: 0, auctions: 0 };
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
        case 'crear':
        case 'create':
            await createAuction(m, conn, args, userId, db, auctions, usedPrefix);
            break;
            
        case 'ver':
        case 'list':
            await listAuctions(m, conn, auctions);
            break;
            
        case 'pujar':
        case 'bid':
            await placeBid(m, conn, args, userId, auctions);
            break;
            
        case 'mis':
        case 'mine':
            await viewMyAuctions(m, conn, userId, auctions);
            break;
            
        case 'finalizar':
        case 'end':
            await endAuction(m, conn, args, userId, db, auctions);
            break;
            
        default:
            await showAuctionHelp(m, conn, usedPrefix);
    }
};

async function createAuction(m, conn, args, userId, db, auctions, usedPrefix) {
    // .auction crear [nombre_waifu] [precio_inicial] [duracion_horas]
    if (args.length < 4) {
        return m.reply(`❌ *Uso correcto:*\n${usedPrefix}auction crear [nombre] [precio_inicial] [duración_horas]\n\n*Ejemplo:* ${usedPrefix}auction crear "Hatsune Miku" 300 24`);
    }

    const waifuName = args.slice(1, -2).join(' ').replace(/['"]/g, '');
    const startPrice = parseInt(args[args.length - 2]);
    const durationHours = parseInt(args[args.length - 1]);

    if (isNaN(startPrice) || startPrice <= 0) {
        return m.reply('❌ El precio inicial debe ser un número positivo de cebollines 🌱');
    }

    if (isNaN(durationHours) || durationHours < 1 || durationHours > 72) {
        return m.reply('❌ La duración debe ser entre 1 y 72 horas.');
    }

    const userCollection = db.users[userId].characters || [];
    const waifuIndex = userCollection.findIndex(w => 
        w.name.toLowerCase().includes(waifuName.toLowerCase())
    );

    if (waifuIndex === -1) {
        return m.reply(`❌ No tienes "${waifuName}" en tu colección.\n\n💡 Usa \`.coleccion\` para ver tus waifus disponibles.`);
    }

    const waifu = userCollection[waifuIndex];

    // Solo waifus épicas+ pueden ser subastadas
    if (!canBeAuctioned(waifu.rarity)) {
        return m.reply(`❌ Solo puedes subastar waifus de rareza *Épica*, *Ultra Rara* o *Legendaria*.\n\n✨ *"${waifu.name}"* es de rareza *${waifu.rarity}*.\n\n💡 Usa \`.trade\` para vender waifus comunes y raras.`);
    }

    const basePrice = getBasePrice(waifu.rarity);
    if (startPrice < basePrice) {
        return m.reply(`❌ El precio inicial debe ser al menos ${basePrice} 🌱 para waifus de rareza *${waifu.rarity}*.`);
    }

    const auctionId = Date.now().toString();
    const endTime = new Date(Date.now() + (durationHours * 60 * 60 * 1000));

    // Crear la subasta
    auctions.activeAuctions[auctionId] = {
        id: auctionId,
        seller: userId,
        sellerName: m.name || 'Usuario',
        waifu: waifu,
        startPrice: startPrice,
        currentBid: startPrice,
        currentBidder: null,
        currentBidderName: null,
        bids: [],
        endTime: endTime.toISOString(),
        created: new Date().toISOString(),
        status: 'active'
    };

    // Remover waifu de la colección del vendedor (escrow)
    userCollection.splice(waifuIndex, 1);
    db.users[userId].characters = userCollection;

    saveDatabase(db);
    saveAuctions(auctions);

    const rarityEmoji = {
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *SUBASTA CREADA* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Waifu:* ${waifu.name}
${rarityEmoji[waifu.rarity.toLowerCase()] || '🟣'} *Rareza:* ${waifu.rarity}
💰 *Precio inicial:* ${startPrice} 🌱
⏰ *Duración:* ${durationHours} horas

🆔 *ID de Subasta:* \`${auctionId}\`
⏰ *Finaliza:* ${endTime.toLocaleString()}

📢 *¡Tu waifu está ahora en subasta!*
💡 Otros usuarios pueden pujar con: \`.auction pujar ${auctionId} [cantidad]\`

⚠️ La subasta se cierra automáticamente cuando termine el tiempo.`);
}

async function listAuctions(m, conn, auctions) {
    const activeAuctions = Object.values(auctions.activeAuctions)
        .filter(auction => {
            // Verificar si la subasta ha expirado
            const now = new Date();
            const endTime = new Date(auction.endTime);
            return auction.status === 'active' && now < endTime;
        })
        .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

    if (activeAuctions.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *CASA DE SUBASTAS* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No hay subastas activas en este momento.

💡 *¿Tienes waifus épicas+?*
Usa: \`.auction crear [nombre] [precio] [horas]\`

✨ Solo waifus *Épicas*, *Ultra Raras* y *Legendarias* pueden ser subastadas.`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *CASA DE SUBASTAS* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    const rarityEmoji = {
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    activeAuctions.slice(0, 5).forEach((auction, index) => {
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeLeft = Math.max(0, endTime - now);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        message += `┌─────────────────────┐
│ ${index + 1}. ${auction.waifu.name}
│ ${rarityEmoji[auction.waifu.rarity.toLowerCase()] || '🟣'} ${auction.waifu.rarity}
│ 💰 Puja actual: ${auction.currentBid} 🌱
│ ${auction.currentBidder ? `🏆 Líder: ${auction.currentBidderName}` : '🎯 Sin pujas'}
│ ⏰ ${hoursLeft}h ${minutesLeft}m restantes
│ 👤 Vendedor: ${auction.sellerName}
│ 🆔 ${auction.id}
└─────────────────────┘

`;
    });

    message += `📝 *Comandos disponibles:*
• \`.auction pujar [ID] [cantidad]\` - Hacer puja
• \`.auction crear [nombre] [precio] [horas]\` - Crear subasta

💡 Mostrando ${Math.min(activeAuctions.length, 5)} de ${activeAuctions.length} subastas activas`;

    m.reply(message);
}

async function placeBid(m, conn, args, userId, auctions) {
    if (args.length < 3) {
        return m.reply('❌ Especifica el ID de la subasta y la cantidad a pujar.\n\n*Ejemplo:* `.auction pujar 1234567890 500`');
    }

    const auctionId = args[1];
    const bidAmount = parseInt(args[2]);
    const auction = auctions.activeAuctions[auctionId];

    if (!auction || auction.status !== 'active') {
        return m.reply('❌ Subasta no encontrada o ya finalizada.');
    }

    // Verificar si la subasta ha expirado
    const now = new Date();
    const endTime = new Date(auction.endTime);
    if (now >= endTime) {
        return m.reply('❌ Esta subasta ya ha finalizado.');
    }

    if (auction.seller === userId) {
        return m.reply('❌ No puedes pujar en tu propia subasta.');
    }

    if (isNaN(bidAmount) || bidAmount <= auction.currentBid) {
        return m.reply(`❌ Tu puja debe ser mayor a la actual: ${auction.currentBid} 🌱`);
    }

    // Verificar que el usuario tiene suficientes cebollines
    const userMoney = global.db.data.users[userId]?.cebollines || 0;
    if (userMoney < bidAmount) {
        return m.reply(`❌ No tienes suficientes cebollines.\n\n💰 *Necesitas:* ${bidAmount} 🌱\n💳 *Tienes:* ${userMoney} 🌱\n💸 *Faltan:* ${bidAmount - userMoney} 🌱`);
    }

    // Devolver cebollines al pujador anterior si existe
    if (auction.currentBidder) {
        global.db.data.users[auction.currentBidder].cebollines += auction.currentBid;
    }

    // Actualizar la subasta
    auction.currentBid = bidAmount;
    auction.currentBidder = userId;
    auction.currentBidderName = m.name || 'Usuario';
    auction.bids.push({
        bidder: userId,
        bidderName: m.name || 'Usuario',
        amount: bidAmount,
        timestamp: new Date().toISOString()
    });

    // Reservar cebollines del nuevo pujador
    global.db.data.users[userId].cebollines -= bidAmount;

    saveAuctions(auctions);

    const timeLeft = Math.max(0, endTime - now);
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *PUJA REALIZADA* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Waifu:* ${auction.waifu.name}
💰 *Tu puja:* ${bidAmount} 🌱
🎯 *Eres el líder actual!*

⏰ *Tiempo restante:* ${hoursLeft}h ${minutesLeft}m
🆔 *ID:* ${auctionId}

💡 Si alguien más puja, tus cebollines se devolverán automáticamente.`);

    // Notificar al vendedor y pujador anterior
    try {
        await conn.sendMessage(auction.seller, {
            text: `🔔 *Nueva puja en tu subasta!*\n\n✨ *Waifu:* ${auction.waifu.name}\n💰 *Nueva puja:* ${bidAmount} 🌱\n👤 *Pujador:* ${m.name || 'Usuario'}\n\n⏰ ${hoursLeft}h ${minutesLeft}m restantes`
        });
    } catch (e) {
        console.log('No se pudo notificar al vendedor');
    }
}

async function viewMyAuctions(m, conn, userId, auctions) {
    const userAuctions = Object.values(auctions.activeAuctions)
        .filter(auction => auction.seller === userId && auction.status === 'active');

    if (userAuctions.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📝 *MIS SUBASTAS* 📝
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No tienes subastas activas.

💡 Crea una subasta con: \`.auction crear [nombre] [precio] [horas]\`
✨ Solo waifus *Épicas*, *Ultra Raras* y *Legendarias*`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📝 *MIS SUBASTAS ACTIVAS* 📝
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    const rarityEmoji = {
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    userAuctions.forEach((auction, index) => {
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeLeft = Math.max(0, endTime - now);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        message += `┌─────────────────────┐
│ ${index + 1}. ${auction.waifu.name}
│ ${rarityEmoji[auction.waifu.rarity.toLowerCase()] || '🟣'} ${auction.waifu.rarity}
│ 💰 Puja actual: ${auction.currentBid} 🌱
│ ${auction.currentBidder ? `🏆 Líder: ${auction.currentBidderName}` : '🎯 Sin pujas'}
│ ⏰ ${hoursLeft}h ${minutesLeft}m restantes
│ 🆔 ${auction.id}
└─────────────────────┘

`;
    });

    message += `💡 Las subastas finalizan automáticamente.`;

    m.reply(message);
}

async function endAuction(m, conn, args, userId, db, auctions) {
    // Esta función se puede usar para finalizar subastas manualmente (solo por admins)
    // o automáticamente cuando expire el tiempo
    if (!args[1]) {
        return m.reply('❌ Especifica el ID de la subasta a finalizar.');
    }

    const auctionId = args[1];
    const auction = auctions.activeAuctions[auctionId];

    if (!auction || auction.status !== 'active') {
        return m.reply('❌ Subasta no encontrada o ya finalizada.');
    }

    // Solo el vendedor o un admin puede finalizar manualmente
    if (auction.seller !== userId) {
        return m.reply('❌ Solo el vendedor puede finalizar su subasta.');
    }

    await processAuctionEnd(auction, db, auctions, conn);
}

async function processAuctionEnd(auction, db, auctions, conn) {
    auction.status = 'completed';
    auction.completedAt = new Date().toISOString();

    if (auction.currentBidder) {
        // Hay un ganador
        if (!db.users[auction.currentBidder]) {
            db.users[auction.currentBidder] = { characters: [], money: 0, auctions: 0 };
        }
        
        // El ganador obtiene la waifu
        db.users[auction.currentBidder].characters.push(auction.waifu);
        
        // El vendedor recibe las cebollines (ya están reservadas)
        global.db.data.users[auction.seller].cebollines = 
            (global.db.data.users[auction.seller].cebollines || 0) + auction.currentBid;

        // Notificar al ganador
        try {
            await conn.sendMessage(auction.currentBidder, {
                text: `🎉 *¡FELICIDADES! HAS GANADO LA SUBASTA!*\n\n✨ *Waifu obtenida:* ${auction.waifu.name}\n💰 *Precio final:* ${auction.currentBid} 🌱\n🆔 *ID:* ${auction.id}`
            });
        } catch (e) {
            console.log('No se pudo notificar al ganador');
        }

        // Notificar al vendedor
        try {
            await conn.sendMessage(auction.seller, {
                text: `💰 *¡SUBASTA FINALIZADA!*\n\n✨ *Waifu vendida:* ${auction.waifu.name}\n💰 *Precio final:* ${auction.currentBid} 🌱\n👤 *Ganador:* ${auction.currentBidderName}\n🆔 *ID:* ${auction.id}`
            });
        } catch (e) {
            console.log('No se pudo notificar al vendedor');
        }
    } else {
        // No hay pujas, devolver waifu al vendedor
        if (!db.users[auction.seller]) {
            db.users[auction.seller] = { characters: [], money: 0, auctions: 0 };
        }
        db.users[auction.seller].characters.push(auction.waifu);

        try {
            await conn.sendMessage(auction.seller, {
                text: `📝 *Subasta finalizada sin pujas*\n\n✨ *${auction.waifu.name}* ha sido devuelta a tu colección.\n🆔 *ID:* ${auction.id}`
            });
        } catch (e) {
            console.log('No se pudo notificar al vendedor');
        }
    }

    // Guardar en historial
    auctions.auctionHistory.push({...auction});

    saveDatabase(db);
    saveAuctions(auctions);
}

async function showAuctionHelp(m, conn, usedPrefix) {
    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *SISTEMA DE SUBASTAS* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

📝 *Comandos disponibles:*

🔸 \`${usedPrefix}auction crear [nombre] [precio] [horas]\`
   Crear subasta (solo épicas+)

🔸 \`${usedPrefix}auction ver\`
   Ver subastas activas

🔸 \`${usedPrefix}auction pujar [ID] [cantidad]\`
   Hacer una puja

🔸 \`${usedPrefix}auction mis\`
   Ver tus subastas

💡 *Ejemplos:*
• \`${usedPrefix}auction crear "Hatsune Miku" 500 24\`
• \`${usedPrefix}auction pujar 1234567890 750\`

⚠️ *Importante:*
• Solo waifus *Épicas*, *Ultra Raras* y *Legendarias*
• Las subastas duran 1-72 horas
• Las cebollines se reservan automáticamente
• Si te superan, tus cebollines se devuelven`);
}

// Función para verificar y finalizar subastas expiradas
setInterval(async () => {
    try {
        const auctions = loadAuctions();
        const db = loadDatabase();
        const now = new Date();

        for (const auction of Object.values(auctions.activeAuctions)) {
            if (auction.status === 'active' && new Date(auction.endTime) <= now) {
                await processAuctionEnd(auction, db, auctions, global.conn);
            }
        }
    } catch (error) {
        console.error('Error verificando subastas:', error);
    }
}, 60000); // Verificar cada minuto

handler.help = ['auction'];
handler.tags = ['rpg', 'economy'];
handler.command = /^(auction|subasta)$/i;
handler.register = true;

export default handler;
