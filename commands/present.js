const db = require('../data/function_db')
const { channels } = require('../config.json')

/** @module command/present */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'present',
  /** This is the description of the command
   * @type {string}
   */
  description: 'Main command to confirm your presence.',
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
    if (message.channel.parent.id !== channels.activities.category_id) {
      message.reply(`This command must be executed in the channel of the category **__<#${channels.activities.category_id}>__**`)
      return
    }
    message.delete()
    const activityID = message.channel.name.split('-')[0]
    const userID = message.author.id

    db.checkIsEnable(activityID, (err, msg) => {
      if (!err) {
        message.reply('ERROR SQLITE : checkIsEnable')
        console.log(msg)
        return
      }
      if (!msg) {
        message.reply('Presence is not activated for the moment !').then(msg => msg.delete({ timeout: 10000 }))
      } else {
        db.get_user_email(userID, (err, mail) => {
          if (!err && mail !== 'error') {
            message.reply('ERROR SQLITE : checkPresent')
            console.log(msg)
            return
          } else if (!err && mail === 'error') {
            message.reply('You are not in the database ...')
            return
          }
          db.checkPresent(activityID, mail, (err, msg) => {
            if (!err) {
              message.reply('ERROR SQLITE : checkPresent')
              console.log(msg)
              return
            }
            if (msg === 'wtf') {
              message.reply('You are not register to this activity.').then(msg => msg.delete({ timeout: 10000 }))
              return
            }
            if (msg) {
              message.reply('You are already register to this activity !').then(msg => msg.delete({ timeout: 10000 }))
            } else {
              db.setPresent(activityID, mail, (err, msg) => {
                if (!err) {
                  message.reply('ERROR SQLITE : setPresent')
                  console.log(msg)
                } else {
                  message.reply('You are been register to this activity !').then(msg => msg.delete({ timeout: 10000 }))
                }
              })
            }
          })
        })
      }
    })
  }
}
