class Game {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.missed = 0;
        // HP 5칸 (WORK_PLAN.md §3 W2 "Classic: HP 5에서 시작, 단어 미스 시 -1")
        // 시각 표시는 percent 게이지 (DESIGN.md §3.5) — ui.updateHPBar가 비율 계산
        this.maxHP = 5;
        this.currentHP = 5;
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.totalWordAttempts = 0;
        this.successWords = 0;
        this.isGameOver = false;
        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;
        this.activeWords = [...WordData.getWordsByLevel(this.level)];
        this.bossWord = null;
        this.bossKills = 0;
        Achievements.init();
        Achievements.checkAttendance();

        let playCount = parseInt(localStorage.getItem(CONFIG.STORAGE.PLAY_COUNT)) || 0;
        playCount++;
        localStorage.setItem(CONFIG.STORAGE.PLAY_COUNT, playCount);
        
        const currentHour = new Date().getHours();
        if (currentHour >= 0 && currentHour < 6) {
            Achievements.check(ACHIEVEMENT_IDS.NIGHT_STUDY, 1);
        }

        // 첫 레벨에서도 보스 등장 가능성 체크 (실제 발화는 MIN_LEVEL 조건이 막음)
        this._maybeSpawnBoss();
    }

    /**
     * 레벨 진입 시 5% 확률로 활성 단어 1개를 보스로 마킹 (Lv 3+).
     * 보스 등장 시 종소리 + 화면 흔들림 + 토스트 발화.
     * Figma 21:2 / WORK_PLAN.md §3 W3 박태준
     */
    _maybeSpawnBoss() {
        const cfg = CONFIG.BOSS || {};
        if (this.level < (cfg.MIN_LEVEL || 3)) return;
        if (Math.random() >= (cfg.PROBABILITY || 0.05)) return;
        if (!this.activeWords || this.activeWords.length === 0) return;

        const idx = Math.floor(Math.random() * this.activeWords.length);
        this.bossWord = this.activeWords[idx];

        if (typeof Sound !== 'undefined' && Sound.play) {
            Sound.play('bell', 1.0);
        }
        if (typeof Effects !== 'undefined' && Effects.screenShake) {
            Effects.screenShake();
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('기말고사 핵심 키워드!', `"${this.bossWord}" 등장`, 'BOSS');
        }
    }

    setLanguage(lang) {
        // 1. 활성 단어 전부 파괴 (drop 정책)
        this.activeWords = [];
        // 2. WordData 언어 변경 (WordData 객체에 해당 기능이 있다고 가정)
        if (typeof WordData !== 'undefined' && WordData.setLanguage) {
            WordData.setLanguage(lang);
        }
        // 3. 새 언어의 단어로 스폰 재개
        const nextWords = WordData.getWordsByLevel(this.level);
        if (nextWords && nextWords.length > 0) {
            this.activeWords = [...nextWords];
        }
        // 4. UI 갱신 (화면의 기존 단어 지우기)
        UI.renderTargetWord(this.activeWords, "");
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

        // 보스 단어 처치 — +200 보너스 + BOSS_HUNTER 카운트
        if (this.bossWord && word === this.bossWord) {
            this.score += CONFIG.SCORING.BOSS_BONUS;
            this.bossKills += 1;
            Achievements.check(ACHIEVEMENT_IDS.BOSS_HUNTER, this.bossKills);
            this.bossWord = null;
        }

        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.activeWords.splice(targetIndex, 1);
        if (window.GameAPI && window.GameAPI.onWordDestroyed) {
            // word-display DOM의 화면 중앙 좌표 — 분필 가루가 단어 위치에서 발생
            const wd = document.getElementById('word-display');
            if (wd) {
                const rect = wd.getBoundingClientRect();
                GameAPI.onWordDestroyed(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
            } else {
                GameAPI.onWordDestroyed(0, 0);
            }
        }
        Achievements.check(ACHIEVEMENT_IDS.FIRST_WORD, 1);
        Achievements.check(ACHIEVEMENT_IDS.COMBO_10, this.combo);
        Achievements.check(ACHIEVEMENT_IDS.COMBO_50, this.combo);
        // 콤보 글로우 단일 임계값 (DESIGN.md §5.1 + §6 "콤보 ≥ 10이면 노트 종이 글로우")
        if (this.combo >= CONFIG.SCORING.COMBO_GLOW_THRESHOLD) {
            Effects.toggleGlow(true, 'combo10');
        }
        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    handleFailure() {
        this.missed++;
        this.combo = 0;
        Effects.toggleGlow(false);
        this.takeDamage(CONFIG.CORE.MISS_DAMAGE); // 기획서: 단어 미스 시 HP -1 (WORK_PLAN.md §3 W2)
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
        const nextWords = WordData.getWordsByLevel(this.level);
        if (nextWords && nextWords.length > 0){
            this.activeWords = [...nextWords];
            this._maybeSpawnBoss();
        } else {
            this.gameClear();
        }
    }

    takeDamage(amount) {
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        UI.updateHPBar(this.currentHP, this.maxHP);
        if (this.currentHP === 0) {
          this.gameOver();
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
