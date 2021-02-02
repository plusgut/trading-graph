import plusnew, { component, PortalEntrance, Props } from "@plusnew/core";
import { ElementLifecycle } from "@plusnew/driver-dom";
import styles from "./tooltip.css";
type props = {
  width: number;
  height: number;
  viewportX: number;
  viewportY: number;
  children: any;
};

const OFFSET_TO_ELEMENT = 8;

export default component(__dirname, (Props: Props<props>) => (
  <PortalEntrance name="drawboard">
    <Props>
      {(props) => {
        function getPosition(opt: { width: number; height: number }) {
          const isLeftEdge = props.viewportX + props.width < opt.width / 2;
          const isRightEdge =
            props.viewportX >
            document.documentElement.clientWidth - opt.width / 2;
          const isBottomEdge =
            props.viewportY + props.height >
            document.documentElement.clientHeight - opt.height;

          const isTopEdge = props.viewportY < opt.height / 2;

          let yDirection: "top" | "bottom";
          let xDirection: "left" | "right";
          let yValue: number;
          let xValue: number;
          let yCenter: boolean;
          let xCenter: boolean;

          if (isTopEdge) {
            if (isLeftEdge) {
              // x o o
              // o o o
              // o o o
              yDirection = "top";
              xDirection = "left";
              yValue = props.viewportY + window.scrollY;
              xValue =
                props.viewportX +
                props.width +
                OFFSET_TO_ELEMENT +
                window.scrollX;
              yCenter = false;
              xCenter = false;
            } else if (isRightEdge) {
              // o o x
              // o o o
              // o o o
              yDirection = "top";
              xDirection = "right";
              yValue = props.viewportY + window.scrollY;
              xValue =
                document.documentElement.clientWidth -
                props.viewportX +
                OFFSET_TO_ELEMENT -
                window.scrollX;
              yCenter = false;
              xCenter = false;
            } else {
              // o x o
              // o o o
              // o o o
              yDirection = "top";
              xDirection = "left";
              yValue =
                props.viewportY +
                OFFSET_TO_ELEMENT +
                props.height +
                window.scrollY;
              xValue = props.viewportX + props.width / 2 + window.scrollX;
              yCenter = false;
              xCenter = true;
            }
          } else if (isBottomEdge) {
            if (isLeftEdge) {
              // o o o
              // o o o
              // x o o
              yDirection = "bottom";
              xDirection = "left";
              yValue = -(props.viewportY + props.height + window.scrollY);
              xValue =
                props.viewportX +
                props.width +
                OFFSET_TO_ELEMENT +
                window.scrollX;
              yCenter = false;
              xCenter = false;
            } else if (isRightEdge) {
              // o o o
              // o o o
              // o o x
              yDirection = "bottom";
              xDirection = "right";
              yValue = -(props.viewportY + props.height + window.scrollY);
              xValue =
                document.documentElement.clientWidth -
                props.viewportX +
                OFFSET_TO_ELEMENT -
                window.scrollX;
              yCenter = false;
              xCenter = false;
            } else {
              // o o o
              // o o o
              // o x o
              yDirection = "bottom";
              xDirection = "left";
              yValue = -(props.viewportY + window.scrollY - OFFSET_TO_ELEMENT);
              xValue = props.viewportX + props.width / 2 + window.scrollX;
              yCenter = false;
              xCenter = true;
            }
          } else {
            if (isLeftEdge) {
              // o o o
              // x o o
              // o o o
              yDirection = "top";
              xDirection = "left";
              yValue = props.viewportY + props.height / 2 + window.scrollY;
              xValue =
                props.viewportX +
                props.width +
                OFFSET_TO_ELEMENT +
                window.scrollX;
              yCenter = true;
              xCenter = false;
            } else if (isRightEdge) {
              // o o o
              // o o x
              // o o o
              yDirection = "top";
              xDirection = "right";
              yValue = props.viewportY + props.height / 2 + window.scrollY;
              xValue =
                document.documentElement.clientWidth -
                props.viewportX +
                OFFSET_TO_ELEMENT -
                window.scrollX;
              yCenter = true;
              xCenter = false;
            } else {
              // o o o
              // o x o
              // o o o
              yDirection = "top";
              xDirection = "left";
              yValue =
                props.viewportY +
                OFFSET_TO_ELEMENT +
                props.height +
                window.scrollY;
              xValue = props.viewportX + props.width / 2 + window.scrollX;
              yCenter = false;
              xCenter = true;
            }
          }
          return { xCenter, xDirection, xValue, yCenter, yDirection, yValue };
        }

        return (
          <ElementLifecycle
            elementDidMount={(element) => {
              const position = getPosition(element.getBoundingClientRect());
              (element as HTMLElement).style.visibility = "visible";
              (element as HTMLElement).style[
                position.xDirection
              ] = `${position.xValue}px`;
              (element as HTMLElement).style[
                position.yDirection
              ] = `${position.yValue}px`;
              if (position.xCenter === true) {
                (element as HTMLElement).classList.add(styles.xCenter);
              }
              if (position.yCenter === true) {
                (element as HTMLElement).classList.add(styles.yCenter);
              }
            }}
          >
            <div class={styles.tooltip}>
              <div class={styles.content}>{props.children}</div>
            </div>
          </ElementLifecycle>
        );
      }}
    </Props>
  </PortalEntrance>
));
