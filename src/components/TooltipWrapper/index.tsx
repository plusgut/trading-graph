import plusnew, {
  ApplicationElement,
  component,
  Props,
  store,
} from "@plusnew/core";
import Tooltip from "components/Tooltip";
import styles from "./tooltipWrapper.scss";

type props = {
  content: ApplicationElement;
  children: any;
  disabled?: boolean;
};

const SVG_NS = "http://www.w3.org/2000/svg";

export default component(
  __dirname,
  (Props: Props<props>, componentInstance) => {
    const hover = store<null | {
      x: number;
      y: number;
      width: number;
      height: number;
    }>(null);

    const mouseEnter = (
      evt: MouseEvent & { currentTarget: HTMLDivElement }
    ) => {
      const { x, y, width, height } = evt.currentTarget.getBoundingClientRect();

      return hover.dispatch({
        x: x,
        y: y,
        width: width,
        height: height,
      });
    };

    const mouseLeave = () => hover.dispatch(null);

    return (
      <Props>
        {(props) => (
          <>
            <hover.Observer>
              {(hoverState) =>
                hoverState !== null &&
                props.disabled !== true && (
                  <Tooltip
                    viewportX={hoverState.x}
                    viewportY={hoverState.y}
                    width={hoverState.width}
                    height={hoverState.height}
                  >
                    {props.content}
                  </Tooltip>
                )
              }
            </hover.Observer>
            {componentInstance.renderOptions.xmlns === SVG_NS ? (
              <g onmouseenter={mouseEnter} onmouseleave={mouseLeave}>
                {props.children}
              </g>
            ) : (
              <div
                class={styles.tooltipWrapper}
                onmouseenter={mouseEnter}
                onmouseleave={mouseLeave}
              >
                {props.children}
              </div>
            )}
          </>
        )}
      </Props>
    );
  }
);
