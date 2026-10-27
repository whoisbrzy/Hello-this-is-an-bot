const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getTicket } = require('../utils/tickets');

module.exports = {
  name: 'cr',
  perm: 'staff',
  async execute(message) {
    const ticket = getTicket(message.channel.id);
    if (!ticket || ticket.status !== 'open') {
      return message.reply('This command only works inside an open ticket.');
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('cr_accept').setLabel('Accept & close').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cr_deny').setLabel('Keep open').setStyle(ButtonStyle.Secondary),
    );

    return message.channel.send({
      content: `<@${ticket.owner_id}>, <@${message.author.id}> has requested to close this ticket. Is everything sorted?`,
      components: [row],
      allowedMentions: { users: [ticket.owner_id, message.author.id] },
    });
  },
};
