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

  return {
    async mount(Component) {
      if (!root)
        throw new Error(`Root element with ID: "${rootID}" not found!`);

      const startTime = performance.now();

      await Component.build();
      await root.appendChild(Component.getCurrentDOM().ell);

      if (dev_enabled) {
        const endTime = performance.now() - startTime;
        console.log(`Render time: ${endTime}ms`);
        console.log(
          `Compilation time: ${devInfo['build-process'].compilationTime}ms`
        );
        console.log(`Build time: ${devInfo['build-process'].buildTime}ms`);
        console.log(
          `Exported project expected render time: ${
            Math.trunc(endTime * 0.1 * 1000) / 1000
          }ms - ${Math.trunc(endTime * 0.2 * 1000) / 1000}ms`
        );
      }
    },
    enableDevMode: function () {
      dev_enabled = true;
    },
  };
}
