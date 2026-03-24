import { dev_enabled as ISDEV, devInfo } from '../app.js';

export async function buildNode(child) {
  if (child == undefined) return;

  if (typeof child.children == 'string') {
    child.ell = document.createTextNode(child.children);
    return;
  } else {
    if (child.isComponent) {
      child.component.useProps(child.props);
      await child.component.build();
      return;
    } else {
      const ELEMENT = document.createElement(child.tag);

      if (child.props) {
        Object.keys(child.props).forEach((properitie) => {
          if (properitie.startsWith('on')) {
            const event = properitie.toLowerCase().replace('on', '');
            ELEMENT.addEventListener(event, child.props[properitie]);
          } else {
            ELEMENT.setAttribute(properitie, child.props[properitie]);
          }
        });
      }
      for (let i = 0; i < child.children.length; i++) {
        const CHILD = child.children[i];
        if (CHILD == undefined) continue;
        await buildNode(CHILD);
        if (CHILD.isComponent)
          ELEMENT.appendChild(CHILD.component.getCurrentDOM().ell);
        else ELEMENT.appendChild(CHILD.ell);
      }

      child.ell = ELEMENT;
    }
  }
}

export async function BUILD_DOM(blueprint, propsContext = {}) {
  const result = blueprint(propsContext);

  if (ISDEV) devInfo['build-process'].startTime = performance.now();

  await buildNode(result);
  return result;
}
