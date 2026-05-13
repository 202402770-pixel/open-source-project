import { loadWords } from './wordData.js';
import { Game } from './game.js';
import { UI } from './ui.js';
import { Input } from './input.js';

let game;

async function start() {
    await loadWords();
    game = new Game();

    Input.init(
        (val) => UI.renderTargetWord(game.getCurrentWord(), val),
        (word) => {
            game.checkAnswer(word);
            UI.renderTargetWord(game.getCurrentWord(), "");
        }
    );

    UI.updateHUD(game);
    UI.renderTargetWord(game.getCurrentWord(), "");
    
    gameLoop();
}

function gameLoop() {
    if (game.isGameOver) return;
    game.calculateWPM();
    UI.updateHUD(game);
    
    requestAnimationFrame(gameLoop);
}

window.onload = start;