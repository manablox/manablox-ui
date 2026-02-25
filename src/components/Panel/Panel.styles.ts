export const PANEL_STYLES = `
:host {
  display: block;
}

.mb-panel {
  border: var(--mb-panel-border, 1px solid var(--mb-panel-border-color));
  border-radius: var(--mb-panel-border-radius);
  background: var(--mb-panel-background);
  color: var(--mb-panel-color);
}
.mb-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mb-panel-header-padding);
  background: var(--mb-panel-header-background);
  border-bottom: var(--mb-panel-header-border-bottom, 1px solid var(--mb-panel-border-color));
}
.mb-panel-header-content { display: flex; align-items: center; gap: var(--mb-panel-header-gap, 0.5rem); }
.mb-panel-toggle-button { background: none; border: none; cursor: pointer; padding: 0.25rem; }
.mb-panel-content { padding: var(--mb-panel-content-padding); }
.mb-panel-footer { padding: var(--mb-panel-footer-padding); border-top: var(--mb-panel-footer-border-top, 1px solid var(--mb-panel-border-color)); }
.mb-panel-collapsed .mb-panel-content { display: none; }
`;
