let game;

async function start() {
    await WordData.loadWords();
    game = new Game();

    Input.init(
        (val) => UI.renderTargetWord(game.getActiveWords(), val),
        (word) => {
            game.checkAnswer(word);
            UI.renderTargetWord(game.getActiveWords(), "");
        }
    );

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
