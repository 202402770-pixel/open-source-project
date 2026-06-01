class Game {
    constructor(mode = 'classic', difficulty = 'easy') {
        this.mode = mode;
        this.difficulty = difficulty;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.missed = 0;
        // HP 5칸 (WORK_PLAN.md §3 W2 "Classic: HP 5에서 시작, 단어 미스 시 -1")
        // 시각 표시는 percent 게이지 (DESIGN.md §3.5) — ui.updateHPBar가 비율 계산
        // 모드별 HP/타이머 분기 (PR #40) + 난이도별 startHP/multiplier (이슈 #35)
        const modeConfig = CONFIG.MODES[this.mode];
        const diffConfig = CONFIG.DIFFICULTY[this.difficulty] || CONFIG.DIFFICULTY.normal;
        if (!modeConfig) {
            console.error(`[Error] 알 수 없는 모드입니다: ${this.mode}`);
        } else {
            this.maxHP = modeConfig.hasHP ? diffConfig.startHP : Infinity;
            this.currentHP = this.maxHP;
            this.timeLimit = modeConfig.timeLimit;
            // 난이도 multiplier — 후속 spawn/낙하 로직에서 활용
            this.speedMult = diffConfig.speedMult;
            this.spawnMult = diffConfig.spawnMult;
        }
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.totalWordAttempts = 0;
        this.successWords = 0;

        this.isGameOver = false;
        this.isPaused = false;
        this.softPaused = false; // PR-E: 모달/페이지 가시성 일시정지 (overlay 없음)

        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;
        this.activeWords = this.mode === 'daily'
            ? [...WordData.getDailyWords(this.level)]
            : [...WordData.getWordsByLevel(this.level)];
        // PR-D: 단어별 spawn time 기록 — checkWordTimeouts에서 사용
        this.wordSpawnTimes = {};
        this._recordSpawnTimes(this.activeWords);
        this.bossWord = null;
        this.bossKills = 0;
        Achievements.init();
        if (this.mode === 'daily') {
            Achievements.checkAttendance();
            // Daily 모드 진입 시 출석 도장 모달 표시 (W3 박태준 — Figma 21:59)
            if (typeof UI !== 'undefined' && UI.toggleAttendanceModal) {
                UI.toggleAttendanceModal(true);
            }
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
            this.wordSpawnTimes = {};
            this._recordSpawnTimes(this.activeWords); // PR-D: 언어 전환 후 새 단어 spawn time
        }
        // 4. UI 갱신 (화면의 기존 단어 지우기)
        UI.renderTargetWord(this.activeWords, "");
    }

    getActiveWords() {
        return this.activeWords;
    }

    /**
     * PR-D: 단어 한 개의 시간 제한 (ms) — 난이도별 wordLifetimeMult 적용.
     * Zen 모드는 시간 제한 없음 (Infinity 반환).
     */
    getWordLifetimeMs() {
        const modeConfig = CONFIG.MODES[this.mode] || {};
        if (modeConfig.hasHP === false) return Infinity; // Zen
        const base = (CONFIG.CORE && CONFIG.CORE.WORD_LIFETIME_MS) || 8000;
        const diffConfig = CONFIG.DIFFICULTY[this.difficulty] || CONFIG.DIFFICULTY.normal;
        const mult = (diffConfig && diffConfig.wordLifetimeMult) || 1;
        return base * mult;
    }

    _recordSpawnTimes(words) {
        const now = Date.now();
        (words || []).forEach((w) => { this.wordSpawnTimes[w] = now; });
    }

    /**
     * PR-D: gameLoop마다 호출. 만료된 단어 expire 처리.
     * PR-E 핫픽스: 한 번에 가장 오래된 단어 1개만 처리 (6단어 동시 만료 → 즉사 방지).
     * softPaused 시 no-op (모달/페이지 가시성 일시정지).
     */
    checkWordTimeouts() {
        if (this.isPaused || this.softPaused || this.isGameOver) return;
        const lifetime = this.getWordLifetimeMs();
        if (!isFinite(lifetime)) return;

        const now = Date.now();
        let oldestWord = null;
        let oldestTime = Infinity;
        this.activeWords.forEach((w) => {
            const t = this.wordSpawnTimes[w] || now;
            if ((now - t) > lifetime && t < oldestTime) {
                oldestTime = t;
                oldestWord = w;
            }
        });
        if (oldestWord) this._expireWord(oldestWord);
    }

    /**
     * PR-E: 모달/페이지 가시성 일시정지. Pause overlay 없이 시간만 멈춤.
     * 일시정지 동안 흐른 시간만큼 wordSpawnTimes를 미래로 미루어 보정.
     */
    softPause() {
        if (this.isPaused || this.isGameOver || this.softPaused) return;
        this.softPaused = true;
        this._softPauseStart = Date.now();
    }

    softResume() {
        if (!this.softPaused) return;
        this.softPaused = false;
        const elapsed = Date.now() - (this._softPauseStart || Date.now());
        Object.keys(this.wordSpawnTimes).forEach((w) => {
            this.wordSpawnTimes[w] += elapsed;
        });
        this._softPauseStart = null;
    }

    _expireWord(word) {
        const idx = this.activeWords.indexOf(word);
        if (idx === -1) return;

        this.activeWords.splice(idx, 1);
        delete this.wordSpawnTimes[word];
        this.missed++;
        this.levelMissed++;
        this.takeDamage(CONFIG.CORE.MISS_DAMAGE);

        if (typeof Effects !== 'undefined' && Effects.triggerErrorShake) {
            Effects.triggerErrorShake();
        }

        const modeConfig = CONFIG.MODES[this.mode];
        if (modeConfig && modeConfig.hasCombo) {
            this.combo = 0;
            if (typeof Effects !== 'undefined' && Effects.toggleGlow) Effects.toggleGlow(false);
            if (window.GameAPI && typeof GameAPI.onComboChange === 'function') {
                GameAPI.onComboChange(this.combo);
            }
        }

        if (typeof UI !== 'undefined' && UI.renderTargetWord) {
            UI.renderTargetWord(this.activeWords, "");
        }

        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    /**
     * PR-D: 활성 단어 중 가장 임박한 만료 비율 (0~1). UI 경고 표시용.
     * 1에 가까울수록 곧 만료. Zen 모드 또는 활성 단어 없으면 0.
     */
    getMostImpendingExpiryRatio() {
        if (this.activeWords.length === 0) return 0;
        const lifetime = this.getWordLifetimeMs();
        if (!isFinite(lifetime)) return 0;
        const now = Date.now();
        let maxRatio = 0;
        this.activeWords.forEach((w) => {
            const t = this.wordSpawnTimes[w] || now;
            const ratio = Math.min(1, (now - t) / lifetime);
            if (ratio > maxRatio) maxRatio = ratio;
        });
        return maxRatio;
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
        // PR-B: 페이지 리로드 제거. game state만 정리하고 Start scene으로 복귀.
        this.isPaused = false;
        this.isGameOver = true; // gameLoop 중단 신호
        UI.hidePauseOverlay();
        if (typeof UI !== 'undefined' && UI.showScene) {
            UI.showScene('start');
        }
        if (typeof window !== 'undefined') {
            window.game = null;
        }
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
        delete this.wordSpawnTimes[word]; // PR-D: 정답 시 만료 시간 제거

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
            // 콤보 단계화 (PR-B) — Effects.toggleGlow에 콤보 값 전달 시 자동 분기
            if (this.combo >= CONFIG.SCORING.COMBO_GLOW_THRESHOLD) {
                Effects.toggleGlow(true, this.combo);
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

        // PR-B: 단어 실패 시 화면 떨림 — 글자 단위 errorFlash 외 단어 단위 강한 피드백
        if (typeof Effects !== 'undefined' && Effects.triggerErrorShake) {
            Effects.triggerErrorShake();
        }

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
            this.wordSpawnTimes = {};
            this._recordSpawnTimes(this.activeWords); // PR-D: 새 레벨 단어에 spawn time 기록

            // 레벨업 트랜지션 — 칠판 wipe + 단원 텍스트 교체 + LV.X 토스트
            // Figma 21:29 / WORK_PLAN.md §3 W3 박태준
            const nextLevel = this.level;
            if (typeof Effects !== 'undefined' && Effects.boardWipe) {
                Effects.boardWipe(() => {
                    // wipe 중간 시점(300ms)에 단원 텍스트 교체
                    const lectureTitle = document.querySelector('.blackboard h2');
                    if (lectureTitle) {
                        lectureTitle.textContent = `LV.${nextLevel} 단원`;
                    }
                });
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`LV.${nextLevel}`, '새 단원 시작!', `LV${nextLevel}`, 1200);
            }

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