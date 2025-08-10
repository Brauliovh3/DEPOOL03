import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const marketFilePath = path.join(dbPath, 'market.json');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

// 🛒 Sistema de mercado para compra/venta directa
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

function loadMarket() {
    if (!fs.existsSync(marketFilePath)) {
        return { listings: {}, sales: [], featured: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(marketFilePath, 'utf-8'));
    } catch (error) {
        console.error('❌ Error al cargar mercado:', error);
        return { listings: {}, sales: [], featured: [] };
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

function saveMarket(data) {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
        fs.writeFileSync(marketFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error al guardar mercado:', error);
    }
}

// Calcular precio sugerido basado en rareza y mercado
function getSuggestedPrice(rarity, marketData) {
    const basePrices = {
        'común': { min: 20, max: 50 },
        'rara': { min: 50, max: 120 },
        'épica': { min: 120, max: 300 },
        'ultra rara': { min: 300, max: 800 },
        'legendaria': { min: 800, max: 2000 }
    };

    const rarityKey = rarity.toLowerCase();
    const base = basePrices[rarityKey] || basePrices['común'];
    
    // Ajustar precio basado en ventas recientes
    const recentSales = marketData.sales
        .filter(sale => sale.waifu.rarity.toLowerCase() === rarityKey)
        .slice(-10);
    
    if (recentSales.length > 0) {
        const avgPrice = recentSales.reduce((sum, sale) => sum + sale.price, 0) / recentSales.length;
        return {
            min: Math.max(base.min, Math.floor(avgPrice * 0.8)),
            max: Math.max(base.max, Math.floor(avgPrice * 1.2)),
            suggested: Math.floor(avgPrice)
        };
    }
    
    return {
        min: base.min,
        max: base.max,
        suggested: Math.floor((base.min + base.max) / 2)
    };
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const userId = m.sender;
    const db = loadDatabase();
    const market = loadMarket();

    // Inicializar usuario si no existe
    if (!db.users[userId]) {
        db.users[userId] = { characters: [], money: 0, sales: 0 };
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
        case 'vender':
        case 'sell':
            await sellToMarket(m, conn, args, userId, db, market, usedPrefix);
            break;
            
        case 'tienda':
        case 'shop':
        case 'ver':
            await viewMarket(m, conn, args, market);
            break;
            
        case 'comprar':
        case 'buy':
            await buyFromMarket(m, conn, args, userId, db, market);
            break;
            
        case 'mis':
        case 'mine':
            await viewMyListings(m, conn, userId, market);
            break;
            
        case 'quitar':
        case 'remove':
            await removeFromMarket(m, conn, args, userId, market, db);
            break;
            
        case 'precio':
        case 'price':
            await checkPrice(m, conn, args, market);
            break;
            
        case 'destacado':
        case 'featured':
            await viewFeatured(m, conn, market);
            break;
            
        default:
            await showMarketHelp(m, conn, usedPrefix);
    }
};

async function sellToMarket(m, conn, args, userId, db, market, usedPrefix) {
    // .market vender [nombre_waifu] [precio]
    if (args.length < 3) {
        return m.reply(`❌ *Uso correcto:*\n${usedPrefix}market vender [nombre] [precio]\n\n*Ejemplo:* ${usedPrefix}market vender "Hatsune Miku" 250\n\n💡 Usa \`.market precio [nombre]\` para ver precios sugeridos`);
    }

    const waifuName = args.slice(1, -1).join(' ').replace(/['"]/g, '');
    const price = parseInt(args[args.length - 1]);

    if (isNaN(price) || price <= 0) {
        return m.reply('❌ El precio debe ser un número positivo de cebollines 🌱');
    }

    const userCollection = db.users[userId].characters || [];
    const waifuIndex = userCollection.findIndex(w => 
        w.name.toLowerCase().includes(waifuName.toLowerCase())
    );

    if (waifuIndex === -1) {
        return m.reply(`❌ No tienes "${waifuName}" en tu colección.\n\n💡 Usa \`.coleccion\` para ver tus waifus disponibles.`);
    }

    const waifu = userCollection[waifuIndex];
    const priceInfo = getSuggestedPrice(waifu.rarity, market);

    // Verificar precio mínimo sugerido
    if (price < priceInfo.min) {
        return m.reply(`⚠️ *Precio muy bajo para una waifu ${waifu.rarity}*\n\n📊 *Precios recomendados:*\n💰 *Mínimo:* ${priceInfo.min} 🌱\n💡 *Sugerido:* ${priceInfo.suggested} 🌱\n💎 *Máximo:* ${priceInfo.max} 🌱\n\n❓ ¿Estás seguro? Reintenta con un precio mayor.`);
    }

    const listingId = Date.now().toString();

    // Crear la venta
    market.listings[listingId] = {
        id: listingId,
        seller: userId,
        sellerName: m.name || 'Usuario',
        waifu: waifu,
        price: price,
        listed: new Date().toISOString(),
        views: 0,
        status: 'active'
    };

    // Remover waifu de la colección del vendedor
    userCollection.splice(waifuIndex, 1);
    db.users[userId].characters = userCollection;

    saveDatabase(db);
    saveMarket(market);

    const rarityEmoji = {
        'común': '⚪',
        'rara': '🟢',
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🛒 *WAIFU EN VENTA* 🛒
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Waifu:* ${waifu.name}
${rarityEmoji[waifu.rarity.toLowerCase()] || '⚪'} *Rareza:* ${waifu.rarity}
💰 *Precio:* ${price} 🌱
🆔 *ID de Venta:* \`${listingId}\`

📊 *Análisis de mercado:*
${price === priceInfo.suggested ? '✅ Precio óptimo' : 
  price > priceInfo.suggested ? '📈 Precio alto (puede tardar en venderse)' : 
  '📉 Precio bajo (se venderá rápido)'}

🛒 Los usuarios pueden comprarla con: \`.market comprar ${listingId}\``);

    // Destacar automáticamente waifus legendarias
    if (waifu.rarity.toLowerCase() === 'legendaria' && market.featured.length < 5) {
        market.featured.push(listingId);
        saveMarket(market);
        m.reply('⭐ *¡Tu waifu legendaria ha sido destacada automáticamente!*');
    }
}

async function viewMarket(m, conn, args, market) {
    const page = parseInt(args[1]) || 1;
    const filterRarity = args[2]?.toLowerCase();
    const itemsPerPage = 6;

    let activeListings = Object.values(market.listings)
        .filter(listing => listing.status === 'active');

    // Filtrar por rareza si se especifica
    if (filterRarity && ['común', 'rara', 'épica', 'ultra rara', 'legendaria'].includes(filterRarity)) {
        activeListings = activeListings.filter(listing => 
            listing.waifu.rarity.toLowerCase() === filterRarity
        );
    }

    // Ordenar por rareza y precio
    const rarityOrder = { 'legendaria': 5, 'ultra rara': 4, 'épica': 3, 'rara': 2, 'común': 1 };
    activeListings.sort((a, b) => {
        const rarityDiff = rarityOrder[b.waifu.rarity.toLowerCase()] - rarityOrder[a.waifu.rarity.toLowerCase()];
        return rarityDiff !== 0 ? rarityDiff : a.price - b.price;
    });

    const totalPages = Math.ceil(activeListings.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const pageListings = activeListings.slice(startIndex, startIndex + itemsPerPage);

    if (pageListings.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🛒 *MERCADO DE WAIFUS* 🛒
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No hay waifus en venta${filterRarity ? ` de rareza ${filterRarity}` : ''}.

💡 *Comandos útiles:*
• \`.market vender [nombre] [precio]\` - Vender waifu
• \`.market destacado\` - Ver waifus destacadas
• \`.market precio [nombre]\` - Ver precios sugeridos`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🛒 *MERCADO DE WAIFUS* 🛒
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    const rarityEmoji = {
        'común': '⚪',
        'rara': '🟢',
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    pageListings.forEach((listing, index) => {
        const globalIndex = startIndex + index + 1;
        message += `┌─────────────────────┐
│ ${globalIndex}. ${listing.waifu.name}
│ ${rarityEmoji[listing.waifu.rarity.toLowerCase()] || '⚪'} ${listing.waifu.rarity}
│ 💰 ${listing.price} 🌱
│ 👤 ${listing.sellerName}
│ 👁️ ${listing.views} vistas
│ 🆔 ${listing.id}
└─────────────────────┘

`;
    });

    message += `📄 *Página ${page} de ${totalPages}* | ${activeListings.length} waifus disponibles

🛒 *Comprar:* \`.market comprar [ID]\`
📄 *Siguiente:* \`.market tienda ${page + 1}\`
⭐ *Destacadas:* \`.market destacado\`

🎯 *Filtros disponibles:* común, rara, épica, ultra rara, legendaria
*Ejemplo:* \`.market tienda 1 legendaria\``;

    m.reply(message);
}

async function buyFromMarket(m, conn, args, userId, db, market) {
    if (!args[1]) {
        return m.reply('❌ Especifica el ID de la waifu que quieres comprar.\n\n*Ejemplo:* `.market comprar 1234567890`');
    }

    const listingId = args[1];
    const listing = market.listings[listingId];

    if (!listing || listing.status !== 'active') {
        return m.reply('❌ Esa waifu ya no está disponible o el ID es incorrecto.');
    }

    if (listing.seller === userId) {
        return m.reply('❌ No puedes comprar tu propia waifu. Usa `.market quitar [ID]` para retirarla.');
    }

    // Verificar que el comprador tiene suficientes cebollines
    const buyerMoney = global.db.data.users[userId]?.cebollines || 0;
    if (buyerMoney < listing.price) {
        return m.reply(`❌ No tienes suficientes cebollines.\n\n💰 *Precio:* ${listing.price} 🌱\n💳 *Tienes:* ${buyerMoney} 🌱\n💸 *Faltan:* ${listing.price - buyerMoney} 🌱`);
    }

    // Realizar la transacción
    global.db.data.users[userId].cebollines -= listing.price;
    global.db.data.users[listing.seller].cebollines = 
        (global.db.data.users[listing.seller].cebollines || 0) + listing.price;

    // Transferir la waifu
    if (!db.users[userId]) {
        db.users[userId] = { characters: [], money: 0, sales: 0 };
    }
    db.users[userId].characters.push(listing.waifu);

    // Marcar como vendida
    listing.status = 'sold';
    listing.soldTo = userId;
    listing.soldToName = m.name || 'Usuario';
    listing.soldAt = new Date().toISOString();

    // Agregar a historial de ventas
    market.sales.push({
        ...listing,
        buyer: userId,
        buyerName: m.name || 'Usuario'
    });

    // Incrementar estadísticas
    db.users[listing.seller].sales = (db.users[listing.seller].sales || 0) + 1;

    saveDatabase(db);
    saveMarket(market);

    const rarityEmoji = {
        'común': '⚪',
        'rara': '🟢',
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎉 *COMPRA EXITOSA* 🎉
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Waifu obtenida:* ${listing.waifu.name}
${rarityEmoji[listing.waifu.rarity.toLowerCase()] || '⚪'} *Rareza:* ${listing.waifu.rarity}
💰 *Precio pagado:* ${listing.price} 🌱
👤 *Vendedor:* ${listing.sellerName}

💳 *Cebollines restantes:* ${global.db.data.users[userId].cebollines} 🌱

🎊 *¡${listing.waifu.name} se ha unido a tu colección!*`);

    // Notificar al vendedor
    try {
        await conn.sendMessage(listing.seller, {
            text: `💰 *¡VENTA REALIZADA!*\n\n✨ *Waifu vendida:* ${listing.waifu.name}\n💰 *Precio:* ${listing.price} 🌱\n👤 *Comprador:* ${m.name || 'Usuario'}\n\n💳 Cebollines actuales: ${global.db.data.users[listing.seller].cebollines} 🌱`
        });
    } catch (e) {
        console.log('No se pudo notificar al vendedor');
    }
}

async function viewMyListings(m, conn, userId, market) {
    const userListings = Object.values(market.listings)
        .filter(listing => listing.seller === userId && listing.status === 'active')
        .sort((a, b) => new Date(b.listed) - new Date(a.listed));

    if (userListings.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📝 *MIS VENTAS* 📝
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No tienes waifus en venta.

💡 Vende una con: \`.market vender [nombre] [precio]\`
📊 Precios sugeridos: \`.market precio [nombre]\``);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📝 *MIS WAIFUS EN VENTA* 📝
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    const rarityEmoji = {
        'común': '⚪',
        'rara': '🟢',
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    userListings.forEach((listing, index) => {
        const daysListed = Math.floor((new Date() - new Date(listing.listed)) / (1000 * 60 * 60 * 24));
        
        message += `┌─────────────────────┐
│ ${index + 1}. ${listing.waifu.name}
│ ${rarityEmoji[listing.waifu.rarity.toLowerCase()] || '⚪'} ${listing.waifu.rarity}
│ 💰 ${listing.price} 🌱
│ 👁️ ${listing.views} vistas
│ 📅 ${daysListed} días en venta
│ 🆔 ${listing.id}
└─────────────────────┘

`;
    });

    const totalEarnings = userListings.reduce((sum, listing) => sum + listing.price, 0);
    message += `💰 *Valor total:* ${totalEarnings} 🌱
🗑️ *Retirar:* \`.market quitar [ID]\``;

    m.reply(message);
}

async function removeFromMarket(m, conn, args, userId, market, db) {
    if (!args[1]) {
        return m.reply('❌ Especifica el ID de la waifu que quieres retirar.\n\n*Ejemplo:* `.market quitar 1234567890`');
    }

    const listingId = args[1];
    const listing = market.listings[listingId];

    if (!listing || listing.status !== 'active') {
        return m.reply('❌ Esa venta no existe o ya fue completada.');
    }

    if (listing.seller !== userId) {
        return m.reply('❌ Solo puedes retirar tus propias ventas.');
    }

    // Devolver waifu al vendedor
    if (!db.users[userId]) {
        db.users[userId] = { characters: [], money: 0, sales: 0 };
    }
    db.users[userId].characters.push(listing.waifu);

    // Marcar como retirada
    listing.status = 'removed';
    listing.removedAt = new Date().toISOString();

    saveDatabase(db);
    saveMarket(market);

    m.reply(`✅ *Waifu retirada del mercado*\n\n✨ *${listing.waifu.name}* ha sido devuelta a tu colección.\n💰 Era vendida por: ${listing.price} 🌱`);
}

async function checkPrice(m, conn, args, market) {
    if (!args[1]) {
        return m.reply('❌ Especifica el nombre de la waifu para ver precios sugeridos.\n\n*Ejemplo:* `.market precio "Hatsune Miku"`');
    }

    const waifuName = args.slice(1).join(' ').replace(/['"]/g, '');
    
    // Buscar waifus similares en ventas recientes
    const recentSales = market.sales
        .filter(sale => sale.waifu.name.toLowerCase().includes(waifuName.toLowerCase()))
        .slice(-5);

    if (recentSales.length === 0) {
        return m.reply(`❌ No se encontraron ventas recientes de "${waifuName}".\n\n💡 Precios base por rareza:\n⚪ *Común:* 20-50 🌱\n🟢 *Rara:* 50-120 🌱\n🟣 *Épica:* 120-300 🌱\n🟡 *Ultra Rara:* 300-800 🌱\n🔴 *Legendaria:* 800-2000 🌱`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📊 *ANÁLISIS DE PRECIOS* 📊
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔍 *Búsqueda:* ${waifuName}
📈 *Ventas recientes encontradas:* ${recentSales.length}

`;

    recentSales.forEach((sale, index) => {
        const daysAgo = Math.floor((new Date() - new Date(sale.soldAt)) / (1000 * 60 * 60 * 24));
        message += `${index + 1}. ${sale.waifu.name} (${sale.waifu.rarity})\n   💰 ${sale.price} 🌱 - hace ${daysAgo} días\n\n`;
    });

    const prices = recentSales.map(sale => sale.price);
    const avgPrice = Math.floor(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    message += `📊 *Estadísticas:*
💰 *Precio promedio:* ${avgPrice} 🌱
📉 *Precio mínimo:* ${minPrice} 🌱
📈 *Precio máximo:* ${maxPrice} 🌱

💡 *Recomendación:* ${avgPrice - 20}-${avgPrice + 20} 🌱`;

    m.reply(message);
}

async function viewFeatured(m, conn, market) {
    const featuredListings = market.featured
        .map(id => market.listings[id])
        .filter(listing => listing && listing.status === 'active')
        .slice(0, 5);

    if (featuredListings.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ ⭐ *WAIFUS DESTACADAS* ⭐
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No hay waifus destacadas en este momento.

💡 Las waifus legendarias se destacan automáticamente.
🌟 ¡Sé el primero en listar una waifu épica!`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ ⭐ *WAIFUS DESTACADAS* ⭐
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    const rarityEmoji = {
        'común': '⚪',
        'rara': '🟢',
        'épica': '🟣',
        'ultra rara': '🟡',
        'legendaria': '🔴'
    };

    featuredListings.forEach((listing, index) => {
        message += `┌─────────────────────┐
│ ⭐ ${listing.waifu.name}
│ ${rarityEmoji[listing.waifu.rarity.toLowerCase()] || '⚪'} ${listing.waifu.rarity}
│ 💰 ${listing.price} 🌱
│ 👤 ${listing.sellerName}
│ 👁️ ${listing.views} vistas
│ 🆔 ${listing.id}
└─────────────────────┘

`;
    });

    message += `🛒 *Comprar:* \`.market comprar [ID]\`
🛍️ *Ver todo:* \`.market tienda\``;

    m.reply(message);
}

async function showMarketHelp(m, conn, usedPrefix) {
    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🛒 *MERCADO DE WAIFUS* 🛒
╰━━━━━━━━━━━━━━━━━━━━━━╯

📝 *Comandos de venta:*
🔸 \`${usedPrefix}market vender [nombre] [precio]\`
   Poner waifu en venta
🔸 \`${usedPrefix}market mis\`
   Ver tus ventas activas
🔸 \`${usedPrefix}market quitar [ID]\`
   Retirar waifu del mercado

🛒 *Comandos de compra:*
🔸 \`${usedPrefix}market tienda [página] [rareza]\`
   Ver waifus en venta
🔸 \`${usedPrefix}market comprar [ID]\`
   Comprar waifu específica
🔸 \`${usedPrefix}market destacado\`
   Ver waifus destacadas

📊 *Información:*
🔸 \`${usedPrefix}market precio [nombre]\`
   Ver precios sugeridos

💡 *Ejemplos:*
• \`${usedPrefix}market vender "Rem" 180\`
• \`${usedPrefix}market tienda 1 legendaria\`
• \`${usedPrefix}market comprar 1234567890\`

⚠️ *Importante:*
• Los precios se basan en rareza y mercado
• Las waifus legendarias se destacan automáticamente
• Las transacciones son instantáneas y seguras`);
}

handler.help = ['market'];
handler.tags = ['rpg', 'economy'];
handler.command = /^(market|mercado|tienda)$/i;
handler.register = true;

export default handler;
