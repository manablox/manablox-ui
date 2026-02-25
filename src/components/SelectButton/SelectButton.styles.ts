export const SELECTBUTTON_STYLES = `
:host{display:inline-flex}
.mb-selectbutton{display:inline-flex;align-items:stretch;gap:0;border-radius:var(--mb-selectbutton-border-radius,var(--mb-form-field-border-radius,6px));overflow:hidden}
.mb-selectbutton.mb-disabled{opacity:var(--mb-disabled-opacity,0.6);pointer-events:none}
.mb-selectbutton.mb-invalid{box-shadow:0 0 0 1px var(--mb-selectbutton-invalid-border-color,var(--mb-form-field-invalid-border-color,#ef4444)) inset}
.mb-selectbutton .mb-togglebutton{display:inline-flex;align-items:center;justify-content:center;gap:var(--mb-togglebutton-gap,0.5rem);padding:var(--mb-togglebutton-padding,0.25rem 0.75rem);border:1px solid var(--mb-togglebutton-border-color,var(--mb-surface-200,#e5e7eb));background:var(--mb-togglebutton-background,var(--mb-surface-100,#f3f4f6));color:var(--mb-togglebutton-color,var(--mb-surface-500,#6b7280));cursor:pointer;transition:all var(--mb-togglebutton-transition-duration,var(--mb-transition-duration,0.2s));margin-left:-1px}
.mb-selectbutton .mb-togglebutton:first-child{border-top-left-radius:var(--mb-selectbutton-border-radius,var(--mb-form-field-border-radius,6px));border-bottom-left-radius:var(--mb-selectbutton-border-radius,var(--mb-form-field-border-radius,6px));margin-left:0}
.mb-selectbutton .mb-togglebutton:last-child{border-top-right-radius:var(--mb-selectbutton-border-radius,var(--mb-form-field-border-radius,6px));border-bottom-right-radius:var(--mb-selectbutton-border-radius,var(--mb-form-field-border-radius,6px))}
.mb-selectbutton .mb-togglebutton:hover{background:var(--mb-togglebutton-hover-background,var(--mb-surface-100,#f3f4f6));color:var(--mb-togglebutton-hover-color,var(--mb-surface-700,#374151))}
.mb-selectbutton .mb-togglebutton:focus-visible{position:relative;z-index:1;outline:var(--mb-togglebutton-focus-ring-width,var(--mb-focus-ring-width,1px)) var(--mb-togglebutton-focus-ring-style,var(--mb-focus-ring-style,solid)) var(--mb-togglebutton-focus-ring-color,var(--mb-focus-ring-color,#10b981));outline-offset:var(--mb-togglebutton-focus-ring-offset,var(--mb-focus-ring-offset,2px));box-shadow:var(--mb-togglebutton-focus-ring-shadow,var(--mb-focus-ring-shadow,none))}
.mb-selectbutton .mb-togglebutton.mb-selected{background:var(--mb-togglebutton-checked-background,var(--mb-surface-100,#f3f4f6));border-color:var(--mb-togglebutton-checked-border-color,var(--mb-surface-100,#f3f4f6));color:var(--mb-togglebutton-checked-color,var(--mb-surface-900,#111827))}
.mb-selectbutton .mb-togglebutton.mb-selected .mb-togglebutton-content{background:var(--mb-togglebutton-content-checked-background,var(--mb-surface-0,#fff));box-shadow:var(--mb-togglebutton-content-checked-shadow,none)}
.mb-togglebutton-content{display:inline-flex;align-items:center;gap:0.5rem;padding:var(--mb-togglebutton-content-padding,0.25rem 0.75rem);border-radius:var(--mb-togglebutton-content-border-radius,var(--mb-content-border-radius,6px))}
`;

