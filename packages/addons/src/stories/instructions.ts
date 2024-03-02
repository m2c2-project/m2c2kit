import { Button } from "../composites/button";
import {
  WebColors,
  Transition,
  TransitionDirection,
  Easings,
  Story,
  StoryOptions,
  Scene,
  Dimensions,
  Label,
  LabelHorizontalAlignmentMode,
  Sprite,
  RgbaColor,
} from "@m2c2kit/core";

const SCENE_TRANSITION_EASING = Easings.sinusoidalInOut;
const SCENE_TRANSITION_DURATION = 500;

export interface InstructionScene {
  /** Primary instruction text */
  text?: string;
  /** Margin from left screen edge to primary instruction text. Default is 48 */
  textMarginStart?: number;
  /** Margin from right to primary instruction text. Default is 48 */
  textMarginEnd?: number;
  /** Horizontal alignment of primary instruction text. see {@link LabelHorizontalAlignmentMode}. Default is LabelHorizontalAlignmentMode.left. */
  textAlignmentMode?: LabelHorizontalAlignmentMode;
  /** Default is to center primary instructions vertically within the scene (textVerticalBias = .5).  Setting textVerticalBias less than .5 will pull the text towards the top. Setting textVerticalBias greater than .5 will pull the text towards the bottom */
  textVerticalBias?: number;
  /** Font size of primary instruction text. Default is 16 */
  textFontSize?: number;
  /** A text heading to appear at the top of the scene */
  title?: string;
  /** Margin from top of screen edge to title text. Default is 48 */
  titleMarginTop?: number;
  /** Font size of title text. Default is 16 */
  titleFontSize?: number;
  /** Name of optional image to show */
  imageName?: string;
  /** Default is to center image vertically within the scene (imageVerticalBias = .5).  Setting imageVerticalBias less than .5 will pull the image towards the top. Setting imageVerticalBias greater than .5 will pull the image towards the bottom */
  imageVerticalBias?: number;
  /** If the image appears below the primary instruction text (imageAboveText = false), this is the margin from the bottom of the primary instruction text to the top of the image */
  imageMarginTop?: number;
  /** If the image appears above the primary instruction text (imageAboveText = true), this is the margin from the bottom of the image to the top of the primary instruction text */
  imageMarginBottom?: number;
  /** If an image is provided, should it appear above the primary text? Default is true */
  imageAboveText?: boolean;
  /** Background color for instruction scene. Will override what is set in InstructionsOptions */
  backgroundColor?: RgbaColor;
  /** Button text for the back button. Will override what is set in InstructionsOptions */
  backButtonText?: string;
  /** Button text for the next button. Will override what is set in InstructionsOptions */
  nextButtonText?: string;
  /** Width of back button. Will override what is set in InstructionsOptions */
  backButtonWidth?: number;
  /** Width of next button. Will override what is set in InstructionsOptions */
  nextButtonWidth?: number;
  /** Height of back button. Will override what is set in InstructionsOptions */
  backButtonHeight?: number;
  /** Height of next button. Will override what is set in InstructionsOptions */
  nextButtonHeight?: number;
  /** Color of back button. Will override what is set in InstructionsOptions */
  backButtonBackgroundColor?: RgbaColor;
  /** Color of back button text. Will override what is set in InstructionsOptions */
  backButtonFontColor?: RgbaColor;
  /** Color of next button. Will override what is set in InstructionsOptions */
  nextButtonBackgroundColor?: RgbaColor;
  /** Color of next button text. Will override what is set in InstructionsOptions */
  nextButtonFontColor?: RgbaColor;
  /** Scene transition when advancing to the next instruction scene. Will override what is set in InstructionsOptions */
  nextSceneTransition?: Transition;
  /** Scene transition when returning to the previous instruction scene. Will override what is set in InstructionsOptions */
  backSceneTransition?: Transition;
}

export interface InstructionsOptions extends StoryOptions {
  /** Name to prefix to each instruction scene name. Default is "instructions." For example, if screenNamePrefix is "instructions", instruction scenes will be named "instructions-01", "instructions-02", etc. */
  sceneNamePrefix?: string;
  /** Name of scene that follows the last instruction scene. Clicking the "next" button on the last instruction screen will advance to this screen */
  postInstructionsScene?: string;
  /** Array of instruction scenes that form the instructions */
  instructionScenes: Array<InstructionScene>;
  /** Background color for instruction scenes. Can be overridden within a single instruction scene */
  backgroundColor?: RgbaColor;
  /** Scene transition when advancing to the next instruction scene. Default is push transition, to the left, 500 milliseconds duration. Can be overridden within a single instruction scene */
  nextSceneTransition?: Transition;
  /** Scene transition when returning to the previous instruction scene. Default is push transition, to the right, 500 milliseconds duration. Can be overridden within a single instruction scene */
  backSceneTransition?: Transition;
  /** Button text for the back button. Default is "Back". Can be overridden within a single instruction scene */
  backButtonText?: string;
  /** Button text for the next button. Default is "Next". Can be overridden within a single instruction scene */
  nextButtonText?: string;
  /** Width of back button. Default is 125. Can be overridden within a single instruction scene */
  backButtonWidth?: number;
  /** Width of next button. Default is 125. Can be overridden within a single instruction scene */
  nextButtonWidth?: number;
  /** Height of back button. Default is 50. Can be overridden within a single instruction scene */
  backButtonHeight?: number;
  /** Height of next button. Default is 50. Can be overridden within a single instruction scene */
  nextButtonHeight?: number;
  /** Color of back button. Default is WebColors.Black. Can be overridden within a single instruction scene */
  backButtonBackgroundColor?: RgbaColor;
  /** Color of back button text. Default is WebColors.White. Can be overridden within a single instruction scene */
  backButtonFontColor?: RgbaColor;
  /** Color of next button. Default is WebColors.Black. Can be overridden within a single instruction scene */
  nextButtonBackgroundColor?: RgbaColor;
  /** Color of next button text. Default is WebColors.White. Can be overridden within a single instruction scene */
  nextButtonFontColor?: RgbaColor;
}

