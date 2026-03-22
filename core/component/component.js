import { COMPONENT } from '../node/identity.js';
import { randomString, miniHash, cloneObject } from '../utils/utils.js';
import { currentComponent as CURRENT_COMPONENT, STORAGE } from '../hooks/storage.js';
import { BUILD_DOM } from '../vdom/fullBuild.js';
import { UPDATE_DOM } from '../vdom/update.js';
import { DESTROY_DOM } from '../vdom/destroy.js';
import { dev_enabled as ISDEV, devInfo } from '../app.js';

const usedSelectors = [];
const randomSelector = () => {
  let selector = randomString();
  while (usedSelectors.includes(selector)) {
    selector = randomString();
  }
  usedSelectors.push(selector);
  return selector;
};

export default class Component {
  #lifeCycle = {};

  constructor(config) {
    this.render = config.render;
    this.instanceID = null;

    let props = {};
    this.useProps = (properities) => {
      props =
        Object.keys(properities).length == 0 ? {} : cloneObject(properities);
    };
    this.getProps = () => props;

    const INFO_DATA = Object.freeze({
      __isComponent: true,
      __identity: COMPONENT,
      __componentID: miniHash(config),
    });
    this.INFO = () => INFO_DATA;
    this.getConfig = () => config;

    let currentDOM = null;
    this.getCurrentDOM = () => currentDOM;
    this.setNewDOM = (DOM) => {
      currentDOM = DOM;
    };

    let bluePrint = null;
    this.defineBluePrint = () => {
      if (bluePrint === null) bluePrint = config.render.call(this);
    };
    this.accessBluePrint = () => bluePrint;
  }
  async build() {
    if (this.getCurrentDOM() === null) {
      const START = performance.now()
      this.instanceID = randomSelector();
      CURRENT_COMPONENT.component = this;

      await this.defineBluePrint();
      if (ISDEV) {
        const DATA_DEV_START = START;
        const endTime = performance.now();

        const compilationTime = endTime - DATA_DEV_START;
        devInfo['build-process'].startTime =DATA_DEV_START,
        devInfo['build-process'].compilationTime = compilationTime;
      }
      const computedDOM = await BUILD_DOM(this.accessBluePrint(), this.getProps());
      this.setNewDOM(computedDOM);
      if (ISDEV) devInfo['build-process'].buildTime = performance.now() - devInfo['build-process'].startTime 
      CURRENT_COMPONENT.component = null;
    }
  }

  get lifeCycleInfo() {
    return Object.freeze({ ...this.#lifeCycle });
  }

  async update() {
    if (this.getCurrentDOM() !== null && !this.isUpdating) {
      this.isUpdating = true;
      const newVdom = this.accessBluePrint()(this.getProps());
      await UPDATE_DOM(this.getCurrentDOM(), newVdom, this.getCurrentDOM().ell.parentNode);
      this.setNewDOM(newVdom);
      this.isUpdating = false;
    }
  }

  async destroy() {
    if (this.getCurrentDOM() !== null && !this.isDestroyed) {
      this.isDestroyed = true;
      await DESTROY_DOM(this.getCurrentDOM());
      this.setNewDOM(null);

      if (this.instanceID) {
        STORAGE.STATE.delete(this.instanceID);
        STORAGE.EFFECT.delete(this.instanceID);
      }
    }
  }
}
