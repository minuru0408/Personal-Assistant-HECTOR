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
            top: `${rect.top + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
        });

        let dragging = false;
        let startX;
        let startY;
        let origX;
        let origY;

        card.addEventListener('pointerdown', e => {
            card.setPointerCapture(e.pointerId);
            startX = e.clientX;
            startY = e.clientY;
            origX = parseFloat(card.style.left);
            origY = parseFloat(card.style.top);
            dragging = true;
            card.classList.add('dragging');
        });

        card.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            card.style.left = `${origX + dx}px`;
            card.style.top = `${origY + dy}px`;
        });

        card.addEventListener('pointerup', e => {
            card.releasePointerCapture(e.pointerId);
            dragging = false;
            card.classList.remove('dragging');
        });
    });
});
