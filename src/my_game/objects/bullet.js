"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../../engine/index.js";

class Bullet extends engine.GameObject {
    constructor(startPos, color, speed) {
        super(null);

        this.mRenderComponent = new engine.Renderable();
        this.mRenderComponent.setColor(color);
        this.mRenderComponent.getXform().setPosition(startPos[0], startPos[1]);
        this.mRenderComponent.getXform().setSize(1, 1);

        this.speed = speed;
        this.startPos = this.getXform().getPosition();
        this.hit = false;

        this.bBox = this.getBBox();
    }

    update() {
        let newX = this.getXform().getXPos() + this.speed;
        let newY = this.getXform().getYPos()
        this.getXform().setPosition(newX, newY);

        if(this.getXform().getXPos() > 80) {
            this.onHit();
        }
    }

    onHit() {
        this.hit = true;
    }

    isHit() {
        return this.hit;
    }

    getBounds() {
        return this.bBox;
    }
}

export default Bullet;