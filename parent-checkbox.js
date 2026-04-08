export default class ParentCheckbox {
  constructor(root) {
    if (!root) throw new Error('Root element missing');
    this.rootElement = root;
    this.childElements = (this.rootElement.getAttribute('aria-controls') ?? '')
      .trim()
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((element) => element instanceof HTMLInputElement);
    this.eventController = new AbortController();
    this.destroyed = false;
    this.initialize();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.eventController.abort();
    this.rootElement.removeAttribute('data-parent-checkbox-initialized');
  }

  initialize() {
    const { signal } = this.eventController;
    this.rootElement.addEventListener('change', this.handleRootChange, { signal });
    for (const child of this.childElements) {
      child.addEventListener('change', this.handleChildChange, { signal });
    }
    this.update();
    this.rootElement.setAttribute('data-parent-checkbox-initialized', '');
  }

  handleRootChange = () => {
    const { checked } = this.rootElement;
    this.rootElement.indeterminate = false;
    for (const child of this.childElements) {
      child.checked = checked;
    }
  };

  handleChildChange = () => {
    this.update();
  };

  update() {
    let count = 0;
    for (const child of this.childElements) {
      if (child.checked) {
        count++;
      }
    }
    const every = count === this.childElements.length;
    this.rootElement.checked = every;
    this.rootElement.indeterminate = !every && count > 0;
  }
}
