import { BotOptimizer, performanceMonitor } from '../miku/optimizations.js';

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return m.reply('💙 *Solo el owner puede usar este comando.*');
    
    try {
        // Obtener estadísticas del sistema
        const systemHealth = BotOptimizer.checkSystemHealth();
        const perfStats = performanceMonitor.getStats();
        
        // Formatear tiempo de actividad
        const formatUptime = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
        };
        
        let message = `🔧 *ESTADO DEL SISTEMA HATSUNE MIKU* 🎤\n\n`;
        
        // 📊 Estadísticas de memoria
        message += `📊 *MEMORIA:*\n`;
        message += `├ RSS: ${systemHealth.memory.rss} MB\n`;
        message += `├ Heap Total: ${systemHealth.memory.heapTotal} MB\n`;
        message += `├ Heap Used: ${systemHealth.memory.heapUsed} MB\n`;
        message += `└ External: ${systemHealth.memory.external} MB\n\n`;
        
        // ⚡ Estadísticas de rendimiento
        message += `⚡ *RENDIMIENTO:*\n`;
        message += `├ Tiempo activo: ${formatUptime(perfStats.uptime)}\n`;
        message += `├ Mensajes procesados: ${perfStats.messagesProcessed}\n`;
        message += `├ Comandos ejecutados: ${perfStats.commandsExecuted}\n`;
        message += `├ Errores ocurridos: ${perfStats.errorsOccurred}\n`;
        message += `├ Mensajes/segundo: ${perfStats.messagesPerSecond}\n`;
        message += `└ Cache hit rate: ${perfStats.cacheHitRate}%\n\n`;
        
        // 💾 Estadísticas de cache
        message += `💾 *CACHE:*\n`;
        message += `├ Usuarios: ${systemHealth.cache.users.keys} entradas\n`;
        message += `├ Grupos: ${systemHealth.cache.groups.keys} entradas\n`;
        message += `├ Comandos: ${systemHealth.cache.commands.keys} entradas\n`;
        message += `└ Mensajes: ${systemHealth.cache.messages.keys} entradas\n\n`;
        
        // 🎯 Estado general
        const memoryUsagePercent = (systemHealth.memory.heapUsed / systemHealth.memory.heapTotal) * 100;
        let status = '🟢 EXCELENTE';
        
        if (memoryUsagePercent > 80) {
            status = '🔴 CRÍTICO';
        } else if (memoryUsagePercent > 60) {
            status = '🟡 MODERADO';
        } else if (memoryUsagePercent > 40) {
            status = '🟠 NORMAL';
        }
        
        message += `🎯 *ESTADO GENERAL:* ${status}\n`;
        message += `📈 *Uso de memoria:* ${memoryUsagePercent.toFixed(1)}%\n\n`;
        
        // 💡 Recomendaciones
        message += `💡 *RECOMENDACIONES:*\n`;
        if (memoryUsagePercent > 70) {
            message += `⚠️ Considerar reiniciar el bot\n`;
        }
        if (perfStats.errorsOccurred > 10) {
            message += `⚠️ Revisar logs de errores\n`;
        }
        if (perfStats.cacheHitRate < 50) {
            message += `⚠️ Optimizar configuración de cache\n`;
        }
        if (perfStats.messagesPerSecond > 5) {
            message += `✅ Rendimiento óptimo\n`;
        }
        
        message += `\n🎵 *Hatsune Miku - Sistema optimizado activo* 💙`;
        
        await m.reply(message);
        
    } catch (error) {
        console.error('Error en comando de monitoreo:', error);
        await m.reply('❌ Error al obtener estadísticas del sistema.');
    }
};

handler.help = ['status', 'sistema', 'monitor'];
handler.tags = ['owner'];
handler.command = /^(status|sistema|monitor|stats)$/i;
handler.owner = true;

export default handler;
