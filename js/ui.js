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
  },

  closeTutorial() {
    if (!this.tutorialModal) return;

    this.tutorialModal.classList.add('hidden');
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
      this.tutorialNextBtn.textContent = isLastSlide ? '반격할게요' : '다음';
    }
  },

  nextTutorialSlide() {
    if (!this.tutorialSlides || this.tutorialSlides.length === 0) return;

    const isLastSlide = this.tutorialIndex === this.tutorialSlides.length - 1;

    if (isLastSlide) {
      localStorage.setItem(this.tutorialDoneKey, 'true');
      this.closeTutorial();
      this.showScene('play');
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
        this.showToast('설정 저장', '강의실 설정이 저장되었습니다.', 'OK');
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

  openSettings() {
    if (!this.settingsModal) return;

    this.updateSettingsForm();
    this.settingsModal.classList.remove('hidden');
    this.settingsModal.setAttribute('aria-hidden', 'false');
  },

  closeSettings() {
    if (!this.settingsModal) return;

    this.settingsModal.classList.add('hidden');
    this.settingsModal.setAttribute('aria-hidden', 'true');

    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput) hiddenInput.focus();
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
      this.rankingModal.classList.remove('hidden');
      this.renderRanking('all');

      if (this.rankingTabs.length > 0) {
        this.rankingTabs.forEach((tab) => tab.classList.remove('active'));

        const allTab = document.querySelector('.tab-btn[data-type="all"]');
        if (allTab) allTab.classList.add('active');
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

  renderTargetWord(activeWords, userInput) {
    if (!this.wordDisplay) return;

    if (!userInput || userInput === '') {
      this.wordDisplay.innerHTML = '';
      this.addCursor();
      this.lastInputLength = 0;
      this.currentTargetWord = null;
      return;
    }

    const wordsList = Array.isArray(activeWords) ? activeWords : [activeWords];

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

    // Zen 모드일 경우 HP 등 불필요한 HUD 숨김 처리
    if (state.mode === 'zen') {
        if (this.hpFill && this.hpFill.parentElement) {
            this.hpFill.parentElement.style.display = 'none';
        }
    } else {
        if (this.hpFill && this.hpFill.parentElement) {
            this.hpFill.parentElement.style.display = 'block'; // 일반 모드 노출
        }
        this.updateHPBar(state.currentHP, state.maxHP || 100);
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