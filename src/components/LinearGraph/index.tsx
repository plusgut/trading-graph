import plusnew, { component, Props } from "@plusnew/core";
import { forEach } from "util/functional";
import { getTextWidth } from "util/text";
import Point, { MAX_CIRCLE_RADIUS } from "./components/Point";

type props = {
  lines: {
    values: { x: number; y: number; tootlip: string }[];
    color: string;
  }[];
  width: number;
  height: number;
  maxYValue: number;
  maxXValue: number;
  getXLabel: (x: number) => string;
  getYLabel: (y: number) => string;
  yTargetRows: number;
  xTargetColumns: number;
};

function getStepSize(range: number, targetStepAmount: number) {
  // calculate an initial guess at step size
  const temporaryStep = range / targetStepAmount;

  // get the magnitude of the step size
  const magnitude = Math.floor(Math.log(temporaryStep) / Math.LN10);
  const magnitudePower = Math.pow(10, magnitude);

  // calculate most significant digit of the new step size
  let magnitudeMostSignificantDigit = Math.round(
    temporaryStep / magnitudePower
  );

  // promote the most significant digit to either 1, 2, or 5
  if (magnitudeMostSignificantDigit > 5.0) {
    magnitudeMostSignificantDigit = 10.0;
  } else if (magnitudeMostSignificantDigit > 2.0) {
    magnitudeMostSignificantDigit = 5.0;
  } else if (magnitudeMostSignificantDigit > 1.0) {
    magnitudeMostSignificantDigit = 2.0;
  }

  return magnitudeMostSignificantDigit * magnitudePower;
}

function getStepAmount(maxValue: number, stepSize: number) {
  return Math.ceil(maxValue / stepSize);
}

const STROKE_WIDTH = 2;
const X_AXIS_HEIGHT = 20;
const LABEL_FONT_SIZE = 0.5625;
const AXIS_MARKER_SIZE = 3;
const AXIS_COLOR = "grey";
const AXIS_WIDTH = 1;

export default component(__dirname, (Props: Props<props>) => {
  return (
    <Props>
      {(props) => {
        if (props.maxYValue === 0) {
          throw new Error("maxYValue is wrong");
        }

        const yStepSize = getStepSize(props.maxYValue, props.yTargetRows - 1);
        const yStepAmount = getStepAmount(props.maxYValue, yStepSize);
        const yMaxStep = yStepAmount * yStepSize;
        const xStepSize = getStepSize(
          props.maxXValue,
          props.xTargetColumns - 1
        );
        const xStepAmount = getStepAmount(props.maxXValue, xStepSize);
        const xMaxStep = xStepAmount * xStepSize;
        const yLabels = forEach(yStepAmount + 1, (index) =>
          props.getYLabel(index * yStepSize)
        );
        const maxYLabelWidth = Math.max(
          ...yLabels.map((label) => getTextWidth(label, LABEL_FONT_SIZE))
        );

        function getYPosition(y: number) {
          const shrinkSize = MAX_CIRCLE_RADIUS + X_AXIS_HEIGHT;

          return (
            props.height -
            X_AXIS_HEIGHT -
            MAX_CIRCLE_RADIUS -
            Math.round(
              ((props.height - shrinkSize) / (yMaxStep + yStepSize / 2)) * y
            )
          );
        }

        function getXPosition(x: number) {
          return (
            maxYLabelWidth +
            Math.round(
              ((props.width - MAX_CIRCLE_RADIUS - maxYLabelWidth) /
                (xMaxStep + xStepSize / 2)) *
                x
            ) +
            MAX_CIRCLE_RADIUS
          );
        }

        return (
          <svg width={props.width} height={props.height}>
            <g>
              <line
                x1={getXPosition(0)}
                y1={getYPosition(0)}
                x2={getXPosition(xMaxStep + xStepSize / 2)}
                y2={getYPosition(0)}
                stroke={AXIS_COLOR}
                stroke-width={AXIS_WIDTH}
              />
              <line
                x1={getXPosition(0)}
                y1={getYPosition(0)}
                x2={getXPosition(0)}
                y2={getYPosition(yMaxStep + yStepSize / 2)}
                stroke={AXIS_COLOR}
                stroke-width={AXIS_WIDTH}
              />
            </g>
            <g>
              {forEach(xStepAmount + 1, (index) => (
                <>
                  <line
                    x1={getXPosition(xStepSize * index)}
                    y1={getYPosition(0) - AXIS_MARKER_SIZE}
                    x2={getXPosition(xStepSize * index)}
                    y2={getYPosition(0) + AXIS_MARKER_SIZE}
                    stroke={AXIS_COLOR}
                    stroke-width={AXIS_WIDTH}
                  />
                  <text
                    x={getXPosition(xStepSize * index)}
                    y={props.height - X_AXIS_HEIGHT / 2}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size={`${LABEL_FONT_SIZE}rem`}
                  >
                    {props.getXLabel(xStepSize * index)}
                  </text>
                </>
              ))}
            </g>
            <g>
              {yLabels.map((label, index) => (
                <>
                  <line
                    x1={getXPosition(0) - AXIS_MARKER_SIZE}
                    y1={getYPosition(yStepSize * index)}
                    x2={getXPosition(0) + AXIS_MARKER_SIZE}
                    y2={getYPosition(yStepSize * index)}
                    stroke={AXIS_COLOR}
                    stroke-width={AXIS_WIDTH}
                  />
                  <text
                    x={maxYLabelWidth}
                    y={getYPosition(yStepSize * index)}
                    font-size={`${LABEL_FONT_SIZE}rem`}
                    text-anchor="end"
                    dominant-baseline="middle"
                  >
                    {label}
                  </text>
                </>
              ))}
            </g>
            {props.lines.map((line) => (
              <g>
                <path
                  d={line.values
                    .map(
                      (value, index) =>
                        `${index === 0 ? "M" : "L"} ${getXPosition(
                          value.x
                        )} ${getYPosition(value.y)}`
                    )
                    .join(" ")}
                  stroke={line.color}
                  stroke-width={STROKE_WIDTH}
                  fill="none"
                />
                {line.values.map((value) => (
                  <Point
                    x={getXPosition(value.x)}
                    y={getYPosition(value.y)}
                    tooltip={value.tootlip}
                    color={line.color}
                  />
                ))}
              </g>
            ))}
          </svg>
        );
      }}
    </Props>
  );
});
