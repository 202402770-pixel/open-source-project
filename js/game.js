class Game {
    constructor(mode = 'classic') {
        this.mode = mode;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.missed = 0;
        // HP 5칸 (WORK_PLAN.md §3 W2 "Classic: HP 5에서 시작, 단어 미스 시 -1")
        // 시각 표시는 percent 게이지 (DESIGN.md §3.5) — ui.updateHPBar가 비율 계산
        const modeConfig = CONFIG.MODES[this.mode]; // config를 이용하여 변수 정의
        if (!modeConfig) {
            console.error(`[Error] 알 수 없는 모드입니다: ${this.mode}`); // 예외 처리
        } else {
            const defaultHP = CONFIG.DIFFICULTY.normal.startHP;
            this.maxHP = modeConfig.hasHP ? defaultHP : Infinity;
            this.currentHP = this.maxHP;
            this.timeLimit = modeConfig.timeLimit;
        }
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.totalWordAttempts = 0;
        this.successWords = 0;
        this.isGameOver = false;
        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;
        this.activeWords = this.mode === 'daily' 
            ? [...WordData.getDailyWords(this.level)] 
            : [...WordData.getWordsByLevel(this.level)];
            
        Achievements.init();
        if (this.mode === 'daily') {
            Achievements.checkAttendance();
        }

        let playCount = parseInt(localStorage.getItem(CONFIG.STORAGE.PLAY_COUNT)) || 0;
        playCount++;
        localStorage.setItem(CONFIG.STORAGE.PLAY_COUNT, playCount);
        
        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 6) {
            Achievements.check(ACHIEVEMENT_IDS.NIGHT_STUDY, 1);
        }
    }

    takeDamage(amount) {
        if (this.mode === 'zen') return; // Zen 모드는 HP 무한
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        UI.updateHPBar(this.currentHP, this.maxHP);
        if (this.currentHP === 0) {
          this.gameOver();
        }
    }

    // 타이머 확인 및 종료 로직
    checkTime() {
        if (this.timeLimit > 0 && !this.isGameOver) {
            const elapsedSec = (Date.now() - this.startTime) / 1000;
            if (elapsedSec >= this.timeLimit) {
                this.isGameOver = true;
                UI.showToast("시간 종료!", "통계를 확인하세요.", "⏰");
                UI.showGameOver(this);
            }
        }
    }

    getActiveWords() {
        return this.activeWords;
    }

    checkAnswer(inputWord) {
        if(!inputWord || inputWord.trim() === "") return;
        this.levelAttempts++;
        this.totalWordAttempts++
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
        this.totalTypedChars += word.length;
        this.successWords++;
        this.score += CONFIG.SCORING.WORD_DESTROY_BASE;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.activeWords.splice(targetIndex, 1);
        Achievements.check(ACHIEVEMENT_IDS.FIRST_WORD, 1);
        const modeConfig = CONFIG.MODES[this.mode];
        if (modeConfig && modeConfig.hasCombo) {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            
            Achievements.check(ACHIEVEMENT_IDS.COMBO_10, this.combo);
            Achievements.check(ACHIEVEMENT_IDS.COMBO_50, this.combo);
            
            if (this.combo >= CONFIG.SCORING.COMBO_GLOW_THRESHOLD) {
                Effects.toggleGlow(true, 'combo10');
            }
            if (window.GameAPI && typeof GameAPI.onComboChange === 'function') {
                GameAPI.onComboChange(this.combo);
            }
        }
        if (window.GameAPI && typeof GameAPI.onWordDestroyed === 'function') {
            GameAPI.onWordDestroyed(window.innerWidth / 2, window.innerHeight / 2);
        }
        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    handleFailure() {
        this.missed++;
        this.takeDamage(CONFIG.CORE.MISS_DAMAGE); // 기획서: 단어 미스 시 HP -1 (WORK_PLAN.md §3 W2)
        const modeConfig = CONFIG.MODES[this.mode];
        if (modeConfig && modeConfig.hasCombo) {
            this.combo = 0;
            Effects.toggleGlow(false);
            if (window.GameAPI && typeof GameAPI.onComboChange === 'function') {
                GameAPI.onComboChange(this.combo);
            }
        }
    }

    levelUp() {
        Sound.play('levelUp', 1.0)
        if (this.levelAttempts > 0) {
            const accuracy = ((this.levelAttempts - this.levelMissed) / this.levelAttempts) * 100;
        }
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.level++;
        Achievements.check(ACHIEVEMENT_IDS.GRADUATION, this.level);
        const nextWords = this.mode === 'daily'
            ? WordData.getDailyWords(this.level)
            : WordData.getWordsByLevel(this.level);
            
        if (nextWords && nextWords.length > 0){
            this.activeWords = [...nextWords];
        } else {
            this.gameClear();
        }
    }

    gameClear() {
        this.isGameOver = true;
        Achievements.check(ACHIEVEMENT_IDS.GRADUATION, this.level);
        UI.showToast("게임 클리어!", "모든 단어를 방어했습니다.", "축");
        UI.showGameOver(this);
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        UI.showToast("게임 오버!", "다시 도전해 보세요.", "死");
        UI.showGameOver(this);
    }

    calculateWPM(){
        if(this.isGameOver) return;
        const minutes = (Date.now() - this.startTime) / 60000;
        if(minutes > 0.05){
            this.wpm = Math.floor((this.totalTypedChars/5)/minutes);
            Achievements.check(ACHIEVEMENT_IDS.SPEED_RUNNER, this.wpm);
        } else {
            this.wpm = 0;
        }
    }
}
