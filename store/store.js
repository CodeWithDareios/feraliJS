import { currentComponent } from "ferali/hooks/storage.js";

import { registerState } from "./hooks/state.js";
import { registerToggle } from "./hooks/toggle.js";
import { registerLocalStorage, registerSessionStorage } from "./hooks/storage.js";
import { registerDebounce } from "./hooks/debounce.js";
import { registerFetchPolling } from "./hooks/fetch.js";


class Store {
    constructor() {
        this.registry = new Map();
        this.updateQueue = [];
        this.isProcessing = false;
    }


    // ==================================
    // INTERNAL ENGINE & ALGORITHMS
    // ==================================

    _createGlobalProxy(key) {
        return new Proxy({}, {
            get: (target, prop) => {
                const data = this.registry.get(key);
                if (!data) return undefined;

                const rawVal = data.value;

                if (prop === 'valueOf' || prop === Symbol.toPrimitive || prop === 'toString') {
                    return () => rawVal;
                }

                if (prop === '__isStore') return true;
                if (prop === '__raw') return rawVal;

                return rawVal === null || rawVal === undefined ? undefined : rawVal[prop];
            }
        });
    }

    _enqueueUpdate() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        Promise.resolve().then(() => {
            const componentsToUpdate = new Set();

            this.updateQueue.forEach(({ key, setterFn }) => {
                const data = this.registry.get(key);
                if (data) {
                    setterFn(data);

                    const activeSubscribers = new Set();

                    for (const sub of data.subscribers) {
                        if (!sub.isDestroyed) {
                            activeSubscribers.add(sub);
                            componentsToUpdate.add(sub);
                        }
                    }
                    data.subscribers = activeSubscribers;
                }
            });

            this.updateQueue = [];

            for (const comp of componentsToUpdate) {
                comp.update();
            }

            this.isProcessing = false;
        });
    }

    // ==================================
    // GLOBAL API
    // ==================================

    subscribe(key, options = { blockUpdate: false }) {
        const comp = currentComponent.component;
        if (!this.registry.has(key)) throw new Error(`[Ferali Store] Hook '${key}' does not exist`);

        const data = this.registry.get(key);
        if (comp && !options.blockUpdate) {
            data.subscribers.add(comp);
        }

        return {
            ...data.api,
            _disableUpdate: () => {
                if (comp) data.subscribers.delete(comp);
            },
            _enableUpdate: () => {
                if (comp && !comp.isDestroyed) data.subscribers.add(comp);
            }
        }
    }
}

Object.assign(Store.prototype, {
    registerState,
    registerToggle,
    registerLocalStorage,
    registerSessionStorage,
    registerDebounce,
    registerFetchPolling
});

export default function createStore() {
    return new Store();
}