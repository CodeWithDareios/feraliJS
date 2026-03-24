import { pathToRegex, getParams } from '../utils/path.js';

export function matchRoute(url, currentRoutes, branch = [], params = {}) {
    const segments = url.split('/').filter(Boolean);

    for (const route of currentRoutes) {
        const routePath = route.path || '';
        const regex = pathToRegex(routePath);
        const match = url.match(regex);

        if (match) {
            // Extract params for this level
            const levelParams = getParams({ path: routePath, result: match });
            Object.assign(params, levelParams);

            branch.push(route);

            // Handle Nested Children
            if (route.children) {
                // Determine remaining URL for children
                const matchedLength = match[0].length;
                const remainingUrl = url.slice(matchedLength) || '/';

                // Recursive call for children
                return matchRoute(remainingUrl, route.children, branch, params);
            }

            return { branch, params };
        }

        // Handle Index routes (if current URL is empty/root and route is index)
        if (route.index && (url === '/' || url === '')) {
            branch.push(route);
            return { branch, params };
        }
    }

    // 404 / Catch-all Handling
    const fallback = currentRoutes.find(r => r.path === '*');
    if (fallback) {
        branch.push(fallback);
        return { branch, params };
    }

    return { branch, params };
}