import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (!args[0]) return conn.reply(m.chat, `💙 Miku dice: ¡Necesito un link de TikTok con imágenes, nya! ✨🎵`, m, rcanal)
    if (!args[0].match(/tiktok/gi)) return conn.reply(m.chat, `💙 Ara ara~ Verifica que el link sea de TikTok, este debe ser válido! 🎶`, m, rcanal)
    
    await m.react('⏳')
    
    try {
        const response = await fetch(args[0], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        })
        
        const html = await response.text()
        const $ = cheerio.load(html)
        
        const scriptData = $('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').html()
        
        if (scriptData) {
            const jsonData = JSON.parse(scriptData)
            const videoData = jsonData.__DEFAULT_SCOPE__['webapp.video-detail']?.itemInfo?.itemStruct
            
            if (videoData && videoData.imagePost && videoData.imagePost.images) {
                // Mensaje inicial
                let initialMsg = '┏━━━━━━━━━━━━━━━━━━━━━┓\n'
                initialMsg += '┃🎵 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 𝐈𝐦𝐚𝐠𝐞 𝐃𝐋 🎵┃\n'
                initialMsg += '┗━━━━━━━━━━━━━━━━━━━━━━━┛\n'
                initialMsg += '╭─────────────────╮\n'
                initialMsg += '│🎶 𝐈𝐧𝐟𝐨 𝐝𝐞𝐥 𝐂𝐨𝐧𝐭𝐞𝐧𝐢𝐝𝐨 🎶│\n'
                initialMsg += '├─────────────────┤\n'
                initialMsg += `│👤 𝐂𝐫𝐞𝐚𝐝𝐨𝐫: ${videoData.author.nickname}\n`
                initialMsg += `│📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐜𝐢ó𝐧: ${videoData.desc}\n`
                initialMsg += `│🖼️ 𝐈𝐦á𝐠𝐞𝐧𝐞𝐬: ${videoData.imagePost.images.length}\n`
                initialMsg += '├─────────────────────┤\n'
                initialMsg += '│💙 Miku procesando imágenes...│\n'
                initialMsg += '│🎵 "¡Espera un momento, nya!" 🎵│\n'
                initialMsg += '╰─────────────────────╯\n'
                initialMsg += '(◕‿◕)♡ ♪～(´∀｀～)'
                
                await conn.reply(m.chat, initialMsg, m, rcanal)
                
                // Descargar todas las imágenes
                const imageBuffers = []
                const imagePromises = videoData.imagePost.images.map(async (image, index) => {
                    try {
                        const imageUrl = image.imageURL.urlList[0]
                        const imageResponse = await fetch(imageUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                                'Accept-Language': 'en-US,en;q=0.9',
                                'Accept-Encoding': 'gzip, deflate, br',
                                'Referer': 'https://www.tiktok.com/',
                                'Origin': 'https://www.tiktok.com',
                                'DNT': '1',
                                'Connection': 'keep-alive',
                                'Sec-Fetch-Dest': 'image',
                                'Sec-Fetch-Mode': 'no-cors',
                                'Sec-Fetch-Site': 'cross-site',
                            }
                        })
                        
                        if (imageResponse.ok) {
                            const imageBuffer = await imageResponse.buffer()
                            return {buffer: imageBuffer, index: index + 1, success: true}
                        } else {
                            console.log(`🎵 Miku: Error descargando imagen ${index + 1}: ${imageResponse.status}`)
                            return {buffer: null, index: index + 1, success: false}
                        }
                    } catch (error) {
                        console.log(`🎵 Miku: Error en imagen ${index + 1}:`, error)
                        return {buffer: null, index: index + 1, success: false}
                    }
                })
                
                const results = await Promise.all(imagePromises)
                const successfulImages = results.filter(result => result.success)
                
                if (successfulImages.length > 0) {
                    // Crear mensaje para el grupo de imágenes
                    let mediaCaption = '┏━━━━━━━━━━━━━━━━━━━━━━━┓\n'
                    mediaCaption += '┃🎵 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 𝐃𝐞𝐥𝐢𝐯𝐞𝐫𝐲 🎵┃\n'
                    mediaCaption += '┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n'
                    mediaCaption += '╭──────────────────────╮\n'
                    mediaCaption += '│🎶 𝐂𝐨𝐥𝐞𝐜𝐜𝐢ó𝐧 𝐝𝐞 𝐈𝐦á𝐠𝐞𝐧𝐞𝐬 🎶│\n'
                    mediaCaption += '├──────────────────────┤\n'
                    mediaCaption += `│📸 𝐓𝐨𝐭𝐚𝐥: ${successfulImages.length} imágenes\n`
                    mediaCaption += `│👤 𝐂𝐫𝐞𝐚𝐝𝐨𝐫: ${videoData.author.nickname}\n`
                    mediaCaption += '│📱 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦𝐚: TikTok\n'
                    mediaCaption += '│🎯 𝐂𝐚𝐥𝐢𝐝𝐚𝐝: HD\n'
                    mediaCaption += '├────────────────────────┤\n'
                    mediaCaption += '│🎵 "¡Todas las imágenes juntas!"│\n'
                    mediaCaption += '│💙 "¡Espero que te gusten, nya!"│\n'
                    mediaCaption += '╰────────────────────────╯\n'
                    mediaCaption += '♪(´▽｀)♪ 🎶～(´∀｀)～🎶\n'
                    mediaCaption += '💙 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 𝐒𝐭𝐲𝐥𝐞 💙'
                    
                    // Enviar todas las imágenes juntas
                    for (const imageResult of successfulImages) {
                        await conn.sendFile(m.chat, imageResult.buffer, `miku_tiktok_${imageResult.index}.jpg`, '', m, null, rcanal)
                    }
                    
                    // Mensaje final
                    let finalMsg = '┏━━━━━━━━━━━━━━━━━┓\n'
                    finalMsg += '┃🎵 𝐌𝐢𝐬𝐢ó𝐧 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚 🎵┃\n'
                    finalMsg += '┗━━━━━━━━━━━━━━━━━━━┛\n'
                    finalMsg += '╭─────────────────╮\n'
                    finalMsg += '│✨ 𝐑𝐞𝐬𝐮𝐦𝐞𝐧 𝐅𝐢𝐧𝐚𝐥 ✨│\n'
                    finalMsg += '├─────────────────┤\n'
                    finalMsg += `│📸 𝐄𝐧𝐯𝐢𝐚𝐝𝐚𝐬: ${successfulImages.length}/${videoData.imagePost.images.length}\n`
                    finalMsg += '│🎯 𝐄𝐬𝐭𝐚𝐝𝐨: Completado ✅\n'
                    finalMsg += '│🎵 𝐀𝐠𝐞𝐧𝐭𝐞: Hatsune Miku\n'
                    finalMsg += '├───────────────────────┤\n'
                    finalMsg += '│"¡Misión cumplida exitosamente!"│\n'
                    finalMsg += '│🎶 "¡Gracias por usarme, nya!" 🎶│\n'
                    finalMsg += '╰───────────────────────╯\n'
                    finalMsg += '💙🎵 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 🎵💙'
                    
                    await conn.reply(m.chat, finalMsg, m, rcanal)
                    await m.react('🎵')
                } else {
                    throw new Error('No se pudieron descargar las imágenes')
                }
                return
            }
        }
        
        throw new Error('No se encontraron imágenes')
        
    } catch (error) {
        console.error('Error:', error)
        await m.react('💔')
        
        let errorMsg = '┏━━━━━━━━━━━━━━━━━┓\n'
        errorMsg += '┃💔 𝐄𝐫𝐫𝐨𝐫 𝐃𝐞𝐭𝐞𝐜𝐭𝐚𝐝𝐨 💔┃\n'
        errorMsg += '┗━━━━━━━━━━━━━━━━━━━┛\n'
        errorMsg += '╭────────────────╮\n'
        errorMsg += '│⚠️ 𝐀𝐥𝐞𝐫𝐭𝐚 𝐌𝐢𝐤𝐮 ⚠️│\n'
        errorMsg += '├────────────────┤\n'
        errorMsg += '│🎵 "¡Oops! Algo salió mal, nya!"│\n'
        errorMsg += '│🔍 Verifica que el link tenga imágenes│\n'
        errorMsg += '│📱 Debe ser un link válido de TikTok│\n'
        errorMsg += '├──────────────────────┤\n'
        errorMsg += '│"¡Inténtalo de nuevo, por favor!"│\n'
        errorMsg += '│🎶 "No te rindas, nya!" (｡•́︿•̀｡)│\n'
        errorMsg += '╰──────────────────────╯\n'
        errorMsg += '💙🎵 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 🎵💙'
        
        conn.reply(m.chat, errorMsg, m, rcanal)
    }
}

handler.help = ['tiktokimg *<url tt>*']
handler.tags = ['downloader']
handler.command = ['tiktokimg', 'tiktokimgs', 'ttimg', 'ttimgs']
handler.register = true

export default handler
