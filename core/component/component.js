/**
 * @fileoverview The `Component` class — the core runtime object for every Ferali component.
 * Manages the component lifecycle (build, update, destroy), reactive props,
 * hook state storage, and automatic CSS injection/removal.
 */

import { COMPONENT } from '../node/identity.js';
import { randomString, miniHash, cloneObject } from '../utils/utils.js';
import { currentComponent as CURRENT_COMPONENT, STORAGE, COMPONENT_STACK } from '../hooks/storage.js';
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

/** Reference-counted registry for dynamically injected stylesheets. */
const STYLESHEET_REGISTRY = new Map();

/**
 * The Ferali component runtime class. Instances are created by `defineComponent`.
 * Handles the full lifecycle from build to destruction.
 */
export default class Component {
  #lifeCycle = {
    onInit: [],
    onMounted: [],
    onUpdate: [],
    onDestroy: []
  };

  /**
   * @param {{ render: Function, style?: { path: string }, onInit?: Function, onMounted?: Function, onUpdate?: Function, onDestroy?: Function }} config - The component configuration.
   */
  constructor(config) {
    this.render = config.render;
    this.instanceID = null;

    if (config.onInit) this.#lifeCycle.onInit.push(config.onInit);
    if (config.onMounted) this.#lifeCycle.onMounted.push(config.onMounted);
    if (config.onUpdate) this.#lifeCycle.onUpdate.push(config.onUpdate);
    if (config.onDestroy) this.#lifeCycle.onDestroy.push(config.onDestroy);

    /** Allows hooks to connect callbacks to lifecycle events dynamically. */
    this.addLifeCycleHook = (event, callback) => {
      if (this.#lifeCycle[event]) {
        this.#lifeCycle[event].push(callback);
      }
    };

    /** Executes all callbacks registered to a specific lifecycle event. */
    this.runLifeCycle = (event) => {
      if (this.#lifeCycle[event]) {
        this.#lifeCycle[event].forEach(cb => cb.call(this));
      }
    };

    // Normalize style configuration
    if (typeof config.style === 'string') {
      config.style = { path: config.style, localized: false };
    } else if (config.style && !config.style.path) {
      config.style = null; // Invalid style object
    }

    let props = {};
    /**
     * Sets the current props for this component instance. Called by the router and
     * parent components before `build()` or `update()`.
     * @param {Object} properties - The new props object.
     */
    this.useProps = (properties) => {
      props = Object.keys(properties).length === 0 ? {} : cloneObject(properties);
    };
    /** @returns {Object} The current props. */
    this.getProps = () => props;

    const INFO_DATA = Object.freeze({
      __isComponent: true,
      __identity: COMPONENT,
      __componentID: miniHash(config),
    });
    /** @returns {{ __isComponent: boolean, __identity: symbol, __componentID: number }} Frozen component metadata. */
    this.INFO = () => INFO_DATA;
    /** @returns {Object} The original config passed to `defineComponent`. */
    this.getConfig = () => config;

    let currentDOM = null;
    /** @returns {import('../node/vnode.js').VNode|null} The current live VNode tree. */
    this.getCurrentDOM = () => currentDOM;
    /**
     * Replaces the stored VNode reference. Used internally after build/update.
     * @param {import('../node/vnode.js').VNode|null} DOM
     */
    this.setNewDOM = (DOM) => { currentDOM = DOM; };

    let bluePrint = null;
    this.defineBluePrint = () => {
      if (bluePrint === null) bluePrint = config.render.call(this);
    };
    /** @returns {Function|null} The compiled blueprint function. */
    this.accessBluePrint = () => bluePrint;
  }

  /**
   * Builds the component for the first time: injects CSS, runs the render function,
   * and constructs the real DOM. No-op if already built.
   * @returns {Promise<void>}
   */
  async build() {
    if (this.getCurrentDOM() !== null) return;
    
    this.runLifeCycle('onInit');

    const START = performance.now();
    this.instanceID = randomSelector();
    CURRENT_COMPONENT.component = this;
    COMPONENT_STACK.push(this);

    const config = this.getConfig();
    const cid = this.INFO().__componentID;
    if (config.style && config.style.path) {
      const path = config.style.path;
      // Use componentID (cid) for CSS scoping so all instances share one stylesheet
      const href = config.style.localized
        ? `${path}?localized=true&ferali-cid=${cid}`
        : path;

      let count = STYLESHEET_REGISTRY.get(href) || 0;
      if (count === 0) {
        await new Promise((resolve) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.dataset.feraliStyle = href;
          link.onload = resolve;
          link.onerror = resolve;
          document.head.appendChild(link);
        });
      }
      STYLESHEET_REGISTRY.set(href, count + 1);
    }

    // Reset hook index for the upcoming render
    if (STORAGE.STATE.has(this.instanceID)) {
      STORAGE.STATE.get(this.instanceID).hookIndex = 0;
    }

    await this.defineBluePrint();

    if (ISDEV) {
      const endTime = performance.now();
      devInfo['build-process'].startTime = START;
      devInfo['build-process'].compilationTime = endTime - START;
    }

    const computedDOM = await BUILD_DOM(this.accessBluePrint(), this.getProps());
    this.setNewDOM(computedDOM);

    this.runLifeCycle('onMounted');

    if (ISDEV) devInfo['build-process'].buildTime = performance.now() - devInfo['build-process'].startTime;
    CURRENT_COMPONENT.component = null;
    COMPONENT_STACK.pop();
  }

  /** @returns {Readonly<Object>} Lifecycle metadata. */
  get lifeCycleInfo() {
    return Object.freeze({
      onInit: [...this.#lifeCycle.onInit],
      onMounted: [...this.#lifeCycle.onMounted],
      onUpdate: [...this.#lifeCycle.onUpdate],
      onDestroy: [...this.#lifeCycle.onDestroy],
    });
  }

  /**
   * Re-renders the component in place using the VDOM diffing engine.
   * No-op if the component has not been built yet.
   * @returns {Promise<void>}
   */
  async update() {
    if (this.getCurrentDOM() !== null && !this.isUpdating) {
      this.isUpdating = true;

      // Set context for hooks and hyperscript scoping
      CURRENT_COMPONENT.component = this;
      COMPONENT_STACK.push(this);
      if (STORAGE.STATE.has(this.instanceID)) {
        STORAGE.STATE.get(this.instanceID).hookIndex = 0;
      }

      const newVdom = this.accessBluePrint()(this.getProps());

      // Tag the root of the new tree with the instance ID
      newVdom.props = newVdom.props || {};
      newVdom.props['ferali-id'] = this.instanceID;

      // Clear context after render
      CURRENT_COMPONENT.component = null;
      COMPONENT_STACK.pop();

      await UPDATE_DOM(this.getCurrentDOM(), newVdom, this.getCurrentDOM().ell.parentNode);
      this.setNewDOM(newVdom);
      
      this.runLifeCycle('onUpdate');
      this.isUpdating = false;
    }
  }

  /**
   * Destroys the component: removes its CSS if it was the last user, tears down
   * the VDOM tree, and clears all hook state from storage.
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this.getCurrentDOM() === null || this.isDestroyed) return;
    this.isDestroyed = true;

    this.runLifeCycle('onDestroy');

    const config = this.getConfig();
    const cid = this.INFO().__componentID;
    if (config.style && config.style.path) {
      const path = config.style.path;
      const href = config.style.localized
        ? `${path}?localized=true&ferali-cid=${cid}`
        : path;

      let count = STYLESHEET_REGISTRY.get(href) || 0;
      if (count > 0) {
        count--;
        if (count === 0) {
          const link = document.querySelector(`link[data-ferali-style="${href}"]`);
          if (link) link.remove();
          STYLESHEET_REGISTRY.delete(href);
        } else {
          STYLESHEET_REGISTRY.set(href, count);
        }
      }
    }

    await DESTROY_DOM(this.getCurrentDOM());
    this.setNewDOM(null);

    if (this.instanceID) {
      STORAGE.STATE.delete(this.instanceID);
      STORAGE.EFFECT.delete(this.instanceID);
      STORAGE.REF.delete(this.instanceID);
    }
  }
}
