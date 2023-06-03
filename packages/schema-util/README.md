# @m2c2kit/schema-util

This command line tool extracts the schema used in an m2c2kit assessment source file (TypeScript). Output format is CSV (default) or JSON.

This is useful to check what schema are being used in different assessments so we can enforce consistency in naming and structure.

Example:

```
node build/index.js list --schema=GameParameters --files=../assessment-grid-memory/src/index.ts --format=json > grid-memory-parameters.json
node build/index.js list --schema=GameParameters --files=../assessment-symbol-search/src/index.ts --format=json > symbol-search-parameters.json
node build/index.js list --schema=GameParameters --files=../assessment-color-shapes/src/index.ts --format=json > color-shapes-parameters.json
node build/index.js list --schema=GameParameters --files=../assessment-color-dots/src/index.ts --format=json > color-dots-parameters.json
```

or

```
node build/index.js list --schema=TrialSchema --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

or

```
node build/index.js list --schema=GameParameters --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

License: MIT
