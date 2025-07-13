const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (text) => ipcRenderer.invoke('send-message', text),
  onStreamToken: (cb) => ipcRenderer.on('stream-token', (event, token) => cb(token)),
  onStreamError: (cb) => ipcRenderer.on('stream-error', (event, msg) => cb(msg)),
  onCancelTts: (cb) => ipcRenderer.on('cancel-tts', () => cb()),
  onVoiceText: (cb) => ipcRenderer.on('voice-text', (event, text) => cb(text)),
  onVoiceReply: (cb) => ipcRenderer.on('voice-reply', (event, reply) => cb(reply)),
  toggleConversation: (enabled) => ipcRenderer.send('toggle-conversation', enabled),
  onConversationMode: (cb) => ipcRenderer.on('conversation-mode', (event, mode) => cb(mode)),
  onClearChat: (cb) => ipcRenderer.on('clear-chat', () => cb()),
  clearChat: () => ipcRenderer.send('clear-chat'),
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
  getTime: () => new Date().toString(),
  getUser: () => os.userInfo().username,
  listDir: (p) => {
    const dir = p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
    return fs.readdirSync(dir);
  },
  readFile: (p) => {
    const file = p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
    return fs.readFileSync(file, 'utf8');
  },
  writeFile: (p, content) => {
    const file = p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
    fs.writeFileSync(file, content, 'utf8');
    return true;
  },
  // Request recent emails through the main process
  // Expose the same helper on systemAPI
  getRecentEmails: (count) => ipcRenderer.invoke('get-recent-emails', count),
  getUpcomingEvents: (count) => ipcRenderer.invoke('get-upcoming-events', count),
  createEvent: (details) => ipcRenderer.invoke('create-event', details),
  deleteEvent: (id) => ipcRenderer.invoke('delete-event', id),
  run: (cmd) =>
    new Promise((resolve) =>
      exec(cmd, (error, stdout, stderr) => {
        if (error) resolve(stderr);
        else resolve(stdout);
      })
    )
});

contextBridge.exposeInMainWorld('systemAPI', {
  getTime: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  getDate: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  getRecentEmails: (count) => ipcRenderer.invoke('get-recent-emails', count),
  getUpcomingEvents: (count) => ipcRenderer.invoke('get-upcoming-events', count),
  createEvent: (details) => ipcRenderer.invoke('create-event', details),
  deleteEvent: (id) => ipcRenderer.invoke('delete-event', id),
  sendEmail: (to, subject, body) =>
    ipcRenderer.invoke('send-email', to, subject, body),
  analyzeInbox: () => ipcRenderer.invoke('analyze-inbox'),
});

