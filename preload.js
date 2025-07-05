const { contextBridge, ipcRenderer } = require('electron');
const { Howl } = require('howler');

contextBridge.exposeInMainWorld('electronAPI', {
  Howl,
  sendMessage: (text) => ipcRenderer.invoke('send-message', text),
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY
});
