/**
 * @fileoverview Navigation engine for the Ferali Router.
 * Manages history-based SPA navigation, intercepts global link clicks,
 * and notifies all registered `<router-outlet>` elements after each navigation.
 */

import { matchRoute } from './matcher.js';
import { RouterState } from './state.js';

/**
 * Initializes the router's navigation listeners. Must be called once during app startup.
 * Sets up the `popstate` listener (for browser back/forward), intercepts `<a>` tag clicks,
 * and performs the initial route resolution for the current URL.
 *
 * @returns {void}
 */
export function initNavigation() {
  window.addEventListener('popstate', () => handleLocationChange());

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href').startsWith('/') && !link.hasAttribute('native')) {
      e.preventDefault();
      navigateTo(link.getAttribute('href'));
    }
  });

  handleLocationChange();
}

/**
 * Programmatically navigates to a new URL, pushing a new history entry.
 * Triggers a full route resolution and notifies all outlets.
 *
 * @param {string} url - The absolute URL path to navigate to (e.g., `/docs`).
 * @returns {void}
 */
export function navigateTo(url) {
  history.pushState({}, '', url);
  handleLocationChange();
}

/**
 * Resolves the current URL against the route tree, updates `RouterState`,
 * and broadcasts a `ferali-nav` event to all active `<router-outlet>` elements.
 */
function handleLocationChange() {
  const path = window.location.pathname;
  const { branch, params } = matchRoute(path, RouterState.routes);

  RouterState.currentBranch = branch;
  RouterState.params = params;
  RouterState.query = Object.fromEntries(new URLSearchParams(window.location.search));

  window.dispatchEvent(new CustomEvent('ferali-nav'));
}