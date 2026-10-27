// Placeholder handlers. Real behaviour is added in later phases.
const stub = (id, content) => ({
  id,
  async execute(interaction) {
    await interaction.reply({ content, ephemeral: true });
  },
});

module.exports = [
  stub('panel_apply', 'Applications are not open yet.'),
  stub('verify_begin', 'Verification is not set up yet.'),
];
