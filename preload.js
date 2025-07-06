const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (text) => ipcRenderer.invoke('send-message', text),
  onStreamToken: (cb) => ipcRenderer.on('stream-token', (event, token) => cb(token)),
  onStreamError: (cb) => ipcRenderer.on('stream-error', (event, msg) => cb(msg)),
  onCancelTts: (cb) => ipcRenderer.on('cancel-tts', () => cb()),
  onVoiceText: (cb) => ipcRenderer.on('voice-text', (event, text) => cb(text)),
  onVoiceReply: (cb) => ipcRenderer.on('voice-reply', (event, reply) => cb(reply)),
  toggleConversation: (enabled) => ipcRenderer.send('toggle-conversation', enabled),
  onConversationMode: (cb) => ipcRenderer.on('conversation-mode', (event, mode) => cb(mode)),
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID
});
