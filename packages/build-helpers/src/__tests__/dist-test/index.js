
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var ActionType = /* @__PURE__ */ ((ActionType2) => {
  ActionType2["Sequence"] = "Sequence";
  ActionType2["Group"] = "Group";
  ActionType2["Wait"] = "Wait";
  ActionType2["Custom"] = "Custom";
  ActionType2["Move"] = "Move";
  ActionType2["Scale"] = "Scale";
  ActionType2["FadeAlpha"] = "FadeAlpha";
  ActionType2["Rotate"] = "Rotate";
  return ActionType2;
})(ActionType || {});
class Easings {
}
Easings.none = (t, b, c, d) => {
  return c + b;
};
Easings.linear = (t, b, c, d) => {
  return c * t / d + b;
};
Easings.quadraticIn = (t, b, c, d) => {
  t /= d;
  return c * t * t + b;
};
Easings.quadraticOut = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};
Easings.quadraticInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};
Easings.cubicIn = (t, b, c, d) => {
  t /= d;
  return c * t * t * t + b;
};
Easings.cubicOut = (t, b, c, d) => {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
};
Easings.cubicInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return c / 2 * t * t * t + b;
  t -= 2;
  return c / 2 * (t * t * t + 2) + b;
};
Easings.quarticIn = (t, b, c, d) => {
  t /= d;
  return c * t * t * t * t + b;
};
Easings.quarticOut = (t, b, c, d) => {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
};
Easings.quarticInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return c / 2 * t * t * t * t + b;
  t -= 2;
  return -c / 2 * (t * t * t * t - 2) + b;
};
Easings.quinticIn = (t, b, c, d) => {
  t /= d;
  return c * t * t * t * t * t + b;
};
Easings.quinticOut = (t, b, c, d) => {
  t /= d;
  t--;
  return c * (t * t * t * t * t + 1) + b;
};
Easings.quinticInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return c / 2 * t * t * t * t * t + b;
  t -= 2;
  return c / 2 * (t * t * t * t * t + 2) + b;
};
Easings.sinusoidalIn = (t, b, c, d) => {
  return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};
Easings.sinusoidalOut = (t, b, c, d) => {
  return c * Math.sin(t / d * (Math.PI / 2)) + b;
};
Easings.sinusoidalInOut = (t, b, c, d) => {
  return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};
Easings.exponentialIn = (t, b, c, d) => {
  return c * Math.pow(2, 10 * (t / d - 1)) + b;
};
Easings.exponentialOut = (t, b, c, d) => {
  return c * (-Math.pow(2, -10 * t / d) + 1) + b;
};
Easings.exponentialInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
  t--;
  return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
};
Easings.circularIn = (t, b, c, d) => {
  t /= d;
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
};
Easings.circularOut = (t, b, c, d) => {
  t /= d;
  t--;
  return c * Math.sqrt(1 - t * t) + b;
};
Easings.circularInOut = (t, b, c, d) => {
  t /= d / 2;
  if (t < 1)
    return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
  t -= 2;
  return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
};
var EntityType = /* @__PURE__ */ ((EntityType2) => {
  EntityType2["Entity"] = "Entity";
  EntityType2["Scene"] = "Scene";
  EntityType2["Sprite"] = "Sprite";
  EntityType2["Label"] = "Label";
  EntityType2["TextLine"] = "TextLine";
  EntityType2["Shape"] = "Shape";
  EntityType2["Composite"] = "Composite";
  return EntityType2;
})(EntityType || {});
var ShapeType = /* @__PURE__ */ ((ShapeType2) => {
  ShapeType2["Undefined"] = "Undefined";
  ShapeType2["Rectangle"] = "Rectangle";
  ShapeType2["Circle"] = "Circle";
  ShapeType2["Path"] = "Path";
  return ShapeType2;
})(ShapeType || {});
class M2c2KitHelpers {
  /**
   * Calculates the four points of the bounding box of the entity, taking
   * into account the entity's rotation (as well as the rotation of its
   * ancestors).
   *
   * @remarks This method is used to calculate the rotated bounding box of an
   * entity when in order to determine if a point is inside the entity in
   * response to DOM pointer events. This method is NOT used to prepare the
   * CanvasKit canvas for drawing the entity.
   *
   * @param drawableEntity
   * @returns array of points representing the rotated entity
   */
  static calculateRotatedPoints(drawableEntity) {
    const entities = drawableEntity.ancestors;
    entities.reverse();
    entities.push(drawableEntity);
    const entityPointsArray = entities.map((entity) => {
      const boundingBox = M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(entity);
      return M2c2KitHelpers.boundingBoxToPoints(boundingBox);
    });
    for (let i = 0; i < entityPointsArray.length; i++) {
      if (!entityNeedsRotation(entities[i])) {
        continue;
      }
      const entityPoints = entityPointsArray[i];
      const radians = entities[i].zRotation;
      const center = M2c2KitHelpers.findCentroid(entityPoints);
      for (let j = i; j < entities.length; j++) {
        entityPointsArray[j] = rotateRectangle(
          entityPointsArray[j],
          radians,
          center
        );
      }
    }
    return entityPointsArray[entityPointsArray.length - 1];
  }
  /**
   * Rotates the canvas so the entity appears rotated when drawn.
   *
   * @remarks Entities inherit rotations from their ancestors. Each ancestor,
   * however, rotates around its own anchor point. Thus, we must rotate the
   * canvas around the anchor point of each ancestor as well as the entity's
   * anchor point.
   *
   * @param canvas - CanvasKit canvas to rotate
   * @param drawableEntity - Entity to rotate the canvas for
   */
  static rotateCanvasForDrawableEntity(canvas, drawableEntity) {
    const rotationTransforms = M2c2KitHelpers.calculateRotationTransforms(drawableEntity);
    if (rotationTransforms.length === 0) {
      return;
    }
    const drawScale = Globals.canvasScale / drawableEntity.absoluteScale;
    applyRotationTransformsToCanvas(rotationTransforms, drawScale, canvas);
  }
  /**
   * Calculates the absolute bounding box of the entity before any rotation
   * is applied.
   *
   * @remarks The absolute bounding box is the bounding box of the entity
   * relative to the scene's origin (0, 0).
   *
   * @param entity
   * @returns the bounding box of the entity
   */
  static calculateEntityAbsoluteBoundingBox(entity) {
    const anchorPoint = entity.anchorPoint;
    const scale = entity.absoluteScale;
    let width = entity.size.width;
    let height = entity.size.height;
    if (entity.type === EntityType.Shape && entity.shapeType === ShapeType.Circle) {
      const radius = entity.circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }
    const xMin = entity.absolutePosition.x - width * anchorPoint.x * scale;
    const xMax = entity.absolutePosition.x + width * (1 - anchorPoint.x) * scale;
    const yMin = entity.absolutePosition.y - height * anchorPoint.y * scale;
    const yMax = entity.absolutePosition.y + height * (1 - anchorPoint.y) * scale;
    return { xMin, xMax, yMin, yMax };
  }
  /**
   * Converts an angle from radians to degrees.
   *
   * @remarks In m2c2kit, radians are counter clockwise from the positive
   * x-axis, but the rotate method in CanvasKit uses degrees clockwise. Thus
   * we negate after conversion from radians to degrees.
   *
   * @param radians - The angle in radians
   * @returns The angle in degrees
   */
  static radiansToDegrees(radians) {
    return -M2c2KitHelpers.normalizeAngleRadians(radians) * (180 / Math.PI);
  }
  /**
   * Normalizes an angle in radians to the range [0, 2*Math.PI)
   *
   * @param radians - angle in radians
   * @returns normalized angle in radians
   */
  static normalizeAngleRadians(radians) {
    const quotient = Math.floor(radians / (2 * Math.PI));
    let normalized = radians - quotient * (2 * Math.PI);
    if (normalized < 0) {
      normalized += 2 * Math.PI;
    }
    return normalized;
  }
  /**
   * Checks if two points are on the same side of a line.
   *
   * @remarks The line is defined by two points, a and b. The function uses
   * the cross product to determine the relative position of the points.
   *
   * @param p1 - point to check
   * @param p2 - point to check
   * @param a - point that defines one end of the line
   * @param b - point that defines the other end of the line
   * @returns true if p1 and p2 are on the same side of the line, or false
   * otherwise
   */
  static arePointsOnSameSideOfLine(p1, p2, a, b) {
    const cp1 = (b.x - a.x) * (p1.y - a.y) - (b.y - a.y) * (p1.x - a.x);
    const cp2 = (b.x - a.x) * (p2.y - a.y) - (b.y - a.y) * (p2.x - a.x);
    return cp1 * cp2 >= 0;
  }
  /**
   * Checks if a point is inside a rectangle.
   *
   * @remarks The rectangle may have been rotated (sides might not be parallel
   * to the axes).
   *
   * @param point - The Point to check
   * @param rect - An array of four Points representing the vertices of the
   * rectangle in clockwise order
   * @returns true if the Point is inside the rectangle
   */
  static isPointInsideRectangle(point, rect) {
    if (rect.length !== 4) {
      throw new Error("Invalid input: expected an array of four points");
    }
    return M2c2KitHelpers.arePointsOnSameSideOfLine(
      point,
      rect[2],
      rect[0],
      rect[1]
    ) && M2c2KitHelpers.arePointsOnSameSideOfLine(
      point,
      rect[3],
      rect[1],
      rect[2]
    ) && M2c2KitHelpers.arePointsOnSameSideOfLine(
      point,
      rect[0],
      rect[2],
      rect[3]
    ) && M2c2KitHelpers.arePointsOnSameSideOfLine(point, rect[1], rect[3], rect[0]);
  }
  /**
   * Checks if the entity or any of its ancestors have been rotated.
   *
   * @param entity - entity to check
   * @returns true if the entity or any of its ancestors have been rotated
   */
  static entityOrAncestorHasBeenRotated(entity) {
    const entities = entity.ancestors;
    entities.push(entity);
    return entities.some((entity2) => entityNeedsRotation(entity2));
  }
  /**
   * Converts a bounding box to an array of four points representing the
   * vertices of the rectangle.
   *
   * @remarks In m2c2kit, the y-axis is inverted: origin is in the upper-left.
   * Vertices are returned in clockwise order starting from the upper-left.
   *
   * @param boundingBox
   * @returns An array of four points
   */
  static boundingBoxToPoints(boundingBox) {
    const { xMin, xMax, yMin, yMax } = boundingBox;
    const points = [
      { x: xMin, y: yMin },
      // Top left
      { x: xMax, y: yMin },
      // Top right
      { x: xMax, y: yMax },
      // Bottom right
      { x: xMin, y: yMax }
      // Bottom left
    ];
    return points;
  }
  /**
   * Finds the centroid of a rectangle.
   *
   * @param points - An array of four points representing the vertices of the
   * rectangle.
   * @returns array of points representing the centroid of the rectangle.
   */
  static findCentroid(points) {
    if (points.length !== 4) {
      throw new Error("Invalid input: expected an array of four points");
    }
    let xSum = 0;
    let ySum = 0;
    for (const point of points) {
      xSum += point.x;
      ySum += point.y;
    }
    const xAvg = xSum / 4;
    const yAvg = ySum / 4;
    return { x: xAvg, y: yAvg };
  }
  /**
   * Rotates a point, counterclockwise, around another point by an angle in
   * radians.
   *
   * @param point - Point to rotate
   * @param radians - angle in radians
   * @param center - Point to rotate around
   * @returns rotated point
   */
  static rotatePoint(point, radians, center) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const x = dx * Math.cos(-radians) - dy * Math.sin(-radians);
    const y = dx * Math.sin(-radians) + dy * Math.cos(-radians);
    return {
      x: x + center.x,
      y: y + center.y
    };
  }
  /**
   * Calculates the rotation transforms to apply to entity, respecting any
   * ancestor rotations.
   *
   * @param drawableEntity - entity to calculate rotation transforms for
   * @returns array of rotation transforms to apply
   */
  static calculateRotationTransforms(drawableEntity) {
    const rotationTransforms = [];
    const entities = drawableEntity.ancestors;
    entities.reverse();
    entities.push(drawableEntity);
    entities.forEach((entity) => {
      if (entityNeedsRotation(entity)) {
        const drawable = entity;
        if (drawable.type === EntityType.Scene) {
          const center2 = {
            x: drawable.absolutePosition.x + drawable.size.width * 0.5,
            y: drawable.absolutePosition.y + drawable.size.height * 0.5
          };
          rotationTransforms.push({
            radians: drawable.zRotation,
            center: center2
          });
          return;
        }
        const boundingBox = M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(drawable);
        const points = M2c2KitHelpers.boundingBoxToPoints(boundingBox);
        const center = M2c2KitHelpers.findCentroid(points);
        rotationTransforms.push({
          radians: drawable.zRotation,
          center
        });
      }
    });
    return rotationTransforms;
  }
}
function applyRotationTransformsToCanvas(rotationTransforms, scale, canvas) {
  rotationTransforms.forEach((transform) => {
    canvas.rotate(
      M2c2KitHelpers.radiansToDegrees(transform.radians),
      transform.center.x * scale,
      transform.center.y * scale
    );
  });
}
function entityNeedsRotation(entity) {
  return M2c2KitHelpers.normalizeAngleRadians(entity.zRotation) !== 0 && entity.isDrawable;
}
function rotateRectangle(rect, radians, center) {
  if (rect.length !== 4) {
    throw new Error("Invalid input: expected an array of four points");
  }
  const rotated = [];
  for (const p of rect) {
    rotated.push(M2c2KitHelpers.rotatePoint(p, radians, center));
  }
  return rotated;
}
class Action {
  constructor(runDuringTransition = false) {
    this.startOffset = -1;
    this.endOffset = -1;
    this.started = false;
    this.running = false;
    this.completed = false;
    this.runStartTime = -1;
    this.duration = 0;
    this.isParent = false;
    this.isChild = false;
    this.runDuringTransition = runDuringTransition;
  }
  /**
   * Creates an action that will move an entity to a point on the screen.
   *
   * @param options - {@link MoveActionOptions}
   * @returns The move action
   */
  static move(options) {
    return new MoveAction(
      options.point,
      options.duration,
      options.easing ?? Easings.linear,
      options.runDuringTransition ?? false
    );
  }
  /**
   * Creates an action that will wait a given duration before it is considered complete.
   *
   * @param options - {@link WaitActionOptions}
   * @returns The wait action
   */
  static wait(options) {
    return new WaitAction(
      options.duration,
      options.runDuringTransition ?? false
    );
  }
  /**
   * Creates an action that will execute a callback function.
   *
   * @param options - {@link CustomActionOptions}
   * @returns The custom action
   */
  static custom(options) {
    return new CustomAction(
      options.callback,
      options.runDuringTransition ?? false
    );
  }
  /**
   * Creates an action that will scale the entity's size.
   *
   * @remarks Scaling is relative to any inherited scaling, which is multiplicative. For example, if the entity's parent is scaled to 2.0 and this entity's action scales to 3.0, then the entity will appear 6 times as large as original.
   *
   * @param options - {@link ScaleActionOptions}
   * @returns The scale action
   */
  static scale(options) {
    return new ScaleAction(
      options.scale,
      options.duration,
      options.runDuringTransition
    );
  }
  /**
   * Creates an action that will change the entity's alpha (opacity).
   *
   * @remarks Alpha has multiplicative inheritance. For example, if the entity's parent is alpha .5 and this entity's action fades alpha to .4, then the entity will appear with alpha .2.
   *
   * @param options - {@link FadeAlphaActionOptions}
   * @returns The fadeAlpha action
   */
  static fadeAlpha(options) {
    return new FadeAlphaAction(
      options.alpha,
      options.duration,
      options.runDuringTransition
    );
  }
  /**
   * Creates an action that will rotate the entity.
   *
   * @remarks Rotate actions are applied to their children. In addition to this entity's rotate action, all ancestors' rotate actions will also be applied.
   *
   * @param options - {@link RotateActionOptions}
   * @returns The rotate action
   */
  static rotate(options) {
    if (options.byAngle !== void 0 && options.toAngle !== void 0) {
      throw new Error("rotate Action: cannot specify both byAngle and toAngle");
    }
    if (options.byAngle === void 0 && options.toAngle === void 0) {
      throw new Error("rotate Action: must specify either byAngle or toAngle");
    }
    if (options.toAngle === void 0 && options.shortestUnitArc !== void 0) {
      throw new Error(
        "rotate Action: shortestUnitArc can only be specified when toAngle is provided"
      );
    }
    if (options.toAngle !== void 0 && options.shortestUnitArc === void 0) {
      options.shortestUnitArc = true;
    }
    return new RotateAction(
      options.byAngle,
      options.toAngle,
      options.shortestUnitArc,
      options.duration,
      options.runDuringTransition
    );
  }
  /**
   * Creates an array of actions that will be run in order.
   *
   * @remarks The next action will not begin until the current one has finished. The sequence will be considered completed when the last action has completed.
   *
   * @param actions - One or more actions that form the sequence
   * @returns
   */
  static sequence(actions) {
    const sequence = new SequenceAction(actions);
    sequence.children = actions;
    return sequence;
  }
  /**
   * Create an array of actions that will be run simultaneously.
   *
   * @remarks All actions within the group will begin to run at the same time. The group will be considered completed when the longest-running action has completed.
   *
   * @param actions - One or more actions that form the group
   * @returns
   */
  static group(actions) {
    const group = new GroupAction(actions);
    group.children = actions;
    return group;
  }
  initialize(entity, key) {
    this.assignParents(this, this, key);
    const actions = this.flattenActions(this);
    actions.forEach(
      (action) => action.duration = this.calculateDuration(action)
    );
    this.calculateStartEndOffsets(this);
    const clonedActions = actions.filter(
      (action) => action.type !== ActionType.Group && action.type !== ActionType.Sequence
    ).map((action) => {
      return Action.cloneAction(action, key);
    });
    return clonedActions;
  }
  static cloneAction(action, key) {
    let cloned;
    switch (action.type) {
      case ActionType.Sequence: {
        const sequence = action;
        const sequenceChildren = sequence.children.map(
          (child) => Action.cloneAction(child, key)
        );
        cloned = Action.sequence(sequenceChildren);
        break;
      }
      case ActionType.Group: {
        const group = action;
        const groupChildren = group.children.map(
          (child) => Action.cloneAction(child, key)
        );
        cloned = Action.sequence(groupChildren);
        break;
      }
      case ActionType.Move: {
        const move = action;
        cloned = Action.move({
          point: move.point,
          duration: move.duration,
          easing: move.easing,
          runDuringTransition: move.runDuringTransition
        });
        break;
      }
      case ActionType.Custom: {
        const code = action;
        cloned = Action.custom({
          callback: code.callback,
          runDuringTransition: code.runDuringTransition
        });
        break;
      }
      case ActionType.Scale: {
        const scale = action;
        cloned = Action.scale({
          scale: scale.scale,
          duration: scale.duration,
          runDuringTransition: scale.runDuringTransition
        });
        break;
      }
      case ActionType.FadeAlpha: {
        const fadeAlpha = action;
        cloned = Action.fadeAlpha({
          alpha: fadeAlpha.alpha,
          duration: fadeAlpha.duration,
          runDuringTransition: fadeAlpha.runDuringTransition
        });
        break;
      }
      case ActionType.Rotate: {
        const rotate = action;
        cloned = Action.rotate({
          byAngle: rotate.byAngle,
          toAngle: rotate.toAngle,
          shortestUnitArc: rotate.shortestUnitArc,
          duration: rotate.duration,
          runDuringTransition: rotate.runDuringTransition
        });
        break;
      }
      case ActionType.Wait: {
        const wait = action;
        cloned = Action.wait({
          duration: wait.duration,
          runDuringTransition: wait.runDuringTransition
        });
        break;
      }
      default:
        throw new Error("unknown action");
    }
    if (key !== void 0) {
      cloned.key = key;
    }
    cloned.startOffset = action.startOffset;
    cloned.endOffset = action.endOffset;
    return cloned;
  }
  static evaluateAction(action, entity, now, dt) {
    if (now < action.runStartTime + action.startOffset) {
      return;
    }
    if (now >= action.runStartTime + action.startOffset && now <= action.runStartTime + action.startOffset + action.duration) {
      action.running = true;
    } else {
      action.running = false;
    }
    if (action.running === false && action.completed === true) {
      return;
    }
    const elapsed = now - (action.runStartTime + action.startOffset);
    if (action.type === ActionType.Custom) {
      const customAction = action;
      customAction.callback();
      customAction.running = false;
      customAction.completed = true;
    }
    if (action.type === ActionType.Wait) {
      const waitAction = action;
      if (now > action.runStartTime + action.startOffset + action.duration) {
        waitAction.running = false;
        waitAction.completed = true;
      }
    }
    if (action.type === ActionType.Move) {
      const moveAction = action;
      if (!moveAction.started) {
        moveAction.dx = moveAction.point.x - entity.position.x;
        moveAction.dy = moveAction.point.y - entity.position.y;
        moveAction.startPoint.x = entity.position.x;
        moveAction.startPoint.y = entity.position.y;
        moveAction.started = true;
      }
      if (elapsed < moveAction.duration) {
        entity.position.x = moveAction.easing(
          elapsed,
          moveAction.startPoint.x,
          moveAction.dx,
          moveAction.duration
        );
        entity.position.y = moveAction.easing(
          elapsed,
          moveAction.startPoint.y,
          moveAction.dy,
          moveAction.duration
        );
      } else {
        entity.position.x = moveAction.point.x;
        entity.position.y = moveAction.point.y;
        moveAction.running = false;
        moveAction.completed = true;
      }
    }
    if (action.type === ActionType.Scale) {
      const scaleAction = action;
      if (!scaleAction.started) {
        scaleAction.delta = scaleAction.scale - entity.scale;
        scaleAction.started = true;
      }
      if (elapsed < scaleAction.duration) {
        entity.scale = entity.scale + scaleAction.delta * (dt / scaleAction.duration);
      } else {
        entity.scale = scaleAction.scale;
        scaleAction.running = false;
        scaleAction.completed = true;
      }
    }
    if (action.type === ActionType.FadeAlpha) {
      const fadeAlphaAction = action;
      if (!fadeAlphaAction.started) {
        fadeAlphaAction.delta = fadeAlphaAction.alpha - entity.alpha;
        fadeAlphaAction.started = true;
      }
      if (elapsed < fadeAlphaAction.duration) {
        entity.alpha = entity.alpha + fadeAlphaAction.delta * (dt / fadeAlphaAction.duration);
      } else {
        entity.alpha = fadeAlphaAction.alpha;
        fadeAlphaAction.running = false;
        fadeAlphaAction.completed = true;
      }
    }
    if (action.type === ActionType.Rotate) {
      const rotateAction = action;
      if (!rotateAction.started) {
        if (rotateAction.byAngle !== void 0) {
          rotateAction.delta = rotateAction.byAngle;
        }
        if (rotateAction.toAngle !== void 0) {
          rotateAction.toAngle = M2c2KitHelpers.normalizeAngleRadians(
            rotateAction.toAngle
          );
          entity.zRotation = M2c2KitHelpers.normalizeAngleRadians(
            entity.zRotation
          );
          rotateAction.delta = rotateAction.toAngle - entity.zRotation;
          if (rotateAction.shortestUnitArc === true && Math.abs(rotateAction.delta) > Math.PI) {
            rotateAction.delta = 2 * Math.PI - Math.abs(rotateAction.delta);
          }
        }
        rotateAction.started = true;
        rotateAction.finalValue = entity.zRotation + rotateAction.delta;
      }
      if (elapsed < rotateAction.duration) {
        entity.zRotation = entity.zRotation + rotateAction.delta * (dt / rotateAction.duration);
        if (rotateAction.delta <= 0 && entity.zRotation < rotateAction.finalValue) {
          entity.zRotation = rotateAction.finalValue;
        }
        if (rotateAction.delta > 0 && entity.zRotation > rotateAction.finalValue) {
          entity.zRotation = rotateAction.finalValue;
        }
      } else {
        entity.zRotation = rotateAction.finalValue;
        rotateAction.running = false;
        rotateAction.completed = true;
      }
    }
  }
  /**
   * Calculates the duration of an action, including any children actions
   * the action may contain.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action
   * @returns the calculated duration
   */
  calculateDuration(action) {
    if (action.type === ActionType.Group) {
      const groupAction = action;
      const duration = groupAction.children.map((child) => this.calculateDuration(child)).reduce((max, dur) => {
        return Math.max(max, dur);
      }, 0);
      return duration;
    }
    if (action.type === ActionType.Sequence) {
      const sequenceAction = action;
      const duration = sequenceAction.children.map((child) => this.calculateDuration(child)).reduce((sum, dur) => {
        return sum + dur;
      }, 0);
      return duration;
    }
    return action.duration;
  }
  /**
   * Update each action's start and end offsets.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions.
   *
   * @param action that needs assigning start and end offsets
   */
  calculateStartEndOffsets(action) {
    let parentStartOffset;
    if (action.parent === void 0) {
      parentStartOffset = 0;
    } else {
      parentStartOffset = action.parent.startOffset;
    }
    if (action.parent?.type === ActionType.Group) {
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    } else if (action.parent?.type === ActionType.Sequence) {
      const parent = action.parent;
      let dur = 0;
      for (const a of parent.children) {
        if (a === action) {
          break;
        }
        dur = dur + a.duration;
      }
      action.startOffset = parentStartOffset + dur;
      action.endOffset = action.startOffset + action.duration;
    } else {
      action.startOffset = 0;
      action.endOffset = action.startOffset + action.duration;
    }
    if (action.isParent) {
      action.children?.forEach(
        (child) => this.calculateStartEndOffsets(child)
      );
    }
  }
  /**
   * Takes an action hierarchy and flattens to an array of non-nested actions
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action - the action to flatten
   * @param actions - the accumulator array of flattened actions. This will be
   * undefined on the first call, and an array on recursive calls
   * @returns flattened array of actions
   */
  flattenActions(action, actions) {
    if (!actions) {
      actions = new Array();
      actions.push(action);
    }
    if (action.isParent) {
      const parent = action;
      const children = parent.children;
      actions.push(...children);
      parent.children.filter((child) => child.isParent).forEach((child) => this.flattenActions(child, actions));
    }
    return actions;
  }
  /**
   * Parses the action hierarchy and assigns each action its parent and
   * root action.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action
   * @param rootAction - top-level action passed to the run method
   * @param key - optional string to identify an action
   */
  assignParents(action, rootAction, key) {
    if (key !== void 0) {
      action.key = key;
    }
    if (action.isParent) {
      const parent = action;
      const children = parent.children;
      children.forEach((child) => {
        child.parent = action;
        child.isChild = true;
      });
      parent.children.filter((child) => child.isParent).forEach((child) => this.assignParents(child, rootAction, key));
    }
  }
}
class SequenceAction extends Action {
  constructor(actions) {
    super();
    this.type = ActionType.Sequence;
    this.children = actions;
    this.isParent = true;
  }
}
class GroupAction extends Action {
  constructor(actions) {
    super();
    this.type = ActionType.Group;
    this.children = new Array();
    this.children = actions;
    this.isParent = true;
  }
}
class CustomAction extends Action {
  constructor(callback, runDuringTransition = false) {
    super(runDuringTransition);
    this.type = ActionType.Custom;
    this.callback = callback;
    this.isParent = false;
    this.duration = 0;
  }
}
class WaitAction extends Action {
  constructor(duration, runDuringTransition) {
    super(runDuringTransition);
    this.type = ActionType.Wait;
    this.duration = duration;
    this.isParent = false;
  }
}
class MoveAction extends Action {
  constructor(point, duration, easing, runDuringTransition) {
    super(runDuringTransition);
    this.type = ActionType.Move;
    this.dx = 0;
    this.dy = 0;
    this.duration = duration;
    this.point = point;
    this.isParent = false;
    this.startPoint = { x: NaN, y: NaN };
    this.easing = easing;
  }
}
class ScaleAction extends Action {
  constructor(scale, duration, runDuringTransition = false) {
    super(runDuringTransition);
    this.type = ActionType.Scale;
    this.delta = 0;
    this.duration = duration;
    this.scale = scale;
    this.isParent = false;
  }
}
class FadeAlphaAction extends Action {
  constructor(alpha, duration, runDuringTransition = false) {
    super(runDuringTransition);
    this.type = ActionType.FadeAlpha;
    this.delta = 0;
    this.duration = duration;
    this.alpha = alpha;
    this.isParent = false;
  }
}
class RotateAction extends Action {
  constructor(byAngle, toAngle, shortestUnitArc, duration, runDuringTransition = false) {
    super(runDuringTransition);
    this.type = ActionType.Rotate;
    this.delta = 0;
    this.finalValue = NaN;
    this.duration = duration;
    this.byAngle = byAngle;
    this.toAngle = toAngle;
    this.shortestUnitArc = shortestUnitArc;
    this.isParent = false;
  }
}
var ActivityType = /* @__PURE__ */ ((ActivityType2) => {
  ActivityType2["Game"] = "Game";
  ActivityType2["Survey"] = "Survey";
  return ActivityType2;
})(ActivityType || {});
class CanvasKitHelpers {
  /**
   * Frees up resources that were allocated by CanvasKit.
   *
   * @remarks This frees objects created in WebAssembly by
   * canvaskit-wasm. JavaScript garbage collection won't
   * free these wasm objects.
   */
  static Dispose(objects) {
    objects.filter((o) => !o?.isDeleted()).forEach((o) => o?.delete());
  }
  static makePaint(canvasKit, color, style, isAntialiased) {
    const paint = new canvasKit.Paint();
    paint.setColor(canvasKit.Color(color[0], color[1], color[2], color[3]));
    paint.setStyle(style);
    paint.setAntiAlias(isAntialiased);
    return paint;
  }
}
class WebColors {
}
WebColors.Transparent = [0, 0, 0, 0];
WebColors.MediumVioletRed = [199, 21, 133, 1];
WebColors.DeepPink = [255, 20, 147, 1];
WebColors.PaleVioletRed = [219, 112, 147, 1];
WebColors.HotPink = [255, 105, 180, 1];
WebColors.LightPink = [255, 182, 193, 1];
WebColors.Pink = [255, 192, 203, 1];
WebColors.DarkRed = [139, 0, 0, 1];
WebColors.Red = [255, 0, 0, 1];
WebColors.Firebrick = [178, 34, 34, 1];
WebColors.Crimson = [220, 20, 60, 1];
WebColors.IndianRed = [205, 92, 92, 1];
WebColors.LightCoral = [240, 128, 128, 1];
WebColors.Salmon = [250, 128, 114, 1];
WebColors.DarkSalmon = [233, 150, 122, 1];
WebColors.LightSalmon = [255, 160, 122, 1];
WebColors.OrangeRed = [255, 69, 0, 1];
WebColors.Tomato = [255, 99, 71, 1];
WebColors.DarkOrange = [255, 140, 0, 1];
WebColors.Coral = [255, 127, 80, 1];
WebColors.Orange = [255, 165, 0, 1];
WebColors.DarkKhaki = [189, 183, 107, 1];
WebColors.Gold = [255, 215, 0, 1];
WebColors.Khaki = [240, 230, 140, 1];
WebColors.PeachPuff = [255, 218, 185, 1];
WebColors.Yellow = [255, 255, 0, 1];
WebColors.PaleGoldenrod = [238, 232, 170, 1];
WebColors.Moccasin = [255, 228, 181, 1];
WebColors.PapayaWhip = [255, 239, 213, 1];
WebColors.LightGoldenrodYellow = [250, 250, 210, 1];
WebColors.LemonChiffon = [255, 250, 205, 1];
WebColors.LightYellow = [255, 255, 224, 1];
WebColors.Maroon = [128, 0, 0, 1];
WebColors.Brown = [165, 42, 42, 1];
WebColors.SaddleBrown = [139, 69, 19, 1];
WebColors.Sienna = [160, 82, 45, 1];
WebColors.Chocolate = [210, 105, 30, 1];
WebColors.DarkGoldenrod = [184, 134, 11, 1];
WebColors.Peru = [205, 133, 63, 1];
WebColors.RosyBrown = [188, 143, 143, 1];
WebColors.Goldenrod = [218, 165, 32, 1];
WebColors.SandyBrown = [244, 164, 96, 1];
WebColors.Tan = [210, 180, 140, 1];
WebColors.Burlywood = [222, 184, 135, 1];
WebColors.Wheat = [245, 222, 179, 1];
WebColors.NavajoWhite = [255, 222, 173, 1];
WebColors.Bisque = [255, 228, 196, 1];
WebColors.BlanchedAlmond = [255, 235, 205, 1];
WebColors.Cornsilk = [255, 248, 220, 1];
WebColors.DarkGreen = [0, 100, 0, 1];
WebColors.Green = [0, 128, 0, 1];
WebColors.DarkOliveGreen = [85, 107, 47, 1];
WebColors.ForestGreen = [34, 139, 34, 1];
WebColors.SeaGreen = [46, 139, 87, 1];
WebColors.Olive = [128, 128, 0, 1];
WebColors.OliveDrab = [107, 142, 35, 1];
WebColors.MediumSeaGreen = [60, 179, 113, 1];
WebColors.LimeGreen = [50, 205, 50, 1];
WebColors.Lime = [0, 255, 0, 1];
WebColors.SpringGreen = [0, 255, 127, 1];
WebColors.MediumSpringGreen = [0, 250, 154, 1];
WebColors.DarkSeaGreen = [143, 188, 143, 1];
WebColors.MediumAquamarine = [102, 205, 170, 1];
WebColors.YellowGreen = [154, 205, 50, 1];
WebColors.LawnGreen = [124, 252, 0, 1];
WebColors.Chartreuse = [127, 255, 0, 1];
WebColors.LightGreen = [144, 238, 144, 1];
WebColors.GreenYellow = [173, 255, 47, 1];
WebColors.PaleGreen = [152, 251, 152, 1];
WebColors.Teal = [0, 128, 128, 1];
WebColors.DarkCyan = [0, 139, 139, 1];
WebColors.LightSeaGreen = [32, 178, 170, 1];
WebColors.CadetBlue = [95, 158, 160, 1];
WebColors.DarkTurquoise = [0, 206, 209, 1];
WebColors.MediumTurquoise = [72, 209, 204, 1];
WebColors.Turquoise = [64, 224, 208, 1];
WebColors.Aqua = [0, 255, 255, 1];
WebColors.Cyan = [0, 255, 255, 1];
WebColors.Aquamarine = [127, 255, 212, 1];
WebColors.PaleTurquoise = [175, 238, 238, 1];
WebColors.LightCyan = [224, 255, 255, 1];
WebColors.Navy = [0, 0, 128, 1];
WebColors.DarkBlue = [0, 0, 139, 1];
WebColors.MediumBlue = [0, 0, 205, 1];
WebColors.Blue = [0, 0, 255, 1];
WebColors.MidnightBlue = [25, 25, 112, 1];
WebColors.RoyalBlue = [65, 105, 225, 1];
WebColors.SteelBlue = [70, 130, 180, 1];
WebColors.DodgerBlue = [30, 144, 255, 1];
WebColors.DeepSkyBlue = [0, 191, 255, 1];
WebColors.CornflowerBlue = [100, 149, 237, 1];
WebColors.SkyBlue = [135, 206, 235, 1];
WebColors.LightSkyBlue = [135, 206, 250, 1];
WebColors.LightSteelBlue = [176, 196, 222, 1];
WebColors.LightBlue = [173, 216, 230, 1];
WebColors.PowderBlue = [176, 224, 230, 1];
WebColors.Indigo = [75, 0, 130, 1];
WebColors.Purple = [128, 0, 128, 1];
WebColors.DarkMagenta = [139, 0, 139, 1];
WebColors.DarkViolet = [148, 0, 211, 1];
WebColors.DarkSlateBlue = [72, 61, 139, 1];
WebColors.BlueViolet = [138, 43, 226, 1];
WebColors.DarkOrchid = [153, 50, 204, 1];
WebColors.Fuchsia = [255, 0, 255, 1];
WebColors.Magenta = [255, 0, 255, 1];
WebColors.SlateBlue = [106, 90, 205, 1];
WebColors.MediumSlateBlue = [123, 104, 238, 1];
WebColors.MediumOrchid = [186, 85, 211, 1];
WebColors.MediumPurple = [147, 112, 219, 1];
WebColors.Orchid = [218, 112, 214, 1];
WebColors.Violet = [238, 130, 238, 1];
WebColors.Plum = [221, 160, 221, 1];
WebColors.Thistle = [216, 191, 216, 1];
WebColors.Lavender = [230, 230, 250, 1];
WebColors.MistyRose = [255, 228, 225, 1];
WebColors.AntiqueWhite = [250, 235, 215, 1];
WebColors.Linen = [250, 240, 230, 1];
WebColors.Beige = [245, 245, 220, 1];
WebColors.WhiteSmoke = [245, 245, 245, 1];
WebColors.LavenderBlush = [255, 240, 245, 1];
WebColors.OldLace = [253, 245, 230, 1];
WebColors.AliceBlue = [240, 248, 255, 1];
WebColors.Seashell = [255, 245, 238, 1];
WebColors.GhostWhite = [248, 248, 255, 1];
WebColors.Honeydew = [240, 255, 240, 1];
WebColors.FloralWhite = [255, 250, 240, 1];
WebColors.Azure = [240, 255, 255, 1];
WebColors.MintCream = [245, 255, 250, 1];
WebColors.Snow = [255, 250, 250, 1];
WebColors.Ivory = [255, 255, 240, 1];
WebColors.White = [255, 255, 255, 1];
WebColors.Black = [0, 0, 0, 1];
WebColors.DarkSlateGray = [47, 79, 79, 1];
WebColors.DimGray = [105, 105, 105, 1];
WebColors.SlateGray = [112, 128, 144, 1];
WebColors.Gray = [128, 128, 128, 1];
WebColors.LightSlateGray = [119, 136, 153, 1];
WebColors.DarkGray = [169, 169, 169, 1];
WebColors.Silver = [192, 192, 192, 1];
WebColors.LightGray = [211, 211, 211, 1];
WebColors.Gainsboro = [220, 220, 220, 1];
WebColors.RebeccaPurple = [102, 51, 153, 1];
class Constants {
}
Constants.FPS_DISPLAY_TEXT_FONT_SIZE = 12;
Constants.FPS_DISPLAY_TEXT_COLOR = [0, 0, 0, 0.5];
Constants.FPS_DISPLAY_UPDATE_INTERVAL = 1e3;
Constants.MAXIMUM_RECORDED_ACTIVITY_METRICS = 32;
Constants.FPS_METRIC_REPORT_THRESHOLD = 59;
Constants.DEFAULT_SCENE_BACKGROUND_COLOR = WebColors.White;
Constants.DEFAULT_SHAPE_FILL_COLOR = WebColors.Red;
Constants.DEFAULT_PATH_STROKE_COLOR = WebColors.Red;
Constants.DEFAULT_PATH_LINE_WIDTH = 2;
Constants.DEFAULT_FONT_COLOR = WebColors.Black;
Constants.DEFAULT_FONT_SIZE = 16;
Constants.LIMITED_FPS_RATE = 5;
Constants.FREE_ENTITIES_SCENE_NAME = "__freeEntitiesScene";
Constants.OUTGOING_SCENE_NAME = "__outgoingScene";
Constants.OUTGOING_SCENE_SPRITE_NAME = "__outgoingSceneSprite";
Constants.OUTGOING_SCENE_IMAGE_NAME = "__outgoingSceneSnapshot";
Constants.SESSION_INITIALIZATION_POLLING_INTERVAL_MS = 50;
Constants.EMPTY_MODULE_METADATA = {
  name: "",
  version: "",
  dependencies: {}
};
class GlobalVariables {
  constructor() {
    this.now = NaN;
    this.deltaTime = NaN;
    this.canvasScale = NaN;
    this.rootScale = 1;
    this.canvasCssWidth = NaN;
    this.canvasCssHeight = NaN;
  }
}
if (!window.globalThis) {
  console.log("shimming globalThis");
  window.globalThis = window;
}
globalThis.Globals = new GlobalVariables();
var ConstraintType = /* @__PURE__ */ ((ConstraintType2) => {
  ConstraintType2["topToTopOf"] = "topToTopOf";
  ConstraintType2["topToBottomOf"] = "topToBottomOf";
  ConstraintType2["bottomToTopOf"] = "bottomToTopOf";
  ConstraintType2["bottomToBottomOf"] = "bottomToBottomOf";
  ConstraintType2["startToStartOf"] = "startToStartOf";
  ConstraintType2["startToEndOf"] = "startToEndOf";
  ConstraintType2["endToEndOf"] = "endToEndOf";
  ConstraintType2["endToStartOf"] = "endToStartOf";
  return ConstraintType2;
})(ConstraintType || {});
class LayoutConstraint {
  constructor(type, alterEntity) {
    this.verticalConstraint = false;
    this.focalEntityMinimum = false;
    this.alterEntityMinimum = false;
    this.verticalTypes = [
      ConstraintType.topToTopOf,
      ConstraintType.topToBottomOf,
      ConstraintType.bottomToTopOf,
      ConstraintType.bottomToBottomOf
    ];
    this.focalEntityMinimumTypes = [
      ConstraintType.topToTopOf,
      ConstraintType.topToBottomOf,
      ConstraintType.startToStartOf,
      ConstraintType.startToEndOf
    ];
    this.alterEntityMinimumTypes = [
      ConstraintType.topToTopOf,
      ConstraintType.bottomToTopOf,
      ConstraintType.startToStartOf,
      ConstraintType.endToStartOf
    ];
    this.type = type;
    this.alterEntity = alterEntity;
    if (this.verticalTypes.includes(type)) {
      this.verticalConstraint = true;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    } else {
      this.verticalConstraint = false;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    }
  }
}
class Uuid {
  static generate() {
    try {
      return crypto.randomUUID();
    } catch {
      let randomValue;
      try {
        randomValue = () => crypto.getRandomValues(new Uint8Array(1))[0];
      } catch {
        randomValue = () => Math.floor(Math.random() * 256);
      }
      return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g,
        (c) => (Number(c) ^ randomValue() & 15 >> Number(c) / 4).toString(16)
      );
    }
  }
}
const EventType = {
  SessionInitialize: "SessionInitialize",
  SessionStart: "SessionStart",
  SessionEnd: "SessionEnd",
  ActivityStart: "ActivityStart",
  ActivityEnd: "ActivityEnd",
  ActivityCancel: "ActivityCancel",
  ActivityData: "ActivityData",
  TapDown: "TapDown",
  TapUp: "TapUp",
  TapUpAny: "TapUpAny",
  TapLeave: "TapLeave",
  PointerDown: "PointerDown",
  PointerUp: "PointerUp",
  PointerMove: "PointerMove",
  PointerLeave: "PointerLeave",
  Drag: "Drag",
  DragStart: "DragStart",
  DragEnd: "DragEnd",
  CompositeCustom: "CompositeCustom",
  FrameDidSimulatePhysics: "FrameDidSimulatePhysics"
};
function handleDrawableOptions(drawable, options) {
  if (options.anchorPoint) {
    drawable.anchorPoint = options.anchorPoint;
  }
  if (options.zPosition !== void 0) {
    drawable.zPosition = options.zPosition;
  }
}
function handleTextOptions(text, options) {
  if (options.text !== void 0) {
    text.text = options.text;
  }
  if (options.fontName !== void 0) {
    text.fontName = options.fontName;
  }
  if (options.fontColor) {
    text.fontColor = options.fontColor;
  }
  if (options.fontSize !== void 0) {
    text.fontSize = options.fontSize;
  }
}
function handleInterfaceOptions(entity, options) {
  if (entity.isDrawable) {
    handleDrawableOptions(
      entity,
      options
    );
  }
  if (entity.isText) {
    handleTextOptions(entity, options);
  }
}
class Entity {
  constructor(options = {}) {
    this.type = EntityType.Entity;
    this.isDrawable = false;
    this.isShape = false;
    this.isText = false;
    this._position = { x: 0, y: 0 };
    this._scale = 1;
    this.alpha = 1;
    this._zRotation = 0;
    this.isUserInteractionEnabled = false;
    this.draggable = false;
    this.hidden = false;
    this.layout = {};
    this.children = new Array();
    this.absolutePosition = { x: 0, y: 0 };
    this.size = { width: 0, height: 0 };
    this.absoluteScale = 1;
    this.absoluteAlpha = 1;
    this.absoluteAlphaChange = 0;
    this.actions = new Array();
    this.originalActions = new Array();
    this.eventListeners = new Array();
    this.uuid = Uuid.generate();
    this.needsInitialization = true;
    this.userData = {};
    this.loopMessages = /* @__PURE__ */ new Set();
    this.pressed = false;
    this.withinHitArea = false;
    this.pressedAndWithinHitArea = false;
    this.pressedInitialPointerOffset = { x: NaN, y: NaN };
    this.draggingLastPointerOffset = { x: NaN, y: NaN };
    this.dragging = false;
    this.toString = () => {
      let type = this.type.toString();
      if (this.type == EntityType.Composite) {
        type = this.compositeType;
      }
      if (this.name !== this.uuid) {
        return `${this.name} (${type}, ${this.uuid})`;
      } else {
        return `${type} (${this.uuid})`;
      }
    };
    if (options.name === void 0) {
      this.name = this.uuid;
    } else {
      this.name = options.name;
    }
    if (options.position !== void 0) {
      this.position = options.position;
    }
    if (options.scale !== void 0) {
      this.scale = options.scale;
    }
    if (options.alpha !== void 0) {
      this.alpha = options.alpha;
    }
    if (options.zRotation !== void 0) {
      this.zRotation = options.zRotation;
    }
    if (options.isUserInteractionEnabled !== void 0) {
      this.isUserInteractionEnabled = options.isUserInteractionEnabled;
    }
    if (options.draggable !== void 0) {
      this.draggable = options.draggable;
    }
    if (options.hidden !== void 0) {
      this.hidden = options.hidden;
    }
    if (options.layout !== void 0) {
      this.layout = options.layout;
    }
  }
  // we will override this in each derived class. This method will never be called.
  initialize() {
    throw new Error("initialize() called in abstract base class Entity.");
  }
  /**
   * The game which this entity is a part of.
   *
   * @remarks Throws error if entity is not part of the game object.
   */
  get game() {
    const findParentScene = (entity) => {
      if (!entity.parent) {
        throw new Error(`Entity ${this} has not been added to a scene.`);
      } else if (entity.parent.type === EntityType.Scene) {
        return entity.parent;
      } else {
        return findParentScene(entity.parent);
      }
    };
    return findParentScene(this).game;
  }
  /**
   * Determines if the entity has been added to the game object.
   *
   * @returns true if entity has been added
   */
  isPartOfGame() {
    if (this.type === EntityType.Scene && this._game === void 0) {
      return false;
    }
    if (this.type === EntityType.Scene && this._game !== void 0) {
      return true;
    }
    const findParentScene = (entity) => {
      if (!entity.parent) {
        return void 0;
      } else if (entity.parent.type === EntityType.Scene) {
        return entity.parent;
      } else {
        return findParentScene(entity.parent);
      }
    };
    return findParentScene(this)?._game !== void 0;
  }
  /**
   * Adds a child to this parent entity. Throws exception if the child's name
   * is not unique with respect to other children of this parent, or if the
   * child has already been added to another parent.
   *
   * @param child - The child entity to add
   */
  addChild(child) {
    if (child === this) {
      throw new Error(
        `Cannot add entity ${child.toString()} as a child to itself.`
      );
    }
    if (child.type == EntityType.Scene) {
      throw new Error(
        `Cannot add scene ${child.toString()} as a child to entity ${this.toString()}. A scene cannot be the child of an entity. A scene can only be added to a game object.`
      );
    }
    if (this.children.filter((c) => c !== child).map((c) => c.name).includes(child.name)) {
      throw new Error(
        `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. A child with name "${child.name}" already exists on this parent.`
      );
    }
    let otherParents = new Array();
    if (this.isPartOfGame()) {
      otherParents = this.game.entities.filter(
        (e) => e.children.includes(child)
      );
    } else {
      const descendants = this.descendants;
      if (descendants.includes(child)) {
        otherParents = descendants.filter((d) => d.children.includes(child)).map((d) => d.parent ?? void 0);
      }
    }
    if (otherParents.length === 0) {
      child.parent = this;
      this.children.push(child);
      return;
    }
    const firstOtherParent = otherParents.find(Boolean);
    if (firstOtherParent === this) {
      throw new Error(
        `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. This child already exists on this parent. The child cannot be added again.`
      );
    }
    throw new Error(
      `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. This child already exists on other parent entity: ${firstOtherParent?.toString()}}. Remove the child from the other parent first.`
    );
  }
  /**
   * Removes all children from the entity.
   */
  removeAllChildren() {
    while (this.children.length) {
      const child = this.children.pop();
      if (child) {
        child.parent = void 0;
      }
    }
  }
  /**
   * Removes the specific child from this parent entity. Throws exception if
   * this parent does not contain the child.
   *
   * @param child
   */
  removeChild(child) {
    if (this.children.includes(child)) {
      child.parent = void 0;
      this.children = this.children.filter((c) => c !== child);
    } else {
      throw new Error(
        `cannot remove entity ${child} from parent ${this} because the entity is not currently a child of the parent`
      );
    }
  }
  /**
   * Removes the children from the parent. Throws error if the parent does not
   * contain all of the children.
   *
   * @param children - An array of children to remove from the parent entity
   */
  removeChildren(children) {
    children.forEach((child) => {
      if (!this.children.includes(child)) {
        throw new Error(
          `cannot remove entity ${child} from parent ${this} because the entity is not currently a child of the parent`
        );
      }
      child.parent = void 0;
    });
    this.children = this.children.filter((child) => !children.includes(child));
  }
  /**
   * Searches all descendants by name and returns first matching entity.
   *
   * @remarks Descendants are children and children of children, recursively.
   * Throws exception if no descendant with the given name is found.
   *
   * @param name - Name of the descendant entity to return
   * @returns
   */
  descendant(name2) {
    const descendant = this.descendants.filter((child) => child.name === name2).find(Boolean);
    if (descendant === void 0) {
      throw new Error(
        `descendant with name ${name2} not found on parent ${this.toString()}`
      );
    }
    return descendant;
  }
  /**
   * Returns all descendant entities.
   *
   * @remarks Descendants are children and children of children, recursively.
   */
  get descendants() {
    function getChildEntitiesRecursive(entity, entities2) {
      entities2.push(entity);
      entity.children.forEach(
        (child) => getChildEntitiesRecursive(child, entities2)
      );
    }
    const entities = new Array();
    this.children.forEach(
      (child) => getChildEntitiesRecursive(child, entities)
    );
    return entities;
  }
  /**
   * Returns all ancestor entities, not including the entity itself.
   */
  get ancestors() {
    function getAncestorsRecursive(entity, entities2) {
      if (entity.type == EntityType.Scene || !entity.parent) {
        return entities2;
      }
      entities2.push(entity.parent);
      return getAncestorsRecursive(entity.parent, entities2);
    }
    const entities = new Array();
    return getAncestorsRecursive(this, entities);
  }
  /**
   * Determines if this entity or ancestor is part of an active action that
   * affects it appearance.
   *
   * @remarks This is used to determine if the entity should be rendered with
   * anti-aliasing or not. Anti-aliasing on some devices causes a new shader
   * to be compiled during the action, which causes jank.
   *
   * @returns true if part of active action affecting appearance
   */
  involvedInActionAffectingAppearance() {
    const entities = this.ancestors.concat(this);
    const actions = entities.flatMap((entity) => entity.actions);
    return actions.some(
      (action) => action.running && (action.type === ActionType.Move || action.type === ActionType.Scale)
    );
  }
  /**
   * Determines if the entity is a transitioning Scene or a descendant of a
   * transitioning Scene.
   *
   * @returns true if transitioning
   */
  involvedInSceneTransition() {
    let rootScene;
    if (this.type === EntityType.Scene) {
      rootScene = this;
    } else {
      rootScene = this.parentSceneAsEntity;
    }
    return rootScene._transitioning;
  }
  /**
   * Executes a callback when the user presses down on the entity.
   *
   * @remarks TapDown is a pointer down (mouse click or touches begin) within
   * the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapDown(callback, options) {
    this.addEventListener(
      EventType.TapDown,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user releases a press, that has been fully
   * within the entity, from the entity.
   *
   * @remarks TapUp is a pointer up (mouse click release or touches end) within
   * the bounds of the entity and the pointer, while down, has never moved
   * beyond the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}ue.
   */
  onTapUp(callback, options) {
    this.addEventListener(
      EventType.TapUp,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user releases a press from the entity within
   * the bounds of the entity.
   *
   * @remarks TapUpAny is a pointer up (mouse click release or touches end)
   * within the bounds of the entity and the pointer, while down, is allowed to
   * have been beyond the bounds of the entity during the press before the
   * release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapUpAny(callback, options) {
    this.addEventListener(
      EventType.TapUpAny,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user moves the pointer (mouse, touches) beyond
   * the bounds of the entity while the pointer is down.
   *
   * @remarks TapLeave occurs when the pointer (mouse, touches) that has
   * previously pressed the entity moves beyond the bounds of the entity
   * before the press release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapLeave(callback, options) {
    this.addEventListener(
      EventType.TapLeave,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the pointer first is down on the entity.
   *
   * @remarks PointerDown is a pointer down (mouse click or touches begin) within
   * the bounds of the entity. It occurs under the same conditions as TapDown.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerDown(callback, options) {
    this.addEventListener(
      EventType.PointerDown,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user releases a press from the entity within
   * the bounds of the entity.
   *
   * @remarks PointerUp is a pointer up (mouse click release or touches end)
   * within the bounds of the entity. It does not require that there was a
   * previous PointerDown on the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerUp(callback, options) {
    this.addEventListener(
      EventType.PointerUp,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * within the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerMove(callback, options) {
    this.addEventListener(
      EventType.PointerMove,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * outside the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerLeave(callback, options) {
    this.addEventListener(
      EventType.PointerLeave,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user begins dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragStart(callback, options) {
    this.addEventListener(
      EventType.DragStart,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user continues dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDrag(callback, options) {
    this.addEventListener(
      EventType.Drag,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the user stop dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragEnd(callback, options) {
    this.addEventListener(
      EventType.DragEnd,
      callback,
      options
    );
  }
  addEventListener(type, callback, callbackOptions) {
    const eventListener = {
      type,
      entityUuid: this.uuid,
      callback
    };
    if (callbackOptions?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.entityUuid === eventListener.entityUuid && listener.type === eventListener.type)
      );
    }
    if (this.eventListeners.some((listener) => listener.type == type)) {
      console.warn(
        `game {${this.game.id}}: listener for event ${type} has already been added to this entity {${this}}. This is usually not intended.`
      );
    }
    this.eventListeners.push(eventListener);
  }
  parseLayoutConstraints(constraints, allGameEntities) {
    const layoutConstraints = new Array();
    const constraintTypes = Object.values(ConstraintType);
    constraintTypes.forEach((constraintType) => {
      if (constraints[constraintType] !== void 0) {
        let entity;
        let additionalExceptionMessage = "";
        if (typeof constraints[constraintType] === "object") {
          entity = constraints[constraintType];
        } else {
          const entityName = constraints[constraintType];
          entity = allGameEntities.filter((e) => e.name === entityName).find(Boolean);
          additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
        }
        if (entity === void 0) {
          throw new Error(
            "could not find sibling entity for constraint" + additionalExceptionMessage
          );
        }
        const layoutConstraint = new LayoutConstraint(constraintType, entity);
        layoutConstraints.push(layoutConstraint);
      }
    });
    return layoutConstraints;
  }
  calculateYFromConstraint(constraint, marginTop, marginBottom, scale) {
    let y = constraint.alterEntity.absolutePosition.y;
    if (constraint.alterEntityMinimum) {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        y = y - constraint.alterEntity.size.height * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        y = y + constraint.alterEntity.size.height * 0.5 * scale;
      } else {
        y = y + constraint.alterEntity.size.height * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
      y = y + this.size.height * 0.5 * scale;
      y = y + marginTop * scale;
    } else {
      y = y - this.size.height * 0.5 * scale;
      y = y - marginBottom * scale;
    }
    return y;
  }
  calculateXFromConstraint(constraint, marginStart, marginEnd, scale) {
    let x = constraint.alterEntity.absolutePosition.x;
    if (constraint.alterEntityMinimum) {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        x = x - constraint.alterEntity.size.width * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        x = x + constraint.alterEntity.size.width * 0.5 * scale;
      } else {
        x = x + constraint.alterEntity.size.width * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
      x = x + this.size.width * 0.5 * scale;
      x = x + marginStart * scale;
    } else {
      x = x - this.size.width * 0.5 * scale;
      x = x - marginEnd * scale;
    }
    return x;
  }
  /**
   * Calculates the absolute alpha of the entity, taking into account the
   * alpha of all ancestor parent entities.
   *
   * @remarks Alpha has multiplicative inheritance from all ancestors.
   *
   * @param alpha - Opacity of the entity
   * @param ancestors - Array of ancestor parent entities
   * @returns
   */
  calculateAbsoluteAlpha(alpha, ancestors) {
    const inheritedAlpha = ancestors.reduce((acc, ancestor) => {
      return acc * ancestor.alpha;
    }, 1);
    return alpha * inheritedAlpha;
  }
  update() {
    if (this.needsInitialization) {
      this.initialize();
      this.needsInitialization = false;
    }
    this.absoluteAlphaChange = this.calculateAbsoluteAlpha(this.alpha, this.ancestors) - this.absoluteAlpha;
    this.absoluteAlpha += this.absoluteAlphaChange;
    if (this.parent === void 0) {
      this.absolutePosition.x = this.position.x * this.scale;
      this.absolutePosition.y = this.position.y * this.scale;
      this.absoluteScale = this.scale;
    } else {
      this.absoluteScale = this.parent.absoluteScale * this.scale;
      if (this.layout?.constraints === void 0) {
        this.absolutePosition.x = this.parent.absolutePosition.x + this.position.x * this.parent.absoluteScale;
        this.absolutePosition.y = this.parent.absolutePosition.y + this.position.y * this.parent.absoluteScale;
      } else {
        const horizontalBias = this.layout?.constraints?.horizontalBias ?? 0.5;
        const verticalBias = this.layout?.constraints?.verticalBias ?? 0.5;
        const marginTop = this.layout?.marginTop ?? 0;
        const marginBottom = this.layout?.marginBottom ?? 0;
        const marginStart = this.layout?.marginStart ?? 0;
        const marginEnd = this.layout?.marginEnd ?? 0;
        const layoutConstraints = this.parseLayoutConstraints(
          this.layout?.constraints,
          //this.parentScene.game.entities
          this.parentSceneAsEntity.descendants
        );
        const scale = this.parent.absoluteScale;
        const yPositions = layoutConstraints.filter((constraint) => constraint.verticalConstraint).map(
          (constraint) => this.calculateYFromConstraint(
            constraint,
            marginTop,
            marginBottom,
            scale
          )
        );
        if (yPositions.length === 0)
          ;
        else if (yPositions.length === 1) {
          this.absolutePosition.y = yPositions[0];
        } else if (yPositions.length === 2) {
          this.absolutePosition.y = Math.min(yPositions[0], yPositions[1]) + verticalBias * Math.abs(yPositions[0] - yPositions[1]);
        } else
          ;
        const xPositions = layoutConstraints.filter((constraint) => !constraint.verticalConstraint).map(
          (constraint) => this.calculateXFromConstraint(
            constraint,
            marginStart,
            marginEnd,
            scale
          )
        );
        if (xPositions.length === 0)
          ;
        else if (xPositions.length === 1) {
          this.absolutePosition.x = xPositions[0];
        } else if (xPositions.length === 2) {
          this.absolutePosition.x = Math.min(xPositions[0], xPositions[1]) + horizontalBias * Math.abs(xPositions[0] - xPositions[1]);
        } else
          ;
      }
    }
    const uncompletedTransitionActions = this.actions.filter(
      (action) => action.runDuringTransition && !action.completed
    );
    const uncompletedRegularActions = this.actions.filter(
      (action) => !action.runDuringTransition && !action.completed
    );
    if (uncompletedTransitionActions.length > 0) {
      uncompletedTransitionActions.forEach((action) => {
        if (action.runStartTime === -1) {
          action.runStartTime = Globals.now;
        }
      });
      uncompletedTransitionActions.forEach(
        (action) => Action.evaluateAction(action, this, Globals.now, Globals.deltaTime)
      );
    }
    if (!this.involvedInSceneTransition() && uncompletedRegularActions.length > 0) {
      uncompletedRegularActions.forEach((action) => {
        if (action.runStartTime === -1) {
          action.runStartTime = Globals.now;
        }
      });
      uncompletedRegularActions.forEach(
        (action) => Action.evaluateAction(action, this, Globals.now, Globals.deltaTime)
      );
    }
    function getSiblingConstraintUuids(parent, constraints) {
      const uuids = new Array();
      if (constraints === void 0) {
        return uuids;
      }
      const constraintTypes = Object.values(ConstraintType);
      constraintTypes.forEach((constraint) => {
        if (constraints[constraint] !== void 0) {
          let siblingConstraint;
          let additionalExceptionMessage = "";
          if (typeof constraints[constraint] === "object") {
            siblingConstraint = constraints[constraint];
          } else {
            const entityName = constraints[constraint];
            let allGameEntities;
            if (parent.type === EntityType.Scene) {
              allGameEntities = parent.descendants;
            } else {
              allGameEntities = parent.parentSceneAsEntity.descendants;
            }
            siblingConstraint = allGameEntities.filter((e) => e.name === entityName).find(Boolean);
            if (siblingConstraint === void 0) {
              additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
            }
          }
          if (siblingConstraint === void 0) {
            throw new Error(
              "error getting uuid of sibling constraint" + additionalExceptionMessage
            );
          }
          if (siblingConstraint !== parent) {
            uuids.push(siblingConstraint.uuid);
          }
        }
      });
      return uuids;
    }
    const adjList = /* @__PURE__ */ new Map();
    this.children.forEach((child) => {
      adjList.set(
        child.uuid,
        getSiblingConstraintUuids(this, child.layout?.constraints)
      );
    });
    const sortedUuids = this.findTopologicalSort(adjList);
    if (sortedUuids.length > 0) {
      const uuidsInUpdateOrder = sortedUuids.reverse();
      const childrenInUpdateOrder = new Array();
      uuidsInUpdateOrder.forEach((uuid) => {
        const child = this.children.filter((c) => c.uuid === uuid).find(Boolean);
        if (child === void 0) {
          throw new Error("error in dag topological sort");
        }
        childrenInUpdateOrder.push(child);
      });
      childrenInUpdateOrder.forEach((child) => child.update());
    } else {
      this.children.forEach((child) => child.update());
    }
  }
  /**
   * Draws each child entity that is Drawable and is not hidden, by zPosition
   * order (highest zPosition on top).
   *
   * @param canvas - CanvasKit canvas
   */
  drawChildren(canvas) {
    this.children.filter((child) => !child.hidden && child.isDrawable).map((child) => child).sort((a, b) => a.zPosition - b.zPosition).forEach((child) => child.draw(canvas));
  }
  /**
   * Runs an action on this entity.
   *
   * @remarks If the entity is part of an active scene, the action runs
   * immediately. Otherwise, the action will run when the entity's scene
   * becomes active. Calling run() multiple times on an entity will add
   * to existing actions, not replace them.
   *
   * @param action - The action to run
   * @param key - key (string identifier) used to identify the action.
   * Only needed if the action will be referred to later
   */
  run(action, key) {
    this.actions.push(...action.initialize(this, key));
    this.originalActions = this.actions.filter((action2) => action2.runDuringTransition === false).map((action2) => Action.cloneAction(action2, key));
  }
  /**
   * Remove an action from this entity. If the action is running, it will be
   * stopped.
   *
   * @param key - key (string identifier) of the action to remove
   */
  removeAction(key) {
    this.actions = this.actions.filter((action) => action.key !== key);
  }
  /**
   * Remove all actions from this entity. If actions are running, they will be
   * stopped.
   */
  removeAllActions() {
    while (this.actions.length) {
      this.actions.pop();
    }
  }
  getEntityOptions() {
    const entityOptions = {
      name: this.name,
      position: this.position,
      scale: this.scale,
      isUserInteractionEnabled: this.isUserInteractionEnabled,
      hidden: this.hidden
    };
    return entityOptions;
  }
  getDrawableOptions() {
    if (!this.isDrawable) {
      throw new Error(
        "getDrawableOptions() called object that is not IDrawable"
      );
    }
    const drawableOptions = {
      anchorPoint: this.anchorPoint,
      zPosition: this.zPosition
    };
    return drawableOptions;
  }
  getTextOptions() {
    if (!this.isText) {
      throw new Error("getTextOptions() called object that is not IText");
    }
    const textOptions = {
      text: this.text,
      fontName: this.fontName,
      fontColor: this.fontColor,
      fontSize: this.fontSize
    };
    return textOptions;
  }
  /**
   * Gets the scene that contains this entity by searching up the ancestor tree recursively. Throws exception if entity is not part of a scene.
   *
   * @returns Scene that contains this entity
   */
  // get parentScene(): Scene {
  //   if (this.type === EntityType.scene) {
  //     throw new Error(
  //       `Entity ${this} is a scene and cannot have a parent scene`
  //     );
  //   }
  //   if (this.parent && this.parent.type === EntityType.scene) {
  //     return this.parent as Scene;
  //   } else if (this.parent) {
  //     return this.parent.parentScene;
  //   }
  //   throw new Error(`Entity ${this} has not been added to a scene`);
  // }
  get canvasKit() {
    return this.game.canvasKit;
  }
  get parentSceneAsEntity() {
    if (this.type === EntityType.Scene) {
      throw new Error(
        `Entity ${this} is a scene and cannot have a parent scene`
      );
    }
    if (this.parent && this.parent.type === EntityType.Scene) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.parentSceneAsEntity;
    }
    throw new Error(`Entity ${this} has not been added to a scene`);
  }
  get position() {
    const entity = this;
    return {
      get x() {
        return entity._position.x;
      },
      set x(x) {
        entity._position.x = x;
      },
      get y() {
        return entity._position.y;
      },
      set y(y) {
        entity._position.y = y;
      }
    };
  }
  set position(position) {
    this._position = position;
  }
  get zRotation() {
    return this._zRotation;
  }
  set zRotation(zRotation) {
    this._zRotation = zRotation;
  }
  get scale() {
    return this._scale;
  }
  set scale(scale) {
    this._scale = scale;
  }
  // from https://medium.com/@konduruharish/topological-sort-in-typescript-and-c-6d5ecc4bad95
  /**
   * For a given directed acyclic graph, topological ordering of the vertices will be identified using BFS
   * @param adjList Adjacency List that represent a graph with vertices and edges
   */
  findTopologicalSort(adjList) {
    const tSort = [];
    const inDegree = /* @__PURE__ */ new Map();
    adjList.forEach((edges, vertex) => {
      if (!inDegree.has(vertex)) {
        inDegree.set(vertex, 0);
      }
      edges.forEach((edge) => {
        if (inDegree.has(edge)) {
          inDegree.set(edge, inDegree.get(edge) + 1);
        } else {
          inDegree.set(edge, 1);
        }
      });
    });
    const queue = [];
    inDegree.forEach((degree, vertex) => {
      if (degree == 0) {
        queue.push(vertex);
      }
    });
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === void 0) {
        throw "bad";
      }
      tSort.push(current);
      if (adjList.has(current)) {
        adjList.get(current)?.forEach((edge) => {
          if (inDegree.has(edge) && inDegree.get(edge) > 0) {
            const newDegree = inDegree.get(edge) - 1;
            inDegree.set(edge, newDegree);
            if (newDegree == 0) {
              queue.push(edge);
            }
          }
        });
      }
    }
    return tSort;
  }
}
const TABLE_COUNT_OFFSET = 4, TABLE_HEAD_OFFSET = 12, TABLE_HEAD_SIZE = 16, TAG_OFFSET = 0, TAG_SIZE = 4, CHECKSUM_OFFSET = TAG_OFFSET + TAG_SIZE, CHECKSUM_SIZE = 4, CONTENTS_PTR_OFFSET = CHECKSUM_OFFSET + CHECKSUM_SIZE, CONTENTS_PTR_SIZE = 4, LENGTH_OFFSET = TABLE_HEAD_SIZE + CONTENTS_PTR_OFFSET;
function offsetCount(data) {
  return u16(data, TABLE_COUNT_OFFSET);
}
function offsetContent(data, name2) {
  return offsetData(data, name2).contents;
}
function offsetData(data, name2) {
  var numTables = offsetCount(data);
  var header = {
    tag: "",
    checksum: "",
    contents: "",
    length: ""
  };
  for (var i = 0; i < numTables; ++i) {
    var o = TABLE_HEAD_OFFSET + i * TABLE_HEAD_SIZE;
    var tag = utf8(data.buffer.slice(o, o + CONTENTS_PTR_SIZE));
    if (tag === name2) {
      header.tag = tag, header.checksum = u32(data, o + CHECKSUM_OFFSET), header.contents = u32(data, o + CONTENTS_PTR_OFFSET), header.length = u32(data, o + LENGTH_OFFSET);
      return header;
    }
  }
  return header;
}
function name(data) {
  var ntOffset = offsetContent(data, "name"), offsetStorage = u16(data, ntOffset + 4), numberNameRecords = u16(data, ntOffset + 2);
  var storage = offsetStorage + ntOffset;
  var info = {};
  for (var j = 0; j < numberNameRecords; j++) {
    var o = ntOffset + 6 + j * 12;
    u16(data, o);
    var nameId = u16(data, o + 6);
    var stringLength = u16(data, o + 8);
    var stringOffset = u16(data, o + 10);
    if (!info.hasOwnProperty(nameId)) {
      info[nameId] = utf8(
        data.buffer.slice(
          storage + stringOffset,
          storage + stringOffset + stringLength
        )
      );
    }
  }
  return info;
}
const VERSION_OFFSET = 0, WEIGHT_CLASS_OFFSET = 4;
function os2(data) {
  var o = offsetContent(data, "OS/2");
  return {
    version: u16(data, o + VERSION_OFFSET),
    weightClass: u16(data, o + WEIGHT_CLASS_OFFSET)
  };
}
const FORMAT_OFFSET = 0, ITALIC_ANGLE_OFFSET = FORMAT_OFFSET + 4, UNDERLINE_POSITION_OFFSET = ITALIC_ANGLE_OFFSET + 8, UNDERLINE_THICKNESS_OFFSET = UNDERLINE_POSITION_OFFSET + 2, IS_FIXED_PITCH_OFFSET = UNDERLINE_THICKNESS_OFFSET + 2;
const result = {
  meta: {
    /**
     * @type {{name:string,text:string}[]}
     */
    property: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    description: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    license: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    reference: []
  },
  tables: {
    name: {},
    post: {},
    os2: {
      version: "",
      weightClass: ""
    }
  }
};
function f32(fixed) {
  if (fixed & 2147483648) {
    fixed = -(~fixed + 1);
  }
  return fixed / 65536;
}
function i16(data, pos) {
  return data.getInt16(pos);
}
function u16(data, pos) {
  return data.getUint16(pos);
}
function u32(data, pos) {
  return data.getUint32(pos);
}
function utf8(str) {
  return new TextDecoder("utf-8").decode(new Uint8Array(str));
}
function post(data) {
  var o = offsetContent(data, "post");
  return {
    format: f32(u32(data, o + FORMAT_OFFSET)),
    italicAngle: f32(u32(data, o + ITALIC_ANGLE_OFFSET)),
    underlinePosition: i16(data, o + UNDERLINE_POSITION_OFFSET),
    underlineThickness: i16(data, o + UNDERLINE_THICKNESS_OFFSET),
    isFixedPitch: u32(data, o + IS_FIXED_PITCH_OFFSET),
    minMemType42: u32(data, o + 7),
    maxMemType42: u32(data, o + 9),
    minMemType1: u32(data, o + 11),
    maxMemType1: u32(data, o + 13)
  };
}
function resultTables(data) {
  result.tables.name = name(data);
  result.tables.post = post(data);
  result.tables.os2 = os2(data);
  result.meta = property(result.tables.name);
  return result;
}
function ttfInfo(data) {
  try {
    resultTables(data);
    return result;
  } catch (error) {
    throw "error processing ttf";
  }
}
const tpl = {
  0: "Copyright",
  1: "Font Family",
  2: "Font Subfamily",
  3: "Unique identifier",
  4: "Full name",
  5: "Version",
  6: "Postscript name",
  7: "Note",
  8: "Company",
  9: "Author",
  10: "Description",
  11: "URL",
  12: "URL",
  13: "License",
  14: "URL",
  // 15: '',
  16: "Name"
  // 17: ''
};
const tagName = (text = "") => /^[^a-z]*$/.test(text) ? text.split(" ").length > 4 ? "paragraph" : "title" : "paragraph";
function property(e) {
  var meta = {
    /**
     * @type {{name:string,text:string}[]}
     */
    property: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    description: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    license: [],
    /**
     * @type {{name:string,text:string}[]}
     */
    reference: []
  };
  for (const key in e) {
    if (e.hasOwnProperty(key)) {
      const i = parseInt(key);
      var tplId = i;
      const context = e[i].trim();
      var pA = context.replace("~\r\n?~", "\n").split("\n").map((i2) => i2.trim()).filter((i2) => i2);
      if (pA.length > 1) {
        var id = i == 10 ? "description" : "license";
        meta[id] = [];
        for (const eP in pA) {
          if (pA.hasOwnProperty(eP)) {
            var text = pA[eP].trim();
            meta[id].push({ name: tagName(text), text });
          }
        }
      } else if (context) {
        if (/^s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+$/.test(context)) {
          var has = meta.reference.findIndex((a) => a.text == context);
          if (has < 0) {
            meta.reference.push({ name: "url", text: context });
          }
        } else if (i > 0 && i < 6) {
          var name2 = tpl[tplId].replace(" ", "-").toLowerCase();
          meta.property.push({ name: name2, text: context });
        } else {
          if (tpl.hasOwnProperty(i)) {
            if (i == 0 || i == 7) {
              var pA = context.replace(/---+/, "\n").split("\n").map((i2) => i2.trim()).filter((i2) => i2);
              for (const eP in pA) {
                if (pA.hasOwnProperty(eP)) {
                  var text = pA[eP].trim();
                  meta.description.push({ name: tagName(text), text });
                }
              }
            } else if (i == 13) {
              meta.license.push({ name: tagName(context), text: context });
            } else {
              var name2 = tpl[tplId].replace(" ", "-").toLowerCase();
              meta.property.push({ name: name2, text: context });
            }
          }
        }
      }
    }
  }
  return meta;
}
class FontManager {
  constructor(game) {
    this.gameTypefaces = {};
    this.fontData = new Array();
    this.game = game;
    this.canvasKit = game.canvasKit;
  }
  /**
   * Fetches font assets and makes them available for use.
   *
   * @param fonts - array of FontAsset objects (name and url)
   */
  async initializeFonts(fonts) {
    await this.fetchFonts(fonts ?? []);
    this.loadFonts();
  }
  /**
   * Frees up resources allocated by the FontManager.
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this. FOR INTERNAL USE ONLY.
   */
  dispose() {
    const typefaces = Object.entries(this.gameTypefaces).map(
      ([, val]) => val.typeface
    );
    CanvasKitHelpers.Dispose([...typefaces, this.fontMgr]);
  }
  /**
   * Gets a typeface that has been loaded.
   *
   * @param fontName - name as defined in the game's font assets
   * @returns the requested Typeface
   */
  getTypeface(fontName) {
    return this.gameTypefaces[fontName].typeface;
  }
  /**
   * Gets names of fonts loaded.
   *
   * @returns array of font names loaded from the game's font assets and
   * converted into canvaskit Typefaces. The names are the names as defined
   * in the game's font assets.
   */
  getFontNames() {
    return Object.keys(this.gameTypefaces);
  }
  /**
   * Fetches all game fonts.
   *
   * @remarks Uses browser fetch to get font data from the font assets' URLs.
   *
   * @param fontAssets - array of FontAsset objects (names and font urls)
   */
  fetchFonts(fontAssets) {
    const fontsToFetch = fontAssets.map((font, i) => {
      return {
        fontUrl: font.url,
        fontName: font.fontName,
        isDefault: i === 0
      };
    }).filter((f) => f !== void 0);
    if (fontsToFetch.length === 0) {
      return Promise.all([Promise.resolve()]);
    }
    const fetchFontsPromises = fontsToFetch.map(async (font) => {
      const fontUrl = this.game.prependAssetsGameIdUrl(font.fontUrl);
      const response = await fetch(fontUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.fontData.push({
        fontFamilyName: "",
        fontName: font.fontName,
        fontUrl: font.fontUrl,
        fontArrayBuffer: arrayBuffer,
        isDefault: font.isDefault
      });
    });
    return Promise.all(fetchFontsPromises);
  }
  /**
   * Loads raw font data into to canvaskit.
   *
   * @remarks Takes the fonts, which have been previously fetched and
   * converted into Array Buffers using FontManager.fetchFonts(), and
   * makes them available to canvaskit by creating Typefaces.
   */
  loadFonts() {
    if (this.fontData.length === 0) {
      return;
    }
    this.fontMgr = this.canvasKit.FontMgr.FromData(
      ...this.fontData.map((f) => f.fontArrayBuffer)
    ) ?? void 0;
    if (!this.fontMgr) {
      throw new Error("error creating FontMgr while loading fonts");
    }
    this.fontData.forEach((font) => {
      const result2 = ttfInfo(new DataView(font.fontArrayBuffer));
      const fontFamilyUtf16Be = result2.meta.property.filter((p) => p.name === "font-family").find(Boolean)?.text;
      if (fontFamilyUtf16Be === void 0) {
        throw new Error(
          `error loading fonts. could not get font-family name from font at ${font.fontUrl}`
        );
      }
      const arr = new Uint8Array(fontFamilyUtf16Be.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = fontFamilyUtf16Be.charCodeAt(i);
      }
      const fontFamily = new TextDecoder("utf-16be").decode(arr);
      const typeface = this.canvasKit.Typeface.MakeFreeTypeFaceFromData(
        font.fontArrayBuffer
      );
      if (!typeface) {
        throw new Error("cannot make typeface from font array buffer");
      }
      const gameId = this.game.id;
      console.log(
        `\u26AA typeface ${font.fontName} ${font.isDefault ? "(default) " : ""}created from font-family ${fontFamily} for game ${gameId}`
      );
      this.gameTypefaces[font.fontName] = {
        fontFamily,
        typeface,
        isDefault: font.isDefault
      };
    });
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var canvaskit = { exports: {} };
function normalizeArray(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === ".") {
      parts.splice(i, 1);
    } else if (last === "..") {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift("..");
    }
  }
  return parts;
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : "/";
    if (typeof path !== "string") {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    resolvedPath = path + "/" + resolvedPath;
    resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function(p) {
    return !!p;
  }), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}
function normalize(path) {
  var isPathAbsolute = isAbsolute(path), trailingSlash = substr(path, -1) === "/";
  path = normalizeArray(filter(path.split("/"), function(p) {
    return !!p;
  }), !isPathAbsolute).join("/");
  if (!path && !isPathAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isPathAbsolute ? "/" : "") + path;
}
function isAbsolute(path) {
  return path.charAt(0) === "/";
}
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== "string") {
      throw new TypeError("Arguments to path.join must be strings");
    }
    return p;
  }).join("/"));
}
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);
  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== "")
        break;
    }
    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== "")
        break;
    }
    if (start > end)
      return [];
    return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
}
var sep = "/";
var delimiter = ":";
function dirname(path) {
  var result2 = splitPath(path), root = result2[0], dir = result2[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
}
function basename(path, ext) {
  var f = splitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}
function extname(path) {
  return splitPath(path)[3];
}
var _polyfillNode_path = {
  extname,
  basename,
  dirname,
  sep,
  delimiter,
  relative,
  join,
  isAbsolute,
  normalize,
  resolve
};
function filter(xs, f) {
  if (xs.filter)
    return xs.filter(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs))
      res.push(xs[i]);
  }
  return res;
}
var substr = "ab".substr(-1) === "b" ? function(str, start, len) {
  return str.substr(start, len);
} : function(str, start, len) {
  if (start < 0)
    start = str.length + start;
  return str.substr(start, len);
};
var _polyfillNode_path$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  basename,
  default: _polyfillNode_path,
  delimiter,
  dirname,
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  sep
});
var require$$0 = /* @__PURE__ */ getAugmentedNamespace(_polyfillNode_path$1);
var _polyfillNode_fs = {};
var _polyfillNode_fs$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _polyfillNode_fs
});
var require$$1 = /* @__PURE__ */ getAugmentedNamespace(_polyfillNode_fs$1);
(function(module, exports) {
  var CanvasKitInit2 = (() => {
    var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
    if (typeof __filename !== "undefined")
      _scriptDir = _scriptDir || __filename;
    return function(CanvasKitInit3) {
      CanvasKitInit3 = CanvasKitInit3 || {};
      var w;
      w || (w = typeof CanvasKitInit3 !== "undefined" ? CanvasKitInit3 : {});
      var da, ea;
      w.ready = new Promise(function(a, b) {
        da = a;
        ea = b;
      });
      (function(a) {
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          a.MakeSWCanvasSurface = function(b) {
            var d = b;
            if ("CANVAS" !== d.tagName && (d = document.getElementById(b), !d))
              throw "Canvas with id " + b + " was not found";
            if (b = a.MakeSurface(d.width, d.height))
              b.Nd = d;
            return b;
          };
          a.MakeCanvasSurface || (a.MakeCanvasSurface = a.MakeSWCanvasSurface);
          a.MakeSurface = function(b, d) {
            var f = { width: b, height: d, colorType: a.ColorType.RGBA_8888, alphaType: a.AlphaType.Unpremul, colorSpace: a.ColorSpace.SRGB }, h = b * d * 4, m = a._malloc(h);
            if (f = a.Surface._makeRasterDirect(
              f,
              m,
              4 * b
            ))
              f.Nd = null, f.Ef = b, f.Af = d, f.Cf = h, f.af = m, f.getCanvas().clear(a.TRANSPARENT);
            return f;
          };
          a.MakeRasterDirectSurface = function(b, d, f) {
            return a.Surface._makeRasterDirect(b, d.byteOffset, f);
          };
          a.Surface.prototype.flush = function(b) {
            a.Od(this.Md);
            this._flush();
            if (this.Nd) {
              var d = new Uint8ClampedArray(a.HEAPU8.buffer, this.af, this.Cf);
              d = new ImageData(d, this.Ef, this.Af);
              b ? this.Nd.getContext("2d").putImageData(d, 0, 0, b[0], b[1], b[2] - b[0], b[3] - b[1]) : this.Nd.getContext("2d").putImageData(d, 0, 0);
            }
          };
          a.Surface.prototype.dispose = function() {
            this.af && a._free(this.af);
            this.delete();
          };
          a.Od = a.Od || function() {
          };
          a.Se = a.Se || function() {
            return null;
          };
        });
      })(w);
      (function(a) {
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          function b(n, q, v) {
            return n && n.hasOwnProperty(q) ? n[q] : v;
          }
          function d(n) {
            var q = ha(ka);
            ka[q] = n;
            return q;
          }
          function f(n) {
            return n.naturalHeight || n.videoHeight || n.displayHeight || n.height;
          }
          function h(n) {
            return n.naturalWidth || n.videoWidth || n.displayWidth || n.width;
          }
          function m(n, q, v, E) {
            n.bindTexture(n.TEXTURE_2D, q);
            E || v.alphaType !== a.AlphaType.Premul || n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            return q;
          }
          function u(n, q, v) {
            v || q.alphaType !== a.AlphaType.Premul || n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            n.bindTexture(n.TEXTURE_2D, null);
          }
          a.GetWebGLContext = function(n, q) {
            if (!n)
              throw "null canvas passed into makeWebGLContext";
            var v = { alpha: b(q, "alpha", 1), depth: b(q, "depth", 1), stencil: b(q, "stencil", 8), antialias: b(q, "antialias", 0), premultipliedAlpha: b(q, "premultipliedAlpha", 1), preserveDrawingBuffer: b(q, "preserveDrawingBuffer", 0), preferLowPowerToHighPerformance: b(q, "preferLowPowerToHighPerformance", 0), failIfMajorPerformanceCaveat: b(
              q,
              "failIfMajorPerformanceCaveat",
              0
            ), enableExtensionsByDefault: b(q, "enableExtensionsByDefault", 1), explicitSwapControl: b(q, "explicitSwapControl", 0), renderViaOffscreenBackBuffer: b(q, "renderViaOffscreenBackBuffer", 0) };
            v.majorVersion = q && q.majorVersion ? q.majorVersion : "undefined" !== typeof WebGL2RenderingContext ? 2 : 1;
            if (v.explicitSwapControl)
              throw "explicitSwapControl is not supported";
            n = la(n, v);
            if (!n)
              return 0;
            ma(n);
            x.ge.getExtension("WEBGL_debug_renderer_info");
            return n;
          };
          a.deleteContext = function(n) {
            x === na[n] && (x = null);
            "object" == typeof JSEvents && JSEvents.ug(na[n].ge.canvas);
            na[n] && na[n].ge.canvas && (na[n].ge.canvas.yf = void 0);
            na[n] = null;
          };
          a._setTextureCleanup({ deleteTexture: function(n, q) {
            var v = ka[q];
            v && na[n].ge.deleteTexture(v);
            ka[q] = null;
          } });
          a.MakeWebGLContext = function(n) {
            if (!this.Od(n))
              return null;
            var q = this._MakeGrContext();
            if (!q)
              return null;
            q.Md = n;
            var v = q.delete.bind(q);
            q["delete"] = function() {
              a.Od(this.Md);
              v();
            }.bind(q);
            return x.ef = q;
          };
          a.MakeGrContext = a.MakeWebGLContext;
          a.GrDirectContext.prototype.getResourceCacheLimitBytes = function() {
            a.Od(this.Md);
            this._getResourceCacheLimitBytes();
          };
          a.GrDirectContext.prototype.getResourceCacheUsageBytes = function() {
            a.Od(this.Md);
            this._getResourceCacheUsageBytes();
          };
          a.GrDirectContext.prototype.releaseResourcesAndAbandonContext = function() {
            a.Od(this.Md);
            this._releaseResourcesAndAbandonContext();
          };
          a.GrDirectContext.prototype.setResourceCacheLimitBytes = function(n) {
            a.Od(this.Md);
            this._setResourceCacheLimitBytes(n);
          };
          a.MakeOnScreenGLSurface = function(n, q, v, E, G, L) {
            if (!this.Od(n.Md))
              return null;
            q = void 0 === G || void 0 === L ? this._MakeOnScreenGLSurface(n, q, v, E) : this._MakeOnScreenGLSurface(n, q, v, E, G, L);
            if (!q)
              return null;
            q.Md = n.Md;
            return q;
          };
          a.MakeRenderTarget = function() {
            var n = arguments[0];
            if (!this.Od(n.Md))
              return null;
            if (3 === arguments.length) {
              var q = this._MakeRenderTargetWH(n, arguments[1], arguments[2]);
              if (!q)
                return null;
            } else if (2 === arguments.length) {
              if (q = this._MakeRenderTargetII(n, arguments[1]), !q)
                return null;
            } else
              return null;
            q.Md = n.Md;
            return q;
          };
          a.MakeWebGLCanvasSurface = function(n, q, v) {
            q = q || null;
            var E = n, G = "undefined" !== typeof OffscreenCanvas && E instanceof OffscreenCanvas;
            if (!("undefined" !== typeof HTMLCanvasElement && E instanceof HTMLCanvasElement || G || (E = document.getElementById(n), E)))
              throw "Canvas with id " + n + " was not found";
            n = this.GetWebGLContext(E, v);
            if (!n || 0 > n)
              throw "failed to create webgl context: err " + n;
            n = this.MakeWebGLContext(n);
            q = this.MakeOnScreenGLSurface(n, E.width, E.height, q);
            return q ? q : (q = E.cloneNode(true), E.parentNode.replaceChild(q, E), q.classList.add("ck-replaced"), a.MakeSWCanvasSurface(q));
          };
          a.MakeCanvasSurface = a.MakeWebGLCanvasSurface;
          a.Surface.prototype.makeImageFromTexture = function(n, q) {
            a.Od(this.Md);
            n = d(n);
            if (q = this._makeImageFromTexture(this.Md, n, q))
              q.Le = n;
            return q;
          };
          a.Surface.prototype.makeImageFromTextureSource = function(n, q, v) {
            q || (q = { height: f(n), width: h(n), colorType: a.ColorType.RGBA_8888, alphaType: v ? a.AlphaType.Premul : a.AlphaType.Unpremul });
            q.colorSpace || (q.colorSpace = a.ColorSpace.SRGB);
            a.Od(this.Md);
            var E = x.ge;
            v = m(E, E.createTexture(), q, v);
            2 === x.version ? E.texImage2D(
              E.TEXTURE_2D,
              0,
              E.RGBA,
              q.width,
              q.height,
              0,
              E.RGBA,
              E.UNSIGNED_BYTE,
              n
            ) : E.texImage2D(E.TEXTURE_2D, 0, E.RGBA, E.RGBA, E.UNSIGNED_BYTE, n);
            u(E, q);
            this._resetContext();
            return this.makeImageFromTexture(v, q);
          };
          a.Surface.prototype.updateTextureFromSource = function(n, q, v) {
            if (n.Le) {
              a.Od(this.Md);
              var E = n.getImageInfo(), G = x.ge, L = m(G, ka[n.Le], E, v);
              2 === x.version ? G.texImage2D(G.TEXTURE_2D, 0, G.RGBA, h(q), f(q), 0, G.RGBA, G.UNSIGNED_BYTE, q) : G.texImage2D(G.TEXTURE_2D, 0, G.RGBA, G.RGBA, G.UNSIGNED_BYTE, q);
              u(G, E, v);
              this._resetContext();
              ka[n.Le] = null;
              n.Le = d(L);
              E.colorSpace = n.getColorSpace();
              q = this._makeImageFromTexture(this.Md, n.Le, E);
              v = n.Ld.Td;
              G = n.Ld.$d;
              n.Ld.Td = q.Ld.Td;
              n.Ld.$d = q.Ld.$d;
              q.Ld.Td = v;
              q.Ld.$d = G;
              q.delete();
              E.colorSpace.delete();
            }
          };
          a.MakeLazyImageFromTextureSource = function(n, q, v) {
            q || (q = { height: f(n), width: h(n), colorType: a.ColorType.RGBA_8888, alphaType: v ? a.AlphaType.Premul : a.AlphaType.Unpremul });
            q.colorSpace || (q.colorSpace = a.ColorSpace.SRGB);
            var E = { makeTexture: function() {
              var G = x, L = G.ge, z = m(L, L.createTexture(), q, v);
              2 === G.version ? L.texImage2D(
                L.TEXTURE_2D,
                0,
                L.RGBA,
                q.width,
                q.height,
                0,
                L.RGBA,
                L.UNSIGNED_BYTE,
                n
              ) : L.texImage2D(L.TEXTURE_2D, 0, L.RGBA, L.RGBA, L.UNSIGNED_BYTE, n);
              u(L, q, v);
              return d(z);
            }, freeSrc: function() {
            } };
            "VideoFrame" === n.constructor.name && (E.freeSrc = function() {
              n.close();
            });
            return a.Image._makeFromGenerator(q, E);
          };
          a.Od = function(n) {
            return n ? ma(n) : false;
          };
          a.Se = function() {
            return x && x.ef && !x.ef.isDeleted() ? x.ef : null;
          };
        });
      })(w);
      (function(a) {
        function b(e, c, g, l, t) {
          for (var y = 0; y < e.length; y++)
            c[y * g + (y * t + l + g) % g] = e[y];
          return c;
        }
        function d(e) {
          for (var c = e * e, g = Array(c); c--; )
            g[c] = 0 === c % (e + 1) ? 1 : 0;
          return g;
        }
        function f(e) {
          return e ? e.constructor === Float32Array && 4 === e.length : false;
        }
        function h(e) {
          return (n(255 * e[3]) << 24 | n(255 * e[0]) << 16 | n(255 * e[1]) << 8 | n(255 * e[2]) << 0) >>> 0;
        }
        function m(e) {
          if (e && e._ck)
            return e;
          if (e instanceof Float32Array) {
            for (var c = Math.floor(e.length / 4), g = new Uint32Array(c), l = 0; l < c; l++)
              g[l] = h(e.slice(4 * l, 4 * (l + 1)));
            return g;
          }
          if (e instanceof Uint32Array)
            return e;
          if (e instanceof Array && e[0] instanceof Float32Array)
            return e.map(h);
        }
        function u(e) {
          if (void 0 === e)
            return 1;
          var c = parseFloat(e);
          return e && -1 !== e.indexOf("%") ? c / 100 : c;
        }
        function n(e) {
          return Math.round(Math.max(0, Math.min(e || 0, 255)));
        }
        function q(e, c) {
          c && c._ck || a._free(e);
        }
        function v(e, c, g) {
          if (!e || !e.length)
            return V;
          if (e && e._ck)
            return e.byteOffset;
          var l = a[c].BYTES_PER_ELEMENT;
          g || (g = a._malloc(e.length * l));
          a[c].set(e, g / l);
          return g;
        }
        function E(e) {
          var c = { ce: V, count: e.length, colorType: a.ColorType.RGBA_F32 };
          if (e instanceof Float32Array)
            c.ce = v(e, "HEAPF32"), c.count = e.length / 4;
          else if (e instanceof Uint32Array)
            c.ce = v(e, "HEAPU32"), c.colorType = a.ColorType.RGBA_8888;
          else if (e instanceof Array) {
            if (e && e.length) {
              for (var g = a._malloc(16 * e.length), l = 0, t = g / 4, y = 0; y < e.length; y++)
                for (var C = 0; 4 > C; C++)
                  a.HEAPF32[t + l] = e[y][C], l++;
              e = g;
            } else
              e = V;
            c.ce = e;
          } else
            throw "Invalid argument to copyFlexibleColorArray, Not a color array " + typeof e;
          return c;
        }
        function G(e) {
          if (!e)
            return V;
          var c = Ub.toTypedArray();
          if (e.length) {
            if (6 === e.length || 9 === e.length)
              return v(e, "HEAPF32", Oa), 6 === e.length && a.HEAPF32.set(yd, 6 + Oa / 4), Oa;
            if (16 === e.length)
              return c[0] = e[0], c[1] = e[1], c[2] = e[3], c[3] = e[4], c[4] = e[5], c[5] = e[7], c[6] = e[12], c[7] = e[13], c[8] = e[15], Oa;
            throw "invalid matrix size";
          }
          if (void 0 === e.m11)
            throw "invalid matrix argument";
          c[0] = e.m11;
          c[1] = e.m21;
          c[2] = e.m41;
          c[3] = e.m12;
          c[4] = e.m22;
          c[5] = e.m42;
          c[6] = e.m14;
          c[7] = e.m24;
          c[8] = e.m44;
          return Oa;
        }
        function L(e) {
          if (!e)
            return V;
          var c = Vb.toTypedArray();
          if (e.length) {
            if (16 !== e.length && 6 !== e.length && 9 !== e.length)
              throw "invalid matrix size";
            if (16 === e.length)
              return v(e, "HEAPF32", ab);
            c.fill(0);
            c[0] = e[0];
            c[1] = e[1];
            c[3] = e[2];
            c[4] = e[3];
            c[5] = e[4];
            c[7] = e[5];
            c[10] = 1;
            c[12] = e[6];
            c[13] = e[7];
            c[15] = e[8];
            6 === e.length && (c[12] = 0, c[13] = 0, c[15] = 1);
            return ab;
          }
          if (void 0 === e.m11)
            throw "invalid matrix argument";
          c[0] = e.m11;
          c[1] = e.m21;
          c[2] = e.m31;
          c[3] = e.m41;
          c[4] = e.m12;
          c[5] = e.m22;
          c[6] = e.m32;
          c[7] = e.m42;
          c[8] = e.m13;
          c[9] = e.m23;
          c[10] = e.m33;
          c[11] = e.m43;
          c[12] = e.m14;
          c[13] = e.m24;
          c[14] = e.m34;
          c[15] = e.m44;
          return ab;
        }
        function z(e, c) {
          return v(e, "HEAPF32", c || Ua);
        }
        function N(e, c, g, l) {
          var t = Wb.toTypedArray();
          t[0] = e;
          t[1] = c;
          t[2] = g;
          t[3] = l;
          return Ua;
        }
        function T(e) {
          for (var c = new Float32Array(4), g = 0; 4 > g; g++)
            c[g] = a.HEAPF32[e / 4 + g];
          return c;
        }
        function U(e, c) {
          return v(e, "HEAPF32", c || ja);
        }
        function pa(e, c) {
          return v(e, "HEAPF32", c || Xb);
        }
        function ta() {
          for (var e = 0, c = 0; c < arguments.length - 1; c += 2)
            e += arguments[c] * arguments[c + 1];
          return e;
        }
        function gb(e, c, g) {
          for (var l = Array(e.length), t = 0; t < g; t++)
            for (var y = 0; y < g; y++) {
              for (var C = 0, J = 0; J < g; J++)
                C += e[g * t + J] * c[g * J + y];
              l[t * g + y] = C;
            }
          return l;
        }
        function hb(e, c) {
          for (var g = gb(c[0], c[1], e), l = 2; l < c.length; )
            g = gb(g, c[l], e), l++;
          return g;
        }
        a.Color = function(e, c, g, l) {
          void 0 === l && (l = 1);
          return a.Color4f(n(e) / 255, n(c) / 255, n(g) / 255, l);
        };
        a.ColorAsInt = function(e, c, g, l) {
          void 0 === l && (l = 255);
          return (n(l) << 24 | n(e) << 16 | n(c) << 8 | n(g) << 0 & 268435455) >>> 0;
        };
        a.Color4f = function(e, c, g, l) {
          void 0 === l && (l = 1);
          return Float32Array.of(e, c, g, l);
        };
        Object.defineProperty(a, "TRANSPARENT", { get: function() {
          return a.Color4f(0, 0, 0, 0);
        } });
        Object.defineProperty(a, "BLACK", { get: function() {
          return a.Color4f(0, 0, 0, 1);
        } });
        Object.defineProperty(
          a,
          "WHITE",
          { get: function() {
            return a.Color4f(1, 1, 1, 1);
          } }
        );
        Object.defineProperty(a, "RED", { get: function() {
          return a.Color4f(1, 0, 0, 1);
        } });
        Object.defineProperty(a, "GREEN", { get: function() {
          return a.Color4f(0, 1, 0, 1);
        } });
        Object.defineProperty(a, "BLUE", { get: function() {
          return a.Color4f(0, 0, 1, 1);
        } });
        Object.defineProperty(a, "YELLOW", { get: function() {
          return a.Color4f(1, 1, 0, 1);
        } });
        Object.defineProperty(a, "CYAN", { get: function() {
          return a.Color4f(0, 1, 1, 1);
        } });
        Object.defineProperty(a, "MAGENTA", { get: function() {
          return a.Color4f(
            1,
            0,
            1,
            1
          );
        } });
        a.getColorComponents = function(e) {
          return [Math.floor(255 * e[0]), Math.floor(255 * e[1]), Math.floor(255 * e[2]), e[3]];
        };
        a.parseColorString = function(e, c) {
          e = e.toLowerCase();
          if (e.startsWith("#")) {
            c = 255;
            switch (e.length) {
              case 9:
                c = parseInt(e.slice(7, 9), 16);
              case 7:
                var g = parseInt(e.slice(1, 3), 16);
                var l = parseInt(e.slice(3, 5), 16);
                var t = parseInt(e.slice(5, 7), 16);
                break;
              case 5:
                c = 17 * parseInt(e.slice(4, 5), 16);
              case 4:
                g = 17 * parseInt(e.slice(1, 2), 16), l = 17 * parseInt(e.slice(2, 3), 16), t = 17 * parseInt(e.slice(3, 4), 16);
            }
            return a.Color(
              g,
              l,
              t,
              c / 255
            );
          }
          return e.startsWith("rgba") ? (e = e.slice(5, -1), e = e.split(","), a.Color(+e[0], +e[1], +e[2], u(e[3]))) : e.startsWith("rgb") ? (e = e.slice(4, -1), e = e.split(","), a.Color(+e[0], +e[1], +e[2], u(e[3]))) : e.startsWith("gray(") || e.startsWith("hsl") || !c || (e = c[e], void 0 === e) ? a.BLACK : e;
        };
        a.multiplyByAlpha = function(e, c) {
          e = e.slice();
          e[3] = Math.max(0, Math.min(e[3] * c, 1));
          return e;
        };
        a.Malloc = function(e, c) {
          var g = a._malloc(c * e.BYTES_PER_ELEMENT);
          return { _ck: true, length: c, byteOffset: g, re: null, subarray: function(l, t) {
            l = this.toTypedArray().subarray(
              l,
              t
            );
            l._ck = true;
            return l;
          }, toTypedArray: function() {
            if (this.re && this.re.length)
              return this.re;
            this.re = new e(a.HEAPU8.buffer, g, c);
            this.re._ck = true;
            return this.re;
          } };
        };
        a.Free = function(e) {
          a._free(e.byteOffset);
          e.byteOffset = V;
          e.toTypedArray = null;
          e.re = null;
        };
        var Oa = V, Ub, ab = V, Vb, Ua = V, Wb, Ha, ja = V, Cc, Pa = V, Dc, Yb = V, Ec, Zb = V, $b, xb = V, Fc, Xb = V, Gc, Hc = V, yd = Float32Array.of(0, 0, 1), V = 0;
        a.onRuntimeInitialized = function() {
          function e(c, g, l, t, y, C, J) {
            C || (C = 4 * t.width, t.colorType === a.ColorType.RGBA_F16 ? C *= 2 : t.colorType === a.ColorType.RGBA_F32 && (C *= 4));
            var P = C * t.height;
            var O = y ? y.byteOffset : a._malloc(P);
            if (J ? !c._readPixels(t, O, C, g, l, J) : !c._readPixels(t, O, C, g, l))
              return y || a._free(O), null;
            if (y)
              return y.toTypedArray();
            switch (t.colorType) {
              case a.ColorType.RGBA_8888:
              case a.ColorType.RGBA_F16:
                c = new Uint8Array(a.HEAPU8.buffer, O, P).slice();
                break;
              case a.ColorType.RGBA_F32:
                c = new Float32Array(a.HEAPU8.buffer, O, P).slice();
                break;
              default:
                return null;
            }
            a._free(O);
            return c;
          }
          Wb = a.Malloc(Float32Array, 4);
          Ua = Wb.byteOffset;
          Vb = a.Malloc(Float32Array, 16);
          ab = Vb.byteOffset;
          Ub = a.Malloc(Float32Array, 9);
          Oa = Ub.byteOffset;
          Fc = a.Malloc(Float32Array, 12);
          Xb = Fc.byteOffset;
          Gc = a.Malloc(Float32Array, 12);
          Hc = Gc.byteOffset;
          Ha = a.Malloc(Float32Array, 4);
          ja = Ha.byteOffset;
          Cc = a.Malloc(Float32Array, 4);
          Pa = Cc.byteOffset;
          Dc = a.Malloc(Float32Array, 3);
          Yb = Dc.byteOffset;
          Ec = a.Malloc(Float32Array, 3);
          Zb = Ec.byteOffset;
          $b = a.Malloc(Int32Array, 4);
          xb = $b.byteOffset;
          a.ColorSpace.SRGB = a.ColorSpace._MakeSRGB();
          a.ColorSpace.DISPLAY_P3 = a.ColorSpace._MakeDisplayP3();
          a.ColorSpace.ADOBE_RGB = a.ColorSpace._MakeAdobeRGB();
          a.GlyphRunFlags = { IsWhiteSpace: a._GlyphRunFlags_isWhiteSpace };
          a.Path.MakeFromCmds = function(c) {
            var g = v(c, "HEAPF32"), l = a.Path._MakeFromCmds(g, c.length);
            q(g, c);
            return l;
          };
          a.Path.MakeFromVerbsPointsWeights = function(c, g, l) {
            var t = v(c, "HEAPU8"), y = v(g, "HEAPF32"), C = v(l, "HEAPF32"), J = a.Path._MakeFromVerbsPointsWeights(t, c.length, y, g.length, C, l && l.length || 0);
            q(t, c);
            q(y, g);
            q(C, l);
            return J;
          };
          a.Path.prototype.addArc = function(c, g, l) {
            c = U(c);
            this._addArc(c, g, l);
            return this;
          };
          a.Path.prototype.addCircle = function(c, g, l, t) {
            this._addCircle(
              c,
              g,
              l,
              !!t
            );
            return this;
          };
          a.Path.prototype.addOval = function(c, g, l) {
            void 0 === l && (l = 1);
            c = U(c);
            this._addOval(c, !!g, l);
            return this;
          };
          a.Path.prototype.addPath = function() {
            var c = Array.prototype.slice.call(arguments), g = c[0], l = false;
            "boolean" === typeof c[c.length - 1] && (l = c.pop());
            if (1 === c.length)
              this._addPath(g, 1, 0, 0, 0, 1, 0, 0, 0, 1, l);
            else if (2 === c.length)
              c = c[1], this._addPath(g, c[0], c[1], c[2], c[3], c[4], c[5], c[6] || 0, c[7] || 0, c[8] || 1, l);
            else if (7 === c.length || 10 === c.length)
              this._addPath(g, c[1], c[2], c[3], c[4], c[5], c[6], c[7] || 0, c[8] || 0, c[9] || 1, l);
            else
              return null;
            return this;
          };
          a.Path.prototype.addPoly = function(c, g) {
            var l = v(c, "HEAPF32");
            this._addPoly(l, c.length / 2, g);
            q(l, c);
            return this;
          };
          a.Path.prototype.addRect = function(c, g) {
            c = U(c);
            this._addRect(c, !!g);
            return this;
          };
          a.Path.prototype.addRRect = function(c, g) {
            c = pa(c);
            this._addRRect(c, !!g);
            return this;
          };
          a.Path.prototype.addVerbsPointsWeights = function(c, g, l) {
            var t = v(c, "HEAPU8"), y = v(g, "HEAPF32"), C = v(l, "HEAPF32");
            this._addVerbsPointsWeights(t, c.length, y, g.length, C, l && l.length || 0);
            q(t, c);
            q(y, g);
            q(C, l);
          };
          a.Path.prototype.arc = function(c, g, l, t, y, C) {
            c = a.LTRBRect(c - l, g - l, c + l, g + l);
            y = (y - t) / Math.PI * 180 - 360 * !!C;
            C = new a.Path();
            C.addArc(c, t / Math.PI * 180, y);
            this.addPath(C, true);
            C.delete();
            return this;
          };
          a.Path.prototype.arcToOval = function(c, g, l, t) {
            c = U(c);
            this._arcToOval(c, g, l, t);
            return this;
          };
          a.Path.prototype.arcToRotated = function(c, g, l, t, y, C, J) {
            this._arcToRotated(c, g, l, !!t, !!y, C, J);
            return this;
          };
          a.Path.prototype.arcToTangent = function(c, g, l, t, y) {
            this._arcToTangent(c, g, l, t, y);
            return this;
          };
          a.Path.prototype.close = function() {
            this._close();
            return this;
          };
          a.Path.prototype.conicTo = function(c, g, l, t, y) {
            this._conicTo(c, g, l, t, y);
            return this;
          };
          a.Path.prototype.computeTightBounds = function(c) {
            this._computeTightBounds(ja);
            var g = Ha.toTypedArray();
            return c ? (c.set(g), c) : g.slice();
          };
          a.Path.prototype.cubicTo = function(c, g, l, t, y, C) {
            this._cubicTo(c, g, l, t, y, C);
            return this;
          };
          a.Path.prototype.dash = function(c, g, l) {
            return this._dash(c, g, l) ? this : null;
          };
          a.Path.prototype.getBounds = function(c) {
            this._getBounds(ja);
            var g = Ha.toTypedArray();
            return c ? (c.set(g), c) : g.slice();
          };
          a.Path.prototype.lineTo = function(c, g) {
            this._lineTo(c, g);
            return this;
          };
          a.Path.prototype.moveTo = function(c, g) {
            this._moveTo(c, g);
            return this;
          };
          a.Path.prototype.offset = function(c, g) {
            this._transform(1, 0, c, 0, 1, g, 0, 0, 1);
            return this;
          };
          a.Path.prototype.quadTo = function(c, g, l, t) {
            this._quadTo(c, g, l, t);
            return this;
          };
          a.Path.prototype.rArcTo = function(c, g, l, t, y, C, J) {
            this._rArcTo(c, g, l, t, y, C, J);
            return this;
          };
          a.Path.prototype.rConicTo = function(c, g, l, t, y) {
            this._rConicTo(c, g, l, t, y);
            return this;
          };
          a.Path.prototype.rCubicTo = function(c, g, l, t, y, C) {
            this._rCubicTo(c, g, l, t, y, C);
            return this;
          };
          a.Path.prototype.rLineTo = function(c, g) {
            this._rLineTo(c, g);
            return this;
          };
          a.Path.prototype.rMoveTo = function(c, g) {
            this._rMoveTo(c, g);
            return this;
          };
          a.Path.prototype.rQuadTo = function(c, g, l, t) {
            this._rQuadTo(c, g, l, t);
            return this;
          };
          a.Path.prototype.stroke = function(c) {
            c = c || {};
            c.width = c.width || 1;
            c.miter_limit = c.miter_limit || 4;
            c.cap = c.cap || a.StrokeCap.Butt;
            c.join = c.join || a.StrokeJoin.Miter;
            c.precision = c.precision || 1;
            return this._stroke(c) ? this : null;
          };
          a.Path.prototype.transform = function() {
            if (1 === arguments.length) {
              var c = arguments[0];
              this._transform(c[0], c[1], c[2], c[3], c[4], c[5], c[6] || 0, c[7] || 0, c[8] || 1);
            } else if (6 === arguments.length || 9 === arguments.length)
              c = arguments, this._transform(c[0], c[1], c[2], c[3], c[4], c[5], c[6] || 0, c[7] || 0, c[8] || 1);
            else
              throw "transform expected to take 1 or 9 arguments. Got " + arguments.length;
            return this;
          };
          a.Path.prototype.trim = function(c, g, l) {
            return this._trim(c, g, !!l) ? this : null;
          };
          a.Image.prototype.encodeToBytes = function(c, g) {
            var l = a.Se();
            c = c || a.ImageFormat.PNG;
            g = g || 100;
            return l ? this._encodeToBytes(c, g, l) : this._encodeToBytes(c, g);
          };
          a.Image.prototype.makeShaderCubic = function(c, g, l, t, y) {
            y = G(y);
            return this._makeShaderCubic(c, g, l, t, y);
          };
          a.Image.prototype.makeShaderOptions = function(c, g, l, t, y) {
            y = G(y);
            return this._makeShaderOptions(c, g, l, t, y);
          };
          a.Image.prototype.readPixels = function(c, g, l, t, y) {
            var C = a.Se();
            return e(this, c, g, l, t, y, C);
          };
          a.Canvas.prototype.clear = function(c) {
            a.Od(this.Md);
            c = z(c);
            this._clear(c);
          };
          a.Canvas.prototype.clipRRect = function(c, g, l) {
            a.Od(this.Md);
            c = pa(c);
            this._clipRRect(c, g, l);
          };
          a.Canvas.prototype.clipRect = function(c, g, l) {
            a.Od(this.Md);
            c = U(c);
            this._clipRect(c, g, l);
          };
          a.Canvas.prototype.concat = function(c) {
            a.Od(this.Md);
            c = L(c);
            this._concat(c);
          };
          a.Canvas.prototype.drawArc = function(c, g, l, t, y) {
            a.Od(this.Md);
            c = U(c);
            this._drawArc(c, g, l, t, y);
          };
          a.Canvas.prototype.drawAtlas = function(c, g, l, t, y, C, J) {
            if (c && t && g && l && g.length === l.length) {
              a.Od(this.Md);
              y || (y = a.BlendMode.SrcOver);
              var P = v(g, "HEAPF32"), O = v(l, "HEAPF32"), W = l.length / 4, r = v(m(C), "HEAPU32");
              if (J && "B" in J && "C" in J)
                this._drawAtlasCubic(c, O, P, r, W, y, J.B, J.C, t);
              else {
                let D = a.FilterMode.Linear, R = a.MipmapMode.None;
                J && (D = J.filter, "mipmap" in J && (R = J.mipmap));
                this._drawAtlasOptions(c, O, P, r, W, y, D, R, t);
              }
              q(P, g);
              q(O, l);
              q(r, C);
            }
          };
          a.Canvas.prototype.drawCircle = function(c, g, l, t) {
            a.Od(this.Md);
            this._drawCircle(c, g, l, t);
          };
          a.Canvas.prototype.drawColor = function(c, g) {
            a.Od(this.Md);
            c = z(c);
            void 0 !== g ? this._drawColor(c, g) : this._drawColor(c);
          };
          a.Canvas.prototype.drawColorInt = function(c, g) {
            a.Od(this.Md);
            this._drawColorInt(c, g || a.BlendMode.SrcOver);
          };
          a.Canvas.prototype.drawColorComponents = function(c, g, l, t, y) {
            a.Od(this.Md);
            c = N(c, g, l, t);
            void 0 !== y ? this._drawColor(c, y) : this._drawColor(c);
          };
          a.Canvas.prototype.drawDRRect = function(c, g, l) {
            a.Od(this.Md);
            c = pa(c, Xb);
            g = pa(g, Hc);
            this._drawDRRect(c, g, l);
          };
          a.Canvas.prototype.drawImage = function(c, g, l, t) {
            a.Od(this.Md);
            this._drawImage(c, g, l, t || null);
          };
          a.Canvas.prototype.drawImageCubic = function(c, g, l, t, y, C) {
            a.Od(this.Md);
            this._drawImageCubic(c, g, l, t, y, C || null);
          };
          a.Canvas.prototype.drawImageOptions = function(c, g, l, t, y, C) {
            a.Od(this.Md);
            this._drawImageOptions(c, g, l, t, y, C || null);
          };
          a.Canvas.prototype.drawImageNine = function(c, g, l, t, y) {
            a.Od(this.Md);
            g = v(g, "HEAP32", xb);
            l = U(l);
            this._drawImageNine(c, g, l, t, y || null);
          };
          a.Canvas.prototype.drawImageRect = function(c, g, l, t, y) {
            a.Od(this.Md);
            U(g, ja);
            U(l, Pa);
            this._drawImageRect(c, ja, Pa, t, !!y);
          };
          a.Canvas.prototype.drawImageRectCubic = function(c, g, l, t, y, C) {
            a.Od(this.Md);
            U(g, ja);
            U(l, Pa);
            this._drawImageRectCubic(c, ja, Pa, t, y, C || null);
          };
          a.Canvas.prototype.drawImageRectOptions = function(c, g, l, t, y, C) {
            a.Od(this.Md);
            U(g, ja);
            U(l, Pa);
            this._drawImageRectOptions(c, ja, Pa, t, y, C || null);
          };
          a.Canvas.prototype.drawLine = function(c, g, l, t, y) {
            a.Od(this.Md);
            this._drawLine(c, g, l, t, y);
          };
          a.Canvas.prototype.drawOval = function(c, g) {
            a.Od(this.Md);
            c = U(c);
            this._drawOval(c, g);
          };
          a.Canvas.prototype.drawPaint = function(c) {
            a.Od(this.Md);
            this._drawPaint(c);
          };
          a.Canvas.prototype.drawParagraph = function(c, g, l) {
            a.Od(this.Md);
            this._drawParagraph(c, g, l);
          };
          a.Canvas.prototype.drawPatch = function(c, g, l, t, y) {
            if (24 > c.length)
              throw "Need 12 cubic points";
            if (g && 4 > g.length)
              throw "Need 4 colors";
            if (l && 8 > l.length)
              throw "Need 4 shader coordinates";
            a.Od(this.Md);
            const C = v(c, "HEAPF32"), J = g ? v(m(g), "HEAPU32") : V, P = l ? v(l, "HEAPF32") : V;
            t || (t = a.BlendMode.Modulate);
            this._drawPatch(C, J, P, t, y);
            q(P, l);
            q(J, g);
            q(C, c);
          };
          a.Canvas.prototype.drawPath = function(c, g) {
            a.Od(this.Md);
            this._drawPath(c, g);
          };
          a.Canvas.prototype.drawPicture = function(c) {
            a.Od(this.Md);
            this._drawPicture(c);
          };
          a.Canvas.prototype.drawPoints = function(c, g, l) {
            a.Od(this.Md);
            var t = v(g, "HEAPF32");
            this._drawPoints(
              c,
              t,
              g.length / 2,
              l
            );
            q(t, g);
          };
          a.Canvas.prototype.drawRRect = function(c, g) {
            a.Od(this.Md);
            c = pa(c);
            this._drawRRect(c, g);
          };
          a.Canvas.prototype.drawRect = function(c, g) {
            a.Od(this.Md);
            c = U(c);
            this._drawRect(c, g);
          };
          a.Canvas.prototype.drawRect4f = function(c, g, l, t, y) {
            a.Od(this.Md);
            this._drawRect4f(c, g, l, t, y);
          };
          a.Canvas.prototype.drawShadow = function(c, g, l, t, y, C, J) {
            a.Od(this.Md);
            var P = v(y, "HEAPF32"), O = v(C, "HEAPF32");
            g = v(g, "HEAPF32", Yb);
            l = v(l, "HEAPF32", Zb);
            this._drawShadow(c, g, l, t, P, O, J);
            q(P, y);
            q(O, C);
          };
          a.getShadowLocalBounds = function(c, g, l, t, y, C, J) {
            c = G(c);
            l = v(l, "HEAPF32", Yb);
            t = v(t, "HEAPF32", Zb);
            if (!this._getShadowLocalBounds(c, g, l, t, y, C, ja))
              return null;
            g = Ha.toTypedArray();
            return J ? (J.set(g), J) : g.slice();
          };
          a.Canvas.prototype.drawTextBlob = function(c, g, l, t) {
            a.Od(this.Md);
            this._drawTextBlob(c, g, l, t);
          };
          a.Canvas.prototype.drawVertices = function(c, g, l) {
            a.Od(this.Md);
            this._drawVertices(c, g, l);
          };
          a.Canvas.prototype.getDeviceClipBounds = function(c) {
            this._getDeviceClipBounds(xb);
            var g = $b.toTypedArray();
            c ? c.set(g) : c = g.slice();
            return c;
          };
          a.Canvas.prototype.getLocalToDevice = function() {
            this._getLocalToDevice(ab);
            for (var c = ab, g = Array(16), l = 0; 16 > l; l++)
              g[l] = a.HEAPF32[c / 4 + l];
            return g;
          };
          a.Canvas.prototype.getTotalMatrix = function() {
            this._getTotalMatrix(Oa);
            for (var c = Array(9), g = 0; 9 > g; g++)
              c[g] = a.HEAPF32[Oa / 4 + g];
            return c;
          };
          a.Canvas.prototype.makeSurface = function(c) {
            c = this._makeSurface(c);
            c.Md = this.Md;
            return c;
          };
          a.Canvas.prototype.readPixels = function(c, g, l, t, y) {
            a.Od(this.Md);
            return e(this, c, g, l, t, y);
          };
          a.Canvas.prototype.saveLayer = function(c, g, l, t) {
            g = U(g);
            return this._saveLayer(c || null, g, l || null, t || 0);
          };
          a.Canvas.prototype.writePixels = function(c, g, l, t, y, C, J, P) {
            if (c.byteLength % (g * l))
              throw "pixels length must be a multiple of the srcWidth * srcHeight";
            a.Od(this.Md);
            var O = c.byteLength / (g * l);
            C = C || a.AlphaType.Unpremul;
            J = J || a.ColorType.RGBA_8888;
            P = P || a.ColorSpace.SRGB;
            var W = O * g;
            O = v(c, "HEAPU8");
            g = this._writePixels({ width: g, height: l, colorType: J, alphaType: C, colorSpace: P }, O, W, t, y);
            q(O, c);
            return g;
          };
          a.ColorFilter.MakeBlend = function(c, g, l) {
            c = z(c);
            l = l || a.ColorSpace.SRGB;
            return a.ColorFilter._MakeBlend(c, g, l);
          };
          a.ColorFilter.MakeMatrix = function(c) {
            if (!c || 20 !== c.length)
              throw "invalid color matrix";
            var g = v(c, "HEAPF32"), l = a.ColorFilter._makeMatrix(g);
            q(g, c);
            return l;
          };
          a.ContourMeasure.prototype.getPosTan = function(c, g) {
            this._getPosTan(c, ja);
            c = Ha.toTypedArray();
            return g ? (g.set(c), g) : c.slice();
          };
          a.ImageFilter.MakeDropShadow = function(c, g, l, t, y, C) {
            y = z(y, Ua);
            return a.ImageFilter._MakeDropShadow(c, g, l, t, y, C);
          };
          a.ImageFilter.MakeDropShadowOnly = function(c, g, l, t, y, C) {
            y = z(y, Ua);
            return a.ImageFilter._MakeDropShadowOnly(
              c,
              g,
              l,
              t,
              y,
              C
            );
          };
          a.ImageFilter.MakeImage = function(c, g, l, t) {
            l = U(l, ja);
            t = U(t, Pa);
            if ("B" in g && "C" in g)
              return a.ImageFilter._MakeImageCubic(c, g.B, g.C, l, t);
            const y = g.filter;
            let C = a.MipmapMode.None;
            "mipmap" in g && (C = g.mipmap);
            return a.ImageFilter._MakeImageOptions(c, y, C, l, t);
          };
          a.ImageFilter.MakeMatrixTransform = function(c, g, l) {
            c = G(c);
            if ("B" in g && "C" in g)
              return a.ImageFilter._MakeMatrixTransformCubic(c, g.B, g.C, l);
            const t = g.filter;
            let y = a.MipmapMode.None;
            "mipmap" in g && (y = g.mipmap);
            return a.ImageFilter._MakeMatrixTransformOptions(
              c,
              t,
              y,
              l
            );
          };
          a.Paint.prototype.getColor = function() {
            this._getColor(Ua);
            return T(Ua);
          };
          a.Paint.prototype.setColor = function(c, g) {
            g = g || null;
            c = z(c);
            this._setColor(c, g);
          };
          a.Paint.prototype.setColorComponents = function(c, g, l, t, y) {
            y = y || null;
            c = N(c, g, l, t);
            this._setColor(c, y);
          };
          a.Path.prototype.getPoint = function(c, g) {
            this._getPoint(c, ja);
            c = Ha.toTypedArray();
            return g ? (g[0] = c[0], g[1] = c[1], g) : c.slice(0, 2);
          };
          a.Picture.prototype.makeShader = function(c, g, l, t, y) {
            t = G(t);
            y = U(y);
            return this._makeShader(c, g, l, t, y);
          };
          a.PictureRecorder.prototype.beginRecording = function(c) {
            c = U(c);
            return this._beginRecording(c);
          };
          a.Surface.prototype.getCanvas = function() {
            var c = this._getCanvas();
            c.Md = this.Md;
            return c;
          };
          a.Surface.prototype.makeImageSnapshot = function(c) {
            a.Od(this.Md);
            c = v(c, "HEAP32", xb);
            return this._makeImageSnapshot(c);
          };
          a.Surface.prototype.makeSurface = function(c) {
            a.Od(this.Md);
            c = this._makeSurface(c);
            c.Md = this.Md;
            return c;
          };
          a.Surface.prototype.Df = function(c, g) {
            this.He || (this.He = this.getCanvas());
            return requestAnimationFrame(function() {
              a.Od(this.Md);
              c(this.He);
              this.flush(g);
            }.bind(this));
          };
          a.Surface.prototype.requestAnimationFrame || (a.Surface.prototype.requestAnimationFrame = a.Surface.prototype.Df);
          a.Surface.prototype.zf = function(c, g) {
            this.He || (this.He = this.getCanvas());
            requestAnimationFrame(function() {
              a.Od(this.Md);
              c(this.He);
              this.flush(g);
              this.dispose();
            }.bind(this));
          };
          a.Surface.prototype.drawOnce || (a.Surface.prototype.drawOnce = a.Surface.prototype.zf);
          a.PathEffect.MakeDash = function(c, g) {
            g || (g = 0);
            if (!c.length || 1 === c.length % 2)
              throw "Intervals array must have even length";
            var l = v(c, "HEAPF32");
            g = a.PathEffect._MakeDash(l, c.length, g);
            q(l, c);
            return g;
          };
          a.PathEffect.MakeLine2D = function(c, g) {
            g = G(g);
            return a.PathEffect._MakeLine2D(c, g);
          };
          a.PathEffect.MakePath2D = function(c, g) {
            c = G(c);
            return a.PathEffect._MakePath2D(c, g);
          };
          a.Shader.MakeColor = function(c, g) {
            g = g || null;
            c = z(c);
            return a.Shader._MakeColor(c, g);
          };
          a.Shader.Blend = a.Shader.MakeBlend;
          a.Shader.Color = a.Shader.MakeColor;
          a.Shader.MakeLinearGradient = function(c, g, l, t, y, C, J, P) {
            P = P || null;
            var O = E(l), W = v(t, "HEAPF32");
            J = J || 0;
            C = G(C);
            var r = Ha.toTypedArray();
            r.set(c);
            r.set(g, 2);
            c = a.Shader._MakeLinearGradient(ja, O.ce, O.colorType, W, O.count, y, J, C, P);
            q(O.ce, l);
            t && q(W, t);
            return c;
          };
          a.Shader.MakeRadialGradient = function(c, g, l, t, y, C, J, P) {
            P = P || null;
            var O = E(l), W = v(t, "HEAPF32");
            J = J || 0;
            C = G(C);
            c = a.Shader._MakeRadialGradient(c[0], c[1], g, O.ce, O.colorType, W, O.count, y, J, C, P);
            q(O.ce, l);
            t && q(W, t);
            return c;
          };
          a.Shader.MakeSweepGradient = function(c, g, l, t, y, C, J, P, O, W) {
            W = W || null;
            var r = E(l), D = v(t, "HEAPF32");
            J = J || 0;
            P = P || 0;
            O = O || 360;
            C = G(C);
            c = a.Shader._MakeSweepGradient(
              c,
              g,
              r.ce,
              r.colorType,
              D,
              r.count,
              y,
              P,
              O,
              J,
              C,
              W
            );
            q(r.ce, l);
            t && q(D, t);
            return c;
          };
          a.Shader.MakeTwoPointConicalGradient = function(c, g, l, t, y, C, J, P, O, W) {
            W = W || null;
            var r = E(y), D = v(C, "HEAPF32");
            O = O || 0;
            P = G(P);
            var R = Ha.toTypedArray();
            R.set(c);
            R.set(l, 2);
            c = a.Shader._MakeTwoPointConicalGradient(ja, g, t, r.ce, r.colorType, D, r.count, J, O, P, W);
            q(r.ce, y);
            C && q(D, C);
            return c;
          };
          a.Vertices.prototype.bounds = function(c) {
            this._bounds(ja);
            var g = Ha.toTypedArray();
            return c ? (c.set(g), c) : g.slice();
          };
          a.Vd && a.Vd.forEach(function(c) {
            c();
          });
        };
        a.computeTonalColors = function(e) {
          var c = v(e.ambient, "HEAPF32"), g = v(e.spot, "HEAPF32");
          this._computeTonalColors(c, g);
          var l = { ambient: T(c), spot: T(g) };
          q(c, e.ambient);
          q(g, e.spot);
          return l;
        };
        a.LTRBRect = function(e, c, g, l) {
          return Float32Array.of(e, c, g, l);
        };
        a.XYWHRect = function(e, c, g, l) {
          return Float32Array.of(e, c, e + g, c + l);
        };
        a.LTRBiRect = function(e, c, g, l) {
          return Int32Array.of(e, c, g, l);
        };
        a.XYWHiRect = function(e, c, g, l) {
          return Int32Array.of(e, c, e + g, c + l);
        };
        a.RRectXY = function(e, c, g) {
          return Float32Array.of(e[0], e[1], e[2], e[3], c, g, c, g, c, g, c, g);
        };
        a.MakeAnimatedImageFromEncoded = function(e) {
          e = new Uint8Array(e);
          var c = a._malloc(e.byteLength);
          a.HEAPU8.set(e, c);
          return (e = a._decodeAnimatedImage(c, e.byteLength)) ? e : null;
        };
        a.MakeImageFromEncoded = function(e) {
          e = new Uint8Array(e);
          var c = a._malloc(e.byteLength);
          a.HEAPU8.set(e, c);
          return (e = a._decodeImage(c, e.byteLength)) ? e : null;
        };
        var ib = null;
        a.MakeImageFromCanvasImageSource = function(e) {
          var c = e.width, g = e.height;
          ib || (ib = document.createElement("canvas"));
          ib.width = c;
          ib.height = g;
          var l = ib.getContext("2d", { wg: true });
          l.drawImage(e, 0, 0);
          e = l.getImageData(0, 0, c, g);
          return a.MakeImage({ width: c, height: g, alphaType: a.AlphaType.Unpremul, colorType: a.ColorType.RGBA_8888, colorSpace: a.ColorSpace.SRGB }, e.data, 4 * c);
        };
        a.MakeImage = function(e, c, g) {
          var l = a._malloc(c.length);
          a.HEAPU8.set(c, l);
          return a._MakeImage(e, l, c.length, g);
        };
        a.MakeVertices = function(e, c, g, l, t, y) {
          var C = t && t.length || 0, J = 0;
          g && g.length && (J |= 1);
          l && l.length && (J |= 2);
          void 0 === y || y || (J |= 4);
          e = new a._VerticesBuilder(e, c.length / 2, C, J);
          v(c, "HEAPF32", e.positions());
          e.texCoords() && v(g, "HEAPF32", e.texCoords());
          e.colors() && v(m(l), "HEAPU32", e.colors());
          e.indices() && v(t, "HEAPU16", e.indices());
          return e.detach();
        };
        a.Matrix = {};
        a.Matrix.identity = function() {
          return d(3);
        };
        a.Matrix.invert = function(e) {
          var c = e[0] * e[4] * e[8] + e[1] * e[5] * e[6] + e[2] * e[3] * e[7] - e[2] * e[4] * e[6] - e[1] * e[3] * e[8] - e[0] * e[5] * e[7];
          return c ? [(e[4] * e[8] - e[5] * e[7]) / c, (e[2] * e[7] - e[1] * e[8]) / c, (e[1] * e[5] - e[2] * e[4]) / c, (e[5] * e[6] - e[3] * e[8]) / c, (e[0] * e[8] - e[2] * e[6]) / c, (e[2] * e[3] - e[0] * e[5]) / c, (e[3] * e[7] - e[4] * e[6]) / c, (e[1] * e[6] - e[0] * e[7]) / c, (e[0] * e[4] - e[1] * e[3]) / c] : null;
        };
        a.Matrix.mapPoints = function(e, c) {
          for (var g = 0; g < c.length; g += 2) {
            var l = c[g], t = c[g + 1], y = e[6] * l + e[7] * t + e[8], C = e[3] * l + e[4] * t + e[5];
            c[g] = (e[0] * l + e[1] * t + e[2]) / y;
            c[g + 1] = C / y;
          }
          return c;
        };
        a.Matrix.multiply = function() {
          return hb(3, arguments);
        };
        a.Matrix.rotated = function(e, c, g) {
          c = c || 0;
          g = g || 0;
          var l = Math.sin(e);
          e = Math.cos(e);
          return [e, -l, ta(l, g, 1 - e, c), l, e, ta(-l, c, 1 - e, g), 0, 0, 1];
        };
        a.Matrix.scaled = function(e, c, g, l) {
          g = g || 0;
          l = l || 0;
          var t = b([e, c], d(3), 3, 0, 1);
          return b([g - e * g, l - c * l], t, 3, 2, 0);
        };
        a.Matrix.skewed = function(e, c, g, l) {
          g = g || 0;
          l = l || 0;
          var t = b([e, c], d(3), 3, 1, -1);
          return b([-e * g, -c * l], t, 3, 2, 0);
        };
        a.Matrix.translated = function(e, c) {
          return b(arguments, d(3), 3, 2, 0);
        };
        a.Vector = {};
        a.Vector.dot = function(e, c) {
          return e.map(function(g, l) {
            return g * c[l];
          }).reduce(function(g, l) {
            return g + l;
          });
        };
        a.Vector.lengthSquared = function(e) {
          return a.Vector.dot(e, e);
        };
        a.Vector.length = function(e) {
          return Math.sqrt(a.Vector.lengthSquared(e));
        };
        a.Vector.mulScalar = function(e, c) {
          return e.map(function(g) {
            return g * c;
          });
        };
        a.Vector.add = function(e, c) {
          return e.map(function(g, l) {
            return g + c[l];
          });
        };
        a.Vector.sub = function(e, c) {
          return e.map(function(g, l) {
            return g - c[l];
          });
        };
        a.Vector.dist = function(e, c) {
          return a.Vector.length(a.Vector.sub(e, c));
        };
        a.Vector.normalize = function(e) {
          return a.Vector.mulScalar(e, 1 / a.Vector.length(e));
        };
        a.Vector.cross = function(e, c) {
          return [e[1] * c[2] - e[2] * c[1], e[2] * c[0] - e[0] * c[2], e[0] * c[1] - e[1] * c[0]];
        };
        a.M44 = {};
        a.M44.identity = function() {
          return d(4);
        };
        a.M44.translated = function(e) {
          return b(e, d(4), 4, 3, 0);
        };
        a.M44.scaled = function(e) {
          return b(
            e,
            d(4),
            4,
            0,
            1
          );
        };
        a.M44.rotated = function(e, c) {
          return a.M44.rotatedUnitSinCos(a.Vector.normalize(e), Math.sin(c), Math.cos(c));
        };
        a.M44.rotatedUnitSinCos = function(e, c, g) {
          var l = e[0], t = e[1];
          e = e[2];
          var y = 1 - g;
          return [y * l * l + g, y * l * t - c * e, y * l * e + c * t, 0, y * l * t + c * e, y * t * t + g, y * t * e - c * l, 0, y * l * e - c * t, y * t * e + c * l, y * e * e + g, 0, 0, 0, 0, 1];
        };
        a.M44.lookat = function(e, c, g) {
          c = a.Vector.normalize(a.Vector.sub(c, e));
          g = a.Vector.normalize(g);
          g = a.Vector.normalize(a.Vector.cross(c, g));
          var l = a.M44.identity();
          b(g, l, 4, 0, 0);
          b(
            a.Vector.cross(g, c),
            l,
            4,
            1,
            0
          );
          b(a.Vector.mulScalar(c, -1), l, 4, 2, 0);
          b(e, l, 4, 3, 0);
          e = a.M44.invert(l);
          return null === e ? a.M44.identity() : e;
        };
        a.M44.perspective = function(e, c, g) {
          var l = 1 / (c - e);
          g /= 2;
          g = Math.cos(g) / Math.sin(g);
          return [g, 0, 0, 0, 0, g, 0, 0, 0, 0, (c + e) * l, 2 * c * e * l, 0, 0, -1, 1];
        };
        a.M44.rc = function(e, c, g) {
          return e[4 * c + g];
        };
        a.M44.multiply = function() {
          return hb(4, arguments);
        };
        a.M44.invert = function(e) {
          var c = e[0], g = e[4], l = e[8], t = e[12], y = e[1], C = e[5], J = e[9], P = e[13], O = e[2], W = e[6], r = e[10], D = e[14], R = e[3], aa = e[7], ia = e[11];
          e = e[15];
          var qa = c * C - g * y, ua = c * J - l * y, Aa = c * P - t * y, fa = g * J - l * C, I = g * P - t * C, k = l * P - t * J, p = O * aa - W * R, A = O * ia - r * R, B = O * e - D * R, F = W * ia - r * aa, H = W * e - D * aa, M = r * e - D * ia, ba = qa * M - ua * H + Aa * F + fa * B - I * A + k * p, ca = 1 / ba;
          if (0 === ba || Infinity === ca)
            return null;
          qa *= ca;
          ua *= ca;
          Aa *= ca;
          fa *= ca;
          I *= ca;
          k *= ca;
          p *= ca;
          A *= ca;
          B *= ca;
          F *= ca;
          H *= ca;
          M *= ca;
          c = [C * M - J * H + P * F, J * B - y * M - P * A, y * H - C * B + P * p, C * A - y * F - J * p, l * H - g * M - t * F, c * M - l * B + t * A, g * B - c * H - t * p, c * F - g * A + l * p, aa * k - ia * I + e * fa, ia * Aa - R * k - e * ua, R * I - aa * Aa + e * qa, aa * ua - R * fa - ia * qa, r * I - W * k - D * fa, O * k - r * Aa + D * ua, W * Aa - O * I - D * qa, O * fa - W * ua + r * qa];
          return c.every(function(Ia) {
            return !isNaN(Ia) && Infinity !== Ia && -Infinity !== Ia;
          }) ? c : null;
        };
        a.M44.transpose = function(e) {
          return [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];
        };
        a.M44.mustInvert = function(e) {
          e = a.M44.invert(e);
          if (null === e)
            throw "Matrix not invertible";
          return e;
        };
        a.M44.setupCamera = function(e, c, g) {
          var l = a.M44.lookat(g.eye, g.coa, g.up);
          g = a.M44.perspective(g.near, g.far, g.angle);
          c = [(e[2] - e[0]) / 2, (e[3] - e[1]) / 2, c];
          e = a.M44.multiply(a.M44.translated([(e[0] + e[2]) / 2, (e[1] + e[3]) / 2, 0]), a.M44.scaled(c));
          return a.M44.multiply(
            e,
            g,
            l,
            a.M44.mustInvert(e)
          );
        };
        a.ColorMatrix = {};
        a.ColorMatrix.identity = function() {
          var e = new Float32Array(20);
          e[0] = 1;
          e[6] = 1;
          e[12] = 1;
          e[18] = 1;
          return e;
        };
        a.ColorMatrix.scaled = function(e, c, g, l) {
          var t = new Float32Array(20);
          t[0] = e;
          t[6] = c;
          t[12] = g;
          t[18] = l;
          return t;
        };
        var zd = [[6, 7, 11, 12], [0, 10, 2, 12], [0, 1, 5, 6]];
        a.ColorMatrix.rotated = function(e, c, g) {
          var l = a.ColorMatrix.identity();
          e = zd[e];
          l[e[0]] = g;
          l[e[1]] = c;
          l[e[2]] = -c;
          l[e[3]] = g;
          return l;
        };
        a.ColorMatrix.postTranslate = function(e, c, g, l, t) {
          e[4] += c;
          e[9] += g;
          e[14] += l;
          e[19] += t;
          return e;
        };
        a.ColorMatrix.concat = function(e, c) {
          for (var g = new Float32Array(20), l = 0, t = 0; 20 > t; t += 5) {
            for (var y = 0; 4 > y; y++)
              g[l++] = e[t] * c[y] + e[t + 1] * c[y + 5] + e[t + 2] * c[y + 10] + e[t + 3] * c[y + 15];
            g[l++] = e[t] * c[4] + e[t + 1] * c[9] + e[t + 2] * c[14] + e[t + 3] * c[19] + e[t + 4];
          }
          return g;
        };
        (function(e) {
          e.Vd = e.Vd || [];
          e.Vd.push(function() {
            function c(r) {
              if (!r || !r.length)
                return [];
              for (var D = [], R = 0; R < r.length; R += 5) {
                var aa = e.LTRBRect(r[R], r[R + 1], r[R + 2], r[R + 3]), ia = e.TextDirection.LTR;
                0 === r[R + 4] && (ia = e.TextDirection.RTL);
                D.push({ rect: aa, dir: ia });
              }
              e._free(r.byteOffset);
              return D;
            }
            function g(r) {
              r = r || {};
              void 0 === r.weight && (r.weight = e.FontWeight.Normal);
              r.width = r.width || e.FontWidth.Normal;
              r.slant = r.slant || e.FontSlant.Upright;
              return r;
            }
            function l(r) {
              if (!r || !r.length)
                return V;
              for (var D = [], R = 0; R < r.length; R++) {
                var aa = t(r[R]);
                D.push(aa);
              }
              return v(D, "HEAPU32");
            }
            function t(r) {
              if (J[r])
                return J[r];
              var D = oa(r) + 1, R = e._malloc(D);
              ra(r, K, R, D);
              return J[r] = R;
            }
            function y(r) {
              r._colorPtr = z(r.color);
              r._foregroundColorPtr = V;
              r._backgroundColorPtr = V;
              r._decorationColorPtr = V;
              r.foregroundColor && (r._foregroundColorPtr = z(r.foregroundColor, P));
              r.backgroundColor && (r._backgroundColorPtr = z(r.backgroundColor, O));
              r.decorationColor && (r._decorationColorPtr = z(r.decorationColor, W));
              Array.isArray(r.fontFamilies) && r.fontFamilies.length ? (r._fontFamiliesPtr = l(r.fontFamilies), r._fontFamiliesLen = r.fontFamilies.length) : (r._fontFamiliesPtr = V, r._fontFamiliesLen = 0);
              if (r.locale) {
                var D = r.locale;
                r._localePtr = t(D);
                r._localeLen = oa(D) + 1;
              } else
                r._localePtr = V, r._localeLen = 0;
              if (Array.isArray(r.shadows) && r.shadows.length) {
                D = r.shadows;
                var R = D.map(function(fa) {
                  return fa.color || e.BLACK;
                }), aa = D.map(function(fa) {
                  return fa.blurRadius || 0;
                });
                r._shadowLen = D.length;
                for (var ia = e._malloc(8 * D.length), qa = ia / 4, ua = 0; ua < D.length; ua++) {
                  var Aa = D[ua].offset || [0, 0];
                  e.HEAPF32[qa] = Aa[0];
                  e.HEAPF32[qa + 1] = Aa[1];
                  qa += 2;
                }
                r._shadowColorsPtr = E(R).ce;
                r._shadowOffsetsPtr = ia;
                r._shadowBlurRadiiPtr = v(aa, "HEAPF32");
              } else
                r._shadowLen = 0, r._shadowColorsPtr = V, r._shadowOffsetsPtr = V, r._shadowBlurRadiiPtr = V;
              Array.isArray(r.fontFeatures) && r.fontFeatures.length ? (D = r.fontFeatures, R = D.map(function(fa) {
                return fa.name;
              }), aa = D.map(function(fa) {
                return fa.value;
              }), r._fontFeatureLen = D.length, r._fontFeatureNamesPtr = l(R), r._fontFeatureValuesPtr = v(aa, "HEAPU32")) : (r._fontFeatureLen = 0, r._fontFeatureNamesPtr = V, r._fontFeatureValuesPtr = V);
              Array.isArray(r.fontVariations) && r.fontVariations.length ? (D = r.fontVariations, R = D.map(function(fa) {
                return fa.axis;
              }), aa = D.map(function(fa) {
                return fa.value;
              }), r._fontVariationLen = D.length, r._fontVariationAxesPtr = l(R), r._fontVariationValuesPtr = v(aa, "HEAPF32")) : (r._fontVariationLen = 0, r._fontVariationAxesPtr = V, r._fontVariationValuesPtr = V);
            }
            function C(r) {
              e._free(r._fontFamiliesPtr);
              e._free(r._shadowColorsPtr);
              e._free(r._shadowOffsetsPtr);
              e._free(r._shadowBlurRadiiPtr);
              e._free(r._fontFeatureNamesPtr);
              e._free(r._fontFeatureValuesPtr);
              e._free(r._fontVariationAxesPtr);
              e._free(r._fontVariationValuesPtr);
            }
            e.Paragraph.prototype.getRectsForRange = function(r, D, R, aa) {
              r = this._getRectsForRange(r, D, R, aa);
              return c(r);
            };
            e.Paragraph.prototype.getRectsForPlaceholders = function() {
              var r = this._getRectsForPlaceholders();
              return c(r);
            };
            e.TypefaceFontProvider.prototype.registerFont = function(r, D) {
              r = e.Typeface.MakeFreeTypeFaceFromData(r);
              if (!r)
                return null;
              D = t(D);
              this._registerFont(r, D);
            };
            e.ParagraphStyle = function(r) {
              r.disableHinting = r.disableHinting || false;
              if (r.ellipsis) {
                var D = r.ellipsis;
                r._ellipsisPtr = t(D);
                r._ellipsisLen = oa(D) + 1;
              } else
                r._ellipsisPtr = V, r._ellipsisLen = 0;
              null == r.heightMultiplier && (r.heightMultiplier = -1);
              r.maxLines = r.maxLines || 0;
              r.replaceTabCharacters = r.replaceTabCharacters || false;
              D = (D = r.strutStyle) || {};
              D.strutEnabled = D.strutEnabled || false;
              D.strutEnabled && Array.isArray(D.fontFamilies) && D.fontFamilies.length ? (D._fontFamiliesPtr = l(D.fontFamilies), D._fontFamiliesLen = D.fontFamilies.length) : (D._fontFamiliesPtr = V, D._fontFamiliesLen = 0);
              D.fontStyle = g(D.fontStyle);
              null == D.fontSize && (D.fontSize = -1);
              null == D.heightMultiplier && (D.heightMultiplier = -1);
              D.halfLeading = D.halfLeading || false;
              D.leading = D.leading || 0;
              D.forceStrutHeight = D.forceStrutHeight || false;
              r.strutStyle = D;
              r.textAlign = r.textAlign || e.TextAlign.Start;
              r.textDirection = r.textDirection || e.TextDirection.LTR;
              r.textHeightBehavior = r.textHeightBehavior || e.TextHeightBehavior.All;
              r.textStyle = e.TextStyle(r.textStyle);
              return r;
            };
            e.TextStyle = function(r) {
              r.color || (r.color = e.BLACK);
              r.decoration = r.decoration || 0;
              r.decorationThickness = r.decorationThickness || 0;
              r.decorationStyle = r.decorationStyle || e.DecorationStyle.Solid;
              r.textBaseline = r.textBaseline || e.TextBaseline.Alphabetic;
              null == r.fontSize && (r.fontSize = -1);
              r.letterSpacing = r.letterSpacing || 0;
              r.wordSpacing = r.wordSpacing || 0;
              null == r.heightMultiplier && (r.heightMultiplier = -1);
              r.halfLeading = r.halfLeading || false;
              r.fontStyle = g(r.fontStyle);
              return r;
            };
            var J = {}, P = e._malloc(16), O = e._malloc(16), W = e._malloc(16);
            e.ParagraphBuilder.Make = function(r, D) {
              y(r.textStyle);
              D = e.ParagraphBuilder._Make(r, D);
              C(r.textStyle);
              return D;
            };
            e.ParagraphBuilder.MakeFromFontProvider = function(r, D) {
              y(r.textStyle);
              D = e.ParagraphBuilder._MakeFromFontProvider(r, D);
              C(r.textStyle);
              return D;
            };
            e.ParagraphBuilder.MakeFromFontCollection = function(r, D) {
              y(r.textStyle);
              D = e.ParagraphBuilder._MakeFromFontCollection(r, D);
              C(r.textStyle);
              return D;
            };
            e.ParagraphBuilder.ShapeText = function(r, D, R) {
              let aa = 0;
              for (const ia of D)
                aa += ia.length;
              if (aa !== r.length)
                throw "Accumulated block lengths must equal text.length";
              return e.ParagraphBuilder._ShapeText(r, D, R);
            };
            e.ParagraphBuilder.prototype.pushStyle = function(r) {
              y(r);
              this._pushStyle(r);
              C(r);
            };
            e.ParagraphBuilder.prototype.pushPaintStyle = function(r, D, R) {
              y(r);
              this._pushPaintStyle(r, D, R);
              C(r);
            };
            e.ParagraphBuilder.prototype.addPlaceholder = function(r, D, R, aa, ia) {
              R = R || e.PlaceholderAlignment.Baseline;
              aa = aa || e.TextBaseline.Alphabetic;
              this._addPlaceholder(r || 0, D || 0, R, aa, ia || 0);
            };
            e.ParagraphBuilder.prototype.setWordsUtf8 = function(r) {
              var D = v(r, "HEAPU32");
              this._setWordsUtf8(D, r && r.length || 0);
              q(D, r);
            };
            e.ParagraphBuilder.prototype.setWordsUtf16 = function(r) {
              var D = v(r, "HEAPU32");
              this._setWordsUtf16(D, r && r.length || 0);
              q(D, r);
            };
            e.ParagraphBuilder.prototype.setGraphemeBreaksUtf8 = function(r) {
              var D = v(r, "HEAPU32");
              this._setGraphemeBreaksUtf8(D, r && r.length || 0);
              q(D, r);
            };
            e.ParagraphBuilder.prototype.setGraphemeBreaksUtf16 = function(r) {
              var D = v(r, "HEAPU32");
              this._setGraphemeBreaksUtf16(D, r && r.length || 0);
              q(D, r);
            };
            e.ParagraphBuilder.prototype.setLineBreaksUtf8 = function(r) {
              var D = v(r, "HEAPU32");
              this._setLineBreaksUtf8(D, r && r.length || 0);
              q(D, r);
            };
            e.ParagraphBuilder.prototype.setLineBreaksUtf16 = function(r) {
              var D = v(r, "HEAPU32");
              this._setLineBreaksUtf16(D, r && r.length || 0);
              q(D, r);
            };
          });
        })(w);
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          a.Path.prototype.op = function(e, c) {
            return this._op(
              e,
              c
            ) ? this : null;
          };
          a.Path.prototype.simplify = function() {
            return this._simplify() ? this : null;
          };
        });
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          a.Canvas.prototype.drawText = function(e, c, g, l, t) {
            var y = oa(e), C = a._malloc(y + 1);
            ra(e, K, C, y + 1);
            this._drawSimpleText(C, y, c, g, t, l);
            a._free(C);
          };
          a.Canvas.prototype.drawGlyphs = function(e, c, g, l, t, y) {
            if (!(2 * e.length <= c.length))
              throw "Not enough positions for the array of gyphs";
            a.Od(this.Md);
            const C = v(e, "HEAPU16"), J = v(c, "HEAPF32");
            this._drawGlyphs(e.length, C, J, g, l, t, y);
            q(J, c);
            q(C, e);
          };
          a.Font.prototype.getGlyphBounds = function(e, c, g) {
            var l = v(e, "HEAPU16"), t = a._malloc(16 * e.length);
            this._getGlyphWidthBounds(l, e.length, V, t, c || null);
            c = new Float32Array(a.HEAPU8.buffer, t, 4 * e.length);
            q(l, e);
            if (g)
              return g.set(c), a._free(t), g;
            e = Float32Array.from(c);
            a._free(t);
            return e;
          };
          a.Font.prototype.getGlyphIDs = function(e, c, g) {
            c || (c = e.length);
            var l = oa(e) + 1, t = a._malloc(l);
            ra(e, K, t, l);
            e = a._malloc(2 * c);
            c = this._getGlyphIDs(t, l - 1, c, e);
            a._free(t);
            if (0 > c)
              return a._free(e), null;
            t = new Uint16Array(a.HEAPU8.buffer, e, c);
            if (g)
              return g.set(t), a._free(e), g;
            g = Uint16Array.from(t);
            a._free(e);
            return g;
          };
          a.Font.prototype.getGlyphIntercepts = function(e, c, g, l) {
            var t = v(e, "HEAPU16"), y = v(c, "HEAPF32");
            return this._getGlyphIntercepts(t, e.length, !(e && e._ck), y, c.length, !(c && c._ck), g, l);
          };
          a.Font.prototype.getGlyphWidths = function(e, c, g) {
            var l = v(e, "HEAPU16"), t = a._malloc(4 * e.length);
            this._getGlyphWidthBounds(l, e.length, t, V, c || null);
            c = new Float32Array(a.HEAPU8.buffer, t, e.length);
            q(l, e);
            if (g)
              return g.set(c), a._free(t), g;
            e = Float32Array.from(c);
            a._free(t);
            return e;
          };
          a.FontMgr.FromData = function() {
            if (!arguments.length)
              return null;
            var e = arguments;
            1 === e.length && Array.isArray(e[0]) && (e = arguments[0]);
            if (!e.length)
              return null;
            for (var c = [], g = [], l = 0; l < e.length; l++) {
              var t = new Uint8Array(e[l]), y = v(t, "HEAPU8");
              c.push(y);
              g.push(t.byteLength);
            }
            c = v(c, "HEAPU32");
            g = v(g, "HEAPU32");
            e = a.FontMgr._fromData(c, g, e.length);
            a._free(c);
            a._free(g);
            return e;
          };
          a.Typeface.MakeFreeTypeFaceFromData = function(e) {
            e = new Uint8Array(e);
            var c = v(e, "HEAPU8");
            return (e = a.Typeface._MakeFreeTypeFaceFromData(c, e.byteLength)) ? e : null;
          };
          a.Typeface.prototype.getGlyphIDs = function(e, c, g) {
            c || (c = e.length);
            var l = oa(e) + 1, t = a._malloc(l);
            ra(e, K, t, l);
            e = a._malloc(2 * c);
            c = this._getGlyphIDs(t, l - 1, c, e);
            a._free(t);
            if (0 > c)
              return a._free(e), null;
            t = new Uint16Array(a.HEAPU8.buffer, e, c);
            if (g)
              return g.set(t), a._free(e), g;
            g = Uint16Array.from(t);
            a._free(e);
            return g;
          };
          a.TextBlob.MakeOnPath = function(e, c, g, l) {
            if (e && e.length && c && c.countPoints()) {
              if (1 === c.countPoints())
                return this.MakeFromText(e, g);
              l || (l = 0);
              var t = g.getGlyphIDs(e);
              t = g.getGlyphWidths(t);
              var y = [];
              c = new a.ContourMeasureIter(c, false, 1);
              for (var C = c.next(), J = new Float32Array(4), P = 0; P < e.length && C; P++) {
                var O = t[P];
                l += O / 2;
                if (l > C.length()) {
                  C.delete();
                  C = c.next();
                  if (!C) {
                    e = e.substring(0, P);
                    break;
                  }
                  l = O / 2;
                }
                C.getPosTan(l, J);
                var W = J[2], r = J[3];
                y.push(W, r, J[0] - O / 2 * W, J[1] - O / 2 * r);
                l += O / 2;
              }
              e = this.MakeFromRSXform(e, y, g);
              C && C.delete();
              c.delete();
              return e;
            }
          };
          a.TextBlob.MakeFromRSXform = function(e, c, g) {
            var l = oa(e) + 1, t = a._malloc(l);
            ra(e, K, t, l);
            e = v(c, "HEAPF32");
            g = a.TextBlob._MakeFromRSXform(t, l - 1, e, g);
            a._free(t);
            return g ? g : null;
          };
          a.TextBlob.MakeFromRSXformGlyphs = function(e, c, g) {
            var l = v(e, "HEAPU16");
            c = v(c, "HEAPF32");
            g = a.TextBlob._MakeFromRSXformGlyphs(l, 2 * e.length, c, g);
            q(l, e);
            return g ? g : null;
          };
          a.TextBlob.MakeFromGlyphs = function(e, c) {
            var g = v(e, "HEAPU16");
            c = a.TextBlob._MakeFromGlyphs(g, 2 * e.length, c);
            q(g, e);
            return c ? c : null;
          };
          a.TextBlob.MakeFromText = function(e, c) {
            var g = oa(e) + 1, l = a._malloc(g);
            ra(e, K, l, g);
            e = a.TextBlob._MakeFromText(l, g - 1, c);
            a._free(l);
            return e ? e : null;
          };
          a.MallocGlyphIDs = function(e) {
            return a.Malloc(
              Uint16Array,
              e
            );
          };
        });
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          a.MakePicture = function(e) {
            e = new Uint8Array(e);
            var c = a._malloc(e.byteLength);
            a.HEAPU8.set(e, c);
            return (e = a._MakePicture(c, e.byteLength)) ? e : null;
          };
        });
        a.Vd = a.Vd || [];
        a.Vd.push(function() {
          a.RuntimeEffect.Make = function(e, c) {
            return a.RuntimeEffect._Make(e, { onError: c || function(g) {
              console.log("RuntimeEffect error", g);
            } });
          };
          a.RuntimeEffect.prototype.makeShader = function(e, c) {
            var g = !e._ck, l = v(e, "HEAPF32");
            c = G(c);
            return this._makeShader(l, 4 * e.length, g, c);
          };
          a.RuntimeEffect.prototype.makeShaderWithChildren = function(e, c, g) {
            var l = !e._ck, t = v(e, "HEAPF32");
            g = G(g);
            for (var y = [], C = 0; C < c.length; C++)
              y.push(c[C].Ld.Td);
            c = v(y, "HEAPU32");
            return this._makeShaderWithChildren(t, 4 * e.length, l, c, y.length, g);
          };
        });
        (function() {
          function e(I) {
            for (var k = 0; k < I.length; k++)
              if (void 0 !== I[k] && !Number.isFinite(I[k]))
                return false;
            return true;
          }
          function c(I) {
            var k = a.getColorComponents(I);
            I = k[0];
            var p = k[1], A = k[2];
            k = k[3];
            if (1 === k)
              return I = I.toString(16).toLowerCase(), p = p.toString(16).toLowerCase(), A = A.toString(16).toLowerCase(), I = 1 === I.length ? "0" + I : I, p = 1 === p.length ? "0" + p : p, A = 1 === A.length ? "0" + A : A, "#" + I + p + A;
            k = 0 === k || 1 === k ? k : k.toFixed(8);
            return "rgba(" + I + ", " + p + ", " + A + ", " + k + ")";
          }
          function g(I) {
            return a.parseColorString(I, ua);
          }
          function l(I) {
            I = Aa.exec(I);
            if (!I)
              return null;
            var k = parseFloat(I[4]), p = 16;
            switch (I[5]) {
              case "em":
              case "rem":
                p = 16 * k;
                break;
              case "pt":
                p = 4 * k / 3;
                break;
              case "px":
                p = k;
                break;
              case "pc":
                p = 16 * k;
                break;
              case "in":
                p = 96 * k;
                break;
              case "cm":
                p = 96 * k / 2.54;
                break;
              case "mm":
                p = 96 / 25.4 * k;
                break;
              case "q":
                p = 96 / 25.4 / 4 * k;
                break;
              case "%":
                p = 16 / 75 * k;
            }
            return {
              style: I[1],
              variant: I[2],
              weight: I[3],
              sizePx: p,
              family: I[6].trim()
            };
          }
          function t(I) {
            this.Nd = I;
            this.Qd = new a.Paint();
            this.Qd.setAntiAlias(true);
            this.Qd.setStrokeMiter(10);
            this.Qd.setStrokeCap(a.StrokeCap.Butt);
            this.Qd.setStrokeJoin(a.StrokeJoin.Miter);
            this.Qe = "10px monospace";
            this.ne = new a.Font(null, 10);
            this.ne.setSubpixel(true);
            this.be = this.he = a.BLACK;
            this.we = 0;
            this.Je = a.TRANSPARENT;
            this.ye = this.xe = 0;
            this.Ke = this.ke = 1;
            this.Ie = 0;
            this.ve = [];
            this.Pd = a.BlendMode.SrcOver;
            this.Qd.setStrokeWidth(this.Ke);
            this.Qd.setBlendMode(this.Pd);
            this.Sd = new a.Path();
            this.Ud = a.Matrix.identity();
            this.mf = [];
            this.Ce = [];
            this.me = function() {
              this.Sd.delete();
              this.Qd.delete();
              this.ne.delete();
              this.Ce.forEach(function(k) {
                k.me();
              });
            };
            Object.defineProperty(this, "currentTransform", { enumerable: true, get: function() {
              return { a: this.Ud[0], c: this.Ud[1], e: this.Ud[2], b: this.Ud[3], d: this.Ud[4], f: this.Ud[5] };
            }, set: function(k) {
              k.a && this.setTransform(k.a, k.b, k.c, k.d, k.e, k.f);
            } });
            Object.defineProperty(this, "fillStyle", { enumerable: true, get: function() {
              return f(this.be) ? c(this.be) : this.be;
            }, set: function(k) {
              "string" === typeof k ? this.be = g(k) : k.ue && (this.be = k);
            } });
            Object.defineProperty(this, "font", { enumerable: true, get: function() {
              return this.Qe;
            }, set: function(k) {
              var p = l(k), A = p.family;
              p.typeface = fa[A] ? fa[A][(p.style || "normal") + "|" + (p.variant || "normal") + "|" + (p.weight || "normal")] || fa[A]["*"] : null;
              p && (this.ne.setSize(p.sizePx), this.ne.setTypeface(p.typeface), this.Qe = k);
            } });
            Object.defineProperty(this, "globalAlpha", { enumerable: true, get: function() {
              return this.ke;
            }, set: function(k) {
              !isFinite(k) || 0 > k || 1 < k || (this.ke = k);
            } });
            Object.defineProperty(this, "globalCompositeOperation", { enumerable: true, get: function() {
              switch (this.Pd) {
                case a.BlendMode.SrcOver:
                  return "source-over";
                case a.BlendMode.DstOver:
                  return "destination-over";
                case a.BlendMode.Src:
                  return "copy";
                case a.BlendMode.Dst:
                  return "destination";
                case a.BlendMode.Clear:
                  return "clear";
                case a.BlendMode.SrcIn:
                  return "source-in";
                case a.BlendMode.DstIn:
                  return "destination-in";
                case a.BlendMode.SrcOut:
                  return "source-out";
                case a.BlendMode.DstOut:
                  return "destination-out";
                case a.BlendMode.SrcATop:
                  return "source-atop";
                case a.BlendMode.DstATop:
                  return "destination-atop";
                case a.BlendMode.Xor:
                  return "xor";
                case a.BlendMode.Plus:
                  return "lighter";
                case a.BlendMode.Multiply:
                  return "multiply";
                case a.BlendMode.Screen:
                  return "screen";
                case a.BlendMode.Overlay:
                  return "overlay";
                case a.BlendMode.Darken:
                  return "darken";
                case a.BlendMode.Lighten:
                  return "lighten";
                case a.BlendMode.ColorDodge:
                  return "color-dodge";
                case a.BlendMode.ColorBurn:
                  return "color-burn";
                case a.BlendMode.HardLight:
                  return "hard-light";
                case a.BlendMode.SoftLight:
                  return "soft-light";
                case a.BlendMode.Difference:
                  return "difference";
                case a.BlendMode.Exclusion:
                  return "exclusion";
                case a.BlendMode.Hue:
                  return "hue";
                case a.BlendMode.Saturation:
                  return "saturation";
                case a.BlendMode.Color:
                  return "color";
                case a.BlendMode.Luminosity:
                  return "luminosity";
              }
            }, set: function(k) {
              switch (k) {
                case "source-over":
                  this.Pd = a.BlendMode.SrcOver;
                  break;
                case "destination-over":
                  this.Pd = a.BlendMode.DstOver;
                  break;
                case "copy":
                  this.Pd = a.BlendMode.Src;
                  break;
                case "destination":
                  this.Pd = a.BlendMode.Dst;
                  break;
                case "clear":
                  this.Pd = a.BlendMode.Clear;
                  break;
                case "source-in":
                  this.Pd = a.BlendMode.SrcIn;
                  break;
                case "destination-in":
                  this.Pd = a.BlendMode.DstIn;
                  break;
                case "source-out":
                  this.Pd = a.BlendMode.SrcOut;
                  break;
                case "destination-out":
                  this.Pd = a.BlendMode.DstOut;
                  break;
                case "source-atop":
                  this.Pd = a.BlendMode.SrcATop;
                  break;
                case "destination-atop":
                  this.Pd = a.BlendMode.DstATop;
                  break;
                case "xor":
                  this.Pd = a.BlendMode.Xor;
                  break;
                case "lighter":
                  this.Pd = a.BlendMode.Plus;
                  break;
                case "plus-lighter":
                  this.Pd = a.BlendMode.Plus;
                  break;
                case "plus-darker":
                  throw "plus-darker is not supported";
                case "multiply":
                  this.Pd = a.BlendMode.Multiply;
                  break;
                case "screen":
                  this.Pd = a.BlendMode.Screen;
                  break;
                case "overlay":
                  this.Pd = a.BlendMode.Overlay;
                  break;
                case "darken":
                  this.Pd = a.BlendMode.Darken;
                  break;
                case "lighten":
                  this.Pd = a.BlendMode.Lighten;
                  break;
                case "color-dodge":
                  this.Pd = a.BlendMode.ColorDodge;
                  break;
                case "color-burn":
                  this.Pd = a.BlendMode.ColorBurn;
                  break;
                case "hard-light":
                  this.Pd = a.BlendMode.HardLight;
                  break;
                case "soft-light":
                  this.Pd = a.BlendMode.SoftLight;
                  break;
                case "difference":
                  this.Pd = a.BlendMode.Difference;
                  break;
                case "exclusion":
                  this.Pd = a.BlendMode.Exclusion;
                  break;
                case "hue":
                  this.Pd = a.BlendMode.Hue;
                  break;
                case "saturation":
                  this.Pd = a.BlendMode.Saturation;
                  break;
                case "color":
                  this.Pd = a.BlendMode.Color;
                  break;
                case "luminosity":
                  this.Pd = a.BlendMode.Luminosity;
                  break;
                default:
                  return;
              }
              this.Qd.setBlendMode(this.Pd);
            } });
            Object.defineProperty(this, "imageSmoothingEnabled", { enumerable: true, get: function() {
              return true;
            }, set: function() {
            } });
            Object.defineProperty(
              this,
              "imageSmoothingQuality",
              { enumerable: true, get: function() {
                return "high";
              }, set: function() {
              } }
            );
            Object.defineProperty(this, "lineCap", { enumerable: true, get: function() {
              switch (this.Qd.getStrokeCap()) {
                case a.StrokeCap.Butt:
                  return "butt";
                case a.StrokeCap.Round:
                  return "round";
                case a.StrokeCap.Square:
                  return "square";
              }
            }, set: function(k) {
              switch (k) {
                case "butt":
                  this.Qd.setStrokeCap(a.StrokeCap.Butt);
                  break;
                case "round":
                  this.Qd.setStrokeCap(a.StrokeCap.Round);
                  break;
                case "square":
                  this.Qd.setStrokeCap(a.StrokeCap.Square);
              }
            } });
            Object.defineProperty(
              this,
              "lineDashOffset",
              { enumerable: true, get: function() {
                return this.Ie;
              }, set: function(k) {
                isFinite(k) && (this.Ie = k);
              } }
            );
            Object.defineProperty(this, "lineJoin", { enumerable: true, get: function() {
              switch (this.Qd.getStrokeJoin()) {
                case a.StrokeJoin.Miter:
                  return "miter";
                case a.StrokeJoin.Round:
                  return "round";
                case a.StrokeJoin.Bevel:
                  return "bevel";
              }
            }, set: function(k) {
              switch (k) {
                case "miter":
                  this.Qd.setStrokeJoin(a.StrokeJoin.Miter);
                  break;
                case "round":
                  this.Qd.setStrokeJoin(a.StrokeJoin.Round);
                  break;
                case "bevel":
                  this.Qd.setStrokeJoin(a.StrokeJoin.Bevel);
              }
            } });
            Object.defineProperty(this, "lineWidth", { enumerable: true, get: function() {
              return this.Qd.getStrokeWidth();
            }, set: function(k) {
              0 >= k || !k || (this.Ke = k, this.Qd.setStrokeWidth(k));
            } });
            Object.defineProperty(this, "miterLimit", { enumerable: true, get: function() {
              return this.Qd.getStrokeMiter();
            }, set: function(k) {
              0 >= k || !k || this.Qd.setStrokeMiter(k);
            } });
            Object.defineProperty(this, "shadowBlur", { enumerable: true, get: function() {
              return this.we;
            }, set: function(k) {
              0 > k || !isFinite(k) || (this.we = k);
            } });
            Object.defineProperty(
              this,
              "shadowColor",
              { enumerable: true, get: function() {
                return c(this.Je);
              }, set: function(k) {
                this.Je = g(k);
              } }
            );
            Object.defineProperty(this, "shadowOffsetX", { enumerable: true, get: function() {
              return this.xe;
            }, set: function(k) {
              isFinite(k) && (this.xe = k);
            } });
            Object.defineProperty(this, "shadowOffsetY", { enumerable: true, get: function() {
              return this.ye;
            }, set: function(k) {
              isFinite(k) && (this.ye = k);
            } });
            Object.defineProperty(this, "strokeStyle", { enumerable: true, get: function() {
              return c(this.he);
            }, set: function(k) {
              "string" === typeof k ? this.he = g(k) : k.ue && (this.he = k);
            } });
            this.arc = function(k, p, A, B, F, H) {
              D(this.Sd, k, p, A, A, 0, B, F, H);
            };
            this.arcTo = function(k, p, A, B, F) {
              O(this.Sd, k, p, A, B, F);
            };
            this.beginPath = function() {
              this.Sd.delete();
              this.Sd = new a.Path();
            };
            this.bezierCurveTo = function(k, p, A, B, F, H) {
              var M = this.Sd;
              e([k, p, A, B, F, H]) && (M.isEmpty() && M.moveTo(k, p), M.cubicTo(k, p, A, B, F, H));
            };
            this.clearRect = function(k, p, A, B) {
              this.Qd.setStyle(a.PaintStyle.Fill);
              this.Qd.setBlendMode(a.BlendMode.Clear);
              this.Nd.drawRect(a.XYWHRect(k, p, A, B), this.Qd);
              this.Qd.setBlendMode(this.Pd);
            };
            this.clip = function(k, p) {
              "string" === typeof k ? (p = k, k = this.Sd) : k && k.$e && (k = k.Wd);
              k || (k = this.Sd);
              k = k.copy();
              p && "evenodd" === p.toLowerCase() ? k.setFillType(a.FillType.EvenOdd) : k.setFillType(a.FillType.Winding);
              this.Nd.clipPath(k, a.ClipOp.Intersect, true);
              k.delete();
            };
            this.closePath = function() {
              W(this.Sd);
            };
            this.createImageData = function() {
              if (1 === arguments.length) {
                var k = arguments[0];
                return new J(new Uint8ClampedArray(4 * k.width * k.height), k.width, k.height);
              }
              if (2 === arguments.length) {
                k = arguments[0];
                var p = arguments[1];
                return new J(new Uint8ClampedArray(4 * k * p), k, p);
              }
              throw "createImageData expects 1 or 2 arguments, got " + arguments.length;
            };
            this.createLinearGradient = function(k, p, A, B) {
              if (e(arguments)) {
                var F = new P(k, p, A, B);
                this.Ce.push(F);
                return F;
              }
            };
            this.createPattern = function(k, p) {
              k = new ia(k, p);
              this.Ce.push(k);
              return k;
            };
            this.createRadialGradient = function(k, p, A, B, F, H) {
              if (e(arguments)) {
                var M = new qa(k, p, A, B, F, H);
                this.Ce.push(M);
                return M;
              }
            };
            this.drawImage = function(k) {
              k instanceof C && (k = k.tf());
              var p = this.Pe();
              if (3 === arguments.length || 5 === arguments.length)
                var A = a.XYWHRect(arguments[1], arguments[2], arguments[3] || k.width(), arguments[4] || k.height()), B = a.XYWHRect(0, 0, k.width(), k.height());
              else if (9 === arguments.length)
                A = a.XYWHRect(arguments[5], arguments[6], arguments[7], arguments[8]), B = a.XYWHRect(arguments[1], arguments[2], arguments[3], arguments[4]);
              else
                throw "invalid number of args for drawImage, need 3, 5, or 9; got " + arguments.length;
              this.Nd.drawImageRect(k, B, A, p, false);
              p.dispose();
            };
            this.ellipse = function(k, p, A, B, F, H, M, ba) {
              D(this.Sd, k, p, A, B, F, H, M, ba);
            };
            this.Pe = function() {
              var k = this.Qd.copy();
              k.setStyle(a.PaintStyle.Fill);
              if (f(this.be)) {
                var p = a.multiplyByAlpha(this.be, this.ke);
                k.setColor(p);
              } else
                p = this.be.ue(this.Ud), k.setColor(a.Color(0, 0, 0, this.ke)), k.setShader(p);
              k.dispose = function() {
                this.delete();
              };
              return k;
            };
            this.fill = function(k, p) {
              "string" === typeof k ? (p = k, k = this.Sd) : k && k.$e && (k = k.Wd);
              if ("evenodd" === p)
                this.Sd.setFillType(a.FillType.EvenOdd);
              else {
                if ("nonzero" !== p && p)
                  throw "invalid fill rule";
                this.Sd.setFillType(a.FillType.Winding);
              }
              k || (k = this.Sd);
              p = this.Pe();
              var A = this.ze(p);
              A && (this.Nd.save(), this.se(), this.Nd.drawPath(k, A), this.Nd.restore(), A.dispose());
              this.Nd.drawPath(k, p);
              p.dispose();
            };
            this.fillRect = function(k, p, A, B) {
              var F = this.Pe(), H = this.ze(F);
              H && (this.Nd.save(), this.se(), this.Nd.drawRect(a.XYWHRect(k, p, A, B), H), this.Nd.restore(), H.dispose());
              this.Nd.drawRect(a.XYWHRect(k, p, A, B), F);
              F.dispose();
            };
            this.fillText = function(k, p, A) {
              var B = this.Pe();
              k = a.TextBlob.MakeFromText(k, this.ne);
              var F = this.ze(B);
              F && (this.Nd.save(), this.se(), this.Nd.drawTextBlob(k, p, A, F), this.Nd.restore(), F.dispose());
              this.Nd.drawTextBlob(k, p, A, B);
              k.delete();
              B.dispose();
            };
            this.getImageData = function(k, p, A, B) {
              return (k = this.Nd.readPixels(k, p, { width: A, height: B, colorType: a.ColorType.RGBA_8888, alphaType: a.AlphaType.Unpremul, colorSpace: a.ColorSpace.SRGB })) ? new J(new Uint8ClampedArray(k.buffer), A, B) : null;
            };
            this.getLineDash = function() {
              return this.ve.slice();
            };
            this.nf = function(k) {
              var p = a.Matrix.invert(this.Ud);
              a.Matrix.mapPoints(p, k);
              return k;
            };
            this.isPointInPath = function(k, p, A) {
              var B = arguments;
              if (3 === B.length)
                var F = this.Sd;
              else if (4 === B.length)
                F = B[0], k = B[1], p = B[2], A = B[3];
              else
                throw "invalid arg count, need 3 or 4, got " + B.length;
              if (!isFinite(k) || !isFinite(p))
                return false;
              A = A || "nonzero";
              if ("nonzero" !== A && "evenodd" !== A)
                return false;
              B = this.nf([k, p]);
              k = B[0];
              p = B[1];
              F.setFillType("nonzero" === A ? a.FillType.Winding : a.FillType.EvenOdd);
              return F.contains(k, p);
            };
            this.isPointInStroke = function(k, p) {
              var A = arguments;
              if (2 === A.length)
                var B = this.Sd;
              else if (3 === A.length)
                B = A[0], k = A[1], p = A[2];
              else
                throw "invalid arg count, need 2 or 3, got " + A.length;
              if (!isFinite(k) || !isFinite(p))
                return false;
              A = this.nf([k, p]);
              k = A[0];
              p = A[1];
              B = B.copy();
              B.setFillType(a.FillType.Winding);
              B.stroke({ width: this.lineWidth, miter_limit: this.miterLimit, cap: this.Qd.getStrokeCap(), join: this.Qd.getStrokeJoin(), precision: 0.3 });
              A = B.contains(k, p);
              B.delete();
              return A;
            };
            this.lineTo = function(k, p) {
              R(this.Sd, k, p);
            };
            this.measureText = function(k) {
              k = this.ne.getGlyphIDs(k);
              k = this.ne.getGlyphWidths(k);
              let p = 0;
              for (const A of k)
                p += A;
              return { width: p };
            };
            this.moveTo = function(k, p) {
              var A = this.Sd;
              e([k, p]) && A.moveTo(k, p);
            };
            this.putImageData = function(k, p, A, B, F, H, M) {
              if (e([p, A, B, F, H, M])) {
                if (void 0 === B)
                  this.Nd.writePixels(k.data, k.width, k.height, p, A);
                else if (B = B || 0, F = F || 0, H = H || k.width, M = M || k.height, 0 > H && (B += H, H = Math.abs(H)), 0 > M && (F += M, M = Math.abs(M)), 0 > B && (H += B, B = 0), 0 > F && (M += F, F = 0), !(0 >= H || 0 >= M)) {
                  k = a.MakeImage({ width: k.width, height: k.height, alphaType: a.AlphaType.Unpremul, colorType: a.ColorType.RGBA_8888, colorSpace: a.ColorSpace.SRGB }, k.data, 4 * k.width);
                  var ba = a.XYWHRect(B, F, H, M);
                  p = a.XYWHRect(
                    p + B,
                    A + F,
                    H,
                    M
                  );
                  A = a.Matrix.invert(this.Ud);
                  this.Nd.save();
                  this.Nd.concat(A);
                  this.Nd.drawImageRect(k, ba, p, null, false);
                  this.Nd.restore();
                  k.delete();
                }
              }
            };
            this.quadraticCurveTo = function(k, p, A, B) {
              var F = this.Sd;
              e([k, p, A, B]) && (F.isEmpty() && F.moveTo(k, p), F.quadTo(k, p, A, B));
            };
            this.rect = function(k, p, A, B) {
              var F = this.Sd;
              k = a.XYWHRect(k, p, A, B);
              e(k) && F.addRect(k);
            };
            this.resetTransform = function() {
              this.Sd.transform(this.Ud);
              var k = a.Matrix.invert(this.Ud);
              this.Nd.concat(k);
              this.Ud = this.Nd.getTotalMatrix();
            };
            this.restore = function() {
              var k = this.mf.pop();
              if (k) {
                var p = a.Matrix.multiply(this.Ud, a.Matrix.invert(k.Gf));
                this.Sd.transform(p);
                this.Qd.delete();
                this.Qd = k.$f;
                this.ve = k.Yf;
                this.Ke = k.mg;
                this.he = k.lg;
                this.be = k.fs;
                this.xe = k.jg;
                this.ye = k.kg;
                this.we = k.dg;
                this.Je = k.ig;
                this.ke = k.Nf;
                this.Pd = k.Of;
                this.Ie = k.Zf;
                this.Qe = k.Mf;
                this.Nd.restore();
                this.Ud = this.Nd.getTotalMatrix();
              }
            };
            this.rotate = function(k) {
              if (isFinite(k)) {
                var p = a.Matrix.rotated(-k);
                this.Sd.transform(p);
                this.Nd.rotate(k / Math.PI * 180, 0, 0);
                this.Ud = this.Nd.getTotalMatrix();
              }
            };
            this.save = function() {
              if (this.be.te) {
                var k = this.be.te();
                this.Ce.push(k);
              } else
                k = this.be;
              if (this.he.te) {
                var p = this.he.te();
                this.Ce.push(p);
              } else
                p = this.he;
              this.mf.push({ Gf: this.Ud.slice(), Yf: this.ve.slice(), mg: this.Ke, lg: p, fs: k, jg: this.xe, kg: this.ye, dg: this.we, ig: this.Je, Nf: this.ke, Zf: this.Ie, Of: this.Pd, $f: this.Qd.copy(), Mf: this.Qe });
              this.Nd.save();
            };
            this.scale = function(k, p) {
              if (e(arguments)) {
                var A = a.Matrix.scaled(1 / k, 1 / p);
                this.Sd.transform(A);
                this.Nd.scale(k, p);
                this.Ud = this.Nd.getTotalMatrix();
              }
            };
            this.setLineDash = function(k) {
              for (var p = 0; p < k.length; p++)
                if (!isFinite(k[p]) || 0 > k[p])
                  return;
              1 === k.length % 2 && Array.prototype.push.apply(k, k);
              this.ve = k;
            };
            this.setTransform = function(k, p, A, B, F, H) {
              e(arguments) && (this.resetTransform(), this.transform(k, p, A, B, F, H));
            };
            this.se = function() {
              var k = a.Matrix.invert(this.Ud);
              this.Nd.concat(k);
              this.Nd.concat(a.Matrix.translated(this.xe, this.ye));
              this.Nd.concat(this.Ud);
            };
            this.ze = function(k) {
              var p = a.multiplyByAlpha(this.Je, this.ke);
              if (!a.getColorComponents(p)[3] || !(this.we || this.ye || this.xe))
                return null;
              k = k.copy();
              k.setColor(p);
              var A = a.MaskFilter.MakeBlur(a.BlurStyle.Normal, this.we / 2, false);
              k.setMaskFilter(A);
              k.dispose = function() {
                A.delete();
                this.delete();
              };
              return k;
            };
            this.bf = function() {
              var k = this.Qd.copy();
              k.setStyle(a.PaintStyle.Stroke);
              if (f(this.he)) {
                var p = a.multiplyByAlpha(this.he, this.ke);
                k.setColor(p);
              } else
                p = this.he.ue(this.Ud), k.setColor(a.Color(0, 0, 0, this.ke)), k.setShader(p);
              k.setStrokeWidth(this.Ke);
              if (this.ve.length) {
                var A = a.PathEffect.MakeDash(this.ve, this.Ie);
                k.setPathEffect(A);
              }
              k.dispose = function() {
                A && A.delete();
                this.delete();
              };
              return k;
            };
            this.stroke = function(k) {
              k = k ? k.Wd : this.Sd;
              var p = this.bf(), A = this.ze(p);
              A && (this.Nd.save(), this.se(), this.Nd.drawPath(k, A), this.Nd.restore(), A.dispose());
              this.Nd.drawPath(k, p);
              p.dispose();
            };
            this.strokeRect = function(k, p, A, B) {
              var F = this.bf(), H = this.ze(F);
              H && (this.Nd.save(), this.se(), this.Nd.drawRect(a.XYWHRect(k, p, A, B), H), this.Nd.restore(), H.dispose());
              this.Nd.drawRect(a.XYWHRect(k, p, A, B), F);
              F.dispose();
            };
            this.strokeText = function(k, p, A) {
              var B = this.bf();
              k = a.TextBlob.MakeFromText(
                k,
                this.ne
              );
              var F = this.ze(B);
              F && (this.Nd.save(), this.se(), this.Nd.drawTextBlob(k, p, A, F), this.Nd.restore(), F.dispose());
              this.Nd.drawTextBlob(k, p, A, B);
              k.delete();
              B.dispose();
            };
            this.translate = function(k, p) {
              if (e(arguments)) {
                var A = a.Matrix.translated(-k, -p);
                this.Sd.transform(A);
                this.Nd.translate(k, p);
                this.Ud = this.Nd.getTotalMatrix();
              }
            };
            this.transform = function(k, p, A, B, F, H) {
              k = [k, A, F, p, B, H, 0, 0, 1];
              p = a.Matrix.invert(k);
              this.Sd.transform(p);
              this.Nd.concat(k);
              this.Ud = this.Nd.getTotalMatrix();
            };
            this.addHitRegion = function() {
            };
            this.clearHitRegions = function() {
            };
            this.drawFocusIfNeeded = function() {
            };
            this.removeHitRegion = function() {
            };
            this.scrollPathIntoView = function() {
            };
            Object.defineProperty(this, "canvas", { value: null, writable: false });
          }
          function y(I) {
            this.cf = I;
            this.Md = new t(I.getCanvas());
            this.Re = [];
            this.decodeImage = function(k) {
              k = a.MakeImageFromEncoded(k);
              if (!k)
                throw "Invalid input";
              this.Re.push(k);
              return new C(k);
            };
            this.loadFont = function(k, p) {
              k = a.Typeface.MakeFreeTypeFaceFromData(k);
              if (!k)
                return null;
              this.Re.push(k);
              var A = (p.style || "normal") + "|" + (p.variant || "normal") + "|" + (p.weight || "normal");
              p = p.family;
              fa[p] || (fa[p] = { "*": k });
              fa[p][A] = k;
            };
            this.makePath2D = function(k) {
              k = new aa(k);
              this.Re.push(k.Wd);
              return k;
            };
            this.getContext = function(k) {
              return "2d" === k ? this.Md : null;
            };
            this.toDataURL = function(k, p) {
              this.cf.flush();
              var A = this.cf.makeImageSnapshot();
              if (A) {
                k = k || "image/png";
                var B = a.ImageFormat.PNG;
                "image/jpeg" === k && (B = a.ImageFormat.JPEG);
                if (p = A.encodeToBytes(B, p || 0.92)) {
                  A.delete();
                  k = "data:" + k + ";base64,";
                  if ("undefined" !== typeof Buffer)
                    p = Buffer.from(p).toString("base64");
                  else {
                    A = 0;
                    B = p.length;
                    for (var F = "", H; A < B; )
                      H = p.slice(A, Math.min(A + 32768, B)), F += String.fromCharCode.apply(null, H), A += 32768;
                    p = btoa(F);
                  }
                  return k + p;
                }
              }
            };
            this.dispose = function() {
              this.Md.me();
              this.Re.forEach(function(k) {
                k.delete();
              });
              this.cf.dispose();
            };
          }
          function C(I) {
            this.width = I.width();
            this.height = I.height();
            this.naturalWidth = this.width;
            this.naturalHeight = this.height;
            this.tf = function() {
              return I;
            };
          }
          function J(I, k, p) {
            if (!k || 0 === p)
              throw "invalid dimensions, width and height must be non-zero";
            if (I.length % 4)
              throw "arr must be a multiple of 4";
            p = p || I.length / (4 * k);
            Object.defineProperty(this, "data", { value: I, writable: false });
            Object.defineProperty(this, "height", { value: p, writable: false });
            Object.defineProperty(this, "width", { value: k, writable: false });
          }
          function P(I, k, p, A) {
            this.Yd = null;
            this.de = [];
            this.ae = [];
            this.addColorStop = function(B, F) {
              if (0 > B || 1 < B || !isFinite(B))
                throw "offset must be between 0 and 1 inclusively";
              F = g(F);
              var H = this.ae.indexOf(B);
              if (-1 !== H)
                this.de[H] = F;
              else {
                for (H = 0; H < this.ae.length && !(this.ae[H] > B); H++)
                  ;
                this.ae.splice(H, 0, B);
                this.de.splice(
                  H,
                  0,
                  F
                );
              }
            };
            this.te = function() {
              var B = new P(I, k, p, A);
              B.de = this.de.slice();
              B.ae = this.ae.slice();
              return B;
            };
            this.me = function() {
              this.Yd && (this.Yd.delete(), this.Yd = null);
            };
            this.ue = function(B) {
              var F = [I, k, p, A];
              a.Matrix.mapPoints(B, F);
              B = F[0];
              var H = F[1], M = F[2];
              F = F[3];
              this.me();
              return this.Yd = a.Shader.MakeLinearGradient([B, H], [M, F], this.de, this.ae, a.TileMode.Clamp);
            };
          }
          function O(I, k, p, A, B, F) {
            if (e([k, p, A, B, F])) {
              if (0 > F)
                throw "radii cannot be negative";
              I.isEmpty() && I.moveTo(k, p);
              I.arcToTangent(k, p, A, B, F);
            }
          }
          function W(I) {
            if (!I.isEmpty()) {
              var k = I.getBounds();
              (k[3] - k[1] || k[2] - k[0]) && I.close();
            }
          }
          function r(I, k, p, A, B, F, H) {
            H = (H - F) / Math.PI * 180;
            F = F / Math.PI * 180;
            k = a.LTRBRect(k - A, p - B, k + A, p + B);
            1e-5 > Math.abs(Math.abs(H) - 360) ? (p = H / 2, I.arcToOval(k, F, p, false), I.arcToOval(k, F + p, p, false)) : I.arcToOval(k, F, H, false);
          }
          function D(I, k, p, A, B, F, H, M, ba) {
            if (e([k, p, A, B, F, H, M])) {
              if (0 > A || 0 > B)
                throw "radii cannot be negative";
              var ca = 2 * Math.PI, Ia = H % ca;
              0 > Ia && (Ia += ca);
              var bb = Ia - H;
              H = Ia;
              M += bb;
              !ba && M - H >= ca ? M = H + ca : ba && H - M >= ca ? M = H - ca : !ba && H > M ? M = H + (ca - (H - M) % ca) : ba && H < M && (M = H - (ca - (M - H) % ca));
              F ? (ba = a.Matrix.rotated(F, k, p), F = a.Matrix.rotated(-F, k, p), I.transform(F), r(I, k, p, A, B, H, M), I.transform(ba)) : r(I, k, p, A, B, H, M);
            }
          }
          function R(I, k, p) {
            e([k, p]) && (I.isEmpty() && I.moveTo(k, p), I.lineTo(k, p));
          }
          function aa(I) {
            this.Wd = null;
            this.Wd = "string" === typeof I ? a.Path.MakeFromSVGString(I) : I && I.$e ? I.Wd.copy() : new a.Path();
            this.$e = function() {
              return this.Wd;
            };
            this.addPath = function(k, p) {
              p || (p = { a: 1, c: 0, e: 0, b: 0, d: 1, f: 0 });
              this.Wd.addPath(k.Wd, [p.a, p.c, p.e, p.b, p.d, p.f]);
            };
            this.arc = function(k, p, A, B, F, H) {
              D(
                this.Wd,
                k,
                p,
                A,
                A,
                0,
                B,
                F,
                H
              );
            };
            this.arcTo = function(k, p, A, B, F) {
              O(this.Wd, k, p, A, B, F);
            };
            this.bezierCurveTo = function(k, p, A, B, F, H) {
              var M = this.Wd;
              e([k, p, A, B, F, H]) && (M.isEmpty() && M.moveTo(k, p), M.cubicTo(k, p, A, B, F, H));
            };
            this.closePath = function() {
              W(this.Wd);
            };
            this.ellipse = function(k, p, A, B, F, H, M, ba) {
              D(this.Wd, k, p, A, B, F, H, M, ba);
            };
            this.lineTo = function(k, p) {
              R(this.Wd, k, p);
            };
            this.moveTo = function(k, p) {
              var A = this.Wd;
              e([k, p]) && A.moveTo(k, p);
            };
            this.quadraticCurveTo = function(k, p, A, B) {
              var F = this.Wd;
              e([k, p, A, B]) && (F.isEmpty() && F.moveTo(k, p), F.quadTo(k, p, A, B));
            };
            this.rect = function(k, p, A, B) {
              var F = this.Wd;
              k = a.XYWHRect(k, p, A, B);
              e(k) && F.addRect(k);
            };
          }
          function ia(I, k) {
            this.Yd = null;
            I instanceof C && (I = I.tf());
            this.Bf = I;
            this._transform = a.Matrix.identity();
            "" === k && (k = "repeat");
            switch (k) {
              case "repeat-x":
                this.Ae = a.TileMode.Repeat;
                this.Be = a.TileMode.Decal;
                break;
              case "repeat-y":
                this.Ae = a.TileMode.Decal;
                this.Be = a.TileMode.Repeat;
                break;
              case "repeat":
                this.Be = this.Ae = a.TileMode.Repeat;
                break;
              case "no-repeat":
                this.Be = this.Ae = a.TileMode.Decal;
                break;
              default:
                throw "invalid repetition mode " + k;
            }
            this.setTransform = function(p) {
              p = [p.a, p.c, p.e, p.b, p.d, p.f, 0, 0, 1];
              e(p) && (this._transform = p);
            };
            this.te = function() {
              var p = new ia();
              p.Ae = this.Ae;
              p.Be = this.Be;
              return p;
            };
            this.me = function() {
              this.Yd && (this.Yd.delete(), this.Yd = null);
            };
            this.ue = function() {
              this.me();
              return this.Yd = this.Bf.makeShaderCubic(this.Ae, this.Be, 1 / 3, 1 / 3, this._transform);
            };
          }
          function qa(I, k, p, A, B, F) {
            this.Yd = null;
            this.de = [];
            this.ae = [];
            this.addColorStop = function(H, M) {
              if (0 > H || 1 < H || !isFinite(H))
                throw "offset must be between 0 and 1 inclusively";
              M = g(M);
              var ba = this.ae.indexOf(H);
              if (-1 !== ba)
                this.de[ba] = M;
              else {
                for (ba = 0; ba < this.ae.length && !(this.ae[ba] > H); ba++)
                  ;
                this.ae.splice(ba, 0, H);
                this.de.splice(ba, 0, M);
              }
            };
            this.te = function() {
              var H = new qa(I, k, p, A, B, F);
              H.de = this.de.slice();
              H.ae = this.ae.slice();
              return H;
            };
            this.me = function() {
              this.Yd && (this.Yd.delete(), this.Yd = null);
            };
            this.ue = function(H) {
              var M = [I, k, A, B];
              a.Matrix.mapPoints(H, M);
              var ba = M[0], ca = M[1], Ia = M[2];
              M = M[3];
              var bb = (Math.abs(H[0]) + Math.abs(H[4])) / 2;
              H = p * bb;
              bb *= F;
              this.me();
              return this.Yd = a.Shader.MakeTwoPointConicalGradient([
                ba,
                ca
              ], H, [Ia, M], bb, this.de, this.ae, a.TileMode.Clamp);
            };
          }
          a._testing = {};
          var ua = {
            aliceblue: Float32Array.of(0.941, 0.973, 1, 1),
            antiquewhite: Float32Array.of(0.98, 0.922, 0.843, 1),
            aqua: Float32Array.of(0, 1, 1, 1),
            aquamarine: Float32Array.of(0.498, 1, 0.831, 1),
            azure: Float32Array.of(0.941, 1, 1, 1),
            beige: Float32Array.of(0.961, 0.961, 0.863, 1),
            bisque: Float32Array.of(1, 0.894, 0.769, 1),
            black: Float32Array.of(0, 0, 0, 1),
            blanchedalmond: Float32Array.of(1, 0.922, 0.804, 1),
            blue: Float32Array.of(0, 0, 1, 1),
            blueviolet: Float32Array.of(0.541, 0.169, 0.886, 1),
            brown: Float32Array.of(
              0.647,
              0.165,
              0.165,
              1
            ),
            burlywood: Float32Array.of(0.871, 0.722, 0.529, 1),
            cadetblue: Float32Array.of(0.373, 0.62, 0.627, 1),
            chartreuse: Float32Array.of(0.498, 1, 0, 1),
            chocolate: Float32Array.of(0.824, 0.412, 0.118, 1),
            coral: Float32Array.of(1, 0.498, 0.314, 1),
            cornflowerblue: Float32Array.of(0.392, 0.584, 0.929, 1),
            cornsilk: Float32Array.of(1, 0.973, 0.863, 1),
            crimson: Float32Array.of(0.863, 0.078, 0.235, 1),
            cyan: Float32Array.of(0, 1, 1, 1),
            darkblue: Float32Array.of(0, 0, 0.545, 1),
            darkcyan: Float32Array.of(0, 0.545, 0.545, 1),
            darkgoldenrod: Float32Array.of(
              0.722,
              0.525,
              0.043,
              1
            ),
            darkgray: Float32Array.of(0.663, 0.663, 0.663, 1),
            darkgreen: Float32Array.of(0, 0.392, 0, 1),
            darkgrey: Float32Array.of(0.663, 0.663, 0.663, 1),
            darkkhaki: Float32Array.of(0.741, 0.718, 0.42, 1),
            darkmagenta: Float32Array.of(0.545, 0, 0.545, 1),
            darkolivegreen: Float32Array.of(0.333, 0.42, 0.184, 1),
            darkorange: Float32Array.of(1, 0.549, 0, 1),
            darkorchid: Float32Array.of(0.6, 0.196, 0.8, 1),
            darkred: Float32Array.of(0.545, 0, 0, 1),
            darksalmon: Float32Array.of(0.914, 0.588, 0.478, 1),
            darkseagreen: Float32Array.of(0.561, 0.737, 0.561, 1),
            darkslateblue: Float32Array.of(
              0.282,
              0.239,
              0.545,
              1
            ),
            darkslategray: Float32Array.of(0.184, 0.31, 0.31, 1),
            darkslategrey: Float32Array.of(0.184, 0.31, 0.31, 1),
            darkturquoise: Float32Array.of(0, 0.808, 0.82, 1),
            darkviolet: Float32Array.of(0.58, 0, 0.827, 1),
            deeppink: Float32Array.of(1, 0.078, 0.576, 1),
            deepskyblue: Float32Array.of(0, 0.749, 1, 1),
            dimgray: Float32Array.of(0.412, 0.412, 0.412, 1),
            dimgrey: Float32Array.of(0.412, 0.412, 0.412, 1),
            dodgerblue: Float32Array.of(0.118, 0.565, 1, 1),
            firebrick: Float32Array.of(0.698, 0.133, 0.133, 1),
            floralwhite: Float32Array.of(1, 0.98, 0.941, 1),
            forestgreen: Float32Array.of(
              0.133,
              0.545,
              0.133,
              1
            ),
            fuchsia: Float32Array.of(1, 0, 1, 1),
            gainsboro: Float32Array.of(0.863, 0.863, 0.863, 1),
            ghostwhite: Float32Array.of(0.973, 0.973, 1, 1),
            gold: Float32Array.of(1, 0.843, 0, 1),
            goldenrod: Float32Array.of(0.855, 0.647, 0.125, 1),
            gray: Float32Array.of(0.502, 0.502, 0.502, 1),
            green: Float32Array.of(0, 0.502, 0, 1),
            greenyellow: Float32Array.of(0.678, 1, 0.184, 1),
            grey: Float32Array.of(0.502, 0.502, 0.502, 1),
            honeydew: Float32Array.of(0.941, 1, 0.941, 1),
            hotpink: Float32Array.of(1, 0.412, 0.706, 1),
            indianred: Float32Array.of(0.804, 0.361, 0.361, 1),
            indigo: Float32Array.of(
              0.294,
              0,
              0.51,
              1
            ),
            ivory: Float32Array.of(1, 1, 0.941, 1),
            khaki: Float32Array.of(0.941, 0.902, 0.549, 1),
            lavender: Float32Array.of(0.902, 0.902, 0.98, 1),
            lavenderblush: Float32Array.of(1, 0.941, 0.961, 1),
            lawngreen: Float32Array.of(0.486, 0.988, 0, 1),
            lemonchiffon: Float32Array.of(1, 0.98, 0.804, 1),
            lightblue: Float32Array.of(0.678, 0.847, 0.902, 1),
            lightcoral: Float32Array.of(0.941, 0.502, 0.502, 1),
            lightcyan: Float32Array.of(0.878, 1, 1, 1),
            lightgoldenrodyellow: Float32Array.of(0.98, 0.98, 0.824, 1),
            lightgray: Float32Array.of(0.827, 0.827, 0.827, 1),
            lightgreen: Float32Array.of(
              0.565,
              0.933,
              0.565,
              1
            ),
            lightgrey: Float32Array.of(0.827, 0.827, 0.827, 1),
            lightpink: Float32Array.of(1, 0.714, 0.757, 1),
            lightsalmon: Float32Array.of(1, 0.627, 0.478, 1),
            lightseagreen: Float32Array.of(0.125, 0.698, 0.667, 1),
            lightskyblue: Float32Array.of(0.529, 0.808, 0.98, 1),
            lightslategray: Float32Array.of(0.467, 0.533, 0.6, 1),
            lightslategrey: Float32Array.of(0.467, 0.533, 0.6, 1),
            lightsteelblue: Float32Array.of(0.69, 0.769, 0.871, 1),
            lightyellow: Float32Array.of(1, 1, 0.878, 1),
            lime: Float32Array.of(0, 1, 0, 1),
            limegreen: Float32Array.of(0.196, 0.804, 0.196, 1),
            linen: Float32Array.of(
              0.98,
              0.941,
              0.902,
              1
            ),
            magenta: Float32Array.of(1, 0, 1, 1),
            maroon: Float32Array.of(0.502, 0, 0, 1),
            mediumaquamarine: Float32Array.of(0.4, 0.804, 0.667, 1),
            mediumblue: Float32Array.of(0, 0, 0.804, 1),
            mediumorchid: Float32Array.of(0.729, 0.333, 0.827, 1),
            mediumpurple: Float32Array.of(0.576, 0.439, 0.859, 1),
            mediumseagreen: Float32Array.of(0.235, 0.702, 0.443, 1),
            mediumslateblue: Float32Array.of(0.482, 0.408, 0.933, 1),
            mediumspringgreen: Float32Array.of(0, 0.98, 0.604, 1),
            mediumturquoise: Float32Array.of(0.282, 0.82, 0.8, 1),
            mediumvioletred: Float32Array.of(
              0.78,
              0.082,
              0.522,
              1
            ),
            midnightblue: Float32Array.of(0.098, 0.098, 0.439, 1),
            mintcream: Float32Array.of(0.961, 1, 0.98, 1),
            mistyrose: Float32Array.of(1, 0.894, 0.882, 1),
            moccasin: Float32Array.of(1, 0.894, 0.71, 1),
            navajowhite: Float32Array.of(1, 0.871, 0.678, 1),
            navy: Float32Array.of(0, 0, 0.502, 1),
            oldlace: Float32Array.of(0.992, 0.961, 0.902, 1),
            olive: Float32Array.of(0.502, 0.502, 0, 1),
            olivedrab: Float32Array.of(0.42, 0.557, 0.137, 1),
            orange: Float32Array.of(1, 0.647, 0, 1),
            orangered: Float32Array.of(1, 0.271, 0, 1),
            orchid: Float32Array.of(0.855, 0.439, 0.839, 1),
            palegoldenrod: Float32Array.of(
              0.933,
              0.91,
              0.667,
              1
            ),
            palegreen: Float32Array.of(0.596, 0.984, 0.596, 1),
            paleturquoise: Float32Array.of(0.686, 0.933, 0.933, 1),
            palevioletred: Float32Array.of(0.859, 0.439, 0.576, 1),
            papayawhip: Float32Array.of(1, 0.937, 0.835, 1),
            peachpuff: Float32Array.of(1, 0.855, 0.725, 1),
            peru: Float32Array.of(0.804, 0.522, 0.247, 1),
            pink: Float32Array.of(1, 0.753, 0.796, 1),
            plum: Float32Array.of(0.867, 0.627, 0.867, 1),
            powderblue: Float32Array.of(0.69, 0.878, 0.902, 1),
            purple: Float32Array.of(0.502, 0, 0.502, 1),
            rebeccapurple: Float32Array.of(0.4, 0.2, 0.6, 1),
            red: Float32Array.of(1, 0, 0, 1),
            rosybrown: Float32Array.of(0.737, 0.561, 0.561, 1),
            royalblue: Float32Array.of(0.255, 0.412, 0.882, 1),
            saddlebrown: Float32Array.of(0.545, 0.271, 0.075, 1),
            salmon: Float32Array.of(0.98, 0.502, 0.447, 1),
            sandybrown: Float32Array.of(0.957, 0.643, 0.376, 1),
            seagreen: Float32Array.of(0.18, 0.545, 0.341, 1),
            seashell: Float32Array.of(1, 0.961, 0.933, 1),
            sienna: Float32Array.of(0.627, 0.322, 0.176, 1),
            silver: Float32Array.of(0.753, 0.753, 0.753, 1),
            skyblue: Float32Array.of(0.529, 0.808, 0.922, 1),
            slateblue: Float32Array.of(0.416, 0.353, 0.804, 1),
            slategray: Float32Array.of(
              0.439,
              0.502,
              0.565,
              1
            ),
            slategrey: Float32Array.of(0.439, 0.502, 0.565, 1),
            snow: Float32Array.of(1, 0.98, 0.98, 1),
            springgreen: Float32Array.of(0, 1, 0.498, 1),
            steelblue: Float32Array.of(0.275, 0.51, 0.706, 1),
            tan: Float32Array.of(0.824, 0.706, 0.549, 1),
            teal: Float32Array.of(0, 0.502, 0.502, 1),
            thistle: Float32Array.of(0.847, 0.749, 0.847, 1),
            tomato: Float32Array.of(1, 0.388, 0.278, 1),
            transparent: Float32Array.of(0, 0, 0, 0),
            turquoise: Float32Array.of(0.251, 0.878, 0.816, 1),
            violet: Float32Array.of(0.933, 0.51, 0.933, 1),
            wheat: Float32Array.of(0.961, 0.871, 0.702, 1),
            white: Float32Array.of(
              1,
              1,
              1,
              1
            ),
            whitesmoke: Float32Array.of(0.961, 0.961, 0.961, 1),
            yellow: Float32Array.of(1, 1, 0, 1),
            yellowgreen: Float32Array.of(0.604, 0.804, 0.196, 1)
          };
          a._testing.parseColor = g;
          a._testing.colorToString = c;
          var Aa = RegExp("(italic|oblique|normal|)\\s*(small-caps|normal|)\\s*(bold|bolder|lighter|[1-9]00|normal|)\\s*([\\d\\.]+)(px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q)(.+)"), fa = { "Noto Mono": { "*": null }, monospace: { "*": null } };
          a._testing.parseFontString = l;
          a.MakeCanvas = function(I, k) {
            return (I = a.MakeSurface(I, k)) ? new y(I) : null;
          };
          a.ImageData = function() {
            if (2 === arguments.length) {
              var I = arguments[0], k = arguments[1];
              return new J(new Uint8ClampedArray(4 * I * k), I, k);
            }
            if (3 === arguments.length) {
              var p = arguments[0];
              if (p.prototype.constructor !== Uint8ClampedArray)
                throw "bytes must be given as a Uint8ClampedArray";
              I = arguments[1];
              k = arguments[2];
              if (p % 4)
                throw "bytes must be given in a multiple of 4";
              if (p % I)
                throw "bytes must divide evenly by width";
              if (k && k !== p / (4 * I))
                throw "invalid height given";
              return new J(p, I, p / (4 * I));
            }
            throw "invalid number of arguments - takes 2 or 3, saw " + arguments.length;
          };
        })();
      })(w);
      var sa = Object.assign({}, w), va = "./this.program", wa = (a, b) => {
        throw b;
      }, xa = "object" == typeof window, ya = "function" == typeof importScripts, za = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, Ba = "", Ca, Da, Ea, fs, Fa, Ga;
      if (za)
        Ba = ya ? require$$0.dirname(Ba) + "/" : __dirname + "/", Ga = () => {
          Fa || (fs = require$$1, Fa = require$$0);
        }, Ca = function(a, b) {
          Ga();
          a = Fa.normalize(a);
          return fs.readFileSync(a, b ? void 0 : "utf8");
        }, Ea = (a) => {
          a = Ca(a, true);
          a.buffer || (a = new Uint8Array(a));
          return a;
        }, Da = (a, b, d) => {
          Ga();
          a = Fa.normalize(a);
          fs.readFile(a, function(f, h) {
            f ? d(f) : b(h.buffer);
          });
        }, 1 < process.argv.length && (va = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2), process.on("unhandledRejection", function(a) {
          throw a;
        }), wa = (a, b) => {
          if (noExitRuntime)
            throw process.exitCode = a, b;
          b instanceof Ja || Ka("exiting due to exception: " + b);
          process.exit(a);
        }, w.inspect = function() {
          return "[Emscripten Module object]";
        };
      else if (xa || ya)
        ya ? Ba = self.location.href : "undefined" != typeof document && document.currentScript && (Ba = document.currentScript.src), _scriptDir && (Ba = _scriptDir), 0 !== Ba.indexOf("blob:") ? Ba = Ba.substr(0, Ba.replace(/[?#].*/, "").lastIndexOf("/") + 1) : Ba = "", Ca = (a) => {
          var b = new XMLHttpRequest();
          b.open("GET", a, false);
          b.send(null);
          return b.responseText;
        }, ya && (Ea = (a) => {
          var b = new XMLHttpRequest();
          b.open(
            "GET",
            a,
            false
          );
          b.responseType = "arraybuffer";
          b.send(null);
          return new Uint8Array(b.response);
        }), Da = (a, b, d) => {
          var f = new XMLHttpRequest();
          f.open("GET", a, true);
          f.responseType = "arraybuffer";
          f.onload = () => {
            200 == f.status || 0 == f.status && f.response ? b(f.response) : d();
          };
          f.onerror = d;
          f.send(null);
        };
      var La = w.print || console.log.bind(console), Ka = w.printErr || console.warn.bind(console);
      Object.assign(w, sa);
      sa = null;
      w.thisProgram && (va = w.thisProgram);
      w.quit && (wa = w.quit);
      var Ma = 0, Na;
      w.wasmBinary && (Na = w.wasmBinary);
      var noExitRuntime = w.noExitRuntime || true;
      "object" != typeof WebAssembly && Qa("no native wasm support detected");
      var Ra, Sa = false, Ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
      function Va(a, b, d) {
        var f = b + d;
        for (d = b; a[d] && !(d >= f); )
          ++d;
        if (16 < d - b && a.buffer && Ta)
          return Ta.decode(a.subarray(b, d));
        for (f = ""; b < d; ) {
          var h = a[b++];
          if (h & 128) {
            var m = a[b++] & 63;
            if (192 == (h & 224))
              f += String.fromCharCode((h & 31) << 6 | m);
            else {
              var u = a[b++] & 63;
              h = 224 == (h & 240) ? (h & 15) << 12 | m << 6 | u : (h & 7) << 18 | m << 12 | u << 6 | a[b++] & 63;
              65536 > h ? f += String.fromCharCode(h) : (h -= 65536, f += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
            }
          } else
            f += String.fromCharCode(h);
        }
        return f;
      }
      function Wa(a, b) {
        return a ? Va(K, a, b) : "";
      }
      function ra(a, b, d, f) {
        if (!(0 < f))
          return 0;
        var h = d;
        f = d + f - 1;
        for (var m = 0; m < a.length; ++m) {
          var u = a.charCodeAt(m);
          if (55296 <= u && 57343 >= u) {
            var n = a.charCodeAt(++m);
            u = 65536 + ((u & 1023) << 10) | n & 1023;
          }
          if (127 >= u) {
            if (d >= f)
              break;
            b[d++] = u;
          } else {
            if (2047 >= u) {
              if (d + 1 >= f)
                break;
              b[d++] = 192 | u >> 6;
            } else {
              if (65535 >= u) {
                if (d + 2 >= f)
                  break;
                b[d++] = 224 | u >> 12;
              } else {
                if (d + 3 >= f)
                  break;
                b[d++] = 240 | u >> 18;
                b[d++] = 128 | u >> 12 & 63;
              }
              b[d++] = 128 | u >> 6 & 63;
            }
            b[d++] = 128 | u & 63;
          }
        }
        b[d] = 0;
        return d - h;
      }
      function oa(a) {
        for (var b = 0, d = 0; d < a.length; ++d) {
          var f = a.charCodeAt(d);
          55296 <= f && 57343 >= f && (f = 65536 + ((f & 1023) << 10) | a.charCodeAt(++d) & 1023);
          127 >= f ? ++b : b = 2047 >= f ? b + 2 : 65535 >= f ? b + 3 : b + 4;
        }
        return b;
      }
      var Xa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;
      function Ya(a, b) {
        var d = a >> 1;
        for (var f = d + b / 2; !(d >= f) && Za[d]; )
          ++d;
        d <<= 1;
        if (32 < d - a && Xa)
          return Xa.decode(K.subarray(a, d));
        d = "";
        for (f = 0; !(f >= b / 2); ++f) {
          var h = $a[a + 2 * f >> 1];
          if (0 == h)
            break;
          d += String.fromCharCode(h);
        }
        return d;
      }
      function cb(a, b, d) {
        void 0 === d && (d = 2147483647);
        if (2 > d)
          return 0;
        d -= 2;
        var f = b;
        d = d < 2 * a.length ? d / 2 : a.length;
        for (var h = 0; h < d; ++h)
          $a[b >> 1] = a.charCodeAt(h), b += 2;
        $a[b >> 1] = 0;
        return b - f;
      }
      function db(a) {
        return 2 * a.length;
      }
      function eb(a, b) {
        for (var d = 0, f = ""; !(d >= b / 4); ) {
          var h = Q[a + 4 * d >> 2];
          if (0 == h)
            break;
          ++d;
          65536 <= h ? (h -= 65536, f += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023)) : f += String.fromCharCode(h);
        }
        return f;
      }
      function fb(a, b, d) {
        void 0 === d && (d = 2147483647);
        if (4 > d)
          return 0;
        var f = b;
        d = f + d - 4;
        for (var h = 0; h < a.length; ++h) {
          var m = a.charCodeAt(h);
          if (55296 <= m && 57343 >= m) {
            var u = a.charCodeAt(++h);
            m = 65536 + ((m & 1023) << 10) | u & 1023;
          }
          Q[b >> 2] = m;
          b += 4;
          if (b + 4 > d)
            break;
        }
        Q[b >> 2] = 0;
        return b - f;
      }
      function jb(a) {
        for (var b = 0, d = 0; d < a.length; ++d) {
          var f = a.charCodeAt(d);
          55296 <= f && 57343 >= f && ++d;
          b += 4;
        }
        return b;
      }
      var kb, lb, K, $a, Za, Q, mb, S, nb;
      function ob() {
        var a = Ra.buffer;
        kb = a;
        w.HEAP8 = lb = new Int8Array(a);
        w.HEAP16 = $a = new Int16Array(a);
        w.HEAP32 = Q = new Int32Array(a);
        w.HEAPU8 = K = new Uint8Array(a);
        w.HEAPU16 = Za = new Uint16Array(a);
        w.HEAPU32 = mb = new Uint32Array(a);
        w.HEAPF32 = S = new Float32Array(a);
        w.HEAPF64 = nb = new Float64Array(a);
      }
      var pb, qb = [], rb = [], sb = [];
      function tb() {
        var a = w.preRun.shift();
        qb.unshift(a);
      }
      var ub = 0, wb = null;
      function Qa(a) {
        if (w.onAbort)
          w.onAbort(a);
        a = "Aborted(" + a + ")";
        Ka(a);
        Sa = true;
        a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
        ea(a);
        throw a;
      }
      function yb() {
        return zb.startsWith("data:application/octet-stream;base64,");
      }
      var zb;
      zb = "canvaskit.wasm";
      if (!yb()) {
        var Ab = zb;
        zb = w.locateFile ? w.locateFile(Ab, Ba) : Ba + Ab;
      }
      function Bb() {
        var a = zb;
        try {
          if (a == zb && Na)
            return new Uint8Array(Na);
          if (Ea)
            return Ea(a);
          throw "both async and sync fetching of the wasm failed";
        } catch (b) {
          Qa(b);
        }
      }
      function Cb() {
        if (!Na && (xa || ya)) {
          if ("function" == typeof fetch && !zb.startsWith("file://"))
            return fetch(zb, { credentials: "same-origin" }).then(function(a) {
              if (!a.ok)
                throw "failed to load wasm binary file at '" + zb + "'";
              return a.arrayBuffer();
            }).catch(function() {
              return Bb();
            });
          if (Da)
            return new Promise(function(a, b) {
              Da(zb, function(d) {
                a(new Uint8Array(d));
              }, b);
            });
        }
        return Promise.resolve().then(function() {
          return Bb();
        });
      }
      function Db(a) {
        for (; 0 < a.length; )
          a.shift()(w);
      }
      function Eb(a) {
        return pb.get(a);
      }
      var Fb = {};
      function Gb(a) {
        for (; a.length; ) {
          var b = a.pop();
          a.pop()(b);
        }
      }
      function Hb(a) {
        return this.fromWireType(Q[a >> 2]);
      }
      var Ib = {}, Jb = {}, Kb = {};
      function Lb(a) {
        if (void 0 === a)
          return "_unknown";
        a = a.replace(/[^a-zA-Z0-9_]/g, "$");
        var b = a.charCodeAt(0);
        return 48 <= b && 57 >= b ? "_" + a : a;
      }
      function Mb(a, b) {
        a = Lb(a);
        return function() {
          return b.apply(this, arguments);
        };
      }
      function Nb(a) {
        var b = Error, d = Mb(a, function(f) {
          this.name = a;
          this.message = f;
          f = Error(f).stack;
          void 0 !== f && (this.stack = this.toString() + "\n" + f.replace(/^Error(:[^\n]*)?\n/, ""));
        });
        d.prototype = Object.create(b.prototype);
        d.prototype.constructor = d;
        d.prototype.toString = function() {
          return void 0 === this.message ? this.name : this.name + ": " + this.message;
        };
        return d;
      }
      var Ob = void 0;
      function Pb(a) {
        throw new Ob(a);
      }
      function Qb(a, b, d) {
        function f(n) {
          n = d(n);
          n.length !== a.length && Pb("Mismatched type converter count");
          for (var q = 0; q < a.length; ++q)
            Rb(a[q], n[q]);
        }
        a.forEach(function(n) {
          Kb[n] = b;
        });
        var h = Array(b.length), m = [], u = 0;
        b.forEach((n, q) => {
          Jb.hasOwnProperty(n) ? h[q] = Jb[n] : (m.push(n), Ib.hasOwnProperty(n) || (Ib[n] = []), Ib[n].push(() => {
            h[q] = Jb[n];
            ++u;
            u === m.length && f(h);
          }));
        });
        0 === m.length && f(h);
      }
      function Sb(a) {
        switch (a) {
          case 1:
            return 0;
          case 2:
            return 1;
          case 4:
            return 2;
          case 8:
            return 3;
          default:
            throw new TypeError("Unknown type size: " + a);
        }
      }
      var Tb = void 0;
      function ac(a) {
        for (var b = ""; K[a]; )
          b += Tb[K[a++]];
        return b;
      }
      var bc = void 0;
      function X(a) {
        throw new bc(a);
      }
      function Rb(a, b, d = {}) {
        if (!("argPackAdvance" in b))
          throw new TypeError("registerType registeredInstance requires argPackAdvance");
        var f = b.name;
        a || X('type "' + f + '" must have a positive integer typeid pointer');
        if (Jb.hasOwnProperty(a)) {
          if (d.Vf)
            return;
          X("Cannot register type '" + f + "' twice");
        }
        Jb[a] = b;
        delete Kb[a];
        Ib.hasOwnProperty(a) && (b = Ib[a], delete Ib[a], b.forEach((h) => h()));
      }
      function cc(a) {
        X(a.Ld.Xd.Rd.name + " instance already deleted");
      }
      var dc = false;
      function ec() {
      }
      function fc(a) {
        --a.count.value;
        0 === a.count.value && (a.$d ? a.fe.le(a.$d) : a.Xd.Rd.le(a.Td));
      }
      function gc(a, b, d) {
        if (b === d)
          return a;
        if (void 0 === d.ie)
          return null;
        a = gc(a, b, d.ie);
        return null === a ? null : d.Jf(a);
      }
      var hc = {}, ic = [];
      function jc() {
        for (; ic.length; ) {
          var a = ic.pop();
          a.Ld.Fe = false;
          a["delete"]();
        }
      }
      var kc = void 0, lc = {};
      function mc(a, b) {
        for (void 0 === b && X("ptr should not be undefined"); a.ie; )
          b = a.Oe(b), a = a.ie;
        return lc[b];
      }
      function nc(a, b) {
        b.Xd && b.Td || Pb("makeClassHandle requires ptr and ptrType");
        !!b.fe !== !!b.$d && Pb("Both smartPtrType and smartPtr must be specified");
        b.count = { value: 1 };
        return oc(Object.create(a, { Ld: { value: b } }));
      }
      function oc(a) {
        if ("undefined" === typeof FinalizationRegistry)
          return oc = (b) => b, a;
        dc = new FinalizationRegistry((b) => {
          fc(b.Ld);
        });
        oc = (b) => {
          var d = b.Ld;
          d.$d && dc.register(b, { Ld: d }, b);
          return b;
        };
        ec = (b) => {
          dc.unregister(b);
        };
        return oc(a);
      }
      function pc() {
      }
      function qc(a, b, d) {
        if (void 0 === a[b].Zd) {
          var f = a[b];
          a[b] = function() {
            a[b].Zd.hasOwnProperty(arguments.length) || X("Function '" + d + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].Zd + ")!");
            return a[b].Zd[arguments.length].apply(this, arguments);
          };
          a[b].Zd = [];
          a[b].Zd[f.De] = f;
        }
      }
      function rc(a, b, d) {
        w.hasOwnProperty(a) ? ((void 0 === d || void 0 !== w[a].Zd && void 0 !== w[a].Zd[d]) && X("Cannot register public name '" + a + "' twice"), qc(w, a, a), w.hasOwnProperty(d) && X("Cannot register multiple overloads of a function with the same number of arguments (" + d + ")!"), w[a].Zd[d] = b) : (w[a] = b, void 0 !== d && (w[a].tg = d));
      }
      function sc(a, b, d, f, h, m, u, n) {
        this.name = a;
        this.constructor = b;
        this.Ge = d;
        this.le = f;
        this.ie = h;
        this.Pf = m;
        this.Oe = u;
        this.Jf = n;
        this.bg = [];
      }
      function tc(a, b, d) {
        for (; b !== d; )
          b.Oe || X("Expected null or instance of " + d.name + ", got an instance of " + b.name), a = b.Oe(a), b = b.ie;
        return a;
      }
      function uc(a, b) {
        if (null === b)
          return this.ff && X("null is not a valid " + this.name), 0;
        b.Ld || X('Cannot pass "' + vc(b) + '" as a ' + this.name);
        b.Ld.Td || X("Cannot pass deleted object as a pointer of type " + this.name);
        return tc(b.Ld.Td, b.Ld.Xd.Rd, this.Rd);
      }
      function wc(a, b) {
        if (null === b) {
          this.ff && X("null is not a valid " + this.name);
          if (this.Ue) {
            var d = this.gf();
            null !== a && a.push(this.le, d);
            return d;
          }
          return 0;
        }
        b.Ld || X('Cannot pass "' + vc(b) + '" as a ' + this.name);
        b.Ld.Td || X("Cannot pass deleted object as a pointer of type " + this.name);
        !this.Te && b.Ld.Xd.Te && X("Cannot convert argument of type " + (b.Ld.fe ? b.Ld.fe.name : b.Ld.Xd.name) + " to parameter type " + this.name);
        d = tc(b.Ld.Td, b.Ld.Xd.Rd, this.Rd);
        if (this.Ue)
          switch (void 0 === b.Ld.$d && X("Passing raw pointer to smart pointer is illegal"), this.hg) {
            case 0:
              b.Ld.fe === this ? d = b.Ld.$d : X("Cannot convert argument of type " + (b.Ld.fe ? b.Ld.fe.name : b.Ld.Xd.name) + " to parameter type " + this.name);
              break;
            case 1:
              d = b.Ld.$d;
              break;
            case 2:
              if (b.Ld.fe === this)
                d = b.Ld.$d;
              else {
                var f = b.clone();
                d = this.cg(d, xc(function() {
                  f["delete"]();
                }));
                null !== a && a.push(this.le, d);
              }
              break;
            default:
              X("Unsupporting sharing policy");
          }
        return d;
      }
      function yc(a, b) {
        if (null === b)
          return this.ff && X("null is not a valid " + this.name), 0;
        b.Ld || X('Cannot pass "' + vc(b) + '" as a ' + this.name);
        b.Ld.Td || X("Cannot pass deleted object as a pointer of type " + this.name);
        b.Ld.Xd.Te && X("Cannot convert argument of type " + b.Ld.Xd.name + " to parameter type " + this.name);
        return tc(b.Ld.Td, b.Ld.Xd.Rd, this.Rd);
      }
      function zc(a, b, d, f, h, m, u, n, q, v, E) {
        this.name = a;
        this.Rd = b;
        this.ff = d;
        this.Te = f;
        this.Ue = h;
        this.ag = m;
        this.hg = u;
        this.vf = n;
        this.gf = q;
        this.cg = v;
        this.le = E;
        h || void 0 !== b.ie ? this.toWireType = wc : (this.toWireType = f ? uc : yc, this.ee = null);
      }
      function Ac(a, b, d) {
        w.hasOwnProperty(a) || Pb("Replacing nonexistant public symbol");
        void 0 !== w[a].Zd && void 0 !== d ? w[a].Zd[d] = b : (w[a] = b, w[a].De = d);
      }
      function Bc(a, b) {
        var d = [];
        return function() {
          d.length = 0;
          Object.assign(d, arguments);
          if (a.includes("j")) {
            var f = w["dynCall_" + a];
            f = d && d.length ? f.apply(null, [b].concat(d)) : f.call(null, b);
          } else
            f = Eb(b).apply(null, d);
          return f;
        };
      }
      function Ic(a, b) {
        a = ac(a);
        var d = a.includes("j") ? Bc(a, b) : Eb(b);
        "function" != typeof d && X("unknown function pointer with signature " + a + ": " + b);
        return d;
      }
      var Jc = void 0;
      function Kc(a) {
        a = Lc(a);
        var b = ac(a);
        Mc(a);
        return b;
      }
      function Nc(a, b) {
        function d(m) {
          h[m] || Jb[m] || (Kb[m] ? Kb[m].forEach(d) : (f.push(m), h[m] = true));
        }
        var f = [], h = {};
        b.forEach(d);
        throw new Jc(a + ": " + f.map(Kc).join([", "]));
      }
      function Oc(a, b, d, f, h) {
        var m = b.length;
        2 > m && X("argTypes array size mismatch! Must at least get return value and 'this' types!");
        var u = null !== b[1] && null !== d, n = false;
        for (d = 1; d < b.length; ++d)
          if (null !== b[d] && void 0 === b[d].ee) {
            n = true;
            break;
          }
        var q = "void" !== b[0].name, v = m - 2, E = Array(v), G = [], L = [];
        return function() {
          arguments.length !== v && X("function " + a + " called with " + arguments.length + " arguments, expected " + v + " args!");
          L.length = 0;
          G.length = u ? 2 : 1;
          G[0] = h;
          if (u) {
            var z = b[1].toWireType(L, this);
            G[1] = z;
          }
          for (var N = 0; N < v; ++N)
            E[N] = b[N + 2].toWireType(L, arguments[N]), G.push(E[N]);
          N = f.apply(null, G);
          if (n)
            Gb(L);
          else
            for (var T = u ? 1 : 2; T < b.length; T++) {
              var U = 1 === T ? z : E[T - 2];
              null !== b[T].ee && b[T].ee(U);
            }
          z = q ? b[0].fromWireType(N) : void 0;
          return z;
        };
      }
      function Pc(a, b) {
        for (var d = [], f = 0; f < a; f++)
          d.push(mb[b + 4 * f >> 2]);
        return d;
      }
      var Qc = [], Rc = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
      function Sc(a) {
        4 < a && 0 === --Rc[a].hf && (Rc[a] = void 0, Qc.push(a));
      }
      var Tc = (a) => {
        a || X("Cannot use deleted val. handle = " + a);
        return Rc[a].value;
      }, xc = (a) => {
        switch (a) {
          case void 0:
            return 1;
          case null:
            return 2;
          case true:
            return 3;
          case false:
            return 4;
          default:
            var b = Qc.length ? Qc.pop() : Rc.length;
            Rc[b] = { hf: 1, value: a };
            return b;
        }
      };
      function Uc(a, b, d) {
        switch (b) {
          case 0:
            return function(f) {
              return this.fromWireType((d ? lb : K)[f]);
            };
          case 1:
            return function(f) {
              return this.fromWireType((d ? $a : Za)[f >> 1]);
            };
          case 2:
            return function(f) {
              return this.fromWireType((d ? Q : mb)[f >> 2]);
            };
          default:
            throw new TypeError("Unknown integer type: " + a);
        }
      }
      function Vc(a, b) {
        var d = Jb[a];
        void 0 === d && X(b + " has unknown type " + Kc(a));
        return d;
      }
      function vc(a) {
        if (null === a)
          return "null";
        var b = typeof a;
        return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
      }
      function Wc(a, b) {
        switch (b) {
          case 2:
            return function(d) {
              return this.fromWireType(S[d >> 2]);
            };
          case 3:
            return function(d) {
              return this.fromWireType(nb[d >> 3]);
            };
          default:
            throw new TypeError("Unknown float type: " + a);
        }
      }
      function Xc(a, b, d) {
        switch (b) {
          case 0:
            return d ? function(f) {
              return lb[f];
            } : function(f) {
              return K[f];
            };
          case 1:
            return d ? function(f) {
              return $a[f >> 1];
            } : function(f) {
              return Za[f >> 1];
            };
          case 2:
            return d ? function(f) {
              return Q[f >> 2];
            } : function(f) {
              return mb[f >> 2];
            };
          default:
            throw new TypeError("Unknown integer type: " + a);
        }
      }
      var Yc = {};
      function Zc(a) {
        var b = Yc[a];
        return void 0 === b ? ac(a) : b;
      }
      var $c = [];
      function ad() {
        function a(b) {
          b.$$$embind_global$$$ = b;
          var d = "object" == typeof $$$embind_global$$$ && b.$$$embind_global$$$ == b;
          d || delete b.$$$embind_global$$$;
          return d;
        }
        if ("object" == typeof globalThis)
          return globalThis;
        if ("object" == typeof $$$embind_global$$$)
          return $$$embind_global$$$;
        "object" == typeof commonjsGlobal && a(commonjsGlobal) ? $$$embind_global$$$ = commonjsGlobal : "object" == typeof self && a(self) && ($$$embind_global$$$ = self);
        if ("object" == typeof $$$embind_global$$$)
          return $$$embind_global$$$;
        throw Error("unable to get global object.");
      }
      function bd(a) {
        var b = $c.length;
        $c.push(a);
        return b;
      }
      function cd(a, b) {
        for (var d = Array(a), f = 0; f < a; ++f)
          d[f] = Vc(mb[b + 4 * f >> 2], "parameter " + f);
        return d;
      }
      var dd = [];
      function ed(a) {
        var b = Array(a + 1);
        return function(d, f, h) {
          b[0] = d;
          for (var m = 0; m < a; ++m) {
            var u = Vc(mb[f + 4 * m >> 2], "parameter " + m);
            b[m + 1] = u.readValueFromPointer(h);
            h += u.argPackAdvance;
          }
          d = new (d.bind.apply(d, b))();
          return xc(d);
        };
      }
      var fd = {}, gd;
      gd = za ? () => {
        var a = process.hrtime();
        return 1e3 * a[0] + a[1] / 1e6;
      } : () => performance.now();
      function hd(a) {
        var b = a.getExtension("ANGLE_instanced_arrays");
        b && (a.vertexAttribDivisor = function(d, f) {
          b.vertexAttribDivisorANGLE(d, f);
        }, a.drawArraysInstanced = function(d, f, h, m) {
          b.drawArraysInstancedANGLE(d, f, h, m);
        }, a.drawElementsInstanced = function(d, f, h, m, u) {
          b.drawElementsInstancedANGLE(d, f, h, m, u);
        });
      }
      function jd(a) {
        var b = a.getExtension("OES_vertex_array_object");
        b && (a.createVertexArray = function() {
          return b.createVertexArrayOES();
        }, a.deleteVertexArray = function(d) {
          b.deleteVertexArrayOES(d);
        }, a.bindVertexArray = function(d) {
          b.bindVertexArrayOES(d);
        }, a.isVertexArray = function(d) {
          return b.isVertexArrayOES(d);
        });
      }
      function kd(a) {
        var b = a.getExtension("WEBGL_draw_buffers");
        b && (a.drawBuffers = function(d, f) {
          b.drawBuffersWEBGL(d, f);
        });
      }
      var ld = 1, md = [], nd = [], od = [], pd = [], ka = [], qd = [], rd = [], na = [], sd = [], td = [], ud = {}, vd = {}, wd = 4;
      function xd(a) {
        Ad || (Ad = a);
      }
      function ha(a) {
        for (var b = ld++, d = a.length; d < b; d++)
          a[d] = null;
        return b;
      }
      function la(a, b) {
        a.lf || (a.lf = a.getContext, a.getContext = function(f, h) {
          h = a.lf(f, h);
          return "webgl" == f == h instanceof WebGLRenderingContext ? h : null;
        });
        var d = 1 < b.majorVersion ? a.getContext("webgl2", b) : a.getContext("webgl", b);
        return d ? Bd(d, b) : 0;
      }
      function Bd(a, b) {
        var d = ha(na), f = { Uf: d, attributes: b, version: b.majorVersion, ge: a };
        a.canvas && (a.canvas.yf = f);
        na[d] = f;
        ("undefined" == typeof b.Kf || b.Kf) && Cd(f);
        return d;
      }
      function ma(a) {
        x = na[a];
        w.rg = Y = x && x.ge;
        return !(a && !Y);
      }
      function Cd(a) {
        a || (a = x);
        if (!a.Wf) {
          a.Wf = true;
          var b = a.ge;
          hd(b);
          jd(b);
          kd(b);
          b.qf = b.getExtension("WEBGL_draw_instanced_base_vertex_base_instance");
          b.uf = b.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance");
          2 <= a.version && (b.rf = b.getExtension("EXT_disjoint_timer_query_webgl2"));
          if (2 > a.version || !b.rf)
            b.rf = b.getExtension("EXT_disjoint_timer_query");
          b.sg = b.getExtension("WEBGL_multi_draw");
          (b.getSupportedExtensions() || []).forEach(function(d) {
            d.includes("lose_context") || d.includes("debug") || b.getExtension(d);
          });
        }
      }
      var x, Ad, Dd = [];
      function Ed(a, b, d, f) {
        for (var h = 0; h < a; h++) {
          var m = Y[d](), u = m && ha(f);
          m ? (m.name = u, f[u] = m) : xd(1282);
          Q[b + 4 * h >> 2] = u;
        }
      }
      function Fd(a, b, d) {
        if (b) {
          var f = void 0;
          switch (a) {
            case 36346:
              f = 1;
              break;
            case 36344:
              0 != d && 1 != d && xd(1280);
              return;
            case 34814:
            case 36345:
              f = 0;
              break;
            case 34466:
              var h = Y.getParameter(34467);
              f = h ? h.length : 0;
              break;
            case 33309:
              if (2 > x.version) {
                xd(1282);
                return;
              }
              f = 2 * (Y.getSupportedExtensions() || []).length;
              break;
            case 33307:
            case 33308:
              if (2 > x.version) {
                xd(1280);
                return;
              }
              f = 33307 == a ? 3 : 0;
          }
          if (void 0 === f)
            switch (h = Y.getParameter(a), typeof h) {
              case "number":
                f = h;
                break;
              case "boolean":
                f = h ? 1 : 0;
                break;
              case "string":
                xd(1280);
                return;
              case "object":
                if (null === h)
                  switch (a) {
                    case 34964:
                    case 35725:
                    case 34965:
                    case 36006:
                    case 36007:
                    case 32873:
                    case 34229:
                    case 36662:
                    case 36663:
                    case 35053:
                    case 35055:
                    case 36010:
                    case 35097:
                    case 35869:
                    case 32874:
                    case 36389:
                    case 35983:
                    case 35368:
                    case 34068:
                      f = 0;
                      break;
                    default:
                      xd(1280);
                      return;
                  }
                else {
                  if (h instanceof Float32Array || h instanceof Uint32Array || h instanceof Int32Array || h instanceof Array) {
                    for (a = 0; a < h.length; ++a)
                      switch (d) {
                        case 0:
                          Q[b + 4 * a >> 2] = h[a];
                          break;
                        case 2:
                          S[b + 4 * a >> 2] = h[a];
                          break;
                        case 4:
                          lb[b + a >> 0] = h[a] ? 1 : 0;
                      }
                    return;
                  }
                  try {
                    f = h.name | 0;
                  } catch (m) {
                    xd(1280);
                    Ka("GL_INVALID_ENUM in glGet" + d + "v: Unknown object returned from WebGL getParameter(" + a + ")! (error: " + m + ")");
                    return;
                  }
                }
                break;
              default:
                xd(1280);
                Ka("GL_INVALID_ENUM in glGet" + d + "v: Native code calling glGet" + d + "v(" + a + ") and it returns " + h + " of type " + typeof h + "!");
                return;
            }
          switch (d) {
            case 1:
              d = f;
              mb[b >> 2] = d;
              mb[b + 4 >> 2] = (d - mb[b >> 2]) / 4294967296;
              break;
            case 0:
              Q[b >> 2] = f;
              break;
            case 2:
              S[b >> 2] = f;
              break;
            case 4:
              lb[b >> 0] = f ? 1 : 0;
          }
        } else
          xd(1281);
      }
      function Gd(a) {
        var b = oa(a) + 1, d = Hd(b);
        ra(a, K, d, b);
        return d;
      }
      function Id(a) {
        return "]" == a.slice(-1) && a.lastIndexOf("[");
      }
      function Jd(a) {
        a -= 5120;
        return 0 == a ? lb : 1 == a ? K : 2 == a ? $a : 4 == a ? Q : 6 == a ? S : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? mb : Za;
      }
      function Kd(a, b, d, f, h) {
        a = Jd(a);
        var m = 31 - Math.clz32(a.BYTES_PER_ELEMENT), u = wd;
        return a.subarray(h >> m, h + f * (d * ({ 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4, 26917: 2, 26918: 2, 29846: 3, 29847: 4 }[b - 6402] || 1) * (1 << m) + u - 1 & -u) >> m);
      }
      function Z(a) {
        var b = Y.Hf;
        if (b) {
          var d = b.Ne[a];
          "number" == typeof d && (b.Ne[a] = d = Y.getUniformLocation(b, b.wf[a] + (0 < d ? "[" + d + "]" : "")));
          return d;
        }
        xd(1282);
      }
      var Ld = [], Md = [], Nd = {};
      function Od() {
        if (!Pd) {
          var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: va || "./this.program" }, b;
          for (b in Nd)
            void 0 === Nd[b] ? delete a[b] : a[b] = Nd[b];
          var d = [];
          for (b in a)
            d.push(b + "=" + a[b]);
          Pd = d;
        }
        return Pd;
      }
      var Pd, Qd = [null, [], []];
      function Rd(a) {
        return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400);
      }
      var Sd = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Td = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function Ud(a, b, d, f) {
        function h(z, N, T) {
          for (z = "number" == typeof z ? z.toString() : z || ""; z.length < N; )
            z = T[0] + z;
          return z;
        }
        function m(z, N) {
          return h(z, N, "0");
        }
        function u(z, N) {
          function T(pa) {
            return 0 > pa ? -1 : 0 < pa ? 1 : 0;
          }
          var U;
          0 === (U = T(z.getFullYear() - N.getFullYear())) && 0 === (U = T(z.getMonth() - N.getMonth())) && (U = T(z.getDate() - N.getDate()));
          return U;
        }
        function n(z) {
          switch (z.getDay()) {
            case 0:
              return new Date(z.getFullYear() - 1, 11, 29);
            case 1:
              return z;
            case 2:
              return new Date(z.getFullYear(), 0, 3);
            case 3:
              return new Date(
                z.getFullYear(),
                0,
                2
              );
            case 4:
              return new Date(z.getFullYear(), 0, 1);
            case 5:
              return new Date(z.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(z.getFullYear() - 1, 11, 30);
          }
        }
        function q(z) {
          var N = z.pe;
          for (z = new Date(new Date(z.qe + 1900, 0, 1).getTime()); 0 < N; ) {
            var T = z.getMonth(), U = (Rd(z.getFullYear()) ? Sd : Td)[T];
            if (N > U - z.getDate())
              N -= U - z.getDate() + 1, z.setDate(1), 11 > T ? z.setMonth(T + 1) : (z.setMonth(0), z.setFullYear(z.getFullYear() + 1));
            else {
              z.setDate(z.getDate() + N);
              break;
            }
          }
          T = new Date(z.getFullYear() + 1, 0, 4);
          N = n(new Date(
            z.getFullYear(),
            0,
            4
          ));
          T = n(T);
          return 0 >= u(N, z) ? 0 >= u(T, z) ? z.getFullYear() + 1 : z.getFullYear() : z.getFullYear() - 1;
        }
        var v = Q[f + 40 >> 2];
        f = { pg: Q[f >> 2], og: Q[f + 4 >> 2], Ye: Q[f + 8 >> 2], jf: Q[f + 12 >> 2], Ze: Q[f + 16 >> 2], qe: Q[f + 20 >> 2], je: Q[f + 24 >> 2], pe: Q[f + 28 >> 2], vg: Q[f + 32 >> 2], ng: Q[f + 36 >> 2], qg: v ? Wa(v) : "" };
        d = Wa(d);
        v = {
          "%c": "%a %b %d %H:%M:%S %Y",
          "%D": "%m/%d/%y",
          "%F": "%Y-%m-%d",
          "%h": "%b",
          "%r": "%I:%M:%S %p",
          "%R": "%H:%M",
          "%T": "%H:%M:%S",
          "%x": "%m/%d/%y",
          "%X": "%H:%M:%S",
          "%Ec": "%c",
          "%EC": "%C",
          "%Ex": "%m/%d/%y",
          "%EX": "%H:%M:%S",
          "%Ey": "%y",
          "%EY": "%Y",
          "%Od": "%d",
          "%Oe": "%e",
          "%OH": "%H",
          "%OI": "%I",
          "%Om": "%m",
          "%OM": "%M",
          "%OS": "%S",
          "%Ou": "%u",
          "%OU": "%U",
          "%OV": "%V",
          "%Ow": "%w",
          "%OW": "%W",
          "%Oy": "%y"
        };
        for (var E in v)
          d = d.replace(new RegExp(E, "g"), v[E]);
        var G = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), L = "January February March April May June July August September October November December".split(" ");
        v = {
          "%a": function(z) {
            return G[z.je].substring(0, 3);
          },
          "%A": function(z) {
            return G[z.je];
          },
          "%b": function(z) {
            return L[z.Ze].substring(0, 3);
          },
          "%B": function(z) {
            return L[z.Ze];
          },
          "%C": function(z) {
            return m((z.qe + 1900) / 100 | 0, 2);
          },
          "%d": function(z) {
            return m(z.jf, 2);
          },
          "%e": function(z) {
            return h(z.jf, 2, " ");
          },
          "%g": function(z) {
            return q(z).toString().substring(2);
          },
          "%G": function(z) {
            return q(z);
          },
          "%H": function(z) {
            return m(z.Ye, 2);
          },
          "%I": function(z) {
            z = z.Ye;
            0 == z ? z = 12 : 12 < z && (z -= 12);
            return m(z, 2);
          },
          "%j": function(z) {
            for (var N = 0, T = 0; T <= z.Ze - 1; N += (Rd(z.qe + 1900) ? Sd : Td)[T++])
              ;
            return m(z.jf + N, 3);
          },
          "%m": function(z) {
            return m(z.Ze + 1, 2);
          },
          "%M": function(z) {
            return m(z.og, 2);
          },
          "%n": function() {
            return "\n";
          },
          "%p": function(z) {
            return 0 <= z.Ye && 12 > z.Ye ? "AM" : "PM";
          },
          "%S": function(z) {
            return m(z.pg, 2);
          },
          "%t": function() {
            return "	";
          },
          "%u": function(z) {
            return z.je || 7;
          },
          "%U": function(z) {
            return m(Math.floor((z.pe + 7 - z.je) / 7), 2);
          },
          "%V": function(z) {
            var N = Math.floor((z.pe + 7 - (z.je + 6) % 7) / 7);
            2 >= (z.je + 371 - z.pe - 2) % 7 && N++;
            if (N)
              53 == N && (T = (z.je + 371 - z.pe) % 7, 4 == T || 3 == T && Rd(z.qe) || (N = 1));
            else {
              N = 52;
              var T = (z.je + 7 - z.pe - 1) % 7;
              (4 == T || 5 == T && Rd(z.qe % 400 - 1)) && N++;
            }
            return m(N, 2);
          },
          "%w": function(z) {
            return z.je;
          },
          "%W": function(z) {
            return m(Math.floor((z.pe + 7 - (z.je + 6) % 7) / 7), 2);
          },
          "%y": function(z) {
            return (z.qe + 1900).toString().substring(2);
          },
          "%Y": function(z) {
            return z.qe + 1900;
          },
          "%z": function(z) {
            z = z.ng;
            var N = 0 <= z;
            z = Math.abs(z) / 60;
            return (N ? "+" : "-") + String("0000" + (z / 60 * 100 + z % 60)).slice(-4);
          },
          "%Z": function(z) {
            return z.qg;
          },
          "%%": function() {
            return "%";
          }
        };
        d = d.replace(/%%/g, "\0\0");
        for (E in v)
          d.includes(E) && (d = d.replace(new RegExp(E, "g"), v[E](f)));
        d = d.replace(/\0\0/g, "%");
        E = Vd(d);
        if (E.length > b)
          return 0;
        lb.set(E, a);
        return E.length - 1;
      }
      Ob = w.InternalError = Nb("InternalError");
      for (var Wd = Array(256), Xd = 0; 256 > Xd; ++Xd)
        Wd[Xd] = String.fromCharCode(Xd);
      Tb = Wd;
      bc = w.BindingError = Nb("BindingError");
      pc.prototype.isAliasOf = function(a) {
        if (!(this instanceof pc && a instanceof pc))
          return false;
        var b = this.Ld.Xd.Rd, d = this.Ld.Td, f = a.Ld.Xd.Rd;
        for (a = a.Ld.Td; b.ie; )
          d = b.Oe(d), b = b.ie;
        for (; f.ie; )
          a = f.Oe(a), f = f.ie;
        return b === f && d === a;
      };
      pc.prototype.clone = function() {
        this.Ld.Td || cc(this);
        if (this.Ld.Me)
          return this.Ld.count.value += 1, this;
        var a = oc, b = Object, d = b.create, f = Object.getPrototypeOf(this), h = this.Ld;
        a = a(d.call(b, f, { Ld: { value: { count: h.count, Fe: h.Fe, Me: h.Me, Td: h.Td, Xd: h.Xd, $d: h.$d, fe: h.fe } } }));
        a.Ld.count.value += 1;
        a.Ld.Fe = false;
        return a;
      };
      pc.prototype["delete"] = function() {
        this.Ld.Td || cc(this);
        this.Ld.Fe && !this.Ld.Me && X("Object already scheduled for deletion");
        ec(this);
        fc(this.Ld);
        this.Ld.Me || (this.Ld.$d = void 0, this.Ld.Td = void 0);
      };
      pc.prototype.isDeleted = function() {
        return !this.Ld.Td;
      };
      pc.prototype.deleteLater = function() {
        this.Ld.Td || cc(this);
        this.Ld.Fe && !this.Ld.Me && X("Object already scheduled for deletion");
        ic.push(this);
        1 === ic.length && kc && kc(jc);
        this.Ld.Fe = true;
        return this;
      };
      w.getInheritedInstanceCount = function() {
        return Object.keys(lc).length;
      };
      w.getLiveInheritedInstances = function() {
        var a = [], b;
        for (b in lc)
          lc.hasOwnProperty(b) && a.push(lc[b]);
        return a;
      };
      w.flushPendingDeletes = jc;
      w.setDelayFunction = function(a) {
        kc = a;
        ic.length && kc && kc(jc);
      };
      zc.prototype.Qf = function(a) {
        this.vf && (a = this.vf(a));
        return a;
      };
      zc.prototype.pf = function(a) {
        this.le && this.le(a);
      };
      zc.prototype.argPackAdvance = 8;
      zc.prototype.readValueFromPointer = Hb;
      zc.prototype.deleteObject = function(a) {
        if (null !== a)
          a["delete"]();
      };
      zc.prototype.fromWireType = function(a) {
        function b() {
          return this.Ue ? nc(this.Rd.Ge, { Xd: this.ag, Td: d, fe: this, $d: a }) : nc(this.Rd.Ge, { Xd: this, Td: a });
        }
        var d = this.Qf(a);
        if (!d)
          return this.pf(a), null;
        var f = mc(this.Rd, d);
        if (void 0 !== f) {
          if (0 === f.Ld.count.value)
            return f.Ld.Td = d, f.Ld.$d = a, f.clone();
          f = f.clone();
          this.pf(a);
          return f;
        }
        f = this.Rd.Pf(d);
        f = hc[f];
        if (!f)
          return b.call(this);
        f = this.Te ? f.Ff : f.pointerType;
        var h = gc(d, this.Rd, f.Rd);
        return null === h ? b.call(this) : this.Ue ? nc(f.Rd.Ge, { Xd: f, Td: h, fe: this, $d: a }) : nc(
          f.Rd.Ge,
          { Xd: f, Td: h }
        );
      };
      Jc = w.UnboundTypeError = Nb("UnboundTypeError");
      w.count_emval_handles = function() {
        for (var a = 0, b = 5; b < Rc.length; ++b)
          void 0 !== Rc[b] && ++a;
        return a;
      };
      w.get_first_emval = function() {
        for (var a = 5; a < Rc.length; ++a)
          if (void 0 !== Rc[a])
            return Rc[a];
        return null;
      };
      for (var Y, Yd = 0; 32 > Yd; ++Yd)
        Dd.push(Array(Yd));
      var Zd = new Float32Array(288);
      for (Yd = 0; 288 > Yd; ++Yd)
        Ld[Yd] = Zd.subarray(0, Yd + 1);
      var $d = new Int32Array(288);
      for (Yd = 0; 288 > Yd; ++Yd)
        Md[Yd] = $d.subarray(0, Yd + 1);
      function Vd(a) {
        var b = Array(oa(a) + 1);
        ra(a, b, 0, b.length);
        return b;
      }
      var pe = {
        U: function() {
          return 0;
        },
        Bb: function() {
        },
        Db: function() {
          return 0;
        },
        yb: function() {
        },
        zb: function() {
        },
        V: function() {
        },
        Ab: function() {
        },
        C: function(a) {
          var b = Fb[a];
          delete Fb[a];
          var d = b.gf, f = b.le, h = b.sf, m = h.map((u) => u.Tf).concat(h.map((u) => u.fg));
          Qb([a], m, (u) => {
            var n = {};
            h.forEach((q, v) => {
              var E = u[v], G = q.Rf, L = q.Sf, z = u[v + h.length], N = q.eg, T = q.gg;
              n[q.Lf] = { read: (U) => E.fromWireType(G(L, U)), write: (U, pa) => {
                var ta = [];
                N(T, U, z.toWireType(ta, pa));
                Gb(ta);
              } };
            });
            return [{ name: b.name, fromWireType: function(q) {
              var v = {}, E;
              for (E in n)
                v[E] = n[E].read(q);
              f(q);
              return v;
            }, toWireType: function(q, v) {
              for (var E in n)
                if (!(E in v))
                  throw new TypeError('Missing field:  "' + E + '"');
              var G = d();
              for (E in n)
                n[E].write(G, v[E]);
              null !== q && q.push(f, G);
              return G;
            }, argPackAdvance: 8, readValueFromPointer: Hb, ee: f }];
          });
        },
        qb: function() {
        },
        Hb: function(a, b, d, f, h) {
          var m = Sb(d);
          b = ac(b);
          Rb(a, { name: b, fromWireType: function(u) {
            return !!u;
          }, toWireType: function(u, n) {
            return n ? f : h;
          }, argPackAdvance: 8, readValueFromPointer: function(u) {
            if (1 === d)
              var n = lb;
            else if (2 === d)
              n = $a;
            else if (4 === d)
              n = Q;
            else
              throw new TypeError("Unknown boolean type size: " + b);
            return this.fromWireType(n[u >> m]);
          }, ee: null });
        },
        q: function(a, b, d, f, h, m, u, n, q, v, E, G, L) {
          E = ac(E);
          m = Ic(h, m);
          n && (n = Ic(u, n));
          v && (v = Ic(q, v));
          L = Ic(G, L);
          var z = Lb(E);
          rc(z, function() {
            Nc("Cannot construct " + E + " due to unbound types", [f]);
          });
          Qb([a, b, d], f ? [f] : [], function(N) {
            N = N[0];
            if (f) {
              var T = N.Rd;
              var U = T.Ge;
            } else
              U = pc.prototype;
            N = Mb(z, function() {
              if (Object.getPrototypeOf(this) !== pa)
                throw new bc("Use 'new' to construct " + E);
              if (void 0 === ta.oe)
                throw new bc(E + " has no accessible constructor");
              var hb = ta.oe[arguments.length];
              if (void 0 === hb)
                throw new bc("Tried to invoke ctor of " + E + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(ta.oe).toString() + ") parameters instead!");
              return hb.apply(this, arguments);
            });
            var pa = Object.create(U, { constructor: { value: N } });
            N.prototype = pa;
            var ta = new sc(E, N, pa, L, T, m, n, v);
            T = new zc(E, ta, true, false, false);
            U = new zc(E + "*", ta, false, false, false);
            var gb = new zc(E + " const*", ta, false, true, false);
            hc[a] = { pointerType: U, Ff: gb };
            Ac(
              z,
              N
            );
            return [T, U, gb];
          });
        },
        h: function(a, b, d, f, h, m, u) {
          var n = Pc(d, f);
          b = ac(b);
          m = Ic(h, m);
          Qb([], [a], function(q) {
            function v() {
              Nc("Cannot call " + E + " due to unbound types", n);
            }
            q = q[0];
            var E = q.name + "." + b;
            b.startsWith("@@") && (b = Symbol[b.substring(2)]);
            var G = q.Rd.constructor;
            void 0 === G[b] ? (v.De = d - 1, G[b] = v) : (qc(G, b, E), G[b].Zd[d - 1] = v);
            Qb([], n, function(L) {
              L = [L[0], null].concat(L.slice(1));
              L = Oc(E, L, null, m, u);
              void 0 === G[b].Zd ? (L.De = d - 1, G[b] = L) : G[b].Zd[d - 1] = L;
              return [];
            });
            return [];
          });
        },
        B: function(a, b, d, f, h, m) {
          0 < b || Qa();
          var u = Pc(b, d);
          h = Ic(f, h);
          Qb([], [a], function(n) {
            n = n[0];
            var q = "constructor " + n.name;
            void 0 === n.Rd.oe && (n.Rd.oe = []);
            if (void 0 !== n.Rd.oe[b - 1])
              throw new bc("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + n.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
            n.Rd.oe[b - 1] = () => {
              Nc("Cannot construct " + n.name + " due to unbound types", u);
            };
            Qb([], u, function(v) {
              v.splice(1, 0, null);
              n.Rd.oe[b - 1] = Oc(q, v, null, h, m);
              return [];
            });
            return [];
          });
        },
        b: function(a, b, d, f, h, m, u, n) {
          var q = Pc(d, f);
          b = ac(b);
          m = Ic(h, m);
          Qb([], [a], function(v) {
            function E() {
              Nc("Cannot call " + G + " due to unbound types", q);
            }
            v = v[0];
            var G = v.name + "." + b;
            b.startsWith("@@") && (b = Symbol[b.substring(2)]);
            n && v.Rd.bg.push(b);
            var L = v.Rd.Ge, z = L[b];
            void 0 === z || void 0 === z.Zd && z.className !== v.name && z.De === d - 2 ? (E.De = d - 2, E.className = v.name, L[b] = E) : (qc(L, b, G), L[b].Zd[d - 2] = E);
            Qb([], q, function(N) {
              N = Oc(G, N, v, m, u);
              void 0 === L[b].Zd ? (N.De = d - 2, L[b] = N) : L[b].Zd[d - 2] = N;
              return [];
            });
            return [];
          });
        },
        u: function(a, b, d) {
          a = ac(a);
          Qb([], [b], function(f) {
            f = f[0];
            w[a] = f.fromWireType(d);
            return [];
          });
        },
        Gb: function(a, b) {
          b = ac(b);
          Rb(a, { name: b, fromWireType: function(d) {
            var f = Tc(d);
            Sc(d);
            return f;
          }, toWireType: function(d, f) {
            return xc(f);
          }, argPackAdvance: 8, readValueFromPointer: Hb, ee: null });
        },
        n: function(a, b, d, f) {
          function h() {
          }
          d = Sb(d);
          b = ac(b);
          h.values = {};
          Rb(a, { name: b, constructor: h, fromWireType: function(m) {
            return this.constructor.values[m];
          }, toWireType: function(m, u) {
            return u.value;
          }, argPackAdvance: 8, readValueFromPointer: Uc(b, d, f), ee: null });
          rc(b, h);
        },
        e: function(a, b, d) {
          var f = Vc(a, "enum");
          b = ac(b);
          a = f.constructor;
          f = Object.create(f.constructor.prototype, { value: { value: d }, constructor: { value: Mb(f.name + "_" + b, function() {
          }) } });
          a.values[d] = f;
          a[b] = f;
        },
        Y: function(a, b, d) {
          d = Sb(d);
          b = ac(b);
          Rb(a, { name: b, fromWireType: function(f) {
            return f;
          }, toWireType: function(f, h) {
            return h;
          }, argPackAdvance: 8, readValueFromPointer: Wc(b, d), ee: null });
        },
        y: function(a, b, d, f, h, m) {
          var u = Pc(b, d);
          a = ac(a);
          h = Ic(f, h);
          rc(a, function() {
            Nc("Cannot call " + a + " due to unbound types", u);
          }, b - 1);
          Qb(
            [],
            u,
            function(n) {
              n = [n[0], null].concat(n.slice(1));
              Ac(a, Oc(a, n, null, h, m), b - 1);
              return [];
            }
          );
        },
        E: function(a, b, d, f, h) {
          b = ac(b);
          -1 === h && (h = 4294967295);
          h = Sb(d);
          var m = (n) => n;
          if (0 === f) {
            var u = 32 - 8 * d;
            m = (n) => n << u >>> u;
          }
          d = b.includes("unsigned") ? function(n, q) {
            return q >>> 0;
          } : function(n, q) {
            return q;
          };
          Rb(a, { name: b, fromWireType: m, toWireType: d, argPackAdvance: 8, readValueFromPointer: Xc(b, h, 0 !== f), ee: null });
        },
        v: function(a, b, d) {
          function f(m) {
            m >>= 2;
            var u = mb;
            return new h(kb, u[m + 1], u[m]);
          }
          var h = [
            Int8Array,
            Uint8Array,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array
          ][b];
          d = ac(d);
          Rb(a, { name: d, fromWireType: f, argPackAdvance: 8, readValueFromPointer: f }, { Vf: true });
        },
        t: function(a, b, d, f, h, m, u, n, q, v, E, G) {
          d = ac(d);
          m = Ic(h, m);
          n = Ic(u, n);
          v = Ic(q, v);
          G = Ic(E, G);
          Qb([a], [b], function(L) {
            L = L[0];
            return [new zc(d, L.Rd, false, false, true, L, f, m, n, v, G)];
          });
        },
        X: function(a, b) {
          b = ac(b);
          var d = "std::string" === b;
          Rb(a, { name: b, fromWireType: function(f) {
            var h = mb[f >> 2], m = f + 4;
            if (d)
              for (var u = m, n = 0; n <= h; ++n) {
                var q = m + n;
                if (n == h || 0 == K[q]) {
                  u = Wa(u, q - u);
                  if (void 0 === v)
                    var v = u;
                  else
                    v += String.fromCharCode(0), v += u;
                  u = q + 1;
                }
              }
            else {
              v = Array(h);
              for (n = 0; n < h; ++n)
                v[n] = String.fromCharCode(K[m + n]);
              v = v.join("");
            }
            Mc(f);
            return v;
          }, toWireType: function(f, h) {
            h instanceof ArrayBuffer && (h = new Uint8Array(h));
            var m = "string" == typeof h;
            m || h instanceof Uint8Array || h instanceof Uint8ClampedArray || h instanceof Int8Array || X("Cannot pass non-string to std::string");
            var u = d && m ? oa(h) : h.length;
            var n = Hd(4 + u + 1), q = n + 4;
            mb[n >> 2] = u;
            if (d && m)
              ra(h, K, q, u + 1);
            else if (m)
              for (m = 0; m < u; ++m) {
                var v = h.charCodeAt(m);
                255 < v && (Mc(q), X("String has UTF-16 code units that do not fit in 8 bits"));
                K[q + m] = v;
              }
            else
              for (m = 0; m < u; ++m)
                K[q + m] = h[m];
            null !== f && f.push(Mc, n);
            return n;
          }, argPackAdvance: 8, readValueFromPointer: Hb, ee: function(f) {
            Mc(f);
          } });
        },
        P: function(a, b, d) {
          d = ac(d);
          if (2 === b) {
            var f = Ya;
            var h = cb;
            var m = db;
            var u = () => Za;
            var n = 1;
          } else
            4 === b && (f = eb, h = fb, m = jb, u = () => mb, n = 2);
          Rb(a, { name: d, fromWireType: function(q) {
            for (var v = mb[q >> 2], E = u(), G, L = q + 4, z = 0; z <= v; ++z) {
              var N = q + 4 + z * b;
              if (z == v || 0 == E[N >> n])
                L = f(L, N - L), void 0 === G ? G = L : (G += String.fromCharCode(0), G += L), L = N + b;
            }
            Mc(q);
            return G;
          }, toWireType: function(q, v) {
            "string" != typeof v && X("Cannot pass non-string to C++ string type " + d);
            var E = m(v), G = Hd(4 + E + b);
            mb[G >> 2] = E >> n;
            h(v, G + 4, E + b);
            null !== q && q.push(Mc, G);
            return G;
          }, argPackAdvance: 8, readValueFromPointer: Hb, ee: function(q) {
            Mc(q);
          } });
        },
        D: function(a, b, d, f, h, m) {
          Fb[a] = { name: ac(b), gf: Ic(d, f), le: Ic(h, m), sf: [] };
        },
        g: function(a, b, d, f, h, m, u, n, q, v) {
          Fb[a].sf.push({ Lf: ac(b), Tf: d, Rf: Ic(f, h), Sf: m, fg: u, eg: Ic(n, q), gg: v });
        },
        Ib: function(a, b) {
          b = ac(b);
          Rb(a, {
            Xf: true,
            name: b,
            argPackAdvance: 0,
            fromWireType: function() {
            },
            toWireType: function() {
            }
          });
        },
        Fb: function() {
          return true;
        },
        sb: function() {
          throw Infinity;
        },
        I: function(a, b, d) {
          a = Tc(a);
          b = Vc(b, "emval::as");
          var f = [], h = xc(f);
          mb[d >> 2] = h;
          return b.toWireType(f, a);
        },
        $: function(a, b, d, f, h) {
          a = $c[a];
          b = Tc(b);
          d = Zc(d);
          var m = [];
          mb[f >> 2] = xc(m);
          return a(b, d, m, h);
        },
        A: function(a, b, d, f) {
          a = $c[a];
          b = Tc(b);
          d = Zc(d);
          a(b, d, null, f);
        },
        f: Sc,
        M: function(a) {
          if (0 === a)
            return xc(ad());
          a = Zc(a);
          return xc(ad()[a]);
        },
        z: function(a, b) {
          var d = cd(a, b), f = d[0];
          b = f.name + "_$" + d.slice(1).map(function(u) {
            return u.name;
          }).join("_") + "$";
          var h = dd[b];
          if (void 0 !== h)
            return h;
          var m = Array(a - 1);
          h = bd((u, n, q, v) => {
            for (var E = 0, G = 0; G < a - 1; ++G)
              m[G] = d[G + 1].readValueFromPointer(v + E), E += d[G + 1].argPackAdvance;
            u = u[n].apply(u, m);
            for (G = 0; G < a - 1; ++G)
              d[G + 1].If && d[G + 1].If(m[G]);
            if (!f.Xf)
              return f.toWireType(q, u);
          });
          return dd[b] = h;
        },
        H: function(a, b) {
          a = Tc(a);
          b = Tc(b);
          return xc(a[b]);
        },
        r: function(a) {
          4 < a && (Rc[a].hf += 1);
        },
        L: function(a, b, d, f) {
          a = Tc(a);
          var h = fd[b];
          h || (h = ed(b), fd[b] = h);
          return h(a, d, f);
        },
        J: function() {
          return xc([]);
        },
        i: function(a) {
          return xc(Zc(a));
        },
        G: function() {
          return xc({});
        },
        mb: function(a) {
          a = Tc(a);
          return !a;
        },
        F: function(a) {
          var b = Tc(a);
          Gb(b);
          Sc(a);
        },
        m: function(a, b, d) {
          a = Tc(a);
          b = Tc(b);
          d = Tc(d);
          a[b] = d;
        },
        j: function(a, b) {
          a = Vc(a, "_emval_take_value");
          a = a.readValueFromPointer(b);
          return xc(a);
        },
        ub: function() {
          return -52;
        },
        vb: function() {
        },
        a: function() {
          Qa("");
        },
        Eb: gd,
        bd: function(a) {
          Y.activeTexture(a);
        },
        cd: function(a, b) {
          Y.attachShader(nd[a], qd[b]);
        },
        ca: function(a, b, d) {
          Y.bindAttribLocation(nd[a], b, Wa(d));
        },
        da: function(a, b) {
          35051 == a ? Y.df = b : 35052 == a && (Y.Ee = b);
          Y.bindBuffer(a, md[b]);
        },
        ba: function(a, b) {
          Y.bindFramebuffer(a, od[b]);
        },
        fc: function(a, b) {
          Y.bindRenderbuffer(a, pd[b]);
        },
        Rb: function(a, b) {
          Y.bindSampler(a, sd[b]);
        },
        ea: function(a, b) {
          Y.bindTexture(a, ka[b]);
        },
        Cc: function(a) {
          Y.bindVertexArray(rd[a]);
        },
        xc: function(a) {
          Y.bindVertexArray(rd[a]);
        },
        fa: function(a, b, d, f) {
          Y.blendColor(a, b, d, f);
        },
        ga: function(a) {
          Y.blendEquation(a);
        },
        ha: function(a, b) {
          Y.blendFunc(a, b);
        },
        $b: function(a, b, d, f, h, m, u, n, q, v) {
          Y.blitFramebuffer(a, b, d, f, h, m, u, n, q, v);
        },
        ia: function(a, b, d, f) {
          2 <= x.version ? d && b ? Y.bufferData(a, K, f, d, b) : Y.bufferData(
            a,
            b,
            f
          ) : Y.bufferData(a, d ? K.subarray(d, d + b) : b, f);
        },
        ja: function(a, b, d, f) {
          2 <= x.version ? d && Y.bufferSubData(a, b, K, f, d) : Y.bufferSubData(a, b, K.subarray(f, f + d));
        },
        gc: function(a) {
          return Y.checkFramebufferStatus(a);
        },
        S: function(a) {
          Y.clear(a);
        },
        aa: function(a, b, d, f) {
          Y.clearColor(a, b, d, f);
        },
        W: function(a) {
          Y.clearStencil(a);
        },
        kb: function(a, b, d, f) {
          return Y.clientWaitSync(td[a], b, (d >>> 0) + 4294967296 * f);
        },
        ka: function(a, b, d, f) {
          Y.colorMask(!!a, !!b, !!d, !!f);
        },
        la: function(a) {
          Y.compileShader(qd[a]);
        },
        ma: function(a, b, d, f, h, m, u, n) {
          2 <= x.version ? Y.Ee || !u ? Y.compressedTexImage2D(a, b, d, f, h, m, u, n) : Y.compressedTexImage2D(a, b, d, f, h, m, K, n, u) : Y.compressedTexImage2D(a, b, d, f, h, m, n ? K.subarray(n, n + u) : null);
        },
        na: function(a, b, d, f, h, m, u, n, q) {
          2 <= x.version ? Y.Ee || !n ? Y.compressedTexSubImage2D(a, b, d, f, h, m, u, n, q) : Y.compressedTexSubImage2D(a, b, d, f, h, m, u, K, q, n) : Y.compressedTexSubImage2D(a, b, d, f, h, m, u, q ? K.subarray(q, q + n) : null);
        },
        Zb: function(a, b, d, f, h) {
          Y.copyBufferSubData(a, b, d, f, h);
        },
        oa: function(a, b, d, f, h, m, u, n) {
          Y.copyTexSubImage2D(a, b, d, f, h, m, u, n);
        },
        pa: function() {
          var a = ha(nd), b = Y.createProgram();
          b.name = a;
          b.Xe = b.Ve = b.We = 0;
          b.kf = 1;
          nd[a] = b;
          return a;
        },
        qa: function(a) {
          var b = ha(qd);
          qd[b] = Y.createShader(a);
          return b;
        },
        ra: function(a) {
          Y.cullFace(a);
        },
        sa: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2], h = md[f];
            h && (Y.deleteBuffer(h), h.name = 0, md[f] = null, f == Y.df && (Y.df = 0), f == Y.Ee && (Y.Ee = 0));
          }
        },
        hc: function(a, b) {
          for (var d = 0; d < a; ++d) {
            var f = Q[b + 4 * d >> 2], h = od[f];
            h && (Y.deleteFramebuffer(h), h.name = 0, od[f] = null);
          }
        },
        ta: function(a) {
          if (a) {
            var b = nd[a];
            b ? (Y.deleteProgram(b), b.name = 0, nd[a] = null) : xd(1281);
          }
        },
        ic: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2], h = pd[f];
            h && (Y.deleteRenderbuffer(h), h.name = 0, pd[f] = null);
          }
        },
        Sb: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2], h = sd[f];
            h && (Y.deleteSampler(h), h.name = 0, sd[f] = null);
          }
        },
        ua: function(a) {
          if (a) {
            var b = qd[a];
            b ? (Y.deleteShader(b), qd[a] = null) : xd(1281);
          }
        },
        _b: function(a) {
          if (a) {
            var b = td[a];
            b ? (Y.deleteSync(b), b.name = 0, td[a] = null) : xd(1281);
          }
        },
        va: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2], h = ka[f];
            h && (Y.deleteTexture(h), h.name = 0, ka[f] = null);
          }
        },
        Dc: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2];
            Y.deleteVertexArray(rd[f]);
            rd[f] = null;
          }
        },
        yc: function(a, b) {
          for (var d = 0; d < a; d++) {
            var f = Q[b + 4 * d >> 2];
            Y.deleteVertexArray(rd[f]);
            rd[f] = null;
          }
        },
        wa: function(a) {
          Y.depthMask(!!a);
        },
        xa: function(a) {
          Y.disable(a);
        },
        ya: function(a) {
          Y.disableVertexAttribArray(a);
        },
        za: function(a, b, d) {
          Y.drawArrays(a, b, d);
        },
        Ac: function(a, b, d, f) {
          Y.drawArraysInstanced(a, b, d, f);
        },
        vc: function(a, b, d, f, h) {
          Y.qf.drawArraysInstancedBaseInstanceWEBGL(a, b, d, f, h);
        },
        tc: function(a, b) {
          for (var d = Dd[a], f = 0; f < a; f++)
            d[f] = Q[b + 4 * f >> 2];
          Y.drawBuffers(d);
        },
        Aa: function(a, b, d, f) {
          Y.drawElements(a, b, d, f);
        },
        Bc: function(a, b, d, f, h) {
          Y.drawElementsInstanced(a, b, d, f, h);
        },
        wc: function(a, b, d, f, h, m, u) {
          Y.qf.drawElementsInstancedBaseVertexBaseInstanceWEBGL(a, b, d, f, h, m, u);
        },
        nc: function(a, b, d, f, h, m) {
          Y.drawElements(a, f, h, m);
        },
        Ba: function(a) {
          Y.enable(a);
        },
        Ca: function(a) {
          Y.enableVertexAttribArray(a);
        },
        Xb: function(a, b) {
          return (a = Y.fenceSync(a, b)) ? (b = ha(td), a.name = b, td[b] = a, b) : 0;
        },
        Da: function() {
          Y.finish();
        },
        Ea: function() {
          Y.flush();
        },
        jc: function(a, b, d, f) {
          Y.framebufferRenderbuffer(a, b, d, pd[f]);
        },
        kc: function(a, b, d, f, h) {
          Y.framebufferTexture2D(a, b, d, ka[f], h);
        },
        Fa: function(a) {
          Y.frontFace(a);
        },
        Ga: function(a, b) {
          Ed(a, b, "createBuffer", md);
        },
        lc: function(a, b) {
          Ed(a, b, "createFramebuffer", od);
        },
        mc: function(a, b) {
          Ed(a, b, "createRenderbuffer", pd);
        },
        Tb: function(a, b) {
          Ed(a, b, "createSampler", sd);
        },
        Ha: function(a, b) {
          Ed(a, b, "createTexture", ka);
        },
        Ec: function(a, b) {
          Ed(a, b, "createVertexArray", rd);
        },
        zc: function(a, b) {
          Ed(a, b, "createVertexArray", rd);
        },
        bc: function(a) {
          Y.generateMipmap(a);
        },
        Ia: function(a, b, d) {
          d ? Q[d >> 2] = Y.getBufferParameter(a, b) : xd(1281);
        },
        Ja: function() {
          var a = Y.getError() || Ad;
          Ad = 0;
          return a;
        },
        Ka: function(a, b) {
          Fd(a, b, 2);
        },
        cc: function(a, b, d, f) {
          a = Y.getFramebufferAttachmentParameter(a, b, d);
          if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture)
            a = a.name | 0;
          Q[f >> 2] = a;
        },
        N: function(a, b) {
          Fd(a, b, 0);
        },
        La: function(a, b, d, f) {
          a = Y.getProgramInfoLog(nd[a]);
          null === a && (a = "(unknown error)");
          b = 0 < b && f ? ra(a, K, f, b) : 0;
          d && (Q[d >> 2] = b);
        },
        Ma: function(a, b, d) {
          if (d)
            if (a >= ld)
              xd(1281);
            else if (a = nd[a], 35716 == b)
              a = Y.getProgramInfoLog(a), null === a && (a = "(unknown error)"), Q[d >> 2] = a.length + 1;
            else if (35719 == b) {
              if (!a.Xe)
                for (b = 0; b < Y.getProgramParameter(a, 35718); ++b)
                  a.Xe = Math.max(a.Xe, Y.getActiveUniform(a, b).name.length + 1);
              Q[d >> 2] = a.Xe;
            } else if (35722 == b) {
              if (!a.Ve)
                for (b = 0; b < Y.getProgramParameter(a, 35721); ++b)
                  a.Ve = Math.max(a.Ve, Y.getActiveAttrib(a, b).name.length + 1);
              Q[d >> 2] = a.Ve;
            } else if (35381 == b) {
              if (!a.We)
                for (b = 0; b < Y.getProgramParameter(a, 35382); ++b)
                  a.We = Math.max(a.We, Y.getActiveUniformBlockName(a, b).length + 1);
              Q[d >> 2] = a.We;
            } else
              Q[d >> 2] = Y.getProgramParameter(a, b);
          else
            xd(1281);
        },
        dc: function(a, b, d) {
          d ? Q[d >> 2] = Y.getRenderbufferParameter(a, b) : xd(1281);
        },
        Na: function(a, b, d, f) {
          a = Y.getShaderInfoLog(qd[a]);
          null === a && (a = "(unknown error)");
          b = 0 < b && f ? ra(a, K, f, b) : 0;
          d && (Q[d >> 2] = b);
        },
        Ob: function(a, b, d, f) {
          a = Y.getShaderPrecisionFormat(a, b);
          Q[d >> 2] = a.rangeMin;
          Q[d + 4 >> 2] = a.rangeMax;
          Q[f >> 2] = a.precision;
        },
        Oa: function(a, b, d) {
          d ? 35716 == b ? (a = Y.getShaderInfoLog(qd[a]), null === a && (a = "(unknown error)"), Q[d >> 2] = a ? a.length + 1 : 0) : 35720 == b ? (a = Y.getShaderSource(qd[a]), Q[d >> 2] = a ? a.length + 1 : 0) : Q[d >> 2] = Y.getShaderParameter(qd[a], b) : xd(1281);
        },
        R: function(a) {
          var b = ud[a];
          if (!b) {
            switch (a) {
              case 7939:
                b = Y.getSupportedExtensions() || [];
                b = b.concat(b.map(function(f) {
                  return "GL_" + f;
                }));
                b = Gd(b.join(" "));
                break;
              case 7936:
              case 7937:
              case 37445:
              case 37446:
                (b = Y.getParameter(a)) || xd(1280);
                b = b && Gd(b);
                break;
              case 7938:
                b = Y.getParameter(7938);
                b = 2 <= x.version ? "OpenGL ES 3.0 (" + b + ")" : "OpenGL ES 2.0 (" + b + ")";
                b = Gd(b);
                break;
              case 35724:
                b = Y.getParameter(35724);
                var d = b.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
                null !== d && (3 == d[1].length && (d[1] += "0"), b = "OpenGL ES GLSL ES " + d[1] + " (" + b + ")");
                b = Gd(b);
                break;
              default:
                xd(1280);
            }
            ud[a] = b;
          }
          return b;
        },
        jb: function(a, b) {
          if (2 > x.version)
            return xd(1282), 0;
          var d = vd[a];
          if (d)
            return 0 > b || b >= d.length ? (xd(1281), 0) : d[b];
          switch (a) {
            case 7939:
              return d = Y.getSupportedExtensions() || [], d = d.concat(d.map(function(f) {
                return "GL_" + f;
              })), d = d.map(function(f) {
                return Gd(f);
              }), d = vd[a] = d, 0 > b || b >= d.length ? (xd(1281), 0) : d[b];
            default:
              return xd(1280), 0;
          }
        },
        Pa: function(a, b) {
          b = Wa(b);
          if (a = nd[a]) {
            var d = a, f = d.Ne, h = d.xf, m;
            if (!f)
              for (d.Ne = f = {}, d.wf = {}, m = 0; m < Y.getProgramParameter(d, 35718); ++m) {
                var u = Y.getActiveUniform(d, m);
                var n = u.name;
                u = u.size;
                var q = Id(n);
                q = 0 < q ? n.slice(0, q) : n;
                var v = d.kf;
                d.kf += u;
                h[q] = [u, v];
                for (n = 0; n < u; ++n)
                  f[v] = n, d.wf[v++] = q;
              }
            d = a.Ne;
            f = 0;
            h = b;
            m = Id(b);
            0 < m && (f = parseInt(b.slice(m + 1)) >>> 0, h = b.slice(0, m));
            if ((h = a.xf[h]) && f < h[0] && (f += h[1], d[f] = d[f] || Y.getUniformLocation(a, b)))
              return f;
          } else
            xd(1281);
          return -1;
        },
        Pb: function(a, b, d) {
          for (var f = Dd[b], h = 0; h < b; h++)
            f[h] = Q[d + 4 * h >> 2];
          Y.invalidateFramebuffer(a, f);
        },
        Qb: function(a, b, d, f, h, m, u) {
          for (var n = Dd[b], q = 0; q < b; q++)
            n[q] = Q[d + 4 * q >> 2];
          Y.invalidateSubFramebuffer(a, n, f, h, m, u);
        },
        Yb: function(a) {
          return Y.isSync(td[a]);
        },
        Qa: function(a) {
          return (a = ka[a]) ? Y.isTexture(a) : 0;
        },
        Ra: function(a) {
          Y.lineWidth(a);
        },
        Sa: function(a) {
          a = nd[a];
          Y.linkProgram(a);
          a.Ne = 0;
          a.xf = {};
        },
        rc: function(a, b, d, f, h, m) {
          Y.uf.multiDrawArraysInstancedBaseInstanceWEBGL(a, Q, b >> 2, Q, d >> 2, Q, f >> 2, mb, h >> 2, m);
        },
        sc: function(a, b, d, f, h, m, u, n) {
          Y.uf.multiDrawElementsInstancedBaseVertexBaseInstanceWEBGL(
            a,
            Q,
            b >> 2,
            d,
            Q,
            f >> 2,
            Q,
            h >> 2,
            Q,
            m >> 2,
            mb,
            u >> 2,
            n
          );
        },
        Ta: function(a, b) {
          3317 == a && (wd = b);
          Y.pixelStorei(a, b);
        },
        uc: function(a) {
          Y.readBuffer(a);
        },
        Ua: function(a, b, d, f, h, m, u) {
          if (2 <= x.version)
            if (Y.df)
              Y.readPixels(a, b, d, f, h, m, u);
            else {
              var n = Jd(m);
              Y.readPixels(a, b, d, f, h, m, n, u >> 31 - Math.clz32(n.BYTES_PER_ELEMENT));
            }
          else
            (u = Kd(m, h, d, f, u)) ? Y.readPixels(a, b, d, f, h, m, u) : xd(1280);
        },
        ec: function(a, b, d, f) {
          Y.renderbufferStorage(a, b, d, f);
        },
        ac: function(a, b, d, f, h) {
          Y.renderbufferStorageMultisample(a, b, d, f, h);
        },
        Ub: function(a, b, d) {
          Y.samplerParameterf(
            sd[a],
            b,
            d
          );
        },
        Vb: function(a, b, d) {
          Y.samplerParameteri(sd[a], b, d);
        },
        Wb: function(a, b, d) {
          Y.samplerParameteri(sd[a], b, Q[d >> 2]);
        },
        Va: function(a, b, d, f) {
          Y.scissor(a, b, d, f);
        },
        Wa: function(a, b, d, f) {
          for (var h = "", m = 0; m < b; ++m) {
            var u = f ? Q[f + 4 * m >> 2] : -1;
            h += Wa(Q[d + 4 * m >> 2], 0 > u ? void 0 : u);
          }
          Y.shaderSource(qd[a], h);
        },
        Xa: function(a, b, d) {
          Y.stencilFunc(a, b, d);
        },
        Ya: function(a, b, d, f) {
          Y.stencilFuncSeparate(a, b, d, f);
        },
        Za: function(a) {
          Y.stencilMask(a);
        },
        _a: function(a, b) {
          Y.stencilMaskSeparate(a, b);
        },
        $a: function(a, b, d) {
          Y.stencilOp(a, b, d);
        },
        ab: function(a, b, d, f) {
          Y.stencilOpSeparate(a, b, d, f);
        },
        bb: function(a, b, d, f, h, m, u, n, q) {
          if (2 <= x.version)
            if (Y.Ee)
              Y.texImage2D(a, b, d, f, h, m, u, n, q);
            else if (q) {
              var v = Jd(n);
              Y.texImage2D(a, b, d, f, h, m, u, n, v, q >> 31 - Math.clz32(v.BYTES_PER_ELEMENT));
            } else
              Y.texImage2D(a, b, d, f, h, m, u, n, null);
          else
            Y.texImage2D(a, b, d, f, h, m, u, n, q ? Kd(n, u, f, h, q) : null);
        },
        cb: function(a, b, d) {
          Y.texParameterf(a, b, d);
        },
        db: function(a, b, d) {
          Y.texParameterf(a, b, S[d >> 2]);
        },
        eb: function(a, b, d) {
          Y.texParameteri(a, b, d);
        },
        fb: function(a, b, d) {
          Y.texParameteri(a, b, Q[d >> 2]);
        },
        oc: function(a, b, d, f, h) {
          Y.texStorage2D(a, b, d, f, h);
        },
        gb: function(a, b, d, f, h, m, u, n, q) {
          if (2 <= x.version)
            if (Y.Ee)
              Y.texSubImage2D(a, b, d, f, h, m, u, n, q);
            else if (q) {
              var v = Jd(n);
              Y.texSubImage2D(a, b, d, f, h, m, u, n, v, q >> 31 - Math.clz32(v.BYTES_PER_ELEMENT));
            } else
              Y.texSubImage2D(a, b, d, f, h, m, u, n, null);
          else
            v = null, q && (v = Kd(n, u, h, m, q)), Y.texSubImage2D(a, b, d, f, h, m, u, n, v);
        },
        hb: function(a, b) {
          Y.uniform1f(Z(a), b);
        },
        ib: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform1fv(Z(a), S, d >> 2, b);
          else {
            if (288 >= b)
              for (var f = Ld[b - 1], h = 0; h < b; ++h)
                f[h] = S[d + 4 * h >> 2];
            else
              f = S.subarray(d >> 2, d + 4 * b >> 2);
            Y.uniform1fv(Z(a), f);
          }
        },
        Zc: function(a, b) {
          Y.uniform1i(Z(a), b);
        },
        _c: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform1iv(Z(a), Q, d >> 2, b);
          else {
            if (288 >= b)
              for (var f = Md[b - 1], h = 0; h < b; ++h)
                f[h] = Q[d + 4 * h >> 2];
            else
              f = Q.subarray(d >> 2, d + 4 * b >> 2);
            Y.uniform1iv(Z(a), f);
          }
        },
        $c: function(a, b, d) {
          Y.uniform2f(Z(a), b, d);
        },
        ad: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform2fv(Z(a), S, d >> 2, 2 * b);
          else {
            if (144 >= b)
              for (var f = Ld[2 * b - 1], h = 0; h < 2 * b; h += 2)
                f[h] = S[d + 4 * h >> 2], f[h + 1] = S[d + (4 * h + 4) >> 2];
            else
              f = S.subarray(d >> 2, d + 8 * b >> 2);
            Y.uniform2fv(Z(a), f);
          }
        },
        Yc: function(a, b, d) {
          Y.uniform2i(Z(a), b, d);
        },
        Xc: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform2iv(Z(a), Q, d >> 2, 2 * b);
          else {
            if (144 >= b)
              for (var f = Md[2 * b - 1], h = 0; h < 2 * b; h += 2)
                f[h] = Q[d + 4 * h >> 2], f[h + 1] = Q[d + (4 * h + 4) >> 2];
            else
              f = Q.subarray(d >> 2, d + 8 * b >> 2);
            Y.uniform2iv(Z(a), f);
          }
        },
        Wc: function(a, b, d, f) {
          Y.uniform3f(Z(a), b, d, f);
        },
        Vc: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform3fv(Z(a), S, d >> 2, 3 * b);
          else {
            if (96 >= b)
              for (var f = Ld[3 * b - 1], h = 0; h < 3 * b; h += 3)
                f[h] = S[d + 4 * h >> 2], f[h + 1] = S[d + (4 * h + 4) >> 2], f[h + 2] = S[d + (4 * h + 8) >> 2];
            else
              f = S.subarray(d >> 2, d + 12 * b >> 2);
            Y.uniform3fv(Z(a), f);
          }
        },
        Uc: function(a, b, d, f) {
          Y.uniform3i(Z(a), b, d, f);
        },
        Tc: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform3iv(Z(a), Q, d >> 2, 3 * b);
          else {
            if (96 >= b)
              for (var f = Md[3 * b - 1], h = 0; h < 3 * b; h += 3)
                f[h] = Q[d + 4 * h >> 2], f[h + 1] = Q[d + (4 * h + 4) >> 2], f[h + 2] = Q[d + (4 * h + 8) >> 2];
            else
              f = Q.subarray(d >> 2, d + 12 * b >> 2);
            Y.uniform3iv(Z(a), f);
          }
        },
        Sc: function(a, b, d, f, h) {
          Y.uniform4f(Z(a), b, d, f, h);
        },
        Rc: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform4fv(Z(a), S, d >> 2, 4 * b);
          else {
            if (72 >= b) {
              var f = Ld[4 * b - 1], h = S;
              d >>= 2;
              for (var m = 0; m < 4 * b; m += 4) {
                var u = d + m;
                f[m] = h[u];
                f[m + 1] = h[u + 1];
                f[m + 2] = h[u + 2];
                f[m + 3] = h[u + 3];
              }
            } else
              f = S.subarray(d >> 2, d + 16 * b >> 2);
            Y.uniform4fv(Z(a), f);
          }
        },
        Fc: function(a, b, d, f, h) {
          Y.uniform4i(Z(a), b, d, f, h);
        },
        Gc: function(a, b, d) {
          if (2 <= x.version)
            b && Y.uniform4iv(Z(a), Q, d >> 2, 4 * b);
          else {
            if (72 >= b)
              for (var f = Md[4 * b - 1], h = 0; h < 4 * b; h += 4)
                f[h] = Q[d + 4 * h >> 2], f[h + 1] = Q[d + (4 * h + 4) >> 2], f[h + 2] = Q[d + (4 * h + 8) >> 2], f[h + 3] = Q[d + (4 * h + 12) >> 2];
            else
              f = Q.subarray(d >> 2, d + 16 * b >> 2);
            Y.uniform4iv(Z(a), f);
          }
        },
        Hc: function(a, b, d, f) {
          if (2 <= x.version)
            b && Y.uniformMatrix2fv(
              Z(a),
              !!d,
              S,
              f >> 2,
              4 * b
            );
          else {
            if (72 >= b)
              for (var h = Ld[4 * b - 1], m = 0; m < 4 * b; m += 4)
                h[m] = S[f + 4 * m >> 2], h[m + 1] = S[f + (4 * m + 4) >> 2], h[m + 2] = S[f + (4 * m + 8) >> 2], h[m + 3] = S[f + (4 * m + 12) >> 2];
            else
              h = S.subarray(f >> 2, f + 16 * b >> 2);
            Y.uniformMatrix2fv(Z(a), !!d, h);
          }
        },
        Ic: function(a, b, d, f) {
          if (2 <= x.version)
            b && Y.uniformMatrix3fv(Z(a), !!d, S, f >> 2, 9 * b);
          else {
            if (32 >= b)
              for (var h = Ld[9 * b - 1], m = 0; m < 9 * b; m += 9)
                h[m] = S[f + 4 * m >> 2], h[m + 1] = S[f + (4 * m + 4) >> 2], h[m + 2] = S[f + (4 * m + 8) >> 2], h[m + 3] = S[f + (4 * m + 12) >> 2], h[m + 4] = S[f + (4 * m + 16) >> 2], h[m + 5] = S[f + (4 * m + 20) >> 2], h[m + 6] = S[f + (4 * m + 24) >> 2], h[m + 7] = S[f + (4 * m + 28) >> 2], h[m + 8] = S[f + (4 * m + 32) >> 2];
            else
              h = S.subarray(f >> 2, f + 36 * b >> 2);
            Y.uniformMatrix3fv(Z(a), !!d, h);
          }
        },
        Jc: function(a, b, d, f) {
          if (2 <= x.version)
            b && Y.uniformMatrix4fv(Z(a), !!d, S, f >> 2, 16 * b);
          else {
            if (18 >= b) {
              var h = Ld[16 * b - 1], m = S;
              f >>= 2;
              for (var u = 0; u < 16 * b; u += 16) {
                var n = f + u;
                h[u] = m[n];
                h[u + 1] = m[n + 1];
                h[u + 2] = m[n + 2];
                h[u + 3] = m[n + 3];
                h[u + 4] = m[n + 4];
                h[u + 5] = m[n + 5];
                h[u + 6] = m[n + 6];
                h[u + 7] = m[n + 7];
                h[u + 8] = m[n + 8];
                h[u + 9] = m[n + 9];
                h[u + 10] = m[n + 10];
                h[u + 11] = m[n + 11];
                h[u + 12] = m[n + 12];
                h[u + 13] = m[n + 13];
                h[u + 14] = m[n + 14];
                h[u + 15] = m[n + 15];
              }
            } else
              h = S.subarray(f >> 2, f + 64 * b >> 2);
            Y.uniformMatrix4fv(Z(a), !!d, h);
          }
        },
        Kc: function(a) {
          a = nd[a];
          Y.useProgram(a);
          Y.Hf = a;
        },
        Lc: function(a, b) {
          Y.vertexAttrib1f(a, b);
        },
        Mc: function(a, b) {
          Y.vertexAttrib2f(a, S[b >> 2], S[b + 4 >> 2]);
        },
        Nc: function(a, b) {
          Y.vertexAttrib3f(a, S[b >> 2], S[b + 4 >> 2], S[b + 8 >> 2]);
        },
        Oc: function(a, b) {
          Y.vertexAttrib4f(a, S[b >> 2], S[b + 4 >> 2], S[b + 8 >> 2], S[b + 12 >> 2]);
        },
        pc: function(a, b) {
          Y.vertexAttribDivisor(a, b);
        },
        qc: function(a, b, d, f, h) {
          Y.vertexAttribIPointer(a, b, d, f, h);
        },
        Pc: function(a, b, d, f, h, m) {
          Y.vertexAttribPointer(
            a,
            b,
            d,
            !!f,
            h,
            m
          );
        },
        Qc: function(a, b, d, f) {
          Y.viewport(a, b, d, f);
        },
        lb: function(a, b, d, f) {
          Y.waitSync(td[a], b, (d >>> 0) + 4294967296 * f);
        },
        tb: function(a) {
          var b = K.length;
          a >>>= 0;
          if (2147483648 < a)
            return false;
          for (var d = 1; 4 >= d; d *= 2) {
            var f = b * (1 + 0.2 / d);
            f = Math.min(f, a + 100663296);
            var h = Math;
            f = Math.max(a, f);
            h = h.min.call(h, 2147483648, f + (65536 - f % 65536) % 65536);
            a: {
              try {
                Ra.grow(h - kb.byteLength + 65535 >>> 16);
                ob();
                var m = 1;
                break a;
              } catch (u) {
              }
              m = void 0;
            }
            if (m)
              return true;
          }
          return false;
        },
        nb: function() {
          return x ? x.Uf : 0;
        },
        wb: function(a, b) {
          var d = 0;
          Od().forEach(function(f, h) {
            var m = b + d;
            h = mb[a + 4 * h >> 2] = m;
            for (m = 0; m < f.length; ++m)
              lb[h++ >> 0] = f.charCodeAt(m);
            lb[h >> 0] = 0;
            d += f.length + 1;
          });
          return 0;
        },
        xb: function(a, b) {
          var d = Od();
          mb[a >> 2] = d.length;
          var f = 0;
          d.forEach(function(h) {
            f += h.length + 1;
          });
          mb[b >> 2] = f;
          return 0;
        },
        Jb: function(a) {
          if (!noExitRuntime) {
            if (w.onExit)
              w.onExit(a);
            Sa = true;
          }
          wa(a, new Ja(a));
        },
        O: function() {
          return 52;
        },
        ob: function() {
          return 52;
        },
        Cb: function() {
          return 52;
        },
        pb: function() {
          return 70;
        },
        T: function(a, b, d, f) {
          for (var h = 0, m = 0; m < d; m++) {
            var u = mb[b >> 2], n = mb[b + 4 >> 2];
            b += 8;
            for (var q = 0; q < n; q++) {
              var v = K[u + q], E = Qd[a];
              0 === v || 10 === v ? ((1 === a ? La : Ka)(Va(E, 0)), E.length = 0) : E.push(v);
            }
            h += n;
          }
          mb[f >> 2] = h;
          return 0;
        },
        c: function() {
          return Ma;
        },
        k: ae,
        o: be,
        l: ce,
        K: de,
        Lb: ee,
        _: fe,
        Z: ge,
        Q: he,
        p: ie,
        x: je,
        s: ke,
        w: le,
        Kb: me,
        Mb: ne,
        Nb: oe,
        d: function(a) {
          Ma = a;
        },
        rb: function(a, b, d, f) {
          return Ud(a, b, d, f);
        }
      };
      (function() {
        function a(h) {
          w.asm = h.exports;
          Ra = w.asm.dd;
          ob();
          pb = w.asm.fd;
          rb.unshift(w.asm.ed);
          ub--;
          w.monitorRunDependencies && w.monitorRunDependencies(ub);
          0 == ub && (wb && (h = wb, wb = null, h()));
        }
        function b(h) {
          a(h.instance);
        }
        function d(h) {
          return Cb().then(function(m) {
            return WebAssembly.instantiate(m, f);
          }).then(function(m) {
            return m;
          }).then(h, function(m) {
            Ka("failed to asynchronously prepare wasm: " + m);
            Qa(m);
          });
        }
        var f = { a: pe };
        ub++;
        w.monitorRunDependencies && w.monitorRunDependencies(ub);
        if (w.instantiateWasm)
          try {
            return w.instantiateWasm(f, a);
          } catch (h) {
            return Ka("Module.instantiateWasm callback failed with error: " + h), false;
          }
        (function() {
          return Na || "function" != typeof WebAssembly.instantiateStreaming || yb() || zb.startsWith("file://") || za || "function" != typeof fetch ? d(b) : fetch(zb, { credentials: "same-origin" }).then(function(h) {
            return WebAssembly.instantiateStreaming(h, f).then(b, function(m) {
              Ka("wasm streaming compile failed: " + m);
              Ka("falling back to ArrayBuffer instantiation");
              return d(b);
            });
          });
        })().catch(ea);
        return {};
      })();
      w.___wasm_call_ctors = function() {
        return (w.___wasm_call_ctors = w.asm.ed).apply(null, arguments);
      };
      var Mc = w._free = function() {
        return (Mc = w._free = w.asm.gd).apply(null, arguments);
      }, Hd = w._malloc = function() {
        return (Hd = w._malloc = w.asm.hd).apply(null, arguments);
      }, Lc = w.___getTypeName = function() {
        return (Lc = w.___getTypeName = w.asm.id).apply(null, arguments);
      };
      w.___embind_register_native_and_builtin_types = function() {
        return (w.___embind_register_native_and_builtin_types = w.asm.jd).apply(null, arguments);
      };
      var qe = w._setThrew = function() {
        return (qe = w._setThrew = w.asm.kd).apply(null, arguments);
      }, re = w.stackSave = function() {
        return (re = w.stackSave = w.asm.ld).apply(null, arguments);
      }, se = w.stackRestore = function() {
        return (se = w.stackRestore = w.asm.md).apply(null, arguments);
      };
      w.dynCall_viji = function() {
        return (w.dynCall_viji = w.asm.nd).apply(null, arguments);
      };
      w.dynCall_vijiii = function() {
        return (w.dynCall_vijiii = w.asm.od).apply(null, arguments);
      };
      w.dynCall_viiiiij = function() {
        return (w.dynCall_viiiiij = w.asm.pd).apply(null, arguments);
      };
      w.dynCall_jiiiijiiiii = function() {
        return (w.dynCall_jiiiijiiiii = w.asm.qd).apply(null, arguments);
      };
      w.dynCall_viiij = function() {
        return (w.dynCall_viiij = w.asm.rd).apply(null, arguments);
      };
      w.dynCall_jii = function() {
        return (w.dynCall_jii = w.asm.sd).apply(null, arguments);
      };
      w.dynCall_vij = function() {
        return (w.dynCall_vij = w.asm.td).apply(null, arguments);
      };
      w.dynCall_iiij = function() {
        return (w.dynCall_iiij = w.asm.ud).apply(null, arguments);
      };
      w.dynCall_iiiij = function() {
        return (w.dynCall_iiiij = w.asm.vd).apply(null, arguments);
      };
      w.dynCall_viij = function() {
        return (w.dynCall_viij = w.asm.wd).apply(null, arguments);
      };
      w.dynCall_ji = function() {
        return (w.dynCall_ji = w.asm.xd).apply(null, arguments);
      };
      w.dynCall_iij = function() {
        return (w.dynCall_iij = w.asm.yd).apply(null, arguments);
      };
      w.dynCall_jiiiiii = function() {
        return (w.dynCall_jiiiiii = w.asm.zd).apply(null, arguments);
      };
      w.dynCall_jiiiiji = function() {
        return (w.dynCall_jiiiiji = w.asm.Ad).apply(null, arguments);
      };
      w.dynCall_iijj = function() {
        return (w.dynCall_iijj = w.asm.Bd).apply(null, arguments);
      };
      w.dynCall_iiiji = function() {
        return (w.dynCall_iiiji = w.asm.Cd).apply(null, arguments);
      };
      w.dynCall_iiji = function() {
        return (w.dynCall_iiji = w.asm.Dd).apply(null, arguments);
      };
      w.dynCall_iijjiii = function() {
        return (w.dynCall_iijjiii = w.asm.Ed).apply(null, arguments);
      };
      w.dynCall_vijjjii = function() {
        return (w.dynCall_vijjjii = w.asm.Fd).apply(null, arguments);
      };
      w.dynCall_jiji = function() {
        return (w.dynCall_jiji = w.asm.Gd).apply(null, arguments);
      };
      w.dynCall_viijii = function() {
        return (w.dynCall_viijii = w.asm.Hd).apply(null, arguments);
      };
      w.dynCall_iiiiij = function() {
        return (w.dynCall_iiiiij = w.asm.Id).apply(null, arguments);
      };
      w.dynCall_iiiiijj = function() {
        return (w.dynCall_iiiiijj = w.asm.Jd).apply(null, arguments);
      };
      w.dynCall_iiiiiijj = function() {
        return (w.dynCall_iiiiiijj = w.asm.Kd).apply(null, arguments);
      };
      function ce(a, b, d, f) {
        var h = re();
        try {
          return Eb(a)(b, d, f);
        } catch (m) {
          se(h);
          if (m !== m + 0)
            throw m;
          qe(1, 0);
        }
      }
      function ae(a, b) {
        var d = re();
        try {
          return Eb(a)(b);
        } catch (f) {
          se(d);
          if (f !== f + 0)
            throw f;
          qe(1, 0);
        }
      }
      function oe(a, b, d, f, h, m, u, n, q, v) {
        var E = re();
        try {
          Eb(a)(b, d, f, h, m, u, n, q, v);
        } catch (G) {
          se(E);
          if (G !== G + 0)
            throw G;
          qe(1, 0);
        }
      }
      function ke(a, b, d, f) {
        var h = re();
        try {
          Eb(a)(b, d, f);
        } catch (m) {
          se(h);
          if (m !== m + 0)
            throw m;
          qe(1, 0);
        }
      }
      function je(a, b, d) {
        var f = re();
        try {
          Eb(a)(b, d);
        } catch (h) {
          se(f);
          if (h !== h + 0)
            throw h;
          qe(1, 0);
        }
      }
      function he(a) {
        var b = re();
        try {
          Eb(a)();
        } catch (d) {
          se(b);
          if (d !== d + 0)
            throw d;
          qe(1, 0);
        }
      }
      function le(a, b, d, f, h) {
        var m = re();
        try {
          Eb(a)(b, d, f, h);
        } catch (u) {
          se(m);
          if (u !== u + 0)
            throw u;
          qe(1, 0);
        }
      }
      function ie(a, b) {
        var d = re();
        try {
          Eb(a)(b);
        } catch (f) {
          se(d);
          if (f !== f + 0)
            throw f;
          qe(1, 0);
        }
      }
      function be(a, b, d) {
        var f = re();
        try {
          return Eb(a)(b, d);
        } catch (h) {
          se(f);
          if (h !== h + 0)
            throw h;
          qe(1, 0);
        }
      }
      function ne(a, b, d, f, h, m, u) {
        var n = re();
        try {
          Eb(a)(b, d, f, h, m, u);
        } catch (q) {
          se(n);
          if (q !== q + 0)
            throw q;
          qe(1, 0);
        }
      }
      function de(a, b, d, f, h) {
        var m = re();
        try {
          return Eb(a)(b, d, f, h);
        } catch (u) {
          se(m);
          if (u !== u + 0)
            throw u;
          qe(1, 0);
        }
      }
      function ee(a, b, d, f, h, m) {
        var u = re();
        try {
          return Eb(a)(b, d, f, h, m);
        } catch (n) {
          se(u);
          if (n !== n + 0)
            throw n;
          qe(1, 0);
        }
      }
      function fe(a, b, d, f, h, m, u) {
        var n = re();
        try {
          return Eb(a)(b, d, f, h, m, u);
        } catch (q) {
          se(n);
          if (q !== q + 0)
            throw q;
          qe(1, 0);
        }
      }
      function me(a, b, d, f, h, m) {
        var u = re();
        try {
          Eb(a)(b, d, f, h, m);
        } catch (n) {
          se(u);
          if (n !== n + 0)
            throw n;
          qe(1, 0);
        }
      }
      function ge(a, b, d, f, h, m, u, n, q, v) {
        var E = re();
        try {
          return Eb(a)(b, d, f, h, m, u, n, q, v);
        } catch (G) {
          se(E);
          if (G !== G + 0)
            throw G;
          qe(1, 0);
        }
      }
      var te;
      function Ja(a) {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + a + ")";
        this.status = a;
      }
      wb = function ue() {
        te || ve();
        te || (wb = ue);
      };
      function ve() {
        function a() {
          if (!te && (te = true, w.calledRun = true, !Sa)) {
            Db(rb);
            da(w);
            if (w.onRuntimeInitialized)
              w.onRuntimeInitialized();
            if (w.postRun)
              for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {
                var b = w.postRun.shift();
                sb.unshift(b);
              }
            Db(sb);
          }
        }
        if (!(0 < ub)) {
          if (w.preRun)
            for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )
              tb();
          Db(qb);
          0 < ub || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
              w.setStatus("");
            }, 1);
            a();
          }, 1)) : a());
        }
      }
      w.run = ve;
      if (w.preInit)
        for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )
          w.preInit.pop()();
      ve();
      return CanvasKitInit3.ready;
    };
  })();
  module.exports = CanvasKitInit2;
})(canvaskit);
var canvaskitExports = canvaskit.exports;
var CanvasKitInit = /* @__PURE__ */ getDefaultExportFromCjs(canvaskitExports);
class Sprite extends Entity {
  /**
   * Visual image displayed on the screen.
   *
   * @remarks Images that will be used to create the sprite must be loaded during the Game.initialize() method prior to their use.
   *
   * @param options - {@link SpriteOptions}
   */
  constructor(options = {}) {
    super(options);
    this.type = EntityType.Sprite;
    this.isDrawable = true;
    this.anchorPoint = { x: 0.5, y: 0.5 };
    this.zPosition = 0;
    this._imageName = "";
    handleInterfaceOptions(this, options);
    if (options.imageName !== void 0) {
      this.imageName = options.imageName;
    }
  }
  initialize() {
    this.loadedImage = this.game.imageManager.getLoadedImage(this._imageName);
    if (!this.loadedImage) {
      throw new Error(
        `could not create sprite. the image named ${this._imageName} has not been loaded`
      );
    }
    this.size.width = this.loadedImage.width;
    this.size.height = this.loadedImage.height;
    if (!this._paint) {
      this.paint = new this.canvasKit.Paint();
    }
    this.needsInitialization = false;
  }
  dispose() {
    CanvasKitHelpers.Dispose([this.loadedImage?.image, this._paint]);
  }
  set imageName(imageName) {
    this._imageName = imageName;
    this.needsInitialization = true;
  }
  get imageName() {
    return this._imageName;
  }
  set paint(paint) {
    this._paint = paint;
  }
  get paint() {
    if (!this._paint) {
      throw new Error(
        `in paint getter: Sprite entity ${this.toString()} paint is undefined.`
      );
    }
    return this._paint;
  }
  /**
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  duplicate(newName) {
    const dest = new Sprite({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      imageName: this.imageName,
      name: newName
    });
    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }
    return dest;
  }
  update() {
    super.update();
  }
  draw(canvas) {
    if (!this.hidden) {
      if (this.loadedImage) {
        canvas.save();
        const drawScale = Globals.canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);
        M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);
        const x = (this.absolutePosition.x - this.size.width * this.anchorPoint.x * this.absoluteScale) * drawScale;
        const y = (this.absolutePosition.y - this.size.height * this.anchorPoint.y * this.absoluteScale) * drawScale;
        if (this.absoluteAlphaChange !== 0) {
          this.paint.setAlphaf(this.absoluteAlpha);
        }
        canvas.drawImage(this.loadedImage.image, x, y, this.paint);
        canvas.restore();
      }
      super.drawChildren(canvas);
    }
  }
  warmup(canvas) {
    this.initialize();
    if (!this.loadedImage) {
      throw new Error(
        `warmup Sprite entity ${this.toString()}: image not loaded.`
      );
    }
    canvas.drawImage(this.loadedImage.image, 0, 0);
    this.children.forEach((child) => {
      if (child.isDrawable) {
        child.warmup(canvas);
      }
    });
  }
}
class LoadedImage {
  constructor(name2, image, width, height) {
    this.name = name2;
    this.image = image;
    this.width = width;
    this.height = height;
  }
}
class Scene extends Entity {
  /**
   * Top-level entity that holds all other entities, such as sprites, rectangles, or labels, that will be displayed on the screen
   *
   * @remarks The scene is the game screen or stage, and fills the entire available screen. There are usually multiple screens to contain multiple stages of the game, such as various instruction pages or phases of a game.
   *
   * @param options - {@link SceneOptions}
   */
  constructor(options = {}) {
    super(options);
    this.type = EntityType.Scene;
    this.isDrawable = true;
    this.anchorPoint = { x: 0, y: 0 };
    this.zPosition = 0;
    this._backgroundColor = Constants.DEFAULT_SCENE_BACKGROUND_COLOR;
    this._active = false;
    this._transitioning = false;
    handleInterfaceOptions(this, options);
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
  }
  initialize() {
    this.scale = Globals.rootScale;
    this.size.width = this.game.canvasCssWidth;
    this.size.height = this.game.canvasCssHeight;
    if (this.backgroundPaint) {
      this.backgroundPaint.delete();
    }
    this.backgroundPaint = CanvasKitHelpers.makePaint(
      this.canvasKit,
      this.backgroundColor,
      this.canvasKit.PaintStyle.Fill,
      false
    );
    this.needsInitialization = false;
  }
  dispose() {
    CanvasKitHelpers.Dispose([this.backgroundPaint]);
  }
  set game(game) {
    this._game = game;
  }
  /**
   * The game which this scene is a part of.
   *
   * @remarks Throws error if scene is not part of the game object.
   */
  get game() {
    if (this._game === void 0) {
      throw new Error(`Scene ${this} has not been added to a game.`);
    }
    return this._game;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }
  /**
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  duplicate(newName) {
    const dest = new Scene({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      backgroundColor: this.backgroundColor,
      name: newName
    });
    dest.game = this.game;
    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }
    return dest;
  }
  /**
   * Code that will be called every time the scene is presented.
   *
   * @remarks Use this callback to set entities to their initial state, if
   * that state might be changed later. For example, if a scene allows
   * players to place dots on a grid, the setup() method should ensure the
   * grid is clear of any prior dots from previous times this scene may
   * have been displayed. In addition, if entities should vary in each
   * iteration, that should be done here.
   *
   * @param callback
   */
  onSetup(callback) {
    this._setupCallback = callback;
  }
  /**
   *
   * Code that will be called after the scene has finished any transitions
   * and has fully appeared on the screen.
   *
   * @param callback
   */
  onAppear(callback) {
    this._appearCallback = callback;
  }
  update() {
    super.update();
  }
  draw(canvas) {
    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);
    if (!this.backgroundPaint) {
      throw new Error(`in Scene ${this}, background paint is undefined.`);
    }
    if (this.absoluteAlphaChange !== 0) {
      this.backgroundPaint.setAlphaf(this.absoluteAlpha);
    }
    canvas.drawRect(
      [
        this.position.x * drawScale * Globals.rootScale,
        this.position.y * drawScale * Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * Globals.rootScale,
        (this.position.y + this.size.height) * drawScale * Globals.rootScale
      ],
      this.backgroundPaint
    );
    canvas.restore();
    super.drawChildren(canvas);
  }
  warmup(canvas) {
    this.initialize();
    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.backgroundPaint) {
      throw new Error(`in Scene ${this}, background paint is undefined.`);
    }
    canvas.drawRect(
      [
        this.position.x * drawScale * Globals.rootScale,
        this.position.y * drawScale * Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * Globals.rootScale,
        (this.position.y + this.size.height) * drawScale * Globals.rootScale
      ],
      this.backgroundPaint
    );
    canvas.restore();
    this.children.forEach((child) => {
      if (child.isDrawable) {
        child.warmup(canvas);
      }
    });
  }
}
class Transition {
  /**
   * Creates a scene transition in which the outgoing scene slides out and the incoming scene slides in, as if the incoming scene pushes it.
   *
   * @param options - {@link SlideTransitionOptions}
   * @returns
   */
  static slide(options) {
    return new SlideTransition(
      options.direction,
      options.duration,
      options.easing ?? Easings.linear
    );
  }
  /**
   * Creates a scene transition with no animation or duration. The next scene is immediately drawn.
   */
  static none() {
    return new NoneTransition();
  }
}
class NoneTransition extends Transition {
  constructor() {
    super();
    this.type = "None";
    this.duration = NaN;
    this.easing = Easings.none;
  }
}
class SlideTransition extends Transition {
  constructor(direction, duration, easing) {
    super();
    this.type = "Slide";
    this.direction = direction;
    this.duration = duration;
    this.easing = easing;
  }
}
var TransitionType = /* @__PURE__ */ ((TransitionType2) => {
  TransitionType2["Slide"] = "Slide";
  TransitionType2["None"] = "None";
  return TransitionType2;
})(TransitionType || {});
var TransitionDirection = /* @__PURE__ */ ((TransitionDirection2) => {
  TransitionDirection2["Up"] = "Up";
  TransitionDirection2["Down"] = "Down";
  TransitionDirection2["Right"] = "Right";
  TransitionDirection2["Left"] = "Left";
  return TransitionDirection2;
})(TransitionDirection || {});
class SceneTransition {
  constructor(scene, transition) {
    this.scene = scene;
    this.transition = transition;
  }
}
const _Timer = class _Timer2 {
  constructor(name2) {
    this.startTime = NaN;
    this.stopTime = NaN;
    this.stopped = true;
    this.cumulativeElapsed = NaN;
    this.name = name2;
  }
  /**
   * Aliases performance.now()
   *
   * @remarks The m2c2kit Timer class is designed to measure elapsed durations
   * after a designated start point for a uniquely named timer. However, if a
   * timestamp based on the
   * [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin)
   * is needed, this method can be used.
   *
   * @returns a [DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp)
   */
  static now() {
    return window.performance.now();
  }
  /**
   * Starts a millisecond-resolution timer based on
   * [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).
   *
   * @remarks The method throws an error if a timer with the given
   * name is already in a started state.
   *
   * @param name - The name of the timer to be started
   */
  static start(name2) {
    let timer = this._timers.filter((t) => t.name === name2).find(Boolean);
    if (timer === void 0) {
      timer = new _Timer2(name2);
      timer.cumulativeElapsed = 0;
      this._timers.push(timer);
    } else {
      if (timer.stopped == false) {
        throw new Error(
          `can't start timer. timer with name ${name2} is already started`
        );
      }
    }
    timer.startTime = window.performance.now();
    timer.stopped = false;
  }
  /**
   * Stops a timer.
   *
   * @remarks The method throws an error if a timer with the given
   * name is already in a stopped state, or if a timer with the
   * given name has not been started.
   *
   * @param name - The name of the timer to be stopped
   */
  static stop(name2) {
    const timer = this._timers.filter((t) => t.name === name2).find(Boolean);
    if (timer === void 0) {
      throw new Error(
        `can't stop timer. timer with name ${name2} does not exist`
      );
    }
    if (timer.stopped === true) {
      throw new Error(
        `can't stop timer. timer with name ${name2} is already stopped`
      );
    }
    timer.stopTime = window.performance.now();
    timer.cumulativeElapsed = timer.cumulativeElapsed + timer.stopTime - timer.startTime;
    timer.stopped = true;
  }
  /**
   * Restarts a timer.
   *
   * @remarks The timer elapsed duration is set to 0 and it starts anew.
   * The method throws an error if a timer with the given
   * name does not exist (if there is not a started or stopped timer
   * with the given name).
   *
   * @param name - The name of the timer to be restarted
   */
  static restart(name2) {
    const timer = this._timers.filter((t) => t.name === name2).find(Boolean);
    if (timer === void 0) {
      throw new Error(
        `can't restart timer. timer with name ${name2} does not exist`
      );
    }
    timer.startTime = window.performance.now();
    timer.cumulativeElapsed = 0;
    timer.stopped = false;
  }
  /**
   * Returns the total time elapsed, in milliseconds, of the timer.
   *
   * @remarks The total time elapsed will include all durations from multiple
   * starts and stops of the timer, if applicable. A timer's elapsed duration
   * can be read while it is in started or stopped state. The method throws
   * an error if a timer with the given name does not exist.
   *
   * @param name - The name of the timer whose elapsed duration is requested
   */
  static elapsed(name2) {
    const timer = this._timers.filter((t) => t.name === name2).find(Boolean);
    if (timer === void 0) {
      throw new Error(
        `can't get elapsed time. timer with name ${name2} does not exist`
      );
    }
    if (timer.stopped) {
      return timer.cumulativeElapsed;
    }
    return timer.cumulativeElapsed + window.performance.now() - timer.startTime;
  }
  /**
   * Removes a timer.
   *
   * @remarks After removal, no additional methods can be used with a timer
   * of the given name, other than to start a new timer with the given name,
   * whose duration will begin at 0 again. The method throws an error if
   * a timer with the given name does not exist.
   *
   * @param name - The name of the timer to be removed
   */
  static remove(name2) {
    const timer = this._timers.filter((t) => t.name === name2).find(Boolean);
    if (timer === void 0) {
      throw new Error(
        `can't remove timer. timer with name ${name2} does not exist`
      );
    }
    this._timers = this._timers.filter((t) => t.name != name2);
  }
  /**
   * Remove all timers.
   *
   * @remarks This method will {@link remove} any timers in a started or
   * stopped state. This method is idempotent; method is safe to call even
   * if there are no timers to remove; no errors are thrown if there are
   * not any timers that can be removed.
   */
  static removeAll() {
    this._timers = new Array();
  }
  /**
   * Checks if a timer of the given name exists.
   *
   * @remarks The method checks if there is a timer with the given name.
   *
   * @param name - The name of the timer to check for existence
   * @returns boolean
   */
  static exists(name2) {
    return this._timers.some((t) => t.name === name2);
  }
};
_Timer._timers = new Array();
let Timer = _Timer;
const deviceMetadataSchema = {
  type: "object",
  description: "Information about the user's device.",
  properties: {
    userAgent: {
      type: "string",
      description: "The user agent string returned by navigator.userAgent."
    },
    devicePixelRatio: {
      type: "number",
      description: "Ratio of physical pixels to CSS pixels."
    },
    screen: {
      type: "object",
      description: "Screen information returned by window.screen.",
      properties: {
        availHeight: {
          type: "number",
          description: "Height of screen, in pixels, excluding UI features."
        },
        availWidth: {
          type: "number",
          description: "Width of screen, in pixels, excluding UI features."
        },
        colorDepth: {
          type: "number",
          description: "Color depth of screen."
        },
        height: {
          type: "number",
          description: "Height of screen, in pixels"
        },
        width: {
          type: "number",
          description: "Width of screen, in pixels."
        },
        orientation: {
          type: "object",
          description: "Information about the device's orientation.",
          properties: {
            type: {
              type: "string",
              description: "The orientation type (ScreenOrientation.type)."
            },
            angle: {
              type: "number",
              description: "The orientation angle (ScreenOrientation.angle)."
            }
          }
        },
        pixelDepth: {
          type: "number",
          description: "Pixel depth of screen."
        }
      }
    },
    webGlRenderer: {
      type: "string",
      description: "WebGL driver vendor and renderer. Taken from WEBGL_debug_renderer_info."
    }
  }
};
class WebGlInfo {
  /**
   * Returns graphics driver vendor and renderer information.
   *
   * @remarks Information is from parameters UNMASKED_VENDOR_WEBGL and
   * UNMASKED_RENDERER_WEBGL when asking for WEBGL_debug_renderer_info
   * from the WebGLRenderingContext.
   *
   * @returns string
   */
  static getRendererString() {
    const rendererInfoCanvas = document.createElement("canvas");
    rendererInfoCanvas.id = "webgl-renderer-info-canvas";
    rendererInfoCanvas.height = 0;
    rendererInfoCanvas.width = 0;
    rendererInfoCanvas.hidden = true;
    document.body.appendChild(rendererInfoCanvas);
    const gl = rendererInfoCanvas.getContext("webgl");
    let rendererString = "no webgl context";
    if (!gl) {
      return rendererString;
    }
    const debugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugRendererInfo != null) {
      rendererString = String(gl.getParameter(debugRendererInfo.UNMASKED_VENDOR_WEBGL)) + ", " + String(gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL));
    } else {
      rendererString = "no debug renderer info";
    }
    rendererInfoCanvas.remove();
    return rendererString;
  }
  /**
   * Removes the temporary canvas that was created to get WebGL information.
   */
  static dispose() {
    const rendererInfoCanvas = document.getElementById(
      "webgl-renderer-info-canvas"
    );
    if (rendererInfoCanvas) {
      rendererInfoCanvas.remove();
    }
  }
}
class I18n {
  constructor(options) {
    this.locale = "";
    this.fallbackLocale = "en";
    this.environmentLocale = this.getEnvironmentLocale();
    this.options = options;
    this._translations = this.mergeAdditionalTranslations(
      options.translations,
      options.additionalTranslations
    ) ?? {};
    if (options.locale.toLowerCase() === "auto") {
      this.locale = this.environmentLocale;
      if (!this.locale) {
        if (options.fallbackLocale) {
          this.fallbackLocale = options.fallbackLocale;
          console.warn(
            `auto locale requested, but environment cannot provide locale. Using fallback locale ${options.fallbackLocale}`
          );
        } else {
          console.warn(
            `auto locale requested, but environment cannot provide locale. Defaulting to "en".`
          );
        }
      }
    } else {
      this.locale = options.locale;
      if (options.fallbackLocale) {
        this.fallbackLocale = options.fallbackLocale;
      }
    }
  }
  static makeLocalizationParameters() {
    const localizationParameters = JSON.parse(
      JSON.stringify({
        locale: {
          type: ["string", "null"],
          default: null,
          description: `Locale to use for localization, or "auto" to request from the environment.`
        },
        fallback_locale: {
          type: ["string", "null"],
          default: null,
          description: `Locale to use if requested locale translation is not available, or if "auto" locale was requested and environment cannot provide a locale.`
        },
        missing_translation_font_color: {
          type: ["array", "null"],
          default: null,
          description: "Font color for strings that are missing translation and use the fallback locale or untranslated string, [r,g,b,a].",
          items: {
            type: "number"
          }
        },
        translations: {
          type: ["object", "null"],
          default: null,
          description: "Additional translations for localization."
        }
      })
    );
    return localizationParameters;
  }
  t(key, useFallback = false) {
    if (useFallback) {
      return this._translations[this.fallbackLocale]?.[key];
    }
    return this._translations[this.locale]?.[key];
  }
  get translations() {
    return this._translations;
  }
  set translations(value) {
    this._translations = value;
  }
  getEnvironmentLocale() {
    return navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
  }
  mergeAdditionalTranslations(baseTranslations, additionalTranslations) {
    if (!baseTranslations && !additionalTranslations) {
      return void 0;
    }
    if (!additionalTranslations) {
      return baseTranslations;
    }
    if (!baseTranslations) {
      return additionalTranslations;
    }
    const result2 = {};
    const processedLocales = new Array();
    for (const locale in baseTranslations) {
      processedLocales.push(locale);
      result2[locale] = {
        ...baseTranslations[locale],
        ...additionalTranslations[locale]
      };
    }
    for (const locale in additionalTranslations) {
      if (processedLocales.includes(locale)) {
        continue;
      }
      result2[locale] = additionalTranslations[locale];
    }
    return result2;
  }
}
class DomHelpers {
  /**
   * Add elements to hide the canvas and show a spinner.
   */
  static addLoadingElements() {
    const containerDiv = document.getElementById("m2c2kit-container-div");
    if (!containerDiv) {
      throw new Error("Could not find container element");
    }
    let overlayDiv = document.getElementById("m2c2kit-canvas-overlay-div");
    if (!overlayDiv) {
      overlayDiv = document.createElement("div");
      overlayDiv.setAttribute("id", "m2c2kit-canvas-overlay-div");
      overlayDiv.className = "m2c2kit-canvas-overlay m2c2kit-display-none";
      const spinnerDiv = document.createElement("div");
      spinnerDiv.setAttribute("id", "m2c2kit-spinner-div");
      spinnerDiv.className = "m2c2kit-spinner m2c2kit-display-none";
      containerDiv.appendChild(overlayDiv);
      containerDiv.appendChild(spinnerDiv);
    }
  }
  /**
   * Depending on the type of activity, set the visibility of the survey div
   * and canvas div.
   *
   * @param activity - the activity to configure the DOM for
   */
  static configureDomForActivity(activity) {
    if (activity.type == ActivityType.Game) {
      this.setCanvasDivVisibility(true);
      this.setSurveyDivVisibility(false);
    }
    if (activity.type == ActivityType.Survey) {
      this.setCanvasDivVisibility(false);
      this.setSurveyDivVisibility(true);
      DomHelpers.setSpinnerVisibility(false);
      DomHelpers.setCanvasOverlayVisibility(false);
    }
  }
  /**
   * Hide the canvas div and survey div.
   */
  static hideAll() {
    this.setCanvasDivVisibility(false);
    this.setSurveyDivVisibility(false);
  }
  /**
   * Shows or hides the canvas overlay.
   *
   * @param visible - true if the canvas overlay should be visible
   */
  static setCanvasOverlayVisibility(visible) {
    const div = document.getElementById("m2c2kit-canvas-overlay-div");
    if (div) {
      if (visible) {
        div.classList.remove("m2c2kit-display-none");
      } else {
        div.classList.add("m2c2kit-display-none");
      }
    }
  }
  /**
   * Shows or hides the spinner.
   *
   * @param visible - true if the spinner should be visible
   */
  static setSpinnerVisibility(visible) {
    const div = document.getElementById("m2c2kit-spinner-div");
    if (div) {
      if (visible) {
        div.classList.remove("m2c2kit-display-none");
      } else {
        div.classList.add("m2c2kit-display-none");
      }
    }
  }
  /**
   * Shows or hides the survey div.
   *
   * @param visible - true if the survey div should be visible
   */
  static setSurveyDivVisibility(visible) {
    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (surveyDiv && visible) {
      surveyDiv.classList.remove("m2c2kit-display-none");
      surveyDiv.classList.add("m2c2kit-display-block");
    }
    if (surveyDiv && !visible) {
      surveyDiv.classList.add("m2c2kit-display-none");
      surveyDiv.classList.remove("m2c2kit-display-block");
    }
  }
  /**
   * Shows or hides the canvas div.
   *
   * @param visible - true if the canvas div should be visible
   */
  static setCanvasDivVisibility(visible) {
    const canvasDiv = document.getElementById("m2c2kit-container-div");
    if (canvasDiv && visible) {
      canvasDiv.classList.remove("m2c2kit-display-none");
      canvasDiv.classList.add("m2c2kit-flex-container");
    }
    if (canvasDiv && !visible) {
      canvasDiv.classList.add("m2c2kit-display-none");
      canvasDiv.classList.remove("m2c2kit-flex-container");
    }
  }
}
class RenderedDataUrlImage {
  constructor(name2, dataUrlImage, width, height) {
    this.name = name2;
    this.dataUrlImage = dataUrlImage;
    this.width = width;
    this.height = height;
  }
}
class ImageManager {
  constructor(game) {
    this.loadedImages = {};
    this.renderedImages = {};
    this.game = game;
    this.canvasKit = game.canvasKit;
  }
  /**
   * Fetches image assets and makes them available for use.
   *
   * @param images - array of BrowserImage objects (name, url, size)
   */
  async initializeImages(images) {
    await this.renderImages(images ?? []);
    this.loadRenderedImages();
    this.removeScratchCanvas();
  }
  /**
   * Converts the browser-rendered images to CanvasKit Images and makes them
   * available to the game.
   *
   * @remarks Typically, a programmer won't call this because
   * initializeImages() will do this.
   */
  loadRenderedImages() {
    const imageNames = Object.keys(this.renderedImages);
    imageNames.forEach((imageName) => {
      const loadedImage = this.convertRenderedDataUrlImageToCanvasKitImage(
        this.renderedImages[imageName]
      );
      if (!this.loadedImages) {
        this.loadedImages = {};
      }
      this.addLoadedImage(loadedImage);
    });
  }
  /**
   * Returns a CanvasKit Image that was previously rendered by the ImageManager.
   *
   * @remarks Typically, this won't be called directly because a programmer
   * will use a higher-level abstraction (m2c2kit Sprite).
   *
   * @param imageName - The name given to the rendered image
   * @returns A CanvasKit Image
   */
  getLoadedImage(imageName) {
    return this.loadedImages[imageName];
  }
  /**
   * Adds a CanvasKit Image to the images available to the game.
   *
   * @remarks Typically, a programmer won't call this because images will be
   * automatically rendered and loaded in initializeImages().
   * The only time this function is called in-game is when our internal
   * methods add screenshot images needed for transitions.
   *
   * @param loadedImage - An image that has been converted to a CanvasKit Image
   */
  addLoadedImage(loadedImage) {
    if (!this.loadedImages) {
      this.loadedImages = {};
    }
    this.loadedImages[loadedImage.name] = loadedImage;
  }
  /**
   * Renders game images from their original format (png, jpg, svg) to
   * CanvasKit Image.
   *
   * @remarks Typically, a programmer won't call this because
   * initializeImages() will do this. Rendering is an async activity, and thus
   * this method returns a promise. Rendering of all images is done in
   * parallel.
   *
   * @param images - array of BrowserImage
   * @returns A promise that completes when all game images have rendered
   */
  renderImages(images) {
    const renderImagesPromises = new Array();
    if (images) {
      const findDuplicates = (arr) => arr.filter((item, index) => arr.indexOf(item) != index);
      const duplicateImageNames = findDuplicates(
        images.map((i) => i.imageName)
      );
      if (duplicateImageNames.length > 0) {
        throw new Error(
          `image names must be unique. these image names are duplicated within a game ${this.game.id}: ` + duplicateImageNames.join(", ")
        );
      }
      images.map((browserImage) => {
        renderImagesPromises.push(this.renderBrowserImage(browserImage));
      });
    }
    return Promise.all(renderImagesPromises);
  }
  /**
   * Our private method rendering an image to a CanvasKit Image
   *
   * @remarks This is complex because there is a separate flow to render
   * svg images versus other (e.g., jpg, png). Svg images may be provided
   * in a url or inline. In addition, there is a Firefox svg rendering issue,
   * see below, that must be handled.
   * Additional complexity comes from the potentially multiple async steps and
   * the multiple errors that can happen throughout.
   *
   * @param browserImage
   * @returns A promise of type void
   */
  renderBrowserImage(browserImage) {
    const image = document.createElement("img");
    const renderLoadedImage = () => {
      if (!this.scratchCanvas || !this.ctx || !this.scale) {
        throw new Error("image manager not set up");
      }
      this.scratchCanvas.width = browserImage.width * this.scale;
      this.scratchCanvas.height = browserImage.height * this.scale;
      this.ctx.scale(this.scale, this.scale);
      this.ctx.clearRect(0, 0, browserImage.width, browserImage.height);
      this.ctx.drawImage(image, 0, 0, browserImage.width, browserImage.height);
      const dataUrl = this.scratchCanvas.toDataURL();
      const renderedImage = new RenderedDataUrlImage(
        browserImage.imageName,
        dataUrl,
        browserImage.width,
        browserImage.height
      );
      image.remove();
      if (!this.renderedImages) {
        this.renderedImages = {};
      }
      this.renderedImages[browserImage.imageName] = renderedImage;
    };
    const onError = () => {
      let additional = "";
      if (browserImage.svgString) {
        additional = " image source was svgString";
      } else if (browserImage.url) {
        additional = ` image source was url ${browserImage.url}`;
      }
      console.warn(
        `unable to render image named ${browserImage.imageName}.${additional}`
      );
      const renderedImage = new RenderedDataUrlImage(
        browserImage.imageName,
        "",
        0,
        0
      );
      if (!this.renderedImages) {
        this.renderedImages = {};
      }
      this.renderedImages[browserImage.imageName] = renderedImage;
    };
    return new Promise((resolve2) => {
      image.width = browserImage.width;
      image.height = browserImage.height;
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        let isSvg = false;
        if (image.src.startsWith("data:image/svg+xml") || image.src.toLowerCase().endsWith("svg")) {
          isSvg = true;
        }
        if (isSvg && (image.naturalHeight === 0 || image.naturalWidth === 0)) {
          let imageSource;
          if (image.src.startsWith("data:image/svg+xml")) {
            imageSource = "svg string";
          } else {
            imageSource = image.src;
          }
          console.warn(
            `svg image named ${browserImage.imageName} loaded from ${imageSource} has naturalHeight 0 and/or naturalWidth 0. This is probably because the svg is missing height and width attributes. This will cause the svg not to render on Firefox, due to issue described at https://bugzilla.mozilla.org/show_bug.cgi?id=700533. m2c2kit will attempt to infer the height and width from the svg viewBox, but it is strongly recommended that all svg images have height and width attributes.`
          );
          const reloadImageUsingViewBoxWidthHeight = (svgElement) => {
            const viewBoxError = () => {
              console.warn(
                `svg image named ${browserImage.imageName} has missing or invalid viewBox; unable to render.`
              );
              renderLoadedImage();
              resolve2();
            };
            if (svgElement.hasAttribute("viewBox")) {
              const viewBox = svgElement.getAttribute("viewBox");
              if (viewBox) {
                const bounds = viewBox.split(" ");
                if (bounds.length === 4) {
                  svgElement.setAttribute("width", bounds[2]);
                  svgElement.setAttribute("height", bounds[3]);
                  image.onload = () => {
                    renderLoadedImage();
                    resolve2();
                  };
                  image.src = "data:image/svg+xml," + encodeURIComponent(svgElement.outerHTML);
                } else {
                  viewBoxError();
                }
              } else {
                viewBoxError();
              }
            } else {
              viewBoxError();
            }
          };
          if (browserImage.svgString) {
            const svgElement = new DOMParser().parseFromString(
              browserImage.svgString,
              "text/xml"
            ).documentElement;
            reloadImageUsingViewBoxWidthHeight(svgElement);
          } else if (browserImage.url) {
            const browserImageUrl = this.game.prependAssetsGameIdUrl(
              browserImage.url
            );
            fetch(browserImageUrl).then((res) => res.text()).then((body) => {
              const svgElement = new DOMParser().parseFromString(
                body,
                "text/xml"
              ).documentElement;
              reloadImageUsingViewBoxWidthHeight(svgElement);
            });
          } else {
            console.warn(
              `unable to render svg image named ${browserImage.imageName}.`
            );
            renderLoadedImage();
            resolve2();
          }
        } else {
          if (image.naturalHeight === 0 || image.naturalWidth === 0) {
            console.warn(
              `image named ${browserImage.imageName} has naturalHeight 0 and/or naturalWidth 0. This may cause inaccurate rendering. Please check the image.`
            );
          }
          renderLoadedImage();
          resolve2();
        }
      };
      image.onerror = () => {
        onError();
        resolve2();
      };
      if (browserImage.svgString && browserImage.url) {
        throw new Error(
          `provide svgString or url. both were provided for image named ${browserImage.imageName}`
        );
      }
      if (browserImage.svgString) {
        image.src = "data:image/svg+xml," + encodeURIComponent(browserImage.svgString);
      } else if (browserImage.url) {
        const browserImageUrl = this.game.prependAssetsGameIdUrl(
          browserImage.url
        );
        fetch(browserImageUrl).then((response) => response.arrayBuffer()).then((data) => {
          const base64String = this.arrayBufferToBase64String(data);
          const subtype = this.inferImageSubtypeFromUrl(browserImage.url);
          image.src = "data:image/" + subtype + ";base64," + base64String;
        });
      } else {
        throw new Error(
          `no svgString or url provided for image named ${browserImage.imageName}`
        );
      }
    });
  }
  arrayBufferToBase64String(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  inferImageSubtypeFromUrl(url) {
    let subtype = "jpeg";
    if (url?.includes(".")) {
      subtype = url.split(".").pop()?.toLowerCase() ?? "jpeg";
      if (subtype === "") {
        subtype = "jpeg";
      }
    }
    if (subtype === "svg") {
      subtype = "svg+xml";
    }
    return subtype;
  }
  convertRenderedDataUrlImageToCanvasKitImage(loadedDataUrlImage) {
    if (!this.canvasKit) {
      throw new Error("canvasKit undefined");
    }
    let img = null;
    try {
      img = this.canvasKit.MakeImageFromEncoded(
        this.dataURLtoArrayBuffer(loadedDataUrlImage.dataUrlImage)
      );
    } catch {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}."`
      );
    }
    if (img === null) {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}."`
      );
    }
    const loadedImage = new LoadedImage(
      loadedDataUrlImage.name,
      img,
      loadedDataUrlImage.width,
      loadedDataUrlImage.height
    );
    console.log(
      `image loaded. name: ${loadedDataUrlImage.name}, w: ${loadedDataUrlImage.width}, h: ${loadedDataUrlImage.height}`
    );
    return loadedImage;
  }
  /**
   * Returns the scratchCanvas, which is an extra, non-visible canvas in the
   * DOM we use so the native browser can render images like svg, png, jpg,
   * that we later will convert to CanvasKit Image.
   */
  get scratchCanvas() {
    if (!this._scratchCanvas) {
      this._scratchCanvas = document.createElement("canvas");
      this._scratchCanvas.id = `m2c2kit-scratch-canvas-${this.game.id}-${Math.floor(Math.random() * 1e6)}`;
      this._scratchCanvas.hidden = true;
      document.body.appendChild(this._scratchCanvas);
      const context2d = this._scratchCanvas.getContext("2d");
      if (context2d === null) {
        throw new Error("could not get 2d canvas context from scratch canvas");
      }
      this.ctx = context2d;
      this.scale = window.devicePixelRatio;
    }
    return this._scratchCanvas;
  }
  dataURLtoArrayBuffer(dataUrl) {
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr.buffer;
  }
  removeScratchCanvas() {
    this.ctx = void 0;
    this._scratchCanvas?.remove();
  }
}
class Game {
  /**
   * The base class for all games. New games should extend this class.
   *
   * @param options - {@link GameOptions}
   */
  constructor(options) {
    this.type = ActivityType.Game;
    this.uuid = Uuid.generate();
    this.canvasKitWasmVersion = "0.38.2";
    this.beginTimestamp = NaN;
    this.beginIso8601Timestamp = "";
    this.eventListeners = new Array();
    this.gameMetrics = new Array();
    this.stepCount = 0;
    this.steppingNow = 0;
    this.warmupFunctionQueue = new Array();
    this.loaderElementsRemoved = false;
    this.plugins = [];
    this.staticTrialSchema = {};
    this.isImportedModule = false;
    this.data = {
      trials: new Array()
    };
    this.trialIndex = 0;
    this.drawnFrames = 0;
    this.lastFpsUpdate = 0;
    this.nextFpsUpdate = 0;
    this.fpsRate = 0;
    this.animationFramesRequested = 0;
    this.limitFps = false;
    this.unitTesting = false;
    this.gameStopRequested = false;
    this.webGlRendererInfo = "";
    this.canvasCssWidth = 0;
    this.canvasCssHeight = 0;
    this.scenes = new Array();
    this.freeEntitiesScene = new Scene({
      name: Constants.FREE_ENTITIES_SCENE_NAME,
      backgroundColor: [255, 255, 255, 0]
    });
    this.incomingSceneTransitions = new Array();
    this.automaticTrialSchema = {
      document_uuid: {
        type: "string",
        format: "uuid",
        description: "Unique identifier for this data document."
      },
      session_uuid: {
        type: "string",
        format: "uuid",
        description: "Unique identifier for all activities in this administration of the session."
      },
      activity_uuid: {
        type: "string",
        format: "uuid",
        description: "Unique identifier for all trials in this administration of the activity."
      },
      activity_id: {
        type: "string",
        description: "Human-readable identifier of the activity."
      },
      activity_version: {
        type: "string",
        description: "Version of the activity."
      },
      device_timezone: {
        type: "string",
        description: "Timezone of the device. Calculated from Intl.DateTimeFormat().resolvedOptions().timeZone."
      },
      device_timezone_offset_minutes: {
        type: "integer",
        description: "Difference in minutes between UTC and device timezone. Calculated from Date.getTimezoneOffset()."
      }
    };
    this.snapshots = new Array();
    if (!options.id || options.id.trim() === "") {
      throw new Error("id is required in GameOptions");
    }
    this.options = options;
    this.name = options.name;
    this.id = options.id;
    this.freeEntitiesScene.game = this;
    this.freeEntitiesScene.needsInitialization = true;
    this.fpsMetricReportThreshold = options.fpsMetricReportThreshold ?? Constants.FPS_METRIC_REPORT_THRESHOLD;
    this.maximumRecordedActivityMetrics = options.maximumRecordedActivityMetrics ?? Constants.MAXIMUM_RECORDED_ACTIVITY_METRICS;
    this.addLocalizationParametersToGameParameters();
    if (!this.options.trialSchema) {
      this.options.trialSchema = {};
    }
    if (options.moduleMetadata) {
      this.moduleMetadata = options.moduleMetadata;
    } else {
      this.moduleMetadata = Constants.EMPTY_MODULE_METADATA;
    }
  }
  getImportedModuleBaseUrl(packageName, moduleUrl) {
    const regex = new RegExp(`^.*${packageName}[^\\/]*`);
    const matches = moduleUrl.match(regex);
    if (!matches || matches.length === 0) {
      throw new Error(
        "Could not calculate assessment package base URL on CDN."
      );
    }
    return matches[0];
  }
  addLocalizationParametersToGameParameters() {
    this.options.parameters = {
      ...this.options.parameters,
      ...I18n.makeLocalizationParameters()
    };
  }
  async init() {
    return this.initialize();
  }
  // call CanvasKitInit through loadCanvasKit so we can mock
  // loadCanvasKit using jest
  loadCanvasKit(canvasKitWasmUrl) {
    const fullUrl = this.calculateCanvasKitWasmUrl(canvasKitWasmUrl);
    return CanvasKitInit({ locateFile: (_file) => fullUrl });
  }
  calculateCanvasKitWasmUrl(url) {
    function hasUrlScheme(str) {
      return /^[a-z]+:\/\//i.test(str);
    }
    if (hasUrlScheme(url)) {
      return url;
    }
    if (!this.options.assetsUrl) {
      return `assets/${this.options.id}/${url}`;
    }
    return this.options.assetsUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
  }
  /**
   * Returns the URL to the asset as it appears in the manifest.json file.
   * 
   * @remarks This is used to return the hashed URL to the asset.
   * 
   * @param url - the URL to the asset
   * @param manifest - the manifest.json object, or undefined if there is no manifest.json file
   * @returns the URL to the asset from the manifest.json file 
   */
  manifestUrl(url, manifest) {
    if (manifest && manifest[`assets/${this.id}/${url}`]) {
      return manifest[`assets/${this.id}/${url}`].replace(
        `assets/${this.id}/`,
        ""
      );
    }
    return url;
  }
  async initialize() {
    let moduleUrl;
    if (this.moduleMetadata.name) {
      try {
        moduleUrl = await import.meta.resolve(this.moduleMetadata.name);
        const moduleBaseUrl = this.getImportedModuleBaseUrl(
          this.moduleMetadata.name,
          moduleUrl
        );
        this.options.assetsUrl = moduleBaseUrl + "/assets";
        this.isImportedModule = true;
      } catch {
      }
    }
    let canvasKitWasmUrl = `canvaskit-${this.canvasKitWasmVersion}.wasm`;
    try {
      const coreModuleUrl = await import.meta.resolve("@m2c2kit/core");
      canvasKitWasmUrl = this.getImportedModuleBaseUrl("@m2c2kit/core", coreModuleUrl) + `/assets/canvaskit-${this.canvasKitWasmVersion}.wasm`;
    } catch {
      if (this.isImportedModule) {
        throw new Error(
          `the package ${this.moduleMetadata.name} has been imported from a module URL (${moduleUrl}), but the @m2c2kit/core package module URL could not be determined.`
        );
      }
    }
    try {
      const response = await fetch("manifest.json");
      this.manifest = await response.json();
    } catch {
    }
    try {
      this.canvasKit = await this.loadCanvasKit(
        this.manifestUrl(canvasKitWasmUrl, this.manifest)
      );
    } catch (err) {
      throw new Error(
        `game ${this.id} could not load canvaskit wasm file from ${this.manifestUrl(canvasKitWasmUrl, this.manifest)}`
      );
    }
    this.fontManager = new FontManager(this);
    await this.fontManager.initializeFonts(
      this.options.fonts?.map((fontAsset) => {
        return {
          ...fontAsset,
          url: this.manifestUrl(fontAsset.url, this.manifest)
        };
      })
    );
    this.imageManager = new ImageManager(this);
    await this.imageManager.initializeImages(
      this.options.images?.map((browserImage) => {
        if (browserImage.svgString === void 0 && browserImage.url === void 0) {
          throw new Error("image must have either svgString or url");
        }
        return {
          ...browserImage,
          url: this.manifestUrl(
            browserImage.url ?? browserImage.svgString ?? "",
            this.manifest
          )
        };
      })
    );
    if (this.isLocalizationRequested()) {
      const options = this.getLocalizationOptionsFromGameParameters();
      this.i18n = new I18n(options);
    }
    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.onStart(this.session.options.activityCallbacks.onActivityLifecycle);
      this.onCancel(this.session.options.activityCallbacks.onActivityLifecycle);
      this.onEnd(this.session.options.activityCallbacks.onActivityLifecycle);
    }
    if (this.session.options.activityCallbacks?.onActivityResults) {
      this.onData(this.session.options.activityCallbacks.onActivityResults);
    }
  }
  get fontManager() {
    if (!this._fontManager) {
      throw new Error("fontManager is undefined");
    }
    return this._fontManager;
  }
  set fontManager(fontManager) {
    this._fontManager = fontManager;
  }
  get imageManager() {
    if (!this._imageManager) {
      throw new Error("imageManager is undefined");
    }
    return this._imageManager;
  }
  set imageManager(imageManager) {
    this._imageManager = imageManager;
  }
  /**
   * Saves an item to the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param value - item value
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns key
   */
  storeSetItem(key, value, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    const activityId = globalStore ? "" : this.id;
    return this.dataStores[0].setItem(k, value, activityId);
  }
  /**
   * Gets an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns value of the item
   */
  storeGetItem(key, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStores[0].getItem(k);
  }
  /**
   * Deletes an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeDeleteItem(key, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStores[0].deleteItem(k);
  }
  /**
   * Deletes all items from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   */
  storeClearItems() {
    return this.dataStores[0].clearItemsByActivityId(this.id);
  }
  /**
   * Returns keys of all items in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeItemsKeys(globalStore = false) {
    return this.dataStores[0].itemsKeysByActivityId(globalStore ? "" : this.id);
  }
  /**
   * Determines if a key exists in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns true if the key exists, false otherwise
   */
  storeItemExists(key, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStores[0].itemExists(k);
  }
  get dataStores() {
    if (!this._dataStores) {
      throw new Error("dataStores is undefined");
    }
    return this._dataStores;
  }
  set dataStores(dataStores) {
    this._dataStores = dataStores;
  }
  getLocalizationOptionsFromGameParameters() {
    const locale = this.getParameter("locale");
    const fallbackLocale = this.getParameterOrFallback(
      "fallback_locale",
      void 0
    );
    const missingTranslationColor = this.getParameterOrFallback("missing_translation_font_color", void 0);
    const additionalTranslations = this.getParameterOrFallback("translations", void 0);
    const translations = this.options.translations;
    return {
      locale,
      fallbackLocale,
      missingTranslationFontColor: missingTranslationColor,
      additionalTranslations,
      translations
    };
  }
  isLocalizationRequested() {
    const locale = this.getParameterOrFallback(
      "locale",
      void 0
    );
    if (locale === "") {
      throw new Error(
        "Empty string in locale. Leave locale undefined or null to prevent localization."
      );
    }
    return locale !== void 0 && locale !== null;
  }
  setParameters(additionalParameters) {
    const { parameters } = this.options;
    Object.keys(additionalParameters).forEach((key) => {
      if (!parameters || !(key in parameters)) {
        console.warn(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `game ${this.options.name} does not have a parameter named ${key}. attempt to set parameter ${key} to value ${// eslint-disable-next-line @typescript-eslint/no-explicit-any
          additionalParameters[key]} will be ignored`
        );
      } else if (this.options.parameters && this.options.parameters[key]) {
        this.options.parameters[key].default = additionalParameters[key];
      }
    });
    this.additionalParameters = additionalParameters;
  }
  get canvasKit() {
    if (!this._canvasKit) {
      throw new Error("canvaskit is undefined");
    }
    return this._canvasKit;
  }
  set canvasKit(canvasKit) {
    this._canvasKit = canvasKit;
  }
  get session() {
    if (!this._session) {
      throw new Error("session is undefined");
    }
    return this._session;
  }
  set session(session) {
    this._session = session;
  }
  /**
   * Adds an entity as a free entity (an entity that is not part of a scene)
   * to the game.
   *
   * @remarks Once added to the game, a free entity will always be drawn,
   * and it will not be part of any scene transitions. This is useful if
   * an entity must persistently be drawn and not move with scene
   * transitions. The appearance of the free entity must be managed
   * by the programmer. Note: internally, the free entities are part of a
   * special scene (named "__freeEntitiesScene"), but this scene is handled
   * apart from regular scenes in order to achieve the free entity behavior.
   *
   * @param entity - entity to add as a free entity
   */
  addFreeEntity(entity) {
    this.freeEntitiesScene.addChild(entity);
  }
  /**
   * Removes a free entity from the game.
   *
   * @remarks Throws exception if the entity to remove is not currently added
   * to the game as a free entity
   *
   * @param entity - the free entity to remove or its name as a string
   */
  removeFreeEntity(entity) {
    if (typeof entity === "string") {
      if (!this.freeEntitiesScene.children.map((child) => child.name).includes(entity)) {
        throw new Error(
          `cannot remove free entity named "${entity}" because it is not currently part of the game's free entities. `
        );
      }
      this.freeEntitiesScene.children = this.freeEntitiesScene.children.filter(
        (child) => child.name !== entity
      );
    } else {
      if (!this.freeEntitiesScene.children.includes(entity)) {
        throw new Error(
          `cannot remove free entity "${entity.toString()}" because it is not currently part of the game's free entities. `
        );
      }
      this.freeEntitiesScene.children = this.freeEntitiesScene.children.filter(
        (child) => child !== entity
      );
    }
  }
  /**
   * Removes all free entities from the game.
   */
  removeAllFreeEntities() {
    while (this.freeEntitiesScene.children.length) {
      this.freeEntitiesScene.children.pop();
    }
  }
  /**
   * Returns array of free entities that have been added to the game.
   *
   * @returns array of free entities
   */
  get freeEntities() {
    return this.freeEntitiesScene.children;
  }
  /**
   * Adds a scene to the game.
   *
   * @remarks A scene, and its children entities, cannot be presented unless it has been added to the game object.
   *
   * @param scene
   */
  addScene(scene) {
    scene.game = this;
    scene.needsInitialization = true;
    this.scenes.push(scene);
  }
  /**
   * Adds multiple scenes to the game.
   *
   * @param scenes
   */
  addScenes(scenes) {
    scenes.forEach((scene) => {
      this.addScene(scene);
    });
  }
  /**
   * Removes a scene from the game.
   *
   * @param scene - the scene to remove or its name as a string
   */
  removeScene(scene) {
    if (typeof scene === "object") {
      if (this.scenes.includes(scene)) {
        this.scenes = this.scenes.filter((s) => s !== scene);
      } else {
        throw new Error(
          `cannot remove scene ${scene} from game because the scene is not currently added to the game`
        );
      }
    } else {
      if (this.scenes.map((s) => s.name).includes(scene)) {
        this.scenes = this.scenes.filter((s) => s.name !== scene);
      } else {
        throw new Error(
          `cannot remove scene named "${scene}" from game because the scene is not currently added to the game`
        );
      }
    }
  }
  /**
   * Specifies the scene that will be presented upon the next frame draw.
   *
   * @param scene
   * @param transition
   */
  presentScene(scene, transition = Transition.none()) {
    let incomingScene;
    if (typeof scene === "string") {
      incomingScene = this.scenes.filter((scene_) => scene_.name === scene).find(Boolean);
      if (incomingScene === void 0) {
        throw new Error(`scene ${scene} not found`);
      }
    } else {
      if (!this.scenes.some((scene_) => scene_ === scene)) {
        throw new Error(
          `scene ${scene} exists, but it has not been added to the game object`
        );
      }
      incomingScene = scene;
    }
    incomingScene.initialize();
    incomingScene.needsInitialization = false;
    const sceneTransition = new SceneTransition(incomingScene, transition);
    this.incomingSceneTransitions.push(sceneTransition);
    if (incomingScene.game.bodyBackgroundColor !== void 0) {
      document.body.style.backgroundColor = `rgb(${incomingScene.game.bodyBackgroundColor[0]},${incomingScene.game.bodyBackgroundColor[1]},${incomingScene.game.bodyBackgroundColor[2]},${incomingScene.game.bodyBackgroundColor[3]})`;
    } else {
      document.body.style.backgroundColor = `rgb(${incomingScene.backgroundColor[0]},${incomingScene.backgroundColor[1]},${incomingScene.backgroundColor[2]},${incomingScene.backgroundColor[3]})`;
    }
    return;
  }
  /**
   * Gets the value of the game parameter. If parameterName
   * is not found, then throw exception.
   *
   * @param parameterName - the name of the game parameter whose value is requested
   * @returns
   */
  getParameter(parameterName) {
    if (this.options.parameters !== void 0 && Object.keys(this.options.parameters).includes(parameterName)) {
      return this.options.parameters[parameterName].default;
    } else {
      throw new Error(`game parameter ${parameterName} not found`);
    }
  }
  /**
   * Gets the value of the game parameter. If parameterName
   * is not found, then return fallback value
   *
   * @param parameterName - the name of the game parameter whose value is requested
   * @param fallbackValue - the value to return if parameterName is not found
   * @returns
   */
  getParameterOrFallback(parameterName, fallbackValue) {
    if (this.options.parameters !== void 0 && Object.keys(this.options.parameters).includes(parameterName)) {
      return this.options.parameters[parameterName].default;
    } else {
      return fallbackValue;
    }
  }
  /**
   * Returns true if a game parameter exists for the given string.
   *
   * @param parameterName - the name of the game parameter whose existence is queried
   * @returns
   */
  hasParameter(parameterName) {
    if (this.options.parameters !== void 0 && Object.keys(this.options.parameters).includes(parameterName)) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Starts the game loop.
   *
   * @remarks If entryScene is undefined, the game will start with scene
   * defined in the game object's entryScene property. If that is undefined,
   * the game will start with the first scene in the game object's scenes.
   * If there are no scenes in the game object's scenes, it will throw
   * an error.
   * Although the method has no awaitable calls, we will likely do
   * so in the future. Thus this method is async.
   *
   * @param entryScene - The scene (Scene object or its string name) to display when the game starts
   */
  async start(entryScene) {
    const gameInitOptions = this.options;
    this.unitTesting = gameInitOptions._unitTesting ?? false;
    this.setupHtmlCanvases(
      gameInitOptions.canvasId,
      gameInitOptions.width,
      gameInitOptions.height,
      gameInitOptions.stretch
    );
    this.showFps = gameInitOptions.showFps ?? false;
    this.bodyBackgroundColor = gameInitOptions.bodyBackgroundColor;
    this.initData();
    this.setupCanvasKitSurface();
    this.setupFpsFont();
    this.setupCanvasDomEventHandlers();
    let startingScene;
    if (entryScene !== void 0) {
      if (typeof entryScene === "object") {
        startingScene = entryScene;
      } else {
        startingScene = this.scenes.filter((scene) => scene.name === entryScene).find(Boolean);
      }
    } else if (this.entryScene !== void 0) {
      if (typeof this.entryScene === "object") {
        startingScene = this.entryScene;
      } else {
        startingScene = this.scenes.filter((scene) => scene.name === this.entryScene).find(Boolean);
      }
    } else {
      startingScene = this.scenes.find(Boolean);
    }
    if (startingScene === void 0) {
      throw new Error(
        "cannot start game. entry scene has not been added to the game object."
      );
    }
    this.presentScene(startingScene);
    if (this.surface === void 0) {
      throw new Error("CanvasKit surface is undefined");
    }
    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = (/* @__PURE__ */ new Date()).toISOString();
    if (this.options.timeStepping) {
      this.addTimeSteppingControlsToDom();
      this.updateTimeSteppingOutput();
    } else {
      this.removeTimeSteppingControlsFromDom();
    }
    DomHelpers.setCanvasOverlayVisibility(true);
    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithPrimitives
    });
    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithPrimitives,
      positionOffset: 0.10012117
    });
    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithScenes
    });
    this.surface.requestAnimationFrame(this.loop.bind(this));
    const activityStartEvent = {
      target: this,
      type: EventType.ActivityStart
    };
    this.raiseActivityEventOnListeners(activityStartEvent);
  }
  addTimeSteppingControlsToDom() {
    const existingDiv = document.getElementById("m2c2kit-time-stepping-div");
    if (existingDiv) {
      return;
    }
    const body = document.getElementsByTagName("body")[0];
    if (body) {
      const div = document.createElement("div");
      div.id = "m2c2kit-time-stepping-div";
      body.prepend(div);
      const btn = document.createElement("button");
      btn.id = "1-step-advance";
      btn.title = "advance 1 step (16.667 ms)";
      btn.innerText = ">";
      btn.style.marginRight = "4px";
      div.appendChild(btn);
      btn.addEventListener("click", this.advanceStepsHandler.bind(this));
      const btn2 = document.createElement("button");
      btn2.id = "55-step-advance";
      btn2.title = "advance 55 steps (916.667 ms)";
      btn2.innerText = ">>";
      btn2.style.marginRight = "4px";
      div.appendChild(btn2);
      btn2.addEventListener("click", this.advanceStepsHandler.bind(this));
      const stepsInput = document.createElement("input");
      stepsInput.id = "time-stepping-steps-input";
      stepsInput.title = "steps";
      stepsInput.style.width = "40px";
      stepsInput.style.marginRight = "4px";
      stepsInput.setAttribute("readonly", "true");
      div.appendChild(stepsInput);
      const nowInput = document.createElement("input");
      nowInput.id = "time-stepping-now-input";
      nowInput.title = "milliseconds";
      nowInput.style.width = "80px";
      nowInput.style.marginRight = "4px";
      nowInput.setAttribute("readonly", "true");
      div.appendChild(nowInput);
    }
  }
  updateTimeSteppingOutput() {
    const stepsInput = document.getElementById(
      "time-stepping-steps-input"
    );
    if (stepsInput) {
      stepsInput.value = this.stepCount.toString();
    }
    const nowInput = document.getElementById(
      "time-stepping-now-input"
    );
    if (nowInput) {
      nowInput.value = this.steppingNow.toFixed(2);
    }
  }
  advanceStepsHandler(mouseEvent) {
    if (mouseEvent?.target?.id === "1-step-advance") {
      this.steppingNow = this.steppingNow + 16.66666666666667;
      this.stepCount = this.stepCount + 1;
    } else if (mouseEvent?.target?.id === "55-step-advance") {
      this.steppingNow = this.steppingNow + 16.66666666666667 * 55;
      this.stepCount = this.stepCount + 55;
    }
    this.updateTimeSteppingOutput();
  }
  removeTimeSteppingControlsFromDom() {
    const div = document.getElementById("m2c2kit-time-stepping-div");
    if (div) {
      div.remove();
    }
  }
  /**
   * Warms up the Skia-based shaders underlying canvaskit by drawing
   * primitives.
   *
   * @remarks Some canvaskit methods take extra time the first time they are
   * called because a WebGL shader must be compiled. If the method is part of
   * an animation, then this may cause frame drops or "jank." To alleviate
   * this, we can "warm up" the shader associated with the method by calling
   * it at the beginning of our game. Thus, all warmup operations will be
   * concentrated at the beginning and will not be noticeable. This warmup
   * function draws a series of primitives to the canvas. From testing,
   * the actual WebGl shaders compiled by canvaskit vary depending on the
   * device hardware. Thus, warmup functions that might call all relevant
   * WebGL shaders on desktop hardware may not be sufficient for mobile.
   *
   * @param canvas - the canvaskit-canvas to draw on
   * @param positionOffset - an offset to add to the position of each
   * primitive. Different shaders may be compiled depending on if the position
   * was fractional or not. This offset allows us to warmup both cases.
   */
  warmupShadersWithPrimitives(canvas, positionOffset = 0) {
    canvas.save();
    if (positionOffset == 0) {
      canvas.scale(1 / Globals.canvasScale, 1 / Globals.canvasScale);
    } else {
      canvas.scale(
        1 / Globals.canvasScale * 1.13,
        1 / Globals.canvasScale * 1.13
      );
    }
    if (!this.surface) {
      throw new Error("surface is undefined");
    }
    const surfaceWidth = this.surface.width();
    const surfaceHeight = this.surface.height();
    const centerX = Math.round(surfaceWidth / 2) + positionOffset;
    const centerY = Math.round(surfaceHeight / 2) + positionOffset;
    const originX = positionOffset;
    const originY = positionOffset;
    const backgroundPaint = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.White,
      this.canvasKit.PaintStyle.Fill,
      true
    );
    canvas.drawRect(
      [0, 0, this.surface.width(), this.surface.height()],
      backgroundPaint
    );
    const fillColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      false
    );
    const fillColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      true
    );
    const strokeColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      false
    );
    strokeColorPaintNotAntialiased.setStrokeWidth(2);
    const strokeColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      true
    );
    strokeColorPaintAntialiased.setStrokeWidth(2);
    canvas.drawCircle(centerX, centerY, 32, fillColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, fillColorPaintAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintAntialiased);
    const fontManager = this.fontManager;
    const fontNames = this.fontManager.getFontNames();
    if (fontNames.length > 0) {
      const typeface = fontManager.getTypeface(fontNames[0]);
      const font = new this.canvasKit.Font(typeface, 16 * Globals.canvasScale);
      canvas.drawText(
        "abc",
        centerX,
        centerY,
        fillColorPaintNotAntialiased,
        font
      );
      canvas.drawText("abc", centerX, centerY, fillColorPaintAntialiased, font);
    }
    const snapshot = this.takeCurrentSceneSnapshot();
    canvas.drawImage(snapshot, originX, originY);
    snapshot.delete();
    canvas.drawRect([originX, originY, 16, 16], fillColorPaintNotAntialiased);
    canvas.drawRect([originX, originY, 16, 16], fillColorPaintAntialiased);
    canvas.drawRect([originX, originY, 16, 16], strokeColorPaintNotAntialiased);
    canvas.drawRect([originX, originY, 16, 16], strokeColorPaintAntialiased);
    canvas.restore();
  }
  /**
   * Warms up the Skia-based shaders underlying canvaskit by drawing
   * m2c2kit entities.
   *
   * @remarks While warmupShadersWithPrimitives draws a predefined set of
   * primitives, this function initializes and draws all canvaskit objects
   * that have been defined as m2c2kit entities. This not only is another
   * opportunity for shader warmup, it also does the entity initialization.
   *
   * @param canvas - the canvaskit-canvas to draw on
   */
  warmupShadersWithScenes(canvas) {
    [...this.scenes, this.freeEntitiesScene].forEach((scene) => {
      scene.warmup(canvas);
    });
    const warmedUpImageNames = this.entities.filter((entity) => entity.type === EntityType.Sprite).map((entity) => entity.imageName);
    const loadedImages = this.imageManager.loadedImages;
    if (loadedImages) {
      const imageNames = Object.keys(loadedImages).filter(
        (name2) => name2 !== "__outgoingSceneSnapshot"
      );
      imageNames.forEach((imageName) => {
        if (!warmedUpImageNames.includes(imageName)) {
          const image = loadedImages[imageName].image;
          canvas.drawImage(image, 0, 0);
        }
      });
    }
    const whitePaint = new this.canvasKit.Paint();
    whitePaint.setColor(this.canvasKit.Color(255, 255, 255, 1));
    if (!this.surface) {
      throw new Error("surface is undefined");
    }
    canvas.drawRect(
      [0, 0, this.surface.width(), this.surface.height()],
      whitePaint
    );
  }
  stop() {
    if (this.currentScene) {
      this.currentScene._active = false;
    }
    this.gameStopRequested = true;
    Timer.removeAll();
    this.dispose();
  }
  /**
   * Frees up resources that were allocated to run the game.
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this. FOR INTERNAL USE ONLY.
   */
  dispose() {
    this.entities.filter((e) => e.isDrawable).forEach((e) => e.dispose());
    this.fontManager.dispose();
  }
  initData() {
    this.trialIndex = 0;
    this.data = {
      trials: new Array()
    };
    const trialSchema = this.options.trialSchema ?? {};
    const variables = Object.entries(trialSchema);
    for (const [variableName, propertySchema] of variables) {
      if (propertySchema.type !== void 0 && !this.propertySchemaDataTypeIsValid(propertySchema.type)) {
        throw new Error(
          `invalid schema. variable ${variableName} is type ${propertySchema.type}. type must be number, string, boolean, object, or array`
        );
      }
    }
  }
  propertySchemaDataTypeIsValid(propertySchemaType) {
    const validDataTypes = [
      "string",
      "number",
      "integer",
      "object",
      "array",
      "boolean",
      "null"
    ];
    if (typeof propertySchemaType === "string") {
      return validDataTypes.includes(propertySchemaType);
    }
    let dataTypeIsValid = true;
    if (Array.isArray(propertySchemaType)) {
      propertySchemaType.forEach((element) => {
        if (!validDataTypes.includes(element)) {
          dataTypeIsValid = false;
        }
      });
    } else {
      throw new Error(`Invalid data type: ${propertySchemaType}`);
    }
    return dataTypeIsValid;
  }
  getDeviceMetadata() {
    const screen = window.screen;
    if (!screen.orientation) {
      return {
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        screen: {
          availHeight: screen.availHeight,
          availWidth: screen.availWidth,
          colorDepth: screen.colorDepth,
          height: screen.height,
          pixelDepth: screen.pixelDepth,
          width: screen.width
        },
        webGlRenderer: this.webGlRendererInfo
      };
    }
    return {
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      screen: {
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        height: screen.height,
        orientation: {
          type: screen.orientation.type,
          angle: screen.orientation.angle
        },
        pixelDepth: screen.pixelDepth,
        width: screen.width
      },
      webGlRenderer: this.webGlRendererInfo
    };
  }
  /**
   * Adds data to the game's TrialData object.
   *
   * @remarks The variableName must be previously defined in the trialSchema
   * object passed in during game initialization through
   * {@link GameInitOptions.trialSchema}. The type of the value must match
   * what was defined in the trialSchema, otherwise an error is thrown.
   *
   * @param variableName - variable to be set
   * @param value - value of the variable to set
   */
  addTrialData(variableName, value) {
    if (!this.options.trialSchema) {
      throw new Error(
        "no trial schema were provided in GameOptions. cannot add trial data"
      );
    }
    if (this.data.trials.length < this.trialIndex + 1) {
      const emptyTrial = {};
      const variables = Object.entries(this.options.trialSchema);
      for (const [variableName2] of variables) {
        emptyTrial[variableName2] = null;
      }
      this.data.trials.push({
        document_uuid: Uuid.generate(),
        session_uuid: this.session.uuid,
        activity_uuid: this.uuid,
        activity_id: this.options.id,
        activity_version: this.options.version,
        device_timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? "",
        device_timezone_offset_minutes: (/* @__PURE__ */ new Date()).getTimezoneOffset(),
        ...emptyTrial,
        device_metadata: this.getDeviceMetadata()
      });
    }
    if (!(variableName in this.options.trialSchema)) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }
    let expectedDataTypes;
    if (Array.isArray(this.options.trialSchema[variableName].type)) {
      expectedDataTypes = this.options.trialSchema[variableName].type;
    } else {
      expectedDataTypes = [
        this.options.trialSchema[variableName].type
      ];
    }
    let providedDataType = typeof value;
    if (providedDataType === "object") {
      if (Object.prototype.toString.call(value) === "[object Array]") {
        providedDataType = "array";
      }
    }
    if (value === void 0 || value === null) {
      providedDataType = "null";
    }
    if (!expectedDataTypes.includes(providedDataType) && !(providedDataType === "number" && Number.isInteger(value) && expectedDataTypes.includes("integer"))) {
      throw new Error(
        `type for variable ${variableName} (value: ${value}) is "${providedDataType}". Based on schema for this variable, expected type was "${expectedDataTypes}"`
      );
    }
    this.data.trials[this.trialIndex][variableName] = value;
  }
  /**
   * Adds custom trial schema to the game's trialSchema object.
   *
   * @param schema - Trial schema to add
   *
   * @remarks This is useful if you want to add custom trial variables.
   * This must be done before Session.start() is called, because
   * Session.start() will call Game.start(), which will initialize
   * the trial schema.
   */
  addTrialSchema(schema) {
    const keys = Object.keys(schema);
    keys.forEach((key) => {
      if (!this.options.trialSchema) {
        throw new Error("trial schema is undefined");
      }
      this.options.trialSchema[key] = schema[key];
    });
  }
  /**
   * Sets the value of a variable that will be the same for all trials.
   *
   * @remarks This sets the value of a variable that is the same across
   * all trials ("static"). This is useful for variables that are not
   * part of the trial schema, but that you want to save for each trial in
   * your use case. For example, you might want to save the subject's
   * participant ID for each trial, but this is not part of the trial schema.
   * Rather than modify the source code for the game, you can do the following
   * to ensure that the participant ID is saved for each trial:
   *
   *   game.addTrialSchema(&#123
   *     participant_id: &#123
   *       type: "string",
   *       description: "ID of the participant",
   *     &#125;
   *   &#125;);
   *   game.addStaticTrialData("participant_id", "12345");
   *
   *  When Game.trialComplete() is called, the participant_id variable will
   *  be saved for the trial with the value "12345".
   *
   * @param variableName - variable to be set
   * @param value - value of the variable to set
   */
  addStaticTrialData(variableName, value) {
    if (!this.options.trialSchema) {
      throw new Error("trial schema is undefined");
    }
    if (this.options.trialSchema[variableName] === void 0) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }
    this.staticTrialSchema[variableName] = value;
  }
  /**
   * Should be called when the current trial has completed. It will
   * also increment the trial index.
   *
   * @remarks Calling will trigger the onActivityResults callback function,
   * if one was provided in SessionOptions. This is how the game communicates
   * trial data to the parent session, which can then save or process the data.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  trialComplete() {
    if (Object.keys(this.staticTrialSchema).length > 0) {
      this.data.trials[this.trialIndex] = {
        ...this.data.trials[this.trialIndex],
        ...this.staticTrialSchema
      };
    }
    this.trialIndex++;
    const resultsEvent = {
      type: EventType.ActivityData,
      iso8601Timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      target: this,
      /** newData is only the trial that recently completed */
      newData: this.data.trials[this.trialIndex - 1],
      newDataSchema: this.makeNewGameDataSchema(),
      /** data is all the data collected so far in the game */
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {}
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {}
      ),
      activityMetrics: this.gameMetrics
    };
    this.raiseActivityEventOnListeners(resultsEvent);
  }
  makeNewGameDataSchema() {
    const newDataSchema = {
      description: `A single trial and metadata from the assessment ${this.name}.`,
      $comment: `Activity identifier: ${this.options.id}, version: ${this.options.version}.`,
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      properties: {
        ...this.automaticTrialSchema,
        ...this.options.trialSchema,
        device_metadata: deviceMetadataSchema
      }
    };
    return newDataSchema;
  }
  makeGameDataSchema() {
    const dataSchema = {
      description: `All trials and metadata from the assessment ${this.name}.`,
      $comment: `Activity identifier: ${this.options.id}, version: ${this.options.version}.`,
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      required: ["trials"],
      properties: {
        trials: {
          type: "array",
          items: { $ref: "#/$defs/trial" },
          description: "All trials from the assessment."
        }
      },
      $defs: {
        trial: {
          type: "object",
          properties: {
            ...this.automaticTrialSchema,
            ...this.options.trialSchema,
            device_metadata: deviceMetadataSchema
          }
        }
      }
    };
    return dataSchema;
  }
  /**
   * GameParameters combines default parameters values and
   * JSON Schema to describe what the parameters are.
   * The next two functions extract GameParameters's two parts
   * (the default values and the schema) so they can be returned
   * separately in the activityData event
   */
  makeGameActivityConfiguration(parameters) {
    const gameParams = JSON.parse(JSON.stringify(parameters));
    const {
      locale,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      fallback_locale,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      missing_translation_font_color,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      translations,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      ...result2
    } = gameParams;
    for (const prop in result2) {
      for (const subProp in result2[prop]) {
        if (subProp == "default") {
          result2[prop] = result2[prop][subProp];
        }
      }
    }
    return result2;
  }
  makeGameActivityConfigurationSchema(parameters) {
    const gameParams = JSON.parse(JSON.stringify(parameters));
    const {
      locale,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      fallback_locale,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      missing_translation_font_color,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      translations,
      // eslint-disable-line @typescript-eslint/no-unused-vars
      ...result2
    } = gameParams;
    for (const prop in result2) {
      if (!("type" in result2[prop]) && "value" in result2[prop]) {
        const valueType = typeof result2[prop]["default"];
        if (valueType !== "bigint" && valueType !== "function" && valueType !== "symbol" && valueType !== "undefined") {
          result2[prop].type = valueType;
        }
      }
      for (const subProp in result2[prop]) {
        if (subProp == "default") {
          delete result2[prop][subProp];
        }
      }
    }
    return {
      description: `activity configuration from the assessment ${this.name}`,
      type: "object",
      properties: result2
    };
  }
  /**
   * Should be called when current game has ended successfully.
   *
   * @remarks This will send an ActivityEnd event to any listeners, such as
   * a function provided to Game.onEnd() or a callback defined in
   * SessionOptions.activityCallbacks.onActivityLifecycle. This is how the
   * game can communicate changes in activity state to the parent session.
   * It is the responsibility of the the game programmer to call this at the
   * appropriate time. It is not triggered automatically.
   */
  end() {
    const activityEndEvent = {
      target: this,
      type: EventType.ActivityEnd
    };
    const results = {
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {}
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {}
      ),
      activityMetrics: this.gameMetrics
    };
    this.raiseActivityEventOnListeners(activityEndEvent, results);
  }
  /**
   * Should be called when current game has been canceled by a user action.
   *
   * @remarks This will send an ActivityCancel event to any listeners, such as
   * a function provided to Game.onCancel() or a callback defined in
   * SessionOptions.activityCallbacks.onActivityLifecycle. This is how the
   * game can communicate changes in activity state to the parent session.
   * It is the responsibility of the the game programmer to call this at the
   * appropriate time. It is not triggered automatically.
   */
  cancel() {
    const activityCancelEvent = {
      target: this,
      type: EventType.ActivityCancel
    };
    const results = {
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {}
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {}
      ),
      activityMetrics: this.gameMetrics
    };
    this.raiseActivityEventOnListeners(activityCancelEvent, results);
  }
  setupHtmlCanvases(canvasId, width, height, stretch) {
    Globals.canvasScale = Math.round(window.devicePixelRatio * 100) / 100;
    let htmlCanvas;
    if (canvasId === void 0) {
      const canvasCollection = document.getElementsByTagName("canvas");
      let canvases = new Array();
      for (let i = 0; i < canvasCollection.length; i++) {
        canvases.push(canvasCollection[i]);
      }
      canvases = canvases.filter(
        (canvas) => canvas.id !== "m2c2kitscratchcanvas"
      );
      if (canvases.length === 0) {
        throw new Error("no html canvas tag was found in the html");
      } else if (canvases.length > 1) {
        console.warn("warning: more than one html canvas was found.");
      }
      const m2c2kitCanvas = canvases.filter(
        (c) => c.id === "m2c2kit-canvas"
      )[0];
      if (m2c2kitCanvas) {
        htmlCanvas = m2c2kitCanvas;
        if (canvases.length > 1) {
          console.log("using canvas with id 'm2c2kit-canvas'");
        }
      } else {
        htmlCanvas = canvasCollection[0];
        if (canvases.length > 1) {
          console.log("using first canvas");
        }
      }
    } else {
      htmlCanvas = document.getElementById(canvasId);
      if (htmlCanvas === void 0) {
        throw new Error(
          `could not find canvas HTML element with id "${canvasId}"`
        );
      }
    }
    if (stretch || window.innerWidth < width || window.innerHeight < height) {
      const requestedAspectRatio = height / width;
      const actualAspectRatio = window.innerHeight / window.innerWidth;
      if (actualAspectRatio < requestedAspectRatio) {
        Globals.rootScale = window.innerHeight / height;
      } else {
        Globals.rootScale = window.innerWidth / width;
      }
    }
    htmlCanvas.style.width = Globals.rootScale * width + "px";
    htmlCanvas.style.height = Globals.rootScale * height + "px";
    htmlCanvas.width = Globals.rootScale * width * Globals.canvasScale;
    htmlCanvas.height = Globals.rootScale * height * Globals.canvasScale;
    this.htmlCanvas = htmlCanvas;
    this.canvasCssWidth = width;
    this.canvasCssHeight = height;
    Globals.canvasCssWidth = width;
    Globals.canvasCssHeight = height;
  }
  setupCanvasKitSurface() {
    if (this.htmlCanvas === void 0) {
      throw new Error("main html canvas is undefined");
    }
    window.logWebGl = this.options.logWebGl;
    this.interceptWebGlCalls();
    try {
      this.webGlRendererInfo = WebGlInfo.getRendererString();
    } catch {
      this.webGlRendererInfo = "err";
      WebGlInfo.dispose();
    }
    const surface = this.canvasKit.MakeWebGLCanvasSurface(this.htmlCanvas);
    if (surface === null) {
      throw new Error(
        `could not make CanvasKit surface from canvas HTML element`
      );
    }
    this.surface = surface;
    console.log(
      `\u26AA CanvasKit surface is backed by ${this.surface.reportBackendTypeIsGPU() ? "GPU" : "CPU"}`
    );
    this.surface.getCanvas().scale(Globals.canvasScale, Globals.canvasScale);
  }
  interceptWebGlCalls() {
    if (!this.htmlCanvas.__proto__.m2c2ModifiedGetContext) {
      this.htmlCanvas.__proto__.m2c2ModifiedGetContext = true;
      const getContextOriginal = this.htmlCanvas.__proto__.getContext;
      this.htmlCanvas.__proto__.getContext = function(...args) {
        if (window.logWebGl) {
          console.log(
            `\u{1F53C} getContext(${args.map((a) => a.toString()).join(", ")})`
          );
        }
        const context = getContextOriginal.apply(this, [...args]);
        if (context.__proto__.compileShader) {
          if (!context.__proto__.m2c2ModifiedCompileShader) {
            context.__proto__.m2c2ModifiedCompileShader = true;
            const compileShaderOriginal = context.__proto__.compileShader;
            context.__proto__.compileShader = function(...args2) {
              if (window.logWebGl) {
                const shader = args2[0];
                const source = context.getShaderSource(shader);
                console.log(`\u{1F53C} compileShader():`);
                console.log(source);
              }
              return compileShaderOriginal.apply(this, [...args2]);
            };
          }
        }
        return context;
      };
    }
  }
  setupFpsFont() {
    this.fpsTextFont = new this.canvasKit.Font(
      null,
      Constants.FPS_DISPLAY_TEXT_FONT_SIZE * Globals.canvasScale
    );
    this.fpsTextPaint = new this.canvasKit.Paint();
    this.fpsTextPaint.setColor(
      this.canvasKit.Color(
        Constants.FPS_DISPLAY_TEXT_COLOR[0],
        Constants.FPS_DISPLAY_TEXT_COLOR[1],
        Constants.FPS_DISPLAY_TEXT_COLOR[2],
        Constants.FPS_DISPLAY_TEXT_COLOR[3]
      )
    );
    this.fpsTextPaint.setAntiAlias(true);
  }
  setupCanvasDomEventHandlers() {
    if (this.htmlCanvas === void 0) {
      throw new Error("main html canvas is undefined");
    }
    this.htmlCanvas.addEventListener(
      "pointerdown",
      this.htmlCanvasPointerDownHandler.bind(this)
    );
    this.htmlCanvas.addEventListener(
      "pointerup",
      this.htmlCanvasPointerUpHandler.bind(this)
    );
    this.htmlCanvas.addEventListener(
      "pointermove",
      this.htmlCanvasPointerMoveHandler.bind(this)
    );
    this.htmlCanvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
    });
    this.htmlCanvas.addEventListener(
      "pointerleave",
      this.htmlCanvasPointerLeaveHandler.bind(this)
    );
  }
  loop(canvas) {
    if (!this.surface) {
      throw new Error("surface is undefined");
    }
    if (this.warmupFunctionQueue.length > 0) {
      const warmup = this.warmupFunctionQueue.shift();
      warmup?.warmupFunction.call(this, canvas, warmup.positionOffset);
      this.surface.requestAnimationFrame(this.loop.bind(this));
      return;
    }
    if (!this.loaderElementsRemoved) {
      this.loaderElementsRemoved = true;
      DomHelpers.setCanvasOverlayVisibility(false);
      DomHelpers.setSpinnerVisibility(false);
      this.surface.requestAnimationFrame(this.loop.bind(this));
      return;
    }
    if (this.gameStopRequested) {
      this.surface.deleteLater();
      return;
    }
    this.animationFramesRequested++;
    if (!this.limitFps || this.animationFramesRequested % Math.round(60 / Constants.LIMITED_FPS_RATE) === 0) {
      if (this.currentScene === void 0 && this.incomingSceneTransitions.length === 0) {
        throw new Error("Can not run game without a current or incoming scene");
      }
      this.updateGameTime();
      this.handleIncomingSceneTransitions(this.incomingSceneTransitions);
      this.update();
      this.draw(canvas);
      while (this.snapshots.length > 0) {
        this.snapshots.shift()?.delete();
      }
      this.snapshots.push(this.takeCurrentSceneSnapshot());
      this.freeEntitiesScene.draw(canvas);
      if (this.pendingScreenshot) {
        this.handlePendingScreenshot(this.pendingScreenshot);
        this.pendingScreenshot = void 0;
      }
    }
    this.priorUpdateTime = Globals.now;
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }
  updateGameTime() {
    if (!this.options.timeStepping) {
      Globals.now = performance.now();
    } else {
      Globals.now = this.steppingNow;
    }
    if (this.priorUpdateTime) {
      Globals.deltaTime = Globals.now - this.priorUpdateTime;
    } else {
      Globals.deltaTime = 0;
    }
  }
  handleIncomingSceneTransitions(incomingSceneTransitions) {
    if (incomingSceneTransitions.length === 0) {
      return;
    }
    if (this.snapshots.length > 0 || incomingSceneTransitions[0].transition.type === TransitionType.None) {
      const incomingSceneTransition = incomingSceneTransitions.shift();
      if (incomingSceneTransition === void 0) {
        throw new Error("no incoming scene transition");
      }
      const incomingScene = incomingSceneTransition.scene;
      const transition = incomingSceneTransition.transition;
      if (transition.type === TransitionType.None) {
        if (this.currentScene) {
          this.currentScene._active = false;
        }
        this.currentScene = incomingScene;
        this.currentScene._active = true;
        if (incomingScene._setupCallback) {
          incomingScene._setupCallback(incomingScene);
        }
        if (incomingScene._appearCallback) {
          incomingScene._appearCallback(incomingScene);
        }
        return;
      }
      this.currentSceneSnapshot = this.snapshots.shift();
      if (!this.currentSceneSnapshot) {
        throw new Error("No snapshot available for outgoing scene");
      }
      const outgoingScene = this.createOutgoingScene(this.currentSceneSnapshot);
      outgoingScene._active = true;
      if (this.currentScene) {
        this.currentScene._active = false;
      }
      this.currentScene = incomingScene;
      this.currentScene._active = true;
      if (incomingScene._setupCallback) {
        incomingScene._setupCallback(incomingScene);
      }
      this.animateSceneTransition(incomingScene, transition, outgoingScene);
    }
  }
  /**
   * Creates a scene that has a screen shot of the current scene.
   *
   * @param outgoingSceneImage - an image of the current scene
   * @returns - the scene with the screen shot
   */
  createOutgoingScene(outgoingSceneImage) {
    const outgoingScene = new Scene({ name: Constants.OUTGOING_SCENE_NAME });
    outgoingScene.size.width = this.canvasCssWidth;
    outgoingScene.size.height = this.canvasCssHeight;
    this.addScene(outgoingScene);
    const loadedImage = new LoadedImage(
      Constants.OUTGOING_SCENE_IMAGE_NAME,
      outgoingSceneImage,
      this.canvasCssWidth,
      this.canvasCssHeight
    );
    this.imageManager.addLoadedImage(loadedImage);
    const spr = new Sprite({
      name: Constants.OUTGOING_SCENE_SPRITE_NAME,
      imageName: Constants.OUTGOING_SCENE_IMAGE_NAME,
      position: {
        x: this.canvasCssWidth / Globals.rootScale / 2,
        y: this.canvasCssHeight / Globals.rootScale / 2
      }
    });
    spr.scale = 1 / Globals.rootScale;
    outgoingScene.addChild(spr);
    return outgoingScene;
  }
  /**
   * Registers a plugin with the game.
   *
   * @remarks Upon registration, the plugin's optional asynchronous
   * `initialize()` method will be called.
   *
   * @param plugin - Plugin to register
   */
  async registerPlugin(plugin) {
    if (plugin.type !== ActivityType.Game) {
      throw new Error(
        `registerPlugin(): plugin ${plugin.id} is not a game plugin. It is a ${plugin.type} plugin.`
      );
    }
    if (this.plugins.includes(plugin) || this.plugins.map((p) => p.id).includes(plugin.id)) {
      throw new Error(
        `registerPlugin(): plugin ${plugin.id} already registered.`
      );
    }
    this.plugins.push(plugin);
    if (plugin.initialize) {
      await plugin.initialize(this);
    }
  }
  update() {
    this.plugins.filter((p) => p.beforeUpdate !== void 0 && p.disabled !== true).forEach((p) => p.beforeUpdate(this, Globals.deltaTime));
    this.scenes.filter((scene) => scene._active).forEach((scene) => scene.update());
    this.freeEntitiesScene.update();
    this.plugins.filter((p) => p.afterUpdate !== void 0 && p.disabled !== true).forEach((p) => p.afterUpdate(this, Globals.deltaTime));
  }
  draw(canvas) {
    this.scenes.filter((scene) => scene._active).forEach((scene) => scene.draw(canvas));
    this.drawnFrames++;
    this.calculateFps();
    if (this.showFps) {
      this.drawFps(canvas);
    }
  }
  calculateFps() {
    if (this.lastFpsUpdate === 0) {
      this.lastFpsUpdate = Globals.now;
      this.nextFpsUpdate = Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
    } else {
      if (Globals.now >= this.nextFpsUpdate) {
        this.fpsRate = this.drawnFrames / ((Globals.now - this.lastFpsUpdate) / 1e3);
        this.drawnFrames = 0;
        this.lastFpsUpdate = Globals.now;
        this.nextFpsUpdate = Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
        if (this.gameMetrics.length < this.maximumRecordedActivityMetrics && this.fpsRate < this.fpsMetricReportThreshold) {
          this.gameMetrics.push({
            fps: Number.parseFloat(this.fpsRate.toFixed(2)),
            fps_interval_ms: Constants.FPS_DISPLAY_UPDATE_INTERVAL,
            fps_report_threshold: this.fpsMetricReportThreshold,
            activity_type: ActivityType.Game,
            activity_uuid: this.uuid,
            iso8601_timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    }
  }
  takeCurrentSceneSnapshot() {
    if (this.surface === void 0) {
      throw new Error("CanvasKit surface is undefined");
    }
    return this.surface.makeImageSnapshot();
  }
  handlePendingScreenshot(pendingScreenshot) {
    if (!this.surface) {
      throw new Error("no surface");
    }
    let image;
    if (pendingScreenshot.rect.length == 4) {
      const sx = pendingScreenshot.rect[0] * Globals.canvasScale;
      const sy = pendingScreenshot.rect[1] * Globals.canvasScale;
      const sw = pendingScreenshot.rect[2] * Globals.canvasScale;
      const sh = pendingScreenshot.rect[3] * Globals.canvasScale;
      const scaledRect = [sx, sy, sx + sw, sy + sh];
      image = this.surface.makeImageSnapshot(scaledRect);
    } else {
      image = this.surface.makeImageSnapshot();
    }
    const imageAsPngBytes = image.encodeToBytes();
    pendingScreenshot.promiseResolve(imageAsPngBytes);
  }
  /**
   * Takes screenshot of canvas
   *
   * @remarks Coordinates should be provided unscaled; that is, the method
   * will handle any scaling that happened due to device pixel ratios
   * not equal to 1. This returns a promise because the screenshot request
   * must be queued and completed once a draw cycle has completed. See
   * the loop() method.
   *
   * @param sx - Upper left coordinate of screenshot
   * @param sy - Upper right coordinate of screenshot
   * @param sw - width of area to screenshot
   * @param sh - height of area to screenshot
   * @returns Promise of Uint8Array of image data
   */
  takeScreenshot(sx, sy, sw, sh) {
    if (!this.surface) {
      throw new Error("no canvaskit surface. unable to take screenshot.");
    }
    const missingParametersCount = [sx, sy, sw, sh].map((x) => x ? 0 : 1).reduce((a, b) => a + b);
    return new Promise((resolve2, reject) => {
      switch (missingParametersCount) {
        case 0: {
          if (!sx || !sy || !sw || !sh) {
            reject("missing values in arguments for takeScreenshot()");
            return;
          }
          this.pendingScreenshot = {
            rect: [sx, sy, sw, sh],
            promiseResolve: resolve2
          };
          break;
        }
        case 4: {
          this.pendingScreenshot = {
            rect: [],
            promiseResolve: resolve2
          };
          break;
        }
        default: {
          reject(
            "Exactly 0 or 4 arguments must be supplied to takeScreenshot()"
          );
        }
      }
    });
  }
  animateSceneTransition(incomingScene, transition, outgoingScene) {
    const duration = transition.duration;
    incomingScene._transitioning = true;
    outgoingScene._transitioning = true;
    switch (transition.type) {
      case TransitionType.Slide: {
        const direction = transition.direction;
        switch (direction) {
          case TransitionDirection.Left:
            incomingScene.position.x = incomingScene.size.width;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true
                })
              ])
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: -outgoingScene.size.width, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true
                })
              ])
            );
            break;
          case TransitionDirection.Right:
            incomingScene.position.x = -incomingScene.size.width;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true
                })
              ])
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: outgoingScene.size.width, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true
                })
              ])
            );
            break;
          case TransitionDirection.Up:
            incomingScene.position.y = incomingScene.size.height;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true
                })
              ])
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: -outgoingScene.size.height },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true
                })
              ])
            );
            break;
          case TransitionDirection.Down:
            incomingScene.position.y = -incomingScene.size.height;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true
                })
              ])
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: outgoingScene.size.height },
                  duration,
                  easing: transition.easing,
                  runDuringTransition: true
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true
                })
              ])
            );
            break;
          default:
            throw new Error("unknown transition direction");
        }
        break;
      }
      default:
        throw new Error("unknown transition type");
    }
  }
  drawFps(canvas) {
    canvas.save();
    const drawScale = Globals.canvasScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.fpsTextFont || !this.fpsTextPaint) {
      throw new Error("fps font or paint is undefined");
    }
    canvas.drawText(
      "FPS: " + this.fpsRate.toFixed(2),
      0,
      0 + Constants.FPS_DISPLAY_TEXT_FONT_SIZE * drawScale,
      this.fpsTextPaint,
      this.fpsTextFont
    );
    canvas.restore();
  }
  /**
   * Creates an event listener for an entity based on the entity name
   *
   * @remarks Typically, event listeners will be created using a method specific to the event, such as onTapDown(). This alternative allows creation with entity name.
   *
   * @param type - the type of event to listen for, e.g., "tapDown"
   * @param entityName - the entity name for which an event will be listened
   * @param callback - the callback to be invoked when the event occurs
   * @param callbackOptions
   */
  createEventListener(type, entityName, callback, callbackOptions) {
    const entities = this.entities.filter(
      (entity2) => entity2.name === entityName
    );
    if (entities.length > 1) {
      console.warn(
        `warning: createEventListener() found more than one entity with name ${entityName}. Event listener will be attached to first entity found. All entities that receive tap events should be uniquely named`
      );
    }
    const entity = entities.filter((entity2) => entity2.name === entityName).find(Boolean);
    if (entity === void 0) {
      throw new Error(
        `could not create event listener. entity with name ${entityName} could not be found in the game entity tree`
      );
    }
    if (!Object.values(EventType).includes(type)) {
      throw new Error(
        `game ${this.id}: could not create event listener. event type ${type} is not known`
      );
    }
    entity.addEventListener(type, callback, callbackOptions);
  }
  /**
   * Returns array of all entities that have been added to the game object.
   */
  get entities() {
    function getChildEntitiesRecursive(entity, entities2) {
      entities2.push(entity);
      entity.children.forEach(
        (child) => getChildEntitiesRecursive(child, entities2)
      );
    }
    const entities = new Array();
    [...this.scenes, this.freeEntitiesScene].forEach(
      (scene) => getChildEntitiesRecursive(scene, entities)
    );
    return entities;
  }
  /**
   * Receives callback from DOM PointerDown event
   *
   * @param domPointerEvent - PointerEvent from the DOM
   * @returns
   */
  htmlCanvasPointerDownHandler(domPointerEvent) {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event = {
      target: scene,
      type: EventType.PointerDown,
      handled: false
    };
    this.processDomPointerDown(scene, m2Event, domPointerEvent);
    this.processDomPointerDown(
      this.freeEntitiesScene,
      m2Event,
      domPointerEvent
    );
  }
  htmlCanvasPointerUpHandler(domPointerEvent) {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event = {
      target: scene,
      type: EventType.PointerUp,
      handled: false
    };
    this.processDomPointerUp(scene, m2Event, domPointerEvent);
    this.processDomPointerUp(this.freeEntitiesScene, m2Event, domPointerEvent);
  }
  htmlCanvasPointerMoveHandler(domPointerEvent) {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event = {
      target: scene,
      type: EventType.PointerMove,
      handled: false
    };
    this.processDomPointerMove(scene, m2Event, domPointerEvent);
    this.processDomPointerMove(
      this.freeEntitiesScene,
      m2Event,
      domPointerEvent
    );
  }
  htmlCanvasPointerLeaveHandler(domPointerEvent) {
    if (!this.currentScene) {
      return;
    }
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event = {
      target: scene,
      type: EventType.PointerLeave,
      handled: false
    };
    this.processDomPointerLeave(scene, m2Event, domPointerEvent);
    this.processDomPointerLeave(
      this.freeEntitiesScene,
      m2Event,
      domPointerEvent
    );
  }
  /**
   * Determines if/how m2c2kit entities respond to the DOM PointerDown event
   *
   * @param entity - entity that might be affected by the DOM PointerDown event
   * @param m2Event
   * @param domPointerEvent
   */
  processDomPointerDown(entity, m2Event, domPointerEvent) {
    if (m2Event.handled) {
      return;
    }
    if (entity.isUserInteractionEnabled && this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.pressed = true;
      entity.pressedAndWithinHitArea = true;
      entity.pressedInitialPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY
      };
      this.raiseM2PointerDownEvent(entity, m2Event, domPointerEvent);
      this.raiseTapDownEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.children) {
      entity.children.filter((entity2) => !entity2.hidden).filter((entity2) => entity2.isDrawable).sort(
        (a, b) => b.zPosition - a.zPosition
      ).forEach(
        (entity2) => this.processDomPointerDown(entity2, m2Event, domPointerEvent)
      );
    }
  }
  processDomPointerUp(entity, m2Event, domPointerEvent) {
    if (m2Event.handled) {
      return;
    }
    if (entity.dragging) {
      entity.dragging = false;
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(entity, m2Event, domPointerEvent);
      m2Event.handled = true;
      return;
    }
    if (entity.isUserInteractionEnabled && entity.pressed && entity.pressedAndWithinHitArea) {
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseTapUpEvent(entity, m2Event, domPointerEvent);
      this.raiseTapUpAny(entity, m2Event, domPointerEvent);
      this.raiseM2PointerUpEvent(entity, m2Event, domPointerEvent);
    } else if (entity.isUserInteractionEnabled && entity.pressed && entity.pressedAndWithinHitArea == false) {
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseTapUpAny(entity, m2Event, domPointerEvent);
    } else if (entity.isUserInteractionEnabled && this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseM2PointerUpEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.children) {
      entity.children.filter((entity2) => !entity2.hidden).filter((entity2) => entity2.isDrawable).sort(
        (a, b) => b.zPosition - a.zPosition
      ).forEach(
        (entity2) => this.processDomPointerUp(entity2, m2Event, domPointerEvent)
      );
    }
  }
  processDomPointerMove(entity, m2Event, domPointerEvent) {
    if (m2Event.handled) {
      return;
    }
    if (entity.isUserInteractionEnabled && entity.draggable && entity.pressed) {
      let firstMoveOfDrag = false;
      let deltaX;
      let deltaY;
      if (entity.dragging === false) {
        entity.dragging = true;
        firstMoveOfDrag = true;
        deltaX = domPointerEvent.offsetX - entity.pressedInitialPointerOffset.x;
        deltaY = domPointerEvent.offsetY - entity.pressedInitialPointerOffset.y;
      } else {
        deltaX = domPointerEvent.offsetX - entity.draggingLastPointerOffset.x;
        deltaY = domPointerEvent.offsetY - entity.draggingLastPointerOffset.y;
      }
      entity.position.x += deltaX;
      entity.position.y += deltaY;
      entity.draggingLastPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY
      };
      m2Event.handled = true;
      if (firstMoveOfDrag) {
        this.raiseM2DragStartEvent(entity, m2Event, domPointerEvent);
      } else {
        this.raiseM2DragEvent(entity, m2Event, domPointerEvent);
      }
      return;
    }
    if (entity.isUserInteractionEnabled && entity.pressed && entity.pressedAndWithinHitArea && !this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.isUserInteractionEnabled && this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      this.raiseM2PointerMoveEvent(entity, m2Event, domPointerEvent);
      entity.withinHitArea = true;
    }
    if (entity.isUserInteractionEnabled && entity.withinHitArea && !this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.children) {
      entity.children.filter((entity2) => !entity2.hidden).filter((entity2) => entity2.isDrawable).sort(
        (a, b) => b.zPosition - a.zPosition
      ).forEach(
        (entity2) => this.processDomPointerMove(entity2, m2Event, domPointerEvent)
      );
    }
  }
  processDomPointerLeave(entity, m2Event, domPointerEvent) {
    if (m2Event.handled) {
      return;
    }
    if (entity.dragging) {
      const m2Event2 = {
        target: entity,
        type: EventType.DragEnd,
        handled: false
      };
      entity.dragging = false;
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(entity, m2Event2, domPointerEvent);
      return;
    }
    if (entity.isUserInteractionEnabled && entity.pressed && entity.pressedAndWithinHitArea && !this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.isUserInteractionEnabled && entity.withinHitArea && !this.IsCanvasPointWithinEntityBounds(
      entity,
      domPointerEvent.offsetX,
      domPointerEvent.offsetY
    )) {
      entity.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.children) {
      entity.children.filter((entity2) => !entity2.hidden).filter((entity2) => entity2.isDrawable).sort(
        (a, b) => b.zPosition - a.zPosition
      ).forEach(
        (entity2) => this.processDomPointerLeave(entity2, m2Event, domPointerEvent)
      );
    }
  }
  raiseM2PointerDownEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.PointerDown;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseTapDownEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.TapDown;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseTapLeaveEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.TapLeave;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2PointerUpEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.PointerUp;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseTapUpEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.TapUp;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseTapUpAny(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.TapUpAny;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2PointerMoveEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.PointerMove;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2PointerLeaveEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.PointerLeave;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2DragStartEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.DragStart;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2DragEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.Drag;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  raiseM2DragEndEvent(entity, m2Event, domPointerEvent) {
    m2Event.target = entity;
    m2Event.type = EventType.DragEnd;
    this.raiseEventOnListeningEntities(
      entity,
      m2Event,
      domPointerEvent
    );
  }
  calculatePointWithinEntityFromDomPointerEvent(entity, domPointerEvent) {
    let width = entity.size.width;
    let height = entity.size.height;
    if (entity.type === EntityType.Shape && entity.shapeType === ShapeType.Circle) {
      const radius = entity.circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }
    let x = domPointerEvent.offsetX;
    let y = domPointerEvent.offsetY;
    const bb = M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(entity);
    if (M2c2KitHelpers.entityOrAncestorHasBeenRotated(entity)) {
      const transforms = M2c2KitHelpers.calculateRotationTransforms(
        entity
      );
      transforms.forEach((transform) => {
        const rotatedPoint = M2c2KitHelpers.rotatePoint(
          { x, y },
          // take negative because we are applying the reverse rotation
          -transform.radians,
          transform.center
        );
        x = rotatedPoint.x;
        y = rotatedPoint.y;
      });
    }
    const relativeX = (x - bb.xMin) / (bb.xMax - bb.xMin) * width;
    const relativeY = (y - bb.yMin) / (bb.yMax - bb.yMin) * height;
    return { x: relativeX, y: relativeY };
  }
  /**
   * Executes a callback when the game starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(callback, options) {
    this.addEventListener(EventType.ActivityStart, callback, options);
  }
  /**
   * Executes a callback when the game is canceled.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onCancel(callback, options) {
    this.addEventListener(EventType.ActivityCancel, callback, options);
  }
  /**
   * Executes a callback when the game ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(callback, options) {
    this.addEventListener(EventType.ActivityEnd, callback, options);
  }
  /**
   * Executes a callback when the game generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onData(callback, options) {
    this.addEventListener(
      EventType.ActivityData,
      callback,
      options
    );
  }
  addEventListener(type, callback, options) {
    const eventListener = {
      type,
      activityUuid: this.uuid,
      callback
    };
    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.activityUuid === eventListener.activityUuid && listener.type === eventListener.type)
      );
    }
    this.eventListeners.push(eventListener);
  }
  raiseActivityEventOnListeners(activityEvent, extra) {
    if (extra) {
      activityEvent = {
        ...activityEvent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...extra
      };
    }
    this.eventListeners.filter((listener) => listener.type === activityEvent.type).forEach((listener) => {
      listener.callback(activityEvent);
    });
  }
  raiseEventOnListeningEntities(entity, m2Event, domEvent) {
    entity.eventListeners.filter((listener) => listener.type === m2Event.type).forEach((listener) => {
      if (listener.entityUuid === entity.uuid) {
        m2Event.target = entity;
        switch (m2Event.type) {
          case EventType.PointerDown:
          case EventType.PointerMove:
          case EventType.PointerUp:
          case EventType.PointerLeave:
            m2Event.point = this.calculatePointWithinEntityFromDomPointerEvent(
              entity,
              domEvent
            );
            m2Event.buttons = domEvent.buttons;
            listener.callback(m2Event);
            break;
          case EventType.TapDown:
          case EventType.TapUp:
          case EventType.TapUpAny:
          case EventType.TapLeave:
            m2Event.point = this.calculatePointWithinEntityFromDomPointerEvent(
              entity,
              domEvent
            );
            m2Event.buttons = domEvent.buttons;
            listener.callback(m2Event);
            break;
          case EventType.DragStart:
          case EventType.Drag:
          case EventType.DragEnd:
            m2Event.position = {
              x: entity.position.x,
              y: entity.position.y
            };
            m2Event.buttons = domEvent.buttons;
            listener.callback(m2Event);
            break;
        }
      }
    });
  }
  sceneCanReceiveUserInteraction(scene) {
    if (scene.game === scene.game.session?.currentActivity && scene._transitioning === false) {
      return true;
    }
    return false;
  }
  /**
   *
   * Checks if the given canvas point is within the entity's bounds.
   *
   * @param entity - entity to check bounds for
   * @param x - x coordinate of the canvas point
   * @param y - y coordinate of the canvas point
   * @returns true if x, y point is within the entity's bounds
   */
  IsCanvasPointWithinEntityBounds(entity, x, y) {
    if (!entity.isDrawable) {
      throw "only drawable entities can receive pointer events";
    }
    if (entity.type === EntityType.Shape && entity.shapeType === ShapeType.Circle) {
      const bb = M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(entity);
      const radius = entity.circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      const center = {
        x: bb.xMin + radius * entity.absoluteScale,
        y: bb.yMin + radius * entity.absoluteScale
      };
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );
      return distance <= radius * entity.absoluteScale;
    }
    if (entity.size.width === 0 || entity.size.height === 0) {
      return false;
    }
    if (entity.type === EntityType.TextLine && isNaN(entity.size.width)) {
      return false;
    }
    const points = M2c2KitHelpers.calculateRotatedPoints(
      entity
    );
    return entity.isUserInteractionEnabled && M2c2KitHelpers.isPointInsideRectangle({ x, y }, points);
  }
  prependAssetsGameIdUrl(url) {
    function hasUrlScheme(str) {
      return /^[a-z]+:\/\//i.test(str);
    }
    if (hasUrlScheme(url)) {
      return url;
    }
    if (!this.options.assetsUrl) {
      return `assets/${this.id}/${url}`;
    }
    return this.options.assetsUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
  }
}
var LabelHorizontalAlignmentMode = /* @__PURE__ */ ((LabelHorizontalAlignmentMode2) => {
  LabelHorizontalAlignmentMode2[LabelHorizontalAlignmentMode2["Center"] = 0] = "Center";
  LabelHorizontalAlignmentMode2[LabelHorizontalAlignmentMode2["Left"] = 1] = "Left";
  LabelHorizontalAlignmentMode2[LabelHorizontalAlignmentMode2["Right"] = 2] = "Right";
  return LabelHorizontalAlignmentMode2;
})(LabelHorizontalAlignmentMode || {});
class Label extends Entity {
  /**
   * Single or multi-line text formatted and rendered on the screen.
   *
   * @remarks Label (in contrast to TextLine) has enhanced text support for line wrapping, centering/alignment, and background colors.
   *
   * @param options - {@link LabelOptions}
   */
  constructor(options = {}) {
    super(options);
    this.type = EntityType.Label;
    this.isDrawable = true;
    this.isText = true;
    this.anchorPoint = { x: 0.5, y: 0.5 };
    this.zPosition = 0;
    this._text = "";
    this._fontColor = Constants.DEFAULT_FONT_COLOR;
    this._fontSize = Constants.DEFAULT_FONT_SIZE;
    this._horizontalAlignmentMode = LabelHorizontalAlignmentMode.Center;
    this._translatedText = "";
    handleInterfaceOptions(this, options);
    if (options.horizontalAlignmentMode) {
      this.horizontalAlignmentMode = options.horizontalAlignmentMode;
    }
    if (options.preferredMaxLayoutWidth !== void 0) {
      this.preferredMaxLayoutWidth = options.preferredMaxLayoutWidth;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
    if (options.fontNames) {
      this.fontNames = options.fontNames;
    }
  }
  initialize() {
    let ckTextAlign = this.canvasKit.TextAlign.Center;
    switch (this.horizontalAlignmentMode) {
      case LabelHorizontalAlignmentMode.Center:
        ckTextAlign = this.canvasKit.TextAlign.Center;
        break;
      case LabelHorizontalAlignmentMode.Left:
        ckTextAlign = this.canvasKit.TextAlign.Left;
        break;
      case LabelHorizontalAlignmentMode.Right:
        ckTextAlign = this.canvasKit.TextAlign.Right;
        break;
      default:
        throw new Error("unknown horizontalAlignmentMode");
    }
    if (!this.text) {
      this.text = "";
    }
    let textColor = this.canvasKit.Color(
      this.fontColor[0],
      this.fontColor[1],
      this.fontColor[2],
      this.fontColor[3]
    );
    let textForParagraph;
    const i18n = this.parentSceneAsEntity.game.i18n;
    if (i18n) {
      let translated = i18n.t(this.text);
      if (translated === void 0) {
        const fallbackTranslated = i18n.t(this.text, true);
        if (fallbackTranslated === void 0) {
          translated = this.text;
        } else {
          translated = fallbackTranslated;
        }
        if (i18n.options.missingTranslationFontColor) {
          textColor = this.canvasKit.Color(
            i18n.options.missingTranslationFontColor[0],
            i18n.options.missingTranslationFontColor[1],
            i18n.options.missingTranslationFontColor[2],
            i18n.options.missingTranslationFontColor[3]
          );
        }
      }
      this._translatedText = translated;
      textForParagraph = this._translatedText;
      if (this._translatedText === "") {
        console.warn(`warning: empty translated text in label "${this.name}"`);
      }
    } else {
      textForParagraph = this.text;
      this._translatedText = "";
    }
    const session = this.parentSceneAsEntity.game.session;
    if (!session) {
      throw new Error("session is undefined");
    }
    const fontManager = this.game.fontManager;
    if (fontManager.fontMgr === void 0) {
      throw new Error("no fonts loaded");
    }
    if (this.fontName && this.fontNames) {
      throw new Error("cannot specify both fontName and fontNames");
    }
    const fontFamilies = new Array();
    if (this.fontNames) {
      this.fontNames.forEach((fn) => {
        if (fontManager.gameTypefaces[fn] === void 0) {
          throw new Error(`font ${fn} not found.`);
        }
        fontFamilies.push(fontManager.gameTypefaces[fn].fontFamily);
      });
    } else if (this.fontName) {
      if (fontManager.gameTypefaces[this.fontName] === void 0) {
        throw new Error(`font ${this.fontName} not found.`);
      }
      fontFamilies.push(fontManager.gameTypefaces[this.fontName].fontFamily);
    } else {
      const typefaces = Object.values(fontManager.gameTypefaces);
      const defaultTypeface = typefaces.filter((f) => f.isDefault).find(Boolean);
      if (!defaultTypeface) {
        throw new Error("no default font");
      }
      fontFamilies.push(defaultTypeface.fontFamily);
    }
    this.paraStyle = new this.canvasKit.ParagraphStyle({
      textStyle: {},
      textAlign: ckTextAlign
    });
    if (this.builder) {
      this.builder.delete();
    }
    this.builder = this.canvasKit.ParagraphBuilder.Make(
      this.paraStyle,
      fontManager.fontMgr
    );
    if (!this._backgroundPaint) {
      this._backgroundPaint = new this.canvasKit.Paint();
    }
    if (!this._fontPaint) {
      this._fontPaint = new this.canvasKit.Paint();
    }
    this.fontPaint.setColor(textColor);
    this.fontPaint.setAlphaf(this.absoluteAlpha);
    if (this.backgroundColor) {
      this.backgroundPaint.setColor(this.backgroundColor);
      this.backgroundPaint.setAlphaf(this.absoluteAlpha);
    } else {
      this.backgroundPaint.setColor(this.canvasKit.Color(0, 0, 0, 0));
    }
    this.builder.pushPaintStyle(
      {
        fontFamilies,
        fontSize: this.fontSize * Globals.canvasScale,
        // set default values for below properties as well.
        fontStyle: {
          weight: this.canvasKit.FontWeight.Normal,
          width: this.canvasKit.FontWidth.Normal,
          slant: this.canvasKit.FontSlant.Oblique
        },
        // Normal font style
        decoration: 0,
        // No decoration
        decorationThickness: 1,
        // Default decoration thickness
        decorationStyle: this.canvasKit.DecorationStyle.Solid,
        // Solid decoration style
        heightMultiplier: -1,
        // Providing -1, rather than 1.0, gives default height multiplier
        halfLeading: false,
        // Default half leading
        letterSpacing: 0,
        // Default letter spacing
        wordSpacing: 0
        // Default word spacing
      },
      this.fontPaint,
      this.backgroundPaint
    );
    this.builder.addText(textForParagraph);
    if (this.paragraph) {
      this.paragraph.delete();
    }
    this.paragraph = this.builder.build();
    const preferredWidth = (
      //this.preferredMaxLayoutWidth ?? this.parentScene.game.canvasCssWidth;
      this.preferredMaxLayoutWidth ?? Globals.canvasCssWidth
    );
    let calculatedWidth = preferredWidth;
    if (preferredWidth === 0 || this.layout.width === 0) {
      if (this.parent === void 0) {
        throw new Error(
          "width is set to match parent, but entity has no parent"
        );
      }
      const marginStart = this.layout.marginStart ?? 0;
      const marginEnd = this.layout.marginEnd ?? 0;
      calculatedWidth = this.parent.size.width - (marginStart + marginEnd);
    }
    this.paragraph.layout(calculatedWidth * Globals.canvasScale);
    if (preferredWidth === 0 || this.layout.width === 0) {
      this.size.width = calculatedWidth;
    } else {
      this.paragraph.layout(Math.ceil(this.paragraph.getLongestLine()));
      this.size.width = this.paragraph.getMaxWidth() / Globals.canvasScale;
    }
    this.size.height = this.paragraph.getHeight() / Globals.canvasScale;
    this.needsInitialization = false;
  }
  dispose() {
    CanvasKitHelpers.Dispose([
      this.paragraph,
      this.builder,
      this._fontPaint,
      // use backing field since it may be undefined
      this._backgroundPaint
      // use backing field since it may be undefined
    ]);
  }
  get text() {
    return this._text;
  }
  set text(text) {
    this._text = text;
    this.needsInitialization = true;
  }
  get translatedText() {
    return this._translatedText;
  }
  get fontName() {
    return this._fontName;
  }
  set fontName(fontName) {
    this._fontName = fontName;
    this.needsInitialization = true;
  }
  get fontNames() {
    return this._fontNames;
  }
  set fontNames(fontNames) {
    this._fontNames = fontNames;
    this.needsInitialization = true;
  }
  get fontColor() {
    return this._fontColor;
  }
  set fontColor(fontColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }
  get fontSize() {
    return this._fontSize;
  }
  set fontSize(fontSize) {
    this._fontSize = fontSize;
    this.needsInitialization = true;
  }
  get horizontalAlignmentMode() {
    return this._horizontalAlignmentMode;
  }
  set horizontalAlignmentMode(horizontalAlignmentMode) {
    this._horizontalAlignmentMode = horizontalAlignmentMode;
    this.needsInitialization = true;
  }
  get preferredMaxLayoutWidth() {
    return this._preferredMaxLayoutWidth;
  }
  set preferredMaxLayoutWidth(preferredMaxLayoutWidth) {
    this._preferredMaxLayoutWidth = preferredMaxLayoutWidth;
    this.needsInitialization = true;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }
  get backgroundPaint() {
    if (!this._backgroundPaint) {
      throw new Error("backgroundPaint cannot be undefined");
    }
    return this._backgroundPaint;
  }
  set backgroundPaint(backgroundPaint) {
    this._backgroundPaint = backgroundPaint;
  }
  get fontPaint() {
    if (!this._fontPaint) {
      throw new Error("fontPaint cannot be undefined");
    }
    return this._fontPaint;
  }
  set fontPaint(fontPaint) {
    this._fontPaint = fontPaint;
  }
  /**
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  duplicate(newName) {
    const dest = new Label({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      horizontalAlignmentMode: this.horizontalAlignmentMode,
      preferredMaxLayoutWidth: this.preferredMaxLayoutWidth,
      backgroundColor: this.backgroundColor,
      name: newName
    });
    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }
    return dest;
  }
  update() {
    super.update();
    if (this.absoluteAlphaChange !== 0) {
      this.initialize();
    }
  }
  draw(canvas) {
    if (this.parent && this.text !== "") {
      canvas.save();
      const drawScale = Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);
      const x = (this.absolutePosition.x - this.size.width * this.anchorPoint.x * this.absoluteScale) * drawScale;
      const y = (this.absolutePosition.y - this.size.height * this.anchorPoint.y * this.absoluteScale) * drawScale;
      if (this.paragraph === void 0) {
        throw new Error("no paragraph");
      }
      canvas.drawParagraph(this.paragraph, x, y);
      canvas.restore();
    }
    super.drawChildren(canvas);
  }
  warmup(canvas) {
    if (Object.keys(this.layout).length === 0) {
      this.initialize();
      if (!this.paragraph) {
        throw new Error(
          `warmup Label entity ${this.toString()}: paragraph is undefined`
        );
      }
      canvas.drawParagraph(this.paragraph, 0, 0);
    }
  }
}
class Session {
  /**
   * A Session contains one or more activities. The session manages the start
   * and stop of activities, and advancement to next activity
   *
   * @param options
   */
  constructor(options) {
    this.eventListeners = new Array();
    this.sessionDictionary = /* @__PURE__ */ new Map();
    this.initialized = false;
    this.version = "0.3.16 (b59d03b9)";
    this.options = options;
    for (const activity of this.options.activities) {
      if (this.options.activities.filter((a) => a === activity).length > 1) {
        throw new Error(
          `error in SessionOptions.activities: an instance of the activity named "${activity.name}" has been added more than once to the session. If you want to repeat the same activity, create separate instances of it.`
        );
      }
    }
    this.options.activities.forEach((activity) => activity.session = this);
    if (this.options.sessionUuid) {
      this.uuid = this.options.sessionUuid;
    } else {
      this.uuid = Uuid.generate();
    }
  }
  /**
   * Executes a callback when the session initializes.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onInitialize(callback, options) {
    this.addEventListener(
      EventType.SessionInitialize,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the session starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(callback, options) {
    this.addEventListener(
      EventType.SessionStart,
      callback,
      options
    );
  }
  /**
   * Executes a callback when the session ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(callback, options) {
    this.addEventListener(
      EventType.SessionEnd,
      callback,
      options
    );
  }
  /**
   * Executes a callback when any activity in the session generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onActivityData(callback, options) {
    this.addEventListener(
      EventType.ActivityData,
      callback,
      options
    );
  }
  addEventListener(type, callback, options) {
    const eventListener = {
      type,
      callback,
      key: options?.key
    };
    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.type === eventListener.type)
      );
    }
    this.eventListeners.push(eventListener);
  }
  raiseEventOnListeners(event, extra) {
    if (extra) {
      event = {
        ...event,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...extra
      };
    }
    this.eventListeners.filter((listener) => listener.type === event.type).forEach((listener) => {
      listener.callback(event);
    });
  }
  async sessionActivityStartHandler(event) {
    const activityType = event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`\u{1F7E2} started activity (${activityType}) ${event.target.name}`);
  }
  async sessionActivityCancelHandler(event) {
    const activityType = event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`\u{1F6AB} canceled activity (${activityType}) ${event.target.name}`);
    if (this.nextActivity && this.options.autoGoToNextActivity !== false) {
      await this.goToNextActivity();
      return;
    }
    if (!this.nextActivity && this.options.autoEndAfterLastActivity !== false) {
      this.end();
    }
  }
  async sessionActivityEndHandler(event) {
    const activityType = event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`\u{1F534} ended activity (${activityType}) ${event.target.name}`);
    if (this.nextActivity && this.options.autoGoToNextActivity !== false) {
      await this.goToNextActivity();
      return;
    }
    if (!this.nextActivity && this.options.autoEndAfterLastActivity !== false) {
      this.end();
    }
  }
  async sessionActivityLifecycleHandler(event) {
    if (event.type === EventType.ActivityStart) {
      await this.sessionActivityStartHandler(event);
      return;
    }
    if (event.type === EventType.ActivityCancel) {
      await this.sessionActivityCancelHandler(event);
      return;
    }
    if (event.type === EventType.ActivityEnd) {
      await this.sessionActivityEndHandler(event);
      return;
    }
    throw new Error("unknown activity lifecycle event type");
  }
  activityResultsEventHandler(event) {
    this.raiseEventOnListeners(event);
  }
  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   *
   * @deprecated Use Session.initialize() instead.
   */
  async init() {
    console.warn(
      `The init() method of Session is deprecated. Use initialize() instead.`
    );
    return this.initialize();
  }
  /**
   * Check if the Activity uses the deprecated init() method.
   *
   * @remarks Activity.init() is deprecated and should be replaced with
   * Activity.initialize().
   *
   * @param activity
   * @returns true if the activity defines its own init() method, false otherwise.
   */
  activityUsesDeprecatedInit(activity) {
    if (activity.type === ActivityType.Survey) {
      return false;
    }
    const activityPrototype = Object.getPrototypeOf(activity);
    const gamePrototype = Object.getPrototypeOf(activityPrototype);
    return activityPrototype?.init !== gamePrototype?.init;
  }
  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   */
  async initialize() {
    console.log(`\u26AA @m2c2kit/core version ${this.version}`);
    Timer.start("sessionInitialize");
    const sessionInitializeEvent = {
      target: this,
      type: EventType.SessionInitialize
    };
    this.raiseEventOnListeners(sessionInitializeEvent);
    DomHelpers.addLoadingElements();
    DomHelpers.setSpinnerVisibility(true);
    DomHelpers.setCanvasOverlayVisibility(true);
    this.dataStores = this.options.dataStores;
    if (this.dataStores?.length === 0) {
      throw new Error(
        "Session.initialize(): dataStores must be undefined or a non-zero array of datastores."
      );
    }
    await Promise.all(
      this.options.activities.map((activity) => {
        activity.dataStores = this.dataStores;
        activity.onStart(this.sessionActivityLifecycleHandler.bind(this));
        activity.onCancel(this.sessionActivityLifecycleHandler.bind(this));
        activity.onEnd(this.sessionActivityLifecycleHandler.bind(this));
        activity.onData((event) => {
          this.activityResultsEventHandler(event);
        });
        if (this.activityUsesDeprecatedInit(activity)) {
          console.warn(
            `game ${activity.id}: Activity.init() is deprecated. In the assessment class that extends Game, use Activity.initialize() instead:
  async initialize() {
    await super.initialize();
    ...
  }
`
          );
          return activity.init();
        }
        return activity.initialize();
      })
    );
    console.log(
      `\u26AA Session.sessionInitialize() took ${Timer.elapsed(
        "sessionInitialize"
      ).toFixed(0)} ms`
    );
    Timer.remove("sessionInitialize");
    this.initialized = true;
    if (this.options.autoStartAfterInit !== false) {
      await this.start();
    }
  }
  /**
   * Waits for the session to be initialized.
   *
   * @remarks Session.initialize() is asynchronous, and it should be awaited
   * so that the session is fully initialized before calling Session.start().
   * If it is not awaited (or it cannot be awaited because the target
   * environment does not support top-level await), this function ensures that
   * the session has been initialized.
   */
  async waitForSessionInitialization() {
    while (!this.initialized) {
      await new Promise(
        (resolve2) => setTimeout(
          resolve2,
          Constants.SESSION_INITIALIZATION_POLLING_INTERVAL_MS
        )
      );
    }
  }
  /**
   * Starts the session and starts the first activity.
   */
  async start() {
    await this.waitForSessionInitialization();
    console.log("\u{1F7E2} started session");
    const sessionStartEvent = {
      target: this,
      type: EventType.SessionStart
    };
    this.raiseEventOnListeners(sessionStartEvent);
    this.currentActivity = this.options.activities.find(Boolean);
    if (this.currentActivity) {
      DomHelpers.configureDomForActivity(this.currentActivity);
      await this.currentActivity.start();
    } else {
      console.warn("no activities in session.");
      this.end();
    }
  }
  /**
   * Declares the session ended and sends callback.
   */
  end() {
    console.log("\u{1F534} ended session");
    DomHelpers.hideAll();
    this.stop();
    const sessionEndEvent = {
      target: this,
      type: EventType.SessionEnd
    };
    this.raiseEventOnListeners(sessionEndEvent);
  }
  stop() {
    this.dispose();
  }
  /**
   * Frees up resources that were allocated to run the session.
   *
   * @remarks This will be done automatically by the m2c2kit library;
   * the end-user must not call this.
   */
  dispose() {
  }
  /**
   * Stops the current activity and goes to the activity with the provided id.
   *
   * @param options
   */
  async goToActivity(options) {
    const nextActivity = this.options.activities.filter((activity) => activity.id === options.id).find(Boolean);
    if (!nextActivity) {
      throw new Error(
        `Error in goToActivity(): Session does not contain an activity with id ${options.id}.`
      );
    }
    if (this.currentActivity) {
      this.currentActivity.stop();
    }
    const currentActivityOldObject = nextActivity;
    const activityFactoryFunction = currentActivityOldObject.constructor.bind.apply(
      currentActivityOldObject.constructor,
      [null]
    );
    this.currentActivity = new activityFactoryFunction();
    const indexOfCurrentActivity = this.options.activities.indexOf(
      currentActivityOldObject
    );
    this.options.activities[indexOfCurrentActivity] = this.currentActivity;
    DomHelpers.configureDomForActivity(this.currentActivity);
    this.currentActivity.session = this;
    this.currentActivity.dataStores = this.dataStores;
    if (currentActivityOldObject.additionalParameters) {
      this.currentActivity.setParameters(
        currentActivityOldObject.additionalParameters
      );
    }
    await this.currentActivity.initialize();
    await this.currentActivity.start();
  }
  /**
   * Stops the current activity and advances to next activity in the session.
   * If there is no activity after the current activity, throws error.
   */
  async goToNextActivity() {
    if (!this.currentActivity) {
      throw new Error("error in advanceToNextActivity(): no current activity");
    }
    if (!this.nextActivity) {
      throw new Error("error in advanceToNextActivity(): no next activity");
    }
    this.currentActivity.stop();
    this.currentActivity = this.nextActivity;
    DomHelpers.configureDomForActivity(this.currentActivity);
    await this.currentActivity.start();
  }
  /**
   * Stops the current activity and advances to next activity in the session.
   * If there is no activity after the current activity, throws error.
   *
   * @deprecated Use goToNextActivity() instead.
   */
  async advanceToNextActivity() {
    await this.goToNextActivity();
  }
  /**
   * Gets the next activity after the current one, or undefined if
   * this is the last activity.
   */
  get nextActivity() {
    if (!this.currentActivity) {
      throw new Error("error in get nextActivity(): no current activity");
    }
    const index = this.options.activities.indexOf(this.currentActivity);
    if (index === this.options.activities.length - 1) {
      return void 0;
    }
    const currentActivityIndex = this.options.activities.indexOf(
      this.currentActivity
    );
    return this.options.activities[currentActivityIndex + 1];
  }
  /**
   * Saves an item to the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @param value - item value
   */
  dictionarySetItem(key, value) {
    this.sessionDictionary.set(key, value);
  }
  /**
   * Gets an item value from the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns value of the item
   */
  dictionaryGetItem(key) {
    return this.sessionDictionary.get(key);
  }
  /**
   * Deletes an item value from the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns true if the item was deleted, false if it did not exist
   */
  dictionaryDeleteItem(key) {
    return this.sessionDictionary.delete(key);
  }
  /**
   * Determines if a key exists in the activity's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns true if the key exists, false otherwise
   */
  dictionaryItemExists(key) {
    return this.sessionDictionary.has(key);
  }
}

class TestApp extends Game {
  constructor() {
    const defaultParameters = {
      number_of_trials: {
        type: "integer",
        default: 10,
        description: "How many trials to run."
      },
      show_fps: {
        type: "boolean",
        default: false,
        description: "Should the FPS be shown?"
      }
    };
    const options = {
      bodyBackgroundColor: WebColors.WhiteSmoke,
      name: "Test App",
      id: "scratch",
      canvasKitWasmUrl: "canvaskit.wasm",
      version: "0.0.1",
      showFps: defaultParameters.show_fps.default,
      /**
       * Actual pixel resolution will be scaled to fit the device, while
       * preserving the aspect ratio. It is important, however, to specify
       * a width and height to obtain the desired aspect ratio. In most
       * cases, you should not change this. 1:2 is a good aspect ratio
       * for modern phones.
       */
      width: 400,
      height: 800,
      parameters: defaultParameters,
      /**
       * The Roboto-Regular.ttf font is licensed under the Apache License,
       * and its LICENSE.TXT will be copied as part of the build.
       */
      fonts: [
        {
          url: "fonts/roboto/Roboto-Regular.ttf",
          fontName: "roboto"
        }
      ],
      images: [
        {
          imageName: "screenshot",
          height: 270,
          width: 240,
          url: "images/assessmentExample.png"
        }
      ]
    };
    super(options);
  }
  async initialize() {
    await super.initialize();
    const game = this;
    const scene1 = new Scene();
    game.addScene(scene1);
    const helloLabel = new Label({
      text: "Hello",
      position: { x: 200, y: 400 }
    });
    scene1.addChild(helloLabel);
  }
}
const testApp = new TestApp();
const activities = [testApp];
const session = new Session({
  activities
});
session.onActivityData((ev) => {
  if (ev.target.type === ActivityType.Game) {
    console.log(`\u2705 trial complete:`);
  } else if (ev.target.type === ActivityType.Survey) {
    console.log(`\u2705 survey response:`);
  }
  console.log("  newData: " + JSON.stringify(ev.newData));
  console.log("  newData schema: " + JSON.stringify(ev.newDataSchema));
  console.log("  data: " + JSON.stringify(ev.data));
  console.log("  data schema: " + JSON.stringify(ev.dataSchema));
  console.log(
    "  activity parameters: " + JSON.stringify(ev.activityConfiguration)
  );
  console.log(
    "  activity parameters schema: " + JSON.stringify(ev.activityConfigurationSchema)
  );
});
window.session = session;
session.initialize();
//# sourceMappingURL=index.js.map
