export function extractMethodBodyFromArrowFunctionString(
  functionString: string | undefined | null,
) {
  if (!functionString) {
    return "";
  }
  const arrowIndex = functionString.indexOf("=>");

  if (arrowIndex === -1) {
    throw new Error("Invalid arrow function");
  }

  const substringAfterArrow = functionString.substring(arrowIndex + 2);
  const firstBraceIndex = substringAfterArrow.indexOf("{");
  const lastBraceIndex = substringAfterArrow.lastIndexOf("}");

  if (
    firstBraceIndex === -1 ||
    lastBraceIndex === -1 ||
    firstBraceIndex >= lastBraceIndex
  ) {
    throw new Error("Invalid function body");
  }

  return substringAfterArrow.substring(firstBraceIndex + 1, lastBraceIndex);
}
