const { sendMessage, elevenLabsApiKey } = window.electronAPI

async function speakText(text) {
    const apiKey = elevenLabsApiKey
    if (!apiKey) {
        console.error('ELEVENLABS_API_KEY is not set')
        return
    }

    try {
        const voiceId = window.electronAPI.elevenLabsVoiceId || 'JBFqnCBsd6RMkjVDRZzb'
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'audio/mpeg'
                },
                body: JSON.stringify({ text })
            }
        )

        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
    } catch (error) {
        console.error('Failed to get audio from ElevenLabs:', error)
    }
}

document.querySelector('.chat-input-bar').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const input = document.querySelector('.chat-input')
    const userText = input.value.trim()
    if (!userText) return
    
    // Clear input
    input.value = ''
    
    // Add user message
    const chatWindow = document.querySelector('.chat-window')
    const userMessage = document.createElement('div')
    userMessage.className = 'message user'
    userMessage.textContent = userText
    chatWindow.appendChild(userMessage)
    
    // Get AI response
    try {
        const response = await sendMessage(userText)
        const aiMessage = document.createElement('div')
        aiMessage.className = 'message assistant'
        aiMessage.textContent = response
        chatWindow.appendChild(aiMessage)
        speakText(response)
    } catch (error) {
        console.error('Failed to get AI response:', error)
        const errorMessage = document.createElement('div')
        errorMessage.className = 'message assistant error'
        errorMessage.textContent = 'Sorry, I encountered an error. Please try again.'
        chatWindow.appendChild(errorMessage)
    }
    
    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight
})
