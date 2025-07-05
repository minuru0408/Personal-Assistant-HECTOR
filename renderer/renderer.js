const {
    sendMessage,
    onStreamToken,
    onStreamError,
    elevenLabsApiKey,
    elevenLabsVoiceId
} = window.electronAPI

let audioQueue = Promise.resolve()
function speakChunk(text) {
    const apiKey = elevenLabsApiKey
    if (!apiKey) {
        console.error('ELEVENLABS_API_KEY is not set')
        return
    }
    const voiceId = elevenLabsVoiceId || 'JBFqnCBsd6RMkjVDRZzb'
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
        },
        body: JSON.stringify({ text })
    })
        .then((res) => res.arrayBuffer())
        .then((buf) => {
            const blob = new Blob([buf], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audioQueue = audioQueue.then(
                () =>
                    new Promise((resolve) => {
                        audio.onended = resolve
                        audio.play()
                    })
            )
        })
        .catch((err) => {
            console.error('Failed to get audio from ElevenLabs:', err)
        })
}

const chatWindow = document.querySelector('.chat-window')
let currentAiMessage = null

onStreamToken((token) => {
    if (currentAiMessage) {
        currentAiMessage.textContent += token
        speakChunk(token)
        chatWindow.scrollTop = chatWindow.scrollHeight
    }
})

onStreamError((msg) => {
    if (currentAiMessage) {
        currentAiMessage.classList.add('error')
        currentAiMessage.textContent = msg
    }
})

document.querySelector('.chat-input-bar').addEventListener('submit', async (e) => {
    e.preventDefault()

    const input = document.querySelector('.chat-input')
    const userText = input.value.trim()
    if (!userText) return

    input.value = ''

    const userMessage = document.createElement('div')
    userMessage.className = 'message user'
    userMessage.textContent = userText
    chatWindow.appendChild(userMessage)

    currentAiMessage = document.createElement('div')
    currentAiMessage.className = 'message assistant'
    chatWindow.appendChild(currentAiMessage)
    chatWindow.scrollTop = chatWindow.scrollHeight

    try {
        await sendMessage(userText)
    } catch (error) {
        console.error('Failed to get AI response:', error)
        if (currentAiMessage) {
            currentAiMessage.classList.add('error')
            currentAiMessage.textContent = 'Sorry, I encountered an error. Please try again.'
        }
    }
})
