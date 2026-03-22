import defineComponent from './defineComponent.js';

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
    changeProps: function (newProps = {}) {
      this.props = null;
      this.props = newProps;
    },
  };
}
