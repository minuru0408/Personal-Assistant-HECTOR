require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { chatWithGPT } = require('./chat');
const { startVoiceEngine } = require('./voiceEngine');

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

// Allow audio playback without requiring a user gesture
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');


ipcMain.handle('send-message', async (event, userText) => {
  try {
    const reply = await chatWithGPT(userText, (token) => {
      event.sender.send('stream-token', token);
    });
    return reply;
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
  startVoiceEngine();

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
