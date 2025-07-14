require('dotenv').config();
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { chatWithGPT } = require('./chat');
const { startVoiceEngine, setConversationMode } = require('./voiceEngine');
const { readRecentMemory } = require('./memory');
const {
  getRecentEmails,
  sendEmail,
  analyzeInbox,
} = require('./gmail');
const {
  getUpcomingEvents,
  createEvent,
  deleteEvent
} = require('./utils/calendar');

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
    const message = `Please set: ${missing.join(', ')}`;
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    dialog.showErrorBox('Missing Environment Variables', message);
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

ipcMain.handle('get-recent-emails', async (_event, count) => {
  const num = Number.isInteger(count) ? count : parseInt(count, 10);
  const safeCount = Math.min(Math.max(num || 3, 1), 20);
  return getRecentEmails(safeCount);
});

ipcMain.handle('get-upcoming-events', async (_event, count) => {
  const num = Number.isInteger(count) ? count : parseInt(count, 10);
  const safeCount = Math.min(Math.max(num || 3, 1), 20);
  return getUpcomingEvents(safeCount);
});

ipcMain.handle('create-event', async (_event, details) => {
  return createEvent(
    details.summary,
    details.description,
    details.start,
    details.end,
    details.calendarId || 'primary'
  );
});

ipcMain.handle('delete-event', async (_event, eventId) => {
  return deleteEvent(eventId);
});

ipcMain.handle('read-recent-memory', async (_event, count) => {
  const num = Number.isInteger(count) ? count : parseInt(count, 10);
  const safeCount = Math.min(Math.max(num || 5, 1), 20);
  return readRecentMemory(safeCount);
});

ipcMain.handle('send-email', async (_event, to, subject, body) => {
  return sendEmail(to, subject, body);
});

ipcMain.handle('analyze-inbox', async () => {
  return analyzeInbox();
});

ipcMain.on('toggle-conversation', (event, enabled) => {
  setConversationMode(enabled);
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('conversation-mode', enabled));
});

ipcMain.on('clear-chat', () => {
  console.log('[hector] \ud83e\udd9a clearing chat');
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('clear-chat'));
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('conversation-mode', true);
  });
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
