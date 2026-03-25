/**
 * @fileoverview URL path utility functions for the Ferali Router.
 * Converts route path strings into regular expressions for matching,
 * and extracts dynamic path parameters from matched URLs.
 */

/**
 * Converts a route path definition string into a Regular Expression.
 *
 * @param {string} path - The route path string (e.g., `/users/:id`, `/docs`, `*`).
 * @param {boolean} [partial=false] - If `true`, the regex matches the beginning of a URL
 *   (used for parent routes with children). If `false`, requires a full match.
 * @returns {RegExp}
 *
 * @example
 * pathToRegex('/users/:id')       // /^\/users\/(.+)$/
 * pathToRegex('/docs', true)      // /^\/docs/
 */
export function pathToRegex(path, partial = false) {
  const normalizedPath = path.startsWith('/') ? path : '/' + path;

  const pattern = normalizedPath
    .replace(/\//g, '\\/')
    .replace(/:\w+/g, '(.+)')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + pattern + (partial ? '' : '$'));
}

/**
 * Extracts named dynamic path parameters from a regex match result.
 *
 * @param {{ path: string, result: RegExpMatchArray }} match - An object containing
 *   the route path definition and the regex match result array.
 * @returns {Object} A key-value map of parameter names to their matched values.
 *
 * @example
 * getParams({ path: '/users/:id', result: ['/users/42', '42'] })
 * // => { id: '42' }
 */
export function getParams(match) {
  const values = match.result.slice(1);
  const keys = Array.from(match.path.matchAll(/:(\w+)/g)).map(r => r[1]);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}