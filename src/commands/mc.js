const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'mc',
  perm: 'staff',
  async execute(message, args, client) {
    // withCounts gives accurate totals without fetching every member
    const guild = await client.guilds.fetch({ guild: message.guild.id, withCounts: true });
    const embed = new EmbedBuilder()
      .setColor(config.brand.color)
      .setTitle(`${guild.name} members`)
      .addFields(
        { name: 'Online', value: String(guild.approximatePresenceCount ?? 'unknown'), inline: true },
        { name: 'Total', value: String(guild.approximateMemberCount ?? guild.memberCount), inline: true },
      );
    return message.reply({ embeds: [embed] });
  },
};
