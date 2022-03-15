"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../../engine/index.js";

class Shooter extends engine.Player {
    constructor(pos, color) {
        super(null);
        this.kDelta = 0.3;

        this.mRenderComponent = new engine.Renderable();
        this.mRenderComponent.setColor(color);
        this.mRenderComponent.getXform().setPosition(pos[0], pos[1]);
        this.mRenderComponent.getXform().setSize(3, 3);

        this.mSize = this.mRenderComponent.getXform().getSize();
        let center = this.mRenderComponent.getXform().getPosition();
        let rate = 0.05;
        let cycles = 120;
        this.mPosition = new engine.LerpVec2(center, cycles, rate);
        this.mSizeReset = new engine.LerpVec2(this.mSize, 30, 0.2);
    }

    update() {
        this.mPosition.update();
    }

    moveTo(newPos) {
        this.mPosition.setFinal(newPos);
    }

    getColor() {
        return this.mRenderComponent.getColor();
    }

    getPos() {
        return this.mRenderComponent.getXform().getPosition();
    }
}

export default Shooter;