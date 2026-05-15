import { getWordsByLevel } from './wordData.js';
import { UI } from './ui.js';
import * as Effects from './effects.js';
import { AchievementManager } from './achievements.js';

export class Game {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.level = 1;
        this.missed = 0;
        this.maxHP = 100;
        this.currentHP = 100;
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.isGameOver = false;
        this.startTime = Date.now();
        this.totalTypedChars = 0;
        this.wpm = 0;
        this.activeWords = [...getWordsByLevel(this.level)];
        AchievementManager.init();
        AchievementManager.checkAttendance();

        let playCount = parseInt(localStorage.getItem('typing_play_count')) || 0;
        playCount++;
        localStorage.setItem('typing_play_count', playCount);
        AchievementManager.check(10, playCount);
    }

    getActiveWords() {
        return this.activeWords;
    }

    checkAnswer(inputWord) {
        this.levelAttempts++;
        const targetIndex = this.activeWords.indexOf(inputWord);
        if (targetIndex !== -1) {
            this.handleSuccess(targetIndex, inputWord);
        } else if (inputWord !== "") {
            this.levelMissed++;
            this.handleFailure();
        }
        UI.updateHUD(this);
    }

    handleSuccess(targetIndex, word) {
        this.totalTypedChars += word.length;
        this.score += 10;
        this.combo++;
        this.activeWords.splice(targetIndex, 1);
        if (this.score === 10) AchievementManager.check(1, 1);
        AchievementManager.check(7, this.combo);
        AchievementManager.check(11, this.score);
        if (this.combo >= 10) {
            Effects.toggleGlow(true, 'combo10');
        }
        else if(this.combo >= 5){
            Effects.toggleGlow(true, 'combo5');
        }
        if (this.activeWords.length === 0) {
            this.levelUp();
        }
    }

    handleFailure() {
        this.missed++;
        this.combo = 0;
        Effects.toggleGlow(false);
        this.takeDamage(20, false);
    }

    levelUp() {
        if (this.levelAttempts > 0) {
            const accuracy = ((this.levelAttempts - this.levelMissed) / this.levelAttempts) * 100;
            if (accuracy >= 95) {
                AchievementManager.check(4, 1);
            }
        }
        this.levelAttempts = 0;
        this.levelMissed = 0;
        this.level++;
        const nextWords = getWordsByLevel(this.level);
        if (nextWords && nextWords.length > 0){
            this.activeWords = [...nextWords];
        } else {
            this.gameClear();
        }
        AchievementManager.check(2, this.level);
        AchievementManager.check(3, this.level);
    }

    takeDamage(amount,isOverflow = false) {
        this.currentHP -= amount;
        if (this.currentHP < 0) this.currentHP = 0;
        UI.updateHPBar(this.currentHP, this.maxHP);
        if (this.currentHP === 0) {
          this.gameOver(isOverflow ? 'overflow' : 'hp_depleted');
        }
    }

    gameClear() {
        if (this.currentHP === this.maxHP) AchievementManager.check(5, 1);
        if (this.currentHP <= this.maxHP * 0.2) AchievementManager.check(6, 1);
    }

    gameOver(reason) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        if (reason === 'overflow') {
            AchievementManager.check(9, 1);
        }
        alert("게임 오버!");
    }

    calculateWPM(){
        if(this.isGameOver) return;
        const minutes = (Date.now() - this.startTime) / 60000;
        if(minutes>0){
            this.wpm = Math.floor((this.totalTypedChars/5)/minutes);
        }
    }
}