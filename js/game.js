/**
 * Type Defender — Game Class (PR-K: 정통 타이핑 디펜스)
 * --------------------------------------------------------------------------
 * 데이터 모델: fallingWords[] — { id, text, x, y, speed, typedIndex, isBoss }
 *  좌표는 word-field 안 % 기반 (x: 0~100, y: 0~100). viewport 적응.
 *
 * 핵심 로직:
 *   constructor      — 모드/난이도/HP/wordPool 초기화
 *   update(dtMs)     — gameLoop마다 호출. 낙하 + spawn + 충돌
 *   handleCharInput  — 글자 단위 입력. 첫 글자 lock, 마지막 글자 자동 처치
 *   _destroyWord     — 성공 (점수 + 콤보 + chalkDust + 보스 보너스)
 *   _expireWord      — 바닥 도달 (HP -1 + 콤보 끊김 + shake)
 *   softPause/Resume — 모달 열림/페이지 가시성 일시정지 (시간 보정)
 *
 * 이전 PR-D~F의 단어 시간 제한 시스템 (wordSpawnTimes, checkWordTimeouts,
 * getWordLifetimeMs) 폐기 — 낙하 시스템이 자연스럽게 대체.
 */

class Game {
    constructor(mode = 'classic', difficulty = 'easy') {
        this.mode = mode;
        this.difficulty = difficulty;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.level = 1;
        this.missed = 0;

        const modeConfig = CONFIG.MODES[this.mode];
        const diffConfig = CONFIG.DIFFICULTY[this.difficulty] || CONFIG.DIFFICULTY.normal;
        if (!modeConfig) {
            console.error(`[Error] 알 수 없는 모드입니다: ${this.mode}`);
            this.maxHP = 5;
            this.currentHP = 5;
            this.timeLimit = 0;
            this.speedMult = 1;
            this.spawnMult = 1;
        } else {
            this.maxHP = modeConfig.hasHP ? diffConfig.startHP : Infinity;
            this.currentHP = this.maxHP;
            this.timeLimit = modeConfig.timeLimit;
            this.speedMult = diffConfig.speedMult;
            this.spawnMult = diffConfig.spawnMult;
        }
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.totalWordAttempts = 0;
        this.successWords = 0;

        this.isGameOver = false;
        this.isPaused = false;
        this.softPaused = false;

        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;

        // PR-K: 정통 타이핑 디펜스 — 낙하 시스템
        this.fallingWords = [];       // 활성 낙하 단어 객체 배열
        this.wordPool = this._loadWordPool(this.level); // 현재 레벨 남은 후보
        this.lockedWordId = null;     // 사용자 입력 매칭 잠금
        this._nextWordId = 0;
        this._lastUpdateAt = Date.now();
        // PR-N: 시작 후 SPAWN_INITIAL_DELAY 만큼 첫 spawn 지연 (사용자 준비 시간).
        // 이전엔 _lastSpawnAt=0이라 update() 첫 호출에 즉시 spawn → panic.
        const initialDelay = (CONFIG.CORE && CONFIG.CORE.SPAWN_INITIAL_DELAY) || 1500;
        this._lastSpawnAt = Date.now() - (CONFIG.CORE.SPAWN_INTERVAL_BASE || 3500) + initialDelay;
        this.bossKills = 0;

        Achievements.init();
        if (this.mode === 'daily') {
            Achievements.checkAttendance();
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
    }

    _loadWordPool(level) {
        const words = this.mode === 'daily'
            ? WordData.getDailyWords(level)
            : WordData.getWordsByLevel(level);
        return words ? [...words] : [];
    }

    /** 호환 — 외부에서 활성 단어 텍스트 목록 조회 */
    get activeWords() {
        return this.fallingWords.map(w => w.text);
    }
    getActiveWords() {
        return this.activeWords;
    }

    takeDamage(amount) {
        if (this.isPaused) return;
        if (this.mode === 'zen') return;
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        if (typeof UI !== 'undefined' && UI.updateHPBar) {
            UI.updateHPBar(this.currentHP, this.maxHP);
        }
        if (this.currentHP === 0) {
            this.gameOver();
        }
    }

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
     * PR-K: gameLoop마다 호출. 낙하 + spawn + 충돌 + 레벨업.
     */
    update() {
        if (this.isPaused || this.softPaused || this.isGameOver) {
            this._lastUpdateAt = Date.now(); // 일시정지 동안 dt 누적 방지
            return;
        }
        const now = Date.now();
        const dtSec = Math.min(0.1, (now - this._lastUpdateAt) / 1000); // 100ms cap (tab 백그라운드 spike 방지)
        this._lastUpdateAt = now;

        // 1. 낙하
        for (const w of this.fallingWords) {
            w.y += w.speed * dtSec;
        }

        // 2. 충돌 — 바닥 도달
        const floor = (CONFIG.CORE.FALL_FLOOR_RATIO || 0.92) * 100;
        const expired = this.fallingWords.filter(w => w.y >= floor);
        for (const w of expired) {
            this._expireWord(w);
        }

        // 3. spawn (시간 기반)
        const interval = this._currentSpawnInterval();
        const maxActive = CONFIG.CORE.SPAWN_MAX_ACTIVE || 6;
        if (now - this._lastSpawnAt > interval &&
            this.fallingWords.length < maxActive &&
            this.wordPool.length > 0) {
            this._spawnNextWord();
            this._lastSpawnAt = now;
        }

        // 4. 레벨업 — 풀 비고 활성 단어도 없으면
        if (this.wordPool.length === 0 && this.fallingWords.length === 0) {
            this.levelUp();
        }
    }

    _currentFallSpeed() {
        const base = CONFIG.CORE.FALL_SPEED_BASE || 8;
        // 레벨당 +5% 가속
        const levelMult = 1 + (this.level - 1) * (CONFIG.CORE.SPEED_MULT_PER_LEVEL || 0.05);
        return base * this.speedMult * levelMult;
    }

    _currentSpawnInterval() {
        const base = CONFIG.CORE.SPAWN_INTERVAL_BASE || 2000;
        // 레벨당 spawn 주기 단축
        const levelReduction = (this.level - 1) * (CONFIG.CORE.SPAWN_REDUCTION_PER_LEVEL || 150);
        const interval = (base / this.spawnMult) - levelReduction;
        return Math.max(CONFIG.CORE.SPAWN_MIN_INTERVAL || 500, interval);
    }

    _spawnNextWord() {
        const text = this.wordPool.shift();
        if (!text) return;

        const xMin = CONFIG.CORE.SPAWN_X_MIN ?? 8;
        const xMax = CONFIG.CORE.SPAWN_X_MAX ?? 88;
        const word = {
            id: ++this._nextWordId,
            text,
            x: xMin + Math.random() * (xMax - xMin),
            y: 0,
            speed: this._currentFallSpeed(),
            typedIndex: 0,
            isBoss: false,
        };

        // 보스 — Lv N+ 확률
        const bossCfg = CONFIG.BOSS || {};
        if (this.level >= (bossCfg.MIN_LEVEL || 3) &&
            Math.random() < (bossCfg.PROBABILITY || 0.05)) {
            word.isBoss = true;
            if (typeof Sound !== 'undefined' && Sound.play) Sound.play('bell', 1.0);
            if (typeof Effects !== 'undefined' && Effects.screenShake) Effects.screenShake();
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast('기말고사 핵심 키워드!', `"${text}" 등장`, 'BOSS');
            }
        }

        this.fallingWords.push(word);
    }

