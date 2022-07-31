export default function voidPromise<T>(promise: Promise<T>) {
  promise.catch(() => {
    // no-op;
  });
}
