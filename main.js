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
          content:
            'You are Hector, a Jarvis-inspired AI personal assistant. You are witty and formal, always addressing the user as "sir". Keep answers helpful, concise and peppered with dry humour when appropriate.'
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
