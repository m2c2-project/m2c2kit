---
id: "PhysicsEvent"
title: "Interface: PhysicsEvent"
sidebar_label: "PhysicsEvent"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `EventBase`

  ↳ **`PhysicsEvent`**

## Properties

### bodyA

• **bodyA**: [`PhysicsBody`](../classes/PhysicsBody.md)

#### Defined in

[physics/src/Physics.ts:33](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L33)

___

### bodyB

• **bodyB**: [`PhysicsBody`](../classes/PhysicsBody.md)

#### Defined in

[physics/src/Physics.ts:34](https://github.com/m2c2-project/m2c2kit/blob/58de0ab/packages/physics/src/Physics.ts#L34)

___

### handled

• `Optional` **handled**: `boolean`

Has the event been taken care of by the listener and not be dispatched to other targets?

#### Inherited from

EventBase.handled

#### Defined in

core/dist/index.d.ts:1693

___

### target

• **target**: `Entity` \| `Session` \| `Activity` \| `Plugin`

The object on which the event occurred.

#### Inherited from

EventBase.target

#### Defined in

core/dist/index.d.ts:1691

___

### type

• **type**: `string`

Type of event.

#### Inherited from

EventBase.type

#### Defined in

core/dist/index.d.ts:1689
