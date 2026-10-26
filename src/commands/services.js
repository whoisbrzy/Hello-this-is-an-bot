const { servicesPanel } = require('../utils/panels');

module.exports = {
  name: 'services',
  perm: 'staff',
  async execute(message) {
    await message.delete().catch(() => {});
    await message.channel.send(servicesPanel());
  },
};
