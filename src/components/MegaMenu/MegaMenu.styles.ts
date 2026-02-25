export const MEGAMENU_STYLES = `
:host{display:block}
.mb-megamenu{display:flex;flex-direction:column;position:relative;background:var(--mb-megamenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-megamenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-megamenu-border-radius,var(--mb-content-border-radius,6px));padding:var(--mb-megamenu-padding,0.25rem)}
.mb-megamenu.mb-megamenu-vertical .mb-megamenu-root-list{flex-direction:column;align-items:stretch}
.mb-megamenu-root-list{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:var(--mb-megamenu-item-gap,0.125rem)}
.mb-menuitem{margin:0}
.mb-menuitem-content{display:flex;align-items:center;gap:var(--mb-megamenu-item-content-gap,0.5rem);padding:var(--mb-megamenu-item-padding,0.5rem 0.75rem);border-radius:var(--mb-megamenu-item-border-radius,4px);cursor:pointer;outline:none;white-space:nowrap}
.mb-menuitem-content:hover,.mb-menuitem-content.mb-active{background:var(--mb-megamenu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-megamenu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-megamenu-overlay{position:absolute;top:0;left:0;pointer-events:auto}
.mb-megamenu-submenu{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:var(--mb-megamenu-column-gap,1rem);min-width:min(90vw,56rem);background:var(--mb-megamenu-submenu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-megamenu-submenu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-megamenu-submenu-border-radius,var(--mb-content-border-radius,6px));box-shadow:var(--mb-megamenu-submenu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12));padding:var(--mb-megamenu-submenu-padding,1rem)}
.mb-megamenu-col{display:flex;flex-direction:column;gap:var(--mb-megamenu-col-gap,0.375rem)}
.mb-megamenu-submenu-header{font-size:var(--mb-megamenu-submenu-header-size,0.875rem);font-weight:var(--mb-megamenu-submenu-header-weight,600);padding:var(--mb-megamenu-submenu-header-padding,0.125rem 0.25rem);color:var(--mb-megamenu-submenu-header-color,var(--mb-text-color-secondary,#6b7280))}
.mb-megamenu-item-content{display:flex;align-items:center;gap:var(--mb-megamenu-subitem-gap,0.5rem);padding:var(--mb-megamenu-subitem-padding,0.5rem 0.625rem);border-radius:var(--mb-megamenu-subitem-border-radius,4px);cursor:pointer}
.mb-megamenu-item-content:hover{background:var(--mb-megamenu-subitem-hover-background,var(--mb-navigation-item-focus-background,#f3f4f6))}
.mb-megamenu-mobile-mode .mb-megamenu-root-list{flex-direction:column;align-items:stretch}
.mb-megamenu-mobile-mode .mb-megamenu-submenu{min-width:100%;grid-template-columns:1fr}
`;
