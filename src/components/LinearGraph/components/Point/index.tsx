import plusnew, { component, Props } from "@plusnew/core";
import TooltipWrapper from "components/TooltipWrapper";
import * as styleVariables from "scss/variables";
import styles from "./point.scss";

type props = {
  x: number;
  y: number;
  tooltip: string;
};

const DEFAULT_CIRCLE_RADIUS = 4;
const HOVER_CIRCLE_STROKE = 1;
const HOVER_CIRCLE_RADIUS = 6;
export const MAX_CIRCLE_RADIUS = HOVER_CIRCLE_RADIUS + HOVER_CIRCLE_STROKE;

export default component(__dirname, (Props: Props<props>) => (
  <Props>
    {(props) => (
      <TooltipWrapper content={props.tooltip}>
        <g class={styles.point}>
          <circle
            cx={props.x}
            cy={props.y}
            r={DEFAULT_CIRCLE_RADIUS - HOVER_CIRCLE_STROKE}
            class={styles.hoverCircle}
          />
          <circle
            cx={props.x}
            cy={props.y}
            r={DEFAULT_CIRCLE_RADIUS}
            fill={styleVariables.color_primary}
          />
        </g>
      </TooltipWrapper>
    )}
  </Props>
));
