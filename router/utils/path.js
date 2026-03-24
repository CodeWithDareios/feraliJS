export function pathToRegex(path) {
    return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
}

export function getParams(match) {
    const values = match.result.slice(1);
    const keys = Array.from(match.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}