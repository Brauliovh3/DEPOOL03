// ⚡ OPTIMIZACIONES PARA HATSUNE MIKU BOT ⚡
// Configuraciones optimizadas para mejorar el rendimiento

import NodeCache from 'node-cache';

// 🚀 CONFIGURACIONES DE CACHE OPTIMIZADAS
export const cacheConfig = {
  // Cache para usuarios (5 minutos)
  users: new NodeCache({ 
    stdTTL: 300, 
    checkperiod: 60,
    maxKeys: 1000 // Límite para evitar memoria excesiva
  }),
  
  // Cache para grupos (10 minutos)
  groups: new NodeCache({ 
    stdTTL: 600, 
    checkperiod: 120,
    maxKeys: 500
  }),
  
  // Cache para comandos (2 minutos)
  commands: new NodeCache({ 
    stdTTL: 120, 
    checkperiod: 30,
    maxKeys: 200
  }),
  
  // Cache para mensajes (5 minutos)
  messages: new NodeCache({ 
    stdTTL: 300, 
    checkperiod: 60,
    maxKeys: 500
  })
};

// ⚙️ CONFIGURACIONES DE INTERVALOS OPTIMIZADOS
export const intervalConfig = {
  // Escritura de base de datos (cada 45 segundos)
  database: 45000,
  
  // Limpieza de archivos temporales (cada 6 minutos)
  tempCleanup: 360000,
  
  // Limpieza de archivos residuales (cada 15 minutos)
  fileCleanup: 900000,
  
  // Actualización de estado del bot (cada 90 segundos)
  statusUpdate: 90000,
  
  // Cola de mensajes (reducido a 3 segundos)
  messageQueue: 3000
};

// 🔧 CONFIGURACIONES DE PERFORMANCE
export const performanceConfig = {
  // Límite de archivos en tmp antes de limpiar
  tmpFileLimit: 10,
  
  // Timeout para operaciones de base de datos
  dbTimeout: 1500,
  
  // Tamaño máximo de cache por usuario
  maxCacheSize: 1000,
  
  // Tiempo de vida de cache de validación
  validationCacheTTL: 120,
  
  // Límite de plugins cargados simultáneamente
  maxPlugins: 100
};

// 🎯 FUNCIONES DE OPTIMIZACIÓN
export class BotOptimizer {
  
  // Optimizar datos de usuario
  static optimizeUserData(user, userId) {
    const defaults = {
      afk: -1,
      afkReason: '',
      name: '',
      age: 0,
      bank: 0,
      banned: false,
      BannedReason: '',
      Banneduser: false,
      coin: 0,
      diamond: 3,
      joincount: 1,
      lastadventure: 0,
      lastcoins: 0,
      lastclaim: 0,
      lastcode: 0,
      lastcofre: 0,
      lastdiamantes: 0,
      lastduel: 0,
      lastpago: 0,
      lastrob: 0,
      level: 0,
      cebollines: 10,
      money: 100,
      muto: false,
      premium: false,
      premiumTime: 0,
      registered: false,
      regTime: -1,
      rendang: 0,
      exp: 0,
      role: 'Nuv',
      warn: 0
    };
    
    return { ...defaults, ...user };
  }
  
  // Optimizar datos de grupo
  static optimizeGroupData(chat) {
    const defaults = {
      isBanned: false,
      welcome: true,
      detect: true,
      sWelcome: '',
      sBye: '',
      sPromote: '',
      sDemote: '', 
      sAutoresponder: '',
      sCondition: JSON.stringify([{ grupo: { usuario: [], condicion: [], admin: '' }, prefijos: []}]), 
      autoresponder: false,
      autoAceptar: false,
      nsfw: false,
      antiLink: false,
      modoadmin: false,
      expired: 0,
    };
    
    return { ...defaults, ...chat };
  }
  
  // Limpiar cache expirado
  static cleanExpiredCache() {
    Object.values(cacheConfig).forEach(cache => {
      const keys = cache.keys();
      keys.forEach(key => {
        if (cache.getTtl(key) < Date.now()) {
          cache.del(key);
        }
      });
    });
  }
  
  // Obtener estadísticas de memoria
  static getMemoryStats() {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
  }
  
  // Verificar salud del sistema
  static checkSystemHealth() {
    const stats = this.getMemoryStats();
    const cacheStats = {
      users: cacheConfig.users.getStats(),
      groups: cacheConfig.groups.getStats(),
      commands: cacheConfig.commands.getStats(),
      messages: cacheConfig.messages.getStats()
    };
    
    return {
      memory: stats,
      cache: cacheStats,
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}

// 📊 MONITOR DE RENDIMIENTO
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      messagesProcessed: 0,
      commandsExecuted: 0,
      errorsOccurred: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.startTime = Date.now();
  }
  
  // Incrementar contador de mensajes
  incrementMessages() {
    this.metrics.messagesProcessed++;
  }
  
  // Incrementar contador de comandos
  incrementCommands() {
    this.metrics.commandsExecuted++;
  }
  
  // Incrementar contador de errores
  incrementErrors() {
    this.metrics.errorsOccurred++;
  }
  
  // Registrar hit de cache
  cacheHit() {
    this.metrics.cacheHits++;
  }
  
  // Registrar miss de cache
  cacheMiss() {
    this.metrics.cacheMisses++;
  }
  
  // Obtener estadísticas
  getStats() {
    const uptime = Date.now() - this.startTime;
    const messagesPerSecond = this.metrics.messagesProcessed / (uptime / 1000);
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    return {
      ...this.metrics,
      uptime,
      messagesPerSecond: Math.round(messagesPerSecond * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100 || 0
    };
  }
  
  // Resetear métricas
  reset() {
    this.metrics = {
      messagesProcessed: 0,
      commandsExecuted: 0,
      errorsOccurred: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.startTime = Date.now();
  }
}

// Instancia global del monitor
export const performanceMonitor = new PerformanceMonitor();

// 🛠️ UTILIDADES DE OPTIMIZACIÓN
export const OptimizationUtils = {
  
  // Debounce para funciones que se ejecutan muy frecuentemente
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle para limitar la frecuencia de ejecución
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Función para limpiar objetos grandes
  deepClean(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth || typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const cleaned = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = this.deepClean(obj[key], maxDepth, currentDepth + 1);
      }
    }
    
    return cleaned;
  }
};

console.log('🚀 Optimizaciones de Hatsune Miku Bot cargadas correctamente!');
