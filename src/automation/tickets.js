const db = require('../db');
const config = require('../config');
const { touchTicket, closeTicket } = require('../utils/tickets');

const CHECK_EVERY_MS = 10 * 60 * 1000;

module.exports = (client) => {
  // Any message in a ticket channel counts as activity
  client.on('messageCreate', (message) => {
    if (message.author.bot || !message.guild) return;
    touchTicket(message.channel.id);
  });

  async function sweep() {
    const cutoff = Date.now() - config.ticketInactiveHours * 60 * 60 * 1000;
    const stale = db.prepare("SELECT * FROM tickets WHERE status = 'open' AND last_activity < ?").all(cutoff);

    for (const ticket of stale) {
      const channel = await client.channels.fetch(ticket.channel_id).catch(() => null);
      if (!channel) {
        // Channel was deleted by hand; just mark it closed
        db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?").run(ticket.channel_id);
        continue;
      }
      await channel
        .send(`This ticket has been inactive for ${config.ticketInactiveHours} hours and will now be closed.`)
        .catch(() => {});
      await closeTicket(channel, {
        reason: `Inactive for ${config.ticketInactiveHours} hours`,
        closedBy: 'Automatic (inactivity)',
      }).catch((err) => console.error('Auto-close failed:', err.message));
    }
  }

  client.once('clientReady', () => {
    sweep().catch((err) => console.error('Ticket sweep failed:', err));
    setInterval(() => sweep().catch((err) => console.error('Ticket sweep failed:', err)), CHECK_EVERY_MS);
  });
};
