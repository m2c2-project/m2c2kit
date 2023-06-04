---
sidebar_position: 3
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# m2c2kit internals

To learn how to write trial schema, we have to expose a little bit more of the inner workings of m2c2kit. 

:::tip

If this section is confusing, don't worry. Just think of all of this as a template for where you put your schema, options, and assessment code. You can follow the template and write sophisticated assessments without understanding all these programming concepts. 

:::

## The `Game` class

To write m2c2kit assessments, we build upon (extend) a class called `Game`. Up to this point, the example code has hidden this detail. Think of this class as a blueprint or template that already has lots of built-in functionality for working with assessments.

There are two important methods (a group of code that can be called) on the `Game` class:

- `constructor()` - This is where you define the options, including the trial schema, for your assessment.
- `init()` - This is where you set up (or initialize) your assessment.

:::note

All the example code you've seen up to this point has simply been the code that was inside the `init()` method. You've been coding this method all along, without even realizing it!

:::


## The `Game` class in action

Let's look at an example of how the `Game` class is used. A few things to point out:

- To create a new assessment, we define a new class that builds on ("extends") the `Game` class. When you write your own assessments, it doesn't matter what you name it,[^1] because the user will never see its name. In this example, we call it `DocsDemo`:
```js
class DocsDemo extends Game {
```

- Within the `constructor()`, we define a variable to contain our schema, called `demoSchema`. The schema has a variable called `trial_index` that is an integer; this will record in our data which trial the user is on. We also define a variable called `mobile_research_fun` that is a boolean (true or false) value of how the user answers our question.

```js
const demoSchema = {
    trial_index: {
        type: "integer",
        description: "Index of the trial within this assessment, 0-based.",
    },
    mobile_research_fun: {
        type: "boolean",
        description: "User response to question about mobile research being fun.",
    }
}
```

- Within the `constructor()`, we define a variable for overall game options, called `options`. We will learn more about this later, but for now, just know that the `id` for this simple example is `docs`, its `name` is `Documentation Example`, we define the size of our game screen as 200 wide by 400 high, we will use Roboto font for our labels, and we set the schema for all of our game's trials to be what we put in the `demoSchema` variable:

```js
const options = {
    name: "Documentation Example",
    id: "docs",
    width: 200, height: 400,
    fonts: [{
	    fontName: "roboto",
	    url: "fonts/roboto/Roboto-Regular.ttf"
    }],
    trialSchema: demoSchema
};
```

- The last line of the constructor has the code `super(options)`. This is how we get all the built-in functionality of the `Game` class. Just always remember to include this at the end of your constructor.

- Within the `init()`, we write our assessment code, as we have been doing all along. The only difference is the first two lines: `await super.init()` runs some built-in setup code. `const game = this` allows us to conveniently refer to the game object (this was hidden from you in the previous examples). 

```js
async init() {
    await super.init();
    const game = this;
    const sceneOne = new Scene({ backgroundColor: WebColors.PaleTurquoise });
    game.addScene(sceneOne);
}
```

So far, our assessment doesn't do much, other than make the scene background a light turquoise. But, it defined a trial schema that is ready to accept data!

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template-with-constructor.html';
export const code = `class DocsDemo extends Game {
 
    constructor() {
        const demoSchema = {
            trial_index: {
                type: "integer",
                description: "Index of the trial within this assessment, 0-based.",
            },
            mobile_research_fun: {
                type: "boolean",
                description: "User response to question about mobile research being fun.",
            }
        }
 
        const options = {
            name: "Documentation Example",
            id: "docs",
            width: 200, height: 400,
            fonts: [{
	            fontName: "roboto",
	            url: "fonts/roboto/Roboto-Regular.ttf"
            }],            
            trialSchema: demoSchema
        };
        super(options);
    }
 
    async init() {
        await super.init();
        const game = this;
        const sceneOne = new Scene({ backgroundColor: WebColors.PaleTurquoise });
        game.addScene(sceneOne);
    }
}`;

<CodeExample code={code} template={template} console={"true"}/>

[^1]: For the tutorials, however, *do not* change the class name (`DocsDemo`) or the value of `id` specified in `options`! This tutorial website engine expect the class name to be `DocsDemo`, and the value of `id` to be `docs`, and it will not work if you rename these.

