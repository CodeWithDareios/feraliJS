/**
 * @fileoverview The Ferali Router — a full-featured SPA router for Ferali.js.
 * Provides declarative nested routing, dynamic path parameters, query strings,
 * global wildcard fallbacks, and a plugin API for `createApp`.
 *
 * @module ferali-router
 *
 * @example
 * import { createRouter } from 'ferali-router';
 *
 * const router = createRouter([
 *   { path: '/', component: () => import('./pages/Home.js') },
 *   { path: '/docs', component: () => import('./pages/Docs.js') },
 *   { path: '*', component: () => import('./pages/NotFound.js') },
 * ]);
 *
 * createApp('root').use(router).mount(App);
 */

import { initNavigation, navigateTo } from './core/navigation.js';
import { RouterState } from './core/state.js';
import './components/Outlet.js';
import './components/Link.js';

/**
 * Creates the Ferali Router plugin to be installed via `app.use()`.
 *
 * @param {Array<RouteDefinition>} routes - The top-level route definitions.
 * @returns {{ install: (app: Object) => void }} A plugin object compatible with `app.use()`.
 *
 * @typedef {Object} RouteDefinition
 * @property {string} path - The URL path string (supports `:param` and `*`).
 * @property {() => Promise<any>} component - A dynamic import factory for the page component.
 * @property {RouteDefinition[]} [children] - Nested child routes.
 * @property {boolean} [index] - If true, matches when the parent path is exactly matched.
 */
export function createRouter(routes) {
  RouterState.routes = routes;

  return {
    /**
     * Installs the router into the Ferali app. Called automatically by `app.use(router)`.
     * @param {Object} app - The Ferali app instance.
     */
    install(app) {
      initNavigation();
    }
  };
}

/**
 * Returns the current URL's merged path params and query string as a plain object.
 *
 * @returns {Object} Combined `params` and `query` from the current route.
 *
 * @example
 * const { id, q } = getUrlParams(); // e.g., /users/42?q=search → { id: '42', q: 'search' }
 */
export function getUrlParams() {
  return { ...RouterState.params, ...RouterState.query };
}

/**
 * Sets a single query parameter in the URL and triggers a navigation.
 *
 * @param {string} key - The query parameter name.
 * @param {string} value - The value to set.
 * @returns {void}
 */
export function setUrlParam(key, value) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  navigateTo(`${window.location.pathname}?${searchParams.toString()}`);
}

/**
 * Removes a single query parameter from the URL and triggers a navigation.
 *
 * @param {string} key - The query parameter name to remove.
 * @returns {void}
 */
export function deleteUrlParam(key) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete(key);
  navigateTo(`${window.location.pathname}?${searchParams.toString()}`);
}