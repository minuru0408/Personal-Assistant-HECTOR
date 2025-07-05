// utils/searchWeb.js
const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

async function searchWeb(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    console.warn('❗ Invalid query passed to searchWeb():', query);
    return `I’m afraid I didn’t quite catch what you wanted me to search for, sir.`;
  }

  try {
    const url = 'https://www.googleapis.com/customsearch/v1';
    const res = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: encodeURIComponent(query.trim()),
        num: 3
      }
    });

    const items = res.data.items;
    if (!items || items.length === 0) {
      return `Regrettably, sir, I couldn’t locate any useful information on that topic.`;
    }

    const formatted = items.map((item, i) => {
      const title = item.title || 'Untitled Result';
      const snippet = item.snippet || 'No summary available.';
      const link = item.link || 'No link provided.';
      return `🔹 ${title}\n${snippet}\n${link}`;
    });

    return `Here’s what I found for you, sir:\n\n${formatted.join('\n\n')}`;

  } catch (error) {
    const status = error.response?.status || 'unknown';
    const message = error.response?.data?.error?.message || error.message;

    console.error(`❌ Google search error [${status}]:`, message);

    if (status === 400) {
      return `My sincerest apologies, sir. The request seems to be malformed. Could you kindly rephrase it for me?`;
    }

    return `Apologies, sir. I ran into an issue while searching. Might I try again shortly?`;
  }
}

module.exports = { searchWeb };
