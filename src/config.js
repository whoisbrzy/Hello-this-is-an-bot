require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: ';',

  // Permission levels: owner > admin > staff > everyone
  ownerIds: (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
  adminRoleId: '1564302286807900262',
  staffRoleId: '1564302385117921371',

  // Channels / categories (leave empty to disable that feature)
  ticketCategoryId: '', // category where ticket channels are created
  ticketLogChannelId: '', // transcripts are posted here
  modLogChannelId: '', // moderation actions are logged here
  welcomeChannelId: '', // welcome cards are posted here
  ticketInactiveHours: 36,

  // Rotating status. {number} is replaced with the member count.
  statusMessages: ['hi poopy', 'we have {number} members btw'],
  statusIntervalSeconds: 20,

  // Panel branding - replace with your own image URLs and links
  brand: {
    name: 'Pharaon',
    color: 0x5865f2,
    dashboardBanner: 'https://example.com/dashboard-banner.png',
    dashboardFooter: 'https://example.com/dashboard-footer.png',
    servicesBanner: 'https://example.com/services-banner.png',
    servicesFooter: 'https://example.com/services-footer.png',
    orderUrl: 'https://example.com/order',
    websiteUrl: 'https://example.com',
    tosUrl: 'https://example.com/terms',
  },
};
