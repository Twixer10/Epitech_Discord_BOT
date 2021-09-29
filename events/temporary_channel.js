const { DiscordAPIError } = require('discord.js')
const main = require('../bot')
const { channels } = require('../config.json')

/** @module event/temporary_channel */
module.exports = {
  /** This parameter defines the name of the command and the name of the command itself
   * @type {string}
   */
  name: 'voiceStateUpdate',
  /** This is where the code has to be executed for each action in a VoiceChannel
   * @param {Discord.VoiceState} oldVoiceState That countains the voice state before the update
   * @param {Discord.VoiceState} newVoiceState That countains the voice state after the update
   * @async
  */
  async execute (oldVoiceState, newVoiceState) {
    if (newVoiceState.channel !== undefined && newVoiceState.channel !== null && newVoiceState.channel.id === channels.temporary_channel.channel_id) {
      await newVoiceState.guild.channels.create(`${newVoiceState.member.user.username}'s voice channel`, {
        type: 'voice',
        permissionOverwrites: [
          {
            id: newVoiceState.guild.roles.everyone.id,
            deny: ['CONNECT']
          },
          {
            id: newVoiceState.member.user.id,
            allow: ['CONNECT', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'VIEW_CHANNEL']
          }
        ],
        parent: channels.temporary_channel.category_id,
        userLimit: 5
      })
        .then(async channel => {
          await newVoiceState.channelID
          await newVoiceState.member.voice.setChannel(channel)
        }).catch()
    }

    main.client.channels.cache.forEach(c => {
      if (c !== undefined && c.parentID === channels.temporary_channel.category_id) {
        if (c !== undefined && c.id !== channels.temporary_channel.channel_id) {
          if (c !== undefined && c.members.size <= 0) {
            if (c !== undefined && c.members.size <= 0 && !c.deleted) { c.delete().catch(err => { console.log(err) }) }
          }
        }
      }
    })
  }
}
