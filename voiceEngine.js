const fs = require('fs');
const path = require('path');
const record = require('node-record-lpcm16');
const OpenAI = require('openai');
const { BrowserWindow } = require('electron');
const { appendMemory } = require('./memory');
const { chatWithGPT } = require('./chat');
require('dotenv').config();

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

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

function filterNoise(input, output, threshold = 0.10) {
  const buf = fs.readFileSync(input);
  if (buf.length <= 44) return false;
  const header = buf.subarray(0, 44);
  const data = Buffer.from(buf.subarray(44));
  let voiceCount = 0;
  for (let i = 0; i < data.length; i += 2) {
    const sample = data.readInt16LE(i);
    const norm = Math.abs(sample) / 32768;
    if (norm < threshold) {
      data.writeInt16LE(0, i);
    } else {
      voiceCount++;
    }
  }
  fs.writeFileSync(output, Buffer.concat([header, data]));
  const ratio = voiceCount / (data.length / 2);
  return ratio > 0.02;
}

async function startVoiceEngine() {
  const temp = path.join(__dirname, 'voice.wav');
  const filtered = path.join(__dirname, 'voice_clean.wav');
  let waiting = true;
  let lastGptReply = '';
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

    const hasVoice = filterNoise(temp, filtered);
    if (!hasVoice) {
      console.log('[voiceEngine] \u26a0\ufe0f detected only noise, skipping');
      continue;
    }

    if (!waiting) {
      console.log('[voiceEngine] \ud83c\udf99\ufe0f starting transcription\u2026');
    }

    let text = await transcribe(filtered);
    let cleaned = text.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    let wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (!cleaned || cleaned.length < 2) {
      console.log('[voiceEngine] \u26a0\ufe0f ignoring short transcription \u2192', text);
      continue;
    }
    if (!waiting) {
      console.log('[voiceEngine] \u2705 transcription complete \u2192', text);
    }

    if (waiting) {
      if (contains(text, WAKE_WORDS)) {
        const keyword = WAKE_WORDS.find(w => text.toLowerCase().includes(w));
        console.log('[voiceEngine] \ud83d\udd11 wake-word detected \u2192', keyword);
        waiting = false;
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('voice-reply', 'Yes, how can I help?');
        }
        const rest = text.toLowerCase().replace(keyword, '').trim();
        if (!rest) {
          continue;
        }
        text = rest;
        cleaned = text.replace(/[^a-zA-Z0-9 ]/g, '').trim();
        wordCount = text.split(/\s+/).filter(Boolean).length;
      } else {
        continue;
      }
    }

    if (contains(text, STOP_WORDS)) {
      BrowserWindow.getAllWindows()[0]?.webContents.send('cancel-tts');
      waiting = true;
      history.length = 0;
      continue;
    }

    const normText = text.trim().toLowerCase();
    const normReply = lastGptReply.trim().toLowerCase();
    const sim = similarity(normText, normReply);
    if (wordCount > 6 && sim > 0.9) {
      console.log('[voiceEngine] \ud83d\udd01 ignoring self transcription \u2192', text);
      continue;
    }

    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send('cancel-tts');
      win.webContents.send('voice-text', text);
    }

    history.push({ role: 'user', content: text });
    console.log('[voiceEngine] \ud83e\udd16 sending to GPT\u2026');
    let reply = '';
    if (win) {
      let spokenLogged = false;
      reply = await chatWithGPT(text, (t) => {
        if (!spokenLogged) {
          console.log('[voiceEngine] \ud83d\udd08 speaking reply\u2026');
          spokenLogged = true;
        }
        win.webContents.send('stream-token', t);
      });
    } else {
      reply = await chatWithGPT(text);
    }
    console.log('[voiceEngine] \ud83d\udcac GPT replied \u2192', reply);
    lastGptReply = reply.trim();
    history.push({ role: 'assistant', content: reply });
    await appendMemory(new Date().toISOString(), text, reply);
    if (win) {
      win.webContents.send('voice-reply', reply);
    }

    const end = await checkEnd(history);
    if (end) {
      waiting = true;
      history.length = 0;
    }
  }
}

module.exports = { startVoiceEngine };
