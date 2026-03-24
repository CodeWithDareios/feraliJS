import { navigateTo } from '../core/navigation.js';

class RouteTo extends HTMLElement {
    connectedCallback() {
        let href = this.getAttribute('href');
        this.style.cursor = 'pointer';

        this.onclick = (e) => {
            e.preventDefault();
            
            let targetHref = href;
            
            // Handle Relative Path Prefix "*/"
            if (href.startsWith('*/')) {
                const currentPath = window.location.pathname.endsWith('/') 
                    ? window.location.pathname.slice(0, -1) 
                    : window.location.pathname;
                
                const relativePart = href.slice(2);
                targetHref = `${currentPath}/${relativePart}`;
            }

            navigateTo(targetHref);
        };
    }
}

customElements.define('route-to', RouteTo);