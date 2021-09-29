const client = require('./bot');

/**
 * @brief Send a message if error
 * 
 * @param message 
 * @param error 
 */
function sendMessageError (message, error) {
  message.guild.channels.cache.forEach(c => {
    if (c.id === '837024859942289479') {
      c.send('Command message by : ' + message.author.username +
            '\nContent : ```' + message.content + '``` \nError : ```' + error + '```')
    }
  })
}

module.exports = { sendMessageError }