const db = require('../data/function_db')
const utils = require('../utils')

/** @module command/regisster */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'register',
  /** This is the description of the command
   * @type {string}
   */
  description: 'Main command to register a new person in the database.',
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
    if (args.length === 1) {
      message.reply('Syntax error : correct syntax is : !register <firstname.name@epitech.eu>').then(msg => msg.delete({ timeout: 10000 }))
    } else if (args.length === 2) {
      if (args[1] !== undefined) {
        if (args[1].split('@')[1] === 'epitech.eu' && args[1].split('@')[0].split('.')[0] && args[1].split('@')[0].split('.')[1]) {
          db.add_user(message.author.id, args[1], (res, msg) => {
            if (res === false) {
              if (msg === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email_epitech') { message.reply('Your are already in the data base').then(msg => msg.delete({ timeout: 10000 })) } else {
                utils.sendMessageError(message, msg)
                message.reply('An Error has occurred').then(msg => msg.delete({ timeout: 10000 }))
              }
            } else {
              message.reply('Register Complete !').then(msg => msg.delete({ timeout: 10000 }))
              message.author.send('You registered with the following address : ' + args[1])
            }
          })
          message.delete({ timeout: 100 })
        } else {
          message.reply('Please use your epitech adress mail.').then(msg => msg.delete({ timeout: 10000 }))
        }
      }
    }
  }
}
