process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { watchFile, unwatchFile, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, readFileSync, copyFileSync, watch, rmSync, readdir, stat, mkdirSync, rename, writeFile } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import cp from 'child_process'
import os from 'os'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from '../lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import { mongoDB, mongoDBV2 } from '../lib/mongoDB.js'
import store from '../lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { makeInMemoryStore, DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys')
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000


// Cache optimizado para operaciones repetitivas
const messageCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })
const userCache = new NodeCache({ stdTTL: 600, checkperiod: 120 })
const chatCache = new NodeCache({ stdTTL: 900, checkperiod: 180 })
const dbWriteQueue = new Set()
let dbWriteTimeout = null

// Sistema de batch para escrituras de base de datos
function queueDatabaseWrite() {
  if (dbWriteTimeout) {
    clearTimeout(dbWriteTimeout);
  }
  
  dbWriteTimeout = setTimeout(async () => {
    try {
      await Promise.all([
        global.db?.data ? global.db.write() : Promise.resolve(),
        global.chatgpt?.data ? global.chatgpt.write() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error al escribir la base de datos:', error);
    }
  }, 1500); // Reducido de 2000ms a 1500ms
}


global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

try {
  protoType()
  serialize()
} catch (error) {
  if (error.message.includes('Cannot redefine property')) {
    console.log(chalk.yellow('🎤 Miku: Los prototipos ya están definidos, continuando... 🎵'))
  } else {
    throw error
  }
}


function ensureDirectoriesExist() {
  const dirs = ['./tmp', './MikuSession', './src/database'] 
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(chalk.bold.blue(`📁 Directorio creado: ${dir}`))
    }
  })
}


ensureDirectoriesExist()
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '')
global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']')


global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('./src/database/database.json'))
global.DATABASE = global.db; 


// Optimización de loadDatabase con cache
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async function() {
        if (!global.db.READ) {
          clearInterval(checkInterval);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 50); // Reducido de 100ms a 50ms
    });
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  
  try {
    await global.db.read();
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      settings: {},
      ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
  } catch (error) {
    console.error('Error al cargar la base de datos:', error);
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      settings: {},
    };
    global.db.chain = chain(global.db.data);
  } finally {
    global.db.READ = null;
  }
};
loadDatabase();

/* ------------------------------------------------*/


global.chatgpt = new Low(new JSONFile('./src/database/chatgpt.json'));
// Optimización de loadChatgptDB con cache
global.loadChatgptDB = async function loadChatgptDB() {
  if (global.chatgpt.READ) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async function() {
        if (!global.chatgpt.READ) {
          clearInterval(checkInterval);
          resolve(global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data);
        }
      }, 50); // Reducido de 100ms a 50ms
    });
  }
  if (global.chatgpt.data !== null) return;
  global.chatgpt.READ = true;
  
  try {
    await global.chatgpt.read();
    global.chatgpt.data = {
      users: {},
      ...(global.chatgpt.data || {}),
    };
    global.chatgpt.chain = lodash.chain(global.chatgpt.data);
  } catch (error) {
    console.error('Error al cargar ChatGPT DB:', error);
    global.chatgpt.data = { users: {} };
    global.chatgpt.chain = lodash.chain(global.chatgpt.data);
  } finally {
    global.chatgpt.READ = null;
  }
};
loadChatgptDB();

global.creds = 'creds.json'
global.authFile = 'MikuSession'
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = new Map()
const msgRetryCounterCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }) 
const userDevicesCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 }) 
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

const question = (texto) => {
  rl.clearLine(rl.input, 0)
  return new Promise((resolver) => {
    rl.question(texto, (respuesta) => {
      rl.clearLine(rl.input, 0)
      resolver(respuesta.trim())
    })
  })
}

