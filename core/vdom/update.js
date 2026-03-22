import { buildNode } from './fullBuild.js';
import { DESTROY_DOM } from './destroy.js';
import { propDiff } from './propDiff.js';

export async function UPDATE_DOM(oldNode, newNode, parentDOM) {
  if (!oldNode) {
    if (newNode) {
      await buildNode(newNode);
      parentDOM.appendChild(newNode.isComponent ? newNode.component.getCurrentDOM().ell : newNode.ell);
    }
    return;
  }
  if (!newNode) {
    if (oldNode.isComponent) {
      parentDOM.removeChild(oldNode.component.getCurrentDOM().ell);
    } else {
      parentDOM.removeChild(oldNode.ell);
    }
    await DESTROY_DOM(oldNode);
    return;
  }

  // Component Diffing
  if (oldNode.isComponent || newNode.isComponent) {
    if (oldNode.isComponent && newNode.isComponent && oldNode.component.getConfig() === newNode.component.getConfig()) {
      await propDiff(oldNode.component, newNode.props);
      newNode.component = oldNode.component;
      newNode.ell = oldNode.ell;
    } else {
      await buildNode(newNode);
      const oldDOMNode = oldNode.isComponent ? oldNode.component.getCurrentDOM().ell : oldNode.ell;
      const newDOMNode = newNode.isComponent ? newNode.component.getCurrentDOM().ell : newNode.ell;
      parentDOM.replaceChild(newDOMNode, oldDOMNode);
      await DESTROY_DOM(oldNode);
    }
    return;
  }

  // Text Diffing
  if (typeof oldNode.children === 'string' || typeof newNode.children === 'string') {
    if (typeof oldNode.children === 'string' && typeof newNode.children === 'string') {
      if (oldNode.children !== newNode.children) {
        oldNode.ell.textContent = newNode.children;
      }
      newNode.ell = oldNode.ell;
    } else {
      await buildNode(newNode);
      parentDOM.replaceChild(newNode.ell, oldNode.ell);
      await DESTROY_DOM(oldNode);
    }
    return;
  }

  // Element Diffing
  if (oldNode.tag !== newNode.tag) {
    await buildNode(newNode);
    parentDOM.replaceChild(newNode.ell, oldNode.ell);
    await DESTROY_DOM(oldNode);
    return;
  }

  // Same tag, update props
  newNode.ell = oldNode.ell;
  const oldProps = oldNode.props || {};
  const newProps = newNode.props || {};
  
  // Remove missing
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        newNode.ell.removeEventListener(eventName, oldProps[key]);
      } else {
        newNode.ell.removeAttribute(key);
      }
    }
  }
  // Add/Update new
  for (const key in newProps) {
    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        if (oldProps[key]) newNode.ell.removeEventListener(eventName, oldProps[key]);
        if (newProps[key]) newNode.ell.addEventListener(eventName, newProps[key]);
      } else {
        newNode.ell.setAttribute(key, newProps[key]);
      }
    }
  }

  // Diff children (keyed diffing!)
  const oldChildren = oldNode.children || [];
  const newChildren = newNode.children || [];
  
  const oldKeyMap = new Map();
  oldChildren.forEach((child, i) => {
    if (!child) return;
    const key = (child.props && child.props.key !== undefined) ? child.props.key : i;
    oldKeyMap.set(key, child);
  });

  const parentForChildren = newNode.ell;
  
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    if (!newChild) continue;
    
    const key = (newChild.props && newChild.props.key !== undefined) ? newChild.props.key : i;
    const oldChild = oldKeyMap.get(key);
    
    if (oldChild) {
      oldKeyMap.delete(key);
      await UPDATE_DOM(oldChild, newChild, parentForChildren);
      const domNode = newChild.isComponent ? newChild.component.getCurrentDOM().ell : newChild.ell;
      if (parentForChildren.childNodes[i] !== domNode) {
        parentForChildren.insertBefore(domNode, parentForChildren.childNodes[i] || null);
      }
    } else {
      await buildNode(newChild);
      const domNode = newChild.isComponent ? newChild.component.getCurrentDOM().ell : newChild.ell;
      parentForChildren.insertBefore(domNode, parentForChildren.childNodes[i] || null);
    }
  }

  // Remove leftovers
  for (const [key, oldChild] of oldKeyMap) {
    const domNode = oldChild.isComponent ? oldChild.component.getCurrentDOM().ell : oldChild.ell;
    if (domNode && domNode.parentNode === parentForChildren) {
      parentForChildren.removeChild(domNode);
    }
    await DESTROY_DOM(oldChild);
  }
}
