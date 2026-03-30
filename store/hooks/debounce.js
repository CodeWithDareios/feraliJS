export function registerDebounce(key, initialValue, delayMs = 300) {
    const proxy = this._createGlobalProxy(key);
    let timeoutId = null;

    const setFn = (newValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            this.updateQueue.push({
                key,
                setterFn: (data) => { data.value = newValue; }
            });
            this._enqueueUpdate();
        }, delayMs);
    };

    this.registry.set(key, {
        value: initialValue,
        subscribers: new Set(),
        api: { value: proxy, set: setFn }
    });
}