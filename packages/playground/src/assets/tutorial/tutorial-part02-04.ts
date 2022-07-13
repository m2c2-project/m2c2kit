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
            rect: { size: { width: 200, height: 200 } },
            position: { x: 200, y: 300 },
            fillColor: WebColors.PaleGreen,
            isUserInteractionEnabled: true
        });
        sceneOne.addChild(square);

        square.onTapDown(() => {
            console.log("you tapped!");
            // if (message.hidden) {
            //     message.hidden = false;
            // } else {
            //     message.hidden = true;
            // }
            sceneOne.removeChild(message);
        });

        const message = new Label({
            text: "Make me disappear!",
            position: { x: 200, y: 180 }
        });
        sceneOne.addChild(message);

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
