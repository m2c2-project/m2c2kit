---
id: nodes
sidebar_position: 2
hide_table_of_contents: true
---

# Nodes

A node is the basic[^1] building block in m2c2kit. A node is a graphical object that can be displayed on the screen. Nodes can be moved, rotated, and scaled. Nodes can also be animated, and they can respond to user input.

Nodes have a hierarchical structure. A node can be a container for other nodes, which allows you to create compound objects by combining simple nodes into more complex ones. 

:::tip

Graphical primitives, such as scenes, shapes, labels, and sprites, are all different types of nodes, each with their own specific properties and methods.

In m2c2kit, _everything_ you see on the screen is some type of node.

:::

[^1]: For those with object-oriented programming experience, think of a node as a base class for all graphical objects in m2c2kit. Specifically, `M2Node` is an abstract class from which all other graphical objects are derived. The class name for an m2c2kit node is `M2Node`, rather than `Node`, to avoid conflicts with the [DOM `Node` class](https://developer.mozilla.org/en-US/docs/Web/API/Node).