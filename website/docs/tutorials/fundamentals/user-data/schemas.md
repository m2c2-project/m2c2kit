---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# The Need for Schemas

The data is the main reason to create an assessment. It is critical to have a complete understanding of the data: what the variable names are, what the variables represent, and what their types are (numbers, strings, etc). Think of the times you've been given a comma-separated-values (CSV) file with no documentation. Using data without supporting information is challenging because data, on their own, are ambiguous. You have no idea what the columns mean, what the data types are, or what the units are. This is where schemas come in.

## What is a Schema?

A schema is a way to define the structure of your data. Schema is a general term, because there is no single schema for all kinds of data. Rather, you choose a schema that is appropriate for your needs.

## JSON Schema

m2c2kit uses the [JSON Schema](https://json-schema.org/) standard to describe its data.[^1]

> The nice thing about standards is that you have so many to choose from.
>
> — Andrew Tanenbaum and/or Grace Hopper

Although there are others schemas m2c2kit could have used, JSON Schema has several advantages:

1. JSON is a common way to store and pass data between systems. JSON Schema fully describes these data.
2. JSON Schema is a widely used standard. This means that there is a rich ecosystem of tools that can work with it.
3. JSON Schema can be very descriptive. It defines not just variable names, but other metadata. This makes it an ideal way to define scientific data.

## A sample m2c2kit schema

```js
const demoSchema = {
  activity_begin_iso8601_timestamp: {
    type: "string",
    description:
      "ISO 8601 timestamp at the beginning of the game activity.",
  },
  trial_index: {
    type: ["integer", "null"],
    description: "Index of the trial within this assessment, 0-based. Null if trial was skipped.",
  },
  response_time_duration_ms: {
    type: ["number", "null"],
    description:
      "Milliseconds from the beginning of the trial until a user taps a response. Null if trial was skipped.",
  },
  user_response_correct: {
    type: ["boolean", "null"],
    description: "Was the user's response correct? Null if trial was skipped.",
  },
  quit_button_pressed: {
    type: "boolean",
    description: "Was the quit button pressed?",
  },
};
```

The m2c2kit schema is written by you so that consumers of your data know what the data mean. The schema is a JSON object with keys that are the variable names and values that are the variable metadata. For example, this example schema guarantees (promises) that the `activity_begin_iso8601_timestamp` variable will be a string. We also provide a description of what the variable represents. The `trial_index` variable will be an integer, or it might be null. The description explains what the integer and null values are.

:::tip

Write rich descriptions. The more information you provide, the easier it will be for others to use your data -- and easier for *you*, when you return to the data later!

:::

In addition, the m2c2kit schema is used to validate the data collection as the assessment runs. If we try to collect data that does not match the schema (e.g., storing "two" instead of the number 2 in `trial_index`), m2c2kit will loudly throw an error message and stop. This is an important protection, because it would be disastrous for a project if the assessment silently continued to collect bad data or failed to collect data at all.

On a style note, it is recommended that your schema variables are named according to [snake_case](https://en.wikipedia.org/wiki/Snake_case). This is because these are the same variable names that users will see when using data analysis software, such as R or Python, and snake case is the convention in data science.

[^1]: To be precise, m2c2kit schema is a fully compatible subset of JSON Schema. JSON Schema is a massive, complex standard. m2c2kit schema is only a subset to keep things simple.