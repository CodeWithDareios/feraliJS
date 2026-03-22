export async function DESTROY_DOM(dom) {
  if (dom.isComponent) {
    dom.props = null; //TODO: implement props destroy later on for better memory cleanup
    await dom.component.destroy();
    dom.component = null;
  } else {
    if (typeof dom.children == 'string') {
      dom.ell = null;
    } else {
      //attribute removal + events
      for (const attribute of Object.keys(dom.props)) {
        if (
          attribute.startsWith('on') &&
          typeof dom.props[attribute] == 'function'
        )
          await dom.ell.removeEventListener(
            attribute.replace('on', '').toLocaleLowerCase(),
            dom.props[attribute]
          );
        else await dom.ell.removeAttribute(attribute);
      }
      //child deletion
      for (let i = 0; i < dom.children.length; i++) {
        let child = dom.children[i];
        if (child.isComponent) {
          await child.component.getCurrentDOM().ell.remove();
          await DESTROY_DOM(child);
        } else {
          await child.ell.remove();
          await DESTROY_DOM(child);
          child = null;
        }
      }
    }
  }
}
