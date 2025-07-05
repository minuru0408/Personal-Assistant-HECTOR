const axios = require('axios')

async function searchWeb(query) {
  const key = process.env.GOOGLE_API_KEY
  const cx = process.env.GOOGLE_CSE_ID
  if (!key || !cx) {
    throw new Error('Google search environment variables are missing')
  }
  try {
    const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key,
        cx,
        q: query,
        num: 3
      }
    })
    const items = res.data.items || []
    return items.slice(0, 3).map((item) => item.snippet).join('\n')
  } catch (err) {
    console.error('Google search error:', err.message)
    throw err
  }
}

module.exports = { searchWeb }
