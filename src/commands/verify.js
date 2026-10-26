const { verifyPanel } = require('../utils/panels');

module.exports = {
  name: 'verify',
  perm: 'staff',
  async execute(message) {
    await message.delete().catch(() => {});
    await message.channel.send(verifyPanel());
  },
};
