export const styles = `
:host{display:inline-block}
.mb-image{display:inline-block}
.mb-image img{max-width:100%;height:auto;display:block}
.mb-image{position:relative}
.mb-image ::slotted([slot='indicator']){position:absolute;top:0;right:0}
.mb-image-portal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000}
.mb-image-portal-content{position:relative;max-width:90%;max-height:90%}
.mb-image-portal-img{max-width:100%;max-height:100%;display:block}
.mb-image-portal-controls{position:absolute;top:0;right:0;display:flex;gap:0.5rem}
.mb-image-portal-button{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:0.25rem 0.5rem;cursor:pointer}
`;

export default styles;
