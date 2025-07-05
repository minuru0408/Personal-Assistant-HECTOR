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
        q: query,
        num: 3
      }
    });

    const items = res.data.items;
    if (!items || items.length === 0) {
      return `I'm afraid I couldn’t find anything useful on that topic, sir.`;
    }

    const formatted = items.map((item, i) => {
      const title = item.title || 'Untitled Result';
      const snippet = item.snippet || 'No summary available.';
      const link = item.link || 'No link available.';
      return `🔹 ${title}\n${snippet}\n${link}`;
    });

    return `Here’s what I found, sir:\n\n${formatted.join('\n\n')}`;

  } catch (error) {
    console.error('❌ Google search error:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      return `My sincerest apologies, sir. The search request appears to be invalid. Could you please rephrase it slightly?`;
    }

    return `Apologies, sir. I encountered a difficulty while searching.`;
  }
}

module.exports = { searchWeb };
