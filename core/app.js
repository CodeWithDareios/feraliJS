/**
 * @fileoverview The Ferali application entry point.
 * `createApp` bootstraps a Ferali SPA by mounting the root component
 * and managing plugins (e.g., the router).
 */

export let dev_enabled = false;
export let devInfo = {
  'build-process': {
    startTime: 0,
    compilationTime: 0,
    buildTime: 0,
  },
};

/**
 * Creates a Ferali application instance targeting a specific root DOM element.
 *
 * @param {string} rootID - The `id` of the root HTML element (e.g., `'root'`).
 * @returns {{ useCss: Function, use: Function, mount: Function, enableDevMode: Function }}
 *
 * @example
 * const app = createApp('root');
 * app.useCss('src/css/default.css').use(router).mount(App);
 */
export function createApp(rootID) {
  const root = document.getElementById(rootID);
  const plugins = [];

  const app = {
    /** @type {string[]} */
    cssFiles: [],

    /**
     * Queues a global CSS file to be loaded before the app mounts.
     * @param {string} link - The URL or path to the stylesheet.
     * @returns {this}
     */
    useCss(link) {
      this.cssFiles.push(link);
      return this;
    },

    /**
     * Installs a plugin (e.g., the Ferali Router) into the app.
     * @param {{ install: (app: Object) => void }} plugin - A plugin with an `install` method.
     * @returns {this}
     */
    use(plugin) {
      if (plugin.install) {
        plugin.install(this);
      }
      plugins.push(plugin);
      return this;
    },

    /**
     * Mounts the root component into the DOM. Awaits all queued CSS files
     * before rendering to prevent a Flash of Unstyled Content (FOUC).
     * @param {import('./component/component.js').default} Component - The root component instance.
     * @returns {Promise<void>}
     */
    async mount(Component) {
      if (!root) throw new Error(`Root element with ID: "${rootID}" not found!`);

      const cssPromises = this.cssFiles.map(file => {
        return new Promise(resolve => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = file;
          link.onload = resolve;
          link.onerror = resolve;
          document.head.appendChild(link);
        });
      });
      await Promise.all(cssPromises);

      await Component.build();
      const dom = Component.getCurrentDOM();
      const element = dom.isComponent ? dom.component.getCurrentDOM().ell : dom.ell;
      root.appendChild(element);
    },

    /** @deprecated Dev mode is temporarily disabled while a better implementation is built. */
    enableDevMode() { },
  };

  return app;
}
