import { Entity } from "./Entity";

/**
 * Constraints for defining relative layouts.
 *
 * @remarks FOR INTERNAL USE ONLY
 */
export interface Constraints {
  /** Constrain the top (vertical axis) of this entity to the top of the specified entity. The tops of both will appear at the same vertical location */
  topToTopOf?: Entity | string;
  /** Constrain the top (vertical axis) of this entity to the bottom of the specified entity. This entity will appear immediately below the specified entity */
  topToBottomOf?: Entity | string;
  /** Constrain the bottom (vertical axis) of this entity to the top of the specified entity. This entity will appear immediately above of the specified entity */
  bottomToTopOf?: Entity | string;
  /** Constrain the bottom (vertical axis) of this entity to the bottom of the specified entity. The bottoms of both will appear at the same vertical location */
  bottomToBottomOf?: Entity | string;
  /** Constrain the start (horizontal axis) of this entity to the start of the specified entity. The start of both will appear at the same horizontal location */
  startToStartOf?: Entity | string;
  /** Constrain the start (horizontal axis) of this entity to the end of the specified entity. This entity will appear immediately to the right of the specified entity */
  startToEndOf?: Entity | string;
  /** Constrain the end (horizontal axis) of this entity to the end of the specified entity. The end of both will appear at the same horizontal location */
  endToEndOf?: Entity | string;
  /** Constrain the end (horizontal axis) of this entity to the start of the specified entity. This entity will appear immediately to the left of the specified entity */
  endToStartOf?: Entity | string;
  /** When opposing horizontal constraints are applied, the default is to center the entity within the constraints (horizontalBias = .5). Setting horizontalBias less than .5 will pull the entity towards the start (to the left). Setting horizontalBias greater than .5 will pull the entity towards the end (to the right)  */
  horizontalBias?: number;
  /** When opposing vertical constraints are applied, the default is to center the entity within the constraints (verticalBias = .5). Setting verticalBias less than .5 will pull the entity towards the top. Setting verticalBias greater than .5 will pull the entity towards the bottom */
  verticalBias?: number;
  // the following allows access to properties using a string key
  [key: string]: Entity | string | number | undefined;
}
