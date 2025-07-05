const fs = require('fs');
const path = require('path');
const record = require('node-record-lpcm16');
const OpenAI = require('openai');
const { BrowserWindow } = require('electron');
const { appendMemory } = require('./memory');
const { chatWithGPT } = require('./chat');
require('dotenv').config();

const WAKE_WORDS = ['hey hector', 'hector', 'hey buddy'];
const STOP_WORDS = ['hey stop', 'stop'];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function contains(text, list) {
  return list.some(w => text.toLowerCase().includes(w));
}

async function transcribe(file) {
  const res = await openai.audio.transcriptions.create({
    file: fs.createReadStream(file),
    model: 'whisper-1'
  });
  return res.text.trim();
}

async function checkEnd(history) {
  const messages = [
    { role: 'system', content: 'If the user clearly ended the conversation reply with YES, otherwise NO.' },
    ...history
  ];
  try {
    const res = await openai.chat.completions.create({ model: 'gpt-4', messages });
    const text = res.choices[0].message.content.toLowerCase();
    return text.includes('yes');
  } catch {
    return false;
  }
}

async function startVoiceEngine() {
  const temp = path.join(__dirname, 'voice.wav');
  let waiting = true;
  const history = [];
  while (true) {
    await new Promise((resolve) => {
      const recorder = record.record({ sampleRate: 16000, threshold: 0, silence: '1.0' });
      const audioStream = recorder.stream();
      audioStream.on('data', chunk => {
        console.log('[voiceEngine] \ud83d\udd0a got audio chunk, length =', chunk.length);
      });
      const file = fs.createWriteStream(temp);
      audioStream.pipe(file);
      audioStream.on('end', resolve);
      setTimeout(() => recorder.stop(), 6000);
    });

    const text = await transcribe(temp);
    if (!text) continue;

    if (waiting) {
      if (contains(text, WAKE_WORDS)) {
        const keyword = WAKE_WORDS.find(w => text.toLowerCase().includes(w));
        console.log('[voiceEngine] \ud83d\udd11 wake-word detected \u2192', keyword);
        waiting = false;
      }
      continue;
    }

    if (contains(text, STOP_WORDS)) {
      BrowserWindow.getAllWindows()[0]?.webContents.send('cancel-tts');
      waiting = true;
      history.length = 0;
      continue;
    }

    history.push({ role: 'user', content: text });
    let reply = '';
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      reply = await chatWithGPT(text, (t) => win.webContents.send('stream-token', t));
    } else {
      reply = await chatWithGPT(text);
    }
    history.push({ role: 'assistant', content: reply });
    await appendMemory(new Date().toISOString(), text, reply);

    const end = await checkEnd(history);
    if (end) {
      waiting = true;
      history.length = 0;
    }
  }
}

module.exports = { startVoiceEngine };
