"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../../engine/index.js";

class Target extends engine.GameObject {
    constructor(startPos) {
        super(null);

        this.mSpecial = Math.floor(Math.random() * 9);
        this.mRenderComponent = new engine.Renderable();
        this.mRenderComponent.getXform().setPosition(startPos[0], startPos[1]);
        this.mRenderComponent.getXform().setSize(2, 2);

        switch(this.mSpecial) {
            case 7: // blue: halves next player's time (does not reset until that player takes an action)
                this.mRenderComponent.setColor([0, 0, 1, 1]);
                break;
            case 8: // green: randomizes order of players
                this.mRenderComponent.setColor([0, 1, 0, 1]);
                break;
            case 9: // red: gives the current player another turn
                this.mRenderComponent.setColor([1, 0, 0, 1]);
                break;
            default: 
                this.mRenderComponent.setColor([0, 0, 0, 1]);
        }

        this.speed = ((Math.random() + 0.2));
        this.direction = Math.random() < 0.5;
        this.startPos = this.getXform().getPosition();
        this.hit = false;

        this.bBox = this.getBBox();
    }

    update() {
        let newX = this.getXform().getXPos()
        let newY = this.getXform().getYPos()
        if(this.direction){
            newY = newY + this.speed;
        } else {
            newY = newY - this.speed;
        }
        this.getXform().setPosition(newX, newY);

        if(this.getXform().getYPos() < -10 || this.getXform().getYPos() > 65){
            this.direction = !this.direction;
        }
    }

    onHit() {
        this.mRenderComponent.getXform().incXPosBy(5);
        this.hit = true;
    }

    isHit() {
        return this.hit;
    }

    getSpecial() {
        return this.mSpecial;
    }

    getBounds() {
        return this.bBox;
    }
}

export default Target;