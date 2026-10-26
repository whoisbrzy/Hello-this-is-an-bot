const config = require('../config');

const LEVELS = { everyone: 0, staff: 1, admin: 2, owner: 3 };

function getLevel(member) {
  if (!member) return LEVELS.everyone;
  if (config.ownerIds.includes(member.id)) return LEVELS.owner;
  if (member.roles.cache.has(config.adminRoleId)) return LEVELS.admin;
  if (member.roles.cache.has(config.staffRoleId)) return LEVELS.staff;
  return LEVELS.everyone;
}

function hasPerm(member, required = 'everyone') {
  return getLevel(member) >= LEVELS[required];
}

module.exports = { hasPerm, getLevel, LEVELS };
