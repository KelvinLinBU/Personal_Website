// scripts/update-youtube-watchtime.js
import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'node:fs/promises';
import path from 'node:path';

const JSON_PATH = path.resolve('resources/data/youtube_stats.json');

function todayISO() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YT_REFRESH_TOKEN,
  });

  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

  // Use channel==MINE so we don’t mismatch IDs. Requires that the authed Google account owns the channel.
  const startDate = '2006-01-01'; // safely early
  const endDate = todayISO();

  const { data } = await ytAnalytics.reports.query({
    ids: 'channel==MINE',
    metrics: 'estimatedMinutesWatched',
    startDate,
    endDate,
  });

  let minutes = 0;
  if (Array.isArray(data.rows) && data.rows.length && Array.isArray(data.rows[0])) {
    minutes = Number(data.rows[0][0]) || 0;
  }

  const hours = Math.round(minutes / 60);

  // Load existing JSON (create if missing)
  let current = {};
  try {
    const raw = await fs.readFile(JSON_PATH, 'utf8');
    current = JSON.parse(raw);
  } catch (_) {
    // file may not exist yet — that's fine
  }

  const next = {
    ...current,
    watch_time_hours: String(hours),     // <- your front-end expects this key
    updatedAt: new Date().toISOString(), // keep your existing updatedAt semantics
  };

  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(next, null, 2), 'utf8');

  console.log(`Wrote watch_time_hours=${hours} to ${JSON_PATH}`);
}

main().catch(err => {
  console.error(err.response?.data || err);
  process.exit(1);
});
