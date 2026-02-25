export const styles = `
:host{display:block}
.mb-terminal{background:var(--mb-terminal-bg,#212121);color:var(--mb-terminal-color,#fff);font-family:var(--mb-terminal-font,monospace);padding:1rem;border-radius:6px}
.mb-terminal-welcome{opacity:0.9;margin-bottom:0.5rem}
.mb-terminal-output{max-height:200px;overflow:auto;margin-bottom:0.5rem}
.mb-terminal-entry{white-space:pre-wrap;margin:0.25rem 0}
.mb-terminal-prompt-container{display:flex;align-items:center;gap:0.5rem}
.mb-terminal-prompt{opacity:0.9}
.mb-terminal-input{flex:1;background:transparent;border:none;color:inherit;outline:none}
`;

export default styles;
