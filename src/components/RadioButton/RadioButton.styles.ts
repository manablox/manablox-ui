export const RADIOBUTTON_STYLES = `
:host{display:inline-block}
.mb-radiobutton{display:inline-flex;align-items:center;cursor:pointer;user-select:none}
.mb-radiobutton-label{display:inline-flex;align-items:center;margin-inline-start:var(--mb-radiobutton-label-gap,0.5rem)}
.mb-radiobutton-label:empty{display:none}
.mb-radiobutton.disabled{cursor:not-allowed;opacity:var(--mb-radiobutton-disabled-opacity,0.6)}
.mb-radiobutton-box{width:var(--mb-radiobutton-size,1rem);height:var(--mb-radiobutton-size,1rem);border-radius:50%;border:var(--mb-radiobutton-border-width,2px) solid var(--mb-radiobutton-border-color,rgba(0,0,0,0.54));display:inline-flex;align-items:center;justify-content:center;background:var(--mb-radiobutton-bg,transparent);transition:background .12s,border-color .12s}
.mb-radiobutton:hover .mb-radiobutton-box{border-color:var(--mb-radiobutton-border-hover-color,rgba(0,0,0,0.7))}
.mb-radiobutton-checked .mb-radiobutton-box{background:var(--mb-radiobutton-checked-bg,var(--mb-primary,#007ad9));border-color:var(--mb-radiobutton-checked-border,var(--mb-primary,#007ad9));}
.mb-radiobutton-box .mb-radiobutton-icon{width:60%;height:60%;border-radius:50%;background:var(--mb-radiobutton-icon-color,#fff);transform:scale(0);transition:transform .12s}
.mb-radiobutton-checked .mb-radiobutton-box .mb-radiobutton-icon{transform:scale(1)}
.mb-radiobutton.invalid .mb-radiobutton-box{border-color:var(--mb-radiobutton-invalid-border-color,#d32f2f)}
.mb-radiobutton.disabled .mb-radiobutton-box{background:var(--mb-radiobutton-disabled-bg,#f5f5f5);border-color:var(--mb-radiobutton-disabled-border,#ddd)}

/* hidden native input */
.mb-radiobutton input[type="radio"]{position:absolute;opacity:0;width:0;height:0;margin:0;padding:0}
`;
export {};
