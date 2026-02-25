export const styles = `
:host{display:block}
.mb-scrolltop-button{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:50%;background:var(--mb-scrolltop-bg,#333);color:var(--mb-scrolltop-color,#fff);border:none;cursor:pointer;box-shadow:var(--mb-scrolltop-shadow,0 2px 6px rgba(0,0,0,0.3));}
.mb-scrolltop-hidden{display:none}
.mb-scrolltop-fixed{position:fixed;right:1rem;bottom:1rem;z-index:var(--mb-scrolltop-z,1000)}
.mb-scrolltop-absolute{position:absolute;right:1rem;bottom:1rem}
`;

export default styles;
