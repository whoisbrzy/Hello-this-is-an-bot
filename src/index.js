const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const config = require('./config');
const { hasPerm } = require('./utils/perms');
require('./db');

if (!config.token) {
  console.error('Missing DISCORD_TOKEN. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // privileged: enable in the Developer Portal
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // privileged: enable in the Developer Portal
    GatewayIntentBits.GuildPresences, // privileged: needed for ;mc online count
  ],
  partials: [Partials.Channel],
});

// Load commands
client.commands = new Collection();
const cmdDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(cmdDir).filter((f) => f.endsWith('.js'))) {
  const cmd = require(path.join(cmdDir, file));
  client.commands.set(cmd.name, cmd);
}

// Load button handlers
client.buttons = new Collection();
const btnDir = path.join(__dirname, 'buttons');
if (fs.existsSync(btnDir)) {
  for (const file of fs.readdirSync(btnDir).filter((f) => f.endsWith('.js'))) {
    for (const btn of [].concat(require(path.join(btnDir, file)))) {
      client.buttons.set(btn.id, btn);
    }
  }
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const name = args.shift()?.toLowerCase();
  const cmd = client.commands.get(name);
  if (!cmd) return;

  if (!hasPerm(message.member, cmd.perm || 'everyone')) {
    return message.reply('You do not have permission to use that command.').catch(() => {});
  }

  try {
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(`Error in ;${name}:`, err);
    message.reply('Something went wrong running that command.').catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const btn = client.buttons.get(interaction.customId);
  if (!btn) return;
  try {
    await btn.execute(interaction, client);
  } catch (err) {
    console.error(`Error in button ${interaction.customId}:`, err);
    const reply = { content: 'Something went wrong.', ephemeral: true };
    if (interaction.deferred || interaction.replied) interaction.followUp(reply).catch(() => {});
    else interaction.reply(reply).catch(() => {});
  }
});

client.login(config.token);
