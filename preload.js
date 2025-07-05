const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (text) => ipcRenderer.invoke('send-message', text),
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID
});
