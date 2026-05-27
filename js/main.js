let game;

async function start() {
    Sound.init();
    await WordData.loadWords();
    game = new Game();

    Input.init(
        (val) => {
            if(game.isGameOver) return;
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
            UI.renderTargetWord(game.getActiveWords(), val)
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
    UI.updateHUD(game);
    
    requestAnimationFrame(gameLoop);
}

window.onload = start;
document.getElementById('restart-btn').addEventListener('click', () => location.reload());
