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

        this._onNav = () => this.update();
        window.addEventListener('ferali-nav', this._onNav);
        this.update();
    }

    disconnectedCallback() {
        window.removeEventListener('ferali-nav', this._onNav);
    }

    async update() {
        const matched = RouterState.currentBranch[this.#depth];
        if (!matched) {
            // Delay clearing briefly to allow parent outlets to destroy this outlet completely
            // if we are navigating away from deeply nested routes. This prevents visual cascading.
            setTimeout(() => {
                if (this.isConnected) {
                    this.innerHTML = '';
                    this.#currentComponent = null;
                }
            }, 0);
            return;
        }

        // Lazy load the component module
        const module = await matched.component();
        // Assuming default export is the component definition
        const ComponentDef = module.default || module;

        const currentParams = { ...RouterState.params, ...RouterState.query };
        
        if (this.#currentComponent === ComponentDef) {
            // Same component, just trigger Ferali update with new props
            this.#currentComponent.useProps(currentParams);
            await this.#currentComponent.update();
        } else {
            // New component or initial mount
            if (this.#currentComponent) {
                await this.#currentComponent.destroy();
            }
            
            // NOTE: We are using the definition as an instance. 
            // If the framework is designed to return a new object from defineComponent, this is fine.
            this.#currentComponent = ComponentDef; 
            this.#currentComponent.useProps(currentParams);
            
            // Critical Change: Ensure we reset the component's internal DOM state before rebuilding
            // so it doesn't try to reuse a DOM node that's already elsewhere
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