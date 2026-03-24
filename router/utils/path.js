export function pathToRegex(path, partial = false) {
    // Ensure path starts with a slash for regex generation
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    
    let pattern = normalizedPath
        .replace(/\//g, "\\/")
        .replace(/:\w+/g, "(.+)")
        .replace(/\*/g, "(.*)");
    
    return new RegExp("^" + pattern + (partial ? "" : "$"));
}

export function getParams(match) {
    const values = match.result.slice(1);
    const keys = Array.from(match.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}