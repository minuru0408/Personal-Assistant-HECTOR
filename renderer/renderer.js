const {
    sendMessage,
    onStreamToken,
    onStreamError,
    onCancelTts,
    onVoiceText,
    onVoiceReply,
    toggleConversation,
    onConversationMode,
    onClearChat,
    clearChat,
    elevenLabsApiKey,
    elevenLabsVoiceId,
    getUser,
    listDir,
    readFile,
    writeFile,
    run
} = window.electronAPI

const { getTime } = window.systemAPI
const { getRecentEmails } = window.electronAPI

let audioQueue = Promise.resolve()
let currentAudio = null

// queue and throttling state
let pendingText = ''
let processing = false
let lastRequestTime = 0
const REQUEST_INTERVAL = 1000 // 1 second
let buffered = ''
let emailToolRequested = false

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
    const text = pendingText.trim()
    pendingText = ''
    console.log('[voiceEngine] \ud83d\uddE3\ufe0f speaking buffered:', text)
    try {
        const buf = await fetchWithRetry(text)
        if (!buf) return
        const blob = new Blob([buf], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        currentAudio = audio
        audioQueue = audioQueue.then(
            () =>
                new Promise((resolve) => {
                    audio.onended = () => { currentAudio = null; resolve() }
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

function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
        audioQueue = Promise.resolve()
        pendingText = ''
        buffered = ''
    }
}

function flushBuffer() {
    if (buffered.trim()) {
        pendingText += buffered
        buffered = ''
        processQueue()
    }
}

function queueToken(token) {
    buffered += token
    const trimmed = buffered.trim()
    const endsWithPunct = /[.!?]$/.test(trimmed)
    const exceedsLength = trimmed.length >= 120
    if (endsWithPunct || exceedsLength) {
        pendingText += buffered
        buffered = ''
        processQueue()
    }
}

const chatWindow = document.querySelector('.chat-window')
let currentAiMessage = null

function clearChatWindow() {
    chatWindow.innerHTML = ''
    currentAiMessage = null
}

onClearChat(() => {
    clearChatWindow()
})

function isClearCommand(text) {
    const normalized = text
        .toLowerCase()
        .replace(/[^a-z]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    const phrases = ['delete chat', 'clear conversation', 'clear the chat']
    return phrases.some(p => normalized === p || normalized === `hector ${p}`)
}

function addAssistantMessage(text) {
    const aiMessage = document.createElement('div')
    aiMessage.className = 'message assistant'
    aiMessage.textContent = text
    chatWindow.appendChild(aiMessage)
    chatWindow.scrollTop = chatWindow.scrollHeight
}

async function handleLocalCommand(text) {
    const lower = text.toLowerCase().trim()
    if (lower === 'what time is it') {
        console.log('[hector] answering from local APIs: time request')
        const time = getTime()
        addAssistantMessage(time)
        return true
    }
    if (lower === 'where am i') {
        console.log('[hector] answering from local APIs: location request')
        addAssistantMessage('Location access not enabled')
        return true
    }
    if (lower.includes('list') && lower.includes('desktop')) {
        try {
            const files = await listDir('~/Desktop')
            addAssistantMessage(files.join('\n'))
        } catch {
            addAssistantMessage('Could not list desktop files')
        }
        return true
    }
    return false
}

onStreamToken((token) => {
    if (!emailToolRequested && token.includes('getRecentEmails')) {
        emailToolRequested = true
    }
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

onCancelTts(() => {
    stopCurrentAudio()
})

onVoiceText((text) => {
    const userMessage = document.createElement('div')
    userMessage.className = 'message user'
    userMessage.textContent = text
    chatWindow.appendChild(userMessage)

    currentAiMessage = document.createElement('div')
    currentAiMessage.className = 'message assistant'
    chatWindow.appendChild(currentAiMessage)
    chatWindow.scrollTop = chatWindow.scrollHeight
})

onVoiceReply(async (reply) => {
    if (currentAiMessage) {
        currentAiMessage.textContent = reply
    }
    flushBuffer()
    if (emailToolRequested) {
        try {
            const emails = await getRecentEmails(5)
            for (const mail of emails) {
                const text = `From: ${mail.sender}\nSubject: ${mail.subject}\nSnippet: ${mail.snippet}`
                addAssistantMessage(text)
            }
        } catch (err) {
            addAssistantMessage('Failed to fetch recent emails')
        }
        emailToolRequested = false
    }
})

const statusEl = document.querySelector('.status')
const toggleBtn = document.getElementById('conversation-toggle')
let conversationEnabled = true

toggleBtn.addEventListener('click', () => {
    conversationEnabled = !conversationEnabled
    toggleConversation(conversationEnabled)
    toggleBtn.textContent = conversationEnabled ? 'Pause' : 'Resume'
    statusEl.textContent = conversationEnabled ? 'Listening' : 'Standby'
})

onConversationMode((mode) => {
    conversationEnabled = mode
    toggleBtn.textContent = mode ? 'Pause' : 'Resume'
    statusEl.textContent = mode ? 'Listening' : 'Standby'
})

document.querySelector('.chat-input-bar').addEventListener('submit', async (e) => {
    e.preventDefault()

    const input = document.querySelector('.chat-input')
    const userText = input.value.trim()
    if (!userText) return

    input.value = ''

    if (isClearCommand(userText)) {
        console.log('[hector] \ud83e\udd9a clearing chat')
        clearChat()
        return
    }

    const userMessage = document.createElement('div')
    userMessage.className = 'message user'
    userMessage.textContent = userText
    chatWindow.appendChild(userMessage)

    currentAiMessage = document.createElement('div')
    currentAiMessage.className = 'message assistant'
    chatWindow.appendChild(currentAiMessage)
    chatWindow.scrollTop = chatWindow.scrollHeight

    if (await handleLocalCommand(userText)) {
        return
    }

    try {
        await sendMessage(userText)
        flushBuffer()
    } catch (error) {
        console.error('Failed to get AI response:', error)
        if (currentAiMessage) {
            currentAiMessage.classList.add('error')
            currentAiMessage.textContent = 'Sorry, I encountered an error. Please try again.'
        }
    }
})
