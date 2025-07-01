console.log("Dashboard renderer loaded");

// TODO: hook up interactivity

// TODO: Add event listeners for command input
document.querySelector('.command-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // TODO: Handle command processing
        console.log('Command entered:', e.target.value)
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        Object.assign(card.style, {
            position: 'absolute',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
        });

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        card.addEventListener('pointerdown', e => {
            isDragging = true;
            card.setPointerCapture(e.pointerId);
            card.classList.add('dragging');
            
            initialX = e.clientX - parseFloat(card.style.left);
            initialY = e.clientY - parseFloat(card.style.top);
        });

        card.addEventListener('pointermove', e => {
            if (!isDragging) return;

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            card.style.left = `${currentX}px`;
            card.style.top = `${currentY}px`;
        });

        card.addEventListener('pointerup', e => {
            isDragging = false;
            card.classList.remove('dragging');
        });
    });
});
