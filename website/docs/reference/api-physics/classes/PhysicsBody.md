---
id: "PhysicsBody"
title: "Class: PhysicsBody"
sidebar_label: "PhysicsBody"
sidebar_position: 0
custom_edit_url: null
---

A rigid body model added to an entity to enable physics simulation.

**`Remarks`**

This is a wrapper around the Matter.js `Body` class.

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

[PhysicsBody.ts:25](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L25)

## Properties

### EDGE\_LOOP\_DEFAULT\_THICKNESS

• `Private` `Readonly` **EDGE\_LOOP\_DEFAULT\_THICKNESS**: ``50``

#### Defined in

[PhysicsBody.ts:20](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L20)

___

### \_allowsRotation

• `Private` **\_allowsRotation**: `boolean` = `true`

#### Defined in

[PhysicsBody.ts:22](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L22)

___

### \_body

• `Optional` **\_body**: `Body`

#### Defined in

[PhysicsBody.ts:16](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L16)

___

### \_entity

• `Optional` **\_entity**: `Entity`

#### Defined in

[PhysicsBody.ts:15](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L15)

___

### \_isDynamic

• `Private` **\_isDynamic**: `boolean` = `true`

#### Defined in

[PhysicsBody.ts:19](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L19)

___

### \_physics

• `Private` `Optional` **\_physics**: [`Physics`](Physics.md)

#### Defined in

[PhysicsBody.ts:21](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L21)

___

### needsInitialization

• **needsInitialization**: `boolean` = `true`

#### Defined in

[PhysicsBody.ts:18](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L18)

___

### options

• **options**: [`PhysicsBodyOptions`](../interfaces/PhysicsBodyOptions.md)

#### Defined in

[PhysicsBody.ts:17](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L17)

___

### previousInertia

• `Private` **previousInertia**: `number` = `NaN`

#### Defined in

[PhysicsBody.ts:23](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L23)

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

[PhysicsBody.ts:419](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L419)

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

[PhysicsBody.ts:407](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L407)

___

### angularVelocity

• `get` **angularVelocity**(): `number`

Body angular velocity.

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[angularVelocity](../interfaces/PhysicsBodyOptions.md#angularvelocity)

#### Defined in

[PhysicsBody.ts:456](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L456)

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

[PhysicsBody.ts:460](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L460)

___

### area

• `get` **area**(): `number`

The area of the body's convex hull.

#### Returns

`number`

**`Remarks`**

This is a read-only property.

#### Defined in

[PhysicsBody.ts:444](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L444)

___

### body

• `get` **body**(): `Body`

#### Returns

`Body`

#### Defined in

[PhysicsBody.ts:322](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L322)

• `set` **body**(`body`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `body` | `Body` |

#### Returns

`void`

#### Defined in

[PhysicsBody.ts:329](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L329)

___

### damping

• `get` **damping**(): `number`

Friction due to air forces on the body, in the range [0, 1].

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[damping](../interfaces/PhysicsBodyOptions.md#damping)

#### Defined in

[PhysicsBody.ts:403](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L403)

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

[PhysicsBody.ts:399](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L399)

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

[PhysicsBody.ts:431](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L431)

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

[PhysicsBody.ts:435](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L435)

___

### entity

• `get` **entity**(): `Entity`

#### Returns

`Entity`

#### Defined in

[PhysicsBody.ts:350](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L350)

• `set` **entity**(`entity`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `Entity` |

#### Returns

`void`

#### Defined in

[PhysicsBody.ts:357](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L357)

___

### friction

• `get` **friction**(): `number`

Friction of the body, in the range [0, 1].

#### Returns

`number`

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[friction](../interfaces/PhysicsBodyOptions.md#friction)

#### Defined in

[PhysicsBody.ts:395](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L395)

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

[PhysicsBody.ts:391](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L391)

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

[PhysicsBody.ts:371](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L371)

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

[PhysicsBody.ts:361](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L361)

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

[PhysicsBody.ts:427](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L427)

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

[PhysicsBody.ts:423](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L423)

___

### physics

• `get` **physics**(): [`Physics`](Physics.md)

#### Returns

[`Physics`](Physics.md)

#### Defined in

[PhysicsBody.ts:311](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L311)

• `set` **physics**(`physics`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `physics` | [`Physics`](Physics.md) |

#### Returns

`void`

#### Defined in

[PhysicsBody.ts:318](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L318)

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

[PhysicsBody.ts:379](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L379)

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

[PhysicsBody.ts:375](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L375)

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

[PhysicsBody.ts:387](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L387)

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

[PhysicsBody.ts:383](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L383)

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

[PhysicsBody.ts:448](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L448)

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

[PhysicsBody.ts:452](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L452)

___

### velocity

• `get` **velocity**(): [`Vector`](../interfaces/Vector.md)

The velocity of the body.

#### Returns

[`Vector`](../interfaces/Vector.md)

#### Implementation of

[PhysicsBodyOptions](../interfaces/PhysicsBodyOptions.md).[velocity](../interfaces/PhysicsBodyOptions.md#velocity)

#### Defined in

[PhysicsBody.ts:333](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L333)

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

[PhysicsBody.ts:338](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L338)

## Methods

### applyImpulse

▸ **applyImpulse**(`impulse`, `at?`): `void`

Applies a force to the body in a single time step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `impulse` | [`Vector`](../interfaces/Vector.md) | force to apply as a vector. |
| `at?` | `Point` | the point at which to apply the impulse, relative to the body's position in scene coordinates. |

#### Returns

`void`

**`Remarks`**

if `at` is not specified, the force is applied at the body's current `position`.

#### Defined in

[PhysicsBody.ts:109](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L109)

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

[PhysicsBody.ts:128](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L128)

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

[PhysicsBody.ts:186](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L186)

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

[PhysicsBody.ts:156](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L156)

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

[PhysicsBody.ts:30](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsBody.ts#L30)
