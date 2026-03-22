import { h } from '../node/h.js';
import { useComponent } from './useComponent.js';
import { compareObjects } from '../utils/utils.js';

import { compile as COMPILE } from '../compiler/compiler.js';

export function useTemplate(templateString, contextObject) {
  const result = COMPILE(templateString);

  const blueprint = (props = contextObject.props || {}) => {
    if (!contextObject.props) contextObject.props = {};

    if (!compareObjects(props, contextObject.props))
      Object.assign(contextObject.props, props);

    return result(contextObject, h, useComponent);
  };
  return blueprint;
}
