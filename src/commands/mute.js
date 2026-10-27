const { resolveMember, checkHierarchy, parseDuration, logAction } = require('../utils/moderation');

const MAX_MS = 28 * 24 * 60 * 60 * 1000; // Discord timeout limit

module.exports = {
  name: 'mute',
  perm: 'staff',
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) return message.reply('Usage: `;mute @user [10m|2h|1d] [reason]`');
    const err = checkHierarchy(message, target);
    if (err) return message.reply(err);
    if (!target.moderatable) return message.reply('I cannot mute that member (my role is too low).');

    let duration = parseDuration(args[1]);
    let reasonStart = 2;
    if (duration === null) {
      duration = 60 * 60 * 1000; // default 1 hour
      reasonStart = 1;
    }
    if (duration > MAX_MS) return message.reply('Maximum mute length is 28 days.');

    const reason = args.slice(reasonStart).join(' ') || 'No reason provided';
    await target.timeout(duration, `${message.author.tag}: ${reason}`);
    const mins = Math.round(duration / 60000);
    await logAction(message.guild, {
      action: 'Mute',
      target,
      moderator: message.author,
      reason,
      extra: `Duration: ${mins} minute(s)`,
    });
    return message.reply(`Muted <@${target.id}> for ${mins} minute(s): ${reason}`);
  },
};
