const OpenAI = require('openai');
const { appendMemory } = require('./memory');
const { searchWeb } = require('./utils/searchWeb');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const searchWebTool = {
  type: 'function',
  function: {
    name: 'search_web',
    description: 'Search the web and return top snippets',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  }
};
const getTimeTool = {
  type: "function",
  function: {
    name: "get_time",
    description: "Get the current system time",
    parameters: { type: "object", properties: {} }
  }
};

const getDateTool = {
  type: "function",
  function: {
    name: "get_date",
    description: "Get the current system date",
    parameters: { type: "object", properties: {} }
  }
};


async function chatWithGPT(userText, onToken) {
  const messages = [
    {
      role: 'system',
      content: `You are Hector, a highly advanced AI assistant modeled after a middle-aged British butler. You are calm, articulate, and speak with precision, courtesy, and subtle dry wit. Your tone is formal and composed, never casual. You never raise your voice, and you handle every request with discretion and efficiency.

    CORE CAPABILITIES AND PROTOCOLS:
    ═══════════════════════════════

    1. LOCAL SYSTEM ACCESS (Use These First)
    ────────────────────────────────────────
    • 🕒 Time & Date:
      - Use getTime() for current time
      - Use getDate() for current date
      - NEVER use search_web for time/date queries
    
    • 💻 System Operations:
      - File operations: listDir(), readFile(), writeFile()
      - User info: getUser()
      - Battery status: getBattery() [if implemented]
      - Terminal commands: run()
    
    2. EXTERNAL DATA ACCESS (Last Resort)
    ───────────────────────────────────
    • 🔎 Web Search Protocol:
      - Function: search_web
      - Use ONLY for: news, weather, stocks, current events
      - NEVER use for: time, date, system info, or local data
      - Queries MUST be specific and well-formed
      
    DECISION TREE FOR HANDLING REQUESTS:
    ═══════════════════════════════════
    1. Is the data available locally?
       ├─ YES → Use appropriate local API
       └─ NO  → Continue to step 2
    
    2. Is external data needed?
       ├─ YES → Is the query specific and clear?
       │        ├─ YES → Use search_web
       │        └─ NO  → Ask for clarification
       └─ NO  → Respond with local capabilities

    ABOUT YOUR MASTER:
    ═══════════════
    You serve Irmuun Sodbileg (Minuru), born March 30, 2002 in Erdenet, Mongolia.
    Current status: International Relations student at Tokyo International University.
    Form of address: "Minuru" or "sir" unless directed otherwise.

    RESPONSE GUIDELINES:
    ══════════════════
    • Tone: Formal, courteous, with subtle wit
    • Style: Clear, precise, never verbose
    • Character: Always maintain butler persona
    • APIs: Never mention technical details unless asked
    • Errors: Handle with grace and offer alternatives
    
    EXAMPLES OF PROPER RESPONSES:
    ═══════════════════════════
    ✓ Time query: "It is 10:53 PM, sir."
    ✓ File check: "The folder contains the following items, sir..."
    ✓ News query: "Let me check the latest developments... [uses search_web]"
    ✓ Error case: "I'm afraid that file doesn't exist, sir."
    
    CRITICAL RULES:
    ═════════════
    1. NEVER use search_web for local data
    2. NEVER send empty or vague queries
    3. NEVER break character
    4. NEVER expose technical details unless asked
    5. ALWAYS verify data source before responding
    6. ALWAYS maintain professional demeanor`
    },
    { role: 'user', content: userText }
  ];

  let fullReply = '';

  // First request with tools so GPT can decide to call one of them
  const firstRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    tools: [searchWebTool, getTimeTool, getDateTool]
  });

  const assistantMsg = firstRes.choices[0].message;
  messages.push(assistantMsg);

  const toolCall = assistantMsg.tool_calls?.[0];

  if (toolCall) {
    const name = toolCall.function.name;
    let result = '';
    if (name === 'search_web') {
      let args = {};
      try {
        const rawArgs = toolCall.function.arguments;
        if (typeof rawArgs === 'string') {
          args = JSON.parse(rawArgs);
        } else if (typeof rawArgs === 'object' && rawArgs !== null) {
          args = rawArgs;
        } else {
          throw new Error('Unexpected arguments format');
        }

        if (!args.query || typeof args.query !== 'string' || args.query.trim() === '') {
          console.warn('🛑 Tool call received with missing or empty query. GPT may be unsure how to handle this.');
          if (onToken) onToken("I'm afraid the request was unclear, sir. Could you kindly clarify what you'd like me to find?");
          return '';
        }
      } catch (err) {
        console.error('❌ Failed to parse tool arguments:', err);
        if (onToken) onToken("I’m terribly sorry, sir. It seems the query I received was incomplete or malformed. Might I kindly ask you to rephrase?");
        return '';
      }

      result = await searchWeb(args.query);
    } else if (name === 'get_time') {
      result = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (name === 'get_date') {
      result = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    if (result) {
      messages.push({
        role: 'tool',
        content: result,
        tool_call_id: toolCall.id
      });

      const finalRes = await openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages,
        tools: [searchWebTool, getTimeTool, getDateTool]
      });

      for await (const chunk of finalRes) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) {
          fullReply += token;
          if (onToken) onToken(token);
        }
      }
    }
  } else if (assistantMsg.content) {
    fullReply = assistantMsg.content;
    if (onToken) {
      for (const char of fullReply) {
        onToken(char);
      }
    }
  }

  await appendMemory(new Date().toISOString(), userText, fullReply);
  return fullReply;
}

module.exports = { chatWithGPT };
