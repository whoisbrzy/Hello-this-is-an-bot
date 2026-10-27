const path = require('path');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} = require('discord.js');
const { brand } = require('../config');

const gallery = (url) =>
  new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(url));

const divider = () =>
  new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);

const text = (content) => new TextDisplayBuilder().setContent(content);

const DASHBOARD_BANNER_FILE = 'dashboard-banner.png';
const DASHBOARD_BANNER_PATH = path.join(__dirname, '..', '..', 'assets', DASHBOARD_BANNER_FILE);

function dashboardPanel() {
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('panel_assistance').setLabel('Assistance').setStyle(ButtonStyle.Secondary),
  );

  const container = new ContainerBuilder()
    .setAccentColor(brand.color)
    .addMediaGalleryComponents(gallery(`attachment://${DASHBOARD_BANNER_FILE}`))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      text('# Dashboard'),
      text(
        `Welcome to ${brand.name}, where you can find the **highest** quality designs and affordable graphics. ` +
          'Need a hand? Use the button below.',
      ),
    )
    .addActionRowComponents(buttons);

  return {
    components: [container],
    files: [new AttachmentBuilder(DASHBOARD_BANNER_PATH, { name: DASHBOARD_BANNER_FILE })],
    flags: MessageFlags.IsComponentsV2,
  };
}

function servicesPanel() {
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Terms Of Service').setStyle(ButtonStyle.Link).setURL(brand.tosUrl),
    new ButtonBuilder().setCustomId('panel_book').setLabel('Book Your Time Today!').setStyle(ButtonStyle.Secondary),
  );

  const container = new ContainerBuilder()
    .setAccentColor(brand.color)
    .addMediaGalleryComponents(gallery(brand.servicesBanner))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(
      text('# Booking'),
      text(
        'Our pricing depends on the complexity of your request. Simpler logos and banners cost less, ' +
          "while more detailed or time-consuming designs may cost more. Once we know what you're looking for, " +
          "we'll provide you with a fair price before we begin.",
      ),
    )
    .addSeparatorComponents(divider())
    .addActionRowComponents(buttons)
    .addMediaGalleryComponents(gallery(brand.servicesFooter));

  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

function verifyPanel() {
  const container = new ContainerBuilder()
    .setAccentColor(brand.color)
    .addTextDisplayComponents(
      text(
        `welcome to **${brand.name}**. if you would like to order you must please verify your discord account and roblox.\n\n` +
          'to begin the verification process, please click the **Verify** button below and follow the on-screen instructions.',
      ),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_begin').setLabel('Begin Verification').setStyle(ButtonStyle.Secondary),
      ),
    );

  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

module.exports = { dashboardPanel, servicesPanel, verifyPanel };
