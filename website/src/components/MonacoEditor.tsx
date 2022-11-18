import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

export default function MonacoEditor(props) {
  const editorRef = useRef();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const definitionUrls = [
      "/m2c2kit/declarations/m2c2kit/core/index.d.ts",
      "/m2c2kit/declarations/m2c2kit/addons/index.d.ts",
    ];

    definitionUrls.map((url) =>
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          data = data.replace(/^import.*/, "");
          data = data.replace(/\nimport.*/g, "");
          data = data.replace(/\nexport.*/g, "");
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            data,
            "file:///" + url
          );
        })
    );

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      "declare const game: Game",
      "file:///game.js"
    );

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ES2020,
      noEmit: true,
    });
    props.updateCode(props.monacoCode);
    props.runCode(props.monacoCode);
  }

  function handleEditorChange(value) {
    props.updateCode(value);
  }

  return (
    <>
      <Editor
        height="400px"
        width={props.monacoWidth}
        path="index.ts"
        defaultLanguage="javascript"
        value={props.monacoCode}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </>
  );
}
