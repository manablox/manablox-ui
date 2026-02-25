export const PANELMENU_STYLES = `
:host{display:block}
.mb-panelmenu{display:flex;flex-direction:column;gap:var(--mb-panelmenu-gap,0.375rem)}
.mb-panelmenu-panel{border:1px solid var(--mb-panelmenu-panel-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-panelmenu-panel-border-radius,var(--mb-content-border-radius,6px));background:var(--mb-panelmenu-panel-background,var(--mb-content-background,#fff));overflow:hidden}
.mb-panelmenu-header{margin:0}
.mb-panelmenu-header-content{display:flex;align-items:center;width:100%;border:0;background:var(--mb-panelmenu-header-background,var(--mb-navigation-item-background,transparent));padding:0;cursor:pointer}
.mb-panelmenu-header-action{display:flex;align-items:center;gap:var(--mb-panelmenu-header-gap,0.5rem);width:100%;padding:var(--mb-panelmenu-header-padding,0.75rem 0.875rem);text-align:start;color:var(--mb-panelmenu-header-color,var(--mb-content-color,#111827));text-decoration:none}
.mb-panelmenu-header-content:hover{background:var(--mb-panelmenu-header-hover-background,var(--mb-navigation-item-focus-background,#f3f4f6))}
.mb-panelmenu-header-icon{font-size:var(--mb-panelmenu-header-icon-size,0.875rem);line-height:1;display:inline-flex;transition:transform .2s ease}
.mb-panelmenu-panel.mb-open .mb-panelmenu-header-icon{transform:rotate(90deg)}
.mb-panelmenu-header-label{flex:1 1 auto}
.mb-panelmenu-content{max-height:0;opacity:0;overflow:hidden;transition:max-height .24s ease,opacity .24s ease;background:var(--mb-panelmenu-content-background,var(--mb-content-background,#fff))}
.mb-panelmenu-panel.mb-open>.mb-panelmenu-content{max-height:1200px;opacity:1}
.mb-panelmenu-root-list,.mb-panelmenu-sublist{list-style:none;margin:0;padding:var(--mb-panelmenu-content-padding,0.25rem)}
.mb-menuitem{margin:0}
.mb-menuitem-content{display:flex;align-items:center;gap:var(--mb-panelmenu-item-gap,0.5rem);padding:var(--mb-panelmenu-item-padding,0.5rem 0.625rem);border-radius:var(--mb-panelmenu-item-border-radius,4px);outline:none;cursor:pointer}
.mb-menuitem-content:hover,.mb-menuitem-content.mb-active{background:var(--mb-panelmenu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-panelmenu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-menuitem-link{display:flex;align-items:center;gap:inherit;flex:1 1 auto;color:inherit;text-decoration:none}
.mb-menuitem-sublist{list-style:none;margin:0;padding-inline-start:var(--mb-panelmenu-submenu-indent,1rem);display:none}
.mb-menuitem.mb-open>.mb-menuitem-sublist{display:block}
`;
