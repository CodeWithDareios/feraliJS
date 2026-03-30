/**
 * @fileoverview The `<router-outlet>` custom element — the rendering viewport for the Ferali Router.
 * Each outlet renders the matched component for its specific depth in the route branch.
 * Nested outlets (depth 1+) render child routes inside parent route layouts.
 */

import { defineComponent } from 'ferali';
import { RouterState } from '../core/state.js';

class RouterOutlet extends HTMLElement {
  /** @type {import('../../core/component/component.js').default|null} */
  #currentComponent = null;

  /** @type {number} Depth index in the matched route branch (0 = root, 1 = nested, etc.) */
  #depth = 0;

  connectedCallback() {
    let parent = this.parentElement;
    while (parent) {
      if (parent.tagName === 'ROUTER-OUTLET') this.#depth++;
      parent = parent.parentElement;
    }

    this._onNav = () => this.update();
    window.addEventListener('ferali-nav', this._onNav);
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener('ferali-nav', this._onNav);
  }

  /**
   * Resolves and renders the matched route component for this outlet's depth.
   * On navigation, if the component changes, destroys the old one and mounts the new one.
   * If the same component is re-used (same route, new params), triggers a props-based update.
   * @returns {Promise<void>}
   */
  async update() {
    const matched = RouterState.currentBranch[this.#depth];

    if (!matched) {
      setTimeout(() => {
        if (this.isConnected) {
          this.innerHTML = '';
          this.#currentComponent = null;
        }
      }, 0);
      return;
    }

    const module = await matched.component();
    const ComponentDef = module.default || module;
    const currentParams = { ...RouterState.params, ...RouterState.query };

    if (this.#currentComponent === ComponentDef) {
      this.#currentComponent.useProps(currentParams);
      await this.#currentComponent.update();
    } else {
      if (this.#currentComponent) {
        await this.#currentComponent.destroy();
      }

      // IMPORT FIX: Ferali routed components are ES modules that export an instantiated Component singleton.
      // We MUST create a fresh instance using defineComponent to ensure fresh state IDs and build cycles!
      this.#currentComponent = defineComponent(ComponentDef.getConfig());
      this.#currentComponent.useProps(currentParams);

      if (this.#currentComponent.getCurrentDOM()) {
        this.#currentComponent.setNewDOM(null);
      }

      await this.#currentComponent.build();
      this.innerHTML = '';
      this.appendChild(this.#currentComponent.getCurrentDOM().ell);
    }
  }
}

customElements.define('router-outlet', RouterOutlet);