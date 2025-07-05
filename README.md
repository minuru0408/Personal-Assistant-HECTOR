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
4. Start the app with `npm start`.
