---
id: "PhysicsBody"
title: "Class: PhysicsBody"
sidebar_label: "PhysicsBody"
sidebar_position: 0
custom_edit_url: null
---

A rigid body model added to an entity to enable physics simulation.

**`Remarks`**

Set to `undefined` to remove the physics body from the entity
and the physics engine world. Note that this will not remove the entity
from the scene. If the entity is visible, setting the physics body to
`undefined` will "freeze" the entity at its current position and
rotation.

**`Param`**

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md)

## Implements

- [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md)

## Constructors

### constructor

• **new PhysicsBody**(`options`): [`PhysicsBody`](PhysicsBody.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md) |

#### Returns

[`PhysicsBody`](PhysicsBody.md)

#### Defined in

[physics/src/PhysicsBody.ts:29](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L29)

## Properties

### EDGE\_LOOP\_DEFAULT\_THICKNESS

• `Private` `Readonly` **EDGE\_LOOP\_DEFAULT\_THICKNESS**: ``50``

#### Defined in

[physics/src/PhysicsBody.ts:24](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L24)

___

### \_allowsRotation

• `Private` **\_allowsRotation**: `boolean` = `true`

#### Defined in

[physics/src/PhysicsBody.ts:26](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L26)

___

### \_body

• `Optional` **\_body**: `Body`

#### Defined in

[physics/src/PhysicsBody.ts:20](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L20)

___

### \_entity

• `Optional` **\_entity**: `Entity`

#### Defined in

[physics/src/PhysicsBody.ts:19](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L19)

___

### \_isDynamic

• `Private` **\_isDynamic**: `boolean` = `true`

#### Defined in

[physics/src/PhysicsBody.ts:23](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L23)

___

### \_physics

• `Private` `Optional` **\_physics**: [`Physics`](Physics.md)

#### Defined in

[physics/src/PhysicsBody.ts:25](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L25)

___

### needsInitialization

• **needsInitialization**: `boolean` = `true`

#### Defined in

[physics/src/PhysicsBody.ts:22](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L22)

___

### options

• **options**: [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md)

#### Defined in

[physics/src/PhysicsBody.ts:21](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L21)

___

### previousInertia

• `Private` **previousInertia**: `number` = `NaN`

#### Defined in

[physics/src/PhysicsBody.ts:27](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L27)

## Accessors

### allowsRotation

• `get` **allowsRotation**(): `boolean`

Whether or not the body can rotate. Defaults to true.

#### Returns

`boolean`

**`Remarks`**

