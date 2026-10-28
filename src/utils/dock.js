// Client for the Dock (docksys.xyz) v2 API: Discord <-> Roblox verification.
// Docs: https://docs.docksys.xyz/api-reference/v2/introduction
const { randomUUID } = require('crypto');
const config = require('../config').dock;

function configured() {
  return Boolean(config.apiKey && config.pid);
}

async function request(path, options = {}) {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const code = body?.error?.code || body?.code || res.status;
    const message = body?.error?.message || body?.message || `Dock API error (${res.status})`;
    const err = new Error(message);
    err.code = code;
    err.status = res.status;
    throw err;
  }
  return body?.data ?? body;
}

// Creates (or reuses) a pending verification session for this Discord user.
// clientId should be stable per-user so re-clicking Verify reuses the same session.
async function createSession(clientId, guildId) {
  return request('/sessions', {
    method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() },
    body: JSON.stringify({ pid: config.pid, clientId, guildId: guildId || null }),
  });
}

// wait: 0-25 seconds, long-polls server side until the session changes or wait elapses.
async function getSession(id, wait = 0) {
  return request(`/sessions/${id}?wait=${wait}`);
}

module.exports = { configured, createSession, getSession };
