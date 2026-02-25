export const MENUBAR_STYLES = `
:host{display:block}
.mb-menubar{display:flex;align-items:center;position:relative;background:var(--mb-menubar-background,var(--mb-content-background,#fff));border:1px solid var(--mb-menubar-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-menubar-border-radius,var(--mb-content-border-radius,6px));padding:var(--mb-menubar-padding,0.25rem 0.5rem);color:var(--mb-menubar-color,var(--mb-content-color,#111827))}
.mb-menubar-button{display:none;border:0;background:transparent;color:inherit;cursor:pointer;padding:var(--mb-menubar-button-padding,0.5rem);border-radius:var(--mb-menubar-button-border-radius,4px)}
.mb-menubar-button:focus-visible{outline:var(--mb-focus-ring-width,1px) var(--mb-focus-ring-style,solid) var(--mb-focus-ring-color,#10b981)}
.mb-menubar-root-list{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:var(--mb-menubar-item-gap,0.125rem);flex:1 1 auto}
.mb-menuitem{position:relative;margin:0;padding:0}
.mb-menuitem-content{display:flex;align-items:center;gap:var(--mb-menubar-item-content-gap,0.5rem);padding:var(--mb-menubar-item-padding,0.5rem 0.75rem);border-radius:var(--mb-menubar-item-border-radius,4px);cursor:pointer;user-select:none;outline:none;white-space:nowrap}
.mb-menuitem-content:hover,.mb-menuitem-content.mb-active{background:var(--mb-menubar-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-menubar-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-menuitem-content[aria-disabled=true]{opacity:var(--mb-disabled-opacity,0.6);cursor:not-allowed}
.mb-menuitem-label{flex:1 1 auto}
.mb-menuitem-submenu-icon{font-size:var(--mb-menubar-submenu-icon-size,0.875rem);line-height:1}
.mb-menubar-submenu-overlay{position:absolute;top:0;left:0;pointer-events:auto}
.mb-menubar-submenu{min-width:12rem;background:var(--mb-menubar-submenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-menubar-submenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-menubar-submenu-border-radius,var(--mb-content-border-radius,6px));box-shadow:var(--mb-menubar-submenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12)));padding:var(--mb-menubar-submenu-padding,0.25rem);list-style:none;margin:0}
.mb-menubar-submenu-list{list-style:none;margin:0;padding:0}
.mb-menubar-submenu-item{position:relative}
.mb-menubar-submenu-item>.mb-menubar-submenu{position:absolute;top:0;left:100%;display:none}
.mb-menubar-submenu-item.mb-open>.mb-menubar-submenu{display:block}
.mb-menubar-mobile-active .mb-menubar-root-list{display:flex}
.mb-menubar-mobile-mode{flex-wrap:wrap}
.mb-menubar-mobile-mode .mb-menubar-button{display:inline-flex;align-items:center;justify-content:center}
.mb-menubar-mobile-mode .mb-menubar-root-list{display:none;flex-direction:column;align-items:stretch;width:100%;padding-top:0.25rem}
.mb-menubar-mobile-mode.mb-menubar-mobile-active .mb-menubar-root-list{display:flex}
.mb-menubar-mobile-mode .mb-menuitem-content{width:100%}
`;
