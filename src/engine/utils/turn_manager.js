import Player from "../game_objects/player.js";

"use strict";

const eStatus = Object.freeze({
    eOff : 0,
    eOn: 1,
    ePaused: 2
});


class TurnManager {
    constructor (numPlayers = 0, timeLimit = -1, defaultPriority = 0) {
        this.mTimeLimit = timeLimit;
        this.mNextTurnTime = 0;
        this.mCurrentTurn = null;
        this.mTimeLeft = 0;
        this.mStatus = eStatus.eOff;
        this.mActions = [ ];

        this.mPlayers = [ ];

        this.mDefaultPriority = defaultPriority;
        this.mTurnQueue = [ ];

        for (let i = 0; i < numPlayers; i++) {
            let temp = new Player(null);
            temp.setTimeLimit(timeLimit);
            this.mPlayers.push(temp);
            this.mTurnQueue.push([temp, this.mDefaultPriority]);
        }
    }

    start() {
        this.mStatus = eStatus.eOn;
        this.resetTurnOrder();
        this.nextTurn();
    }

    end() { 
        this.mStatus = eStatus.eOff;
        this.mCurrentTurn = null;
        this.mPlayers.splice(0, this.mPlayers.length);
        this.mPlayers.splice(0, this.mTurnQueue.length);
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
                let timeLimit = this.mCurrentTurn.getTimeLimit();

                // Check if player has no time limit (equal to -1)
                if (timeLimit === -1) {
                    // Extend time limit for this player (indefinitely)
                    // players turn is not ended based on time
                    timeLimit = this.mTimeLimit;
                    this.mNextTurnTime = currentTime + timeLimit;
                }
                else {
                    // Set up next turn
                    this.nextTurn();
                }
            }
        }
    }

    getPlayers() {
        return this.mPlayers;
    }

    setPlayers(players) {
        this.mPlayers = players;
        this.resetTurnOrder();
    }

    addPlayer(player) { 
        this.mPlayers.push(player);
        this.mTurnQueue.push(player, this.mDefaultPriority);
    }

    removePlayer(player) {
        // Remove all the turns for the player
        for (let i = 0; i < this.mTurnQueue.length; i++) {
            if (this.mTurnQueue[i][0] === player) {
                this.mTurnQueue.splice(i, 1);
                i--;
            }
        }

        // Remove the player from player list
        for (let i = 0; i < this.mPlayers.length; i++) {
            if (this.mPlayers[i] === player) {
                this.mPlayers.splice(i, 1);
                break;
            }
        }
    }

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
        return this.mCurrentTurn;
    }

    getNextTurn() {
        let nextPlayer = this.calculateNextPlayer();
        if (nextPlayer === null) {
            return null;
        }

        return nextPlayer[0];
    }

    calculateNextPlayer() {
        if (this.mTurnQueue.length === 0) {
            return null;
        }

        let nextPlayer = this.mTurnQueue[0];
        for (let i = 0; i < this.mTurnQueue.length; i++) {
            if (nextPlayer[1] < this.mTurnQueue[i][1]) {
                nextPlayer = this.mTurnQueue[i];
            }
        }

        return nextPlayer;
    }

    nextTurn() {
        if (this.mStatus === eStatus.eOff) {
            return;
        } 

        // Next player's turn
        let currentTime = performance.now();

        if (this.mCurrentTurn != null) {
            // Add current player's next turn to the queue
            this.mTurnQueue.push([this.mCurrentTurn, this.mDefaultPriority]);
        }

        // Get next player
        let nextPlayer = this.calculateNextPlayer();

        // No next player, end of game
        if (nextPlayer === null) {
            this.end();
            return;
        }

        this.mCurrentTurn = nextPlayer[0];

        // Find next player's turn and pop it from the queue
        for(let i = 0; i < this.mTurnQueue.length; i++) {
            if (this.mTurnQueue[i][0] === nextPlayer[0] && 
              this.mTurnQueue[i][1] === nextPlayer[1]) {
                // Remove player's turn from queue
                this.mTurnQueue.splice(i, 1);
                break;
            }
        }

        // Set up next turn
        let timeLimit = this.mCurrentTurn.getTimeLimit();

        // Resets the time limit (if the time limit was temporarily changed)
        this.mCurrentTurn.resetTimeLimit();

        if (timeLimit === null || timeLimit === -1) {
            // Use TurnManager's time limit
            timeLimit = this.mTimeLimit;
        }

        // Set when turn ends
        this.mNextTurnTime = currentTime + timeLimit;
    }

    resetTurnOrder() {
        this.mTurnQueue.splice(0, this.mTurnQueue.length);
        for (let i = 0; i < this.mPlayers.length; i++) {
            this.mTurnQueue.push([this.mPlayers[i], this.mDefaultPriority]);
        }
    }

    queueTurn(player, priority) { 
        this.mTurnQueue.push([player, priority]);
    }
    
    addAction(functionName, args, player = this.mCurrentTurn) { }

    performActions() { }
}

export { eStatus }
export default TurnManager