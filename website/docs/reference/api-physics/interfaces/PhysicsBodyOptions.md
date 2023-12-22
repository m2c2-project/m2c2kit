---
id: "PhysicsBodyOptions"
title: "Interface: PhysicsBodyOptions"
sidebar_label: "PhysicsBodyOptions"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`PhysicsBody`](../classes/PhysicsBody.md)

## Properties

### allowsRotation

• `Optional` **allowsRotation**: `boolean`

Whether or not the body can rotate. Defaults to true.

**`Remarks`**

If true, this sets the Matter.js `inertia` property to `Infinity`.

#### Defined in

[PhysicsBodyOptions.ts:64](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L64)

___

### angularVelocity

• `Optional` **angularVelocity**: `number`

Body angular velocity.

#### Defined in

[PhysicsBodyOptions.ts:87](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L87)

___

### circleOfRadius

• `Optional` **circleOfRadius**: `number`

A circular physics body of the given radius centered on the entity.

#### Defined in

[PhysicsBodyOptions.ts:8](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L8)

___

### damping

• `Optional` **damping**: `number`

Friction due to air forces on the body, in the range [0, 1].

#### Defined in

[PhysicsBodyOptions.ts:58](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L58)

___

### density

• `Optional` **density**: `number`

Body density (mass per unit area)

**`Remarks`**

Mass will automatically be calculated when density is set.

#### Defined in

[PhysicsBodyOptions.ts:76](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L76)

___

### edgeLoop

• `Optional` **edgeLoop**: `Size` & \{ `thickness?`: `number`  }

A region that physics bodies cannot penetrate.

#### Defined in

[PhysicsBodyOptions.ts:16](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L16)

___

### friction

• `Optional` **friction**: `number`

Friction of the body, in the range [0, 1].

#### Defined in

[PhysicsBodyOptions.ts:54](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L54)

___

### isDynamic

• `Optional` **isDynamic**: `boolean`

Whether or not the physics body moves in response to forces. Defaults to true.

**`Remarks`**

Once set, this property cannot be changed. This is negated and mapped to the Matter.js `static` property.

#### Defined in

[PhysicsBodyOptions.ts:34](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L34)

___

### mass

• `Optional` **mass**: `number`

The mass of the body.

**`Remarks`**

Density will automatically be calculated when mass is set.

#### Defined in

[PhysicsBodyOptions.ts:70](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L70)

___

### rect

• `Optional` **rect**: `Size`

A rectangular physics body of the given size centered on the entity.

#### Defined in

[PhysicsBodyOptions.ts:12](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L12)

___

### resting

• `Optional` **resting**: `boolean`

Whether or not the physics body currently moves in response to forces. Defaults to false.

**`Remarks`**

Unlike `isDynamic`, this property can be changed after the body is created. This is mapped to the Matter.js `sleeping` property.

#### Defined in

[PhysicsBodyOptions.ts:40](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L40)

___

### restitution

• `Optional` **restitution**: `number`

How elastic (bouncy) the body is.

**`Remarks`**

Range is 0 to 1. 0 means collisions are not elastic at all (no bouncing), 1 means collisions are perfectly elastic. Defaults to 0. This is mapped to the Matter.js `restitution` property.

#### Defined in

[PhysicsBodyOptions.ts:46](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L46)

___

### speed

• `Optional` **speed**: `number`

Body speed.

**`Remarks`**

If speed is set, the direction will be maintained when velocity
is updated.

#### Defined in

[PhysicsBodyOptions.ts:83](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L83)

___

### velocity

• `Optional` **velocity**: [`Vector`](Vector.md)

The velocity of the body.

#### Defined in

[PhysicsBodyOptions.ts:50](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBodyOptions.ts#L50)
