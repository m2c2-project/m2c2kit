import React, { useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
// @ts-expect-error ignore raw-loader typescript error
import stroopExample from "!!raw-loader!@site/src/playground-code/stroop.js";

/**
 * The CodeEditor component is used in the playground to display and edit
 * code.
 *
 * @param props
 * @returns CodeEditor component
 */
export default function CodeEditor(props) {
  const [monacoCode, setMonacoCode] = useState("");

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editorRef.current = editor;

    const m2c2Modules = [
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/core/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/core/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/addons/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/addons/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/session/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/session/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/db/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/db/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/physics/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/physics/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/modules/@m2c2kit/survey/dist/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/survey/index.d.ts",
      },
    ];

    m2c2Modules.map((m2c2Module) =>
      fetch(m2c2Module.url)
        .then((response) => response.text())
        .then((data) => {
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            data,
            m2c2Module.monacoUri,
          );
        }),
    );

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
    });
    /**
     * The following is how we could enable some diagnostics for the
     * JavaScript code in the Monaco editor. We don't use it, however, because
     * it is quite aggressive and can be annoying for new learners.
     * Specifically, it doesn't seem to pick up on the type narrowing in some
     * configuration objects using string literals (e.g., schema), which can
     * lead to a lot of false positives.
     */
    //  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    //    noSemanticValidation: false,
    //    noSyntaxValidation: false,
    //  });
    editor.getModel().updateOptions({ tabSize: 2 });

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
