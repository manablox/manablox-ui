export const PROGRESSBAR_STYLES = `
:host {
  display: block;
}

.mb-progressbar {
  position: relative;
  overflow: hidden;
  background: var(--mb-progressbar-bg, #e6e6e6);
  border-radius: var(--mb-progressbar-border-radius, 0.25rem);
  height: var(--mb-progressbar-height, 0.75rem);
}

.mb-progressbar-value {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--mb-progressbar-value-bg, var(--mb-primary, #0ea5a3));
  height: 100%;
  transition: width 0.4s ease;
}

.mb-progressbar-label {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  line-height: var(--mb-progressbar-height, 0.75rem);
  color: var(--mb-progressbar-label-color, #fff);
}

.mb-progressbar-indeterminate .mb-progressbar-value {
  left: -40%;
  width: 40%;
  animation: mb-progressbar-indefinite 1.2s linear infinite;
}

@keyframes mb-progressbar-indefinite {
  0% { left: -40%; }
  100% { left: 100%; }
}
`;
