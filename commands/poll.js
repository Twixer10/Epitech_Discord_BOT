const Discord = require('discord.js')
const { prefix } = require('../config.json')
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '✅', '❌']

/** 
 * This function it's used to parse arguments
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 * @return {String} The variable correctly parse to be used
 */
function parseArgs (args) {
  let str = ''
  let finish = ''
  let count = 0
  for (let i = 1; i !== args.length; i++) {
    str += args[i]
    if (i !== args.length - 1) { str += ' ' }
  }
  finish = str.trim().split('|')
  for (; finish[count]; count++);
  if (finish[0] !== 'help' && (count < 3 || count > 10)) { finish = 'ERROR' }
  return (finish)
}

/** 
 * This function it's used to generate the help MessageEmbed of poll
 * @param {Discord.Message} message This is the message that contains a command
 */
function help (message) {
  const helpmsg = new Discord.MessageEmbed()
    .setColor('#3bf646')
    .setTitle('Help : How works Poll')
    .setAuthor(message.author.username, message.author.avatarURL())
    .setDescription('This command allow you to make your own poll.\n\n')
    .setThumbnail('https://www.leplaisirdapprendre.com/papillon/wp-content/uploads/2017/03/strawpollde-la-cration-de-sondage-rapidement-1490490456gnk84.png')
    .setTimestamp()
    .setFooter('Don\'t spam !', message.guild.iconURL())
    .addFields({ name: prefix + 'poll <question> | <choice 1> | <choice 2>', value: 'This command allows you to generate a strawpoll with two unique choices.', inline: false })
    .addFields({ name: prefix + 'poll <question> | <choice 1> | <...> | <choice 9>', value: 'This command allows you to generate a strawpoll with multiple choices ranging from 1 to 9.', inline: false })
  message.reply(helpmsg)
}

/** 
 * This is the function to generate a basic MessageEmbed sample
 * @param {Array<string>} ask The content of the message parser in an array with spaces separator
 * @param {Discord.Message} message This is the message that contains a command
 */
function createBasicEmbed (ask, message) {
  const NewEmbed = new Discord.MessageEmbed()
    .setColor('#FFA500')
    .setTitle(`__**Question: ${ask}**__`)
    .setFooter(`Poll created by ${message.member.user.tag}.`, message.author.avatarURL())
    .setThumbnail('https://www.leplaisirdapprendre.com/papillon/wp-content/uploads/2017/03/strawpollde-la-cration-de-sondage-rapidement-1490490456gnk84.png')
    .setTimestamp()
  return NewEmbed
}

/** 
 * This is the function to generate a MessageEmbed sample for Double poll
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 * @param {Discord.MessageEmbed} embed The basic sample
 */
function doubleChoice (message, args, embed) {
  for (let i = 1; i !== args.length; i++) {
    embed.addFields({ name: `Choice ${emoji[i + 8]}`, value: `${args[i]}\n `, inline: false })
  }
  message.channel.send(embed).then(embedMsg => {
    for (let i = 1; i !== args[1].length - 2; i++) {
      embedMsg.react(emoji[i + 8])
    }
  })
}

/** 
 * This is the function to generate a MessageEmbed sample for multiple poll
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 * @param {Discord.MessageEmbed} embed The basic sample
 */
function multipleChoice (message, args, embed) {
  for (let i = 1; i !== args.length; i++) {
    embed.addFields({ name: `Choice ${emoji[i - 1]}`, value: `${args[i]}\n `, inline: false })
  }
  message.channel.send(embed).then(embedMsg => {
    for (let i = 1; i !== args.length; i++) {
      embedMsg.react(emoji[i - 1])
    }
  })
}

/** @module command/poll */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'poll',
  /** This is the description of the command
   * @type {string}
   */
  description: 'Main command to manage strawpolls.',
  /** The list of roles in a table
   * @type {Array<string>}
   */
  authorized_role: ['Discord Dev'],
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
    const tmp = parseArgs(args)
    if (tmp[0] === 'help' && tmp.length === 1) {
      help(message)
      return
    }
    if (tmp === 'ERROR') {
      message.reply(`Error: Invalid arguments. Do ${prefix}poll help to see how to use it.`)
      return
    }
    const embed = createBasicEmbed(tmp[0], message)
    if (tmp.length === 3) {
      doubleChoice(message, tmp, embed)
    } else if (tmp.length > 3 && tmp.length < 12) {
      multipleChoice(message, tmp, embed)
    }
  }
}
