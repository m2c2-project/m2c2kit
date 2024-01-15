---
sidebar_position: 1
hide_table_of_contents: true
---

import ExampleAssessment from '@site/src/components/ExampleAssessment';

# Symbol Search

Symbol Search is a speeded continuous performance test of conjunctive feature search in which respondents identify matching symbol pairs as quickly and as accurately as they can. (Construct: Attention, speeded performance)

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/example-template.html';
export const code = `import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
const activity = new SymbolSearch();
activity.setParameters({show_quit_button: false});`;

<ExampleAssessment template={template} code={code}/>

References:

- Deary, I.J., Johnson, W., & Starr, J.M. (2010). Are processing speed tasks biomarkers of cognitive aging? *Psychology and Aging*, 25(1), 219-228.
- Sliwinski, M.J., Mogle, J.A., Hyun, J., Munoz, E., Smyth, J.M., & Lipton, R.B. (2018). Reliability and validity of ambulatory cognitive assessments. *Assessment*, 25(1), 14-30.
