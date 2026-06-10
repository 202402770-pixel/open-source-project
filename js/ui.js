const UI = {
  lastInputLength: 0,
  currentTargetWord: null,
  controlsBound: false,

  get combo() {
    return document.getElementById('combo');
  },
  
  get wordDisplay() {
    return document.getElementById('word-display');
  },

  get score() {
    return document.getElementById('score');
  },

  get achievementModal() {
    return document.getElementById('achievement-modal');
  },

  get achievementContainer() {
    return document.getElementById('achievement-container');
  },

  get achievementProgress() {
    return document.getElementById('achievement-progress');
  },

  get achievementTabs() {
    return document.querySelectorAll('.achieve-tab-btn');
  },

  get level() {
    return document.getElementById('level');
  },

  get missed() {
    return document.getElementById('missed');
  },

  get hpFill() {
    return document.getElementById('hp-fill');
  },

  get hpText() {
    return document.getElementById('hp-text');
  },

  get toastContainer() {
    return document.getElementById('toast-container');
  },

  get wpmDisplay() {
    return document.getElementById('wpm');
  },

  initAchievements() {
    if (this.achievementTabs) {
      this.achievementTabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
          this.achievementTabs.forEach((t) => t.classList.remove('active'));
          e.target.classList.add('active');
          this.renderAchievements(e.target.dataset.filter);
        });
      });
    }
  },

  /**
   * Daily 출석 도장 모달 표시 (W3 박태준 — Figma 21:59).
   * 데이터: Achievements.checkAttendance가 갱신한 CONFIG.STORAGE.DAILY_STREAK / DAILY_LAST_DATE 활용.
   *
   * @param {boolean} show
   */
  toggleAttendanceModal(show) {
    const modal = document.getElementById('attendance-modal');
    if (!modal) return;
    if (show) {
      this.renderAttendance();
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  },

  /**
   * 출석 도장 7칸 그리드 렌더 + 연속 일수 갱신.
   * 상태:
   *   done    — 지난 연속 출석일 (1 ~ streak-1)
   *   today   — 오늘 (streak번째, 오늘 이미 출석한 경우만)
   *   pending — 남은 빈칸
   */
  renderAttendance() {
    const grid = document.getElementById('attendance-grid');
    const streakLabel = document.getElementById('attendance-streak');
    if (!grid) return;

    const MAX = (typeof CONFIG !== 'undefined' && CONFIG.DAILY && CONFIG.DAILY.STREAK_MAX) || 7;
    const streak = parseInt(localStorage.getItem(CONFIG.STORAGE.DAILY_STREAK), 10) || 0;
    const lastDateStr = localStorage.getItem(CONFIG.STORAGE.DAILY_LAST_DATE);
    const todayStr = new Date().toDateString();
    const checkedInToday = lastDateStr === todayStr;
    // 7칸 초과 streak는 그리드 안에서 MAX로 clamp (도전과제 자체는 누적 계속)
    const clampedStreak = Math.min(streak, MAX);

    if (streakLabel) {
      streakLabel.textContent = `${streak}일 연속`;
    }

    grid.innerHTML = '';
    for (let i = 1; i <= MAX; i += 1) {
      const cell = document.createElement('div');
      let status = 'pending';
      let label = '';
      if (i < clampedStreak) {
        status = 'done';
        label = '✓';
      } else if (i === clampedStreak && checkedInToday) {
        status = 'today';
        label = '오늘';
      } else if (i === clampedStreak && !checkedInToday) {
        // 어제까지 출석한 마지막 날 (오늘 미출석)
        status = 'done';
        label = '✓';
      }
      cell.className = `attendance-cell ${status}`;
      cell.setAttribute('role', 'listitem');
      cell.setAttribute('aria-label', `${i}일차 ${status}`);
      cell.innerHTML = `<span class="attendance-cell-num">${i}</span><span class="attendance-cell-mark">${label}</span>`;
      grid.appendChild(cell);
    }
  },

  toggleAchievementModal(show) {
    if (!this.achievementModal) return;

    if (show) {
      if (this.achievementTabs[0] && !this.achievementTabs[0].dataset.initialized) {
        this.initAchievements();
        this.achievementTabs[0].dataset.initialized = 'true';
      }

      this.achievementModal.classList.remove('hidden');
      this.renderAchievements('all');
      this.achievementTabs.forEach((t) => t.classList.remove('active'));

      const allTab = document.querySelector('.achieve-tab-btn[data-filter="all"]');
      if (allTab) allTab.classList.add('active');
    } else {
      this.achievementModal.classList.add('hidden');
    }
  },

  renderAchievements(filter) {
    if (!this.achievementContainer) return;

    this.achievementContainer.innerHTML = '';

    const challenges = Achievements.CHALLENGES;
    const acquiredCount = challenges.filter((c) => c.isCompleted).length;

    if (this.achievementProgress) {
      this.achievementProgress.innerText = `${acquiredCount} / ${challenges.length}`;
    }

    challenges.forEach((challenge) => {
      if (filter === 'acquired' && !challenge.isCompleted) return;
      if (filter === 'unacquired' && challenge.isCompleted) return;

      const statusClass = challenge.isCompleted ? 'acquired' : 'unacquired';
      const iconText = challenge.isCompleted ? challenge.icon : '🔒';

      const card = document.createElement('div');
      card.className = `achieve-card ${statusClass}`;
      card.innerHTML = `
        <div class="achieve-icon">${iconText}</div>
        <div class="achieve-name">${challenge.title}</div>
        <div class="achieve-desc">${challenge.description}</div>
      `;

      this.achievementContainer.appendChild(card);
    });
  },

  get gameOverScreen() {
    return document.querySelector('.game-over');
  },

  get scenes() {
    return document.querySelectorAll('[data-scene]');
  },

  get rankingModal() {
    return document.getElementById('ranking-modal');
  },

  get rankingContainer() {
    return document.getElementById('ranking-container');
  },

  get rankingTabs() {
    return document.querySelectorAll('.tab-btn');
  },

  mockRankingData: {
    all: [
      { name: '익명#A12', score: 34850, combo: 120, level: 12, isMe: false },
      { name: '익명#B34', score: 28420, combo: 95, level: 11, isMe: false },
      { name: '익명#C56', score: 25200, combo: 88, level: 11, isMe: false },
      { name: '익명#D78', score: 24100, combo: 82, level: 11, isMe: false },
      { name: '익명#E90', score: 23800, combo: 79, level: 11, isMe: false },
      { name: '익명#A91', score: 21500, combo: 75, level: 10, isMe: false },
      { name: '익명#F12', score: 19200, combo: 68, level: 9, isMe: false },
      { name: 'YOU (당신)', score: 18450, combo: 67, level: 9, isMe: true },
    ],
    week: [
      { name: '익명#D78', score: 24100, combo: 82, level: 11, isMe: false },
      { name: '익명#E90', score: 23800, combo: 79, level: 11, isMe: false },
      { name: '익명#A91', score: 21500, combo: 75, level: 10, isMe: false },
      { name: 'YOU (당신)', score: 18450, combo: 67, level: 9, isMe: true },
      { name: '익명#H56', score: 16500, combo: 54, level: 9, isMe: false },
      { name: '익명#K34', score: 15800, combo: 50, level: 8, isMe: false },
      { name: '익명#I78', score: 14900, combo: 48, level: 8, isMe: false },
      { name: '익명#J90', score: 14200, combo: 45, level: 8, isMe: false },
    ],
    today: [
      { name: 'YOU (당신)', score: 18450, combo: 67, level: 9, isMe: true },
      { name: '익명#K34', score: 15800, combo: 50, level: 8, isMe: false },
      { name: '익명#I78', score: 14900, combo: 48, level: 8, isMe: false },
      { name: '익명#J90', score: 14200, combo: 45, level: 8, isMe: false },
      { name: '익명#M55', score: 13600, combo: 42, level: 7, isMe: false },
      { name: '익명#N34', score: 11500, combo: 35, level: 6, isMe: false },
      { name: '익명#O56', score: 10800, combo: 31, level: 6, isMe: false },
      { name: '익명#X12', score: 9900, combo: 28, level: 5, isMe: false },
    ],
  },

  settingsDefaults: {
    lecture: {
      language: 'en',
      difficulty: 'easy',
      customWords: '',
    },
    appearance: {
      theme: 'classroom',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false,
    },
    sound: {
      sfxVolume: 70,
      bgmVolume: 30,
      keyboardSound: true,
      levelupSound: true,
    },
  },

  initControls() {
    if (this.controlsBound) return;
    this.controlsBound = true;

    const toggleButtons = document.querySelectorAll('.td-toggle');

    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.closest('.td-toggle-group');
        if (!group) return;

        const buttonsInGroup = group.querySelectorAll('.td-toggle');
        buttonsInGroup.forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });

    const sceneButtons = document.querySelectorAll('[data-go]');

    sceneButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetScene = button.dataset.go;
        this.showScene(targetScene);
      });
    });
  },

  initTutorial() {
    this.tutorialIndex = 0;
    this.tutorialDoneKey = 'tutorial_done';

    this.tutorialModal = document.getElementById('tutorial-modal');
    this.tutorialSlides = document.querySelectorAll('[data-tutorial-slide]');
    this.tutorialDots = document.querySelectorAll('.tutorial-dot');
    this.tutorialNextBtn = document.querySelector('[data-tutorial-action="next"]');
    this.tutorialPrevBtn = document.querySelector('[data-tutorial-action="prev"]');
    this.tutorialSkipBtn = document.querySelector('[data-tutorial-action="skip"]');
    this.showTutorialBtn = document.getElementById('show-tutorial-btn');

    if (!this.tutorialModal || this.tutorialSlides.length === 0) return;

    if (this.tutorialNextBtn) {
      this.tutorialNextBtn.addEventListener('click', () => this.nextTutorialSlide());
    }

    if (this.tutorialPrevBtn) {
      this.tutorialPrevBtn.addEventListener('click', () => this.prevTutorialSlide());
    }

    if (this.tutorialSkipBtn) {
      this.tutorialSkipBtn.addEventListener('click', () => {
        localStorage.setItem(this.tutorialDoneKey, 'true');
        this.closeTutorial();
      });
    }

    if (this.showTutorialBtn) {
      this.showTutorialBtn.addEventListener('click', () => {
        this.openTutorial(0);
      });
    }

    const isTutorialDone = localStorage.getItem(this.tutorialDoneKey) === 'true';

    if (!isTutorialDone) {
      this.openTutorial(0);
    }
  },

  openTutorial(index = 0) {
    if (!this.tutorialModal) return;

    this.tutorialIndex = index;
    this.tutorialModal.classList.remove('hidden');
    this.renderTutorialSlide();
    this._softPauseGameIfPlaying(); // PR-E: 게임 진행 중 도움말 보기 안전
  },

  closeTutorial() {
    if (!this.tutorialModal) return;

    this.tutorialModal.classList.add('hidden');
    this._softResumeGameIfPlaying();
  },

  renderTutorialSlide() {
    if (!this.tutorialSlides || this.tutorialSlides.length === 0) return;

    this.tutorialSlides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === this.tutorialIndex);
    });

    if (this.tutorialDots) {
      this.tutorialDots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === this.tutorialIndex);
      });
    }

    if (this.tutorialPrevBtn) {
      this.tutorialPrevBtn.disabled = this.tutorialIndex === 0;
    }

    if (this.tutorialNextBtn) {
      const isLastSlide = this.tutorialIndex === this.tutorialSlides.length - 1;
      this.tutorialNextBtn.textContent = isLastSlide ? '게임 시작' : '다음';
    }
  },

  nextTutorialSlide() {
    if (!this.tutorialSlides || this.tutorialSlides.length === 0) return;

    const isLastSlide = this.tutorialIndex === this.tutorialSlides.length - 1;

    if (isLastSlide) {
      localStorage.setItem(this.tutorialDoneKey, 'true');
      this.closeTutorial();
      // 이미 게임이 진행 중이면 (플레이 중 도움말을 본 경우) 화면만 복귀한다.
      // 아직 시작 전이면 (첫 방문 튜토리얼 완료) 실제 게임을 시작해야 한다 —
      // start()가 호출되지 않으면 game이 null이라 빈 플레이 화면에서 입력이 먹지 않는다.
      if (window.game && !window.game.isGameOver) {
        this.showScene('play');
      } else {
        const startBtn = document.querySelector('[data-go="play"]');
        if (startBtn) startBtn.click(); // start() + showScene('play') 정식 시작 경로 재사용
        else this.showScene('play');
      }
      return;
    }

    this.tutorialIndex += 1;
    this.renderTutorialSlide();
  },

  prevTutorialSlide() {
    if (this.tutorialIndex <= 0) return;

    this.tutorialIndex -= 1;
    this.renderTutorialSlide();
  },

  initPauseControls(gameInstance) {
    // PR-B: idempotent — 두 번째 이후 호출은 game 객체만 갱신 (이벤트 리스너 중복 방지)
    this.currentGame = gameInstance;
    if (this._pauseControlsInited) return;
    this._pauseControlsInited = true;

    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const menuBtn = document.getElementById('pause-menu-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (this.currentGame) this.currentGame.togglePause();
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (this.currentGame) this.currentGame.resume();
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (this.currentGame) this.currentGame.goToMenu();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      // PR-S: Esc 통일 — 열려있는 모달 먼저 닫고, 없으면 게임 toggle pause
      const settings = document.getElementById('settings-modal');
      const tutorial = document.getElementById('tutorial-modal');
      const ranking = document.getElementById('ranking-modal');
      const achievement = document.getElementById('achievement-modal');
      const attendance = document.getElementById('attendance-modal');

      if (settings && !settings.classList.contains('hidden')) {
        event.preventDefault();
        UI.closeSettings();
        return;
      }
      if (tutorial && !tutorial.classList.contains('hidden')) {
        event.preventDefault();
        UI.closeTutorial();
        return;
      }
      if (ranking && !ranking.classList.contains('hidden')) {
        event.preventDefault();
        UI.toggleRankingModal(false);
        return;
      }
      if (achievement && !achievement.classList.contains('hidden')) {
        event.preventDefault();
        UI.toggleAchievementModal(false);
        return;
      }
      if (attendance && !attendance.classList.contains('hidden')) {
        event.preventDefault();
        UI.toggleAttendanceModal(false);
        return;
      }

      // 모달 없으면 게임 pause toggle (기존 동작)
      if (!this.currentGame || this.currentGame.isGameOver) return;
      event.preventDefault();
      this.currentGame.togglePause();
    });
  },

  showPauseOverlay() {
    const pauseModal = document.getElementById('pause-modal');

    if (!pauseModal) return;

    pauseModal.classList.remove('hidden');
    pauseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-paused');
  },

  hidePauseOverlay() {
    const pauseModal = document.getElementById('pause-modal');

    if (!pauseModal) return;

    pauseModal.classList.add('hidden');
    pauseModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-paused');

    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput) hiddenInput.focus();
  },

  initSettings() {
    this.settingsModal = document.getElementById('settings-modal');
    this.settingsTabs = document.querySelectorAll('[data-settings-tab]');
    this.settingsPanels = document.querySelectorAll('[data-settings-panel]');
    this.settingsState = this.loadSettings();

    const openButtons = [
      document.getElementById('show-settings-btn'),
      document.getElementById('show-settings-play-btn'),
    ];

    openButtons.forEach((button) => {
      if (button) {
        button.addEventListener('click', () => this.openSettings());
      }
    });

    const closeBtn = document.getElementById('close-settings-btn');
    const backdrop = document.querySelector('[data-settings-close]');
    const saveBtn = document.getElementById('save-settings-btn');
    const resetBtn = document.getElementById('reset-settings-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSettings());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeSettings());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.collectSettingsFromForm();
        this.saveSettings();
        this.applySettings();
        this.closeSettings();
        this.showToast('설정 저장', '설정이 저장되었습니다.', 'OK');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.settingsState = this.cloneSettings(this.settingsDefaults);
        this.updateSettingsForm();
        this.saveSettings();
        this.applySettings();
        this.showToast('설정 초기화', '기본값으로 되돌렸습니다.', '↺');
      });
    }

    this.settingsTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.switchSettingsTab(tab.dataset.settingsTab);
      });
    });

    const choiceButtons = document.querySelectorAll('[data-setting-group]');

    choiceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.dataset.settingGroup;
        const value = button.dataset.settingValue;
        this.setSettingsChoice(group, value);
      });
    });

    this.bindLivePreview();

    this.updateSettingsForm();
    this.applySettings();
    this.syncStartModalDifficulty(this.settingsState.lecture.difficulty);
  },

  bindLivePreview() {
    const livePreviewBindings = [
      { id: 'settings-reduced-motion', group: 'appearance', key: 'reducedMotion', event: 'change', prop: 'checked' },
      { id: 'settings-high-contrast', group: 'appearance', key: 'highContrast', event: 'change', prop: 'checked' },
      { id: 'settings-keyboard-sound', group: 'sound', key: 'keyboardSound', event: 'change', prop: 'checked' },
      { id: 'settings-levelup-sound', group: 'sound', key: 'levelupSound', event: 'change', prop: 'checked' },
      { id: 'settings-sfx-volume', group: 'sound', key: 'sfxVolume', event: 'input', prop: 'value', parse: Number, outputId: 'settings-sfx-volume-value' },
      { id: 'settings-bgm-volume', group: 'sound', key: 'bgmVolume', event: 'input', prop: 'value', parse: Number, outputId: 'settings-bgm-volume-value' },
    ];

    livePreviewBindings.forEach(({ id, group, key, event, prop, parse, outputId }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(event, () => {
        const raw = el[prop];
        const value = parse ? parse(raw) : raw;
        this.settingsState[group][key] = value;
        if (outputId) this.updateRangeOutput(id, outputId);
        this.saveSettings();
        this.applySettings();
      });
    });

    const language = document.getElementById('settings-language');
    if (language) {
      language.addEventListener('change', () => {
        this.settingsState.lecture.language = language.value;
        this.saveSettings();
      });
    }

    const customWords = document.getElementById('settings-custom-words');
    if (customWords) {
      customWords.addEventListener('input', () => {
        this.settingsState.lecture.customWords = customWords.value;
      });
      customWords.addEventListener('change', () => {
        this.saveSettings();
        this.applySettings();
      });
    }
  },

  cloneSettings(settings) {
    return JSON.parse(JSON.stringify(settings));
  },

  getStorageKey(keyName, fallback) {
    if (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE[keyName]) {
      return CONFIG.STORAGE[keyName];
    }

    return fallback;
  },

  loadSettings() {
    const merged = this.cloneSettings(this.settingsDefaults);

    const lectureKey = this.getStorageKey('SETTINGS_LECTURE', 'td_settings_lecture');
    const appearanceKey = this.getStorageKey('SETTINGS_APPEAR', 'td_settings_appearance');
    const soundKey = this.getStorageKey('SETTINGS_SOUND', 'td_settings_sound');

    const lecture = this.readJsonStorage(lectureKey);
    const appearance = this.readJsonStorage(appearanceKey);
    const sound = this.readJsonStorage(soundKey);

    if (lecture) Object.assign(merged.lecture, lecture);
    if (appearance) Object.assign(merged.appearance, appearance);
    if (sound) Object.assign(merged.sound, sound);

    return merged;
  },

  readJsonStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  },

  saveSettings() {
    const lectureKey = this.getStorageKey('SETTINGS_LECTURE', 'td_settings_lecture');
    const appearanceKey = this.getStorageKey('SETTINGS_APPEAR', 'td_settings_appearance');
    const soundKey = this.getStorageKey('SETTINGS_SOUND', 'td_settings_sound');

    try {
      localStorage.setItem(lectureKey, JSON.stringify(this.settingsState.lecture));
      localStorage.setItem(appearanceKey, JSON.stringify(this.settingsState.appearance));
      localStorage.setItem(soundKey, JSON.stringify(this.settingsState.sound));
    } catch (_) {
      console.warn('[Settings] localStorage 저장 실패');
    }
  },

  updateSettingsForm() {
    const language = document.getElementById('settings-language');
    const customWords = document.getElementById('settings-custom-words');
    const reducedMotion = document.getElementById('settings-reduced-motion');
    const highContrast = document.getElementById('settings-high-contrast');
    const sfxVolume = document.getElementById('settings-sfx-volume');
    const bgmVolume = document.getElementById('settings-bgm-volume');
    const keyboardSound = document.getElementById('settings-keyboard-sound');
    const levelupSound = document.getElementById('settings-levelup-sound');

    if (language) language.value = this.settingsState.lecture.language;
    if (customWords) customWords.value = this.settingsState.lecture.customWords;

    if (reducedMotion) reducedMotion.checked = this.settingsState.appearance.reducedMotion;
    if (highContrast) highContrast.checked = this.settingsState.appearance.highContrast;

    if (sfxVolume) sfxVolume.value = this.settingsState.sound.sfxVolume;
    if (bgmVolume) bgmVolume.value = this.settingsState.sound.bgmVolume;
    if (keyboardSound) keyboardSound.checked = this.settingsState.sound.keyboardSound;
    if (levelupSound) levelupSound.checked = this.settingsState.sound.levelupSound;

    this.updateChoiceGroup('difficulty', this.settingsState.lecture.difficulty);
    this.updateChoiceGroup('theme', this.settingsState.appearance.theme);
    this.updateChoiceGroup('fontSize', this.settingsState.appearance.fontSize);

    this.updateRangeOutput('settings-sfx-volume', 'settings-sfx-volume-value');
    this.updateRangeOutput('settings-bgm-volume', 'settings-bgm-volume-value');
  },

  collectSettingsFromForm() {
    const language = document.getElementById('settings-language');
    const customWords = document.getElementById('settings-custom-words');
    const reducedMotion = document.getElementById('settings-reduced-motion');
    const highContrast = document.getElementById('settings-high-contrast');
    const sfxVolume = document.getElementById('settings-sfx-volume');
    const bgmVolume = document.getElementById('settings-bgm-volume');
    const keyboardSound = document.getElementById('settings-keyboard-sound');
    const levelupSound = document.getElementById('settings-levelup-sound');

    if (language) this.settingsState.lecture.language = language.value;
    if (customWords) this.settingsState.lecture.customWords = customWords.value;

    if (reducedMotion) this.settingsState.appearance.reducedMotion = reducedMotion.checked;
    if (highContrast) this.settingsState.appearance.highContrast = highContrast.checked;

    if (sfxVolume) this.settingsState.sound.sfxVolume = Number(sfxVolume.value);
    if (bgmVolume) this.settingsState.sound.bgmVolume = Number(bgmVolume.value);
    if (keyboardSound) this.settingsState.sound.keyboardSound = keyboardSound.checked;
    if (levelupSound) this.settingsState.sound.levelupSound = levelupSound.checked;
  },

  setSettingsChoice(group, value) {
    if (group === 'difficulty') {
      this.settingsState.lecture.difficulty = value;
      this.syncStartModalDifficulty(value);
      this.saveSettings();
    }

    if (group === 'theme') {
      this.settingsState.appearance.theme = value;
      this.saveSettings();
      this.applySettings();
    }

    if (group === 'fontSize') {
      this.settingsState.appearance.fontSize = value;
      this.saveSettings();
      this.applySettings();
    }

    this.updateChoiceGroup(group, value);
  },

  syncStartModalDifficulty(value) {
    const difficultyGroup = document.querySelector('[aria-label="난이도 선택"]');
    if (!difficultyGroup) return;
    const buttons = difficultyGroup.querySelectorAll('.td-toggle');
    buttons.forEach((btn) => {
      const txt = (btn.textContent || '').trim().toUpperCase();
      const btnValue = txt === 'NORMAL' ? 'normal' : txt === 'HARD' ? 'hard' : 'easy';
      btn.classList.toggle('is-active', btnValue === value);
    });
  },

  setDifficultyFromStart(value) {
    if (!this.settingsState) return;
    this.settingsState.lecture.difficulty = value;
    this.updateChoiceGroup('difficulty', value);
    this.saveSettings();
  },

  getActiveDifficulty() {
    return (this.settingsState && this.settingsState.lecture.difficulty) || 'easy';
  },

  updateChoiceGroup(group, value) {
    const buttons = document.querySelectorAll(`[data-setting-group="${group}"]`);

    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.settingValue === value);
    });
  },

  updateRangeOutput(inputId, outputId) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);

    if (!input || !output) return;

    output.textContent = `${input.value}%`;
  },

  switchSettingsTab(tabName) {
    if (!tabName) return;

    this.settingsTabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.settingsTab === tabName);
    });

    this.settingsPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.settingsPanel === tabName);
    });
  },

  // PR-E: 모달 열림 시 게임 자동 softPause (overlay 없이 시간만 정지)
  _softPauseGameIfPlaying() {
    if (window.game && !window.game.isGameOver && !window.game.isPaused
      && typeof window.game.softPause === 'function') {
      window.game.softPause();
    }
  },

  _softResumeGameIfPlaying() {
    if (window.game && !window.game.isGameOver
      && typeof window.game.softResume === 'function') {
      window.game.softResume();
    }
  },

  openSettings() {
    if (!this.settingsModal) return;

    this.updateSettingsForm();
    this.settingsModal.classList.remove('hidden');
    this.settingsModal.setAttribute('aria-hidden', 'false');
    this._softPauseGameIfPlaying();
  },

  closeSettings() {
    if (!this.settingsModal) return;

    this.settingsModal.classList.add('hidden');
    this.settingsModal.setAttribute('aria-hidden', 'true');
    this._softResumeGameIfPlaying();

    setTimeout(() => {
      const hiddenInput = document.getElementById('hidden-input');
      if (hiddenInput) {
          hiddenInput.value = '';
          if (typeof Input !== 'undefined') Input.lastValLength = 0;
          hiddenInput.focus();
      }
    }, 50);
  },

  applySettings() {
    const appearance = this.settingsState.appearance;
    const sound = this.settingsState.sound;

    if (typeof Themes !== 'undefined') {
      Themes.save(appearance.theme);
    } else {
      document.documentElement.setAttribute('data-theme', appearance.theme);
    }

    document.documentElement.setAttribute('data-font-size', appearance.fontSize);
    document.documentElement.setAttribute(
      'data-motion',
      appearance.reducedMotion ? 'reduced' : 'default'
    );
    document.documentElement.setAttribute(
      'data-contrast',
      appearance.highContrast ? 'high' : 'default'
    );

    if (typeof Sound !== 'undefined' && typeof Sound.setSettings === 'function') {
      Sound.setSettings({
        sfxVolume: sound.sfxVolume / 100,
        bgmVolume: sound.bgmVolume / 100,
        keyboardSound: sound.keyboardSound,
        levelupSound: sound.levelupSound,
      });
    }

    if (typeof WordData !== 'undefined' && typeof WordData.setCustomWords === 'function') {
      WordData.setCustomWords(this.settingsState.lecture.customWords);
    }
  },

  showScene(sceneName) {
    if (!sceneName) return;

    this.scenes.forEach((scene) => {
      const isTargetScene = scene.dataset.scene === sceneName;
      scene.classList.toggle('is-active', isTargetScene);
    });

    if (sceneName === 'play') {
      const hiddenInput = document.getElementById('hidden-input');
      if (hiddenInput) hiddenInput.focus();
    }
  },

  initRanking() {
    this.initControls();

    const closeBtn = document.getElementById('close-ranking-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleRankingModal(false));
    }

    if (this.rankingTabs) {
      this.rankingTabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
          this.rankingTabs.forEach((item) => item.classList.remove('active'));
          event.target.classList.add('active');
          this.renderRanking(event.target.dataset.type);
        });
      });
    }
  },

  toggleRankingModal(show) {
    if (!this.rankingModal) return;

    if (show) {
      this._softPauseGameIfPlaying();
      this.rankingModal.classList.remove('hidden');
      this.renderRanking('all');

      if (this.rankingTabs.length > 0) {
        this.rankingTabs.forEach((tab) => tab.classList.remove('active'));

        const allTab = document.querySelector('.tab-btn[data-type="all"]');
        if (allTab) allTab.classList.add('active');
      }
    } else {
      this.rankingModal.classList.add('hidden');
      this._softResumeGameIfPlaying();
      setTimeout(() => {
        const hiddenInput = document.getElementById('hidden-input');
        if (hiddenInput) {
            hiddenInput.value = '';
            if (typeof Input !== 'undefined') Input.lastValLength = 0; 
            hiddenInput.focus();
        }
      }, 50);
    }
  },

  renderRanking(type) {
    if (!this.rankingContainer) return;

    this.rankingContainer.innerHTML = '';

    const data = this.mockRankingData[type] || this.mockRankingData.all;

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

  /**
   * PR-K: 낙하 시스템 — 가장 임박한 단어의 바닥 도달 비율을 word-field에 시각 표시.
   *   70~85%: .danger (붉은 외곽)
   *   85%+:   .critical (펄스)
   */
  updateWordDanger(gameInstance) {
    if (!gameInstance || typeof gameInstance.getMostImpendingExpiryRatio !== 'function') return;
    const wf = document.querySelector('.word-field');
    if (!wf) return;
    const ratio = gameInstance.getMostImpendingExpiryRatio();
    const warn = (CONFIG && CONFIG.CORE && CONFIG.CORE.WORD_DANGER_RATIO) || 0.70;
    const crit = (CONFIG && CONFIG.CORE && CONFIG.CORE.WORD_CRITICAL_RATIO) || 0.85;
    wf.classList.remove('danger', 'critical');
    if (ratio >= crit) wf.classList.add('critical');
    else if (ratio >= warn) wf.classList.add('danger');
  },

  /**
   * PR-K: 정통 타이핑 디펜스 — 떨어지는 단어들 렌더.
   * word-field 안에 각 단어를 absolute 위치로 그림. element는 id 기반 재사용.
   */
  _fallingWordEls: null,
  renderFallingWords(game) {
    const wf = document.querySelector('.word-field');
    if (!wf) return;
    if (!this._fallingWordEls) this._fallingWordEls = new Map();

    const activeIds = new Set(game.fallingWords.map(w => w.id));

    // 제거된 element 정리
    for (const [id, el] of this._fallingWordEls) {
      if (!activeIds.has(id)) {
        el.remove();
        this._fallingWordEls.delete(id);
      }
    }

    // PR-T: 가장 가까운(y 가장 큰 = 바닥에 임박한, lock 안 된) 단어 ID 계산
    let closestId = null;
    if (game.lockedWordId === null) {
      let maxY = -Infinity;
      for (const w of game.fallingWords) {
        if (w.typedIndex === 0 && w.y > maxY) { maxY = w.y; closestId = w.id; }
      }
    }

    // 추가/갱신
    for (const w of game.fallingWords) {
      let el = this._fallingWordEls.get(w.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'falling-word';
        wf.appendChild(el);
        this._fallingWordEls.set(w.id, el);
      }
      el.style.left = `${w.x}%`;
      el.style.top = `${w.y}%`;
      el.classList.toggle('is-locked', game.lockedWordId === w.id);
      el.classList.toggle('is-boss', !!w.isBoss);
      el.classList.toggle('is-closest', w.id === closestId);

      // 글자 spans 재구성 (text length가 바뀔 일은 없음)
      if (el.children.length !== w.text.length) {
        el.innerHTML = '';
        for (let i = 0; i < w.text.length; i++) {
          const span = document.createElement('span');
          span.textContent = w.text[i];
          el.appendChild(span);
        }
      }
      for (let i = 0; i < w.text.length; i++) {
        const span = el.children[i];
        if (i < w.typedIndex) {
          if (span.className !== 'fw-typed') span.className = 'fw-typed';
        } else {
          if (span.className !== 'fw-untyped') span.className = 'fw-untyped';
        }
      }
    }
  },

  /** PR-K: chalkDust 위치 계산용 */
  getFallingWordRect(id) {
    const el = this._fallingWordEls?.get(id);
    return el ? el.getBoundingClientRect() : null;
  },

  /**
   * PR-T: ZType 스타일 시작 카운트다운 "3 → 2 → 1 → GO!"
   * game._countdownActive를 set하여 spawn/낙하 동결.
   * @returns Promise<void> — 카운트다운 종료 시 resolve
   */
  showCountdown(game) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('countdown-overlay');
      const value = document.getElementById('countdown-value');
      if (!overlay || !value) { resolve(); return; }

      if (game) game._countdownActive = true;
      overlay.classList.remove('hidden');

      const steps = ['3', '2', '1', 'GO!'];
      let idx = 0;
      const tick = () => {
        if (idx >= steps.length) {
          overlay.classList.add('hidden');
          value.classList.remove('countdown-go');
          if (game) {
            game._countdownActive = false;
            game._lastUpdateAt = Date.now();
            game._lastSpawnAt = Date.now() - (CONFIG.CORE.SPAWN_INTERVAL_BASE || 3500) +
              (CONFIG.CORE.SPAWN_INITIAL_DELAY || 1500);
            game.startTime = Date.now(); // 타이머도 카운트다운 후부터
          }
          resolve();
          return;
        }
        value.textContent = steps[idx];
        value.classList.remove('countdown-pop', 'countdown-go');
        // reflow trigger
        void value.offsetWidth;
        value.classList.add(idx === steps.length - 1 ? 'countdown-go' : 'countdown-pop');
        idx++;
        setTimeout(tick, idx === steps.length ? 500 : 800);
      };
      tick();
    });
  },

  /**
   * PR-L: 노트북 panel 안에 lock된 단어 진행 시각화.
   * - lock 없음: "키보드로 단어를 입력하세요" 안내
   * - lock 있음: typed (녹색) + cursor + untyped (chalk) 큰 글씨
   * 사용자가 어디에 입력하는지 인지하지 못하던 박태준 dogfood 피드백 대응.
   */
  updateTypingStatus(game) {
    const empty = document.getElementById('typing-status-empty');
    const wordEl = document.getElementById('typing-status-word');
    const typedEl = document.getElementById('ts-typed');
    const untypedEl = document.getElementById('ts-untyped');
    if (!empty || !wordEl || !typedEl || !untypedEl) return;

    const locked = game && game.lockedWordId != null
      ? game.fallingWords.find(w => w.id === game.lockedWordId)
      : null;

    if (locked) {
      empty.hidden = true;
      wordEl.hidden = false;
      const typed = locked.text.slice(0, locked.typedIndex);
      const untyped = locked.text.slice(locked.typedIndex);
      if (typedEl.textContent !== typed) typedEl.textContent = typed;
      if (untypedEl.textContent !== untyped) untypedEl.textContent = untyped;
    } else {
      empty.hidden = false;
      wordEl.hidden = true;
    }
  },

  renderTargetWord(activeWords, userInput) {
    if (!this.wordDisplay) return;

    const wordsList = Array.isArray(activeWords) ? activeWords : [activeWords];

    if (!userInput || userInput === '') {
      // PR-G: 입력 전에도 첫 활성 단어를 placeholder로 표시 — 사용자가
      // 무엇을 입력해야 할지 시각적으로 알 수 있도록.
      this.wordDisplay.innerHTML = '';
      this.lastInputLength = 0;
      this.currentTargetWord = null;

      const placeholder = wordsList.find((w) => w && w.length > 0);
      if (placeholder) {
        for (let i = 0; i < placeholder.length; i += 1) {
          const span = document.createElement('span');
          span.className = 'text-placeholder';
          span.textContent = placeholder[i];
          this.wordDisplay.appendChild(span);
        }
      }
      this.addCursor();
      return;
    }

    let targetWord = wordsList.find((word) => word && word.startsWith(userInput));
    let detectError = false;

    if (!targetWord) {
      detectError = true;
      targetWord = this.currentTargetWord || wordsList[0];
    } else {
      this.currentTargetWord = targetWord;
    }

    if (!targetWord) return;

    if (this.wordDisplay.children.length !== targetWord.length + 1) {
      this.wordDisplay.innerHTML = '';

      for (let i = 0; i < targetWord.length; i += 1) {
        const span = document.createElement('span');
        this.wordDisplay.appendChild(span);
      }

      this.addCursor();
    }

    const spans = this.wordDisplay.querySelectorAll('span:not(.cursor)');
    const cursor = this.wordDisplay.querySelector('.cursor');

    spans.forEach((span, index) => {
      if (detectError && index < userInput.length) {
        span.className = 'text-error';
        span.textContent = userInput[index] || targetWord[index];
      } else if (index < userInput.length) {
        span.className = userInput[index] === targetWord[index] ? 'text-typed' : 'text-error';
        span.textContent = targetWord[index];
      } else {
        span.className = 'text-untyped';
        span.textContent = targetWord[index];
      }
    });

    if (cursor && spans.length > 0) {
      if (userInput.length < spans.length) {
        this.wordDisplay.insertBefore(cursor, spans[userInput.length]);
      } else {
        this.wordDisplay.appendChild(cursor);
      }
    }

    if (userInput.length > this.lastInputLength && window.GameAPI) {
      const addedChar = userInput[userInput.length - 1];
      
      // 방금 입력한 마지막 문자가 타겟 단어의 동일 인덱스 문자와 일치하는지 확인
      if (!detectError && targetWord[userInput.length - 1] === addedChar) {
          if (typeof GameAPI.onCorrectChar === 'function') GameAPI.onCorrectChar(addedChar);
      } else {
          if (typeof GameAPI.onWrongChar === 'function') GameAPI.onWrongChar(addedChar);
      }
    }

    if (detectError && typeof Effects !== 'undefined') {
      Effects.triggerErrorShake();
    }

    this.lastInputLength = userInput.length;
  },  
  
  addCursor() {
    if (!this.wordDisplay) return;

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    this.wordDisplay.appendChild(cursor);
  },

  updateHUD(state) {
    if (this.score) this.score.textContent = `SCORE: ${state.score}`;
    if (this.level) this.level.textContent = `LV.${state.level}`;
    if (this.missed) this.missed.textContent = `MISSED: ${state.missed}`;

    if (this.wpmDisplay) {
        this.wpmDisplay.textContent = `WPM: ${state.wpm}`;
    }

    // PR-I: 모드 배지 — 현재 모드를 HUD에 시각 표시
    const modeBadge = document.getElementById('mode-badge');
    if (modeBadge) {
      const modeLabels = { classic: 'CLASSIC', timeattack: 'TIME ATTACK', zen: 'ZEN', daily: 'DAILY' };
      modeBadge.textContent = modeLabels[state.mode] || state.mode.toUpperCase();
      modeBadge.dataset.mode = state.mode;
    }

    // PR-I: Zen 모드 HP 숨김 — .hp-panel 전체 (이전엔 .hp-meter만 숨겨졌음)
    const hpPanel = document.getElementById('hp-panel');
    if (state.mode === 'zen') {
      if (hpPanel) hpPanel.style.display = 'none';
    } else {
      if (hpPanel) hpPanel.style.display = '';
      this.updateHPBar(state.currentHP, state.maxHP || 100);
    }

    // PR-I: 칠판 타이머 실시간 갱신 + 모드별 표시
    this.updateBoardTimer(state);
  },

  /**
   * PR-I: 모드별 board-timer 갱신.
   * - Time Attack / Zen: timeLimit에서 경과 시간 차감 (남은 시간 카운트다운)
   * - Classic: 경과 시간 (mm:ss) — 끝없이 증가
   * - Daily: "DAILY" + 경과 시간 (오늘의 도전 표시)
   */
  updateBoardTimer(state) {
    const valueEl = document.getElementById('board-timer-value');
    const labelEl = document.getElementById('board-timer-label');
    if (!valueEl || !labelEl) return;

    const fmt = (sec) => {
      const s = Math.max(0, Math.floor(sec));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    };

    const elapsedSec = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;

    if (state.mode === 'timeattack' || state.mode === 'zen') {
      // 카운트다운: 남은 시간
      const remaining = (state.timeLimit || 0) - elapsedSec;
      labelEl.textContent = state.mode === 'zen' ? 'ZEN' : 'TIME LEFT';
      valueEl.textContent = fmt(remaining);
      valueEl.classList.toggle('is-urgent', remaining <= 10 && remaining > 0);
    } else if (state.mode === 'daily') {
      labelEl.textContent = 'DAILY';
      valueEl.textContent = fmt(elapsedSec);
      valueEl.classList.remove('is-urgent');
    } else {
      // classic
      labelEl.textContent = 'TIME';
      valueEl.textContent = fmt(elapsedSec);
      valueEl.classList.remove('is-urgent');
    }
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

  showToast(title, message, iconText, duration) {
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
    }, duration || 3000);
  },

  /**
   * PR-G: 도전과제 잠금해제 전용 토스트 — 일반 토스트보다 두드러진 외형.
   * - "도전과제 달성" eyebrow
   * - 황금 액센트 + box-shadow glow
   * - bell 사운드 (사용자 설정 levelupSound로 게이팅, Sound.canPlay 자동 판정)
   * - 5초간 표시 (일반 3초 → 5초)
   */
  showAchievementToast(title, message, iconText) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast--achievement';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
      <div class="toast-accent toast-accent--gold"></div>
      <div class="toast-icon toast-icon--badge">${iconText}</div>
      <div class="toast-content">
        <div class="toast-eyebrow">도전과제 달성</div>
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${message}</div>
      </div>
    `;

    this.toastContainer.appendChild(toast);

    if (typeof Sound !== 'undefined' && typeof Sound.play === 'function') {
      Sound.play('bell', 0.55);
    }

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 5000);
  },

  showGameOver(state) {
    if (!this.gameOverScreen) return;

    let accuracy = 0;

    if (state.totalWordAttempts > 0) {
      accuracy = Math.floor((state.successWords / state.totalWordAttempts) * 100);
    }

    if (accuracy === 100 && state.successWords > 0) {
      Achievements.check(ACHIEVEMENT_IDS.PERFECTIONIST, 1);
    }

    let highScore = parseInt(localStorage.getItem('typing_high_score'), 10) || 0;
    let isNewRecord = false;

    if (state.score > highScore && state.score > 0) {
      localStorage.setItem('typing_high_score', state.score);
      isNewRecord = true;
      Achievements.check(ACHIEVEMENT_IDS.TOP_CLASS, 1);
    }

    let gradeText = 'F';

    if (typeof Grade !== 'undefined') {
      gradeText = Grade.calc(state.score, accuracy, state.wpm);
    }

    if (gradeText === 'A+') {
      Achievements.check(ACHIEVEMENT_IDS.HONOR_STUDENT, 1);
    }

    let stampClass = 'stamp-f';

    switch (gradeText) {
      case 'A+':
        stampClass = 'stamp-a-plus';
        break;
      case 'A':
        stampClass = 'stamp-a';
        break;
      case 'A-':
        stampClass = 'stamp-a-minus';
        break;
      case 'B':
        stampClass = 'stamp-b';
        break;
      case 'C':
        stampClass = 'stamp-c';
        break;
      case 'F':
      default:
        stampClass = 'stamp-f';
        break;
    }

    const resultScore = document.getElementById('result-score');
    const resultCombo = document.getElementById('result-combo');
    const resultLevel = document.getElementById('result-level');
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultWords = document.getElementById('result-words');
    const resultStamp = document.getElementById('result-stamp');
    const resultGrade = document.getElementById('result-grade');
    const resultNewRecord = document.getElementById('result-new-record');

    if (resultScore) resultScore.textContent = state.score.toLocaleString();
    if (resultCombo) resultCombo.textContent = `x${state.maxCombo}`;
    if (resultLevel) resultLevel.textContent = `LV.${state.level}`;
    if (resultWpm) resultWpm.textContent = state.wpm;
    if (resultAccuracy) resultAccuracy.textContent = `${accuracy}%`;
    if (resultWords) resultWords.textContent = state.successWords;

    if (resultStamp) {
      resultStamp.className = `stamp ${stampClass} show`;
    }

    if (resultGrade) {
      resultGrade.textContent = gradeText;
    }

    if (resultNewRecord) {
      resultNewRecord.style.display = isNewRecord ? 'block' : 'none';
    }

    this.showScene('gameover');
    this.gameOverScreen.classList.add('active');
  },

  hideGameOver() {
    if (!this.gameOverScreen) return;

    this.gameOverScreen.classList.remove('active');
    this.showScene('play');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  UI.initControls();
  UI.initTutorial();
  UI.initSettings();
});
