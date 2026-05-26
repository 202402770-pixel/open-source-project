let game;

async function start() {
    Sound.init();
    await WordData.loadWords();
    game = new Game();

    Input.init(
        (val) => {
            if (game.isGameOver || game.isPaused) return;

            if (val.length > UI.lastInputLength) {
                Sound.play('chalk', 0.8);
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
        UI.updateHUD(game);
    }

    requestAnimationFrame(gameLoop);
}

window.onload = start;

const restartBtn = document.getElementById('restart-btn');

if (restartBtn) {
    restartBtn.addEventListener('click', () => location.reload());
}