let opcion
if (methodCodeQR) {
  opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
  do {
    let lineM = '┄╴───┈┈┈┈──┈┈┈┈───┈╴'
    opcion = await question(`╭${lineM}  
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}
│ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan("MÉTODO DE VINCULACIÓN")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}   
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}     
│ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`⇢  Opción 1:`)} ${chalk.greenBright("Código QR")}
│ ${chalk.blueBright('┊')} ${chalk.bold.redBright(`⇢  Opción 2:`)} ${chalk.greenBright("Codígo de 8 digitos")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}
│ ${chalk.blueBright('╭┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')}     
│ ${chalk.blueBright('┊')} ${chalk.italic.magenta("Escriba solo el numero de")}
│ ${chalk.blueBright('┊')} ${chalk.italic.magenta("La opcion para conectarse")}
│ ${chalk.blueBright('╰┄┈┅┈┄┈┅┈┄┅┈┄┈┅┄┈┅┈┄')} 
│ ${chalk.italic.red(`Cebollin 🌱`)}
╰${lineM}\n${chalk.bold.magentaBright('---> ')}`)
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`NO SE PERMITE NÚMEROS QUE NO SEAN ${chalk.bold.greenBright("1")} O ${chalk.bold.greenBright("2")}, TAMPOCO LETRAS O SÍMBOLOS ESPECIALES.\n${chalk.bold.yellowBright("CONSEJO: COPIE EL NÚMERO DE LA OPCIÓN Y PÉGUELO EN LA CONSOLA.")}`))
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu", // "Closing stable open"
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=", // "Closing open session"
  "RmFpbGVkIHRvIGRlY3J5cHQ=", // "Failed to decrypt"
  "U2Vzc2lvbiBlcnJvcg==", // "Session error"
  "RXJyb3I6IEJhZCBNQUM=", // "Error: Bad MAC" 
  "RGVjcnlwdGVkIG1lc3NhZ2U=" // "Decrypted message" 
]

console.info = () => {} 
console.debug = () => {} 
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))

const connectionOptions = {
  logger: pino({ level: "fatal" }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile, 
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  browser: opcion == '1' ? Browsers.macOS("Desktop") : methodCodeQR ? Browsers.macOS("Desktop") : Browsers.macOS("Chrome"),
  version: version,
  generateHighQualityLinkPreview: true,

  markOnlineOnConnect: true,
  syncFullHistory: false,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 30000,
  connectTimeoutMs: 60000,
  qrTimeout: 45000,
};

global.conn = makeWASocket(connectionOptions)
if (!fs.existsSync(`./${authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright("CONSEJO: Copie el número de WhatsApp y péguelo en la consola.")}\n${chalk.bold.yellowBright("Ejemplo: +51988514570")}\n${chalk.bold.magentaBright('---> ')}`)))
          phoneNumber = phoneNumber.replace(/\D/g,'')
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = `+${phoneNumber}`
          }
        } while (!await isValidPhoneNumber(phoneNumber))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta('CÓDIGO DE VINCULACIÓN:')), chalk.bold.white(chalk.white(codeBot)))
        }, 2000)
      }
    }
  }
}

conn.isInit = false
conn.well = false


// Optimización de intervalos de limpieza
if (!opts['test']) {
  if (global.db) {
    // Intervalo optimizado para escribir base de datos
    setInterval(async () => {
      queueDatabaseWrite();
      
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmpDir = join(__dirname, 'tmp')
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true })
        }
        // Optimización: limpiar tmp solo si es necesario
        try {
          const files = fs.readdirSync(tmpDir);
          if (files.length > 10) { // Solo limpiar si hay más de 10 archivos
            tmp = [tmpDir]
            tmp.forEach(filename => {
              if (fs.existsSync(filename)) {
                cp.spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete'])
              }
            })
          }
        } catch (e) {
          console.error('Error limpiando tmp:', e);
        }
      }
    }, 45000) // Aumentado de 30s a 45s para reducir carga
  }
}


// Optimización de getMessage con cache mejorado
async function getMessage(key) {
  const cacheKey = key.id || key;
  
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey);
  }
  
  if (store) {
    try {
      const message = await store.getMessage(key);
      if (message) {
        messageCache.set(cacheKey, message, 300); // Cache por 5 minutos
        return message;
      }
    } catch (e) {
      console.log('Error obteniendo mensaje del store:', e);
    }
  }
  
  return {
    conversation: 'SimpleBot',
  }
}