    /**
     * PR-K: 글자 단위 입력 처리.
     * - lock 없음: 첫 글자가 활성 단어 중 하나의 첫 글자와 매칭 → lock
     * - lock 있음: 해당 단어의 다음 글자 매칭. 마지막 글자에 자동 처치
     * - 매칭 실패: errorFlash (lock 유지)
     */
    handleCharInput(char) {
        if (this.isPaused || this.softPaused || this.isGameOver) return;
        if (!char || char.length !== 1) return;

        if (this.lockedWordId !== null) {
            const w = this.fallingWords.find(fw => fw.id === this.lockedWordId);
            if (!w) {
                this.lockedWordId = null;
                return this.handleCharInput(char);
            }
            const expected = w.text[w.typedIndex];
            if (char === expected) {
                w.typedIndex++;
                this.totalTypedChars++;
                if (window.GameAPI && GameAPI.onCorrectChar) GameAPI.onCorrectChar(char);
                if (w.typedIndex >= w.text.length) {
                    this._destroyWord(w);
                }
            } else {
                if (window.GameAPI && GameAPI.onWrongChar) GameAPI.onWrongChar(char);
            }
        } else {
            // 첫 글자 매칭 — 모든 활성 단어의 첫 글자와 비교
            const candidate = this.fallingWords.find(w => w.typedIndex === 0 && w.text[0] === char);
            if (candidate) {
                this.lockedWordId = candidate.id;
                candidate.typedIndex = 1;
                this.totalTypedChars++;
                if (window.GameAPI && GameAPI.onCorrectChar) GameAPI.onCorrectChar(char);
                if (candidate.typedIndex >= candidate.text.length) {
                    this._destroyWord(candidate);
                }
            } else {
                if (window.GameAPI && GameAPI.onWrongChar) GameAPI.onWrongChar(char);
            }
        }
    }

