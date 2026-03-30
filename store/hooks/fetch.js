export function registerFetchPolling(key, url, intervalMs = 5000, options = {}) {
    const dataKey = `${key}_data`;
    const loadingKey = `${key}_loading`;
    const errorKey = `${key}_error`;
    // We reuse our own class methods securely via generic prototype scoping!
    this.registerState(dataKey, null);
    this.registerState(loadingKey, true);
    this.registerState(errorKey, null);
    const performFetch = async () => {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();

            this.registry.get(dataKey).api.set(json);
            this.registry.get(errorKey).api.set(null);
        } catch (err) {
            this.registry.get(errorKey).api.set(err);
            this.registry.get(dataKey).api.set(null);
        } finally {
            this.registry.get(loadingKey).api.set(false);
        }
    };
    performFetch();
    const timerId = setInterval(performFetch, intervalMs);
    const apiObj = {
        data: this.registry.get(dataKey).api.value,
        loading: this.registry.get(loadingKey).api.value,
        error: this.registry.get(errorKey).api.value,
    };
    this.registry.set(key, {
        api: apiObj,
        subscribers: {
            add: (comp) => {
                // Recursive subscribing automatically binds the parent component
                // to all 3 disparate internal status modules!
                this.registry.get(dataKey).subscribers.add(comp);
                this.registry.get(loadingKey).subscribers.add(comp);
                this.registry.get(errorKey).subscribers.add(comp);
            },
            delete: (comp) => {
                this.registry.get(dataKey).subscribers.delete(comp);
                this.registry.get(loadingKey).subscribers.delete(comp);
                this.registry.get(errorKey).subscribers.delete(comp);
            }
        }
    });
}