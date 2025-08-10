let cooldowns = {}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  segundos %= 3600
  let minutos = Math.floor(segundos / 60)
  segundos %= 60
  return `${horas ? horas + 'h ' : ''}${minutos ? minutos + 'm ' : ''}${segundos}s`
}

function toNum(number) {
  return new Intl.NumberFormat('en-US').format(number)
}

const trabajo = [
  "Trabajaste como programador y ganaste",
  "Trabajaste en una empresa y ganaste",
  "Trabajaste como freelancer y ganaste",
  "Trabajaste en un restaurante y ganaste",
  "Trabajaste como diseñador y ganaste",
  "Trabajaste como profesor y ganaste",
  "Trabajaste en construcción y ganaste",
  "Trabajaste como médico y ganaste"
]

let handler = async (m, { conn, isPrems }) => {
  let user = globalThis.db.data.users[m.sender]
  let tiempo = 5 * 60
  
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `💙 Debes esperar ${tiempo2} para trabajar de nuevo en este Grupo.`, m)
    return
  }
  
  let rsl = Math.floor(Math.random() * 5000)
  cooldowns[m.sender] = Date.now()
  
  const monedaText = globalThis.monedas || "XP"
  
  await conn.reply(m.chat, `💙 ${pickRandom(trabajo)} ${toNum(rsl)} ( ${rsl} ) ${monedaText}💫.`, m)
  
  user.exp += rsl
}

handler.help = ['w', 'work']
handler.tags = ['rpg']
handler.command = ['w','work','trabajar']
handler.register = true
export default handler
