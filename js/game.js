class Game {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.missed = 0;

        // HP 5칸
        this.maxHP = 5;
        this.currentHP = 5;

        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.totalWordAttempts = 0;
        this.successWords = 0;

        this.isGameOver = false;
        this.isPaused = false;

        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;

        this.activeWords = [...WordData.getWordsByLevel(this.level)];

        Achievements.init();
        Achievements.checkAttendance();

        let playCount = parseInt(localStorage.getItem(CONFIG.STORAGE.PLAY_COUNT)) || 0;
        playCount++;
        localStorage.setItem(CONFIG.STORAGE.PLAY_COUNT, playCount);

        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 6) {
            Achievements.check(ACHIEVEMENT_IDS.NIGHT_STUDY, 1);
        }
    }

    getActiveWords() {
        return this.activeWords;
    }

    pause() {
        if (this.isGameOver || this.isPaused) return;

        this.isPaused = true;
        UI.showPauseOverlay();
    }

    resume() {
        if (this.isGameOver || !this.isPaused) return;

        this.isPaused = false;
        UI.hidePauseOverlay();
    }

    togglePause() {
        if (this.isGameOver) return;

        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    goToMenu() {
        this.isPaused = false;
        UI.hidePauseOverlay();
        location.reload();
    }

    checkAnswer(inputWord) {
        if (this.isPaused) return;
        if (!inputWord || inputWord.trim() === "") return;

        this.levelAttempts++;
        this.totalWordAttempts++;

        const targetIndex = this.activeWords.indexOf(inputWord);

        if (targetIndex !== -1) {
            this.handleSuccess(targetIndex, inputWord);
        } else if (inputWord !== "") {
            this.levelMissed++;
            this.handleFailure();
        }

        UI.updateHUD(this);
    }

    handleSuccess(targetIndex, word) {
        if (this.isPaused) return;

        this.totalTypedChars += word.length;
        this.successWords++;
        this.score += CONFIG.SCORING.WORD_DESTROY_BASE;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        this.activeWords.splice(targetIndex, 1);

        Achievements.check(ACHIEVEMENT_IDS.FIRST_WORD, 1);
        Achievements.check(ACHIEVEMENT_IDS.COMBO_10, this.combo);
        Achievements.check(ACHIEVEMENT_IDS.COMBO_50, this.combo);

        if (this.combo >= CONFIG.SCORING.COMBO_GLOW_THRESHOLD) {
            Effects.toggleGlow(true, 'combo10');
        }

        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    handleFailure() {
        if (this.isPaused) return;

        this.missed++;
        this.combo = 0;
        Effects.toggleGlow(false);
        this.takeDamage(CONFIG.CORE.MISS_DAMAGE);
    }

    levelUp() {
        Sound.play('levelUp', 1.0);

        if (this.levelAttempts > 0) {
            const accuracy = ((this.levelAttempts - this.levelMissed) / this.levelAttempts) * 100;
        }

        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.level++;

        Achievements.check(ACHIEVEMENT_IDS.GRADUATION, this.level);

        const nextWords = WordData.getWordsByLevel(this.level);

        if (nextWords && nextWords.length > 0) {
            this.activeWords = [...nextWords];
        } else {
            this.gameClear();
        }
    }

    takeDamage(amount) {
        if (this.isPaused) return;

        this.currentHP -= amount;

        if (this.currentHP < 0) this.currentHP = 0;

        UI.updateHPBar(this.currentHP, this.maxHP);

        if (this.currentHP === 0) {
            this.gameOver();
        }
    }

    gameClear() {
        this.isGameOver = true;
        this.isPaused = false;

        UI.hidePauseOverlay();
        Achievements.check(ACHIEVEMENT_IDS.GRADUATION, this.level);
        UI.showToast("게임 클리어!", "모든 단어를 방어했습니다.", "축");
        UI.showGameOver(this);
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.isPaused = false;

        UI.hidePauseOverlay();
        UI.showToast("게임 오버!", "다시 도전해 보세요.", "死");
        UI.showGameOver(this);
    }

    calculateWPM() {
        if (this.isGameOver || this.isPaused) return;

        const minutes = (Date.now() - this.startTime) / 60000;

        if (minutes > 0.05) {
            this.wpm = Math.floor((this.totalTypedChars / 5) / minutes);
            Achievements.check(ACHIEVEMENT_IDS.SPEED_RUNNER, this.wpm);
        } else {
            this.wpm = 0;
        }
    }
}