let game;
let selectedMode = 'classic';        // 기본 모드 (시작 화면 active)

document.addEventListener('DOMContentLoaded', () => {
    // 1. 게임 모드 선택 버튼 연동
    const modeGroup = document.querySelector('[aria-label="게임 모드 선택"]');
    if (modeGroup) {
        const modeButtons = modeGroup.querySelectorAll('.td-toggle');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modeText = e.target.textContent.trim().toUpperCase();
                if (modeText === 'CLASSIC') selectedMode = 'classic';
                else if (modeText === 'TIME ATTACK') selectedMode = 'timeattack';
                else if (modeText === 'ZEN') selectedMode = 'zen';
                else if (modeText === 'DAILY') selectedMode = 'daily';
            });
        });
    }

    // 2. 난이도 선택 버튼 연동 (이슈 #35) — Settings와 양방향 동기화
    const difficultyGroup = document.querySelector('[aria-label="난이도 선택"]');
    if (difficultyGroup) {
        const difficultyButtons = difficultyGroup.querySelectorAll('.td-toggle');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txt = e.target.textContent.trim().toUpperCase();
                const value = txt === 'NORMAL' ? 'normal' : txt === 'HARD' ? 'hard' : 'easy';
                if (typeof UI !== 'undefined' && typeof UI.setDifficultyFromStart === 'function') {
                    UI.setDifficultyFromStart(value);
                }
            });
        });
    }

    // 3. '받아적을게요' (플레이) 버튼 — 선택된 모드/난이도로 게임 시작
    const playBtn = document.querySelector('[data-go="play"]');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const difficulty = typeof UI !== 'undefined' && typeof UI.getActiveDifficulty === 'function'
                ? UI.getActiveDifficulty()
                : 'easy';
            start(selectedMode, difficulty);
        });
    }

    // 4. 재시작 버튼 — PR-B: 페이지 리로드 제거. 같은 모드/난이도로 즉시 새 게임.
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {
            if (game) game.isGameOver = true; // 기존 gameLoop 중단
            game = null;
            const difficulty = typeof UI !== 'undefined' && typeof UI.getActiveDifficulty === 'function'
                ? UI.getActiveDifficulty()
                : 'easy';
            await start(selectedMode, difficulty);
            UI.showScene('play');
        });
    }
});

async function start(mode = 'classic', difficulty = 'easy') {
    Sound.init();
    await WordData.loadWords();
    game = new Game(mode, difficulty);

    Input.init(
        (val) => {
            if (game.isGameOver || game.isPaused) return;
            const inputChar = val.slice(-1);
            let isCorrect = false;
            if (val.length > UI.lastInputLength) {
                Sound.play('chalk', 0.8);
                const activeWords = game.getActiveWords();
                const targetWord = activeWords.find(w => w.startsWith(val.slice(0, -1))) || activeWords[0];
                if (targetWord && targetWord.startsWith(val)) {
                    isCorrect = true;
                }
                if (window.GameAPI) {
                    if (isCorrect && GameAPI.onCorrectChar) GameAPI.onCorrectChar(inputChar);
                    if (!isCorrect && GameAPI.onWrongChar) GameAPI.onWrongChar(inputChar);
                }
            }
            UI.renderTargetWord(game.getActiveWords(), val);
        },
        (word) => {
            if (game.isGameOver || game.isPaused) return;

            game.checkAnswer(word);
            UI.renderTargetWord(game.getActiveWords(), "");
        }
    );

    UI.initRanking();
    UI.initPauseControls(game);

    const showRankingBtn = document.getElementById('show-ranking-btn');

    if (showRankingBtn) {
        showRankingBtn.addEventListener('click', () => {
            UI.toggleRankingModal(true);
        });
    }

    UI.updateHUD(game);
    UI.renderTargetWord(game.getActiveWords(), "");

    gameLoop();
}

function gameLoop() {
    if (game.isGameOver) return;
    if (!game.isPaused) {
        game.calculateWPM();
        if (typeof game.checkTime === 'function') {
            game.checkTime();
        }
        UI.updateHUD(game);
    }
    requestAnimationFrame(gameLoop);
}
