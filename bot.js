const Discord = require('discord.js')
const fs = require('fs')
const { prefix, token } = require('./config.json')
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

const client = new Discord.Client()
client.commands = new Discord.Collection()

client.once('ready', () => {
  client.user.setActivity('42, number of life', { type: 'PLAYING' }).then(presence => console.log(`Activity set to ${presence.activities[0].name}`))

  console.log('\n\nLoading commands ...\n')
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
    console.log(`./commands/${file}`)
  }
  console.log('\n\nLoading events ...\n')
  for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    console.log(`./events/${file}`)
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
  }
  console.log('\nBot is ready !')
})

client.on('message', async message => {
  if (message.author.bot) return
  if (message.channel.type !== 'dm') {
    if (message.content.startsWith(prefix)) {
      const cmd = message.content.split(' ')[0].substring(1)
      if (client.commands.get(cmd)) {
        if (client.commands.get(cmd).authorized_role.includes('everyone') || message.member.roles.cache.some(r => client.commands.get(cmd).authorized_role.includes(r.name))) {
          if (client.commands.get(cmd).enable) {
            client.commands.get(cmd).execute(message, message.content.split(' '))
            console.log(message.author.username + ' > ' + message.content)
          } else { message.reply('Sorry, this command is actualy disabled.') }
        } else { message.reply('Sorry you cannot execute this command, the bot is in development, you will be informed when it is available !').then(msg => msg.delete({ timeout: 10000 })) }
      }
    }
  } else {
    message.reply('Sorry I do not accept private messages, open a ticket!')
  }
})

client.login(token)

exports.client = client
