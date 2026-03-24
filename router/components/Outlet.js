import { RouterState } from '../core/state.js';
import { UPDATE_DOM } from '/@ferali/vdom/update.js';

class RouterOutlet extends HTMLElement {
    #currentComponent = null;
    #depth = 0;

    connectedCallback() {
        // Determine depth based on parent outlets
        let parent = this.parentElement;
        while (parent) {
            if (parent.tagName === 'ROUTER-OUTLET') this.#depth++;
            parent = parent.parentElement;
        }
        this.update();
    }

    async update() {
        const matched = RouterState.currentBranch[this.#depth];
        if (!matched) return;

        // Lazy load the component module
        const module = await matched.component();
        // Assuming default export is the component definition
        const ComponentDef = module.default || module;

        if (this.#currentComponent && this.#currentComponent.INFO().__componentID === ComponentDef.INFO().__componentID) {
            // Same component, just trigger Ferali update (they will use urlProps() internally)
            await this.#currentComponent.update();
        } else {
            // New component or initial mount
            if (this.#currentComponent) await this.#currentComponent.destroy();

            this.#currentComponent = ComponentDef;
            await this.#currentComponent.build();

            // Swap DOM
            this.innerHTML = '';
            this.appendChild(this.#currentComponent.getCurrentDOM().ell);
        }
    }
}

customElements.define('router-outlet', RouterOutlet);