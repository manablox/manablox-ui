export const GALLERIA_STYLES = `
.mb-galleria {
  display: block;
  position: relative;
}

.mb-galleria-content {
  position: relative;
}

.mb-galleria-item-wrapper {
  position: relative;
  overflow: hidden;
}

.mb-galleria-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mb-galleria-item-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: var(--mb-galleria-item-nav-size, 2rem);
  height: var(--mb-galleria-item-nav-size, 2rem);
  border-radius: 999px;
  cursor: pointer;
  background: var(--mb-galleria-item-nav-background, rgba(0, 0, 0, 0.45));
  color: var(--mb-galleria-item-nav-color, #fff);
  z-index: 1;
}

.mb-galleria-item-nav-prev {
  left: var(--mb-galleria-item-nav-prev-left, 0.5rem);
}

.mb-galleria-item-nav-next {
  right: var(--mb-galleria-item-nav-next-right, 0.5rem);
}

.mb-galleria-thumbnail-wrapper {
  margin-top: var(--mb-galleria-thumbnail-wrapper-margin-top, 0.75rem);
}

.mb-galleria-thumbnail-container {
  overflow: hidden;
}

.mb-galleria-thumbnail-items {
  display: flex;
  gap: var(--mb-galleria-thumbnail-gap, 0.5rem);
}

.mb-galleria-thumbnail-item {
  border: none;
  background: transparent;
  padding: 0;
  opacity: var(--mb-galleria-thumbnail-opacity, 0.6);
  cursor: pointer;
}

.mb-galleria-thumbnail-item-active {
  opacity: var(--mb-galleria-thumbnail-active-opacity, 1);
}

.mb-galleria-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(--mb-galleria-caption-padding, 0.75rem 1rem);
  background: var(--mb-galleria-caption-background, rgba(0, 0, 0, 0.55));
  color: var(--mb-galleria-caption-color, #fff);
}

.mb-galleria-indicators {
  display: flex;
  justify-content: center;
  gap: var(--mb-galleria-indicator-gap, 0.5rem);
  margin-top: var(--mb-galleria-indicator-margin-top, 0.75rem);
}

.mb-galleria-indicator {
  width: var(--mb-galleria-indicator-size, 0.625rem);
  height: var(--mb-galleria-indicator-size, 0.625rem);
  border-radius: 999px;
  border: none;
  background: var(--mb-galleria-indicator-background, rgba(0, 0, 0, 0.3));
  cursor: pointer;
}

.mb-galleria-indicator.mb-galleria-thumbnail-item-active {
  background: var(--mb-galleria-indicator-active-background, rgba(0, 0, 0, 0.75));
}

.mb-galleria-fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--mb-galleria-fullscreen-z-index, 1100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mb-galleria-mask {
  position: absolute;
  inset: 0;
  background: var(--mb-galleria-mask-background, rgba(0, 0, 0, 0.85));
}

.mb-galleria-fullscreen .mb-galleria-content {
  position: relative;
  width: min(96vw, var(--mb-galleria-fullscreen-width, 1200px));
  max-height: 92vh;
  overflow: auto;
  z-index: 1;
}

.mb-galleria-close-button {
  position: absolute;
  top: var(--mb-galleria-close-top, 0.75rem);
  right: var(--mb-galleria-close-right, 0.75rem);
  border: none;
  background: var(--mb-galleria-close-background, rgba(255, 255, 255, 0.2));
  color: var(--mb-galleria-close-color, #fff);
  width: var(--mb-galleria-close-size, 2rem);
  height: var(--mb-galleria-close-size, 2rem);
  border-radius: 999px;
  cursor: pointer;
  z-index: 2;
}
`;
