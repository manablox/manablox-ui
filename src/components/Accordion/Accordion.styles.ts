export const ACCORDION_STYLES = `
.mb-accordion {
  display: block;
  width: 100%;
}

.mb-accordionpanel {
  border-style: solid;
  border-width: var(--mb-accordion-panel-border-width);
  border-color: var(--mb-accordion-panel-border-color);
}

.mb-accordionpanel:first-child .mb-accordionheader {
  border-top-left-radius: var(--mb-accordion-header-first-top-border-radius);
  border-top-right-radius: var(--mb-accordion-header-first-top-border-radius);
  border-top-width: var(--mb-accordion-header-first-border-width);
}

.mb-accordionpanel:last-child .mb-accordionheader {
  border-bottom-left-radius: var(--mb-accordion-header-last-bottom-border-radius);
  border-bottom-right-radius: var(--mb-accordion-header-last-bottom-border-radius);
}

.mb-accordionpanel:last-child.mb-accordionpanel-active .mb-accordionheader {
  border-bottom-left-radius: var(--mb-accordion-header-last-active-bottom-border-radius);
  border-bottom-right-radius: var(--mb-accordion-header-last-active-bottom-border-radius);
}

.mb-accordionheader {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  text-align: left;
  padding: var(--mb-accordion-header-padding);
  border: solid transparent;
  border-width: var(--mb-accordion-header-border-width);
  border-color: var(--mb-accordion-header-border-color);
  border-radius: var(--mb-accordion-header-border-radius);
  background: var(--mb-accordion-header-background);
  color: var(--mb-accordion-header-color);
  font-weight: var(--mb-accordion-header-font-weight);
  cursor: pointer;
  transition:
    color var(--mb-accordion-transition-duration),
    background-color var(--mb-accordion-transition-duration),
    border-color var(--mb-accordion-transition-duration);
}

.mb-accordionheader:hover {
  background: var(--mb-accordion-header-hover-background);
  color: var(--mb-accordion-header-hover-color);
}

.mb-accordionpanel-active .mb-accordionheader {
  background: var(--mb-accordion-header-active-background);
  color: var(--mb-accordion-header-active-color);
}

.mb-accordionpanel-active .mb-accordionheader:hover {
  background: var(--mb-accordion-header-active-hover-background);
  color: var(--mb-accordion-header-active-hover-color);
}

.mb-accordionheader:focus-visible {
  outline: var(--mb-accordion-header-focus-ring-width) var(--mb-accordion-header-focus-ring-style) var(--mb-accordion-header-focus-ring-color);
  outline-offset: var(--mb-accordion-header-focus-ring-offset);
  box-shadow: var(--mb-accordion-header-focus-ring-shadow);
}

.mb-accordionheader-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mb-accordion-header-toggle-icon-color);
  transition:
    transform var(--mb-accordion-transition-duration),
    color var(--mb-accordion-transition-duration);
}

.mb-accordionheader:hover .mb-accordionheader-toggle-icon {
  color: var(--mb-accordion-header-toggle-icon-hover-color);
}

.mb-accordionpanel-active .mb-accordionheader-toggle-icon {
  transform: rotate(90deg);
  color: var(--mb-accordion-header-toggle-icon-active-color);
}

.mb-accordionpanel-active .mb-accordionheader:hover .mb-accordionheader-toggle-icon {
  color: var(--mb-accordion-header-toggle-icon-active-hover-color);
}

.mb-accordioncontent {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--mb-accordion-transition-duration) ease;
}

.mb-accordioncontent-inner {
  min-height: 0;
  overflow: hidden;
  border-style: solid;
  border-width: var(--mb-accordion-content-border-width);
  border-color: var(--mb-accordion-content-border-color);
  background: var(--mb-accordion-content-background);
  color: var(--mb-accordion-content-color);
  padding: 0 1.125rem;
}

.mb-accordionpanel-active .mb-accordioncontent {
  grid-template-rows: 1fr;
}

.mb-accordionpanel-active .mb-accordioncontent-inner {
  padding: var(--mb-accordion-content-padding);
}
`;
