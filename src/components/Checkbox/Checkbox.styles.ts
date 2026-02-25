export const CHECKBOX_STYLES = `
:host{display:inline-block}
.mb-checkbox{--size:var(--mb-checkbox-size,1rem);display:inline-flex;align-items:center;cursor:pointer;user-select:none}
.mb-checkbox-label{display:inline-flex;align-items:center;margin-inline-start:var(--mb-checkbox-label-gap,0.5rem)}
.mb-checkbox-label:empty{display:none}
.mb-checkbox.disabled{cursor:not-allowed;opacity:var(--mb-checkbox-disabled-opacity,0.6)}
.mb-checkbox-box{width:var(--size);height:var(--size);border-radius:var(--mb-checkbox-border-radius,4px);display:inline-flex;align-items:center;justify-content:center;border:var(--mb-checkbox-border-width,2px) solid var(--mb-checkbox-border-color,rgba(0,0,0,0.54));background:var(--mb-checkbox-bg,transparent);transition:background .12s,border-color .12s,box-shadow .12s}
.mb-checkbox:hover .mb-checkbox-box{border-color:var(--mb-checkbox-border-hover-color,rgba(0,0,0,0.7))}
.mb-checkbox-checked .mb-checkbox-box{background:var(--mb-checkbox-checked-bg,var(--mb-primary, #007ad9));border-color:var(--mb-checkbox-checked-border,var(--mb-primary, #007ad9));color:var(--mb-checkbox-checked-color,#fff)}
.mb-checkbox-box .mb-checkbox-icon{font-size:calc(var(--size) * 0.9);line-height:1;display:inline-block;transform:scale(0);transition:transform .12s}
.mb-checkbox-checked .mb-checkbox-box .mb-checkbox-icon{transform:scale(1)}
.mb-checkbox-box:focus{outline:none}
.mb-checkbox-box:focus-visible{box-shadow:0 0 0 3px var(--mb-checkbox-focus-ring, rgba(0,122,217,0.2))}
.mb-checkbox.invalid .mb-checkbox-box{border-color:var(--mb-checkbox-invalid-border-color,#d32f2f)}
.mb-checkbox.disabled .mb-checkbox-box{background:var(--mb-checkbox-disabled-bg, #f5f5f5);border-color:var(--mb-checkbox-disabled-border, #ddd)}

/* size variants */
.mb-checkbox.size-sm .mb-checkbox-box{--size:var(--mb-checkbox-size-sm,0.75rem)}
.mb-checkbox.size-md .mb-checkbox-box{--size:var(--mb-checkbox-size-md,1rem)}
.mb-checkbox.size-lg .mb-checkbox-box{--size:var(--mb-checkbox-size-lg,1.25rem)}

/* Hidden native input */
.mb-checkbox input[type="checkbox"]{position:absolute;opacity:0;width:0;height:0;margin:0;padding:0}

/* filled/outlined variants */
.mb-checkbox.variant-filled .mb-checkbox-box{background:var(--mb-checkbox-variant-filled-bg,var(--mb-primary,#007ad9));color:var(--mb-checkbox-variant-filled-color,#fff);border-color:var(--mb-checkbox-variant-filled-border,var(--mb-primary,#007ad9))}
.mb-checkbox.variant-outlined .mb-checkbox-box{background:transparent}
`;
export {};
