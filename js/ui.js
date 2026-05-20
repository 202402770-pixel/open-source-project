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

    get rankingModal() { return document.getElementById('ranking-modal'); },
    get rankingContainer() { return document.getElementById('ranking-container'); },
    get rankingTabs() { return document.querySelectorAll('.tab-btn'); },

    mockRankingData: {
        all: [
            { name: "익명#A12", score: 34850, combo: 120, level: 12, isMe: false },
            { name: "익명#B34", score: 28420, combo: 95, level: 11, isMe: false },
            { name: "익명#C56", score: 25200, combo: 88, level: 11, isMe: false },
            { name: "익명#D78", score: 24100, combo: 82, level: 11, isMe: false },
            { name: "익명#E90", score: 23800, combo: 79, level: 11, isMe: false },
            { name: "익명#A91", score: 21500, combo: 75, level: 10, isMe: false },
            { name: "익명#F12", score: 19200, combo: 68, level: 9, isMe: false },
            { name: "YOU (당신)", score: 18450, combo: 67, level: 9, isMe: true }
        ],
        week: [
            { name: "익명#D78", score: 24100, combo: 82, level: 11, isMe: false },
            { name: "익명#E90", score: 23800, combo: 79, level: 11, isMe: false },
            { name: "익명#A91", score: 21500, combo: 75, level: 10, isMe: false },
            { name: "YOU (당신)", score: 18450, combo: 67, level: 9, isMe: true },
            { name: "익명#H56", score: 16500, combo: 54, level: 9, isMe: false },
            { name: "익명#K34", score: 15800, combo: 50, level: 8, isMe: false },
            { name: "익명#I78", score: 14900, combo: 48, level: 8, isMe: false },
            { name: "익명#J90", score: 14200, combo: 45, level: 8, isMe: false }
        ],
        today: [
            { name: "YOU (당신)", score: 18450, combo: 67, level: 9, isMe: true },
            { name: "익명#K34", score: 15800, combo: 50, level: 8, isMe: false },
            { name: "익명#I78", score: 14900, combo: 48, level: 8, isMe: false },
            { name: "익명#J90", score: 14200, combo: 45, level: 8, isMe: false },
            { name: "익명#M55", score: 13600, combo: 42, level: 7, isMe: false },
            { name: "익명#N34", score: 11500, combo: 35, level: 6, isMe: false },
            { name: "익명#O56", score: 10800, combo: 31, level: 6, isMe: false },
            { name: "익명#X12", score: 9900, combo: 28, level: 5, isMe: false },
        ]
    },
    
    initRanking() {
        const closeBtn = document.getElementById('close-ranking-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleRankingModal(false));
        }

        if (this.rankingTabs) {
            this.rankingTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.rankingTabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderRanking(e.target.dataset.type);
                });
            });
        }
    },

    toggleRankingModal(show) {
        if (!this.rankingModal) return;
        if (show) {
            this.rankingModal.classList.remove('hidden');
            this.renderRanking('all');
            
            if (this.rankingTabs.length > 0) {
                this.rankingTabs.forEach(t => t.classList.remove('active'));
                document.querySelector('.tab-btn[data-type="all"]').classList.add('active');
            }
        } else {
            this.rankingModal.classList.add('hidden');
            const hiddenInput = document.getElementById('hidden-input');
            if (hiddenInput) hiddenInput.focus();
        }
    },

    renderRanking(type) {
        if (!this.rankingContainer) return;
        this.rankingContainer.innerHTML = ''; 
        const data = this.mockRankingData[type] || this.mockRankingData['all'];

        data.forEach((user, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3 ? 'top-rank' : '';
            const isMeClass = user.isMe ? 'is-me' : '';

            const row = document.createElement('div');
            row.className = `rank-item ${isTop3} ${isMeClass}`;
            
            row.innerHTML = `
                <div class="rank-num">#${rank}</div>
                <div class="rank-name">${user.name}</div>
                <div class="rank-score">${user.score}</div>
                <div class="rank-combo">x${user.combo}</div>
                <div class="rank-level">LV ${user.level}</div>
            `;
            this.rankingContainer.appendChild(row);
        });
    },


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
