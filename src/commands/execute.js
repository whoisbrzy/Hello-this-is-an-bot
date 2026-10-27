const { execFile } = require('child_process');

// Only these npm subcommands may be run. Arguments are passed directly to npm
// (no shell), so shell metacharacters have no effect.
const ALLOWED = new Set(['install', 'i', 'ls', 'list', 'outdated', 'update', 'view', 'audit', '-v', '--version']);
const SAFE_ARG = /^[A-Za-z0-9@._\/:=~^<>-]+$/;

module.exports = {
  name: 'execute',
  perm: 'owner',
  async execute(message, args) {
    if (args[0]?.toLowerCase() === 'npm') args.shift();
    const sub = args[0];
    if (!sub || !ALLOWED.has(sub)) {
      return message.reply(`Allowed npm commands: \`${[...ALLOWED].join(', ')}\``);
    }
    if (!args.every((a) => SAFE_ARG.test(a))) {
      return message.reply('Arguments contain disallowed characters.');
    }

    const working = await message.reply(`Running \`npm ${args.join(' ')}\`...`);
    execFile('npm', args, { cwd: process.cwd(), timeout: 120000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      let out = `${stdout}${stderr}`.trim() || (err ? err.message : 'Done (no output).');
      if (out.length > 1800) out = `...${out.slice(-1800)}`;
      working.edit(`\`\`\`\n${out}\n\`\`\``).catch(() => {});
    });
  },
};
