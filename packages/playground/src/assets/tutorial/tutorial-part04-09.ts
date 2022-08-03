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
            preparation_duration_ms: {
                default: 500,
                type: "number",
                description:
                    "Duration of the preparation phase ('get ready' countdown, milliseconds). Multiples of 1000 recommended.",
            },
            number_of_trials: {
                default: 10,
                type: "integer",
                description: "How many trials to run.",
            },
            even_percent: {
                default: .50,
                type: "number",
                description: "Percent of trials that are an even number"
            }
        };

        const starterTrialSchema: TrialSchema = {
            user_selection: {
                type: "string",
                description: "User's selection, odd or even"
            },
            selection_correct: {
                type: "boolean",
                description: "Was the user's selection correct?"
            },
            response_time_duration_ms: {
                type: "number",
                description:
                    "Milliseconds from the beginning of the trial until a user taps a response. Null if trial was skipped.",
            },
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

        const numberOfTrials = game.getParameter<number>("number_of_trials");

        // ==============================================================
        // Create the trial configuration of all trials.

        interface TrialConfiguration {
            randomValue: number
        }

        const trialConfigurations: TrialConfiguration[] = [];

        const evenTrials = Math.ceil(game.getParameter<number>("even_percent") * numberOfTrials);
        const eventTrialIndexes = RandomDraws.FromRangeWithoutReplacement(evenTrials, 0, 9);
        for (let i = 0; i < numberOfTrials; i++) {
            if (eventTrialIndexes.includes(i)) {
                // need an even number
                let x = RandomDraws.SingleFromRange(1, 10);
                while (x % 2 === 1) {
                    x = RandomDraws.SingleFromRange(1, 10);
                }
                trialConfigurations.push({ randomValue: x });
            } else {
                // need an odd number
                let x = RandomDraws.SingleFromRange(1, 10);
                while (x % 2 === 0) {
                    x = RandomDraws.SingleFromRange(1, 10);
                }
                trialConfigurations.push({ randomValue: x });
            }
        }

        console.log("Trial configurations: " + JSON.stringify(trialConfigurations));

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
                Action.wait({ duration: game.getParameter<number>("preparation_duration_ms") }),
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
            handleTap(false);
        });

        const evenButton = new Button({ text: "Even", position: { x: 275, y: 600 }, size: { width: 100, height: 50 } });
        oddEvenScene.addChild(evenButton);
        evenButton.onTapDown(() => {
            handleTap(true);
        });

        function handleTap(userSelectedEven: boolean): void {
            Timer.stop("rt");
            game.addTrialData("response_time_duration_ms", Timer.elapsed("rt"));
            Timer.remove("rt");
            oddButton.isUserInteractionEnabled = false;
            evenButton.isUserInteractionEnabled = false;
            if (userSelectedEven) {
                game.addTrialData("user_selection", "even");
            } else {
                game.addTrialData("user_selection", "odd");
            }

            const numericValueWasEven = parseInt(numberLabel.text) % 2 === 0;
            if ((numericValueWasEven && userSelectedEven) ||
                (!numericValueWasEven && !userSelectedEven)) {
                console.log("CORRECT!");
                game.addTrialData("selection_correct", true);
            } else {
                console.log("WRONG!");
                game.addTrialData("selection_correct", false);
            }
            game.trialComplete();
            if (game.trialIndex < numberOfTrials) {
                game.presentScene(getReadyScene);
            } else {
                game.presentScene(doneScene)
            }
        }

        const numberLabel = new Label({ fontSize: 32, position: { x: 200, y: 400 } });
        oddEvenScene.addChild(numberLabel);

        oddEvenScene.onAppear(() => {
            oddButton.isUserInteractionEnabled = true;
            evenButton.isUserInteractionEnabled = true;
            const randomValue = trialConfigurations[game.trialIndex].randomValue.toString();
            numberLabel.text = randomValue;
            Timer.start("rt");
        });

        // ==============================================================
        // SCENE: done
        const doneScene = new Scene();
        game.addScene(doneScene);

        const doneLabel = new Label({
            text: "You're done",
            position: { x: 200, y: 300 }
        });
        doneScene.addChild(doneLabel);
        const okButton = new Button({ text: "OK", isUserInteractionEnabled: true, position: { x: 200, y: 600 } });
        okButton.onTapDown(() => {
            doneScene.removeAllChildren();
            game.end();
        })
        doneScene.addChild(okButton);
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
        onActivityDataCreate: (ev: ActivityDataEvent) => {
            console.log(`********** trial complete`);
            console.log("newData: " + JSON.stringify(ev.newData));
            console.log("data: " + JSON.stringify(ev.data));
            console.log(
                "activity parameters: " + JSON.stringify(ev.activityConfiguration)
            );
        },
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
