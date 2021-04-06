import plusnew, {
  ApplicationElement,
  Component,
  Props,
  store,
} from "@plusnew/core";
import { ElementLifecycle } from "@plusnew/driver-dom";

type props = {
  children: (size: { width: number; height: number }) => ApplicationElement;
};

export default class Size extends Component<props> {
  static displayName = __dirname;
  render(Props: Props<props>) {
    const size = store<null | { width: number; height: number }>(null);
    const resizeObserver = new window.ResizeObserver((entries) => {
      if (entries.length === 1) {
        size.dispatch({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    return (
      <ElementLifecycle
        elementDidMount={(element) => resizeObserver.observe(element)}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <size.Observer>
            {(sizeState) =>
              sizeState !== null && (
                <Props>
                  {(props) =>
                    ((props.children as any)[0] as props["children"])(sizeState)
                  }
                </Props>
              )
            }
          </size.Observer>
        </div>
      </ElementLifecycle>
    );
  }
}
