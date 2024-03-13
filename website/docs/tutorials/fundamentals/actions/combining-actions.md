---
sidebar_position: 9
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Combining Actions

Often times you need more than a single Action to occur. For example, you may want to move a node in one direction, wait for a specific duration, then move in another direction. There are two ways to combine Actions: 

1. You can run multiple actions in order: a sequence.
2. You can run multiple actions at the same time: a group.

These two Actions, `Action.sequence()` and `Action.group()`, are special because they don't perform any game actions themselves. Instead, they simply hold other Actions and run them in sequence or as a group. Because they hold other actions, you can nest them in arbitrarily complex ways.
