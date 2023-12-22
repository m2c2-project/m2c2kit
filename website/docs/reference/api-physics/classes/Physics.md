---
id: "Physics"
title: "Class: Physics"
sidebar_label: "Physics"
sidebar_position: 0
custom_edit_url: null
---

Physics functionality, based on the Matter.js engine.

## Constructors

### constructor

• **new Physics**(`options`): [`Physics`](Physics.md)

Creates an instance of the physics engine.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`PhysicsOptions`](../interfaces/PhysicsOptions.md) | [PhysicsOptions](../interfaces/PhysicsOptions.md) |

#### Returns

[`Physics`](Physics.md)

**`Remarks`**

This must be called early in the game's initialize() method.

**`Example`**

```ts
async initialize() {
  await super.initialize();
  const game = this;
  const physics = new Physics(game, { showsPhysics: true });
  ...
}
```

#### Defined in

[Physics.ts:53](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L53)

## Properties

### \_gravity

• `Private` **\_gravity**: [`Vector`](../interfaces/Vector.md)

#### Defined in

[Physics.ts:35](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L35)

___

### bodiesDictionary

• **bodiesDictionary**: `PhysicsBodiesDictionary` = `{}`

#### Defined in

[Physics.ts:32](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L32)

___

### cumulativeFrameSimulationTime

• `Private` **cumulativeFrameSimulationTime**: `number` = `0`

#### Defined in

[Physics.ts:37](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L37)

___

### engine

• **engine**: `Engine`

#### Defined in

[Physics.ts:31](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L31)

___

### framesSimulatedCount

• `Private` **framesSimulatedCount**: `number` = `0`

#### Defined in

[Physics.ts:36](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L36)

___

### options

• **options**: [`PhysicsOptions`](../interfaces/PhysicsOptions.md)

#### Defined in

[Physics.ts:33](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L33)

## Accessors

### gravity

• `get` **gravity**(): [`Vector`](../interfaces/Vector.md)

Vector that specifies the gravity to apply to all physics bodies.
Default is &#123; dx: 0, dy: 1 &#125;

#### Returns

[`Vector`](../interfaces/Vector.md)

#### Defined in

[Physics.ts:191](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L191)

• `set` **gravity**(`gravity`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `gravity` | [`Vector`](../interfaces/Vector.md) |

#### Returns

`void`

#### Defined in

[Physics.ts:214](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L214)

## Methods

### addEngineUpdateCallback

▸ **addEngineUpdateCallback**(`game`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `game` | `Game` |

#### Returns

`void`

#### Defined in

[Physics.ts:220](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L220)

___

### initializePhysicsBodies

▸ **initializePhysicsBodies**(`entities`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities` | `Entity`[] |

#### Returns

`void`

#### Defined in

[Physics.ts:246](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L246)

___

### logAverageFrameUpdateDuration

▸ **logAverageFrameUpdateDuration**(): `void`

#### Returns

`void`

#### Defined in

[Physics.ts:257](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L257)

___

### modifyEntityProperties

▸ **modifyEntityProperties**(): `void`

#### Returns

`void`

#### Defined in

[Physics.ts:64](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L64)

___

### updateEntitiesFromPhysicsBodies

▸ **updateEntitiesFromPhysicsBodies**(`entities`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities` | `Entity`[] |

#### Returns

`void`

#### Defined in

[Physics.ts:236](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/Physics.ts#L236)
