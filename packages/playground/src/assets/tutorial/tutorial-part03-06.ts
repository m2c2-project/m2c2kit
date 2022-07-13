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
    RgbaColor,
    TransitionDirection,
    Transition,
    Easings
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";

class Tutorial extends Game {
    constructor() {

        const defaultParameters: GameParameters = {
        };

        const starterTrialSchema: TrialSchema = {
        };

        const options: GameOptions = {
            name: "Tutorial Part1",
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

        const sceneOne = new Scene({ backgroundColor: WebColors.White });
        game.addScene(sceneOne);

        const square = new Shape({
            rect: { size: { width: 150, height: 150 } },
            position: { x: 300, y: 600 },
            fillColor: WebColors.BlanchedAlmond,
            isUserInteractionEnabled: true
        });
        sceneOne.addChild(square);

        square.onTapDown(() => {
            square.run(
                Action.group([
                    Action.move({
                        point: { x: 80, y: 80 }, duration: 500,
                        easing: Easings.quadraticInOut
                    }),
                    Action.custom({
                        callback: () => {
                            console.log("done moving!");
                            circle.run(Action.move({
                                point: { x: 340, y: 80 }, duration: 500,
                                easing: Easings.quadraticInOut
                            }));
                        }
                    })
                ])
            )
        });

        const circle = new Shape({
            circleOfRadius: 50,
            fillColor: WebColors.DodgerBlue,
            position: { x: 200, y: 700 }
        });
        sceneOne.addChild(circle);

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
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init().then(() => {
    const loaderDiv = document.getElementById("m2c2kit-loader-div");
    if (loaderDiv) {
        loaderDiv.classList.remove("m2c2kit-loader");
    }
});
