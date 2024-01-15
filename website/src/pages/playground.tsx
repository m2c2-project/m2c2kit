import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import CodeEditor from "../components/CodeEditor";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import template from "raw-loader!@site/src/m2c2kit-index-html-templates/playground-template.html";
import SimpleIFrame from "../components/SimpleIFrame";
import Dropdown from "../components/Dropdown";
import useIsBrowser from "@docusaurus/useIsBrowser";

// see https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
function debounce(fn: () => void, ms: number) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, ms);
  };
}

export default function Home(): JSX.Element {
  const isBrowser = useIsBrowser();
  const { siteConfig } = useDocusaurusContext();
  const [code, setCode] = useState("");
  const [srcDoc, setSrcdoc] = useState("");
  const [rnd, setRnd] = useState("");

  /**
   * When building for production, we must check if this is a browser
   * environment before using window.
   */
  const initialDimensions = isBrowser
    ? {
        height: window.innerHeight,
        width: window.innerWidth,
      }
    : {
        height: 0,
        width: 0,
      };

  const [dimensions, setDimensions] = useState(initialDimensions);
  /**
   * In the production build, there is an oddity where if the playground
   * page is reloaded (or if the user directly navigates to the page),
   * the "dimensions" is not being set correctly. The below workaround seems
   * to fix it.
   */
  if (
    dimensions.width !== initialDimensions.width ||
    dimensions.height !== initialDimensions.height
  ) {
    setDimensions(initialDimensions);
  }

  useEffect(() => {
    if (isBrowser) {
      const handleResize = () => {
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth,
        });
      };

      const debouncedHandleResize = debounce(handleResize, 500);
      window.addEventListener("resize", debouncedHandleResize);
      return () => {
        window.removeEventListener("resize", debouncedHandleResize);
      };
    }
  });

  const updateCode = (codeString) => {
    setCode(codeString);
  };

  const runCode = (c?) => {
    const replacement = c === undefined ? code : c;
    const fullCode = template.replace(
      /\/\/ _-_BEGIN_CODE_REPLACEMENT_BLOCK_-_([\s\S]*?)\/\/ _-_END_CODE_REPLACEMENT_BLOCK_-_/,
      replacement,
    );
    setSrcdoc(fullCode);
    /**
     * Force the iframe to reload by setting rnd to a new value. The key
     * property on the SimpleIFrame component is bound to rnd.
     * https://stackoverflow.com/a/71108399
     */
    setRnd(Math.random().toString());
  };

  function calcIframeWidth(width: number) {
    if (width > 1080) {
      return 400;
    }
    return width * 0.4;
  }

  function calcIframeHeight(height: number) {
    return Math.min(height - 60 - 145 - 8 - 40, 800);
  }

  function calcCodeEditorWidth(width: number) {
    if (width > 1080) {
      return width - 400;
    }
    return dimensions.width * 0.6;
  }

  return (
    <>
      <Layout
        title={`${siteConfig.title}`}
        description="a library for cross-platform cognitive assessments"
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "300px" }}>
              <Dropdown
                isMulti={false}
                isSearchable={false}
                placeHolder="Load Code... (coming soon)"
                options={[
                  { value: "green", label: "Stroop" },
                  { value: "red", label: "Basic Assessment Scaffold" },
                ]}
                onChange={(value) => console.log(value)}
              />
            </div>
            <Link
              style={{ margin: "4px", height: "30px" }}
              className="button button--primary button--sm"
              onClick={() => runCode()}
            >
              Run
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div style={{ border: "2px solid black", margin: "0 4px 0 4px" }}>
              <SimpleIFrame
                key={rnd}
                width={calcIframeWidth(dimensions.width)}
                height={calcIframeHeight(dimensions.height)}
                srcDoc={srcDoc}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <CodeEditor
                updateCode={updateCode}
                width={calcCodeEditorWidth(dimensions.width) - 4 - 8}
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
