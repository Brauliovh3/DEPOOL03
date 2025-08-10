import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const eventsFilePath = path.join(dbPath, 'events.json');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

// 🎪 Sistema de eventos especiales y recompensas
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

function loadEvents() {
    if (!fs.existsSync(eventsFilePath)) {
        return { 
            activeEvents: {},
            eventHistory: [],
            dailyRewards: {},
            weeklyRewards: {},
            specialEvents: {}
        };
    }
    try {
        return JSON.parse(fs.readFileSync(eventsFilePath, 'utf-8'));
    } catch (error) {
        console.error('❌ Error al cargar eventos:', error);
        return { 
            activeEvents: {},
            eventHistory: [],
            dailyRewards: {},
            weeklyRewards: {},
            specialEvents: {}
        };
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

function saveEvents(data) {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
        fs.writeFileSync(eventsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error al guardar eventos:', error);
    }
}

// Verificar si el usuario puede reclamar recompensa diaria
function canClaimDaily(userId, events) {
    const lastClaim = events.dailyRewards[userId]?.lastClaim;
    if (!lastClaim) return true;
    
    const lastClaimDate = new Date(lastClaim);
    const today = new Date();
    return today.toDateString() !== lastClaimDate.toDateString();
}

// Verificar si el usuario puede reclamar recompensa semanal
function canClaimWeekly(userId, events) {
    const lastClaim = events.weeklyRewards[userId]?.lastClaim;
    if (!lastClaim) return true;
    
    const lastClaimDate = new Date(lastClaim);
    const today = new Date();
    const daysDiff = Math.floor((today - lastClaimDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7;
}

// Generar evento aleatorio
function generateRandomEvent() {
    const events = [
        {
            type: 'double_xp',
            name: 'Experiencia Doble',
            description: 'Todas las acciones dan doble experiencia',
            duration: 2, // horas
            multiplier: 2,
            emoji: '⚡'
        },
        {
            type: 'rare_boost',
            name: 'Suerte Épica',
            description: 'Mayor probabilidad de obtener waifus raras',
            duration: 3,
            rareBoost: 1.5,
            emoji: '🍀'
        },
        {
            type: 'trade_bonus',
            name: 'Bonificación de Comercio',
            description: 'Sin comisiones en trades y subastas',
            duration: 4,
            tradeFee: 0,
            emoji: '🤝'
        },
        {
            type: 'money_rain',
            name: 'Lluvia de Cebollines',
            description: 'Cebollines extra al completar acciones',
            duration: 1,
            moneyMultiplier: 1.5,
            emoji: '💰'
        },
        {
            type: 'collection_event',
            name: 'Festival de Colección',
            description: 'Waifus especiales del evento disponibles',
            duration: 6,
            specialWaifus: true,
            emoji: '🎪'
        }
    ];
    
    return events[Math.floor(Math.random() * events.length)];
}

// Waifus especiales del evento
const eventWaifus = [
    { name: 'Miku Festivalera', rarity: 'épica', event: true },
    { name: 'Rin Celebración', rarity: 'ultra rara', event: true },
    { name: 'Luka Eventos', rarity: 'legendaria', event: true },
    { name: 'Meiko Especial', rarity: 'épica', event: true },
    { name: 'Kaito Limitado', rarity: 'ultra rara', event: true }
];

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const userId = m.sender;
    const db = loadDatabase();
    const events = loadEvents();

    // Inicializar usuario si no existe
    if (!db.users[userId]) {
        db.users[userId] = { characters: [], money: 0, level: 1, exp: 0, dailyStreak: 0 };
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
        case 'diario':
        case 'daily':
            await claimDailyReward(m, conn, userId, db, events);
            break;
            
        case 'semanal':
        case 'weekly':
            await claimWeeklyReward(m, conn, userId, db, events);
            break;
            
        case 'activos':
        case 'active':
            await viewActiveEvents(m, conn, events);
            break;
            
        case 'crear':
        case 'create':
            await createEvent(m, conn, args, events);
            break;
            
        case 'spin':
        case 'ruleta':
            await spinWheel(m, conn, userId, db);
            break;
            
        case 'especial':
        case 'special':
            await getEventWaifu(m, conn, userId, db, events);
            break;
            
        default:
            await showEventsHelp(m, conn, usedPrefix);
    }
};

async function claimDailyReward(m, conn, userId, db, events) {
    if (!canClaimDaily(userId, events)) {
        const lastClaim = new Date(events.dailyRewards[userId].lastClaim);
        const tomorrow = new Date(lastClaim);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return m.reply(`❌ Ya reclamaste tu recompensa diaria.\n\n⏰ *Próxima recompensa:* ${tomorrow.toLocaleString()}\n\n💡 ¡Vuelve mañana por más premios!`);
    }

    // Incrementar racha diaria
    const userRewards = events.dailyRewards[userId] || { streak: 0, totalClaimed: 0 };
    const lastClaimDate = userRewards.lastClaim ? new Date(userRewards.lastClaim) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastClaimDate || lastClaimDate.toDateString() === yesterday.toDateString()) {
        userRewards.streak += 1;
    } else {
        userRewards.streak = 1;
    }

    // Calcular recompensas basadas en la racha
    const baseCoins = 50;
    const streakBonus = Math.min(userRewards.streak * 10, 100); // Máximo 100 bonus
    const totalCoins = baseCoins + streakBonus;
    const baseExp = 20;
    const expBonus = Math.min(userRewards.streak * 5, 50);
    const totalExp = baseExp + expBonus;

    // Recompensa especial cada 7 días
    let specialReward = null;
    if (userRewards.streak % 7 === 0) {
        specialReward = {
            type: 'waifu',
            rarity: userRewards.streak >= 14 ? 'épica' : 'rara'
        };
    }

    // Otorgar recompensas
    global.db.data.users[userId].cebollines = (global.db.data.users[userId].cebollines || 0) + totalCoins;
    db.users[userId].exp = (db.users[userId].exp || 0) + totalExp;

    // Actualizar registro
    userRewards.lastClaim = new Date().toISOString();
    userRewards.totalClaimed += 1;
    events.dailyRewards[userId] = userRewards;

    // Verificar level up
    const newLevel = Math.floor(db.users[userId].exp / 100) + 1;
    const leveledUp = newLevel > (db.users[userId].level || 1);
    if (leveledUp) {
        db.users[userId].level = newLevel;
    }

    saveDatabase(db);
    saveEvents(events);

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎁 *RECOMPENSA DIARIA* 🎁
╰━━━━━━━━━━━━━━━━━━━━━━╯

💰 *Cebollines:* +${totalCoins} 🌱
⭐ *Experiencia:* +${totalExp} XP
🔥 *Racha actual:* ${userRewards.streak} días

`;

    if (leveledUp) {
        message += `🎉 *¡LEVEL UP!* Ahora eres nivel ${newLevel}\n\n`;
    }

    if (specialReward) {
        if (specialReward.type === 'waifu') {
            // Dar waifu aleatoria
            const availableWaifus = eventWaifus.filter(w => w.rarity === specialReward.rarity);
            const randomWaifu = availableWaifus[Math.floor(Math.random() * availableWaifus.length)];
            db.users[userId].characters.push(randomWaifu);
            message += `🎊 *¡RECOMPENSA ESPECIAL DE RACHA!*\n✨ Obteniste: ${randomWaifu.name} (${randomWaifu.rarity})\n\n`;
        }
    }

    message += `📊 *Estadísticas:*
🏆 *Nivel:* ${db.users[userId].level || 1}
💎 *Recompensas reclamadas:* ${userRewards.totalClaimed}
🔮 *Próxima recompensa especial:* ${7 - (userRewards.streak % 7)} días

💡 *¡Mantén tu racha para mejores recompensas!*`;

    m.reply(message);
}

async function claimWeeklyReward(m, conn, userId, db, events) {
    if (!canClaimWeekly(userId, events)) {
        const lastClaim = new Date(events.weeklyRewards[userId].lastClaim);
        const nextWeek = new Date(lastClaim);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return m.reply(`❌ Ya reclamaste tu recompensa semanal.\n\n⏰ *Próxima recompensa:* ${nextWeek.toLocaleString()}\n\n💡 ¡Vuelve la próxima semana!`);
    }

    const userLevel = db.users[userId].level || 1;
    const weeklyCoins = 200 + (userLevel * 20);
    const weeklyExp = 100 + (userLevel * 10);

    // Recompensa especial basada en nivel
    let specialReward = null;
    if (userLevel >= 10) {
        specialReward = { type: 'epic_waifu' };
    } else if (userLevel >= 5) {
        specialReward = { type: 'rare_waifu' };
    }

    // Otorgar recompensas
    global.db.data.users[userId].cebollines = (global.db.data.users[userId].cebollines || 0) + weeklyCoins;
    db.users[userId].exp = (db.users[userId].exp || 0) + weeklyExp;

    // Actualizar registro
    if (!events.weeklyRewards[userId]) {
        events.weeklyRewards[userId] = { totalClaimed: 0 };
    }
    events.weeklyRewards[userId].lastClaim = new Date().toISOString();
    events.weeklyRewards[userId].totalClaimed += 1;

    saveDatabase(db);
    saveEvents(events);

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🏆 *RECOMPENSA SEMANAL* 🏆
╰━━━━━━━━━━━━━━━━━━━━━━╯

💰 *Cebollines:* +${weeklyCoins} 🌱
⭐ *Experiencia:* +${weeklyExp} XP
🏅 *Nivel actual:* ${userLevel}

`;

    if (specialReward) {
        const rarity = specialReward.type === 'epic_waifu' ? 'épica' : 'rara';
        const availableWaifus = eventWaifus.filter(w => w.rarity === rarity);
        const randomWaifu = availableWaifus[Math.floor(Math.random() * availableWaifus.length)];
        db.users[userId].characters.push(randomWaifu);
        message += `🎊 *¡RECOMPENSA ESPECIAL!*\n✨ Obteniste: ${randomWaifu.name} (${randomWaifu.rarity})\n\n`;
    }

    message += `📊 *Estadísticas:*
🏆 *Recompensas semanales:* ${events.weeklyRewards[userId].totalClaimed}
💎 *Cebollines totales:* ${global.db.data.users[userId].cebollines} 🌱

💡 *¡Las recompensas mejoran con tu nivel!*`;

    m.reply(message);
}

async function viewActiveEvents(m, conn, events) {
    const now = new Date();
    const activeEvents = Object.values(events.activeEvents)
        .filter(event => new Date(event.endTime) > now);

    if (activeEvents.length === 0) {
        return m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎪 *EVENTOS ACTIVOS* 🎪
╰━━━━━━━━━━━━━━━━━━━━━━╯

😔 No hay eventos especiales activos.

💡 *Recompensas disponibles:*
• \`.event diario\` - Recompensa diaria
• \`.event semanal\` - Recompensa semanal  
• \`.event spin\` - Ruleta de la suerte

🎯 ¡Los eventos aparecen aleatoriamente!`);
    }

    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎪 *EVENTOS ACTIVOS* 🎪
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

    activeEvents.forEach((event, index) => {
        const endTime = new Date(event.endTime);
        const timeLeft = Math.max(0, endTime - now);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        message += `${event.emoji} *${event.name}*
📝 ${event.description}
⏰ ${hoursLeft}h ${minutesLeft}m restantes

`;
    });

    message += `🎁 *Recompensas regulares:*
• \`.event diario\` - Cada 24 horas
• \`.event semanal\` - Cada 7 días
• \`.event spin\` - Cada 6 horas`;

    m.reply(message);
}

async function spinWheel(m, conn, userId, db) {
    const lastSpin = global.db.data.users[userId]?.lastSpin;
    const now = new Date();
    
    if (lastSpin) {
        const lastSpinTime = new Date(lastSpin);
        const timeDiff = now - lastSpinTime;
        const hoursLeft = 6 - Math.floor(timeDiff / (1000 * 60 * 60));
        
        if (hoursLeft > 0) {
            return m.reply(`❌ Ya usaste la ruleta recientemente.\n\n⏰ *Próximo spin:* ${hoursLeft} horas\n\n💡 ¡La paciencia se recompensa!`);
        }
    }

    // Definir premios de la ruleta
    const prizes = [
        { name: 'Cebollines pequeños', reward: { type: 'coins', amount: 25 }, weight: 30 },
        { name: 'Cebollines medianos', reward: { type: 'coins', amount: 50 }, weight: 20 },
        { name: 'Cebollines grandes', reward: { type: 'coins', amount: 100 }, weight: 15 },
        { name: 'Experiencia básica', reward: { type: 'exp', amount: 30 }, weight: 20 },
        { name: 'Experiencia extra', reward: { type: 'exp', amount: 60 }, weight: 10 },
        { name: 'Waifu común', reward: { type: 'waifu', rarity: 'común' }, weight: 3 },
        { name: 'Waifu rara', reward: { type: 'waifu', rarity: 'rara' }, weight: 1.5 },
        { name: 'JACKPOT', reward: { type: 'jackpot' }, weight: 0.5 }
    ];

    // Seleccionar premio basado en peso
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPrize = null;

    for (const prize of prizes) {
        random -= prize.weight;
        if (random <= 0) {
            selectedPrize = prize;
            break;
        }
    }

    // Otorgar premio
    let message = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎰 *RULETA DE LA SUERTE* 🎰
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎲 *¡Girando la ruleta...!*

🎉 *Premio obtenido:* ${selectedPrize.name}

`;

    switch (selectedPrize.reward.type) {
        case 'coins':
            global.db.data.users[userId].cebollines = (global.db.data.users[userId].cebollines || 0) + selectedPrize.reward.amount;
            message += `💰 *+${selectedPrize.reward.amount} cebollines* 🌱`;
            break;
            
        case 'exp':
            db.users[userId].exp = (db.users[userId].exp || 0) + selectedPrize.reward.amount;
            message += `⭐ *+${selectedPrize.reward.amount} experiencia*`;
            
            // Verificar level up
            const newLevel = Math.floor(db.users[userId].exp / 100) + 1;
            if (newLevel > (db.users[userId].level || 1)) {
                db.users[userId].level = newLevel;
                message += `\n🎉 *¡LEVEL UP!* Ahora eres nivel ${newLevel}`;
            }
            break;
            
        case 'waifu':
            const availableWaifus = eventWaifus.filter(w => w.rarity === selectedPrize.reward.rarity);
            const randomWaifu = availableWaifus[Math.floor(Math.random() * availableWaifus.length)];
            db.users[userId].characters.push(randomWaifu);
            message += `✨ *${randomWaifu.name}* (${randomWaifu.rarity})`;
            break;
            
        case 'jackpot':
            const jackpotCoins = 500;
            const jackpotWaifu = eventWaifus.find(w => w.rarity === 'épica');
            global.db.data.users[userId].cebollines = (global.db.data.users[userId].cebollines || 0) + jackpotCoins;
            db.users[userId].characters.push(jackpotWaifu);
            message += `🎊 *¡JACKPOT ÉPICO!*\n💰 ${jackpotCoins} cebollines\n✨ ${jackpotWaifu.name} (épica)`;
            break;
    }

    // Actualizar último spin
    global.db.data.users[userId].lastSpin = now.toISOString();

    saveDatabase(db);

    message += `\n\n🎰 *Próximo spin:* 6 horas\n💎 *Cebollines totales:* ${global.db.data.users[userId].cebollines} 🌱`;

    m.reply(message);
}

async function getEventWaifu(m, conn, userId, db, events) {
    // Verificar si hay evento de colección activo
    const now = new Date();
    const collectionEvent = Object.values(events.activeEvents)
        .find(event => event.type === 'collection_event' && new Date(event.endTime) > now);

    if (!collectionEvent) {
        return m.reply(`❌ No hay evento de colección activo.\n\n💡 Durante eventos especiales puedes obtener waifus exclusivas.\n🎪 Mantente atento a los anuncios de eventos!`);
    }

    const lastClaim = global.db.data.users[userId]?.lastEventWaifu;
    if (lastClaim) {
        const lastClaimTime = new Date(lastClaim);
        const timeDiff = now - lastClaimTime;
        const hoursLeft = 12 - Math.floor(timeDiff / (1000 * 60 * 60));
        
        if (hoursLeft > 0) {
            return m.reply(`❌ Ya reclamaste una waifu del evento.\n\n⏰ *Próxima waifu:* ${hoursLeft} horas\n\n💫 *Evento activo:* ${collectionEvent.name}`);
        }
    }

    // Dar waifu del evento
    const eventWaifu = eventWaifus[Math.floor(Math.random() * eventWaifus.length)];
    db.users[userId].characters.push(eventWaifu);
    global.db.data.users[userId].lastEventWaifu = now.toISOString();

    saveDatabase(db);

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎪 *WAIFU DE EVENTO* 🎪
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎊 *¡Waifu del evento obtenida!*

✨ *Nombre:* ${eventWaifu.name}
💎 *Rareza:* ${eventWaifu.rarity}
🌟 *Tipo:* Exclusiva de evento

📅 *Evento:* ${collectionEvent.name}
⏰ *Próxima waifu:* 12 horas

💡 *¡Las waifus de evento son muy raras!*`);
}

