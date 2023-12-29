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

[physics/src/PhysicsBodyOptions.ts:64](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L64)

___

### angularVelocity

• `Optional` **angularVelocity**: `number`

Body angular velocity.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:87](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L87)

___

### categoryBitMask

• `Optional` **categoryBitMask**: `number`

A 32-bit mask specifying which categories this physics body belongs to.

**`Remarks`**

There are up to 32 different categories that physics bodies can
belong to. Each category is represented by a bit in the mask. For example,
if a body belongs to categories 1 and 3, its category bit mask is
0b00000000000000000000000000000101. Along with the `collisionBitMask`,
this property determines which other bodies this physics body can
collide with. Default category for all physics bodies is 1.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:98](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L98)

___

### circleOfRadius

• `Optional` **circleOfRadius**: `number`

A circular physics body of the given radius centered on the entity.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:8](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L8)

___

### collisionBitMask

• `Optional` **collisionBitMask**: `number`

A 32-bit mask specifying which categories this physics body can collide with.

**`Remarks`**

This value is a bit mask of the other physics body categories
that this body can collide with. Default is 0xFFFFFFFF, which means this
body can collide with all other categories (e.g., all physics bodies).

#### Defined in

[physics/src/PhysicsBodyOptions.ts:106](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L106)

___

### damping

• `Optional` **damping**: `number`

Friction due to air forces on the body, in the range [0, 1].

#### Defined in

[physics/src/PhysicsBodyOptions.ts:58](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L58)

___

### density

• `Optional` **density**: `number`

Body density (mass per unit area)

**`Remarks`**

Mass will automatically be calculated when density is set.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:76](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L76)

___

### edgeLoop

• `Optional` **edgeLoop**: `Size` & \{ `thickness?`: `number`  }

A region that physics bodies cannot penetrate.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:16](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L16)

___

### friction

• `Optional` **friction**: `number`

Friction of the body, in the range [0, 1].

#### Defined in

[physics/src/PhysicsBodyOptions.ts:54](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L54)

___

### isDynamic

• `Optional` **isDynamic**: `boolean`

Whether or not the physics body moves in response to forces. Defaults to true.

**`Remarks`**

Once set, this property cannot be changed. This is negated and mapped to the Matter.js `static` property.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:34](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L34)

___

### mass

• `Optional` **mass**: `number`

The mass of the body.

**`Remarks`**

Density will automatically be calculated when mass is set.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:70](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L70)

___

### rect

• `Optional` **rect**: `Size`

A rectangular physics body of the given size centered on the entity.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:12](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L12)

___

### resting

• `Optional` **resting**: `boolean`

Whether or not the physics body currently moves in response to forces. Defaults to false.

**`Remarks`**

Unlike `isDynamic`, this property can be changed after the body is created. This is mapped to the Matter.js `sleeping` property.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:40](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L40)

___

### restitution

• `Optional` **restitution**: `number`

How elastic (bouncy) the body is.

**`Remarks`**

Range is 0 to 1. 0 means collisions are not elastic at all (no bouncing), 1 means collisions are perfectly elastic. Defaults to 0. This is mapped to the Matter.js `restitution` property.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:46](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L46)

___

### speed

• `Optional` **speed**: `number`

Body speed.

**`Remarks`**

If speed is set, the direction will be maintained when velocity
is updated.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:83](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L83)

___

### velocity

• `Optional` **velocity**: [`Vector`](Vector.md)

The velocity of the body.

#### Defined in

[physics/src/PhysicsBodyOptions.ts:50](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBodyOptions.ts#L50)
