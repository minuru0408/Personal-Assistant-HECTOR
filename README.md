# Personal Assistant

This desktop app uses the OpenAI API and stores chats in a Google Sheet.
It can also read replies aloud using the ElevenLabs text-to-speech service.
To run it, you need an OpenAI key, Google credentials and an ElevenLabs key.
The app now checks that all required environment variables are set
and will exit with a helpful message if any are missing. The OpenAI
request configuration now includes a *web search* tool so the model can
look up information online when needed.

1. Copy `.env.example` to `.env`.
2. Replace the example values in `.env` with your own keys. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` to enable spoken replies.
3. Install dependencies with `npm install`.
4. Start the app with `npm start`.
