const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

router.get('/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 1 connected, 2 connecting
    const status = ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown';

    let ping;
    let usingAtlas = false;
    let hostInfo = null;
    if (mongoose.connection.db) {
      const admin = mongoose.connection.db.admin();
      ping = await admin.ping();
    }

    // Detectar host e se é Atlas (SRV em mongodb.net)
    try {
      const client = (typeof mongoose.connection.getClient === 'function')
        ? mongoose.connection.getClient()
        : mongoose.connection.client;
      const opts = client?.options || {};
      hostInfo = opts.srvHost || (Array.isArray(opts.hosts) ? opts.hosts.map(h => h.host).join(',') : null);
      usingAtlas = Boolean((opts.srvHost || '').includes('mongodb.net'));
    } catch (_) {
      // silencioso
    }

    res.json({
      ok: true,
      dbStatus: status,
      ping: ping || null,
      usingAtlas,
      host: hostInfo,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