export class Instructions extends Story {
  /**
   * Creates an array of scenes containing instructions on how to complete the assessment
   *
   * @param options - {@link InstructionsOptions}
   * @returns instruction scenes
   */
  static override create(options: InstructionsOptions): Array<Scene> {
    const scenes = new Array<Scene>();
    options.instructionScenes.forEach((s, i) => {
      const nextSceneTransition =
        s.nextSceneTransition ??
        options.nextSceneTransition ??
        Transition.slide({
          direction: TransitionDirection.Left,
          duration: SCENE_TRANSITION_DURATION,
          easing: SCENE_TRANSITION_EASING,
        });
      const backSceneTransition =
        s.backSceneTransition ??
        options.backSceneTransition ??
        Transition.slide({
          direction: TransitionDirection.Right,
          duration: SCENE_TRANSITION_DURATION,
          easing: SCENE_TRANSITION_EASING,
        });
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
        s.textAlignmentMode ?? LabelHorizontalAlignmentMode.Left;
      const textFontSize = s.textFontSize ?? 16;
      const titleFontSize = s.titleFontSize ?? 16;
      const titleMarginTop = s.titleMarginTop ?? 48;
      const backButtonBackgroundColor =
        s.backButtonBackgroundColor ??
        options.backButtonBackgroundColor ??
        WebColors.Black;
      const backButtonFontColor =
        s.backButtonFontColor ?? options.backButtonFontColor ?? WebColors.White;
      const nextButtonBackgroundColor =
        s.nextButtonBackgroundColor ??
        options.nextButtonBackgroundColor ??
        WebColors.Black;
      const nextButtonFontColor =
        s.nextButtonFontColor ?? options.nextButtonFontColor ?? WebColors.White;
      const sceneNamePrefix = options.sceneNamePrefix ?? "instructions";

      const scene = new Scene({
        name: sceneNamePrefix + "-" + (i + 1).toString().padStart(2, "0"),
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
          preferredMaxLayoutWidth: Dimensions.MatchConstraint,
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

      if (s.imageName !== undefined) {
        let image: Sprite;
        if (textLabel !== undefined) {
          if (imageAboveText) {
            image = new Sprite({
              imageName: s.imageName,
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
              imageName: s.imageName,
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
            imageName: s.imageName,
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
          size: { width: backButtonWidth, height: backButtonHeight },
          layout: {
            marginStart: 32,
            marginBottom: 80,
            constraints: { bottomToBottomOf: scene, startToStartOf: scene },
          },
        });
        backButton.isUserInteractionEnabled = true;
        backButton.onTapDown(() => {
          scene.game.presentScene(
            sceneNamePrefix + "-" + (i + 1 - 1).toString().padStart(2, "0"),
            backSceneTransition,
          );
        });
        scene.addChild(backButton);
      }

      const nextButton = new Button({
        name: "nextButton",
        text: nextButtonText,
        fontColor: nextButtonFontColor,
        backgroundColor: nextButtonBackgroundColor,
        size: { width: nextButtonWidth, height: nextButtonHeight },
        layout: {
          marginEnd: 32,
          marginBottom: 80,
          constraints: { bottomToBottomOf: scene, endToEndOf: scene },
        },
      });
      nextButton.isUserInteractionEnabled = true;
      if (i !== options.instructionScenes.length - 1) {
        nextButton.onTapDown(() => {
          scene.game.presentScene(
            sceneNamePrefix + "-" + (i + 1 + 1).toString().padStart(2, "0"),
            nextSceneTransition,
          );
        });
      } else {
        if (options.postInstructionsScene !== undefined) {
          nextButton.onTapDown(() => {
            scene.game.presentScene(
              options.postInstructionsScene ?? "",
              nextSceneTransition,
            );
          });
        } else {
          nextButton.onTapDown(() => {
            const sceneIndex = scene.game.scenes.indexOf(scene);
            if (sceneIndex === -1) {
              /**
               * This should never happen, unless this instruction scene has
               * been removed from the game.
               */
              console.warn(
                "warning: postInstructionsScene is not defined, and next scene cannot be determined.",
              );
            } else {
              const nextSceneIndex = sceneIndex + 1;
              if (nextSceneIndex < scene.game.scenes.length) {
                scene.game.presentScene(
                  scene.game.scenes[nextSceneIndex],
                  nextSceneTransition,
                );
              } else {
                console.warn(
                  "warning: postInstructionsScene is not defined, and there is no next scene to present.",
                );
              }
            }
          });
        }
      }
      scene.addChild(nextButton);

      scenes.push(scene);
    });

    return scenes;
  }

  /**
   * Creates an array of scenes containing instructions on how to complete the assessment
   *
   * @deprecated Use {@link Instructions.create} instead (lower case method name "create")
   *
   * @param options - {@link InstructionsOptions}
   * @returns instruction scenes
   */
  static Create(options: InstructionsOptions): Array<Scene> {
    return this.create(options);
  }
}
