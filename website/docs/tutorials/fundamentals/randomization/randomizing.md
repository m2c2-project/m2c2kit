---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Randomizing Assessments

Rarely is everything in an assessment the same across repeated administrations or trials. Experiments often need variations in the stimuli, the order of the stimuli, or the timing of the stimuli. m2c2kit has helper randomization methods for common randomization tasks. These methods are available in the `RandomDraws` class.

## A single random integer

For a single random integer, use the `RandomDraws.SingleFromRange()` method. This method takes `minimumInclusive` and `maximumInclusive` arguments, and returns a random integer between those two values, inclusive.

This code returns a random integer between 1 and 10, inclusive:

```js
const randomInteger = RandomDraws.SingleFromRange(1, 10);
```

## Multiple random integers

For multiple random integers, use the `RandomDraws.FromRangeWithoutReplacement()` method. This method takes `n`, `minimumInclusive`, and `maximumInclusive` arguments. It returns an array of `n` integers between those two values, inclusive. The integers are unique, meaning that no integer is repeated in the array.

This code returns an array of 4 integers between 1 and 24, inclusive:

```js
const randomIntegers = RandomDraws.FromRangeWithoutReplacement(4, 1, 24);
```

## Random words and colors

Below, we randomly choose two unique words from a word bank of 8 possible words. We then randomly assign the same color to both words from a bank of 4 colors.

Arrays in JavaScript are 0-based. For example, to choose 2 words from a word bank of 8 words, we need to choose 2 integers between 0 and 7, inclusive. These two random integers are then used to index into the word bank array.

Click the "Run" button multiple times to see how the words and colors change.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.Azure });
game.addScene(sceneOne);
 
const wordBank = ["tree", "dog", "tea", "pizza", "world", "jazz", "ocean", "Chicago"];
const colorBank = [WebColors.Maroon, WebColors.Teal, WebColors.DarkBlue, WebColors.DarkOliveGreen];
 
const wordIndexes = RandomDraws.FromRangeWithoutReplacement(2, 0, 7);
const colorIndex = RandomDraws.SingleFromRange(0, 3);
 
const word1 = new Label({
    text: wordBank[wordIndexes[0]],
    fontColor: colorBank[colorIndex],
    fontSize: 32,
    position: { x: 100, y: 150 }
});
sceneOne.addChild(word1);
 
const word2 = new Label({
    text: wordBank[wordIndexes[1]],
    fontColor: colorBank[colorIndex],
    fontSize: 32,
    position: { x: 100, y: 250 }
});
sceneOne.addChild(word2);`;

<CodeExample code={code} template={template}/>
