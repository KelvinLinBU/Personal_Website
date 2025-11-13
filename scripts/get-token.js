// scripts/get-token.js
import 'dotenv/config';
import readline from 'node:readline/promises';
import { google } from 'googleapis';

const scopes = ['https://www.googleapis.com/auth/yt-analytics.readonly'];

async function main() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // desktop out-of-band
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  console.log('\nOpen this URL in your browser to authorize:\n');
  console.log(authUrl, '\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await rl.question('Paste the code here: ');
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  console.log('\nTokens received:');
  console.log(JSON.stringify(tokens, null, 2));

  if (tokens.refresh_token) {
    console.log('\nCopy this into your .env as YT_REFRESH_TOKEN:');
    console.log(tokens.refresh_token);
  } else {
    console.warn('\nNo refresh_token returned. Ensure you used "prompt=consent" and access_type=offline, and that you haven’t previously granted consent for this client.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
