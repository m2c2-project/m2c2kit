import MonacoEditor from "./MonacoEditor";
import SimpleIFrame from "./SimpleIFrame";
import Link from "@docusaurus/Link";
import React, { useState } from "react";

export default function Playground(props) {
  // see https://dilshankelsen.com/call-child-function-from-parent-component-in-react/
  React.useEffect(() => {
    props.runCodeFunc.current = runCode;
  }, []);

  const [code, setCode] = useState("");
  const [srcDoc, setSrcdoc] = useState("");
  const [rnd, setRnd] = useState("");
  const updateCode = (codeString) => {
    setCode(codeString);
  };

  const runCode = (c?) => {
    // https://stackoverflow.com/a/71108399
    const replacement = c === undefined ? code : c;
    let fullCode = props.template.replace(
      /\/\/ _-_BEGIN_CODE_REPLACEMENT_BLOCK_-_([\s\S]*?)\/\/ _-_END_CODE_REPLACEMENT_BLOCK_-_/,
      replacement
    );
    if (props.consoleId) {
      fullCode = fullCode.replaceAll(
        "consoleId: undefined",
        `consoleId: "${props.consoleId}"`
      );
    }

    setSrcdoc(fullCode);
    setRnd(Math.random().toString());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link
          className="button button--primary button--sm"
          onClick={() => runCode()}
        >
          Run
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "4px",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <SimpleIFrame
          key={rnd}
          srcDoc={srcDoc}
          title=""
          width={props.iframeWidth}
          height={props.iframeHeight}
          border={props.iframeBorder}
        />
        <MonacoEditor
          consoleId={props.consoleId}
          updateCode={updateCode}
          runCode={runCode}
          monacoCode={props.editorCode}
          monacoWidth={props.editorWidth}
        />
      </div>
    </div>
  );
}
