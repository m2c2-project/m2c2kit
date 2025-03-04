# @m2c2kit/schema-util

This command line tool extracts the schema used in an m2c2kit assessment source file (TypeScript). This is meant to be used by assessment authors to generate a schema file that can be consumed for use cases such as data analysis, assessment configuration, and code book creation. It is also a way to check what schema are being used in different assessments so we can enforce consistency in naming and structure.

It is convenient if this tool is installed globally, i.e., `npm install -g @m2c2kit/schema-util`.

## Usage

- Output format is specified with `--format` option and can be `csv` (default), `json`, or `json-schema`.
- The requested schema is specified with `--schema` and can be `GameParameters`, `TrialSchema`, or `all`. Note: `all` is supported only for format `json-schema`.
- The source file(s) to be analyzed are specified with `--files` option. Multiple files can be specified separated by commas. Note: multiple source files are not supported for format `json-schema`.
- The `--title` option specifies the title of the schema when used with format `json-schema`. The string `__VERSION__` in the title will be replaced by the actual version from the assessment's `package.json`.

## Examples

The below assumes the tool is installed globally and the current directory is the root of the m2c2kit repository

- Extract the game parameters schema used in an assessment to JSON:

```
schema-util list --schema=GameParameters --files=packages/assessment-symbol-search/src/index.ts --format=json > symbol-search-parameters.json
```

- Extract the trial data schema used in four different assessments to CSV:

```
schema-util list --schema=TrialSchema --files=packages/assessment-grid-memory/src/index.ts,packages/assessment-symbol-search/src/index.ts,packages/assessment-color-shapes/src/index.ts,packages/assessment-color-dots/src/index.ts > schemas.csv
```

- Extract both GameParameters and TrialSchema (`--schema=all`) from an assessment to a single file as JSON schema. Include the version in the title:

```
schema-util list --schema=all --files=packages/assessment-symbol-search/src/index.ts --format=json-schema --title="Configurable game parameters for Grid Memory version __VERSION__" > symbol-search-schemas.json
```

License: Apache-2.0
