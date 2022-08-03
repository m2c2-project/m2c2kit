import {
    Game,
    Action,
    Scene,
    Label,
    Shape,
    WebColors,
    RandomDraws,
    GameParameters,
    GameOptions,
    TrialSchema,
    Timer,
    Session,
    SessionLifecycleEvent,
    ActivityDataEvent,
    ActivityLifecycleEvent,
    LabelHorizontalAlignmentMode,
    RgbaColor
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class Tutorial extends Game {
    constructor() {

        const defaultParameters: GameParameters = {
        };

        const starterTrialSchema: TrialSchema = {
        };

        const options: GameOptions = {
            name: "Tutorial Part4",
            version: "1.0.0",
            id: "tut1",
            showFps: false,
            width: 400,
            height: 800,
            trialSchema: starterTrialSchema,
            parameters: defaultParameters,
            bodyBackgroundColor: WebColors.LightGray,
            fontUrls: ["assets/cli-starter/fonts/roboto/Roboto-Regular.ttf"],
        };

        super(options);
    }

    override init(): void {
        const game = this;

        // ==============================================================
        // SCENE: instructions
        const instructionsScenes = Instructions.Create({
            instructionScenes: [
                {
                    title: "m2c2kit intro",
                    text: "These are instructions.",
                }
            ]
        });
        game.addScenes(instructionsScenes);

        // ==============================================================
        // SCENE: get ready
        const getReadyScene = new Scene({ backgroundColor: WebColors.PaleTurquoise });
        game.addScene(getReadyScene);

        const getReadyLabel = new Label({
            text: "Get Ready!",
            position: { x: 200, y: 300 }
        });
        getReadyScene.addChild(getReadyLabel);

        getReadyScene.onAppear(() => {
            getReadyScene.run(Action.sequence([
                Action.wait({ duration: 500 }),
                Action.custom({
                    callback: () => {
                        game.presentScene(oddEvenScene);
                    }
                })
            ]));
        });

        // ==============================================================
        // SCENE: odd or even user response
        const oddEvenScene = new Scene();
        game.addScene(oddEvenScene);
        const isItOddOrEvenLabel = new Label({
            text: "Is this odd or even?",
            position: { x: 200, y: 200 }
        });
        oddEvenScene.addChild(isItOddOrEvenLabel);

        const oddButton = new Button({ text: "Odd", position: { x: 125, y: 600 }, size: { width: 100, height: 50 } });
        oddEvenScene.addChild(oddButton);
        oddButton.onTapDown(() => {
            oddButton.isUserInteractionEnabled = false;
            evenButton.isUserInteractionEnabled = false;
            const numericValue = parseInt(numberLabel.text);
            if (numericValue % 2 === 1) {
                console.log("CORRECT!");
            } else {
                console.log("WRONG!");
            }
            game.presentScene(getReadyScene);
        });

        const evenButton = new Button({ text: "Even", position: { x: 275, y: 600 }, size: { width: 100, height: 50 } });
        oddEvenScene.addChild(evenButton);
        evenButton.onTapDown(() => {
            oddButton.isUserInteractionEnabled = false;
            evenButton.isUserInteractionEnabled = false;
            const numericValue = parseInt(numberLabel.text);
            if (numericValue % 2 === 0) {
                console.log("CORRECT!");
            } else {
                console.log("WRONG!");
            }
            game.presentScene(getReadyScene);
        });

        const numberLabel = new Label({ fontSize: 32, position: { x: 200, y: 400 } });
        oddEvenScene.addChild(numberLabel);

        oddEvenScene.onAppear(() => {
            oddButton.isUserInteractionEnabled = true;
            evenButton.isUserInteractionEnabled = true;
            const randomValue = RandomDraws.SingleFromRange(1, 10).toString();
            numberLabel.text = randomValue;
        });

        // ==============================================================
        // SCENE: done
        const sceneDone = new Scene();
        game.addScene(sceneDone);

        const doneLabel = new Label({
            text: "You're done",
            position: { x: 200, y: 300 }
        });
        sceneDone.addChild(doneLabel);
        const okButton = new Button({ text: "OK", isUserInteractionEnabled: true, position: { x: 200, y: 600 } });
        okButton.onTapDown(() => {
            game.end();
        })
        sceneDone.addChild(okButton);
    }
}

const activity = new Tutorial();
const session = new Session({
    activities: [activity],
    sessionCallbacks: {
        /**
         * onSessionLifecycleChange() will be called on events such
         * as when the session initialization is complete or when the
         * session ends.
         *
         * Once initialized, the below code will start the session.
         */
        onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
            if (ev.initialized) {
                session.start();
            }
            if (ev.ended) {
                console.log("ended session");
            }
        },
    },
    activityCallbacks: {
        onActivityLifecycleChange: (ev: ActivityLifecycleEvent) => {
            if (ev.ended || ev.canceled) {
                const status = ev.ended ? "ended" : "canceled";
                console.log(`${status} activity ${ev.name}`);
                if (session.nextActivity) {
                    session.advanceToNextActivity();
                } else {
                    session.end();
                }
            }
        },
    }    
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init().then(() => {
    const loaderDiv = document.getElementById("m2c2kit-loader-div");
    if (loaderDiv) {
        loaderDiv.classList.remove("m2c2kit-loader");
    }
});
