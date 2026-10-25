require('dotenv').config();
const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // built into Node, nothing to compile
const twilio = require('twilio');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Database (a file called smartsos.db is created automatically) ----
const db = new DatabaseSync(path.join(__dirname, 'smartsos.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_name TEXT,
    contact TEXT,
    lat REAL,
    lng REAL,
    peak_g REAL,
    sms_status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---- Twilio ----
const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
const sms = hasTwilio ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// The phone page calls this when the countdown ends
app.post('/api/alert', async (req, res) => {
  const { name, contact, lat, lng, peakG } = req.body;
  if (!contact) return res.status(400).json({ error: 'contact required' });

  const link = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : '(location unavailable)';
  const body = `SmartSOS ALERT: ${name || 'A rider'} may have been in an accident. Location: ${link}`;

  let status = 'sent';
  try {
    if (!sms) throw new Error('Twilio keys missing in .env');
    await sms.messages.create({ to: contact, from: process.env.TWILIO_FROM, body });
  } catch (err) {
    console.error('SMS failed:', err.message);
    status = 'failed: ' + err.message;
  }

  db.prepare(`INSERT INTO incidents (rider_name, contact, lat, lng, peak_g, sms_status)
              VALUES (?, ?, ?, ?, ?, ?)`)
    .run(name || '', contact, lat || null, lng || null, peakG || null, status);

  res.json({ ok: status === 'sent', status });
});

// Used by the incidents page (first version of the dashboard)
app.get('/api/incidents', (_, res) => {
  res.json(db.prepare('SELECT * FROM incidents ORDER BY id DESC LIMIT 200').all());
});

app.listen(process.env.PORT || 3000, () =>
  console.log('SmartSOS running on http://localhost:' + (process.env.PORT || 3000)));
