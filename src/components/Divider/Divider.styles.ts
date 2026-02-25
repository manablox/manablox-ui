export const DIVIDER_STYLES = `
:host {
  display: block;
}

.mb-divider {
  display: flex;
  align-items: center;
  color: var(--mb-divider-color);
  margin: var(--mb-divider-margin, 1rem 0);
}
.mb-divider-horizontal { width: 100%; border-top-width: var(--mb-divider-width, 1px); border-top-style: solid; border-top-color: var(--mb-divider-color); }
.mb-divider-vertical { height: 100%; display: inline-flex; border-left-width: var(--mb-divider-width, 1px); border-left-style: solid; border-left-color: var(--mb-divider-color); }
.mb-divider-solid { border-style: solid; }
.mb-divider-dashed { border-style: dashed; }
.mb-divider-dotted { border-style: dotted; }
.mb-divider-left { justify-content: flex-start; }
.mb-divider-center { justify-content: center; }
.mb-divider-right { justify-content: flex-end; }
.mb-divider-top { align-items: flex-start; }
.mb-divider-bottom { align-items: flex-end; }
.mb-divider-content { padding: 0 var(--mb-divider-content-padding, 0.5rem); }
`;
