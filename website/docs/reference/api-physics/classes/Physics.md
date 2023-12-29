---
id: "Physics"
title: "Class: Physics"
sidebar_label: "Physics"
sidebar_position: 0
custom_edit_url: null
---

Physics functionality plugin

**`Remarks`**

Based on the Matter.js engine.

## Implements

- `Plugin`

## Constructors

### constructor

• **new Physics**(`options?`): [`Physics`](Physics.md)

Creates an instance of the physics engine.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`PhysicsOptions`](../interfaces/PhysicsOptions.md) | [PhysicsOptions](../interfaces/PhysicsOptions.md) |

#### Returns

[`Physics`](Physics.md)

**`Remarks`**

The constructor must be called early in the game's `initialize()`
method because it adds properties to the `Entity` class for physics
functionality. These properties will not be available to entities before
the physics plugin is created.

**`Example`**

```ts
async initialize() {
  await super.initialize();
  const game = this;
  const physics = new Physics({ showsPhysics: true })
  await game.registerPlugin(physics);
  ...
}
```

#### Defined in

[physics/src/Physics.ts:73](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L73)

## Properties

### \_game

• `Private` `Optional` **\_game**: `Game`

#### Defined in

[physics/src/Physics.ts:49](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L49)

___

### \_gravity

• `Private` **\_gravity**: [`Vector`](../interfaces/Vector.md)

#### Defined in

[physics/src/Physics.ts:48](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L48)

___

### bodiesDictionary

• **bodiesDictionary**: `PhysicsBodiesDictionary` = `{}`

#### Defined in

[physics/src/Physics.ts:45](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L45)

___

### cumulativeFrameSimulationTime

• `Private` **cumulativeFrameSimulationTime**: `number` = `0`

#### Defined in

[physics/src/Physics.ts:51](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L51)

___

### engine

• **engine**: `Engine`

#### Defined in

[physics/src/Physics.ts:44](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L44)

___

### eventListeners

• `Private` **eventListeners**: [`PhysicsEventListener`](../interfaces/PhysicsEventListener.md)[]

#### Defined in

[physics/src/Physics.ts:52](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L52)

___

### framesSimulatedCount

• `Private` **framesSimulatedCount**: `number` = `0`

#### Defined in

[physics/src/Physics.ts:50](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L50)

___

### id

• **id**: `string` = `"physics-matter-js"`

#### Implementation of

Plugin.id

#### Defined in

[physics/src/Physics.ts:43](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L43)

___

### options

• **options**: [`PhysicsOptions`](../interfaces/PhysicsOptions.md)

#### Defined in

[physics/src/Physics.ts:46](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L46)

## Accessors

### game

• `get` **game**(): `Game`

#### Returns

`Game`

#### Defined in

[physics/src/Physics.ts:375](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L375)

• `set` **game**(`game`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `game` | `Game` |

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:382](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L382)

___

### gravity

• `get` **gravity**(): [`Vector`](../interfaces/Vector.md)

Vector that specifies the gravity to apply to all physics bodies.
Default is &#123; dx: 0, dy: 1 &#125;

#### Returns

[`Vector`](../interfaces/Vector.md)

#### Defined in

[physics/src/Physics.ts:390](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L390)

• `set` **gravity**(`gravity`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `gravity` | [`Vector`](../interfaces/Vector.md) |

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:413](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L413)

## Methods

### addEventListener

▸ **addEventListener**(`type`, `callback`, `callbackOptions?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`PhysicsEventType`](../modules.md#physicseventtype-1) |
| `callback` | (`ev`: [`PhysicsEvent`](../interfaces/PhysicsEvent.md)) => `void` |
| `callbackOptions?` | `CallbackOptions` |

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:102](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L102)

___

### afterUpdate

▸ **afterUpdate**(`game`, `deltaTime`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `game` | `Game` |
| `deltaTime` | `number` |

#### Returns

`void`

#### Implementation of

Plugin.afterUpdate

#### Defined in

[physics/src/Physics.ts:88](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L88)

___

### configureEventListeners

▸ **configureEventListeners**(): `void`

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:161](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L161)

___

### getPhysicsBodiesFromCollisionEvent

▸ **getPhysicsBodiesFromCollisionEvent**(`event`): `Object`

Returns the Physics Bodies (A & B) involved in a collision event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `IEventCollision`\<`Engine`\> | Matter.js collision event |

#### Returns

`Object`

bodyA and bodyB PhysicsBody objects

| Name | Type |
| :------ | :------ |
| `bodyA` | [`PhysicsBody`](PhysicsBody.md) |
| `bodyB` | [`PhysicsBody`](PhysicsBody.md) |

**`Remarks`**

the Matter.js collision event has the the bodies as
Matter.Body type. This method get their corresponding wrappers as
PhysicsBody type.

#### Defined in

[physics/src/Physics.ts:205](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L205)

___

### initialize

▸ **initialize**(`game`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `game` | `Game` |

#### Returns

`Promise`\<`void`\>

#### Implementation of

Plugin.initialize

#### Defined in

[physics/src/Physics.ts:84](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L84)

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

[physics/src/Physics.ts:429](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L429)

___

### logAverageFrameUpdateDuration

▸ **logAverageFrameUpdateDuration**(): `void`

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:440](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L440)

___

### modifyEntityProperties

▸ **modifyEntityProperties**(): `void`

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:229](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L229)

___

### onContactBegin

▸ **onContactBegin**(`callback`, `options?`): `void`

Executes a callback when physics bodies begin to contact each other.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`ev`: [`PhysicsEvent`](../interfaces/PhysicsEvent.md)) => `void` | callback function to be called when a contact begins. |
| `options?` | `CallbackOptions` | CallbackOptions |

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:133](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L133)

___

### onContactEnd

▸ **onContactEnd**(`callback`, `options?`): `void`

Executes a callback when physics bodies end contact with other.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`ev`: [`PhysicsEvent`](../interfaces/PhysicsEvent.md)) => `void` | callback function to be called when a contact ends |
| `options?` | `CallbackOptions` | CallbackOptions |

#### Returns

`void`

#### Defined in

[physics/src/Physics.ts:150](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L150)

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

[physics/src/Physics.ts:419](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L419)
