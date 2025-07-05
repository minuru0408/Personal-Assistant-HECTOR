const {
    sendMessage,
    onStreamToken,
    onStreamError,
    elevenLabsApiKey,
    elevenLabsVoiceId
} = window.electronAPI

let audioQueue = Promise.resolve()

// queue and throttling state
let pendingText = ''
let processing = false
let lastRequestTime = 0
const REQUEST_INTERVAL = 1000 // 1 second

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(text) {
    const apiKey = elevenLabsApiKey
    if (!apiKey) {
        console.error('ELEVENLABS_API_KEY is not set')
        return null
    }
    const voiceId = elevenLabsVoiceId || 'JBFqnCBsd6RMkjVDRZzb'
    let backoff = 1000
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'audio/mpeg'
                },
                body: JSON.stringify({ text })
            })
            if (res.status === 429) {
                await delay(backoff)
                backoff *= 2
                continue
            }
            if (!res.ok) {
                throw new Error(`Status ${res.status}`)
            }
            return await res.arrayBuffer()
        } catch (err) {
            if (attempt === 4) {
                throw err
            }
            await delay(backoff)
            backoff *= 2
        }
    }
    return null
}

async function processQueue() {
    if (processing || !pendingText) return
    processing = true
    const wait = Math.max(REQUEST_INTERVAL - (Date.now() - lastRequestTime), 0)
    await delay(wait)
    const text = pendingText
    pendingText = ''
    try {
        const buf = await fetchWithRetry(text)
        if (!buf) return
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
    } catch (err) {
        console.error('Failed to get audio from ElevenLabs:', err)
    } finally {
        lastRequestTime = Date.now()
        processing = false
        if (pendingText) {
            processQueue()
        }
    }
}

function queueToken(token) {
    pendingText += token
    processQueue()
}

const chatWindow = document.querySelector('.chat-window')
let currentAiMessage = null

onStreamToken((token) => {
    if (currentAiMessage) {
        currentAiMessage.textContent += token
        queueToken(token)
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
