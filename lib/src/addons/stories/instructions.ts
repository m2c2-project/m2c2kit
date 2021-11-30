import { WebColors } from "../../WebColors";
import {
  Scene,
  Dimensions,
  Story,
  StoryOptions,
  Transition,
  TransitionDirection,
} from "../..";
import { Label } from "../../Label";
import { LabelHorizontalAlignmentMode } from "../../LabelHorizontalAlignmentMode";
import { Sprite } from "../../Sprite";
import { Button } from "../../addons/composites/button";
import { RgbaColor } from "../../RgbaColor";
import { Size } from "../../Size";

export interface InstructionScene {
  text?: string;
  textMarginStart?: number;
  textMarginEnd?: number;
  textAlignmentMode?: LabelHorizontalAlignmentMode;
  textVerticalBias?: number;
  textFontSize?: number;
  title?: string;
  titleMarginTop?: number;
  titleFontSize?: number;
  image?: string;
  imageVerticalBias?: number;
  imageMarginTop?: number;
  imageMarginBottom?: number;
  imageAboveText?: boolean;
  backgroundColor?: RgbaColor;
  backButtonText?: string;
  nextButtonText?: string;
  backButtonWidth?: number;
  nextButtonWidth?: number;
  backButtonHeight?: number;
  nextButtonHeight?: number;
  backButtonBackgroundColor?: RgbaColor;
  backButtonFontColor?: RgbaColor;
  nextButtonBackgroundColor?: RgbaColor;
  nextButtonFontColor?: RgbaColor;
  nextSceneTransition?: Transition;
  backSceneTransition?: Transition;
}

export interface InstructionsOptions extends StoryOptions {
  sceneNamePrefix: string;
  instructionScenes: Array<InstructionScene>;
  backgroundColor?: RgbaColor;
  postInstructionsScene?: string;
  nextSceneTransition?: Transition;
  backSceneTransition?: Transition;
  backButtonText?: string;
  nextButtonText?: string;
  backButtonWidth?: number;
  nextButtonWidth?: number;
  backButtonHeight?: number;
  nextButtonHeight?: number;
  backButtonBackgroundColor?: RgbaColor;
  backButtonFontColor?: RgbaColor;
  nextButtonBackgroundColor?: RgbaColor;
  nextButtonFontColor?: RgbaColor;
}

export class Instructions extends Story {
  static override Create(options: InstructionsOptions): Array<Scene> {
    const scenes = new Array<Scene>();
    options.instructionScenes.forEach((s, i) => {
      const nextSceneTransition =
        s.nextSceneTransition ??
        options.nextSceneTransition ??
        Transition.push(TransitionDirection.left, 500);
      const backSceneTransition =
        s.backSceneTransition ??
        options.backSceneTransition ??
        Transition.push(TransitionDirection.right, 500);
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
      const imageAboveText = s.imageAboveText ?? true;
      const imageMarginTop = s.imageMarginTop ?? 0;
      const imageMarginBottom = s.imageMarginBottom ?? 0;
      const textMarginStart = s.textMarginStart ?? 48;
      const textMarginEnd = s.textMarginEnd ?? 48;
      const textAlignmentMode =
        s.textAlignmentMode ?? LabelHorizontalAlignmentMode.left;
      const textFontSize = s.textFontSize ?? 16;
      const titleFontSize = s.titleFontSize ?? 16;
      const titleMarginTop = s.titleMarginTop ?? 48;
      const backButtonBackgroundColor =
        s.backButtonBackgroundColor ??
        options.backButtonBackgroundColor ??
        WebColors.RoyalBlue;
      const backButtonFontColor =
        s.backButtonFontColor ?? options.backButtonFontColor ?? WebColors.White;
      const nextButtonBackgroundColor =
        s.nextButtonBackgroundColor ??
        options.nextButtonBackgroundColor ??
        WebColors.RoyalBlue;
      const nextButtonFontColor =
        s.nextButtonFontColor ?? options.nextButtonFontColor ?? WebColors.White;

      const scene = new Scene({
        name:
          options.sceneNamePrefix + "-" + (i + 1).toString().padStart(2, "0"),
        backgroundColor: backgroundColor,
      });

      let titleLabel: Label | undefined;
      if (s.title !== undefined) {
        titleLabel = new Label({
          text: s.title,
          fontSize: titleFontSize,
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
          preferredMaxLayoutWidth: Dimensions.MATCH_CONSTRAINT,
          horizontalAlignmentMode: textAlignmentMode,
          fontSize: textFontSize,
          layout: {
            marginStart: textMarginStart,
            marginEnd: textMarginEnd,
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
          if (imageAboveText) {
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
          } else {
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
          fontColor: backButtonFontColor,
          backgroundColor: backButtonBackgroundColor,
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
              (i + 1 - 1).toString().padStart(2, "0"),
            backSceneTransition
          );
        });
        scene.addChild(backButton);
      }

      const nextButton = new Button({
        text: nextButtonText,
        fontColor: nextButtonFontColor,
        backgroundColor: nextButtonBackgroundColor,
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
              (i + 1 + 1).toString().padStart(2, "0"),
            nextSceneTransition
          );
        });
      } else {
        if (options.postInstructionsScene !== undefined) {
          nextButton.onTap(() => {
            scene.game.presentScene(
              options.postInstructionsScene ?? "",
              nextSceneTransition
            );
          });
        } else {
          console.warn(
            "warning: instructions postInstructionsScene is not defined"
          );
        }
      }
      scene.addChild(nextButton);

      scenes.push(scene);
    });

    return scenes;
  }
}
