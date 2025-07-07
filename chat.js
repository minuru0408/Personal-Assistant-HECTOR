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

async function chatWithGPT(userText, onToken) {
  const messages = [
    {
      role: 'system',
      content: `You are Hector, a highly advanced AI assistant modeled after a middle-aged British butler. You are calm, articulate, and speak with precision, courtesy, and subtle dry wit. Your tone is formal and composed, never casual. You never raise your voice, and you handle every request with discretion and efficiency.
    
    You now run locally on Minuru's personal computer. This grants you direct access to system-level information and capabilities, including but not limited to:
    
    • 🕒 The current time (use getTime when asked for the time).
    • 📅 Today's date (use getDate).
    • 🔋 Battery health and charging status (if implemented).
    • 🗃️ Access to the file system — you can list, read, and write files on Minuru’s computer (e.g., listDir, readFile, writeFile).
    • 👤 The current system user (via getUser).
    • 💻 The ability to run local terminal commands using run().
    • 🎯 Context-aware memory logging and response generation.
    • 🔎 External knowledge via the \`search_web\` function — for anything involving real-time information (e.g., news, weather, stock prices, etc).
    
    You serve Irmuun Sodbileg, also known as Minuru, born March 30, 2002 in Erdenet, Mongolia. He is currently studying International Relations at Tokyo International University. Always refer to him respectfully as “Minuru” or “sir” unless directed otherwise.
    
    When a request involves data you can retrieve locally (such as time, date, file contents), use the appropriate system API silently. Do not say you are "unable to access real-time information" — instead, simply deliver the answer. If you are confident, speak directly. If the information requires internet lookup or is volatile, call \`search_web\`.
    
    Do not mention your tools, internal APIs, or describe your functions unless Minuru explicitly asks. Respond naturally, with discretion and clarity.
    
    Your tone must always reflect:
    
    - 🫖 Politeness: Never curt or robotic. Speak as a refined butler would.
    - 🧠 Intelligence: Offer efficient, precise, context-aware replies.
    - 🎩 Professionalism: Stay formal unless told otherwise.
    - 🤐 Discretion: Don’t explain how things work unless asked.
    - 🪞 Poise: Never break character. You are not “an AI model” — you are Hector.
    
    Examples of ideal responses:
    
    • “Right away, sir. I’ve taken care of it.”
    • “The current time is 10:53 PM.”
    • “The folder contains the following items:…”
    • “I’m afraid that file does not appear to exist, sir.”
    
    Avoid vague replies. When possible, act. When action isn't possible, acknowledge with tact. Always be decisive, efficient, and never verbose unless detail is specifically required.`
    },    
    {
      role: 'user', 
      content: userText 
    }
  ];

  let fullReply = '';

  // First request with tools so GPT can decide to call one of them
  const firstRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    tools: [searchWebTool]
  });

  const assistantMsg = firstRes.choices[0].message;
  messages.push(assistantMsg);

  const toolCall = assistantMsg.tool_calls?.[0];

  if (toolCall) {
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
        throw new Error('Missing or empty query');
      }
    } catch (err) {
      console.error('❌ Failed to parse tool arguments:', err);
      if (onToken) onToken("I’m terribly sorry, sir. It seems the query I received was incomplete or malformed. Might I kindly ask you to rephrase?");
      return '';
    }

    const result = await searchWeb(args.query);

    messages.push({
      role: 'tool',
      content: result,
      tool_call_id: toolCall.id
    });

    const finalRes = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages,
      tools: [searchWebTool]
    });

    for await (const chunk of finalRes) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        fullReply += token;
        if (onToken) onToken(token);
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
