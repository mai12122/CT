import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

// `useSyncExternalStore` enables safe client/server hydration without cascading renders.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return isClient ? client : server;
}
