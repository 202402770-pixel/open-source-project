const UI = {
  lastInputLength: 0,
  currentTargetWord: null,
  controlsBound: false,

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
    this.currentGame = gameInstance;

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
});