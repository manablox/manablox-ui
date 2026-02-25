export const TOAST_STYLES = `
.mb-toast {
  position: fixed;
  width: min(var(--mb-toast-width), calc(100vw - 2rem));
  z-index: 1000;
  pointer-events: none;
  padding: 1rem;
}

.mb-toast-message {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  border-radius: var(--mb-toast-border-radius);
  border: var(--mb-toast-border-width) solid transparent;
  backdrop-filter: blur(var(--mb-toast-blur));
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--mb-toast-transition-duration),
    transform var(--mb-toast-transition-duration);
  animation: mb-toast-enter var(--mb-toast-transition-duration) ease both;
}

.mb-toast-message.mb-toast-leave {
  animation: mb-toast-leave var(--mb-toast-transition-duration) ease both;
}

.mb-toast-message-content {
  display: flex;
  align-items: flex-start;
  gap: var(--mb-toast-content-gap);
  width: 100%;
  padding: var(--mb-toast-content-padding);
}

.mb-toast-message-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mb-toast-icon-size);
  height: var(--mb-toast-icon-size);
  font-size: var(--mb-toast-icon-size);
  flex: 0 0 auto;
}

.mb-toast-message-text {
  display: flex;
  flex-direction: column;
  gap: var(--mb-toast-text-gap);
  flex: 1;
  min-width: 0;
}

.mb-toast-message-summary {
  font-weight: var(--mb-toast-summary-font-weight);
  font-size: var(--mb-toast-summary-font-size);
  line-height: 1.2;
}

.mb-toast-message-detail {
  font-weight: var(--mb-toast-detail-font-weight);
  font-size: var(--mb-toast-detail-font-size);
  color: inherit;
}

.mb-toast-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mb-toast-close-button-width);
  height: var(--mb-toast-close-button-height);
  border: 0;
  border-radius: var(--mb-toast-close-button-border-radius);
  background: transparent;
  color: inherit;
  cursor: pointer;
  pointer-events: auto;
}

.mb-toast-close-button:focus-visible {
  outline: var(--mb-toast-close-button-focus-ring-width) var(--mb-toast-close-button-focus-ring-style) currentColor;
  outline-offset: var(--mb-toast-close-button-focus-ring-offset);
}

.mb-toast-message-info {
  background: var(--mb-toast-info-background);
  border-color: var(--mb-toast-info-border-color);
  color: var(--mb-toast-info-color);
  box-shadow: var(--mb-toast-info-shadow);
}

.mb-toast-message-success {
  background: var(--mb-toast-success-background);
  border-color: var(--mb-toast-success-border-color);
  color: var(--mb-toast-success-color);
  box-shadow: var(--mb-toast-success-shadow);
}

.mb-toast-message-warn {
  background: var(--mb-toast-warn-background);
  border-color: var(--mb-toast-warn-border-color);
  color: var(--mb-toast-warn-color);
  box-shadow: var(--mb-toast-warn-shadow);
}

.mb-toast-message-error {
  background: var(--mb-toast-error-background);
  border-color: var(--mb-toast-error-border-color);
  color: var(--mb-toast-error-color);
  box-shadow: var(--mb-toast-error-shadow);
}

.mb-toast-message-secondary {
  background: var(--mb-toast-secondary-background);
  border-color: var(--mb-toast-secondary-border-color);
  color: var(--mb-toast-secondary-color);
  box-shadow: var(--mb-toast-secondary-shadow);
}

.mb-toast-message-contrast {
  background: var(--mb-toast-contrast-background);
  border-color: var(--mb-toast-contrast-border-color);
  color: var(--mb-toast-contrast-color);
  box-shadow: var(--mb-toast-contrast-shadow);
}

.mb-toast-top-right {
  top: 0;
  right: 0;
}

.mb-toast-top-left {
  top: 0;
  left: 0;
}

.mb-toast-bottom-right {
  right: 0;
  bottom: 0;
}

.mb-toast-bottom-left {
  left: 0;
  bottom: 0;
}

.mb-toast-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.mb-toast-bottom-center {
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

.mb-toast-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes mb-toast-enter {
  from {
    opacity: 0;
    transform: translateY(-0.75rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes mb-toast-leave {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
`;
