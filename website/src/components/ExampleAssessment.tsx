import SimpleIFrame from "./SimpleIFrame";
import React from "react";

export default function ExampleAssessment(props) {
  const fullCode = props.template.replace(
    /\/\/ _-_BEGIN_CODE_REPLACEMENT_BLOCK_-_([\s\S]*?)\/\/ _-_END_CODE_REPLACEMENT_BLOCK_-_/,
    props.code
  );

  return (
    <div>
      <SimpleIFrame
        srcDoc={fullCode}
        // 4 px more for borders
        width="404"
        height="804"
        border="2px solid black"
      />
    </div>
  );
}
