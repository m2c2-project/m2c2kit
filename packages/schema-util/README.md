# @m2c2kit/schema-util

This command line tool extracts the schema used in an m2c2kit assessment source file (TypeScript). Output format is csv (default), json, or json-schema.

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
node build/index.js list --schema=TrialSchema --game-class=../core/src/Game.ts --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

or

```
node build/index.js list --schema=GameParameters --files=../assessment-grid-memory/src/index.ts,../assessment-symbol-search/src/index.ts,../assessment-color-shapes/src/index.ts,../assessment-color-dots/src/index.ts > schemas.csv
```

or

```
node build/index.js list --schema=GameParameters --files=../assessment-grid-memory/src/index.ts --format=json-schema --title="Configurable game parameters for Grid Memory version __VERSION__"
node build/index.js list --schema=TrialSchema --game-class=../core/src/Game.ts --files=../assessment-grid-memory/src/index.ts --format=json-schema --title="Trial data for Grid Memory version __VERSION__"
```

License: MIT
