import { STORAGE, currentComponent } from './storage.js';

export function State(initialValue) {
  const comp = currentComponent.component;
  const id = comp.instanceID;
  if (!STORAGE.STATE.has(id)) {
    STORAGE.STATE.set(id, {
      hookIndex: 0,
      data: [],
    });
  }

  const storage = STORAGE.STATE.get(id);

  if (storage.data[storage.hookIndex] === undefined) {
    storage.data[storage.hookIndex] = initialValue;
  }

  const stateProxy = new Proxy(
    {},
    {
      get(target, prop) {
        // If we ask for the value, or if JS tries to convert it to a string/number
        if (
          prop === 'valueOf' ||
          prop === Symbol.toPrimitive ||
          prop === 'toString'
        ) {
          return () => storage.data[storage.hookIndex];
        }
        // This is the "Magic" key your framework will use to detect a state
        if (prop === '__isState') return true;
        if (prop === '__raw') return storage.data[storage.hookIndex];

        return storage.data[storage.hookIndex][prop];
      },
    }
  );

  const updateState = (newValue) => {
    if (storage.data[storage.hookIndex] != newValue) {
      storage.data[storage.hookIndex] = newValue;
      comp.update();
    }
  };

  return [stateProxy, updateState];
}
