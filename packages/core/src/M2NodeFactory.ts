import { M2NodeOptions } from "./M2NodeOptions";
import { Label } from "./Label";
import { Scene } from "./Scene";
import { Shape } from "./Shape";
import { TextLine } from "./TextLine";
import { Sprite } from "./Sprite";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2NodeClassRegistry } from "./M2NodeClassRegistry";

export class M2NodeFactory {
  /**
   * The `M2NodeFactory` creates nodes of the specified type with the specified
   * options for event replay.
   */
  constructor() {
    M2c2KitHelpers.registerM2NodeClass(Label, Shape, Sprite, Scene, TextLine);
    /**
     * We did not register the Composite node class here because it is not
     * a node that can be created directly (it's an abstract class). Instead,
     * specific (concrete) composite types are registered individually.
     */
  }

  /**
   * Creates a new node of the specified type with the specified options.
   *
   * @param type - The type of node to create
   * @param compositeType - The composite type of the node to create
   * @param options - The options to use when creating the node
   * @returns created node
   */
  createNode(
    type: string,
    compositeType: string | undefined,
    options: M2NodeOptions,
  ) {
    const classNameToCreate = compositeType ? compositeType : type;
    if (!this.hasClassRegistration(classNameToCreate)) {
      throw new Error(`Unknown node type: ${classNameToCreate}`);
    }

    if (!m2c2Globals.m2NodeClassRegistry) {
      throw new Error("Node class registry is not initialized.");
    }

    const classToInstantiate = (
      m2c2Globals.m2NodeClassRegistry as M2NodeClassRegistry
    )[classNameToCreate];
    const node = new classToInstantiate(options);
    return node;
  }

  private hasClassRegistration(className: string) {
    return Object.keys(m2c2Globals.m2NodeClassRegistry ?? {}).includes(
      className,
    );
  }
}