async function connectionUpdate(update) {  
  const {connection, lastDisconnect, isNewLogin} = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date
  }
  if (global.db.data == null) loadDatabase()
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.bold.yellow(`\n🎤 MIKU: ESCANEA EL CÓDIGO QR - EXPIRA EN 45 SEGUNDOS 🎵`))
    }
  }
  if (connection == 'open') {
    console.log(chalk.bold.greenBright(`\n❒⸺⸺⸺⸺【• 🎤 MIKU CONECTADA 🎵 •】⸺⸺⸺⸺❒\n│\n│ 🟢 Miku se ha conectado con WhatsApp exitosamente.\n│\n❒⸺⸺⸺⸺【• 🎤 MIKU CONECTADA 🎵 •】⸺⸺⸺⸺❒`))
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      console.log(chalk.bold.cyanBright("🎤 MIKU: SIN CONEXIÓN, BORRA LA CARPETA ${global.authFile} Y ESCANEA EL CÓDIGO QR 🎵"))
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log(chalk.bold.magentaBright("╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹\n┆ 🎤 MIKU: CONEXIÓN CERRADA, RECONECTANDO... 🎵\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹"))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(chalk.bold.blueBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂\n┆ 🎤 MIKU: CONEXIÓN PERDIDA CON EL SERVIDOR, RECONECTANDO... 🎵\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂`))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(chalk.bold.yellowBright("╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗\n┆ 🎤 MIKU: CONEXIÓN REEMPLAZADA, SE HA ABIERTO OTRA NUEVA SESIÓN, POR FAVOR, CIERRA LA SESIÓN ACTUAL PRIMERO. 🎵\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗"))
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(chalk.bold.redBright(`\n🎤 MIKU: SIN CONEXIÓN, BORRA LA CARPETA ${global.authFile} Y ESCANEA EL CÓDIGO QR 🎵`))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.restartRequired) {
      console.log(chalk.bold.cyanBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓\n┆ ❇️ CONECTANDO AL SERVIDOR...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓`))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸\n┆ ⌛ TIEMPO DE CONEXIÓN AGOTADO, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸`))
      await global.reloadHandler(true).catch(console.error)
    } else {
      console.log(chalk.bold.redBright(`\n💙❗ RAZON DE DESCONEXIÓN DESCONOCIDA: ${reason || 'No encontrado'} >> ${connection || 'No encontrado'}`))
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');

// OPTIMIZACIÓN: ReloadHandler mejorado
global.reloadHandler = async function(restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch { }
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, {chats: oldChats});
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  const currentDateTime = new Date()
  const messageDateTime = new Date(conn.ev)
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
  }

  // Optimización: eventos con manejo de errores mejorado
  conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      await conn.handler(chatUpdate);
      queueDatabaseWrite(); 
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  });
  
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

const pluginFolder = global.__dirname(join(__dirname, '../plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` SE ACTULIZADO - '${filename}' CON ÉXITO`)
      else {
        conn.logger.warn(`SE ELIMINO UN ARCHIVO : '${filename}'`)
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`SE DETECTO UN NUEVO PLUGINS : '${filename}'`)
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`SE DETECTO UN ERROR DE SINTAXIS | SYNTAX ERROR WHILE LOADING '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`HAY UN ERROR REQUIERE EL PLUGINS '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })
    ]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
  Object.freeze(global.support);
}

function clearTmp() {
  const tmpDir = join(__dirname, 'tmp')
  try {
    // Crear el directorio tmp si no existe
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
      console.log(chalk.bold.blue(`\n╭» 📁 DIRECTORIO 📁\n│→ Carpeta tmp creada: ${tmpDir}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 📁✅`))
      return
    }
    const filenames = readdirSync(tmpDir)
    filenames.forEach(file => {
      try {
        const filePath = join(tmpDir, file)
        const stats = statSync(filePath)
        if (stats.isFile()) {
          unlinkSync(filePath)
        }
      } catch (err) {
        console.log(chalk.bold.yellow(`\n╭» ⚠️ ARCHIVO ⚠️\n│→ No se pudo eliminar: ${file}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⚠️`))
      }
    })
  } catch (err) {
    console.log(chalk.bold.red(`\n╭» 🔴 ERROR TMP 🔴\n│→ Error al limpiar tmp: ${err.message}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌`))
  }
}

