const main = require('../bot')
const { prefix } = require('../config.json')
const Discord = require('discord.js')

/** @module command/help */
module.exports = {
    /** This parameter defines the name of the command and the name of the command itself
     * @type {string}
     */
	name: 'help',
    /** This is the description of the command
     * @type {string}
     */
	description: 'This command allow you to show this message.',
    /**
     * The list of roles in a table
     * @type {Array<string>}
     */
	authorized_role: ['everyone'],
    /** This boolean is for activate or desactivate the command
     * @type {boolean}
     */
	enable: true,
    /** This is where the code has to be executed for each command that takes place
     * @param {Discord.Message} message This is the message that contains a command
     * @param {Array<string>} args The content of the message parser in an array with spaces separator
     * @static
     */
	execute (message, args) {
		if (args[1] === 'help') {
			message.reply('There are no help for this command.')
			return
		}
		const helpmessage = new Discord.MessageEmbed()
			.setColor('#3bf646')
			.setTitle('Help : All commands')
			.setAuthor(message.author.username, message.author.avatarURL())
			.setDescription('Bellow all th global commands \n\n')
			.setThumbnail(main.client.user.avatarURL())
			.setTimestamp()
			.setFooter('Don\'t spam !', message.guild.iconURL())
		main.client.commands.forEach(cmd => {
			helpmessage.addFields({ name: prefix + cmd.name, value: (!cmd.enable ? 'This command is temporary disabledq' : cmd.description), inline: false })
		})
		message.reply(helpmessage)
	}
}