    _destroyWord(word) {
        this.successWords++;
        this.totalWordAttempts++;
        this.score += CONFIG.SCORING.WORD_DESTROY_BASE;

        if (word.isBoss) {
            this.score += CONFIG.SCORING.BOSS_BONUS;
            this.bossKills++;
            Achievements.check(ACHIEVEMENT_IDS.BOSS_HUNTER, this.bossKills);
        }

        // chalkDust at word position
        if (window.GameAPI && window.GameAPI.onWordDestroyed) {
            const rect = (typeof UI !== 'undefined' && UI.getFallingWordRect)
                ? UI.getFallingWordRect(word.id) : null;
            if (rect) {
                GameAPI.onWordDestroyed(rect.left + rect.width / 2, rect.top + rect.height / 2);
            } else {
                GameAPI.onWordDestroyed(0, 0);
            }
        }

        Achievements.check(ACHIEVEMENT_IDS.FIRST_WORD, 1);

        // 콤보
        const modeConfig = CONFIG.MODES[this.mode];
        if (modeConfig && modeConfig.hasCombo) {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            Achievements.check(ACHIEVEMENT_IDS.COMBO_10, this.combo);
            Achievements.check(ACHIEVEMENT_IDS.COMBO_50, this.combo);
            if (this.combo >= CONFIG.SCORING.COMBO_GLOW_THRESHOLD) {
                Effects.toggleGlow(true, this.combo);
            }
            if (window.GameAPI && typeof GameAPI.onComboChange === 'function') {
                GameAPI.onComboChange(this.combo);
            }
        }

        // 단어 제거
        this.fallingWords = this.fallingWords.filter(w => w.id !== word.id);
        if (this.lockedWordId === word.id) this.lockedWordId = null;
    }

    _expireWord(word) {
        this.missed++;
        this.levelMissed++;
        this.totalWordAttempts++;
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

        this.fallingWords = this.fallingWords.filter(w => w.id !== word.id);
        if (this.lockedWordId === word.id) this.lockedWordId = null;
    }

    /** PR-K: UI 시각 경고용 — 가장 임박한 단어의 바닥 도달 비율 (0~1) */
    getMostImpendingExpiryRatio() {
        if (!this.fallingWords.length) return 0;
        const floor = (CONFIG.CORE.FALL_FLOOR_RATIO || 0.92) * 100;
        let max = 0;
        for (const w of this.fallingWords) {
            const r = Math.min(1, w.y / floor);
            if (r > max) max = r;
        }
        return max;
    }

    softPause() {
        if (this.isPaused || this.isGameOver || this.softPaused) return;
        this.softPaused = true;
        this._softPauseStart = Date.now();
    }

    softResume() {
        if (!this.softPaused) return;
        this.softPaused = false;
        const elapsed = Date.now() - (this._softPauseStart || Date.now());
        this._lastSpawnAt += elapsed; // 일시정지 동안 spawn 카운트 안 흐름
        this._lastUpdateAt = Date.now();
        if (this.startTime) { // 시간 정지 로직 추가
            this.startTime += elapsed;
        }
        this._softPauseStart = null;
    }

    pause() {
        if (this.isGameOver || this.isPaused) return;
        this.isPaused = true;
        UI.showPauseOverlay();
    }
    resume() {
        if (this.isGameOver || !this.isPaused) return;
        this.isPaused = false;
        this._lastUpdateAt = Date.now();
        UI.hidePauseOverlay();
    }
    togglePause() {
        if (this.isGameOver) return;
        if (this.isPaused) this.resume(); else this.pause();
    }

    goToMenu() {
        this.isPaused = false;
        this.isGameOver = true;
        UI.hidePauseOverlay();
        if (typeof UI !== 'undefined' && UI.showScene) UI.showScene('start');
        if (typeof window !== 'undefined') window.game = null;
    }

    /** Deprecated 호환 — 외부 코드가 호출할 수 있어 stub만 유지 */
    checkAnswer(_inputWord) { /* no-op: PR-K는 글자 단위로 처리 */ }
    handleSuccess(_idx, _word) { /* no-op */ }
    handleFailure() { /* no-op */ }
    checkWordTimeouts() { /* no-op: PR-K는 낙하 충돌로 대체 */ }
    setLanguage(_lang) { /* W3 미구현 */ }

    levelUp() {
        if (typeof Sound !== 'undefined' && Sound.play) Sound.play('levelUp', 1.0);
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.level++;

        Achievements.check(ACHIEVEMENT_IDS.GRADUATION, this.level);
        this.wordPool = this._loadWordPool(this.level);

        if (this.wordPool.length > 0) {
            const nextLevel = this.level;
            if (typeof Effects !== 'undefined' && Effects.boardWipe) {
                Effects.boardWipe(() => {
                    const lectureTitle = document.querySelector('.blackboard h2');
                    if (lectureTitle) lectureTitle.textContent = `LEVEL ${nextLevel}`;
                });
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`LV.${nextLevel}`, '레벨 업!', `LV${nextLevel}`, 1200);
            }
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
