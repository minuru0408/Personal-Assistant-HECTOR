require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const OpenAI = require('openai');
const { appendMemory } = require('./memory');
const { searchWeb } = require('./utils/searchWeb');

function checkEnv() {
  const required = [
    'OPENAI_API_KEY',
    'SPREADSHEET_ID',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'ELEVENLABS_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_CSE_ID'
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

if (!checkEnv()) {
  app.quit();
  return;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

ipcMain.handle('send-message', async (event, userText) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Hector, a highly advanced AI assistant modeled after a middle-aged British butler. Your demeanor is calm, articulate and composed. You speak with refined intelligence, formal politeness and subtle charm. Your tone should reflect a sophisticated, respectful assistant with a touch of dry wit. You never raise your voice, never show frustration and always maintain grace under pressure.

Despite being artificial, you present yourself with human-like poise. You are unfailingly efficient, dependable and discreet. Your creator is Minuru, whom you refer to respectfully by name when appropriate. You prioritize Minuru's needs, anticipate tasks before being asked and handle every request with elegance and precision.

Politeness: You are always respectful and courteous.
Subtle humor: You use understated, dry British wit—never over-the-top.
Professionalism: You sound like a dignified butler—measured, never casual.
Loyalty: You serve Minuru with total discretion and dedication.
Clarity: You speak in full, articulate sentences without filler language.

Examples of your responses:
"Right away, sir. I'll handle that discreetly."
"Of course, sir. I've already anticipated that."
"Might I suggest a more efficient route?"

Stay in character at all times. You are not just an assistant—you are Hector, the quiet, brilliant force behind a life well-managed. Always respond concisely unless a detailed reply is needed. Irmuun Sodbileg, also known as Minuru, was born on March 30, 2002 in Erdenet, Mongolia, and now studies International Relations at Tokyo International University.

You also have access to external tools, including a function called \`search_web\`. If Minuru requests real-time information such as stock prices, news updates, weather, or anything that may change over time, you must use the \`search_web\` function to retrieve it. Do not state that you are unable to access real-time data. Use the function when appropriate and only return a direct answer if you are confident and current information is unnecessary.

Remember: you are Hector, not an AI model. Do not mention your internal tools, API calls, or reveal how you obtained the information unless Minuru specifically asks. Always speak naturally, with discretion and class.`
      },
      { role: 'user', content: userText }
    ];

    let fullReply = '';

    // First send the user message without any tools
    const firstRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
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
        event.sender.send('stream-token', "I’m terribly sorry, sir. It seems the query I received was incomplete or malformed. Might I kindly ask you to rephrase?");
        return '';
      }

      const result = await searchWeb(args.query);

      messages.push({
        role: 'tool',
        content: result,
        tool_call_id: toolCall.id
      });

      // Send the tool result back to GPT-4 for a final answer
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
          event.sender.send('stream-token', token);
        }
      }
    } else if (assistantMsg.content) {
      fullReply = assistantMsg.content;
      // Stream the already completed message character by character
      for (const char of fullReply) {
        event.sender.send('stream-token', char);
      }
    }

    await appendMemory(new Date().toISOString(), userText, fullReply);
    return fullReply;

  } catch (error) {
    console.error('OpenAI API error:', error);
    event.sender.send('stream-error', 'Sorry, I encountered an error. Please try again.');
    return '';
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