async function createEvent(m, conn, args, events) {
    // Solo para administradores (implementar verificación de admin)
    const eventData = generateRandomEvent();
    const eventId = Date.now().toString();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (eventData.duration * 60 * 60 * 1000));

    events.activeEvents[eventId] = {
        ...eventData,
        id: eventId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        active: true
    };

    saveEvents(events);

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎪 *NUEVO EVENTO* 🎪
╰━━━━━━━━━━━━━━━━━━━━━━╯

${eventData.emoji} *${eventData.name}*
📝 ${eventData.description}
⏰ Duración: ${eventData.duration} horas

🎉 *¡El evento ha comenzado!*`);
}

async function showEventsHelp(m, conn, usedPrefix) {
    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎪 *SISTEMA DE EVENTOS* 🎪
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎁 *Recompensas regulares:*
🔸 \`${usedPrefix}event diario\`
   Recompensa cada 24 horas (con racha)

🔸 \`${usedPrefix}event semanal\`
   Recompensa cada 7 días

🔸 \`${usedPrefix}event spin\`
   Ruleta de la suerte (cada 6 horas)

🎪 *Eventos especiales:*
🔸 \`${usedPrefix}event activos\`
   Ver eventos en curso

🔸 \`${usedPrefix}event especial\`
   Obtener waifu de evento

💡 *Tipos de eventos:*
⚡ Experiencia doble
🍀 Mayor probabilidad de raras
🤝 Sin comisiones en trades
💰 Cebollines extra
🎪 Waifus exclusivas

🌟 *Consejos:*
• Mantén tu racha diaria para mejores premios
• Los eventos aparecen aleatoriamente
• Las waifus de evento son muy valiosas
• Sube de nivel para mejores recompensas semanales`);
}

// Auto-generar eventos aleatorios
setInterval(() => {
    const events = loadEvents();
    const now = new Date();
    
    // Limpiar eventos expirados
    Object.keys(events.activeEvents).forEach(eventId => {
        if (new Date(events.activeEvents[eventId].endTime) <= now) {
            delete events.activeEvents[eventId];
        }
    });
    
    // Generar nuevo evento aleatoriamente (5% chance cada hora)
    if (Math.random() < 0.05 && Object.keys(events.activeEvents).length < 2) {
        const eventData = generateRandomEvent();
        const eventId = Date.now().toString();
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (eventData.duration * 60 * 60 * 1000));

        events.activeEvents[eventId] = {
            ...eventData,
            id: eventId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            active: true
        };
        
        saveEvents(events);
    }
}, 3600000); // Verificar cada hora

handler.help = ['event'];
handler.tags = ['rpg', 'game'];
handler.command = /^(event|evento)$/i;
handler.register = true;

export default handler;
