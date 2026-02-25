export const TIEREDMENU_STYLES = `
:host{display:block}
.mb-tieredmenu{background:var(--mb-tieredmenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-tieredmenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-tieredmenu-border-radius,var(--mb-content-border-radius,6px));min-width:12rem;box-shadow:var(--mb-tieredmenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12));padding:var(--mb-tieredmenu-padding,0.25rem);color:var(--mb-tieredmenu-color,var(--mb-content-color,#111827))}
.mb-tieredmenu-root-list,.mb-tieredmenu-submenu{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--mb-tieredmenu-list-gap,2px)}
.mb-tieredmenu-item{position:relative}
.mb-tieredmenu-item-content{display:flex;align-items:center;gap:var(--mb-tieredmenu-item-gap,0.5rem);padding:var(--mb-tieredmenu-item-padding,0.5rem 0.75rem);border-radius:var(--mb-tieredmenu-item-border-radius,4px);cursor:pointer;outline:none;user-select:none}
.mb-tieredmenu-item-content:hover,.mb-tieredmenu-item-content.mb-active{background:var(--mb-tieredmenu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-tieredmenu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-tieredmenu-item-content[aria-disabled=true]{opacity:var(--mb-disabled-opacity,0.6);cursor:not-allowed}
.mb-tieredmenu-item-label{flex:1 1 auto}
.mb-tieredmenu-submenu{display:none;position:absolute;top:0;left:100%;min-width:12rem;background:var(--mb-tieredmenu-submenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-tieredmenu-submenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-tieredmenu-submenu-border-radius,var(--mb-content-border-radius,6px));box-shadow:var(--mb-tieredmenu-submenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12));padding:var(--mb-tieredmenu-submenu-padding,0.25rem);z-index:1}
.mb-tieredmenu-item.mb-open>.mb-tieredmenu-submenu{display:flex}
.mb-tieredmenu-icon{font-size:var(--mb-tieredmenu-icon-size,0.875rem);line-height:1}
.mb-tieredmenu-overlay{position:absolute;top:0;left:0;pointer-events:auto}
`;
