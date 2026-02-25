export const PAGINATOR_STYLES = `
:host {
  display: block;
}

.mb-paginator {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mb-paginator-gap);
  padding: var(--mb-paginator-padding);
  border-radius: var(--mb-paginator-border-radius);
  background: var(--mb-paginator-background);
  color: var(--mb-paginator-color);
}

.mb-paginator-first,
.mb-paginator-prev,
.mb-paginator-next,
.mb-paginator-last,
.mb-paginator-page {
  width: var(--mb-paginator-nav-button-width);
  height: var(--mb-paginator-nav-button-height);
  border: 0;
  border-radius: var(--mb-paginator-nav-button-border-radius);
  background: var(--mb-paginator-nav-button-background);
  color: var(--mb-paginator-nav-button-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color var(--mb-paginator-transition-duration),
    color var(--mb-paginator-transition-duration);
}

.mb-paginator-first:hover:not(:disabled),
.mb-paginator-prev:hover:not(:disabled),
.mb-paginator-next:hover:not(:disabled),
.mb-paginator-last:hover:not(:disabled),
.mb-paginator-page:hover:not(:disabled) {
  background: var(--mb-paginator-nav-button-hover-background);
  color: var(--mb-paginator-nav-button-hover-color);
}

.mb-paginator-first:focus-visible,
.mb-paginator-prev:focus-visible,
.mb-paginator-next:focus-visible,
.mb-paginator-last:focus-visible,
.mb-paginator-page:focus-visible,
.mb-paginator-rpp-dropdown:focus-visible,
.mb-paginator-pages-dropdown:focus-visible {
  outline: var(--mb-paginator-nav-button-focus-ring-width) var(--mb-paginator-nav-button-focus-ring-style) var(--mb-paginator-nav-button-focus-ring-color);
  outline-offset: var(--mb-paginator-nav-button-focus-ring-offset);
  box-shadow: var(--mb-paginator-nav-button-focus-ring-shadow);
}

.mb-paginator-first:disabled,
.mb-paginator-prev:disabled,
.mb-paginator-next:disabled,
.mb-paginator-last:disabled,
.mb-paginator-page:disabled {
  opacity: var(--mb-disabled-opacity);
  cursor: not-allowed;
}

.mb-paginator-page-selected {
  background: var(--mb-paginator-nav-button-selected-background);
  color: var(--mb-paginator-nav-button-selected-color);
}

.mb-paginator-current {
  margin: 0 0.5rem;
  color: var(--mb-paginator-current-page-report-color);
  white-space: nowrap;
}

.mb-paginator-rpp-dropdown,
.mb-paginator-pages-dropdown {
  height: var(--mb-paginator-nav-button-height);
  border-radius: var(--mb-form-field-border-radius);
  border: 1px solid var(--mb-form-field-border-color);
  padding: 0 0.5rem;
  background: var(--mb-form-field-background);
  color: var(--mb-form-field-color);
}

.mb-paginator-pages-dropdown {
  max-width: var(--mb-paginator-jump-to-page-input-max-width);
}
`;
