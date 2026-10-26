require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: ';',

  // Permission levels: owner > admin > staff > everyone
  ownerIds: (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
  adminRoleId: '1564302286807900262',
  staffRoleId: '1564302385117921371',

  // Panel branding - replace with your own image URLs and links
  brand: {
    name: "Site's Graphics",
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
