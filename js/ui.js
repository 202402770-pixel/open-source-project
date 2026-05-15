import * as Effects from './effects.js';

export const UI = {
    wordDisplay: document.getElementById('word-display'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    missed: document.getElementById('missed'),
    hpFill: document.getElementById('hp-fill'), 
    hpText: document.getElementById('hp-text'), 
    toastContainer: document.getElementById('toast-container'),
    wpmDisplay: document.getElementById('wpm'),
    lastInputLength: 0,


    renderTargetWord(activeWords, userInput) {
        const wordsList = Array.isArray(activeWords) ? activeWords : [activeWords];
        this.wordDisplay.innerHTML = '';
        let detectError = false;
        if (userInput.length === 0) {
           this.addCursor();
           this.lastInputLength = 0;
           return;
        }
        let targetWord = wordsList.find(word => word && word.startsWith(userInput[0]));
        if (!targetWord) {
            for (let i = 0; i < userInput.length; i++) {
                const span = document.createElement('span');
                span.className = 'text-error';
                span.textContent = userInput[i];
                this.wordDisplay.appendChild(span);
            }
            this.addCursor();
            Effects.triggerErrorShake();
            return;
        }
        const maxLength = Math.max(userInput.length, targetWord.length);
        for (let i = 0; i < maxLength; i++) {
            if (i === userInput.length) this.addCursor();
            const span = document.createElement('span');
            const targetChar = targetWord[i];
            const userChar = userInput[i];
            if (userChar === undefined) {
                span.className = 'text-untyped';
                span.textContent = targetChar;
            } else if (targetChar === undefined) {
                span.className = 'text-error';
                span.textContent = userChar;
                detectError = true;
            } else if (targetChar === userChar) {
                span.className = 'text-typed';
                span.textContent = targetChar;
            } else {
                span.className = 'text-error';
                span.textContent = userChar;
                if (i === userInput.length - 1 && userInput.length > this.lastInputLength) {
                    detectError = true;
                }
            }
            this.wordDisplay.appendChild(span);
        }
        if (userInput.length >= maxLength) {
            this.addCursor();
        }
        if(detectError){
            Effects.triggerErrorShake();
        }
        this.lastInputLength = userInput.length;
    },

    addCursor() {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        this.wordDisplay.appendChild(cursor);
    },

    updateHUD(state) {
        this.score.textContent = `SCORE: ${state.score}`;
        this.level.textContent = `LV.${state.level}`;
        this.missed.textContent = `MISSED: ${state.missed}`;
        if(this.wpmDisplay){
            this.wpmDisplay.textContent = `WPM: ${state.wpm}`;
        }
        this.updateHPBar(state.currentHP, state.maxHP || 100);
    },

    updateHPBar(currentHP, maxHP) {
        if (!this.hpFill || !this.hpText) return;
        const percent = maxHP > 0 ? Math.max(0, Math.floor((currentHP / maxHP) * 100)) : 0;
        this.hpFill.style.width = `${percent}%`;
        this.hpText.innerText = `${percent}%`;
        this.hpFill.classList.remove('ok', 'warn', 'danger');
        if (percent >= 65) {
            this.hpFill.classList.add('ok');
        } else if (percent >= 30) {
            this.hpFill.classList.add('warn');
        } else {
            this.hpFill.classList.add('danger');
        }
    },

    showToast(title, message, iconText) {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-accent"></div>
            <div class="toast-icon">${iconText}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${message}</div>
            </div>
        `;
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    },
    
    stampGrade(targetGrade) {
        const stamps = document.querySelectorAll('.stamp');
        stamps.forEach(stamp => {
            stamp.classList.remove('show');
            stamp.style.display = 'none';
        });
        const targetElement = document.querySelector(`.stamp[data-grade="${targetGrade}"]`);
        if (targetElement) {
            targetElement.style.display = 'flex';
            setTimeout(() => {
                targetElement.classList.add('show');
            }, 10);
        }
    }
};