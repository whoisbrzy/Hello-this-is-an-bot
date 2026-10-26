const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'embed',
  perm: 'staff',
  async execute(message, args) {
    let raw = args.join(' ').trim();
    // Allow the JSON to be wrapped in a ```json code block
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();

    if (!raw) {
      return message.reply('Usage: `;embed {"title":"Hello","description":"World","color":5793266}`');
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return message.reply('That is not valid JSON.');
    }

    // Accept either a bare embed object or { "embeds": [...] }
    const list = Array.isArray(data.embeds) ? data.embeds : [data];
    let embeds;
    try {
      embeds = list.slice(0, 10).map((e) => new EmbedBuilder(e));
    } catch (err) {
      return message.reply(`Invalid embed: ${err.message}`);
    }

    await message.delete().catch(() => {});
    await message.channel.send({ embeds }).catch((err) => {
      message.channel.send(`Could not send embed: ${err.message}`).catch(() => {});
    });
  },
};
