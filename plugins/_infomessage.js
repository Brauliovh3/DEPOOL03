import { default as WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'
import ws from 'ws'
import chalk from 'chalk'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isBotAdmin, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return

  const usuario = `@${m.sender.split`@`[0]}`
  const groupName = (await conn.groupMetadata(m.chat)).subject
  const groupAdmins = participants.filter((p) => p.admin)
  const chat = global.db.data.chats[m.chat]
  const mentionsString = [m.sender, ...(m.messageStubParameters || []), ...groupAdmins.map((v) => v.id)]
  const mentionsContentM = [m.sender, ...(m.messageStubParameters || [])]
  const vn = './src/media/miku.mp3'
  const vn2 = 'https://qu.ax/OzTbp.mp3'
  const redes = `github.com/Brauliovh3`
  const icons = 'https://a.storyblok.com/f/178900/1200x676/b1e0d587bd/gekijouban_project_sekai_kowareta_sekai_to_utaenai_miku_hero.jpg'

  const getMentionedJid = () => {
    return (m.messageStubParameters || []).map(param => `${param}@s.whatsapp.net`)
  }

  if (m.messageStubParameters && m.messageStubParameters[0]) {
    let who = m.messageStubParameters[0] + '@s.whatsapp.net'
    let user = global.db.data.users[who]
    let userName = user ? user.name : await conn.getName(who)
    let adiosbye = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icons)
    let adi = await (await fetch(adiosbye)).buffer()
    let ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icons)
    let welc = await (await fetch(ppUrl)).buffer()
    let admingp = `💙 @${m.messageStubParameters[0].split`@`[0]} ha sido promovido a Administrador por ${usuario}`
    let noadmingp = `💙 @${m.messageStubParameters[0].split`@`[0]} ha sido degradado de Administrador por ${usuario}`

    if (chat.detect && m.messageStubType == 2) {
      try {
        const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
        const sessionPath = './MikuSession/'
        if (existsSync(sessionPath)) {
          for (const file of await fs.readdir(sessionPath)) {
            if (file.includes(uniqid)) {
              await fs.unlink(path.join(sessionPath, file))
              console.log(`${chalk.yellow.bold('[ 💙 Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
                `${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`)
            }
          }
        }
      } catch (error) {
        console.error('Error cleaning session files:', error)
      }
    }

    if (chat.detect && m.messageStubType == 29) {
      await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] })
      return
    }

    if (chat.detect && m.messageStubType == 30) {
      await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] })
      return
    }

    if (chat.welcome && m.messageStubType === 27) {
      await conn.sendMessage(m.chat, { 
        audio: { url: vn }, 
        contextInfo: { 
          mentionedJid: getMentionedJid(),
          externalAdReply: { 
            title: `💙Ｗ Ｅ Ｌ Ｃ Ｏ Ｍ Ｅ💙`, 
            body: `${userName}`, 
            previewType: "PHOTO", 
            thumbnailUrl: null,
            thumbnail: welc, 
            sourceUrl: redes, 
            showAdAttribution: true
          }
        }, 
        seconds: '4556', 
        ptt: true, 
        mimetype: 'audio/mpeg', 
        fileName: `bienvenida.mp3` 
      }, { ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 })
    }

    if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
      await conn.sendMessage(m.chat, { 
        audio: { url: vn2 }, 
        contextInfo: {
          mentionedJid: getMentionedJid(),
          externalAdReply: { 
            title: `🤚Ａ Ｄ Ｉ Ｏ Ｓ🤚`, 
            body: `${userName}, se despide.`, 
            previewType: "PHOTO", 
            thumbnailUrl: null,
            thumbnail: adi, 
            sourceUrl: redes, 
            showAdAttribution: true
          }
        }, 
        seconds: '4556', 
        ptt: true, 
        mimetype: 'audio/mpeg', 
        fileName: `bye.mp3` 
      }, { ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 })
    }
  }

  if (m.messageStubType && m.messageStubType != 2) {
    console.log({
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType],
    })
  }
}

export default handler
