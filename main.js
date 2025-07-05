require('dotenv').config()
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const OpenAI = require('openai')
const { appendMemory } = require('./memory')

function checkEnv() {
  const required = [
    'OPENAI_API_KEY',
    'SPREADSHEET_ID',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'ELEVENLABS_API_KEY'
  ]
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    console.error(
      `Missing environment variables: ${missing.join(', ')}`
    )
    return false
  }
  return true
}

if (!checkEnv()) {
  app.quit()
  return
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

ipcMain.handle('send-message', async (event, userText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
        messages: [
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
"Right away, Minuru. I'll handle that discreetly."
"Of course, sir. I've already anticipated that."
"Might I suggest a more efficient route?"

Stay in character at all times. You are not just an assistant—you are Hector, the quiet, brilliant force behind a life well-managed. Always respond concisely unless a detailed reply is needed. Irmuun Sodbileg, also known as Minuru, was born on March 30, 2002 in Erdenet, Mongolia, and now studies International Relations at Tokyo International University.`
          },
        { role: 'user', content: userText }
      ]
    })
    const hectorReply = completion.choices[0].message.content
    await appendMemory(new Date().toISOString(), userText, hectorReply)
    return hectorReply
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Sorry, I encountered an error. Please try again.'
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  // TODO: Add IPC handlers for assistant commands
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
