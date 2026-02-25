export const FIELDSET_STYLES = `
.mb-fieldset{border:1px solid var(--mb-fieldset-border-color,#dcdcdc);padding:.5rem 1rem;border-radius:4px}
.mb-fieldset-legend{cursor:default;padding:0 .5rem;font-weight:600}
.mb-fieldset-legend.mb-fieldset-toggle{cursor:pointer;display:flex;align-items:center;gap:.5rem}
.mb-fieldset-content{overflow:hidden;transition:max-height .25s ease;max-height:1000px}
.mb-fieldset.collapsed .mb-fieldset-content{max-height:0;padding:0}
`;
