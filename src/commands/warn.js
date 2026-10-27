const db = require('../db');
const { resolveMember, checkHierarchy, logAction } = require('../utils/moderation');

module.exports = {
  name: 'warn',
  perm: 'staff',
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) return message.reply('Usage: `;warn @user [reason]`');
    const err = checkHierarchy(message, target);
    if (err) return message.reply(err);

    const reason = args.slice(1).join(' ') || 'No reason provided';
    db.prepare(
      'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(message.guild.id, target.id, message.author.id, reason, Date.now());
    const { n } = db
      .prepare('SELECT COUNT(*) AS n FROM warnings WHERE guild_id = ? AND user_id = ?')
      .get(message.guild.id, target.id);

    await target
      .send(`You were warned in **${message.guild.name}**: ${reason}`)
      .catch(() => {});
    await logAction(message.guild, {
      action: 'Warn',
      target,
      moderator: message.author,
      reason,
      extra: `Total warnings: ${n}`,
    });
    return message.reply(`Warned <@${target.id}> (warning #${n}): ${reason}`);
  },
};
