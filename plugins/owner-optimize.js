import { BotOptimizer, cacheConfig, performanceMonitor } from '../miku/optimizations.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn, isOwner, args }) => {
    if (!isOwner) return m.reply('💙 *Solo el owner puede usar este comando.*');
    
    const action = args[0]?.toLowerCase();
    
    switch (action) {
        case 'cache':
            // Limpiar cache
            try {
                Object.values(cacheConfig).forEach(cache => cache.flushAll());
                BotOptimizer.cleanExpiredCache();
                await m.reply('🧹 *Cache limpiado exitosamente*\n✅ Todos los caches han sido vaciados.');
            } catch (error) {
                await m.reply('❌ Error al limpiar cache: ' + error.message);
            }
            break;
            
        case 'memory':
            // Forzar garbage collection
            try {
                if (global.gc) {
                    global.gc();
                    await m.reply('🔄 *Garbage Collection ejecutado*\n✅ Memoria liberada exitosamente.');
                } else {
                    await m.reply('⚠️ Garbage Collection no disponible.\nInicia el bot con --expose-gc para habilitar esta función.');
                }
            } catch (error) {
                await m.reply('❌ Error en garbage collection: ' + error.message);
            }
            break;
            
        case 'tmp':
            // Limpiar archivos temporales
            try {
                await execAsync('find ./tmp -type f -delete 2>/dev/null || del /q tmp\\* 2>nul');
                await m.reply('🗂️ *Archivos temporales limpiados*\n✅ Carpeta tmp vaciada.');
            } catch (error) {
                await m.reply('❌ Error al limpiar tmp: ' + error.message);
            }
            break;
            
        case 'db':
            // Optimizar base de datos
            try {
                await global.db.write();
                await m.reply('💾 *Base de datos optimizada*\n✅ Datos guardados y sincronizados.');
            } catch (error) {
                await m.reply('❌ Error al optimizar DB: ' + error.message);
            }
            break;
            
        case 'stats':
            // Resetear estadísticas
            try {
                performanceMonitor.reset();
                await m.reply('📊 *Estadísticas reseteadas*\n✅ Contadores de rendimiento reiniciados.');
            } catch (error) {
                await m.reply('❌ Error al resetear stats: ' + error.message);
            }
            break;
            
        case 'full':
            // Optimización completa
            try {
                await m.reply('🚀 *Iniciando optimización completa...*');
                
                // 1. Limpiar cache
                Object.values(cacheConfig).forEach(cache => cache.flushAll());
                
                // 2. Garbage collection
                if (global.gc) global.gc();
                
                // 3. Limpiar tmp
                await execAsync('find ./tmp -type f -delete 2>/dev/null || del /q tmp\\* 2>nul');
                
                // 4. Optimizar DB
                await global.db.write();
                
                // 5. Resetear stats
                performanceMonitor.reset();
                
                const stats = BotOptimizer.getMemoryStats();
                
                let message = `✅ *OPTIMIZACIÓN COMPLETA FINALIZADA*\n\n`;
                message += `🧹 Cache limpiado\n`;
                message += `🔄 Memoria liberada\n`;
                message += `🗂️ Archivos temporales eliminados\n`;
                message += `💾 Base de datos optimizada\n`;
                message += `📊 Estadísticas reseteadas\n\n`;
                message += `📈 *Memoria actual:*\n`;
                message += `├ RSS: ${stats.rss} MB\n`;
                message += `├ Heap Used: ${stats.heapUsed} MB\n`;
                message += `└ External: ${stats.external} MB\n\n`;
                message += `🎵 *¡Hatsune Miku optimizada y lista!* 💙`;
                
                await m.reply(message);
                
            } catch (error) {
                await m.reply('❌ Error en optimización completa: ' + error.message);
            }
            break;
            
        default:
            let helpMessage = `🔧 *COMANDOS DE OPTIMIZACIÓN MIKU* 🎤\n\n`;
            helpMessage += `📝 *Uso:* .optimize [opción]\n\n`;
            helpMessage += `🛠️ *Opciones disponibles:*\n`;
            helpMessage += `├ \`cache\` - Limpiar cache del sistema\n`;
            helpMessage += `├ \`memory\` - Liberar memoria (garbage collection)\n`;
            helpMessage += `├ \`tmp\` - Limpiar archivos temporales\n`;
            helpMessage += `├ \`db\` - Optimizar base de datos\n`;
            helpMessage += `├ \`stats\` - Resetear estadísticas\n`;
            helpMessage += `└ \`full\` - Optimización completa\n\n`;
            helpMessage += `💡 *Ejemplo:* .optimize full\n`;
            helpMessage += `⚠️ *Nota:* Solo usar cuando sea necesario\n\n`;
            helpMessage += `🎵 *Sistema de optimización Hatsune Miku* 💙`;
            
            await m.reply(helpMessage);
            break;
    }
};

handler.help = ['optimize'];
handler.tags = ['owner'];
handler.command = /^(optimize|optimizar|clean|limpiar)$/i;
handler.owner = true;

export default handler;
