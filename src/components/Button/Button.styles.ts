export const BUTTON_STYLES = `
:host {
  display: inline-flex;
}

.mb-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mb-button-gap);
  cursor: pointer;
  user-select: none;
  overflow: visible;
  position: relative;
  text-decoration: none;
  padding: var(--mb-button-padding-y) var(--mb-button-padding-x);
  font-size: 1rem;
  font-family: inherit;
  border-radius: var(--mb-button-border-radius);
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  background: var(--mb-button-primary-background, var(--mb-button-primary-background));
  color: var(--mb-button-primary-color, var(--mb-button-primary-color));
  outline-color: transparent;
  transition: background var(--mb-button-transition-duration), color var(--mb-button-transition-duration), border-color var(--mb-button-transition-duration), opacity var(--mb-button-transition-duration), box-shadow var(--mb-button-transition-duration);
  -webkit-appearance: none;
  appearance: none;
}

.mb-button.mb-component { /* keep marker for components */ }

.mb-button:focus-visible {
  box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-focus-ring-color, rgba(0,0,0,0));
  outline: none;
}

.mb-button-icon-only {
  padding-left: 0;
  padding-right: 0;
  width: var(--mb-button-icon-only-width);
  justify-content: center;
}

.mb-button-icon-left .mb-button-icon,
.mb-button-icon-right .mb-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mb-button-icon-left .mb-button-icon { margin-right: calc(var(--mb-button-gap) / 2); }
.mb-button-icon-right .mb-button-icon { margin-left: calc(var(--mb-button-gap) / 2); }

.mb-button-loading { pointer-events: none; }
.mb-button-loading .mb-button-loading-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: calc(var(--mb-button-gap) / 2);
}

.mb-button-loading .mb-button-icon { display: none; }

.mb-button-sm {
  font-size: var(--mb-button-sm-font-size);
  padding: var(--mb-button-sm-padding-y) var(--mb-button-sm-padding-x);
}
.mb-button-sm.mb-button-icon-only { width: var(--mb-button-sm-icon-only-width); }

.mb-button-lg {
  font-size: var(--mb-button-lg-font-size);
  padding: var(--mb-button-lg-padding-y) var(--mb-button-lg-padding-x);
}
.mb-button-lg.mb-button-icon-only { width: var(--mb-button-lg-icon-only-width); }

/* Severity variants */
.mb-button-secondary {
  background: var(--mb-button-secondary-background);
  color: var(--mb-button-secondary-color);
  border-color: var(--mb-button-secondary-border-color, transparent);
}
.mb-button-secondary:hover { background: var(--mb-button-secondary-hover-background); color: var(--mb-button-secondary-hover-color); border-color: var(--mb-button-secondary-hover-border-color, transparent); }
.mb-button-secondary:active { background: var(--mb-button-secondary-active-background); color: var(--mb-button-secondary-active-color); border-color: var(--mb-button-secondary-active-border-color, transparent); }

.mb-button-success {
  background: var(--mb-button-success-background);
  color: var(--mb-button-success-color);
  border-color: var(--mb-button-success-border-color, transparent);
}
.mb-button-success:hover { background: var(--mb-button-success-hover-background); color: var(--mb-button-success-hover-color); border-color: var(--mb-button-success-hover-border-color, transparent); }
.mb-button-success:active { background: var(--mb-button-success-active-background); color: var(--mb-button-success-active-color); border-color: var(--mb-button-success-active-border-color, transparent); }

.mb-button-info {
  background: var(--mb-button-info-background);
  color: var(--mb-button-info-color);
  border-color: var(--mb-button-info-border-color, transparent);
}
.mb-button-info:hover { background: var(--mb-button-info-hover-background); color: var(--mb-button-info-hover-color); border-color: var(--mb-button-info-hover-border-color, transparent); }
.mb-button-info:active { background: var(--mb-button-info-active-background); color: var(--mb-button-info-active-color); border-color: var(--mb-button-info-active-border-color, transparent); }

.mb-button-warn {
  background: var(--mb-button-warn-background);
  color: var(--mb-button-warn-color);
  border-color: var(--mb-button-warn-border-color, transparent);
}
.mb-button-warn:hover { background: var(--mb-button-warn-hover-background); color: var(--mb-button-warn-hover-color); border-color: var(--mb-button-warn-hover-border-color, transparent); }
.mb-button-warn:active { background: var(--mb-button-warn-active-background); color: var(--mb-button-warn-active-color); border-color: var(--mb-button-warn-active-border-color, transparent); }

.mb-button-danger {
  background: var(--mb-button-danger-background);
  color: var(--mb-button-danger-color);
  border-color: var(--mb-button-danger-border-color, transparent);
}
.mb-button-danger:hover { background: var(--mb-button-danger-hover-background); color: var(--mb-button-danger-hover-color); border-color: var(--mb-button-danger-hover-border-color, transparent); }
.mb-button-danger:active { background: var(--mb-button-danger-active-background); color: var(--mb-button-danger-active-color); border-color: var(--mb-button-danger-active-border-color, transparent); }

.mb-button-contrast {
  background: var(--mb-button-contrast-background);
  color: var(--mb-button-contrast-color);
  border-color: var(--mb-button-contrast-border-color, transparent);
}
.mb-button-contrast:hover { background: var(--mb-button-contrast-hover-background); color: var(--mb-button-contrast-hover-color); border-color: var(--mb-button-contrast-hover-border-color, transparent); }
.mb-button-contrast:active { background: var(--mb-button-contrast-active-background); color: var(--mb-button-contrast-active-color); border-color: var(--mb-button-contrast-active-border-color, transparent); }

/* Outlined */
.mb-button-outlined {
  background: transparent;
  border-color: var(--mb-button-outlined-plain-border-color, var(--mb-surface-200));
  color: var(--mb-button-outlined-plain-color, var(--mb-surface-700));
}
.mb-button-outlined:hover { background: var(--mb-button-outlined-plain-hover-background); border-color: var(--mb-button-outlined-plain-border-color); }

/* Text */
.mb-button-text {
  background: transparent;
  border-color: transparent;
  color: var(--mb-button-text-primary-color, var(--mb-button-text-primary-color));
}
.mb-button-text:hover { background: var(--mb-button-text-plain-hover-background); }

/* Raised */
.mb-button-raised { box-shadow: var(--mb-button-raised-shadow); }

/* Rounded */
.mb-button-rounded { border-radius: var(--mb-button-rounded-border-radius); }

/* Link */
.mb-button-link { background: transparent; border-color: transparent; color: var(--mb-button-link-color); padding: 0; }
.mb-button-link:hover { color: var(--mb-button-link-hover-color); }

/* Disabled */
.mb-button[disabled], .mb-button.mb-disabled {
  opacity: var(--mb-disabled-opacity);
  pointer-events: none;
}

/* Focus visible ring with severity-aware color */
.mb-button:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-focus-ring-color, rgba(0,0,0,0)); }

/* Hover/active fallback for primary (when not using severity specific variables) */
.mb-button:hover { filter: brightness(0.98); }
.mb-button:active { transform: translateY(0.5px); }

/* Icon */
.mb-button .mb-button-icon { font-size: var(--mb-icon-size); line-height: 1; }
.mb-button .mb-button-loading-icon { font-size: var(--mb-icon-size); line-height: 1; }
.mb-button [part="icon"],
.mb-button [part="loading-icon"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Badge */
.mb-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--mb-button-badge-size);
  height: var(--mb-button-badge-size);
  font-size: calc(var(--mb-button-badge-size) * 0.75);
  border-radius: 999px;
  margin-left: 0.5rem;
}

/* Focus styles for contrast/danger variants that define custom focus ring color */
.mb-button-contrast:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-contrast-focus-ring-color); }
.mb-button-danger:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-danger-focus-ring-color); }
.mb-button-help:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-help-focus-ring-color); }
.mb-button-warn:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-warn-focus-ring-color); }
.mb-button-success:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-success-focus-ring-color); }
.mb-button-info:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-info-focus-ring-color); }
.mb-button-secondary:focus-visible { box-shadow: 0 0 0 var(--mb-button-focus-ring-width) var(--mb-button-secondary-focus-ring-color); }

/* Utility classes */
.mb-button-label { font-weight: var(--mb-button-label-font-weight); }

/* ensure icon-only shows accessible size */
@media (prefers-reduced-motion: reduce) { .mb-button { transition: none; } }
`;
export {};
