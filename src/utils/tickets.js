const { AttachmentBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const config = require('../config');

const getTicket = (channelId) => db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);

const getOpenTicketFor = (guildId, userId) =>
  db.prepare("SELECT * FROM tickets WHERE guild_id = ? AND owner_id = ? AND status = 'open'").get(guildId, userId);

function touchTicket(channelId) {
  db.prepare("UPDATE tickets SET last_activity = ? WHERE channel_id = ? AND status = 'open'").run(Date.now(), channelId);
}

async function createTicket(guild, user, topic) {
  if (!config.ticketCategoryId) {
    return { error: 'Tickets are not configured yet (missing ticket category).' };
  }

  const existing = getOpenTicketFor(guild.id, user.id);
  if (existing) {
    const stillThere = await guild.channels.fetch(existing.channel_id).catch(() => null);
    if (stillThere) return { error: `You already have an open ticket: <#${existing.channel_id}>` };
    db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?").run(existing.channel_id);
  }

  const allow = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.EmbedLinks,
  ];

  const safeName = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'user';
  const channel = await guild.channels.create({
    name: `${topic}-${safeName}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId,
    topic: `Ticket for ${user.tag} (${user.id})`,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow },
      { id: config.staffRoleId, allow },
      { id: config.adminRoleId, allow },
      { id: guild.members.me.id, allow: [...allow, PermissionFlagsBits.ManageChannels] },
    ],
  });

  const now = Date.now();
  db.prepare(
    "INSERT INTO tickets (channel_id, guild_id, owner_id, status, last_activity, created_at) VALUES (?, ?, ?, 'open', ?, ?)",
  ).run(channel.id, guild.id, user.id, now, now);

  await channel.send({
    content: `<@${user.id}> <@&${config.staffRoleId}>`,
    embeds: [
      {
        color: config.brand.color,
        title: topic === 'booking' ? 'New booking' : 'Support ticket',
        description:
          'Thanks for opening a ticket. Please describe what you need and a member of staff will be with you shortly.\n' +
          `This ticket closes automatically after ${config.ticketInactiveHours} hours of inactivity.`,
      },
    ],
    allowedMentions: { users: [user.id], roles: [config.staffRoleId] },
  });

  return { channel };
}

async function buildTranscript(channel) {
  const lines = [];
  let before;
  // Up to 1000 most recent messages
  for (let i = 0; i < 10; i++) {
    const batch = await channel.messages.fetch({ limit: 100, before }).catch(() => null);
    if (!batch || batch.size === 0) break;
    lines.push(...batch.values());
    before = batch.last().id;
    if (batch.size < 100) break;
  }
  lines.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  const text = lines
    .map((m) => {
      const time = new Date(m.createdTimestamp).toISOString();
      const attachments = m.attachments.size ? ` [attachments: ${[...m.attachments.values()].map((a) => a.url).join(' ')}]` : '';
      return `[${time}] ${m.author.tag}: ${m.content}${attachments}`;
    })
    .join('\n');
  return Buffer.from(text || '(no messages)', 'utf8');
}

async function closeTicket(channel, { reason, closedBy }) {
  const ticket = getTicket(channel.id);
  if (!ticket || ticket.status !== 'open') return false;

  db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?").run(channel.id);

  if (config.ticketLogChannelId) {
    const logChannel = await channel.guild.channels.fetch(config.ticketLogChannelId).catch(() => null);
    if (logChannel?.isTextBased()) {
      const transcript = await buildTranscript(channel);
      await logChannel
        .send({
          embeds: [
            {
              color: config.brand.color,
              title: 'Ticket closed',
              fields: [
                { name: 'Ticket', value: `#${channel.name}`, inline: true },
                { name: 'Owner', value: `<@${ticket.owner_id}>`, inline: true },
                { name: 'Closed by', value: closedBy, inline: true },
                { name: 'Reason', value: reason },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
          files: [new AttachmentBuilder(transcript, { name: `${channel.name}-transcript.txt` })],
          allowedMentions: { parse: [] },
        })
        .catch(() => {});
    }
  }

  await channel.delete(`Ticket closed: ${reason}`).catch(() => {});
  return true;
}

module.exports = { getTicket, getOpenTicketFor, touchTicket, createTicket, closeTicket };
