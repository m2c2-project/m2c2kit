---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Trial Data

In cognitive assessments, a typical way to record data is to store multiple trials of an assessment. Each trial has a similar data structure. m2c2kit has capabilities to make it easy to work with trial data:

- The variable `trialIndex` keeps track of the trial number. This is [0-based](https://en.wikipedia.org/wiki/Zero-based_numbering), so the first trial is number 0.
- The method `addTrialData()` adds data to the current trial.
- The method `trialComplete()` marks the current trial as complete. This method also increments the `trialIndex` variable.

Each of the above are properties or methods on the m2c2kit `Game` object. Thus, you would access the trial index with `game.trialIndex` and mark the trial as complete with `game.trialComplete()`. The `addTrialData()` method takes arguments, which we explain below.

## Adding trial data

The `addTrialData()` method takes two arguments:

- The variable name to which you are adding data. This is a string, and it must match a variable name defined in the schema.
- The value to add to the variable. This can be any value that is valid for the variable type. For example, if the schema defined variable is a number, then the value must be a number.

For example, if your schema defined the variable `response_time_duration_ms` as a number, and the user took 529 milliseconds to respond, then you would add data to that variable with `game.addTrialData("response_time_duration_ms", 529)`.[^1]

If you try to add a value that does not match the schema, then m2c2kit will throw an error. Assuming that `response_time_duration_ms` was defined as a number, the below statements would throw an error:

- `game.addTrialData("response_time_duration_ms", false)`
- `game.addTrialData("response_time_duration_ms", null)`
- `game.addTrialData("response_time_duration_ms", "529")`

[^1]: This is a contrived example. It would be very unusual to provide an actual number, `529`, in your code. In practice, the user's response time would be coming from another variable in your code, such as `rt`, and your code would be adding that to the schema with `game.addTrialData("response_time_duration_ms", rt)`.

