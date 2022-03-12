"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../engine/index.js";

class MyGame extends engine.Scene {
    constructor() {
        super();

        // The camera to view the scene
        this.mCamera = null;

        this.mMsg = null;
    
        this.mLineSet = null;
        this.mPieceSet = null;

        this.mSpace = 0;
        this.mBoard = [];
        this.mVictor = null;
        this.mStalemate = null;
        this.mTurnManager = null;
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

        this.mLineSet = new engine.GameObjectSet();
        let lineCoords = [[20, -2.5, 20, 57.5],
                        [40, -2.5, 40, 57.5],
                        [0, 17.5, 60, 17.5],
                        [0, 37.5, 60, 37.5]];
        for (let i = 0; i < lineCoords.length; i++) {
            let currentLine = new engine.LineRenderable();
            currentLine.setFirstVertex(lineCoords[i][0], lineCoords[i][1]);
            currentLine.setSecondVertex(lineCoords[i][2], lineCoords[i][3]);
            this.mLineSet.addToSet(currentLine);
        }
        this.mPieceSet = new engine.GameObjectSet();

        /*
        0 | 1 | 2
        ----------
        3 | 4 | 5
        ----------
        6 | 7 | 8
        */
        this.mBoard = ["empty", "empty", "empty",
                       "empty", "empty", "empty",
                       "empty", "empty", "empty"];
        this.mStalemate = false;

        let player1 = new engine.Player();
        player1.setStat("shape", "circle");

        let player2 = new engine.Player();
        player2.setStat("shape", "cross");

        this.mTurnManager = new engine.TurnManager();
        this.mTurnManager.setPlayers([player1, player2]);
        this.mTurnManager.start();
    }
    
    // This is the draw function, make sure to setup proper drawing environment, and more
    // importantly, make sure to _NOT_ change any state.
    draw() {
        // Step A: clear the canvas
        engine.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    
        this.mCamera.setViewAndCameraMatrix();

        this.mMsg.draw(this.mCamera);
        
        this.mLineSet.draw(this.mCamera);
        this.mPieceSet.draw(this.mCamera);
    }
    
    // The Update function, updates the application state. Make sure to _NOT_ draw
    // anything from this function!
    update () {
        let msg = "Current:  Next:  ";
        let echo = "";
        let x, y;
        
        if(this.mTurnManager.isActive()){
           let currShape = this.mTurnManager.getCurrentTurn().getStatValue("shape");
           msg = "Current: " + currShape + "   ";


            if (engine.input.isButtonClicked(engine.input.eMouseButton.eLeft)) {
                x = this.mCamera.mouseWCX();
                y = this.mCamera.mouseWCY();
    
                this.mSpace = this.checkXY(x, y);
                if (this.mBoard[this.mSpace] === "empty"){
                    this.placePiece(currShape);
                }
            }
    
            if (engine.input.isKeyClicked(engine.input.keys.N)){
                this.mTurnManager.nextTurn();
            }

            msg += echo;
            msg += " Next: " + this.mTurnManager.getNextTurn().getStatValue("shape") + "   ";
        }
    
        if (this.mVictor !== null) {
            msg = " Victor:" + this.mVictor;
            this.mTurnManager.end();
        }

        if (this.mStalemate) {
            msg = " Victor: stalemate";
            this.mTurnManager.end();
        }

        this.mMsg.setText(msg);
    }

    checkXY(x, y) {
        //space 6
        if (x < 20 && y < 17.5) {
            return 6;
        }
        //space 7
        if (x < 40 && x > 20 && y < 17.5) {
            return 7;
        }
        //space 8
        if (x > 40 && y < 17.5) {
            return 8;
        }
        //space 3
        if (x < 20 && y < 37.5 && y > 17.5) {
            return 3;
        }
        //space 4
        if (x < 40 && x > 20 && y < 37.5 && y > 17.5) {
            return 4;
        }
        //space 5
        if (x > 40 && y < 37.5 && y > 17.5) {
            return 5;
        }
        //space 0
        if (x < 20 && y > 37.5) {
            return 0;
        }
        //space 1
        if (x < 40 && x > 20 && y > 37.5) {
            return 1;
        }
        //space 2
        if (x > 40 && y > 37.5) {
            return 2;
        }
    }

    circle(x, y) {
        for (let i = 1; i <= 60; i++) {
            let circle = new engine.Renderable();
            circle.setColor([0, 0, 0, 1]);
            circle.getXform().setPosition(x, y);
            circle.getXform().setSize(5, 5);
            this.mLineSet.addToSet(circle);
        }
    }

    cross(x, y) {
        let currentLine = new engine.LineRenderable();
        currentLine.setFirstVertex(x + 5, y + 5);
        currentLine.setSecondVertex(x - 5, y - 5);
        this.mLineSet.addToSet(currentLine);

        currentLine = new engine.LineRenderable();
        currentLine.setFirstVertex(x - 5, y + 5);
        currentLine.setSecondVertex(x + 5, y - 5);
        this.mLineSet.addToSet(currentLine);
    }

    placePiece(currShape) {
        let boardCoords = [[10, 47.5], [30, 47.5], [50, 47.5],
                           [10, 27.5], [30, 27.5], [50, 27.5],
                           [10,  7.5], [30,  7.5], [50,  7.5]];
        let placeCoord = boardCoords[this.mSpace];
        if (currShape === "circle") {
            this.circle(placeCoord[0], placeCoord[1]);
            this.mBoard[this.mSpace] = currShape;
            this.checkWin(currShape);
            this.mTurnManager.nextTurn();
        } else if (currShape === "cross") {
            this.cross(placeCoord[0], placeCoord[1]);
            this.mBoard[this.mSpace] = currShape;
            this.checkWin(currShape);
            this.mTurnManager.nextTurn();
        }
    }

    checkWin(player) {
        let winCons = [[0, 1, 2], [0, 4, 8], [0, 3, 6], [1, 4, 7],
                [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]];
        for (let i = 0; i < winCons.length; i++){
            if (this.mBoard[winCons[i][0]] === player
             && this.mBoard[winCons[i][1]] === player
             && this.mBoard[winCons[i][2]] === player) {
                this.mVictor = player;
            }
        }

        let stalemate = true;
        for (let i = 0; i < this.mBoard.length; i++){
            if (this.mBoard[i] === "empty"){
                stalemate = false;
            }
        }
        this.mStalemate = stalemate;
    }
}

window.onload = function () {
    engine.init("GLCanvas");

    let myGame = new MyGame();
    myGame.start();
}