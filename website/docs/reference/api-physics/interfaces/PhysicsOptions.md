---
id: "PhysicsOptions"
title: "Interface: PhysicsOptions"
sidebar_label: "PhysicsOptions"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### game

• **game**: `Game`

The game instance to apply physics to.

#### Defined in

[PhysicsOptions.ts:8](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L8)

___

### gravity

• `Optional` **gravity**: [`Vector`](Vector.md)

Vector that specifies the gravity to apply to all physics bodies. Default is &#123; dx: 0, dy: 1 &#125;

#### Defined in

[PhysicsOptions.ts:28](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L28)

___

### logEngineStats

• `Optional` **logEngineStats**: `boolean`

Whether to log the average time it takes to update the physics engine each frame.

#### Defined in

[PhysicsOptions.ts:24](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L24)

___

### showsPhysics

• `Optional` **showsPhysics**: `boolean`

Whether or not to show the physics bodies in the game by drawing an outline around them.

#### Defined in

[PhysicsOptions.ts:12](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L12)

___

### showsPhysicsLineWidth

• `Optional` **showsPhysicsLineWidth**: `number`

The width of the physics body outline. Defaults to 1.

#### Defined in

[PhysicsOptions.ts:20](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L20)

___

### showsPhysicsStrokeColor

• `Optional` **showsPhysicsStrokeColor**: `RgbaColor`

The color of the physics body outline. Defaults to green.

#### Defined in

[PhysicsOptions.ts:16](https://github.com/m2c2-project/m2c2kit/blob/c6627d5/packages/physics/src/PhysicsOptions.ts#L16)
