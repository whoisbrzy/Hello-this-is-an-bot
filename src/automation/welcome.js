const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder,
} = require('discord.js');
const db = require('../db');
const config = require('../config');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    if (member.user.bot) return;

    // Always record the join so ;stats works, even without a welcome channel
    db.prepare('INSERT INTO joins (user_id, guild_id, joined_at) VALUES (?, ?, ?)').run(
      member.id,
      member.guild.id,
      Date.now(),
    );

    if (!config.welcomeChannelId) return;
    const channel = await member.guild.channels.fetch(config.welcomeChannelId).catch(() => null);
    if (!channel?.isTextBased()) return;

    const container = new ContainerBuilder()
      .setAccentColor(config.brand.color)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Welcome <@${member.id}> to **${member.guild.name}**! We hope you enjoy your stay.`,
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`member_count_${member.id}`)
            .setLabel(String(member.guild.memberCount))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        ),
      );

    await channel
      .send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { users: [member.id] },
      })
      .catch((err) => console.error('Welcome message failed:', err.message));
  });
};
