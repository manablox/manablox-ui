export const BREADCRUMB_STYLES = `
:host{display:block}
.mb-breadcrumb{display:flex;align-items:center;padding:var(--mb-breadcrumb-padding,1rem);gap:var(--mb-breadcrumb-gap,0.5rem);background:var(--mb-breadcrumb-background,var(--mb-content-background,#fff));border-radius:var(--mb-content-border-radius,6px)}
.mb-breadcrumb-list{display:flex;align-items:center;flex-wrap:wrap;gap:var(--mb-breadcrumb-gap,0.5rem);list-style:none;padding:0;margin:0}
.mb-breadcrumb-item{display:flex;align-items:center;gap:var(--mb-breadcrumb-item-gap,var(--mb-navigation-item-gap,0.5rem))}
.mb-breadcrumb-item-link{display:flex;align-items:center;gap:var(--mb-breadcrumb-item-gap,0.5rem);text-decoration:none;color:var(--mb-breadcrumb-item-color,var(--mb-text-muted-color,#6b7280));padding:0.25rem 0.375rem;border-radius:var(--mb-breadcrumb-item-border-radius,var(--mb-content-border-radius,6px));cursor:pointer;border:0;background:transparent}
.mb-breadcrumb-item-link:hover{color:var(--mb-breadcrumb-item-hover-color,var(--mb-text-color,#111827))}
.mb-breadcrumb-item-link:focus-visible{outline:var(--mb-breadcrumb-item-focus-ring-width,var(--mb-focus-ring-width,1px)) var(--mb-breadcrumb-item-focus-ring-style,var(--mb-focus-ring-style,solid)) var(--mb-breadcrumb-item-focus-ring-color,var(--mb-focus-ring-color,#10b981));outline-offset:var(--mb-breadcrumb-item-focus-ring-offset,var(--mb-focus-ring-offset,2px));box-shadow:var(--mb-breadcrumb-item-focus-ring-shadow,var(--mb-focus-ring-shadow,none))}
.mb-breadcrumb-item-icon{color:var(--mb-breadcrumb-item-icon-color,var(--mb-navigation-item-icon-color,#6b7280));font-size:var(--mb-icon-size,1rem)}
.mb-breadcrumb-item-link:hover .mb-breadcrumb-item-icon{color:var(--mb-breadcrumb-item-icon-hover-color,var(--mb-navigation-item-icon-focus-color,#4b5563))}
.mb-breadcrumb-item-label{line-height:1.2}
.mb-breadcrumb-separator{color:var(--mb-breadcrumb-separator-color,var(--mb-navigation-item-icon-color,#9ca3af));display:inline-flex;align-items:center}
.mb-breadcrumb-item-link.mb-disabled{opacity:var(--mb-disabled-opacity,0.6);pointer-events:none;cursor:not-allowed}
`;
