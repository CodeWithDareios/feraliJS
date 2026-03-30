export function registerState(key, initialValue) {

    const proxy = this._createGlobalProxy(key);
    const setFn = (newValue) => {
        this.updateQueue.push({
            key,
            setterFn: (data) => {
                data.value = newValue;
            }
        });
        this._enqueueUpdate();
    }

    this.registry.set(key, {
        value: initialValue,
        subscribers: new Set(),
        api: {
            value: proxy,
            set: setFn
        }
    })

} 