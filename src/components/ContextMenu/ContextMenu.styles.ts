export const CONTEXTMENU_STYLES = `
:host{display:block}
.mb-contextmenu-overlay{position:absolute;top:0;left:0;pointer-events:auto}
.mb-contextmenu{background:var(--mb-contextmenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-contextmenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-contextmenu-border-radius,var(--mb-content-border-radius,6px));min-width:12rem;box-shadow:var(--mb-contextmenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12));padding:var(--mb-contextmenu-padding,0.25rem);color:var(--mb-contextmenu-color,var(--mb-content-color,#111827))}
.mb-contextmenu-root-list,.mb-contextmenu-submenu{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--mb-contextmenu-list-gap,2px)}
.mb-contextmenu-item{position:relative}
.mb-contextmenu-item-content{display:flex;align-items:center;gap:var(--mb-contextmenu-item-gap,0.5rem);padding:var(--mb-contextmenu-item-padding,0.5rem 0.75rem);border-radius:var(--mb-contextmenu-item-border-radius,4px);cursor:pointer;outline:none;white-space:nowrap}
.mb-contextmenu-item-content:hover,.mb-contextmenu-item-content.mb-active{background:var(--mb-contextmenu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-contextmenu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-contextmenu-item-content[aria-disabled=true]{opacity:var(--mb-disabled-opacity,0.6);cursor:not-allowed}
.mb-contextmenu-item-label{flex:1 1 auto}
.mb-contextmenu-submenu{display:none;position:absolute;top:0;left:100%;min-width:12rem;background:var(--mb-contextmenu-submenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-contextmenu-submenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-contextmenu-submenu-border-radius,var(--mb-content-border-radius,6px));box-shadow:var(--mb-contextmenu-submenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12));padding:var(--mb-contextmenu-submenu-padding,0.25rem)}
.mb-contextmenu-item.mb-open>.mb-contextmenu-submenu{display:flex}
.mb-contextmenu-icon{font-size:var(--mb-contextmenu-icon-size,0.875rem);line-height:1}
`;
