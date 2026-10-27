require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: ';',

  // Permission levels: owner > admin > staff > everyone
  ownerIds: (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
  adminRoleId: '1564302286807900262',
  staffRoleId: '1564302385117921371',

  // Channels / categories (leave empty to disable that feature)
  ticketCategoryId: '1564625377924616323', // category where ticket channels are created
  ticketLogChannelId: '1564342735073316955', // transcripts are posted here
  modLogChannelId: '', // moderation actions are logged here
  welcomeChannelId: '1564305038078124074', // welcome cards are posted here
  ticketInactiveHours: 36,

  // Rotating status. {number} is replaced with the member count.
  statusMessages: ['hi poopy', 'we have {number} members btw'],
  statusIntervalSeconds: 20,

  // Panel branding - replace with your own image URLs and links
  brand: {
    name: 'Pharaon',
    color: 242429,
    dashboardBanner: 'https://i.postimg.cc/Dw3v3Zcq/Pharaon-Banner.png',
    dashboardFooter: 'https://example.com/dashboard-footer.png',
    servicesBanner: 'https://i.postimg.cc/Dw3v3Zcq/Pharaon-Banner.png',
    servicesFooter: 'https://example.com/services-footer.png',
    orderUrl: 'https://example.com/order',
    websiteUrl: 'https://example.com',
    tosUrl: 'https://example.com/terms',
  },
};
