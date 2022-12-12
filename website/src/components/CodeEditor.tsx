import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stroopExample from "!!raw-loader!@site/src/playground-code/stroop.js";

export default function CodeEditor(props) {
  const [monacoCode, setMonacoCode] = useState("");

  const editorRef = useRef();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const m2c2Modules = [
      {
        url: "/m2c2kit/declarations/m2c2kit/core/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/core/index.d.ts",
      },
      {
        url: "/m2c2kit/declarations/m2c2kit/addons/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/addons/index.d.ts",
      },
    ];

    m2c2Modules.map((m2c2Module) =>
      fetch(m2c2Module.url)
        .then((response) => response.text())
        .then((data) => {
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            data,
            m2c2Module.monacoUri
          );
        })
    );

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ES2020,
      noEmit: true,
    });

    const jsPlaygroundCode =
      localStorage.getItem("jsPlaygroundCode") ?? stroopExample;
    props.updateCode(jsPlaygroundCode);
    setMonacoCode(jsPlaygroundCode);
  }

  function handleEditorChange(value) {
    props.updateCode(value);
    localStorage.setItem("jsPlaygroundCode", value);
  }

  return (
    <Editor
      height="calc(100vh - var(--ifm-navbar-height) - 139px - 76px)"
      width={props.width}
      path="index.ts"
      defaultLanguage="javascript"
      value={monacoCode}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
    />
  );
}
