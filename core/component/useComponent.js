/**
 * @fileoverview The `useComponent` factory — creates a component node descriptor
 * that the VDOM engine treats as an embeddable child component.
 */

import defineComponent from './defineComponent.js';

/**
 * Creates a VNode-compatible component descriptor for embedding a Ferali component
 * inside another component's virtual DOM tree. Called internally by the template compiler
 * for every `@ComponentName({})` expression.
 *
 * @param {import('./component.js').default} component - The parent component definition to clone from.
 * @param {Object} [props={}] - Props to pass into the component instance.
 * @returns {{ component: import('./component.js').default, props: Object, isComponent: boolean, changeProps: Function }}
 */
export function useComponent(component, props = {}) {
  const componentInstance = () => {
    const result = defineComponent(component.getConfig());
    result.useProps(props);
    return result;
  };

  return {
    component: componentInstance(),
    props: props,
    isComponent: true,
    /**
     * Replaces the props on this component descriptor.
     * @param {Object} [newProps={}] - The new props to apply.
     */
    changeProps(newProps = {}) {
      this.props = null;
      this.props = newProps;
    },
  };
}
