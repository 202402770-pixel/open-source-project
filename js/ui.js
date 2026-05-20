const UI = {
    get wordDisplay() { return document.getElementById('word-display'); },
    get score() { return document.getElementById('score'); },
    get level() { return document.getElementById('level'); },
    get missed() { return document.getElementById('missed'); },
    get hpFill() { return document.getElementById('hp-fill'); }, 
    get hpText() { return document.getElementById('hp-text'); }, 
    get toastContainer() { return document.getElementById('toast-container'); },
    get wpmDisplay() { return document.getElementById('wpm'); },
    get gameOverScreen() { return document.querySelector('.game-over'); },
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
    
    showGameOver(state){
        if (!this.gameOverScreen) return;
        let accuracy = 0;
        if (state.totalWordAttempts > 0) {
            accuracy = Math.floor((state.successWords / state.totalWordAttempts) * 100);
        }
        let highScore = parseInt(localStorage.getItem('typing_high_score')) || 0;
        let isNewRecord = false;
        if (state.score > highScore && state.score > 0) {
            localStorage.setItem('typing_high_score', state.score);
            isNewRecord = true;
        }
        let gradeText = Grade.calc(state.score, accuracy);
        let stampClass = 'stamp-f';
        switch(gradeText) {
            case 'A+': stampClass = 'stamp-a-plus'; break;
            case 'A':  stampClass = 'stamp-a'; break;
            case 'A-': stampClass = 'stamp-a-minus'; break;
            case 'B':  stampClass = 'stamp-b'; break;
            case 'C':  stampClass = 'stamp-c'; break;
            case 'F':  stampClass = 'stamp-f'; break;
        }
        document.getElementById('result-score').textContent = state.score.toLocaleString();
        document.getElementById('result-combo').textContent = `x${state.maxCombo}`;
        document.getElementById('result-level').textContent = `LV.${state.level}`;
        document.getElementById('result-wpm').textContent = state.wpm;
        document.getElementById('result-accuracy').textContent = `${accuracy}%`;
        document.getElementById('result-words').textContent = state.successWords;
        const stampElement = document.getElementById('result-stamp');
        stampElement.className = `stamp ${stampClass} show`;
        document.getElementById('result-grade').textContent = gradeText;
        const newRecordElement = document.getElementById('result-new-record');
        newRecordElement.style.display = isNewRecord ? 'block' : 'none';
        this.gameOverScreen.classList.add('active');
    },

    hideGameOver() {
        if (!this.gameOverScreen) return;
        this.gameOverScreen.classList.remove('active');
    }
};
