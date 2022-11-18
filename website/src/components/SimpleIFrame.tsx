import React from "react";

export default function SimpleIFrame({ srcDoc, title }) {
  return <iframe srcDoc={srcDoc} title={title} height="400" width="200" />;
}
