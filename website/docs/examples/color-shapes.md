---
sidebar_position: 2
hide_table_of_contents: true
---

import ExampleAssessment from '@site/src/components/ExampleAssessment';

# Color Shapes

Color Shapes is a change detection paradigm used to measure visual short-term memory binding.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/example-template.html';
export const code = `import { ColorShapes } from "/m2c2kit/lib/m2c2kit.assessment-color-shapes.esm.min.js";
const activity = new ColorShapes();
activity.setParameters({show_quit_button: false});`;

<ExampleAssessment template={template} code={code}/>

References:
