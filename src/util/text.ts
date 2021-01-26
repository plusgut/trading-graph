export function getValueFromString(value: string) {
  return parseFloat(value);
}

export const BASE_FONT_SIZE = getValueFromString(
  window.getComputedStyle(document.body).fontSize
);

const ctx = document.createElement("canvas").getContext("2d");

export function getTextWidth(text: string, fontSize: number) {
  if (ctx === null) {
    throw new Error("Could not find Context");
  }
  ctx.font = `${fontSize * BASE_FONT_SIZE}px Open Sans, Arial`;

  const textMetrics = ctx.measureText(text);

  return textMetrics.width;
}
