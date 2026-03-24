import { initNavigation, navigateTo } from './core/navigation.js';
import { RouterState } from './core/state.js';
import './components/Outlet.js';
import './components/Link.js';

export function createRouter(routes) {
    RouterState.routes = routes;

    return {
        install(app) {
            initNavigation();
        }
    };
}

export function getUrlParams() {
    return { ...RouterState.params, ...RouterState.query };
}

export function setUrlParam(key, value) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);
    navigateTo(`${window.location.pathname}?${searchParams.toString()}`);
}

export function deleteUrlParam(key) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(key);
    navigateTo(`${window.location.pathname}?${searchParams.toString()}`);
}