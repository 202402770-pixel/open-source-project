const UI = {
    get wordDisplay() { return document.getElementById('word-display'); },
    get score() { return document.getElementById('score'); },
    get level() { return document.getElementById('level'); },
    get missed() { return document.getElementById('missed'); },
    get hpFill() { return document.getElementById('hp-fill'); }, 
    get hpText() { return document.getElementById('hp-text'); }, 
    get toastContainer() { return document.getElementById('toast-container'); },
    get wpmDisplay() { return document.getElementById('wpm'); },
    lastInputLength: 0,

    renderTargetWord(activeWords, userInput) {
        if (!userInput || userInput === "") {
            this.wordDisplay.innerHTML = '';
            this.addCursor();
            this.lastInputLength = 0;
            this.currentTargetWord = null;
            return; 
        }
        const wordsList = Array.isArray(activeWords) ? activeWords : [activeWords];
        let targetWord = wordsList.find(word => word && word.startsWith(userInput));
        let detectError = false;
        if(!targetWord) {
            detectError = true;
            targetWord = this.currentTargetWord || wordsList[0];
        } else {
            this.currentTargetWord = targetWord;
        }
        if(this.wordDisplay.children.length !== targetWord.length + 1){
            this.wordDisplay.innerHTML = '';
            for (let i = 0; i < targetWord.length; i++) {
                const span = document.createElement('span');
                this.wordDisplay.appendChild(span);
            }
            this.addCursor();
            }
        const spans = this.wordDisplay.querySelectorAll('span:not(.cursor)');
        const cursor = this.wordDisplay.querySelector('.cursor');
        spans.forEach((span, i) => {
            if (detectError && i < userInput.length) {
                span.className = 'text-error';
                span.textContent = userInput[i] || targetWord[i];
            } else if (i < userInput.length) {
                span.className = userInput[i] === targetWord[i] ? 'text-typed' : 'text-error';
                span.textContent = targetWord[i];
            } else {
                span.className = 'text-untyped';
                span.textContent = targetWord[i];
            }
        });
        if (cursor && spans.length > 0) {
            if (userInput.length < spans.length) {
                this.wordDisplay.insertBefore(cursor, spans[userInput.length]);
            } else {
                this.wordDisplay.appendChild(cursor);
            }
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