If true, this sets the Matter.js `inertia` property to `Infinity`.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[allowsRotation](../interfaces/PhysicsBodyOptions.md#allowsrotation)

#### Defined in

[physics/src/PhysicsBody.ts:441](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L441)

• `set` **allowsRotation**(`allowsRotation`): `void`

Whether or not the body can rotate. Defaults to true.

#### Parameters

| Name | Type |
| :------ | :------ |
| `allowsRotation` | `boolean` |

#### Returns

`void`

**`Remarks`**

If true, this sets the Matter.js `inertia` property to `Infinity`.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[allowsRotation](../interfaces/PhysicsBodyOptions.md#allowsrotation)

#### Defined in

[physics/src/PhysicsBody.ts:429](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L429)

___

### angularVelocity

• `get` **angularVelocity**(): `number`

Body angular velocity.

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[angularVelocity](../interfaces/PhysicsBodyOptions.md#angularvelocity)

#### Defined in

[physics/src/PhysicsBody.ts:478](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L478)

• `set` **angularVelocity**(`angularVelocity`): `void`

Body angular velocity.

#### Parameters

| Name | Type |
| :------ | :------ |
| `angularVelocity` | `number` |

#### Returns

`void`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[angularVelocity](../interfaces/PhysicsBodyOptions.md#angularvelocity)

#### Defined in

[physics/src/PhysicsBody.ts:482](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L482)

___

### area

• `get` **area**(): `number`

The area of the body's convex hull.

#### Returns

`number`

**`Remarks`**

This is a read-only property.

#### Defined in

[physics/src/PhysicsBody.ts:466](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L466)

___

### body

• `get` **body**(): `Body`

#### Returns

`Body`

#### Defined in

[physics/src/PhysicsBody.ts:344](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L344)

• `set` **body**(`body`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `body` | `Body` |

#### Returns

`void`

#### Defined in

[physics/src/PhysicsBody.ts:351](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L351)

___

### categoryBitMask

• `get` **categoryBitMask**(): `number`

A 32-bit mask specifying which categories this physics body belongs to.

#### Returns

`number`

**`Remarks`**

There are up to 32 different categories that physics bodies can
belong to. Each category is represented by a bit in the mask. For example,
if a body belongs to categories 1 and 3, its category bit mask is
0b00000000000000000000000000000101. Along with the `collisionBitMask`,
this property determines which other bodies this physics body can
collide with. Default category for all physics bodies is 1.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[categoryBitMask](../interfaces/PhysicsBodyOptions.md#categorybitmask)

#### Defined in

[physics/src/PhysicsBody.ts:486](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L486)

• `set` **categoryBitMask**(`categoryBitMask`): `void`

A 32-bit mask specifying which categories this physics body belongs to.

#### Parameters

| Name | Type |
| :------ | :------ |
| `categoryBitMask` | `number` |

#### Returns

`void`

**`Remarks`**

There are up to 32 different categories that physics bodies can
belong to. Each category is represented by a bit in the mask. For example,
if a body belongs to categories 1 and 3, its category bit mask is
0b00000000000000000000000000000101. Along with the `collisionBitMask`,
this property determines which other bodies this physics body can
collide with. Default category for all physics bodies is 1.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[categoryBitMask](../interfaces/PhysicsBodyOptions.md#categorybitmask)

#### Defined in

[physics/src/PhysicsBody.ts:494](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L494)

___

### collisionBitMask

• `get` **collisionBitMask**(): `number`

A 32-bit mask specifying which categories this physics body can collide with.

#### Returns

`number`

**`Remarks`**

This value is a bit mask of the other physics body categories
that this body can collide with. Default is 0xFFFFFFFF, which means this
body can collide with all other categories (e.g., all physics bodies).

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[collisionBitMask](../interfaces/PhysicsBodyOptions.md#collisionbitmask)

#### Defined in

[physics/src/PhysicsBody.ts:498](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L498)

• `set` **collisionBitMask**(`collisionBitMask`): `void`

A 32-bit mask specifying which categories this physics body can collide with.

#### Parameters

| Name | Type |
| :------ | :------ |
| `collisionBitMask` | `number` |

#### Returns

`void`

**`Remarks`**

This value is a bit mask of the other physics body categories
that this body can collide with. Default is 0xFFFFFFFF, which means this
body can collide with all other categories (e.g., all physics bodies).

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[collisionBitMask](../interfaces/PhysicsBodyOptions.md#collisionbitmask)

#### Defined in

[physics/src/PhysicsBody.ts:506](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L506)

___

### damping

• `get` **damping**(): `number`

Friction due to air forces on the body, in the range [0, 1].

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[damping](../interfaces/PhysicsBodyOptions.md#damping)

#### Defined in

[physics/src/PhysicsBody.ts:425](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L425)

• `set` **damping**(`damping`): `void`

Friction due to air forces on the body, in the range [0, 1].

#### Parameters

| Name | Type |
| :------ | :------ |
| `damping` | `number` |

#### Returns

`void`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[damping](../interfaces/PhysicsBodyOptions.md#damping)

#### Defined in

[physics/src/PhysicsBody.ts:421](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L421)

___

### density

• `get` **density**(): `number`

Body density (mass per unit area)

#### Returns

`number`

**`Remarks`**

Mass will automatically be calculated when density is set.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[density](../interfaces/PhysicsBodyOptions.md#density)

#### Defined in

[physics/src/PhysicsBody.ts:453](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L453)

• `set` **density**(`density`): `void`

Body density (mass per unit area)

#### Parameters

| Name | Type |
| :------ | :------ |
| `density` | `number` |

#### Returns

`void`

**`Remarks`**

Mass will automatically be calculated when density is set.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[density](../interfaces/PhysicsBodyOptions.md#density)

#### Defined in

[physics/src/PhysicsBody.ts:457](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L457)

___

### entity

• `get` **entity**(): `Entity`

#### Returns

`Entity`

#### Defined in

[physics/src/PhysicsBody.ts:372](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L372)

• `set` **entity**(`entity`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `Entity` |

#### Returns

`void`

#### Defined in

[physics/src/PhysicsBody.ts:379](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L379)

___

### friction

• `get` **friction**(): `number`

Friction of the body, in the range [0, 1].

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[friction](../interfaces/PhysicsBodyOptions.md#friction)

#### Defined in

[physics/src/PhysicsBody.ts:417](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L417)

• `set` **friction**(`friction`): `void`

Friction of the body, in the range [0, 1].

#### Parameters

| Name | Type |
| :------ | :------ |
| `friction` | `number` |

#### Returns

`void`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[friction](../interfaces/PhysicsBodyOptions.md#friction)

#### Defined in

[physics/src/PhysicsBody.ts:413](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L413)

___

### isDynamic

• `get` **isDynamic**(): `boolean`

Whether or not the physics body moves in response to forces. Defaults to true.

#### Returns

`boolean`

**`Remarks`**

Once set, this property cannot be changed. This is negated and mapped to the Matter.js `static` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[isDynamic](../interfaces/PhysicsBodyOptions.md#isdynamic)

#### Defined in

[physics/src/PhysicsBody.ts:393](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L393)

• `set` **isDynamic**(`isDynamic`): `void`

Whether or not the physics body moves in response to forces. Defaults to true.

#### Parameters

| Name | Type |
| :------ | :------ |
| `isDynamic` | `boolean` |

#### Returns

`void`

**`Remarks`**

Once set, this property cannot be changed. This is negated and mapped to the Matter.js `static` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[isDynamic](../interfaces/PhysicsBodyOptions.md#isdynamic)

#### Defined in

[physics/src/PhysicsBody.ts:383](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L383)

___

### mass

• `get` **mass**(): `number`

The mass of the body.

#### Returns

`number`

**`Remarks`**

Density will automatically be calculated when mass is set.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[mass](../interfaces/PhysicsBodyOptions.md#mass)

#### Defined in

[physics/src/PhysicsBody.ts:449](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L449)

• `set` **mass**(`mass`): `void`

The mass of the body.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mass` | `number` |

#### Returns

`void`

**`Remarks`**

Density will automatically be calculated when mass is set.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[mass](../interfaces/PhysicsBodyOptions.md#mass)

#### Defined in

[physics/src/PhysicsBody.ts:445](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L445)

___

### physics

• `get` **physics**(): [`Physics`](Physics.md)

#### Returns

[`Physics`](Physics.md)

#### Defined in

[physics/src/PhysicsBody.ts:333](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L333)

• `set` **physics**(`physics`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `physics` | [`Physics`](Physics.md) |

#### Returns

`void`

#### Defined in

[physics/src/PhysicsBody.ts:340](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L340)

___

### resting

• `get` **resting**(): `boolean`

Whether or not the physics body currently moves in response to forces. Defaults to false.

#### Returns

`boolean`

**`Remarks`**

Unlike `isDynamic`, this property can be changed after the body is created. This is mapped to the Matter.js `sleeping` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[resting](../interfaces/PhysicsBodyOptions.md#resting)

#### Defined in

[physics/src/PhysicsBody.ts:401](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L401)

• `set` **resting**(`resting`): `void`

Whether or not the physics body currently moves in response to forces. Defaults to false.

#### Parameters

| Name | Type |
| :------ | :------ |
| `resting` | `boolean` |

#### Returns

`void`

**`Remarks`**

Unlike `isDynamic`, this property can be changed after the body is created. This is mapped to the Matter.js `sleeping` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[resting](../interfaces/PhysicsBodyOptions.md#resting)

#### Defined in

[physics/src/PhysicsBody.ts:397](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L397)

___

### restitution

• `get` **restitution**(): `number`

How elastic (bouncy) the body is.

#### Returns

`number`

**`Remarks`**

Range is 0 to 1. 0 means collisions are not elastic at all (no bouncing), 1 means collisions are perfectly elastic. Defaults to 0. This is mapped to the Matter.js `restitution` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[restitution](../interfaces/PhysicsBodyOptions.md#restitution)

#### Defined in

[physics/src/PhysicsBody.ts:409](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L409)

• `set` **restitution**(`restitution`): `void`

How elastic (bouncy) the body is.

#### Parameters

| Name | Type |
| :------ | :------ |
| `restitution` | `number` |

#### Returns

`void`

**`Remarks`**

Range is 0 to 1. 0 means collisions are not elastic at all (no bouncing), 1 means collisions are perfectly elastic. Defaults to 0. This is mapped to the Matter.js `restitution` property.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[restitution](../interfaces/PhysicsBodyOptions.md#restitution)

#### Defined in

[physics/src/PhysicsBody.ts:405](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L405)

___

### speed

• `get` **speed**(): `number`

Body speed.

#### Returns

`number`

**`Remarks`**

If speed is set, the direction will be maintained when velocity
is updated.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[speed](../interfaces/PhysicsBodyOptions.md#speed)

#### Defined in

[physics/src/PhysicsBody.ts:470](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L470)

• `set` **speed**(`speed`): `void`

Body speed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `speed` | `number` |

#### Returns

`void`

**`Remarks`**

If speed is set, the direction will be maintained when velocity
is updated.

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[speed](../interfaces/PhysicsBodyOptions.md#speed)

#### Defined in

[physics/src/PhysicsBody.ts:474](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L474)

___

### velocity

• `get` **velocity**(): [`Vector`](../interfaces/Vector.md)

The velocity of the body.

#### Returns

[`Vector`](../interfaces/Vector.md)

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[velocity](../interfaces/PhysicsBodyOptions.md#velocity)

#### Defined in

[physics/src/PhysicsBody.ts:355](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L355)

• `set` **velocity**(`velocity`): `void`

The velocity of the body.

#### Parameters

| Name | Type |
| :------ | :------ |
| `velocity` | [`Vector`](../interfaces/Vector.md) |

#### Returns

`void`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[velocity](../interfaces/PhysicsBodyOptions.md#velocity)

#### Defined in

[physics/src/PhysicsBody.ts:360](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L360)

## Methods

### applyForce

▸ **applyForce**(`force`, `at?`): `void`

Applies a force to the body in a single time step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `force` | [`Vector`](../interfaces/Vector.md) | force to apply as a vector. |
| `at?` | `Point` | the point at which to apply the force, relative to the body's position in scene coordinates. |

#### Returns

`void`

**`Remarks`**

if `at` is not specified, the force is applied at the body's current `position`.

#### Defined in

[physics/src/PhysicsBody.ts:120](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L120)

___

### createCircleBody

▸ **createCircleBody**(`options`): `Body`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md) |

#### Returns

`Body`

#### Defined in

[physics/src/PhysicsBody.ts:139](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L139)

___

### createEdgeLoopBody

▸ **createEdgeLoopBody**(`options`): `Body`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md) |

#### Returns

`Body`

#### Defined in

[physics/src/PhysicsBody.ts:197](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L197)

___

### createRectBody

▸ **createRectBody**(`options`): `Body`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md) |

#### Returns

`Body`

#### Defined in

[physics/src/PhysicsBody.ts:167](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L167)

___

### initialize

▸ **initialize**(`physics`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `physics` | [`Physics`](Physics.md) |

#### Returns

`void`

#### Defined in

[physics/src/PhysicsBody.ts:34](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/PhysicsBody.ts#L34)
