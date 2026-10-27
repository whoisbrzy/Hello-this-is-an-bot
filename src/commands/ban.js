const { resolveMember, parseId, checkHierarchy, logAction } = require('../utils/moderation');

module.exports = {
  name: 'ban',
  perm: 'staff',
  async execute(message, args) {
    const id = parseId(args[0]);
    if (!id) return message.reply('Usage: `;ban @user|id [reason]`');

    const member = await resolveMember(message.guild, id);
    if (member) {
      const err = checkHierarchy(message, member);
      if (err) return message.reply(err);
      if (!member.bannable) return message.reply('I cannot ban that member (my role is too low).');
    } else if (id === message.author.id) {
      return message.reply('You cannot do that to yourself.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (member) {
      await member.send(`You were banned from **${message.guild.name}**: ${reason}`).catch(() => {});
    }
    await message.guild.members.ban(id, { reason: `${message.author.tag}: ${reason}` });
    await logAction(message.guild, {
      action: 'Ban',
      target: { id },
      moderator: message.author,
      reason,
    });
    return message.reply(`Banned <@${id}>: ${reason}`);
  },
};
