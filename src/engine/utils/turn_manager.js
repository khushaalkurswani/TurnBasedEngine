import Player from "../game_objects/player.js";

"use strict";

const eStatus = Object.freeze({
    eOff : 0,
    eOn: 1,
    ePaused: 2
});


class TurnManager {
    constructor (numPlayers = 0, timeLimit = -1) {
        this.mTimeLimit = timeLimit;
        this.mNextTurnTime = 0;
        this.mCurrentTurn = -1;
        this.mTimeLeft = 0;
        this.mStatus = eStatus.eOff;
        this.mActions = [ ];

        this.mPlayers = [ ];

        for (let i = 0; i < numPlayers; i++) {
            let temp = new Player(null);
            temp.setTimeLimit(timeLimit);
            this.mPlayers.push(temp);
        }
    }

    start() {
        this.mStatus = eStatus.eOn;
        this.mCurrentTurn = -1;
        this.nextTurn();
    }

    end() { 
        this.mStatus = eStatus.eOff;
        this.mCurrentTurn = -1;
        this.mPlayers.splice(0, this.mPlayers.length);
    }

    pause() {
        // Can't pause if the game is not on
        if (this.mStatus === eStatus.eOn) {
            this.mTimeLeft = this.mNextTurnTime - currentTime;
            let currentTime = performance.now();
            this.mStatus = eStatus.ePaused;
        }
    }

    resume() {
        // Can't resume if the game is not paused
        if (this.mStatus === eStatus.ePaused) {
            this.mStatus = eStatus.eOn;
            let currentTime = performance.now();
            this.mNextTurnTime = currentTime + this.mTimeLeft;
        }
    }

    restart() {
        this.mNextTurnTime = 0;
        this.start();
    }

    update() { 
        // Check if game is still on
        if (this.mStatus === eStatus.eOn) {
            let currentTime = performance.now();

            if (currentTime >= this.mNextTurnTime) {
                // Check if player has a time limit (no equal to -1)
                if (!this.mPlayers[this.mCurrentTurn].getTimeLimit() === -1) {
                    // Next player's turn
                    this.mCurrentTurn--;
                    this.mCurrentTurn %= this.mPlayers.length;
                }

                // Set up next turn
                this.nextTurn();
            }
        }
    }

    getPlayers() {
        return this.mPlayers;
    }

    setPlayers(players) {
        this.mPlayers = players;
    }

    addPlayer(player) { 
        this.mPlayers.push(player);
    }

    removePlayer(player) { 
        for (let i = 0; i < this.mPlayers.length; i++) {
            if (this.mPlayers[i] === player) {
                this.mPlayers.splice(i, 1);
                break;
            }
        }
    }

    getTime() { }

    getTimeLimit() {
        return this.mTimeLimit;
    }

    setTimeLimit(timeLimit) {
        this.mTimeLimit = timeLimit;
    }

    setGlobalTimeLimit(timeLimit) {
        this.mTimeLimit = timeLimit;
        
        for (let i = 0; i < this.mPlayers.length; i++) {
            this.mPlayers[i].setTimeLimit(timeLimit, true);
        }
    }

    isActive() {
        return this.mStatus === eStatus.eOn;
    }

    getCurrentTurn() {
        return this.mPlayers[this.mCurrentTurn];
    }

    getNextTurn() {
        return this.mPlayers[(this.mCurrentTurn + 1) % this.mPlayers.length];
    }

    nextTurn() {
        // Next player's turn
        let currentTime = performance.now();
        this.mCurrentTurn++;
        this.mCurrentTurn %= this.mPlayers.length;

        // Set up next turn
        let timeLimit = this.mPlayers[this.mCurrentTurn].getTimeLimit();

        if (timeLimit === null || timeLimit === -1) {
            // Use TurnManager's time limit
            timeLimit = this.mTimeLimit;
        }

        // Set when turn ends
        this.mNextTurnTime = currentTime + timeLimit;
    }

    queueTurn(player, priority) { }
    
    addAction(functionName, args, player = this.mPlayers[this.mCurrentTurn]) { }

    performActions() { }
}

export { eStatus }
export default TurnManager