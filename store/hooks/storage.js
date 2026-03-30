export function registerLocalStorage(key, storageKey, initialValue) {
    let storedValue = localStorage.getItem(storageKey);
    if (storedValue !== null) {
        try { storedValue = JSON.parse(storedValue); } catch (e) { }
    } else {
        storedValue = initialValue;
        localStorage.setItem(storageKey, typeof storedValue === 'string' ? storedValue : JSON.stringify(storedValue));
    }
    const proxy = this._createGlobalProxy(key);

    const setFn = (newValue) => {
        localStorage.setItem(storageKey, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
        this.updateQueue.push({
            key,
            setterFn: (data) => { data.value = newValue; }
        });
        this._enqueueUpdate();
    };
    this.registry.set(key, {
        value: storedValue,
        subscribers: new Set(),
        api: { value: proxy, set: setFn }
    });
}
export function registerSessionStorage(key, storageKey, initialValue) {
    let storedValue = sessionStorage.getItem(storageKey);
    if (storedValue !== null) {
        try { storedValue = JSON.parse(storedValue); } catch (e) { }
    } else {
        storedValue = initialValue;
        sessionStorage.setItem(storageKey, typeof storedValue === 'string' ? storedValue : JSON.stringify(storedValue));
    }
    const proxy = this._createGlobalProxy(key);

    const setFn = (newValue) => {
        sessionStorage.setItem(storageKey, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
        this.updateQueue.push({
            key,
            setterFn: (data) => { data.value = newValue; }
        });
        this._enqueueUpdate();
    };
    this.registry.set(key, {
        value: storedValue,
        subscribers: new Set(),
        api: { value: proxy, set: setFn }
    });
}