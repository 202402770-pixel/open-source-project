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
        // 모드별 HP/타이머 분기 (PR #40)
        const modeConfig = CONFIG.MODES[this.mode];
        if (!modeConfig) {
            console.error(`[Error] 알 수 없는 모드입니다: ${this.mode}`);
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
        this.isPaused = false;

        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;
        this.activeWords = this.mode === 'daily'
            ? [...WordData.getDailyWords(this.level)]
            : [...WordData.getWordsByLevel(this.level)];
        this.bossWord = null;
        this.bossKills = 0;
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

        // 첫 레벨에서도 보스 등장 가능성 체크 (실제 발화는 MIN_LEVEL 조건이 막음)
        this._maybeSpawnBoss();
    }

    takeDamage(amount) {
        if (this.isPaused) return;             // PR #38: 일시정지 중엔 데미지 없음
        if (this.mode === 'zen') return;       // PR #40: Zen 모드는 HP 무한
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        UI.updateHPBar(this.currentHP, this.maxHP);
        if (this.currentHP === 0) {
          this.gameOver();
        }
    }

    // 타이머 확인 및 종료 로직 (Time Attack 모드)
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
        // 2. WordData 언어 변경
        if (typeof WordData !== 'undefined' && WordData.setLanguage) {
            WordData.setLanguage(lang);
        }
        // 3. 새 언어의 단어로 스폰 재개 (daily 모드는 시드 단어 사용)
        const nextWords = this.mode === 'daily'
            ? WordData.getDailyWords(this.level)
            : WordData.getWordsByLevel(this.level);
        if (nextWords && nextWords.length > 0) {
            this.activeWords = [...nextWords];
        }
        // 4. UI 갱신 (화면의 기존 단어 지우기)
        UI.renderTargetWord(this.activeWords, "");
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
        // 보스 단어 처치 — +200 보너스 + BOSS_HUNTER 카운트
        if (this.bossWord && word === this.bossWord) {
            this.score += CONFIG.SCORING.BOSS_BONUS;
            this.bossKills += 1;
            Achievements.check(ACHIEVEMENT_IDS.BOSS_HUNTER, this.bossKills);
            this.bossWord = null;
        }

        this.activeWords.splice(targetIndex, 1);

        // 분필 가루 — word-display DOM 중앙 좌표
        if (window.GameAPI && window.GameAPI.onWordDestroyed) {
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

        // 콤보 — Zen 모드는 콤보 없음 (CONFIG.MODES[mode].hasCombo)
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

        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    handleFailure() {
        if (this.isPaused) return;

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
        Sound.play('levelUp', 1.0);

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
            this._maybeSpawnBoss();
        } else {
            this.gameClear();
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