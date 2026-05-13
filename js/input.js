const hiddenInput = document.getElementById('hidden-input');

export const Input = {
    init(onInput, onEnter) {
        document.addEventListener('click', () => hiddenInput.focus());
        
        hiddenInput.addEventListener('input', () => {
            onInput(hiddenInput.value);
        });

        hiddenInput.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                onEnter(hiddenInput.value.trim());
                hiddenInput.value = '';
            }
        });
    }
};