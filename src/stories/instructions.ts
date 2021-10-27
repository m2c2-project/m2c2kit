import { Button } from "./../composites/button";
import { Label, rgbaColor, Scene, Size, Sprite } from "./../m2c2kit";

export interface StoryOptions {
  sceneNamePrefix: string;
}

export abstract class Story {
  // We need to include options as argument, because the concrete classes use them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static Create(options: StoryOptions): Array<Scene> {
    return new Array<Scene>();
  }
}

export interface InstructionScene {
  text?: string;
  textVerticalBias?: number;
  title?: string;
  titleMarginTop?: number;
  image?: string;
  imageVerticalBias?: number;
  imageMarginTop?: number;
  imageMarginBottom?: number;
  textAboveImage?: boolean;
  backgroundColor?: rgbaColor;
  backButtonText?: string;
  nextButtonText?: string;
  backButtonWidth?: number;
  nextButtonWidth?: number;
  backButtonHeight?: number;
  nextButtonHeight?: number;
}

export interface InstructionsOptions extends StoryOptions {
  sceneNamePrefix: string;
  instructionScenes: Array<InstructionScene>;
  backgroundColor?: rgbaColor;
  postInstructionsScene?: string;
  backButtonText?: string;
  nextButtonText?: string;
  backButtonWidth?: number;
  nextButtonWidth?: number;
  backButtonHeight?: number;
  nextButtonHeight?: number;
}

export class Instructions extends Story {
  static override Create(options: InstructionsOptions): Array<Scene> {
    const scenes = new Array<Scene>();
    options.instructionScenes.forEach((s, i) => {
      const backButtonText =
        s.backButtonText ?? options.backButtonText ?? "Back";
      const nextButtonText =
        s.nextButtonText ?? options.nextButtonText ?? "Next";
      const backButtonWidth =
        s.backButtonWidth ?? options.backButtonWidth ?? 125;
      const nextButtonWidth =
        s.nextButtonWidth ?? options.nextButtonWidth ?? 125;
      const backButtonHeight =
        s.backButtonHeight ?? options.backButtonHeight ?? 50;
      const nextButtonHeight =
        s.nextButtonHeight ?? options.nextButtonHeight ?? 50;
      const backgroundColor = s.backgroundColor ?? options.backgroundColor;
      const textAboveImage = s.textAboveImage ?? true;
      const imageMarginTop = s.imageMarginTop ?? 0;
      const imageMarginBottom = s.imageMarginBottom ?? 0;

      const scene = new Scene({
        name:
          options.sceneNamePrefix + "-" + (i + 1).toString().padStart(2, "0"),
        backgroundColor: backgroundColor,
      });

      const titleMarginTop = s.titleMarginTop ?? 32;

      let titleLabel: Label | undefined;
      if (s.title !== undefined) {
        titleLabel = new Label({
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
        scene.addChild(titleLabel);
      }

      let textLabel: Label | undefined;
      if (s.text !== undefined) {
        textLabel = new Label({
          text: s.text,
          layout: {
            constraints: {
              topToTopOf: scene,
              bottomToBottomOf: scene,
              startToStartOf: scene,
              endToEndOf: scene,
              verticalBias: s.textVerticalBias,
            },
          },
        });
        scene.addChild(textLabel);
      }

      if (s.image !== undefined) {
        let image: Sprite;
        if (textLabel !== undefined) {
          if (textAboveImage) {
            image = new Sprite({
              imageName: s.image,
              layout: {
                marginTop: imageMarginTop,
                constraints: {
                  topToBottomOf: textLabel,
                  startToStartOf: scene,
                  endToEndOf: scene,
                },
              },
            });
          } else {
            image = new Sprite({
              imageName: s.image,
              layout: {
                marginBottom: imageMarginBottom,
                constraints: {
                  bottomToTopOf: textLabel,
                  startToStartOf: scene,
                  endToEndOf: scene,
                },
              },
            });
          }
        } else {
          image = new Sprite({
            imageName: s.image,
            layout: {
              constraints: {
                topToTopOf: scene,
                bottomToBottomOf: scene,
                verticalBias: s.imageVerticalBias,
                startToStartOf: scene,
                endToEndOf: scene,
              },
            },
          });
        }
        scene.addChild(image);
      }

      if (i > 0) {
        const backButton = new Button({
          text: backButtonText,
          size: new Size(backButtonWidth, backButtonHeight),
          layout: {
            marginStart: 32,
            marginBottom: 32,
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
        size: new Size(nextButtonWidth, nextButtonHeight),
        layout: {
          marginEnd: 32,
          marginBottom: 32,
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
