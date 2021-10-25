import { Button } from "./../composites/button";
import { Label, rgbaColor, Scene, Size, Story } from "./../m2c2kit";

export interface StoryOptions {
  sceneNamePrefix: string;
}

export abstract class StoryCreator {
  // We need to include options as argument, because the concrete classes use them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static Create(options: StoryOptions): Story {
    return new Array<Scene>();
  }
}

export interface InstructionScene {
  text?: string;
  textVerticalBias?: number;
  title?: string;
  titleMarginTop?: number;
  image?: string;
  backgroundColor?: rgbaColor;
  backButtonText?: string;
  nextButtonText?: string;
}

export interface InstructionsOptions extends StoryOptions {
  sceneNamePrefix: string;
  instructionScenes: Array<InstructionScene>;
  backgroundColor?: rgbaColor;
  postInstructionsScene?: string;
  backButtonText?: string;
  nextButtonText?: string;
}

export class Instructions extends StoryCreator {
  static override Create(options: InstructionsOptions): Story {
    const scenes = new Array<Scene>();
    options.instructionScenes.forEach((s, i) => {
      const backButtonText =
        s.backButtonText ?? options.backButtonText ?? "Back";
      const nextButtonText =
        s.nextButtonText ?? options.nextButtonText ?? "Next";
      const backgroundColor = s.backgroundColor ?? options.backgroundColor;
      const scene = new Scene({
        name:
          options.sceneNamePrefix + "-" + (i + 1).toString().padStart(2, "0"),
        backgroundColor: backgroundColor,
      });

      const titleMarginTop = s.titleMarginTop ?? 32;

      let title: Label | undefined;
      if (s.title !== undefined) {
        title = new Label({
          text: s.title,
          layout: {
            marginTop: titleMarginTop,
            constraints: {
              topToTopOf: scene,
              startToStartOf: scene,
              endToEndOf: scene,
            },
          },
        });
        scene.addChild(title);
      }

      if (s.text !== undefined) {
        const text = new Label({
          text: s.text,
          layout: {
            marginTop: 0,
            constraints: {
              topToTopOf: title === undefined ? scene : title,
              bottomToBottomOf: title === undefined ? scene : undefined,
              startToStartOf: scene,
              endToEndOf: scene,
              verticalBias: s.textVerticalBias,
            },
          },
        });
        scene.addChild(text);
      }

      if (i > 0) {
        const backButton = new Button({
          text: backButtonText,
          size: new Size(125, 50),
          layout: {
            marginStart: 16,
            marginBottom: 16,
            constraints: { bottomToBottomOf: scene, startToStartOf: scene },
          },
        });
        backButton.isUserInteractionEnabled = true;
        backButton.onTap(() => {
          scene.game.presentScene(
            options.sceneNamePrefix +
              "-" +
              (i + 1 - 1).toString().padStart(2, "0")
          );
        });
        scene.addChild(backButton);
      }

      const nextButton = new Button({
        text: nextButtonText,
        size: new Size(125, 50),
        layout: {
          marginEnd: 16,
          marginBottom: 16,
          constraints: { bottomToBottomOf: scene, endToEndOf: scene },
        },
      });
      nextButton.isUserInteractionEnabled = true;
      if (i !== options.instructionScenes.length - 1) {
        nextButton.onTap(() => {
          scene.game.presentScene(
            options.sceneNamePrefix +
              "-" +
              (i + 1 + 1).toString().padStart(2, "0")
          );
        });
      } else if (options.postInstructionsScene !== undefined) {
        nextButton.onTap(() => {
          scene.game.presentScene(options.postInstructionsScene ?? "");
        });
      }
      scene.addChild(nextButton);

      scenes.push(scene);
    });

    return scenes;
  }
}
