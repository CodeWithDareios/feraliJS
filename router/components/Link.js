/**
 * @fileoverview The `<route-to>` custom element — a declarative SPA navigation link.
 * Prevents default browser navigation and delegates to the Ferali router instead.
 *
 * @example
 * <!-- Absolute navigation -->
 * <route-to href="/docs">Go to Docs</route-to>
 *
 * @example
 * <!-- Relative navigation (appends to current path) -->
 * <route-to href="*\/nested">Go to nested</route-to>
 */

import { navigateTo } from '../core/navigation.js';

class RouteTo extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute('href');
    this.style.cursor = 'pointer';

    this.onclick = (e) => {
      e.preventDefault();

      if (href.startsWith('*/')) {
        const currentPath = window.location.pathname.endsWith('/')
          ? window.location.pathname.slice(0, -1)
          : window.location.pathname;

        const relativePart = href.slice(2);
        navigateTo(`${currentPath}/${relativePart}`);
      } else {
        navigateTo(href);
      }
    };
  }
}

customElements.define('route-to', RouteTo);