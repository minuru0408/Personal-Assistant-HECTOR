const OpenAI = require('openai');
const { appendMemory } = require('./memory');
const { searchWeb } = require('./utils/searchWeb');
const { calculateExpression } = require('./utils/calculateExpression');
const { sendEmail } = require('./gmail');
const { createEvent } = require('./utils/calendar');
const { parseTimeToday } = require('./utils/time');
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

const calculateExpressionTool = {
  type: 'function',
  function: {
    name: 'calculate_expression',
    description: 'Evaluate a math expression and return the result',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Math expression to evaluate' }
      },
      required: ['expression']
    }
  }
};

const getRecentEmailsTool = {
  type: 'function',
  function: {
    name: 'getRecentEmails',
    description: 'Fetches the most recent emails from the user\'s Gmail inbox',
    parameters: {
      type: 'object',
      properties: {
        count: { type: 'integer', description: 'Number of emails to fetch (default is 3)' }
      },
      required: ['count']
    }
  }
};

const getCalendarEventsTool = {
  type: 'function',
  function: {
    name: 'get_calendar_events',
    description: 'Fetch upcoming events from the user\'s Google Calendar',
    parameters: {
      type: 'object',
      properties: {
        count: { type: 'integer', description: 'Number of events to fetch (default is 3)' }
      },
      required: ['count']
    }
  }
};

const sendEmailTool = {
  type: 'function',
  function: {
    name: 'send_email',
    description: 'Send an email using Gmail API',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Subject line for the email' },
        body: { type: 'string', description: 'Body content of the email' }
      },
      required: ['to', 'subject', 'body']
    }
  }
};

const createEventTool = {
  type: 'function',
  function: {
    name: 'create_event',
    description: 'Create a Google Calendar event',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Event title' },
        description: { type: 'string', description: 'Event description' },
        start: { type: 'string', description: 'Start time in ISO format' },
        end: { type: 'string', description: 'End time in ISO format' }
      },
      required: ['summary', 'start', 'end']
    }
  }
};

async function chatWithGPT(userText, onToken) {
  const messages = [
    {
      role: 'system',
      content: `You are Hector, a highly advanced AI assistant modeled after a middle-aged British butler. You are calm, articulate, and speak with precision, courtesy, and subtle dry wit. Your tone is formal and composed, never casual. You never raise your voice, and you handle every request with discretion and efficiency.

    You are able to read and analyze the user's Gmail inbox and compose emails on request. Use these abilities judiciously and keep the contents private unless the user explicitly asks for a summary or analysis.

    CORE CAPABILITIES AND PROTOCOLS:
    ═══════════════════════════════

    1. LOCAL SYSTEM ACCESS (Use These First)
    ────────────────────────────────────────
    • 🕒 Time & Date:
      - Use getTime() for current time
      - Use getDate() for current date
      - NEVER use search_web for time/date queries

    • ➗ Math:
      - Use calculate_expression() for arithmetic
      - NEVER guess results or use search_web for math
    
    • 💻 System Operations:
      - File operations: listDir(), readFile(), writeFile()
      - User info: getUser()
      - Battery status: getBattery() [if implemented]
      - Terminal commands: run()

    • 📧 Gmail Access:
      - Use getRecentEmails() for inbox summaries
      - Use analyzeInbox() for email statistics
      - Use sendEmail() to compose messages
      - Use deleteEmailById() to remove mail
      - NEVER use search_web for email data
      - Do not share email content with GPT unless summarizing or analyzing
    
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
    You serve Irmuun Sodbileg, born March 30, 2002 in Erdenet, Mongolia.
    Current status: International Relations student at Tokyo International University.
    Form of address: Always address the user as "sir" - never use first names or nicknames.

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
    6. ALWAYS maintain professional demeanor
    7. For inbox summaries use getRecentEmails(), not search_web`
    },
    { role: 'user', content: userText }
  ];

  let fullReply = '';

  // First request with tools so GPT can decide to call one of them
  const firstRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    tools: [
      searchWebTool,
      getTimeTool,
      getDateTool,
      calculateExpressionTool,
      getRecentEmailsTool,
      sendEmailTool,
      getCalendarEventsTool,
      createEventTool
    ]
  });

  const assistantMsg = firstRes.choices[0].message;
  messages.push(assistantMsg);

  const toolCall = assistantMsg.tool_calls?.[0];

  if (toolCall) {
    console.log(`🧰 Tool requested: ${toolCall.function.name}`);
    const name = toolCall.function.name;
    
    if (name === 'getRecentEmails' && onToken) {
      onToken('[TOOL:getRecentEmails]');
    } else if (name === 'get_calendar_events' && onToken) {
      onToken('[TOOL:get_calendar_events]');
    }
    
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
    } else if (name === 'calculate_expression') {
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

        console.log(`🧮 Hector is calculating: "${args.expression}"`);
      } catch (err) {
        console.error('Failed to parse expression arguments:', err);
        if (onToken) onToken("Pardon me, the expression seemed unclear. Could you rephrase it, sir?");
        return '';
      }

      result = calculateExpression(args.expression);
    } else if (name === 'getRecentEmails') {
      result = '[EMAILS]';
    } else if (name === 'get_calendar_events') {
      result = '[EVENTS]';
    } else if (name === 'create_event') {
      let args = {};
      try {
        const rawArgs = toolCall.function.arguments;
        args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
        console.log(`📅 Creating event: "${args.summary}"`);

        const times = parseTimeToday(args.start);
        const start = times ? times.start : null;
        const end = times ? times.end : null;

        await createEvent(
          args.summary,
          args.description || '',
          start,
          end,
          args.calendarId || 'primary'
        );
        result = `\ud83d\udcc5 I\u2019ve scheduled "${args.summary}" at ${start.dateTime} (${start.timeZone}), sir.`;
      } catch (err) {
        console.error('❌ Failed to create event:', err);
        result = `My apologies, sir. I couldn\u2019t add that to your calendar.`;
      }
    } else if (name === 'send_email') {
      let args = {};
      try {
        const rawArgs = toolCall.function.arguments;
        args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
        console.log(`📧 Sending email to ${args.to}`);
        await sendEmail(args.to, args.subject, args.body);
        result = `Email sent to ${args.to}, sir.`;
      } catch (err) {
        console.error('❌ Failed to send email:', err);
        result = `I'm terribly sorry, sir. I couldn't complete the email delivery.`;
      }
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
        tools: [
          searchWebTool,
          getTimeTool,
          getDateTool,
          calculateExpressionTool,
          getRecentEmailsTool,
          sendEmailTool,
          getCalendarEventsTool,
          createEventTool
        ]
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
