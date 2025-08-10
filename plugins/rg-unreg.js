let handler = async (m, { conn, text }) => {
  let user = global.db.data.users[m.sender]
  
  if (!user) return conn.reply(m.chat, `*💙 No se encontraron datos para eliminar*`, m)
  
  
  let username = user.name || m.name || m.sender.split('@')[0]
  let userId = m.sender
  
  
  delete global.db.data.users[m.sender]
  
 
  global.db.data.users[m.sender] = {
    unregTime: Date.now(),
    registered: false
  }
  
  
  global.db.write()
  
  return conn.reply(m.chat, `*💙 ${username}, todos tus datos han sido eliminados completamente de mi base de datos*\n*• XP, nivel, monedas, registros y otros datos personales han sido borrados*\n*• Deberás esperar 24 horas antes de poder registrarte nuevamente*`, m)
}
handler.help = ['unreg']
handler.tags = ['rg']
handler.command = ['unreg']
handler.register = true
export default handler
