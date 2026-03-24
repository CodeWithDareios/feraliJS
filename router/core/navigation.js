import { matchRoute } from './matcher.js';
import { RouterState } from './state.js';

export function initNavigation() {
    window.addEventListener('popstate', () => handleLocationChange());

    // Global link interception
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href').startsWith('/') && !link.hasAttribute('native')) {
            e.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });

    handleLocationChange(); // Initial load
}

export function navigateTo(url) {
    history.pushState({}, '', url);
    handleLocationChange();
}

function handleLocationChange() {
    const path = window.location.pathname;
    const { branch, params } = matchRoute(path, RouterState.routes);

    RouterState.currentBranch = branch;
    RouterState.params = params;
    RouterState.query = Object.fromEntries(new URLSearchParams(window.location.search));

    // Notify all outlets via a custom event (more robust than querySelectorAll)
    window.dispatchEvent(new CustomEvent('ferali-nav'));
}