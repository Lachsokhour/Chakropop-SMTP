const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve static files from the public directory (needed for local development)
app.use(express.static(path.join(__dirname, '../public')));

// ─── Build transporter from config ───
function buildTransporter(cfg) {
  const tlsOptions = {
    rejectUnauthorized: cfg.rejectUnauthorized !== false,
  };

  const transportConfig = {
    host: cfg.host,
    port: Number(cfg.port),
    secure: cfg.secure === true || Number(cfg.port) === 465,
    requireTLS: !!cfg.requireTLS,
    connectionTimeout: Number(cfg.connectionTimeout) || 10000,
    greetingTimeout: Number(cfg.greetingTimeout) || 8000,
    socketTimeout: Number(cfg.socketTimeout) || 15000,
    tls: tlsOptions,
    debug: true,
    logger: false,
  };

  // Auth
  if (cfg.auth && cfg.auth !== 'none' && cfg.username) {
    transportConfig.auth = {
      type: cfg.auth === 'oauth2' || cfg.auth === 'xoauth2' ? 'OAuth2' : undefined,
      user: cfg.username,
      pass: cfg.password || undefined,
    };
    if (!transportConfig.auth.type) delete transportConfig.auth.type;
  }

  // Pool
  if (cfg.pool) {
    transportConfig.pool = true;
    transportConfig.maxConnections = Number(cfg.maxConnections) || 5;
    transportConfig.maxMessages = Number(cfg.maxMessages) || 100;
    if (cfg.rateLimit) transportConfig.rateLimit = Number(cfg.rateLimit);
  }

  return nodemailer.createTransport(transportConfig);
}


// ─── GET /api/health ───
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ─── POST /api/test ───

app.post('/api/test', async (req, res) => {
  const cfg = req.body;
  const steps = [];

  const push = (level, msg) => steps.push({ level, msg, ts: Date.now() });

  push('info', `Resolving host: ${cfg.host}:${cfg.port}`);
  push('info', `Encryption: ${cfg.secure || Number(cfg.port) === 465 ? 'SSL/TLS' : cfg.requireTLS ? 'STARTTLS (required)' : 'STARTTLS (optional)'}`);
  push('info', `Auth method: ${cfg.auth || 'PLAIN'} | user: ${cfg.username || '(none)'}`);

  let transporter;
  try {
    transporter = buildTransporter(cfg);
  } catch (err) {
    push('error', `Failed to create transporter: ${err.message}`);
    return res.json({ ok: false, steps });
  }

  try {
    push('info', 'Attempting SMTP connection…');
    await transporter.verify();
    push('ok', `✓ TCP connection established`);
    push('ok', `✓ SMTP EHLO handshake successful`);
    push('ok', `✓ Authentication passed`);
    push('ok', `✓ Server is ready to accept messages`);
    res.json({ ok: true, steps });
  } catch (err) {
    const msg = err.message || String(err);
    push('error', `✕ ${msg}`);

    // Friendly diagnosis
    if (msg.includes('ECONNREFUSED'))   push('warn', 'Connection refused — wrong host or port, or firewall blocking');
    else if (msg.includes('ETIMEDOUT')) push('warn', 'Timeout — host unreachable or port blocked');
    else if (msg.includes('ENOTFOUND')) push('warn', 'DNS lookup failed — hostname does not exist');
    else if (msg.includes('535') || msg.includes('534')) push('warn', 'Authentication failed — wrong username/password or app password needed');
    else if (msg.includes('certificate')) push('warn', 'TLS cert error — try disabling "Reject Unauthorized"');
    else if (msg.includes('STARTTLS'))  push('warn', 'Server does not support STARTTLS on this port — try port 465 with SSL/TLS');

    res.json({ ok: false, steps });
  } finally {
    try { transporter.close(); } catch(_) {}
  }
});

// ─── POST /api/send ───
app.post('/api/send', async (req, res) => {
  const { smtp, mail } = req.body;

  if (!smtp || !smtp.host) return res.status(400).json({ ok: false, error: 'SMTP config missing' });
  if (!mail.to || mail.to.length === 0) return res.status(400).json({ ok: false, error: 'No recipients' });

  let transporter;
  try {
    transporter = buildTransporter(smtp);
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }

  // Build mail options
  const mailOptions = {
    from: mail.from,
    to: Array.isArray(mail.to) ? mail.to.join(', ') : mail.to,
    subject: mail.subject || '(no subject)',
  };

  if (mail.cc && mail.cc.length) mailOptions.cc = mail.cc.join(', ');
  if (mail.bcc && mail.bcc.length) mailOptions.bcc = mail.bcc.join(', ');
  if (mail.replyTo) mailOptions.replyTo = mail.replyTo;

  if (mail.format === 'html') {
    mailOptions.html = mail.body;
    mailOptions.text = mail.bodyText || mail.body.replace(/<[^>]+>/g, '');
  } else {
    mailOptions.text = mail.body;
  }

  // Priority headers
  if (mail.priority === 'high') {
    mailOptions.priority = 'high';
    mailOptions.headers = { 'X-Priority': '1', 'Importance': 'high' };
  } else if (mail.priority === 'low') {
    mailOptions.priority = 'low';
    mailOptions.headers = { 'X-Priority': '5', 'Importance': 'low' };
  }

  // Read receipt
  if (mail.readReceipt && mail.from) {
    mailOptions.headers = { ...mailOptions.headers, 'Disposition-Notification-To': mail.from };
  }

  // Attachments (base64)
  if (mail.attachments && mail.attachments.length) {
    mailOptions.attachments = mail.attachments.map(a => ({
      filename: a.name,
      content: a.data,
      encoding: 'base64',
    }));
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ ok: true, messageId: info.messageId, response: info.response });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  } finally {
    try { transporter.close(); } catch(_) {}
  }
});

// ─── Serve index.html for all other routes ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chakropop SMTP backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
