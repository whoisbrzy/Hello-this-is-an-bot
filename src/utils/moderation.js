const { EmbedBuilder } = require('discord.js');
const config = require('../config');

async function resolveMember(guild, arg) {
  if (!arg) return null;
  const id = arg.replace(/[<@!>]/g, '');
  if (!/^\d{17,20}$/.test(id)) return null;
  return guild.members.fetch(id).catch(() => null);
}

function parseId(arg) {
  const id = (arg || '').replace(/[<@!>]/g, '');
  return /^\d{17,20}$/.test(id) ? id : null;
}

// Returns an error string if the moderator may not act on the target, else null.
function checkHierarchy(message, target) {
  if (target.id === message.author.id) return 'You cannot do that to yourself.';
  if (target.id === message.guild.ownerId) return 'You cannot do that to the server owner.';
  if (
    message.author.id !== message.guild.ownerId &&
    target.roles.highest.position >= message.member.roles.highest.position
  ) {
    return 'That member has an equal or higher role than you.';
  }
  return null;
}

// "10m", "2h", "1d", "30s" -> milliseconds (or null)
function parseDuration(str) {
  const m = /^(\d+)\s*([smhdw])$/i.exec(str || '');
  if (!m) return null;
  const mult = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5 }[m[2].toLowerCase()];
  return Number(m[1]) * mult;
}

async function logAction(guild, { action, target, moderator, reason, extra }) {
  if (!config.modLogChannelId) return;
  const channel = await guild.channels.fetch(config.modLogChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setTitle(action)
    .setColor(config.brand.color)
    .addFields(
      { name: 'User', value: `<@${target.id}> (${target.id})`, inline: true },
      { name: 'Moderator', value: `<@${moderator.id}>`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' },
    )
    .setTimestamp();
  if (extra) embed.addFields({ name: 'Details', value: extra });
  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { resolveMember, parseId, checkHierarchy, parseDuration, logAction };
