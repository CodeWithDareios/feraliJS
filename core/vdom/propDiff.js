/**
 * @fileoverview Component prop diffing utility.
 * Used during VDOM reconciliation to determine if a component's
 * props have changed, and if so, trigger an update.
 */

import { compareObjects } from '../utils/utils.js';

/**
 * Diffs the current props of a component against newly incoming props.
 * If they differ, applies the new props and triggers a re-render.
 *
 * @param {import('../component/component.js').default} Component - The Ferali component instance.
 * @param {Object} newProps - The new props object to compare against.
 * @returns {Promise<void>}
 */
export async function propDiff(Component, newProps) {
  const originalProps = Component.getProps();
  if (!compareObjects(originalProps, newProps)) {
    Component.useProps(newProps);
    await Component.update();
  }
}
