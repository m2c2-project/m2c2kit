---
sidebar_position: 2
hide_table_of_contents: true
---

import ExampleAssessment from '@site/src/components/ExampleAssessment';

# Color Shapes

Color Shapes is a visual array change detection task, measuring intra-item feature binding, where participants determine if shapes change color across two sequential presentations of shape stimuli. (Construct: Visual Working Memory, Associative Memory)

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/example-template.html';
export const code = `import { ColorShapes } from "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/lib/m2c2kit.assessment-color-shapes.esm.min.js";
const activity = new ColorShapes();
activity.setParameters({show_quit_button: false});`;

<ExampleAssessment template={template} code={code}/>

References:
