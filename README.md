# Personal Assistant

This desktop app uses the OpenAI API and stores chats in a Google Sheet.
It can also read replies aloud using the ElevenLabs text-to-speech service.
To run it, you need an OpenAI key, Google credentials and an ElevenLabs key.
The app checks that all required environment variables are set and will
exit with a helpful message if any are missing. You can optionally define
function tools for OpenAI requests. If no tools are configured, the
request is sent without them. Web search requires `GOOGLE_API_KEY` and
`GOOGLE_CSE_ID`.

1. Copy `.env.example` to `.env`.
2. Replace the example values in `.env` with your own keys. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` for speech, and `GOOGLE_API_KEY` with `GOOGLE_CSE_ID` for web search.
3. Install dependencies with `npm install`.
4. Download a Gmail OAuth client JSON from the Google Cloud console and save it as `gmail-credentials.json` in this folder. Then run `node gmail.js` once and follow the link to grant access. This creates `gmail-token.json` so Hector can read your inbox.
5. Install SoX for audio recording (for example, `brew install sox`). Run `sox --version` to check that it works. If your computer asks for microphone access, allow it so recording can start.
6. Make sure the `wav` package is installed; it encodes the microphone input as a proper WAV file.
7. Start the app with `npm start`.
