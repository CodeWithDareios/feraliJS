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
    useCss(link) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = link;
      document.head.appendChild(linkElement);
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
