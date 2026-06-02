let game;
let selectedMode = 'classic';

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
            await start(selectedMode, difficulty);
            UI.showScene('play');
        });
    }
});

async function start(mode = 'classic', difficulty = 'easy') {
    Sound.init();
    await WordData.loadWords();
    game = new Game(mode, difficulty);
    if (typeof window !== 'undefined') window.game = game;

    // PR-K: 글자 단위 입력 → game.handleCharInput
    // hidden-input의 'input' 이벤트가 새 글자가 추가될 때마다 발화.
    // 마지막 글자 1개만 추출해서 game에 전달.
    Input.init(
        (val) => {
            if (!game || game.isGameOver || game.isPaused) return;
            if (val.length > Input.lastValLength) {
                const inputChar = val.slice(-1);
                Sound.play('chalk', 0.4);
                game.handleCharInput(inputChar);
            }
            Input.lastValLength = val.length;
            // PR-K: 입력 필드는 시각 X. 길어지면 reset.
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
    requestAnimationFrame(gameLoop);
}
