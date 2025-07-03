const { ipcRenderer } = require('electron')

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
        const response = await ipcRenderer.invoke('send-message', userText)
        const aiMessage = document.createElement('div')
        aiMessage.className = 'message assistant'
        aiMessage.textContent = response
        chatWindow.appendChild(aiMessage)
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
