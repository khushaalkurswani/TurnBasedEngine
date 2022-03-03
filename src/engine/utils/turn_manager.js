import Player from "../game_objects/player.js";

"use strict";

const eStatus = Object.freeze({
    eOff : 0,
    eOn: 1,
    ePaused: 2,
    eEnded: 4
});


class TurnManager {
    constructor (numPlayers = 0, timeLimit = -1) {
        this.mTimeLimit = timeLimit; // is this needed?????????
        this.mTimer = 0;
        this.mNextTurnTime = 0;
        this.mCurrentTurn = -1;
        this.mStatus = eStatus.eOff;
        this.mActions = [ ];

        this.mPlayers = [ ];

        for (let i = 0; i < numPlayers; i++) {
            let temp = new Player(null);
            temp.setTimeLimit(timeLimit);
            this.mPlayers.push(temp);
        }
    }

    // Can only have one constructor
    // constructor (players, timeLimit) {
    //     this.mTimeLimit = timeLimit;
    //     this.mTimer = 0;
    //     this.players = players;
    // }

    start() {
        this.mStatus = eStatus.eOn;
        this.mTimer = performance.now();
        this.mCurrentTurn = 0;
        let timeLimit = this.mPlayers[this.mCurrentTurn].getTimeLimit();
        this.mNextTurnTime = this.mTimer + timeLimit;
    }

    end() { }

    pause() { }

    restart() { }

    update() { }

    getPlayers() {
        return this.mPlayers;
    }

    setPlayers(players) {
        if (this.mStatus != eStatus.eOn /*|| this.mStatus != eStatus.ePaused*/) {
            this.mPlayers = players;
            return true;
        }

        // Players cannot be changed in the middle of the game
        return false;
    }

    addPlayer(Player) { }

    removePlayer(Player) { }

    getTime() { }

    getTimeLimit() {
        return this.mTimeLimit;
    }

    setTimeLimit(timeLimit) {
        this.mTimeLimit = timeLimit;
    }

    getCurrentTurn() {
        return this.mPlayers[this.mCurrentTurn];
    }

    nextTurn() { }

    queueTurn(player, priority) { }
    
    addAction(functionName, args, player = this.mPlayers[this.mCurrentTurn]) { }

    performActions() { }
}

export { eStatus }
export default TurnManager