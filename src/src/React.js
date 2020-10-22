const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);

const makeTextNode = content => ({
  type: "TEXT_ELEMENT",
  props: {
    children: [],
    nodeValue: content
  }
});

class React {
  constructor(params = {}) {
    this.nextUnitOfWork = null;
    this.loopId = null;
    this.wipeRoot = null;
    this.currentRoot = null;
    if (params.onComplete) {
      this.onComplete = params.onComplete;
    }
  }

  render(element, container) {
    this.wipeRoot = {
      dom: container,
      alternate: this.currentRoot,
      isRoot: true,
      props: {
        children: [element]
      }
    };
    this.nextUnitOfWork = this.wipeRoot;
  }
  performUnitOfWork(fiber) {
    if (!fiber.dom) fiber.dom = this._createDOM(fiber);
    this.layoutDOM(fiber);

    const elements = fiber.props.children;
    this.reconcileChildren(fiber, elements);

    if (fiber.child) {
      return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }
  start(deadline) {
    let shouldYield = false;
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }
    if (!this.nextUnitOfWork && this.wipeRoot) {
      this.currentRoot = this.wipeRoot;
      this.wipeRoot = null;
      if (this.onComplete) this.onComplete();
    }
    this.loopId = requestIdleCallback(this.start.bind(this));
  }
  stop() {
    cancelIdleCallback(this.loopId);
    this.currentRoot = null;
  }
  reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber = null;
      const sameType = oldFiber && element && element.type === oldFiber.type;
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE"
        };
      }
      if (element && !oldFiber) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "ADD"
        };
      }
      if (oldFiber && element && element.type !== oldFiber.type) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          alternate1: oldFiber,
          effectTag: "PLACEMENT"
        };
      }
      if (oldFiber && !element) {
        oldFiber.effectTag = "DELETE";
        this.layoutDOM(oldFiber);
      }
      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }
      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
      index++;
    }
  }
  layoutDOM(fiber) {
    let domParent = null;
    if (!fiber.isRoot) {
      domParent = fiber.parent.dom;
    }
    if (fiber.effectTag === "ADD" && fiber.dom !== null) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
      domParent.replaceChild(fiber.dom, fiber.alternate1.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
      this.updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === "DELETE") {
      domParent.removeChild(fiber.dom);
    }
  }
  updateDOM(dom, prevPros, nextProps) {
    // Object.keys(prevPros)
    //   .filter(isEvent)
    //   .filter(key => !(key in nextProps) || isNew(prevPros, next)(key))
    //   .forEach(name => {});

    Object.keys(prevPros)
      .filter(isProperty)
      .filter(isGone(prevPros, nextProps))
      .forEach(name => dom.setAttribute(name, ""));

    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevPros, nextProps))
      .forEach(name => {
        dom instanceof Text
          ? (dom[name] = nextProps[name])
          : dom.setAttribute(name, nextProps[name]);
      });
  }
  _createDOM(fiber) {
    const dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
    this.updateDOM(dom, {}, fiber.props);
    return dom;
  }
}

React.createElement = function(type, props, ...args) {
  let children = args.length ? [].concat(...args) : null;
  children = children.map(v => (typeof v === "string" ? makeTextNode(v) : v));

  if (!props) {
    props = {};
  }
  props.children = children;
  return { type, props };
};

export default React;
