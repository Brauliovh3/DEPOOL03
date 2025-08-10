import {generateWAMessageFromContent} from '@whiskeysockets/baileys';
import {smsg} from '../lib/simple.js';
import {format} from 'util';
import {fileURLToPath} from 'url';
import path, {join} from 'path';
import {unwatchFile, watchFile} from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import NodeCache from 'node-cache';

const { proto } = (await import('@whiskeysockets/baileys')).default

// ⚡ Cache ultra optimizado con diferentes TTL según importancia
const userDataCache = new NodeCache({ stdTTL: 180, checkperiod: 30, maxKeys: 1000 })
const groupDataCache = new NodeCache({ stdTTL: 300, checkperiod: 60, maxKeys: 500 })
const commandCache = new NodeCache({ stdTTL: 60, checkperiod: 15, maxKeys: 200 })
const pluginCache = new NodeCache({ stdTTL: 600, checkperiod: 120, maxKeys: 100 })

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// ⚡ Función ultra optimizada para obtener/crear datos de usuario
function getUserData(userId) {
  const cacheKey = `user_${userId}`;
  
  // Cache hit - respuesta inmediata
  if (userDataCache.has(cacheKey)) {
    return userDataCache.get(cacheKey);
  }
  
  let user = global.db.data.users[userId];
  
  if (typeof user !== 'object') {
    // Datos por defecto optimizados
    user = {
      afk: -1, afkReason: '', name: '', age: 0, bank: 0,
      banned: false, BannedReason: '', Banneduser: false,
      coin: 0, diamond: 3, joincount: 1, level: 0,
      lastadventure: 0, lastcoins: 0, lastclaim: 0,
      lastcode: 0, lastcofre: 0, lastdiamantes: 0,
      lastduel: 0, lastpago: 0, lastrob: 0,
      cebollines: 10, money: 100, muto: false,
      premium: false, premiumTime: 0, registered: false,
      regTime: -1, rendang: 0, exp: 0, role: 'Nuv', warn: 0
    };
    global.db.data.users[userId] = user;
  } else {
    // ⚡ Verificaciones mínimas y rápidas
    user.exp = user.exp || 0;
    user.premium = user.premium || false;
    user.muto = user.muto || false;
    user.joincount = user.joincount || 1;
    user.money = user.money || 150;
    user.cebollines = user.cebollines || 10;
    user.registered = user.registered || false;
    user.level = user.level || 0;
    user.warn = user.warn || 0;
    if (!user.premium) user.premiumTime = 0;
  }
  
  // Cache con TTL corto para datos activos
  userDataCache.set(cacheKey, user, 180);
  return user;
}

