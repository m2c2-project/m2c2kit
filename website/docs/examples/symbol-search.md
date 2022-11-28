---
sidebar_position: 1
hide_table_of_contents: true
---

import ExampleAssessment from '@site/src/components/ExampleAssessment';

# Symbol Search

Symbol Search is a test of processing speed, where participants see a row of symbol pairs at the top of the screen and match them to symbol pairs at the bottom of the screen.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/example-template.html';
export const code = `import { SymbolSearch } from "/m2c2kit/lib/m2c2kit.assessment-symbol-search.esm.min.js";
const activity = new SymbolSearch();
activity.setParameters({show_quit_button: false});`;

<ExampleAssessment template={template} code={code}/>

References:

- Deary, I.J., Johnson, W., & Starr, J.M. (2010). Are processing speed tasks biomarkers of cognitive aging? *Psychology and Aging*, 25(1), 219-228.
- Sliwinski, M.J., Mogle, J.A., Hyun, J., Munoz, E., Smyth, J.M., & Lipton, R.B. (2018). Reliability and validity of ambulatory cognitive assessments. *Assessment*, 25(1), 14-30.
