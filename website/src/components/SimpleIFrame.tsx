import React from "react";

export default function SimpleIFrame(props) {
  return (
    <iframe
      srcDoc={props.srcDoc ?? ""}
      title={props.title ?? ""}
      height={props.height ?? "400"}
      width={props.width ?? "200"}
      style={{ border: props.border, margin: props.margin, overflow: "hidden" }}
      scrolling="no"
    />
  );
}
