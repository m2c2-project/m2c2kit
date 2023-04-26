# @m2c2kit/schema-util

This command line tool extracts the schema used in an m2c2kit assessment source file (TypeScript). Output is in CSV format.

This is useful to check what schema are being used in different assessments so we can enforce consistency in naming and structure.

Example:

```
node build/index.js list --schema=TrialSchema --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

or

```
node build/index.js list --schema=GameParameters --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

License: MIT
