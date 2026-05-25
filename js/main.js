let game;

async function start() {
    Sound.init();
    await WordData.loadWords();
    game = new Game();

    Input.init(
        (val) => {
            if(game.isGameOver) return;
            if (val.length > UI.lastInputLength) {
                Sound.play('chalk', 0.8);
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
