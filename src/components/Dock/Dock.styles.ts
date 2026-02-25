export const DOCK_STYLES = `
:host{display:block}
.mb-dock{position:relative;display:inline-flex;padding:var(--mb-dock-padding,0.5rem);border-radius:var(--mb-dock-border-radius,0.875rem);background:var(--mb-dock-background,rgba(255,255,255,.72));backdrop-filter:var(--mb-dock-backdrop-filter,blur(12px));border:1px solid var(--mb-dock-border-color,var(--mb-content-border-color,#d1d5db))}
.mb-dock-list{list-style:none;margin:0;padding:0;display:flex;gap:var(--mb-dock-gap,0.375rem);align-items:flex-end}
.mb-dock-bottom .mb-dock-list{align-items:flex-end}
.mb-dock-top .mb-dock-list{align-items:flex-start}
.mb-dock-left .mb-dock-list,.mb-dock-right .mb-dock-list{flex-direction:column;align-items:center}
.mb-dock-item{position:relative}
.mb-dock-item-content{display:flex;align-items:center;justify-content:center;width:var(--mb-dock-item-size,3rem);height:var(--mb-dock-item-size,3rem);border-radius:var(--mb-dock-item-border-radius,0.75rem);background:var(--mb-dock-item-background,var(--mb-content-background,#fff));color:var(--mb-dock-item-color,var(--mb-text-color,#111827));transform:scale(var(--mb-dock-item-scale,1));transition:transform .12s ease,background .2s ease;cursor:pointer;outline:none}
.mb-dock-item-content:hover,.mb-dock-item-content.mb-focus{background:var(--mb-dock-item-hover-background,var(--mb-navigation-item-focus-background,#f3f4f6))}
.mb-dock-item-icon{font-size:var(--mb-dock-icon-size,1.25rem);line-height:1;display:inline-flex}
.mb-dock-item-tooltip{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 0.5rem);white-space:nowrap;padding:var(--mb-dock-tooltip-padding,0.25rem 0.5rem);border-radius:var(--mb-dock-tooltip-border-radius,4px);background:var(--mb-dock-tooltip-background,var(--mb-gray-900,#111827));color:var(--mb-dock-tooltip-color,#fff);font-size:var(--mb-dock-tooltip-font-size,0.75rem);opacity:0;pointer-events:none;transition:opacity .16s ease}
.mb-dock-top .mb-dock-item-tooltip{bottom:auto;top:calc(100% + 0.5rem)}
.mb-dock-left .mb-dock-item-tooltip,.mb-dock-right .mb-dock-item-tooltip{left:calc(100% + 0.5rem);top:50%;transform:translateY(-50%)}
.mb-dock-right .mb-dock-item-tooltip{left:auto;right:calc(100% + 0.5rem)}
.mb-dock-item:hover .mb-dock-item-tooltip,.mb-dock-item.mb-tooltip-open .mb-dock-item-tooltip{opacity:1}
`;