// ⚡ Función optimizada para datos de grupo
function getGroupData(chatId) {
  const cacheKey = `chat_${chatId}`;
  
  if (groupDataCache.has(cacheKey)) {
    return groupDataCache.get(cacheKey);
  }
  
  let chat = global.db.data.chats[chatId];
  
  if (typeof chat !== 'object') {
    chat = {
      isBanned: false, welcome: true, detect: true,
      sWelcome: '', sBye: '', sPromote: '', sDemote: '', sAutoresponder: '',
      sCondition: JSON.stringify([{ grupo: { usuario: [], condicion: [], admin: '' }, prefijos: []}]), 
      autoresponder: false, autoAceptar: false, nsfw: false,
      antiLink: false, modoadmin: false, expired: 0,
    };
    global.db.data.chats[chatId] = chat;
  }
  
  groupDataCache.set(cacheKey, chat, 300);
  return chat;
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
      
  // ⚡ Procesamiento ultra rápido de mensajes
  this.pushMessage(chatUpdate.messages).catch(() => {}) // Sin log de errores innecesarios
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return;
  
  // ⚡ Cache para verificación de base de datos
  if (global.db.data == null) await global.loadDatabase()
  
  try {
    m = smsg(this, m) || m
    if (!m) return
    global.mconn = m 
    m.exp = 0
    m.cebollines = false
    
    try {
      // ⚡ Usar función de cache ultra optimizada para datos de usuario
      let user = getUserData(m.sender);
      
      // ⚡ Configurar nombre de forma rápida
      if (!user.registered && !user.name) user.name = m.name;
      
      // ⚡ Cache optimizado para datos de chat
      let chat = getGroupData(m.chat);
      
      // ⚡ Settings con cache optimizado
      let settings = global.db.data.settings[this.user.jid]
      if (typeof settings !== 'object') {
        global.db.data.settings[this.user.jid] = {
          self: false, autoread: false, restrict: false, 
          jadibotmd: true, botcommandCount: 0,
        };
        settings = global.db.data.settings[this.user.jid];
      }
      
    } catch (e) {
      console.error(e)
    }
    
    // ⚡ Verificaciones ultra rápidas de validez de mensaje
    if (typeof m.text !== "string") m.text = ""
    
    const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
    const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + detectwhat).includes(m.sender)
    const isOwner = isROwner || m.fromMe
    const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0
    
    // ⚡ Sistema de cola ultra optimizado (sin delay para usuarios premium/owner)
    if (opts["queque"] && m.text && !isOwner && !isPrems) {
      const queque = this.msgqueque, time = 1000 * 1 // Reducido a 1 segundo
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      
      // Procesamiento asíncrono no bloqueante
      Promise.resolve().then(async () => {
        const startTime = Date.now()
        while (queque.indexOf(previousID) !== -1 && (Date.now() - startTime) < time) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      })
    }
    
    // ⚡ Filtros ultra optimizados - retorno inmediato sin procesamiento
    if (m.isBaileys) return
    
    m.exp += Math.ceil(Math.random() * 10)
    let usedPrefix
    let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
    
    // ⚡ Cache ultra optimizado para getLidFromJid (con timeout de 30s)
    async function getLidFromJid(id, conn) {
      const cacheKey = `lid_${id}`;
      if (commandCache.has(cacheKey)) {
        return commandCache.get(cacheKey);
      }
      
      if (id.endsWith('@lid')) {
        commandCache.set(cacheKey, id, 30);
        return id;
      }
      
      try {
        const res = await Promise.race([
          conn.onWhatsApp(id).catch(() => []),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]);
        const result = res[0]?.lid || id;
        commandCache.set(cacheKey, result, 30);
        return result;
      } catch (e) {
        commandCache.set(cacheKey, id, 10); // Cache corto para errores
        return id;
      }
    }
    
    // ⚡ Procesamiento asíncrono de Lid para mejor performance
    const [senderLid, botLid] = await Promise.all([
      getLidFromJid(m.sender, this),
      getLidFromJid(this.user.jid, this)
    ]);
    
    const senderJid = m.sender
    const botJid = this.user.jid
    
    // ⚡ Cache optimizado para metadata de grupo
    const groupMetadata = m.isGroup
      ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => ({})))
      : {}
    
    const participants = m.isGroup ? (groupMetadata.participants || []) : []
    
    // ⚡ Búsqueda optimizada de usuario y bot
    const user = participants.find(p => p.id === senderLid || p.id === senderJid) || {}
    const bot = participants.find(p => p.id === botLid || p.id === botJid) || {}
    
    const isRAdmin = user?.admin === "superadmin"
    const isAdmin = isRAdmin || user?.admin === "admin"
    const isBotAdmin = !!bot?.admin
    
    // ⚡ Loop de plugins ultra optimizado con paralelización
    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    
    // Filtrar plugins activos de una vez
    const activePlugins = Object.entries(global.plugins).filter(([name, plugin]) => 
      plugin && !plugin.disabled
    );
    
    for (let [name, plugin] of activePlugins) {
      const __filename = join(___dirname, name)
      
      // ⚡ Procesamiento paralelo de función 'all' cuando sea posible
      if (typeof plugin.all === 'function') {
        try {
          // No awaitar a menos que sea crítico
          plugin.all.call(this, m, {
            chatUpdate, __dirname: ___dirname, __filename
          }).catch(() => {}); // Silenciar errores no críticos
        } catch (e) {
          // Solo log de errores críticos
          if (e.name === 'TypeError' || e.name === 'ReferenceError') {
            console.error(e);
          }
        }
      }
      
      // ⚡ Verificaciones admin ultra rápidas
      if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) {
        continue
      }
      
      // ⚡ Sistema de matching ultra optimizado
      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
      let match = (_prefix instanceof RegExp ? 
      [[_prefix.exec(m.text), _prefix]] :
      Array.isArray(_prefix) ? 
      _prefix.map(p => {
      let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
      return [re.exec(m.text), re]
      }) :
      typeof _prefix === 'string' ? 
      [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
      [[[], new RegExp]]
      ).find(p => p[1])
      
      // ⚡ Función before sin await innecesario
      if (typeof plugin.before === 'function') {
        try {
          const result = plugin.before.call(this, m, {
            match, conn: this, participants, groupMetadata, user, bot,
            isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
            chatUpdate, __dirname: ___dirname, __filename
          });
          
          // Solo awaitar si es una Promise
          if (result && typeof result.then === 'function') {
            if (await result) continue;
          } else if (result) {
            continue;
          }
        } catch (e) {
          // Solo log errores críticos
          if (e.name !== 'TypeError') console.error(e);
        }
      }
      
      if (typeof plugin !== 'function') continue
      
      // ⚡ Procesamiento de comandos ultra optimizado
      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
        args = args || []
        let _args = noPrefix.trim().split` `.slice(1)
        let text = _args.join` `
        command = (command || '').toLowerCase()
        let fail = plugin.fail || global.dfail 
        
        // ⚡ Verificación de comando ultra rápida
        let isAccept = plugin.command instanceof RegExp ? 
        plugin.command.test(command) :
        Array.isArray(plugin.command) ? 
        plugin.command.some(cmd => cmd instanceof RegExp ? 
        cmd.test(command) : cmd === command) :
        typeof plugin.command === 'string' ? 
        plugin.command === command : false
        
        if (!isAccept) continue
        
        // ⚡ Incremento rápido sin verificaciones complejas
        global.db.data.settings[this.user.jid].botcommandCount += 1
        
        m.plugin = name
        
        // ⚡ Verificaciones de permisos optimizadas con early return
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          let chat = global.db.data.chats[m.chat]
          let user = global.db.data.users[m.sender]
          
          // Verificaciones de ban ultra rápidas
          if (!['owner-unbanchat.js'].includes(name) && chat?.isBanned && !isROwner) return
          if (!['owner-unbanchat.js', 'owner-exec.js', 'owner-exec2.js', 'tool-delete.js'].includes(name) && chat?.isBanned && !isROwner) return
          
          // ⚡ Verificación ultra rápida de usuario baneado
          if (m.text && user.banned && !isROwner) {
            m.reply(`🚫 Está baneado(a), no puede usar los comandos de este bot!\n\n${user.bannedReason ? `💌 *Motivo:* ${user.bannedReason}` : '💌 *Motivo:* Sin Especificar'}\n\n⚠️ *Si este bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puede exponer su caso en:*\n\n🤍 ${asistencia}`)        
            return
          }
          
          // ⚡ Verificaciones de ID ultra rápidas con regex
          if (/^(NJX-|BAE5.{12}|B24E.{16})/.test(m.id)) return
          
          // ⚡ Verificaciones de opciones optimizadas con early returns
          if (opts['nyimak'] || (!isROwner && opts['self']) || 
             (opts['pconly'] && m.chat.endsWith('g.us')) || 
             (opts['swonly'] && m.chat !== 'status@broadcast')) return;
          
          // ⚡ Verificación optimizada para gconly
          if (opts['gconly'] && !m.chat.endsWith('g.us')) {
            const allowedInPrivateForUsers = ['serbot', 'serbot --code', 'menu', 'info'];
            if (!isOwner && !allowedInPrivateForUsers.includes(command)) return
          }
          
          if (typeof m.text !== 'string') m.text = '';
          if (m.isBaileys) return
        }
        
        // ⚡ Verificaciones de permisos ultra optimizadas con early returns
        let hl = _prefix 
        let adminMode = global.db.data.chats[m.chat].modoadmin
        let mini = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl ||  m.text.slice(0, 1) == hl || plugin.command}`
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return   
        
        // ⚡ Verificaciones de permisos en cascada optimizada
        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
          fail('owner', m, this); continue
        }
        if (plugin.rowner && !isROwner) {
          fail('rowner', m, this); continue
        }
        if (plugin.owner && !isOwner) {
          fail('owner', m, this); continue
        }
        if (plugin.premium && !isPrems) {
          fail('premium', m, this); continue
        }
        if (plugin.botAdmin && !isBotAdmin) {
          fail('botAdmin', m, this); continue
        }
        if (plugin.admin && !isAdmin) {
          fail('admin', m, this); continue
        }
        if (plugin.private && m.isGroup) {
          fail('private', m, this); continue
        }
        if (plugin.register == true && _user.registered == false) {
          fail('unreg', m, this); continue
        }
        
        m.isCommand = true
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
        
        // ⚡ Verificaciones de recursos ultra rápidas
        if (plugin.money && global.db.data.users[m.sender].money < plugin.money * 1) {
          m.reply(`No tienes suficiente Money para usar este comando. 💙`); continue
        }
        if (plugin.cebollines && global.db.data.users[m.sender].cebollines < plugin.cebollines * 1) {
          m.reply(`No tienes suficiente cebollines para usar este comando. 🌱`); continue
        }
        if (plugin.level > _user.level) {
          m.reply(`No tienes el nivel para usar este comando. 💙`); continue
        }
        
        m.exp += xp
        
        let extra = {
          match, usedPrefix, noPrefix, _args, args, command, text,
          conn: this, participants, groupMetadata, user, bot,
          isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
          chatUpdate, __dirname: ___dirname, __filename
        }
        
        try {
          await plugin.call(this, m, extra)
          m.cebollines = m.cebollines || plugin.cebollines || false
          m.money = m.money || plugin.money || false
        } catch (e) {
          m.error = e
          console.error(e)
          if (e && e.name) m.reply(format(e).replace(/Admin/g, 'Admin'))
        } finally {
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra)
            } catch (e) {
              console.error(e)
            }
          }
          if (m.cebollines) this.reply(m.chat, `Utilizaste *${+m.cebollines}* 🌱`, m)
          if (m.money) this.reply(m.chat, `Utilizaste *${+m.money}* 💰`, m)
        }
        break
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    // ⚡ Limpieza de cola optimizada
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }

    // ⚡ Actualización de estadísticas optimizada
    let user, stats = global.db.data.stats
    if (m && m.sender && (user = global.db.data.users[m.sender])) {
      user.exp += m.exp
      user.cebollines -= m.cebollines * 1
      user.money -= m.money * 1

      if (m.plugin) {
        let now = +new Date
        let stat = stats[m.plugin]
        if (!stat) {
          stat = stats[m.plugin] = { total: 1, success: m.error != null ? 0 : 1, last: now, lastSuccess: m.error != null ? 0 : now }
        } else {
          if (!isNumber(stat.total)) stat.total = 1
          if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
          if (!isNumber(stat.last)) stat.last = now
          if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
          stat.total += 1
          stat.last = now
          if (m.error == null) {
            stat.success += 1
            stat.lastSuccess = now
          }
        }
      }
    }

    // ⚡ Print y autoread optimizados
    try {
      if (!opts['noprint']) await (await import(`../lib/print.js`)).default(m, this)
    } catch (e) {
      console.log(m, m.quoted, e)
    }
    let settingsREAD = global.db.data.settings[this.user.jid] || {}  
    if (opts['autoread']) await this.readMessages([m.key])
  }
}

global.dfail = (type, m, conn) => {
  const msg = {
    rowner: '💙 *Esta función solo puede ser usada por mi creador*\n\n> (ㅎㅊDEPOOLㅊㅎ).', 
    owner: '💙 *Esta función solo puede ser usada por mi desarrollador.*', 
    premium: '💙 *Esta función solo es para usuarios Premium.*',  
    private: '💙 *Esta función solo puede ser usada en chat privado.*', 
    admin: '💙 *Este comando solo puede ser usado por admins.*', 
    botAdmin: '💙 *Para usar esta función debo ser admin.*', 
    unreg: '💙 *¡Hey! no estas registrado, registrese para usar esta función*\n\n*/reg nombre.edad*\n\n*_❕ Ejemplo_* : */reg (ㅎㅊDEPOOLㅊㅎ).18*',
    restrict: '💙 *Esta característica esta desactivada.*'
  }[type];
  if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('💢'))
}
