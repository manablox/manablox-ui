export const TABMENU_STYLES = `
:host{display:block}
.mb-tabmenu{display:block}
.mb-tabmenu-nav{display:flex;list-style:none;padding:0;margin:0;border-width:var(--mb-tabmenu-tablist-border-width,0 0 1px 0);border-style:solid;border-color:var(--mb-tabmenu-tablist-border-color,var(--mb-content-border-color,#d1d5db));background:var(--mb-tabmenu-tablist-background,var(--mb-content-background,#fff))}
.mb-tabmenu-item{position:relative;margin:var(--mb-tabmenu-item-margin,0 0 -1px 0)}
.mb-tabmenu-item-link{display:flex;align-items:center;gap:var(--mb-tabmenu-item-gap,0.5rem);padding:var(--mb-tabmenu-item-padding,1rem 1.125rem);color:var(--mb-tabmenu-item-color,var(--mb-text-muted-color,#6b7280));background:var(--mb-tabmenu-item-background,transparent);text-decoration:none;border-width:var(--mb-tabmenu-item-border-width,0 0 1px 0);border-style:solid;border-color:var(--mb-tabmenu-item-border-color,var(--mb-content-border-color,#d1d5db));font-weight:var(--mb-tabmenu-item-font-weight,600);cursor:pointer}
.mb-tabmenu-item-link:hover{background:var(--mb-tabmenu-item-hover-background,transparent);color:var(--mb-tabmenu-item-hover-color,var(--mb-text-color,#111827));border-color:var(--mb-tabmenu-item-hover-border-color,var(--mb-content-border-color,#d1d5db))}
.mb-tabmenu-item-link:focus-visible{outline:var(--mb-tabmenu-item-focus-ring-width,var(--mb-focus-ring-width,1px)) var(--mb-tabmenu-item-focus-ring-style,var(--mb-focus-ring-style,solid)) var(--mb-tabmenu-item-focus-ring-color,var(--mb-focus-ring-color,#10b981));outline-offset:var(--mb-tabmenu-item-focus-ring-offset,var(--mb-focus-ring-offset,2px));box-shadow:var(--mb-tabmenu-item-focus-ring-shadow,var(--mb-focus-ring-shadow,none))}
.mb-tabmenu-item-icon{color:var(--mb-tabmenu-item-icon-color,var(--mb-text-muted-color,#6b7280));font-size:var(--mb-icon-size,1rem)}
.mb-tabmenu-item.mb-tabmenu-item-active .mb-tabmenu-item-link{background:var(--mb-tabmenu-item-active-background,transparent);color:var(--mb-tabmenu-item-active-color,var(--mb-primary-color,#10b981));border-color:var(--mb-tabmenu-item-active-border-color,var(--mb-primary-color,#10b981))}
.mb-tabmenu-item.mb-tabmenu-item-active .mb-tabmenu-item-icon{color:var(--mb-tabmenu-item-icon-active-color,var(--mb-primary-color,#10b981))}
.mb-tabmenu-item.mb-tabmenu-item-active::after{content:'';position:absolute;left:0;right:0;bottom:var(--mb-tabmenu-active-bar-bottom,-1px);height:var(--mb-tabmenu-active-bar-height,1px);background:var(--mb-tabmenu-active-bar-background,var(--mb-primary-color,#10b981))}
.mb-tabmenu-item.mb-disabled .mb-tabmenu-item-link{opacity:var(--mb-disabled-opacity,0.6);cursor:not-allowed;pointer-events:none}
`;
