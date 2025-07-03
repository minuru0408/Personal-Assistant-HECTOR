require('dotenv').config()
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

ipcMain.handle('send-message', async (event, userText) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are Hector, a Jarvis-inspired AI personal assistant. You are witty and formal, always addressing the user as "sir". Keep answers helpful, concise and peppered with dry humour when appropriate.'
        },
        { role: 'user', content: userText }
      ]
    })
    return completion.choices[0].message.content
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
      nodeIntegration: true,
      contextIsolation: false
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
