import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

export default function MonacoEditor(props) {
  const editorRef = useRef();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const definitionUrls = [
      "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/core/index.d.ts",
      "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/addons/index.d.ts",
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
        // We need a unique path for each instance of the editor
        path={`index${props.consoleId}.ts`}
        defaultLanguage="javascript"
        value={props.monacoCode}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </>
  );
}
