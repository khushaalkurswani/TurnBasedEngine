"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../engine/index.js";
import Bullet from "./objects/bullet.js";
import Shooter from "./objects/shooter.js";
import Target from "./objects/target.js";

class MyGame extends engine.Scene {
    constructor() {
        super();

        // The camera to view the scene
        this.mCamera = null;

        this.mMsg = null;
        this.mPoints = null;

        this.mTurnManager = null;

        this.mTargetSet = null;
        this.mBulletSet = null;
        this.moveAllowed = true;
    }
        
    init() {
        // Step A: set up the cameras
        this.mCamera = new engine.Camera(
            vec2.fromValues(30, 27.5), // position of the camera
            100,                       // width of camera
            [0, 0, 640, 480]           // viewport (orgX, orgY, width, height)
        );
        this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
                // sets the background to gray
    
        this.mMsg = new engine.FontRenderable("Status Message");
        this.mMsg.setColor([0, 0, 0, 1]);
        this.mMsg.getXform().setPosition(-19, -8);
        this.mMsg.setTextHeight(3);

        this.mPoints = new engine.FontRenderable("Points");
        this.mPoints.setColor([0, 0, 0, 1]);
        this.mPoints.getXform().setPosition(-18, 63);
        this.mPoints.setTextHeight(2);

        // target setup
        this.mTargetSet = new engine.GameObjectSet();
        for(let i = 0; i < 10; i++) {
            this.newTarget();
        }

        // bullet setup
        this.mBulletSet = new engine.GameObjectSet();

        // player setup
        let startPos = [-5, 27.5];

        let player1 = new Shooter(startPos, [1, 0, 0, 1]);
        player1.setStats([["color", "R"], ["score", 0], ["special", 0]]);

        let player2 = new Shooter(startPos, [1, 1, 0, 1]);
        player2.setStats([["color", "Y"], ["score", 0], ["special", 0]]);

        let player3 = new Shooter(startPos, [0, 1, 0, 1]);
        player3.setStats([["color", "G"], ["score", 0], ["special", 0]]);

        let player4 = new Shooter(startPos, [0, 0, 1, 1]);
        player4.setStats([["color", "B"], ["score", 0], ["special", 0]]);

        // turnmanager setup
        this.mTurnManager = new engine.TurnManager();
        this.mTurnManager.setPlayers([player1, player2, player3, player4]);
        this.mTurnManager.setTimeLimit(7999);
        this.mTurnManager.start();
    }
    
    // This is the draw function, make sure to setup proper drawing environment, and more
    // importantly, make sure to _NOT_ change any state.
    draw() {
        // Step A: clear the canvas
        engine.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    
        this.mCamera.setViewAndCameraMatrix();

        this.mMsg.draw(this.mCamera);
        this.mPoints.draw(this.mCamera);

        if(this.mTurnManager.isActive()){
            this.mTargetSet.draw(this.mCamera);
            this.mBulletSet.draw(this.mCamera);
            this.mTurnManager.getCurrentTurn().draw(this.mCamera);
        }
    }
    
