export function forEach<T>(count: number, callback: (index: number) => T) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(callback(i));
  }
  return result;
}