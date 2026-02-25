export const TOGGLEBUTTON_STYLES = `
:host{display:inline-block}
.mb-togglebutton{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:var(--mb-togglebutton-border-width,1px) solid var(--mb-togglebutton-border-color,rgba(0,0,0,0.12));background:var(--mb-togglebutton-bg,#fff);color:var(--mb-togglebutton-color,#000);padding:var(--mb-togglebutton-padding,0.5rem 0.75rem);border-radius:var(--mb-togglebutton-border-radius,4px);transition:background .12s,border-color .12s,box-shadow .12s}
.mb-togglebutton:hover{border-color:var(--mb-togglebutton-border-hover-color,rgba(0,0,0,0.24))}
.mb-togglebutton:focus{outline:none}
.mb-togglebutton:focus-visible{box-shadow:0 0 0 3px var(--mb-togglebutton-focus-ring, rgba(0,122,217,0.12))}
.mb-togglebutton-checked{background:var(--mb-togglebutton-checked-bg,var(--mb-primary,#007ad9));color:var(--mb-togglebutton-checked-color,#fff);border-color:var(--mb-togglebutton-checked-border,var(--mb-primary,#007ad9))}
.mb-togglebutton.disabled{cursor:not-allowed;opacity:var(--mb-togglebutton-disabled-opacity,0.6)}
.mb-togglebutton .mb-togglebutton-icon{margin-right:0.5rem;display:inline-flex;align-items:center}
`;
export {};
