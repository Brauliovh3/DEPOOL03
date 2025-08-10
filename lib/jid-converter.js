/**
 * Convierte un número de teléfono al formato JID de WhatsApp
 * @param {string|number} numero - Número de teléfono
 * @returns {string} - JID en formato @s.whatsapp.net
 */
export function numeroAJid(numero) {
    // Convertir a string y limpiar el número (solo números)
    let numeroLimpio = numero.toString().replace(/[^0-9]/g, '');
    
    // Agregar el sufijo de WhatsApp
    return numeroLimpio + '@s.whatsapp.net';
}

/**
 * Convierte un JID de WhatsApp a número limpio
 * @param {string} jid - JID en formato @s.whatsapp.net
 * @returns {string} - Solo el número sin @s.whatsapp.net
 */
export function jidANumero(jid) {
    return jid.replace('@s.whatsapp.net', '');
}

/**
 * Verifica si un string es un JID válido de WhatsApp
 * @param {string} jid - String a verificar
 * @returns {boolean} - true si es un JID válido
 */
export function esJidValido(jid) {
    return typeof jid === 'string' && jid.includes('@s.whatsapp.net');
}

// Ejemplos de uso:
// console.log(numeroAJid('51988514570')); // '51988514570@s.whatsapp.net'
// console.log(numeroAJid('+51 988 514 570')); // '51988514570@s.whatsapp.net'
// console.log(jidANumero('51988514570@s.whatsapp.net')); // '51988514570'
