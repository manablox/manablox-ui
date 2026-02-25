export const TOOLBAR_STYLES = `
:host {
  display: block;
}

.mb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mb-toolbar-gap, 0.5rem);
  padding: var(--mb-toolbar-padding, 0.5rem 1rem);
  background: var(--mb-toolbar-background);
  color: var(--mb-toolbar-color);
}
.mb-toolbar-start, .mb-toolbar-center, .mb-toolbar-end { display: flex; align-items: center; gap: var(--mb-toolbar-section-gap, 0.5rem); }
.mb-toolbar-center { justify-content: center; flex: 1; }
.mb-toolbar-start { justify-content: flex-start; }
.mb-toolbar-end { justify-content: flex-end; }
`;
