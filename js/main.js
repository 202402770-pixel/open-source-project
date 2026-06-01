let game;
let selectedMode = 'classic'; // 기본 모드

document.addEventListener('DOMContentLoaded', () => {
    // 1. 게임 모드 선택 버튼 연동
    const modeGroup = document.querySelector('[aria-label="게임 모드 선택"]');
    if (modeGroup) {
        const modeButtons = modeGroup.querySelectorAll('.td-toggle');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 클릭된 버튼의 텍스트를 확인하여 모드 설정
                const modeText = e.target.textContent.trim().toUpperCase();
                if (modeText === 'CLASSIC') selectedMode = 'classic';
                else if (modeText === 'TIME ATTACK') selectedMode = 'timeattack';
                else if (modeText === 'ZEN') selectedMode = 'zen';
                else if (modeText === 'DAILY') selectedMode = 'daily';
            });
        });
    }

    // 2. '받아적을게요' (플레이) 버튼 연동
    const playBtn = document.querySelector('[data-go="play"]');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            start(selectedMode);
        });
    }

    // 3. 재시작 버튼 연동 (기존 로직)
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => location.reload());
    }
});

async function start(mode = 'classic') {
    Sound.init();
    await WordData.loadWords();
    game = new Game(mode);

    Input.init(
        (val) => {
            if (game.isGameOver) return;
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
            if(game.isGameOver) return;
            game.checkAnswer(word);
            UI.renderTargetWord(game.getActiveWords(), "");
        }
    );
    UI.initRanking();
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
    game.calculateWPM();
    if (typeof game.checkTime === 'function') {
        game.checkTime();
    }
    UI.updateHUD(game);
    
    requestAnimationFrame(gameLoop);
}
