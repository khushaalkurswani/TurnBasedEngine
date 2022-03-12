"use strict";

import GameObject from "./game_object.js";

class Player extends GameObject {
    constructor(renderable) {
        super(renderable);
        this.mTimeLimit = null;
        this.prevTimeLimit = null;
        this.mIsPermanent = true;
        this.mStats = new Map();
    }

    setRenderable(renderable) {
        this.mRenderComponent = renderable;
    }

    setStats(statsArray) {
        // for each stat in the array, add the statistic to stats map
        for (let statIndex = 0; statIndex < statsArray.length; statIndex++) {
            let key = statsArray[statIndex][0];
            let value = statsArray[statIndex][1];

            this.mStats.set(key, value);            
        }
    }

    setStat(statName, statValue) {
        return this.mStats.set(statName, statValue);
    }

    removeStat(statName) {
        return this.mStats.delete(statName);
    }

    removeAllStats() {
        this.mStats.clear();
    }

    getStatValue(statName) {
        return this.mStats.get(statName);
    }

    setTimeLimit(timeLimit, isPermanent) {
        if (isPermanent) {
            this.mPrevTimeLimit = timeLimit;
        }
        else {
            this.mPrevTimeLimit = this.mTimeLimit;
        }
        
        this.mTimeLimit = timeLimit;
        this.mIsPermanent = isPermanent;
    }

    resetTimeLimit() {
        if (!this.mIsPermanent) {
            this.mTimeLimit = this.mPrevTimeLimit;
            this.mIsPermanent = true;
        }
    }

    getTimeLimit() {
        return this.mTimeLimit;
    }
}

export default Player;