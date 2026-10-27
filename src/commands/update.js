const { execFile } = require('child_process');

const run = (cmd, args) =>
  new Promise((resolve) => {
    execFile(cmd, args, { cwd: process.cwd(), timeout: 180000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: `${stdout}${stderr}`.trim() });
    });
  });

module.exports = {
  name: 'update',
  perm: 'owner',
  async execute(message) {
    const status = await message.reply('Pulling latest changes...');

    const pull = await run('git', ['pull', '--ff-only']);
    if (!pull.ok) return status.edit(`git pull failed:\n\`\`\`\n${pull.out.slice(-1500)}\n\`\`\``);
    if (/Already up to date/i.test(pull.out)) return status.edit('Already up to date.');

    const install = await run('npm', ['install', '--no-audit', '--no-fund']);
    if (!install.ok) return status.edit(`npm install failed:\n\`\`\`\n${install.out.slice(-1500)}\n\`\`\``);

    await status.edit('Updated. Restarting...');
    // A process manager (PM2, systemd, Docker restart policy) must restart the bot.
    setTimeout(() => process.exit(0), 1000);
  },
};
