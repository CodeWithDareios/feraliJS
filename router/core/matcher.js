import { pathToRegex, getParams } from '../utils/path.js';

export function matchRoute(url, currentRoutes, branch = [], params = {}, inheritedFallback = null) {
    // Normalize: remove trailing slash for matching, but keep it for root '/'
    let testUrl = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
    if (!testUrl.startsWith('/')) testUrl = '/' + testUrl;

    // Look for a local fallback at this level
    const localFallback = currentRoutes.find(r => r.path === '*');
    const currentFallback = localFallback || inheritedFallback;

    for (const route of currentRoutes) {
        const routePath = route.path || '';

        // Use partial match if there are children to resolve
        const isPartial = !!route.children && routePath !== '*';
        const regex = pathToRegex(routePath, isPartial);
        const match = testUrl.match(regex);

        if (match) {
            // Extract params
            const levelParams = getParams({ path: routePath, result: match });
            Object.assign(params, levelParams);

            branch.push(route);

            if (route.children) {
                // Determine what's left for children
                const matchedPart = match[0];
                const remainingUrl = testUrl.slice(matchedPart.length) || '/';

                return matchRoute(remainingUrl, route.children, branch, params, currentFallback);
            }

            return { branch, params };
        }

        // Index route fallback
        if (route.index && (testUrl === '/' || testUrl === '')) {
            branch.push(route);
            return { branch, params };
        }
    }

    // Default to the BEST fallback we've found so far
    if (currentFallback) {
        branch.push(currentFallback);
    }

    return { branch, params };
}