    // The Update function, updates the application state. Make sure to _NOT_ draw
    // anything from this function!
    update () {
        let msg = "Current:  Next:  ";
        let points = "";
        
        if(this.mTurnManager.isActive()){
            let currPlayer = this.mTurnManager.getCurrentTurn();
            let currPlayers = this.mTurnManager.getPlayers();
            let currColor = currPlayer.getStatValue("color");

            for (let i = 0; i < currPlayers.length; i++) {
                points += currPlayers[i].getStatValue("color") + ": "
                        + currPlayers[i].getStatValue("score") + " | ";
            }

            msg = "Current: " + currColor + "    ";
            msg += "Next: " + this.mTurnManager.getNextTurn().getStatValue("color") + "   ";

            // Update objects
            this.mTargetSet.update();
            this.mBulletSet.update();
            currPlayer.update();

            // Player movement
            if (this.mCamera.isMouseInViewport()) {
                let newX = currPlayer.getXform().getXPos();
                let newY = this.mCamera.mouseWCY();
                currPlayer.moveTo(vec2.fromValues(newX, newY));
            }
            
            // Actions while player is "thinking"
            if (this.moveAllowed) {
                this.mTurnManager.update();
                msg += " Time:" + Math.floor(this.mTurnManager.getTime() / 1000) + " ";

                if (engine.input.isKeyClicked(engine.input.keys.Space)){
                    let newBullet = new Bullet(currPlayer.getPos(), currPlayer.getColor(), 1);
                    this.mBulletSet.addToSet(newBullet);
                    this.moveAllowed = false;
                }
            }
            
            // Hit detection between targets and bullets
            for (let i = 0; i < this.mTargetSet.size(); i++) {
                for (let j = 0; j < this.mBulletSet.size(); j++) {
                    let currTarget = this.mTargetSet.getObjectAt(i);
                    let currBullet = this.mBulletSet.getObjectAt(j);
                    if (currTarget.getBBox().intersectsBound(currBullet.getBBox())) {
                        console.log("Hit!");
                        currTarget.onHit();
                        currBullet.onHit();
                    }
                }
            }

            // Target deletion if hit
            for (let i = 0; i < this.mTargetSet.size(); i++) {
                let currTarget = this.mTargetSet.getObjectAt(i);
                if (currTarget.isHit()) {
                    // checks whether target was special and performs actions
                    let value = currTarget.getSpecial();
                    
                    if (value == 7) {
                        // blue: halve next player's turn
                        this.halveTime(this.mTurnManager.getNextTurn());
                    } else if (value == 8) {
                        // green: randomize order of players
                        this.randomizeOrder(currPlayers);
                    } else if (value == 9) {
                        // red: adds another turn
                        this.addTurn(currPlayer);
                    }

                    this.mTargetSet.removeFromSet(currTarget);
                    let newScore = currPlayer.getStatValue("score") + 1;
                    currPlayer.setStat("score", newScore);
                    this.newTarget();
                }
            }

            // Bullet deletion if hit
            for (let i = 0; i < this.mBulletSet.size(); i++) {
                let currBullet = this.mBulletSet.getObjectAt(i);
                if(currBullet.isHit()) {
                    this.mBulletSet.removeFromSet(currBullet);
                    this.mTurnManager.nextTurn();
                    this.moveAllowed = true;
                }
            }

            // Victory detection
            for (let i = 0; i < currPlayers.length; i++) {
                if (currPlayers[i].getStatValue("score") >= 10) {
                    msg = " Victor:" + currPlayers[i].getStatValue("color");
                    this.mTurnManager.end();
                }
            }

            // Debug buttons
            if (engine.input.isKeyClicked(engine.input.keys.N)){
                this.mTurnManager.nextTurn();
            }

            if (engine.input.isKeyClicked(engine.input.keys.B)){
                this.halveTime(this.mTurnManager.getNextTurn());
            }

            if (engine.input.isKeyClicked(engine.input.keys.G)){
                this.randomizeOrder(currPlayers);
            }

            if (engine.input.isKeyClicked(engine.input.keys.R)){
                this.addTurn(currPlayer);
            }
        }

        this.mMsg.setText(msg);
        this.mPoints.setText(points);
    }

    newTarget() {
        let randPos = ([this.rN(30, 80), this.rN(-10, 65)]);
        let newTarget = new Target(randPos);
        this.mTargetSet.addToSet(newTarget);
    }

    rN(max, min) {
        return Math.random() * (max - min + 1) + min;
    }

    halveTime(player) {
        player.setTimeLimit(3999);
    }

    randomizeOrder(currPlayers) {
        let randOrder = currPlayers;
        let i = currPlayers.length;

        while (i != 1) {
            let randI = Math.floor(Math.random() * i);
            i--;
            [randOrder[i], randOrder[randI]] = [currPlayers[randI], currPlayers[i]];
        }

        this.mTurnManager.setPlayers(randOrder);
        this.mTurnManager.nextTurn();
    }

    addTurn(player) {
        this.mTurnManager.queueTurn(player, 1);
    }
}

window.onload = function () {
    engine.init("GLCanvas");

    let myGame = new MyGame();
    myGame.start();
}