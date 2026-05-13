export function toggleGlow(active, type) {
    const notebook = document.querySelector('.notebook-input');
    if (!notebook) return;
    notebook.classList.remove('glow-combo5', 'glow-combo10');
    if (active) {
        if (type === 'combo10') {
            notebook.classList.add('glow-combo10');
        } else {
            notebook.classList.add('glow-combo5');  
        }
    }
}

export function triggerErrorShake() {
    const body = document.body;    
    body.classList.remove('shake');
    void body.offsetWidth; 
    body.classList.add('shake');
    setTimeout(() => {
        body.classList.remove('shake');
    }, 300);
}