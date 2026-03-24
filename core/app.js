export let dev_enabled = false;
export let devInfo = {
  'build-process': {
    startTime: 0,
    compilationTime: 0,
    buildTime: 0,
  },
};

export function createApp(rootID) {
  const root = document.getElementById(rootID);
  const plugins = [];

  const app = {
    cssFiles: [],
    useCss(link) {
      this.cssFiles.push(link);
      return this;
    },
    use(plugin) {
      if (plugin.install) {
        plugin.install(this);
      }
      plugins.push(plugin);
      return this;
    },
    async mount(Component) {
      if (!root)
        throw new Error(`Root element with ID: "${rootID}" not found!`);

      const cssPromises = this.cssFiles.map(file => {
          return new Promise(resolve => {
              const link = document.createElement("link");
              link.rel = "stylesheet";
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
      await root.appendChild(element);
    },
    enableDevMode: function () {
      //dev_enabled = true; - temporarly dissabled, making a better dev_mode after project finished
    },
  };

  return app;
}
