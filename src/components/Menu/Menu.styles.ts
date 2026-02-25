export const MENU_STYLES = `
:host{display:block}
.mb-menu{background:var(--mb-menu-background,var(--mb-content-background,#fff));border:1px solid var(--mb-menu-border-color,var(--mb-content-border-color,#d1d5db));border-radius:var(--mb-menu-border-radius,var(--mb-content-border-radius,6px));box-shadow:var(--mb-menu-shadow,var(--mb-overlay-navigation-shadow,0 4px 12px rgba(0,0,0,.12)));padding:var(--mb-menu-list-padding,var(--mb-list-padding,0.25rem));min-width:12rem;color:var(--mb-menu-color,var(--mb-content-color,#111827))}
.mb-menu-list,.mb-menu-submenu-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--mb-menu-list-gap,var(--mb-list-gap,2px))}
.mb-menuitem{margin:0;padding:0}
.mb-menuitem-content{display:flex;align-items:center;gap:var(--mb-menu-item-gap,var(--mb-navigation-item-gap,0.5rem));padding:var(--mb-menu-item-padding,var(--mb-navigation-item-padding,0.5rem 0.75rem));cursor:pointer;border-radius:var(--mb-menu-item-border-radius,var(--mb-navigation-item-border-radius,4px));color:var(--mb-menu-item-color,var(--mb-navigation-item-color,#111827));outline:none}
.mb-menuitem-link{display:flex;align-items:center;gap:inherit;width:100%;text-decoration:none;color:inherit}
.mb-menuitem-icon{color:var(--mb-menu-item-icon-color,var(--mb-navigation-item-icon-color,#6b7280));font-size:var(--mb-icon-size,1rem);line-height:1;display:inline-flex;align-items:center;justify-content:center}
.mb-menuitem-label{flex:1 1 auto}
.mb-menuitem-badge{margin-inline-start:auto;padding:0.125rem 0.5rem;border-radius:999px;font-size:0.75rem;background:var(--mb-highlight-background,var(--mb-surface-100,#f3f4f6));color:var(--mb-highlight-color,var(--mb-text-color,#111827))}
.mb-menuitem-separator{margin:0.25rem 0;list-style:none}
.mb-menuitem-separator hr{border:0;border-top:1px solid var(--mb-menu-separator-border-color,var(--mb-content-border-color,#d1d5db));margin:0}
.mb-submenu-header{display:flex;align-items:center;gap:0.5rem;width:100%;border:0;background:var(--mb-menu-submenu-label-background,var(--mb-navigation-submenu-label-background,transparent));color:var(--mb-menu-submenu-label-color,var(--mb-navigation-submenu-label-color,#6b7280));padding:var(--mb-menu-submenu-label-padding,var(--mb-navigation-submenu-label-padding,0.5rem 0.75rem));font-weight:var(--mb-menu-submenu-label-font-weight,var(--mb-navigation-submenu-label-font-weight,600));text-align:start;cursor:pointer;border-radius:var(--mb-menu-item-border-radius,var(--mb-navigation-item-border-radius,4px))}
.mb-submenu-header:focus-visible,.mb-menuitem-content:focus-visible{outline:var(--mb-focus-ring-width,1px) var(--mb-focus-ring-style,solid) var(--mb-focus-ring-color,#10b981);outline-offset:var(--mb-focus-ring-offset,2px);box-shadow:var(--mb-focus-ring-shadow,none)}
.mb-menuitem-content:hover{background:var(--mb-menu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-menu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-menuitem-content:hover .mb-menuitem-icon{color:var(--mb-menu-item-icon-focus-color,var(--mb-navigation-item-icon-focus-color,#4b5563))}
.mb-menuitem-content.mb-menuitem-active{background:var(--mb-menu-item-focus-background,var(--mb-navigation-item-focus-background,#f3f4f6));color:var(--mb-menu-item-focus-color,var(--mb-navigation-item-focus-color,#111827))}
.mb-menuitem-content.mb-menuitem-disabled{opacity:var(--mb-disabled-opacity,0.6);cursor:not-allowed;pointer-events:none}
.mb-menu-group.mb-collapsed>.mb-menu-submenu-list{display:none}
.mb-menu-overlay{position:absolute;top:0;left:0;min-width:inherit}
`;
