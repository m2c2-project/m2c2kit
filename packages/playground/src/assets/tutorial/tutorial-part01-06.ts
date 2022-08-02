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
} from "@m2c2kit/core";
import { Button, Grid } from "@m2c2kit/addons";

class Tutorial extends Game {
    constructor() {

        const defaultParameters: GameParameters = {
        };

        const starterTrialSchema: TrialSchema = {
        };

        const options: GameOptions = {
            name: "Tutorial Part1",
            version: "0.0.1",
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
        const sceneOne = new Scene({ backgroundColor: WebColors.SkyBlue });
        game.addScene(sceneOne);

        const helloLabel = new Label({
            text: "hello, world. This is a long string of text that will be wrapped.",
            preferredMaxLayoutWidth: 200,
            horizontalAlignmentMode: LabelHorizontalAlignmentMode.left,
            position: { x: 200, y: 300 }
        });
        sceneOne.addChild(helloLabel);

        const myRect = new Shape( { rect: { size: { height: 300, width: 200}  },
        fillColor: WebColors.LightCyan,
        position: { x: 200, y: 500}});
        sceneOne.addChild(myRect);

        const byeLabel = new Label( { text: "goodbye!"});
        myRect.addChild(byeLabel);

        const icecreamLabel = new Label( { text: "Who wants ice cream?",
        fontColor: WebColors.RebeccaPurple,
        position: { x: 0, y: -100}});
        myRect.addChild(icecreamLabel);

        const pressMeButton = new Button( { text: "press me!"});
        pressMeButton.position = { x: 150, y: 700};
        sceneOne.addChild(pressMeButton);

        const myGrid = new Grid( { rows: 3, columns: 3,
        size: { width: 250, height: 250},
        gridLineColor: WebColors.Brown,
        backgroundColor: WebColors.White,
        position: { x: 200, y: 140}});
        sceneOne.addChild(myGrid);

        const xMarks = new Label( { text: "x", fontSize: 48});
        myGrid.addAtCell(xMarks, 0, 1);
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
