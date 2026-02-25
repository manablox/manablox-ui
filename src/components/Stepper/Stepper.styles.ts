export const STEPPER_STYLES = `
.mb-stepper {
  display: flex;
  flex-direction: column;
  gap: var(--mb-stepper-gap, 1rem);
}

.mb-stepper.mb-stepper-vertical {
  flex-direction: row;
  align-items: flex-start;
}

.mb-stepper-nav {
  display: flex;
  align-items: center;
  gap: var(--mb-stepper-nav-gap, 0.5rem);
}

.mb-stepper.mb-stepper-vertical .mb-stepper-nav {
  flex-direction: column;
  align-items: stretch;
}

.mb-stepperitem {
  display: inline-flex;
  align-items: center;
  gap: var(--mb-stepper-item-gap, 0.5rem);
}

.mb-stepperitem-header {
  display: inline-flex;
  align-items: center;
  gap: var(--mb-stepper-item-header-gap, 0.5rem);
  border: none;
  background: transparent;
  color: var(--mb-stepper-item-color, inherit);
  padding: var(--mb-stepper-item-padding, 0.25rem 0.5rem);
  border-radius: var(--mb-stepper-item-border-radius, 0.5rem);
  cursor: pointer;
}

.mb-stepperitem-number {
  width: var(--mb-stepper-number-size, 1.75rem);
  height: var(--mb-stepper-number-size, 1.75rem);
  border-radius: 999px;
  border: var(--mb-stepper-number-border, 1px solid currentColor);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--mb-stepper-number-font-size, 0.875rem);
  font-weight: var(--mb-stepper-number-font-weight, 600);
}

.mb-stepperitem-title {
  font-size: var(--mb-stepper-title-font-size, 0.95rem);
}

.mb-stepperitem-active .mb-stepperitem-header {
  background: var(--mb-stepper-item-active-background, rgba(0, 0, 0, 0.06));
  color: var(--mb-stepper-item-active-color, inherit);
}

.mb-stepperitem-done .mb-stepperitem-number {
  background: var(--mb-stepper-item-done-number-background, currentColor);
  color: var(--mb-stepper-item-done-number-color, #fff);
}

.mb-stepperitem-disabled .mb-stepperitem-header {
  opacity: var(--mb-stepper-item-disabled-opacity, 0.5);
  cursor: not-allowed;
}

.mb-stepper-separator {
  flex: 1;
  height: var(--mb-stepper-separator-thickness, 1px);
  background: var(--mb-stepper-separator-background, currentColor);
  opacity: var(--mb-stepper-separator-opacity, 0.25);
}

.mb-stepper.mb-stepper-vertical .mb-stepper-separator {
  width: var(--mb-stepper-separator-thickness, 1px);
  min-height: var(--mb-stepper-separator-length, 1.5rem);
  height: auto;
}

.mb-stepper-panels {
  min-width: 0;
  flex: 1;
}

.mb-stepperpanel {
  display: block;
}

.mb-stepperpanel-content {
  display: block;
}
`;
