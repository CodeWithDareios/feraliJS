import { compareObjects } from '../utils/utils.js';

export async function propDiff(Component, newProps) {
  const originalProps = Component.getProps();
  if (!compareObjects(originalProps, newProps)) {
    Component.useProps(newProps);
    await Component.update();
  }
}
