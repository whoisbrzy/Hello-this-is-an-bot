const { hasPerm } = require('../utils/perms');
const { createTicket, closeTicket, getTicket, touchTicket } = require('../utils/tickets');

function opener(id, topic) {
  return {
    id,
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      let result;
      try {
        result = await createTicket(interaction.guild, interaction.user, topic);
      } catch (err) {
        console.error('createTicket failed:', err);
        return interaction.editReply('I could not create your ticket. Please tell a staff member.');
      }
      if (result.error) return interaction.editReply(result.error);
      return interaction.editReply(`Your ticket is ready: <#${result.channel.id}>`);
    },
  };
}

// Only the ticket owner or staff may answer a close request.
function canRespond(interaction, ticket) {
  return interaction.user.id === ticket.owner_id || hasPerm(interaction.member, 'staff');
}

const accept = {
  id: 'cr_accept',
  async execute(interaction) {
    const ticket = getTicket(interaction.channelId);
    if (!ticket || ticket.status !== 'open') {
      return interaction.reply({ content: 'This ticket is no longer open.', ephemeral: true });
    }
    if (!canRespond(interaction, ticket)) {
      return interaction.reply({ content: 'Only the ticket owner or staff can answer this.', ephemeral: true });
    }
    await interaction.update({ content: 'Close request accepted. Closing this ticket...', components: [], embeds: [] });
    await closeTicket(interaction.channel, {
      reason: 'Close request accepted',
      closedBy: `<@${interaction.user.id}>`,
    });
  },
};

const deny = {
  id: 'cr_deny',
  async execute(interaction) {
    const ticket = getTicket(interaction.channelId);
    if (!ticket || ticket.status !== 'open') {
      return interaction.reply({ content: 'This ticket is no longer open.', ephemeral: true });
    }
    if (!canRespond(interaction, ticket)) {
      return interaction.reply({ content: 'Only the ticket owner or staff can answer this.', ephemeral: true });
    }
    touchTicket(interaction.channelId);
    await interaction.update({ content: 'Close request denied. The ticket stays open.', components: [], embeds: [] });
  },
};

module.exports = [opener('panel_assistance', 'support'), opener('panel_book', 'booking'), accept, deny];
