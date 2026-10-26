const { dashboardPanel } = require('../utils/panels');

module.exports = {
  name: 'dashboard',
  perm: 'staff',
  async execute(message) {
    await message.delete().catch(() => {});
    await message.channel.send(dashboardPanel());
  },
};
