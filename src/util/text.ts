export function getValueFromString(value: string) {
  return parseFloat(value);
}

const computedStyle = window.getComputedStyle(document.body);

export const BASE_FONT_SIZE = getValueFromString(computedStyle.fontSize);

const BASE_FONT_FAMILY = computedStyle.fontFamily;

const ctx = document.createElement("canvas").getContext("2d");

export function getTextWidth(text: string, fontSize: number) {
  if (ctx === null) {
    throw new Error("Could not find Context");
  }
  ctx.font = `${fontSize * BASE_FONT_SIZE}px ${BASE_FONT_FAMILY}`;

  const textMetrics = ctx.measureText(text);

  return textMetrics.width;
}
