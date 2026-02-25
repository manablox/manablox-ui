export const CARD_STYLES = `
:host {
  display: block;
}

.mb-card {
  background: var(--mb-card-background);
  color: var(--mb-card-color);
  border-radius: var(--mb-card-border-radius);
  box-shadow: var(--mb-card-shadow);
  padding: var(--mb-card-body-padding);
}
.mb-card-header { padding: var(--mb-card-header-padding); }
.mb-card-body { padding: var(--mb-card-body-padding); }
.mb-card-title { font-size: var(--mb-card-title-font-size); font-weight: var(--mb-card-title-font-weight); margin-bottom: 0.5rem; }
.mb-card-subtitle { color: var(--mb-card-subtitle-color); font-size: var(--mb-card-subtitle-font-size); margin-bottom: 1rem; }
.mb-card-content { padding: var(--mb-card-body-padding) 0; }
.mb-card-footer { padding: var(--mb-card-footer-padding); }
/* add all remaining Aura card styles */
`;
