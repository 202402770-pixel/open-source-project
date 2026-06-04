let game;
let selectedMode = 'classic';
let gameLoopId = null;

document.addEventListener('DOMContentLoaded', () => {
    // 모드 선택
    const modeGroup = document.querySelector('[aria-label="게임 모드 선택"]');
    if (modeGroup) {
        modeGroup.querySelectorAll('.td-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modeText = e.target.textContent.trim().toUpperCase();
                if (modeText === 'CLASSIC') selectedMode = 'classic';
                else if (modeText === 'TIME ATTACK') selectedMode = 'timeattack';
                else if (modeText === 'ZEN') selectedMode = 'zen';
                else if (modeText === 'DAILY') selectedMode = 'daily';
            });
        });
    }

    // 난이도 선택 — Settings와 양방향 동기화
    const difficultyGroup = document.querySelector('[aria-label="난이도 선택"]');
    if (difficultyGroup) {
        difficultyGroup.querySelectorAll('.td-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txt = e.target.textContent.trim().toUpperCase();
                const value = txt === 'NORMAL' ? 'normal' : txt === 'HARD' ? 'hard' : 'easy';
                if (typeof UI !== 'undefined' && typeof UI.setDifficultyFromStart === 'function') {
                    UI.setDifficultyFromStart(value);
                }
            });
        });
    }

    // Play 버튼
    const playBtn = document.querySelector('[data-go="play"]');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const difficulty = typeof UI !== 'undefined' && typeof UI.getActiveDifficulty === 'function'
                ? UI.getActiveDifficulty() : 'easy';
            start(selectedMode, difficulty);
        });
    }

    // PR-E: 페이지 가시성 변화 자동 일시정지
    document.addEventListener('visibilitychange', () => {
        if (!game || game.isGameOver) return;
        if (document.hidden) {
            if (typeof game.softPause === 'function') game.softPause();
        } else {
            if (typeof game.softResume === 'function') game.softResume();
        }
    });

    // 재시작
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {
            if (game) game.isGameOver = true;
            game = null;
            const difficulty = typeof UI !== 'undefined' && typeof UI.getActiveDifficulty === 'function'
                ? UI.getActiveDifficulty() : 'easy';
            if (typeof UI !== 'undefined' && typeof UI.hideGameOver === 'function') { // 결과창 숨기기
                UI.hideGameOver();
            }
            await start(selectedMode, difficulty);
            UI.showScene('play');
        });
    }

    // PR-M: Game Over → 메뉴로 (모드 변경 가능)
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (game) game.isGameOver = true;
            game = null;
            if (typeof window !== 'undefined') window.game = null;
            if (typeof UI !== 'undefined' && typeof UI.hideGameOver === 'function') { // 결과창 숨기기
                UI.hideGameOver();
            }
            if (typeof UI !== 'undefined' && UI.showScene) UI.showScene('start');
        });
    }
});

async function start(mode = 'classic', difficulty = 'easy') {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    Sound.init();
    await WordData.loadWords();
    game = new Game(mode, difficulty);
    if (typeof window !== 'undefined') window.game = game;
    const lectureTitle = document.querySelector('.blackboard h2'); // 칠판 레벨 표시 초기화
    if (lectureTitle) {
        lectureTitle.textContent = 'LEVEL 1';
    }
    Input.lastValLength = 0;
    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput) {
        hiddenInput.value = '';
    }

    // PR-K: 글자 단위 입력 → game.handleCharInput
    // hidden-input의 'input' 이벤트가 새 글자가 추가될 때마다 발화.
    // 마지막 글자 1개만 추출해서 game에 전달.
    Input.init(
        (val) => {
            if (!game || game.isGameOver || game.isPaused) return;
            // PR-N: 늘어난 모든 글자 차례로 처리 (이전엔 slice(-1)로 1글자만 → 빠른
            // 타이핑 / IME / autocomplete 시 손실. 박태준 dogfood로 발견)
            if (val.length > Input.lastValLength) {
                const newChars = val.slice(Input.lastValLength);
                for (const c of newChars) {
                    Sound.play('chalk', 0.4);
                    game.handleCharInput(c);
                }
            }
            Input.lastValLength = val.length;
            if (val.length > 30) {
                const el = document.getElementById('hidden-input');
                if (el) el.value = '';
                Input.lastValLength = 0;
            }
        },
        (_word) => {
            // Enter는 무시 (PR-K는 마지막 글자에 자동 처치)
            const el = document.getElementById('hidden-input');
            if (el) el.value = '';
            Input.lastValLength = 0;
        }
    );

    UI.initRanking();
    UI.initPauseControls(game);

    const showRankingBtn = document.getElementById('show-ranking-btn');
    if (showRankingBtn) {
        showRankingBtn.addEventListener('click', () => UI.toggleRankingModal(true));
    }

    UI.updateHUD(game);
    if (typeof UI.renderFallingWords === 'function') UI.renderFallingWords(game);

    gameLoop();
}

function gameLoop() {
    if (!game || game.isGameOver) return;
    if (!game.isPaused) {
        game.calculateWPM();
        if (typeof game.checkTime === 'function') game.checkTime();
        if (typeof game.update === 'function') game.update();  // PR-K: 낙하 + spawn + 충돌
        if (typeof UI.renderFallingWords === 'function') UI.renderFallingWords(game);
        if (typeof UI.updateWordDanger === 'function') UI.updateWordDanger(game);
        if (typeof UI.updateTypingStatus === 'function') UI.updateTypingStatus(game);
        UI.updateHUD(game);
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}
