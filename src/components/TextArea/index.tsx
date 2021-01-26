import plusnew, { component, Props } from "@plusnew/core";

type props = {
  rows: number;
  columns: number;
  value: string;
  onchange: (value: string) => void;
};

export default component(__dirname, (Props: Props<props>) => (
  <Props>
    {(props) => (
      <textarea
        rows={props.rows}
        cols={props.columns}
        value={props.value}
        oninput={(evt) => props.onchange(evt.currentTarget.value)}
      />
    )}
  </Props>
));
