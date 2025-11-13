// fetch_youtube_stats.js
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

async function fetchYouTubeStats() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.error("No data found. Check API key or channel ID.");
    return;
  }

  const stats = data.items[0].statistics;
  const formatted = {
    totalViews: Number(stats.viewCount).toLocaleString(),
    subscribers: Number(stats.subscriberCount).toLocaleString(),
    videos: Number(stats.videoCount).toLocaleString(),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync("./resources/data/youtube_stats.json", JSON.stringify(formatted, null, 2));
  console.log("✅ YouTube stats updated:", formatted);
}

fetchYouTubeStats();
