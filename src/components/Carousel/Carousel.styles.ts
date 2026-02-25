export const CAROUSEL_STYLES = `
.mb-carousel {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
}

.mb-carousel-header,
.mb-carousel-footer {
  display: block;
}

.mb-carousel-content {
  position: relative;
  overflow: hidden;
}

.mb-carousel-track {
  display: flex;
  transition: transform var(--mb-carousel-transition-duration, 280ms) ease;
  will-change: transform;
}

.mb-carousel-item {
  flex-shrink: 0;
  box-sizing: border-box;
}

.mb-carousel-vertical .mb-carousel-track {
  flex-direction: column;
}

.mb-carousel-indicators {
  display: flex;
  gap: var(--mb-carousel-indicator-gap, 0.5rem);
  justify-content: center;
  align-items: center;
  margin-top: var(--mb-carousel-indicator-margin-top, 0.75rem);
}

.mb-carousel-indicator {
  width: var(--mb-carousel-indicator-size, 0.625rem);
  height: var(--mb-carousel-indicator-size, 0.625rem);
  border-radius: 999px;
  border: none;
  background: var(--mb-carousel-indicator-background, rgba(0, 0, 0, 0.25));
  cursor: pointer;
}

.mb-carousel-indicator-active {
  background: var(--mb-carousel-indicator-active-background, rgba(0, 0, 0, 0.75));
}

.mb-carousel-prev-button,
.mb-carousel-next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: var(--mb-carousel-nav-button-background, rgba(0, 0, 0, 0.5));
  color: var(--mb-carousel-nav-button-color, #fff);
  width: var(--mb-carousel-nav-button-size, 2rem);
  height: var(--mb-carousel-nav-button-size, 2rem);
  border-radius: 999px;
  cursor: pointer;
  z-index: 1;
}

.mb-carousel-prev-button {
  left: var(--mb-carousel-prev-button-left, 0.5rem);
}

.mb-carousel-next-button {
  right: var(--mb-carousel-next-button-right, 0.5rem);
}

.mb-carousel-vertical .mb-carousel-prev-button,
.mb-carousel-vertical .mb-carousel-next-button {
  left: 50%;
  transform: translateX(-50%);
}

.mb-carousel-vertical .mb-carousel-prev-button {
  top: var(--mb-carousel-vertical-prev-top, 0.5rem);
}

.mb-carousel-vertical .mb-carousel-next-button {
  top: auto;
  bottom: var(--mb-carousel-vertical-next-bottom, 0.5rem);
}
`;
