import { Store } from "@plusnew/core";

export default function <T, U extends Store<T, any>>(
  key: string,
  initialValue: T,
  callback: (value: T) => U
): U {
  const result = localStorage.getItem(key);
  let store: U;
  if (result === null) {
    store = callback(initialValue);
  } else {
    store = callback(JSON.parse(result));
  }

  store.subscribe(() =>
    localStorage.setItem(key, JSON.stringify(store.getState()))
  );

  return store;
}
