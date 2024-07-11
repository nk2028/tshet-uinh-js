export function assert(condition: unknown, errorMessage: string | (() => string)): asserts condition {
  if (!condition) {
    throw new Error(typeof errorMessage === 'function' ? errorMessage() : errorMessage);
  }
}
