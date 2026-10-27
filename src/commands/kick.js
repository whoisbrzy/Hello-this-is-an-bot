const { resolveMember, checkHierarchy, logAction } = require('../utils/moderation');

module.exports = {
  name: 'kick',
  perm: 'staff',
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) return message.reply('Usage: `;kick @user [reason]`');
    const err = checkHierarchy(message, target);
    if (err) return message.reply(err);
    if (!target.kickable) return message.reply('I cannot kick that member (my role is too low).');

    const reason = args.slice(1).join(' ') || 'No reason provided';
    await target.send(`You were kicked from **${message.guild.name}**: ${reason}`).catch(() => {});
    await target.kick(`${message.author.tag}: ${reason}`);
    await logAction(message.guild, { action: 'Kick', target, moderator: message.author, reason });
    return message.reply(`Kicked <@${target.id}>: ${reason}`);
  },
};
