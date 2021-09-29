/** @module command/ping */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'ping',
  /** This is the descrption of the command
   * @type {string}
   */
  description: 'This command allows you to ping the bot to see if it is still alive.',
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
      message.reply('There are no help for this command.')
      return
    }
    message.channel.send('Pong.')
  }
}
