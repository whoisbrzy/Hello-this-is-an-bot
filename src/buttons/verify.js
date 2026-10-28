const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dock = require('../utils/dock');

const POLL_WAIT_SECONDS = 25; // Dock's long-poll max
const MAX_POLL_MINUTES = 15; // give up watching after this long; the session itself still lives until expiresAt

async function watchSession(interaction, sessionId) {
  const deadline = Date.now() + MAX_POLL_MINUTES * 60 * 1000;

  while (Date.now() < deadline) {
    let session;
    try {
      session = await dock.getSession(sessionId, POLL_WAIT_SECONDS);
    } catch (err) {
      console.error('Dock getSession failed:', err.message);
      return; // stop watching silently; the user can click Verify again
    }

    if (session.status === 'completed') {
      await interaction
        .followUp({
          content: `Verified! Your Roblox account (ID \`${session.result?.robloxId}\`) is now linked.`,
          ephemeral: true,
        })
        .catch(() => {});
      return;
    }
    if (session.status === 'expired' || session.status === 'cancelled') {
      await interaction
        .followUp({ content: `Verification ${session.status}. Click Begin Verification to try again.`, ephemeral: true })
        .catch(() => {});
      return;
    }
    // status is "pending" - the long-poll above already waited, loop again
  }
}

module.exports = {
  id: 'verify_begin',
  async execute(interaction) {
    if (!dock.configured()) {
      return interaction.reply({
        content: 'Verification is not configured yet. Please tell a staff member.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let session;
    try {
      session = await dock.createSession(interaction.user.id, interaction.guildId);
    } catch (err) {
      console.error('Dock createSession failed:', err.message);
      return interaction.editReply('Could not start verification right now. Please try again shortly.');
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Verify with Dock').setStyle(ButtonStyle.Link).setURL(session.verifyUrl),
    );
    await interaction.editReply({
      content: 'Click below to verify your Roblox account. This link is just for you.',
      components: [row],
    });

    // Don't block the interaction reply on this; let it run in the background.
    watchSession(interaction, session.id).catch((err) => console.error('watchSession failed:', err));
  },
};
