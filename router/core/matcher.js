/**
 * @fileoverview The recursive route matching engine for the Ferali Router.
 * Implements a tree-based, depth-first search that resolves the correct
 * route branch for a given URL, including nested routes and fallback inheritance.
 */

import { pathToRegex, getParams } from '../utils/path.js';

/**
 * Recursively matches a URL against a route tree, building the matched branch.
 * Supports nested routes (children), dynamic params (`:id`), and wildcard (`*`) catch-alls.
 * Wildcards defined at a parent level are automatically inherited by child levels.
 *
 * @param {string} url - The URL fragment to match (e.g., `/hooks/nested`).
 * @param {Object[]} currentRoutes - The array of route definitions to match against.
 * @param {Object[]} [branch=[]] - Accumulator for the matched route chain (root → leaf).
 * @param {Object} [params={}] - Accumulator for extracted path parameters.
 * @param {Object|null} [inheritedFallback=null] - The nearest wildcard (`*`) route from a parent level.
 * @returns {{ branch: Object[], params: Object }} The matched branch and extracted params.
 */
export function matchRoute(url, currentRoutes, branch = [], params = {}, inheritedFallback = null) {
  let testUrl = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
  if (!testUrl.startsWith('/')) testUrl = '/' + testUrl;

  const localFallback = currentRoutes.find(r => r.path === '*');
  const currentFallback = localFallback || inheritedFallback;

  for (const route of currentRoutes) {
    const routePath = route.path || '';
    const isPartial = !!route.children && routePath !== '*';
    const regex = pathToRegex(routePath, isPartial);
    const match = testUrl.match(regex);

    if (match) {
      const levelParams = getParams({ path: routePath, result: match });
      Object.assign(params, levelParams);
      branch.push(route);

      if (route.children) {
        const matchedPart = match[0];
        const remainingUrl = testUrl.slice(matchedPart.length) || '/';
        return matchRoute(remainingUrl, route.children, branch, params, currentFallback);
      }

      return { branch, params };
    }

    if (route.index && (testUrl === '/' || testUrl === '')) {
      branch.push(route);
      return { branch, params };
    }
  }

  if (currentFallback) branch.push(currentFallback);
  return { branch, params };
}