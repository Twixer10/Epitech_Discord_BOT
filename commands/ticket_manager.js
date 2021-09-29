const Discord = require('discord.js')
const { createPool } = require('mysql')
const client = require('../bot')
const { channels, prefix } = require('../config.json')

/** 
 * This is the function to create a new ticket
 * @param {Discord.Message} message This is the message that contains a command
 * @async
 */
async function createTicket (message) {
  const user = message.author
  const channelName = 'ticket-' + user.id

  const newTiecket = new Discord.MessageEmbed()
    .setColor('#032204')
    .setTitle('Welcome in your ticket !')
    .setAuthor(user.id, message.guild.iconURL())
    .setDescription('Hey, ' + user.username + ', welcome in your ticket, you can ask your question. After that, the administration will be answer in a moment...')
    .setThumbnail(message.guild.iconURL())
    .addFields({ name: '!ticket close', value: 'Close your ticket', inline: false })
    .setImage(message.guild.iconURL())
    .setTimestamp()
    .setFooter('Don\'t spam !', message.guild.iconURL())

  const channel = await message.guild.channels.create(channelName, {
    parent: channels.ticket.category_id,
    permissionOverwrites: [
      { deny: 'VIEW_CHANNEL', id: message.guild.id },
      { allow: 'VIEW_CHANNEL', id: message.author.id }
    ]
  })
  channel.send('Hey <@&701809575325597717>, there are a new ticket for you !\n\n')
  channel.send(newTiecket)
}

/** 
 * This is the function to close your ticket
 * @param {Discord.Message} message This is the message that contains a command
 */
function closeTicket (message) {
  if (message.channel.parent.id === channels.ticket.category_id) {
    const user = message.author.id
    const channelUser = message.channel.name.split('-')[1]
    if (message.channel.name.split('-')[0] === 'ticket' && (user === channelUser || message.member.roles.cache.some(r => ['Adm'].includes(r.name)))) {
      message.channel.delete()
    }
  }
}

/** 
 * This is the function to create the message embed to display the help command
 * @param {Discord.Message} message This is the message that contains a command
 */
function help (message) {
  const helpmsg = new Discord.MessageEmbed()
    .setColor('#3bf646')
    .setTitle('Help : All Commands of Ticket')
    .setAuthor(message.author.username, message.author.avatarURL())
    .setDescription('Below all the commands associated with the ticket command\n\n')
    .setThumbnail(client.client.user.avatarURL())
    .setTimestamp()
    .setFooter('Don\'t spam !', message.guild.iconURL())
    .addFields({ name: prefix + 'ticket', value: 'This command allows you to open a ticket, it can be executed only in the channel <#' + channels.command.channel_command_id + '>', inline: false })
    .addFields({ name: prefix + 'ticket close', value: 'This command allows you to close a ticket, it can be executed only in your ticket channel', inline: false })
  message.reply(helpmsg)
}

/** @module command/ticket */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'ticket',
  /** This is the description of the command
   * @type {string}
   */
  description: 'Main command to manage ticket.',
  /** The list of roles in a table
   * @type {Array<string>}
   */
  authorized_role: ['everyone'],
  /** The boolean is for activate or desactivate the command
   * @type {Array<string>}
   */
  enable: true,
  /** This is where the code has to be executed for each command that takes place
   * @param {Discord.Message} message This is the message that contains a command
   * @param {Array<string>} args The content of the message parser in an array with spaces separator
   * @static
   */
  execute (message, args) {
    if (args[1] === 'help') {
      help(message)
      return
    }
    if (args.length === 1) {
      const user = message.author
      const channelName = 'ticket-' + user.id
      let sucre = true

      message.guild.channels.cache.forEach(channel => {
        if (channel.name === channelName) {
          message.reply('Sorry you have already open an ticket, please close it before open a new ticket !')
          sucre = false
        }
      })
      if (sucre) { createTicket(message) }
    } else if (args.length === 2 && args[1] === 'close') {
      closeTicket(message)
    } else {
      message.reply('Error, parsing command run **!ticket help** for help')
    }
  }
}