function purgeSession() {
  try {
    if (!fs.existsSync("./MikuSession/")) {
      console.log(chalk.bold.yellow(`\n╭» 🟡 SESIÓN 🟡\n│→ Directorio MikuSession no existe\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 📁❌`))
      return
    }
    let prekey = []
    let directorio = readdirSync("./MikuSession/")
    let filesFolderPreKeys = directorio.filter(file => {
      return file.startsWith('pre-key-')
    })
    prekey = [...prekey, ...filesFolderPreKeys]
    filesFolderPreKeys.forEach(files => {
      try {
        unlinkSync(`./MikuSession/${files}`)
      } catch (err) {
        console.log(chalk.bold.red(`\n╭» 🔴 ERROR 🔴\n│→ No se pudo eliminar: ${files}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌`))
      }
    })
  } catch (err) {
    console.log(chalk.bold.red(`\n╭» 🔴 ERROR SESIÓN 🔴\n│→ ${err.message}\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌`))
  }
}

function purgeOldFiles() {
  const directories = ['./MikuSession/']
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = readdirSync(dir)
      files.forEach(file => {
        if (file !== 'creds.json') {
          const filePath = path.join(dir, file);
          try {
            unlinkSync(filePath)
            console.log(chalk.bold.green(`\n╭» 🟣 ARCHIVO 🟣\n│→ ${file} BORRADO CON ÉXITO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
          } catch (err) {
            console.log(chalk.bold.red(`\n╭» 🔴 ARCHIVO 🔴\n│→ ${file} NO SE LOGRÓ BORRAR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌\n` + err))
          }
        }
      })
    } else {
      console.log(chalk.bold.yellow(`\n╭» 📁 DIRECTORIO 📁\n│→ ${dir} NO EXISTE\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 📁❌`))
    }
  })
}

function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName]
  console[methodName] = function() {
    const message = arguments[0]
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
      arguments[0] = ""
    }
    originalConsoleMethod.apply(console, arguments)
  }
}


// Optimización de intervalos de limpieza con menor frecuencia
setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await clearTmp()
  console.log(chalk.bold.cyanBright(`\n╭» 🟢 MULTIMEDIA 🟢\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
}, 1000 * 60 * 6) // Aumentado de 4 min a 6 min

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return
  await purgeOldFiles()
  console.log(chalk.bold.cyanBright(`\n╭» 🟠 ARCHIVOS 🟠\n│→ ARCHIVOS RESIDUALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
}, 1000 * 60 * 15) // Aumentado de 10 min a 15 min


// Optimización del intervalo de actualización de estado
setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  try {
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const bio = `🎤 Hatsune Miku |「🕒」Aᥴ𝗍і᥎ᥲ: ${uptime} | 🎵 La diva virtual cantando para ti! 💙`;
    await conn?.updateProfileStatus(bio).catch((_) => _);
  } catch (error) {
    // Silenciar errores de estado para evitar spam en logs
  }
}, 90000); // Aumentado de 60s a 90s

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ️', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}

_quickTest().catch(console.error);

_quickTest().then(() => conn.logger.info(chalk.bold(`🎤 ♪ M I K U  L I S T A ♪ 🎵\n`.trim()))).catch(console.error)

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.bold.greenBright("Actualizado"))
  import(`${file}?update=${Date.now()}`)
})

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    // Si el número empieza con '+521' o '+52 1', quitar el '1'
    if (number.startsWith('+521')) {
      number = number.replace('+521', '+52'); // Cambiar +521 a +52
    } else if (number.startsWith('+52') && number[4] === '1') {
      number = number.replace('+52 1', '+52'); // Cambiar +52 1 a +52
    }
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (error) {
    return false
  }
}
