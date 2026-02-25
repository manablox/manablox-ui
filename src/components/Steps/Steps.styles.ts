export const STEPS_STYLES = `
:host{display:block}
.mb-steps{display:block}
.mb-steps-list{display:flex;align-items:flex-start;justify-content:space-between;list-style:none;margin:0;padding:0;position:relative}
.mb-step{display:flex;flex:1 1 0;position:relative;align-items:center;justify-content:center}
.mb-steps-separator{position:absolute;top:calc(var(--mb-steps-item-number-size,2rem)/2);left:50%;right:-50%;height:1px;background:var(--mb-steps-separator-background,var(--mb-content-border-color,#d1d5db));z-index:0}
.mb-step:last-child .mb-steps-separator{display:none}
.mb-step-header-action{display:inline-flex;flex-direction:column;align-items:center;gap:var(--mb-steps-item-link-gap,0.5rem);background:transparent;border:0;padding:0.25rem;cursor:pointer;border-radius:var(--mb-steps-item-link-border-radius,var(--mb-content-border-radius,6px));position:relative;z-index:1}
.mb-step-header-action:focus-visible{outline:var(--mb-steps-item-link-focus-ring-width,var(--mb-focus-ring-width,1px)) var(--mb-steps-item-link-focus-ring-style,var(--mb-focus-ring-style,solid)) var(--mb-steps-item-link-focus-ring-color,var(--mb-focus-ring-color,#10b981));outline-offset:var(--mb-steps-item-link-focus-ring-offset,var(--mb-focus-ring-offset,2px));box-shadow:var(--mb-steps-item-link-focus-ring-shadow,var(--mb-focus-ring-shadow,none))}
.mb-step-header{width:var(--mb-steps-item-number-size,2rem);height:var(--mb-steps-item-number-size,2rem);border-radius:var(--mb-steps-item-number-border-radius,50%);border:1px solid var(--mb-steps-item-number-border-color,var(--mb-content-border-color,#d1d5db));background:var(--mb-steps-item-number-background,var(--mb-content-background,#fff));color:var(--mb-steps-item-number-color,var(--mb-text-muted-color,#6b7280));display:flex;align-items:center;justify-content:center;box-shadow:var(--mb-steps-item-number-shadow,none)}
.mb-step-number{font-size:var(--mb-steps-item-number-font-size,1rem);font-weight:var(--mb-steps-item-number-font-weight,500);line-height:1}
.mb-step-title{font-weight:var(--mb-steps-item-label-font-weight,500);color:var(--mb-steps-item-label-color,var(--mb-text-muted-color,#6b7280));text-align:center}
.mb-step-subtitle{font-size:0.875rem;color:var(--mb-text-muted-color,#6b7280);text-align:center}
.mb-step.mb-step-active .mb-step-header{background:var(--mb-steps-item-number-active-background,var(--mb-content-background,#fff));border-color:var(--mb-steps-item-number-active-border-color,var(--mb-primary-color,#10b981));color:var(--mb-steps-item-number-active-color,var(--mb-primary-color,#10b981))}
.mb-step.mb-step-active .mb-step-title{color:var(--mb-steps-item-label-active-color,var(--mb-primary-color,#10b981))}
.mb-step.mb-step-complete .mb-steps-separator{background:var(--mb-primary-color,#10b981)}
.mb-step.mb-step-disabled .mb-step-header-action{cursor:not-allowed;opacity:var(--mb-disabled-opacity,0.6)}
`;
