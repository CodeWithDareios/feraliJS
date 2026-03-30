export function registerToggle(key, initialValue = false) {
    const proxy = this._createGlobalProxy(key);
    const toggleFn = () => {
        this.updateQueue.push({
            key,
            setterFn: (data) => {
                data.value = !data.value;
            }
        });
        this._enqueueUpdate();
    };

    this.registry.set(key, {
        value: Boolean(initialValue),
        subscribers: new Set(),
        api: {
            value: proxy,
            toggle: toggleFn
        }
    });
}