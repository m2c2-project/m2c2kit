import React, { useState, useRef, useEffect } from "react";
import Playground from "@site/src/components/Playground";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export function Change(props) {
  return (
    <a className="change-code" onClick={() => props.changeCode(props.newCode)}>
      {props.children}
    </a>
  );
}

export interface RichFormat {
  type: string;
  open: string;
  close: string;
}

export function Explore(props) {
  return (
    props.examples?.length > 0 && (
      <div style={{ marginTop: "1rem" }}>
        <b>Explore:</b>
        <br />
        <ul>
          {props.examples.map((example, index) => {
            return (
              <li key={index}>
                {/* if there is only one child, then children is not an array!
                Make it into an array, so we can map over it */}
                {(Array.isArray(example.description.props.children)
                  ? example.description.props.children
                  : [example.description.props.children]
                ).map((child) => {
                  if (typeof child === "string") {
                    let pieces = [];
                    let pieceCount = 1;
                    let currentFormat: RichFormat = {
                      type: "none",
                      open: "",
                      close: "",
                    };

                    pieces.push({
                      format: currentFormat,
                      text: "",
                    });

                    const formats: Array<RichFormat> = [
                      { type: "link", open: "[", close: "]" },
                      { type: "code", open: "`", close: "`" },
                    ];

                    for (let i = 0; i < child.length; i++) {
                      const char = child[i];

                      if (currentFormat.type !== "none") {
                        if (char === currentFormat.close) {
                          const piece = pieces[pieceCount - 1];
                          piece.text += char;
                          piece.text = piece.text
                            .replaceAll(currentFormat.open, "")
                            .replaceAll(currentFormat.close, "");
                          pieces[pieceCount - 1] = piece;

                          currentFormat = {
                            type: "none",
                            open: "",
                            close: "",
                          };
                          pieces.push({
                            format: currentFormat,
                            text: "",
                          });
                          pieceCount++;
                          continue;
                        } else {
                          const piece = pieces[pieceCount - 1];
                          piece.text += char;
                          piece.format = currentFormat.type;
                          pieces[pieceCount - 1] = piece;
                        }
                      } else {
                        for (let j = 0; j < formats.length; j++) {
                          const format = formats[j];
                          if (char === format.open) {
                            currentFormat = format;
                            pieces.push({
                              format: currentFormat.type,
                              text: "",
                            });
                            pieceCount++;
                            break;
                          }
                        }
                        const piece = pieces[pieceCount - 1];
                        piece.text += char;
                        pieces[pieceCount - 1] = piece;
                      }
                    }
                    pieces = pieces.filter((piece) => piece.text.length > 0);

                    return pieces.map((piece, i) => {
                      switch (piece.format) {
                        case "none":
                          return piece.text;
                        case "link":
                          return (
                            <Change
                              key={i}
                              changeCode={props.changeCode}
                              newCode={example.code}
                            >
                              {piece.text}
                            </Change>
                          );
                        case "code":
                          return <code key={i}>{piece.text}</code>;
                        default:
                          return piece.text;
                      }
                    });
                  }
                  return child;
                })}
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
}

export function Console(props) {
  // https://www.pluralsight.com/guides/event-listeners-in-react-components

  const [consoleOutput, setConsoleOutput] = useState("");

  const textarea = useRef(null);

  const handleConsoleLog = (event) => {
    if (
      event.data.sender === "m2c2kitmsg" &&
      (props.consoleId === undefined ||
        (props.consoleId !== undefined &&
          event.data.consoleId === props.consoleId))
    ) {
      setConsoleOutput((current) => {
        textarea.current.scrollTop = textarea.current.scrollHeight;
        const symbol = event.data.type === "error" ? "❌ " : "";
        return current + symbol + event.data.text + "\n";
      });
    }
  };

  React.useEffect(() => {
    window.addEventListener("message", handleConsoleLog);
    return () => {
      window.removeEventListener("message", handleConsoleLog);
    };
  }, []);

  return (
    <textarea
      value={consoleOutput}
      readOnly={true}
      ref={textarea}
      //style={{ fontSize: ".8rem", letterSpacing: "1", width: "1100px",
      style={{
        fontSize: ".8rem",
        letterSpacing: "1",
        width: props.width,
        height: "136px",
        marginTop: "4px",
        padding: "4px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        boxShadow: "1px 1px 1px #ccc",
      }}
    />
  );
}

export default function CodeExample(props) {
  // see https://dilshankelsen.com/call-child-function-from-parent-component-in-react/
  const runCodeFunc = React.useRef(null);
  const [js, setJs] = React.useState(props.code);
  const changeCode = (newCode) => {
    setJs(newCode);
    runCodeFunc.current(newCode);
  };

  // see https://usehooks.com/useMedia/
  // Hook
  function useMedia(queries, values, defaultValue) {
    /**
     * ExecutionEnvironment is needed because useMedia() is not available on
     * server-side rendering.
     * Without this check, we can't create an optimized build ("npm run build").
     * https://docusaurus.io/docs/docusaurus-core/#executionenvironment
     */
    if (!ExecutionEnvironment.canUseDOM) {
      return 900;
    }

    // Array containing a media query list for each query
    const mediaQueryLists = queries.map((q) => window.matchMedia(q));
    // Function that gets value based on matching media query
    const getValue = () => {
      // Get index of first media query that matches
      const index = mediaQueryLists.findIndex((mql) => mql.matches);
      // Return related value or defaultValue if none
      return typeof values[index] !== "undefined"
        ? values[index]
        : defaultValue;
    };
    // State and setter for matched value
    const [value, setValue] = useState(getValue);
    useEffect(
      () => {
        // Event listener callback
        // Note: By defining getValue outside of useEffect we ensure that it has ...
        // ... current values of hook args (as this hook callback is created once on mount).
        const handler = () => setValue(getValue);
        // Set a listener for each media query with above handler as callback.
        mediaQueryLists.forEach((mql) => mql.addListener(handler));
        // Remove listeners on cleanup
        return () =>
          mediaQueryLists.forEach((mql) => mql.removeListener(handler));
      },
      [] // Empty array ensures effect is only run on mount and unmount
    );
    return value;
  }

  const editorWidth = useMedia(
    // Media queries
    ["(min-width: 1450px)", "(min-width: 1250px)", "(min-width: 997px)"],
    // widths (relates to above media queries by array index)
    [900, 700, 525],
    // Default width
    525
  );

  return (
    <div>
      <div style={{ display: "flex", flexFlow: "column" }}>
        <Playground
          editorCode={js}
          template={props.template}
          runCodeFunc={runCodeFunc}
          editorWidth={editorWidth}
          iframeWidth={props.iframeWidth}
          iframeHeight={props.iframeHeight}
          iframeBorder={props.iframeBorder}
          consoleId={props.consoleId}
        />
        {props.console === "true" && (
          <Console width="100%" consoleId={props.consoleId} />
        )}
      </div>
      <Explore examples={props.more} changeCode={changeCode} />
    </div>
  );
}
