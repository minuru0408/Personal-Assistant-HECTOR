// utils/searchWeb.js
const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

async function searchWeb(query) {
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
      return `I'm afraid I couldn’t find anything on that topic, sir.`;
    }

    const formatted = items.map((item, i) => {
      return `🔹 ${item.title}\n${item.snippet}\n${item.link}`;
    });

    return `Here’s what I found, sir:\n\n${formatted.join('\n\n')}`;

  } catch (error) {
    console.error('Google search error:', error.message);
    return `Apologies, sir. I encountered a difficulty while searching.`;
  }
}

module.exports = { searchWeb };
