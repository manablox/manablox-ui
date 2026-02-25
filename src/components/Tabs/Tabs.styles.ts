export const TABS_STYLES = `
.mb-tabs {
  display: block;
  width: 100%;
}

.mb-tablist {
  position: relative;
  display: flex;
  align-items: stretch;
  border-bottom: var(--mb-tabs-tablist-border-width) solid transparent;
  border-color: var(--mb-tabs-tablist-border-color);
  background: var(--mb-tabs-tablist-background);
}

.mb-tabs-scrollable .mb-tablist {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  white-space: nowrap;
}

.mb-tabs-scrollable .mb-tab {
  flex: 0 0 auto;
}

.mb-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mb-tabs-tab-gap);
  margin: var(--mb-tabs-tab-margin);
  padding: var(--mb-tabs-tab-padding);
  border: solid transparent;
  border-width: var(--mb-tabs-tab-border-width);
  border-color: var(--mb-tabs-tab-border-color);
  background: var(--mb-tabs-tab-background);
  color: var(--mb-tabs-tab-color);
  font-weight: var(--mb-tabs-tab-font-weight);
  cursor: pointer;
  user-select: none;
  transition:
    color var(--mb-tabs-transition-duration),
    border-color var(--mb-tabs-transition-duration),
    background-color var(--mb-tabs-transition-duration);
}

.mb-tab:hover:not(:disabled) {
  background: var(--mb-tabs-tab-hover-background);
  color: var(--mb-tabs-tab-hover-color);
  border-color: var(--mb-tabs-tab-hover-border-color);
}

.mb-tab:focus-visible {
  outline: var(--mb-tabs-tab-focus-ring-width) var(--mb-tabs-tab-focus-ring-style) var(--mb-tabs-tab-focus-ring-color);
  outline-offset: var(--mb-tabs-tab-focus-ring-offset);
  box-shadow: var(--mb-tabs-tab-focus-ring-shadow);
}

.mb-tab:disabled {
  opacity: var(--mb-disabled-opacity);
  cursor: not-allowed;
}

.mb-tab-active {
  background: var(--mb-tabs-tab-active-background);
  color: var(--mb-tabs-tab-active-color);
  border-color: var(--mb-tabs-tab-active-border-color);
}

.mb-tab-active-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: var(--mb-tabs-active-bar-bottom);
  height: var(--mb-tabs-active-bar-height);
  background: var(--mb-tabs-active-bar-background);
  pointer-events: none;
}

.mb-tabpanels {
  background: var(--mb-tabs-tabpanel-background);
  color: var(--mb-tabs-tabpanel-color);
}

.mb-tabpanel {
  display: block;
  padding: var(--mb-tabs-tabpanel-padding);
}

.mb-tabpanel:focus-visible {
  outline: var(--mb-tabs-tabpanel-focus-ring-width) var(--mb-tabs-tabpanel-focus-ring-style) var(--mb-tabs-tabpanel-focus-ring-color);
  outline-offset: var(--mb-tabs-tabpanel-focus-ring-offset);
  box-shadow: var(--mb-tabs-tabpanel-focus-ring-shadow);
}

.mb-tabpanel[hidden] {
  display: none;
}
`;
