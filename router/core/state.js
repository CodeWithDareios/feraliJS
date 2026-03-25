/**
 * @fileoverview Shared mutable state for the Ferali Router.
 * This singleton is mutated by `navigation.js` and read by `Outlet.js`.
 */

/**
 * The global state object for the router instance.
 * @type {{ routes: Object[], currentBranch: Object[], params: Object, query: Object }}
 */
export const RouterState = {
  /** @type {Object[]} The flat list of route definitions registered via `createRouter`. */
  routes: [],
  /** @type {Object[]} The currently matched route branch (from root to leaf). Depth is index. */
  currentBranch: [],
  /** @type {Object} Dynamic path parameters extracted from the current URL (e.g., `{ id: '42' }`). */
  params: {},
  /** @type {Object} Query string parameters extracted from the current URL (e.g., `{ q: 'search' }`). */
  query: {},
};