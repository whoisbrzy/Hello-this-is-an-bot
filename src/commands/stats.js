const { EmbedBuilder } = require('discord.js');
const db = require('../db');
const config = require('../config');

const DAY = 24 * 60 * 60 * 1000;

module.exports = {
  name: 'stats',
  perm: 'staff',
  async execute(message) {
    const now = Date.now();
    const count = (since) =>
      db
        .prepare('SELECT COUNT(*) AS n FROM joins WHERE guild_id = ? AND joined_at >= ?')
        .get(message.guild.id, since).n;

    const embed = new EmbedBuilder()
      .setColor(config.brand.color)
      .setTitle('Member joins')
      .addFields(
        { name: 'Last 24 hours', value: String(count(now - DAY)), inline: true },
        { name: 'Last 7 days', value: String(count(now - 7 * DAY)), inline: true },
        { name: 'Last 30 days', value: String(count(now - 30 * DAY)), inline: true },
      )
      .setFooter({ text: 'Joins are counted from when the bot started tracking them.' });
    return message.reply({ embeds: [embed] });
  },
};
