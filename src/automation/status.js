const { ActivityType } = require('discord.js');
const config = require('../config');

module.exports = (client) => {
  let i = 0;

  const rotate = () => {
    const members = client.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0);
    const template = config.statusMessages[i % config.statusMessages.length];
    i++;
    client.user.setPresence({
      activities: [
        {
          // Custom status text lives in `state`; `name` is required but not shown
          type: ActivityType.Custom,
          name: 'status',
          state: template.replace('{number}', members.toLocaleString('en-US')),
        },
      ],
      status: 'online',
    });
  };

  client.once('clientReady', () => {
    rotate();
    // Discord rate-limits presence updates; keep the interval at 15s or more
    setInterval(rotate, Math.max(15, config.statusIntervalSeconds) * 1000);
  });
};
