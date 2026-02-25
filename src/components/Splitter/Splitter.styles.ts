export const SPLITTER_STYLES = `
.mb-splitter {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mb-splitter-horizontal {
  flex-direction: row;
}

.mb-splitter-vertical {
  flex-direction: column;
}

.mb-splitterpanel {
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.mb-splitter-gutter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mb-splitter-gutter-background, transparent);
  user-select: none;
  touch-action: none;
  flex: 0 0 auto;
}

.mb-splitter-gutter:hover,
.mb-splitter-gutter:focus-visible {
  background: var(--mb-splitter-gutter-hover-background, rgba(0, 0, 0, 0.06));
}

.mb-splitter-gutter-horizontal {
  cursor: col-resize;
}

.mb-splitter-gutter-vertical {
  cursor: row-resize;
}

.mb-splitter-gutter-handle {
  background: var(--mb-splitter-gutter-handle-background, currentColor);
  opacity: var(--mb-splitter-gutter-handle-opacity, 0.25);
  border-radius: var(--mb-splitter-gutter-handle-border-radius, 999px);
}

.mb-splitter-gutter-horizontal .mb-splitter-gutter-handle {
  width: var(--mb-splitter-gutter-handle-size, 2px);
  height: var(--mb-splitter-gutter-handle-length, 2rem);
}

.mb-splitter-gutter-vertical .mb-splitter-gutter-handle {
  width: var(--mb-splitter-gutter-handle-length, 2rem);
  height: var(--mb-splitter-gutter-handle-size, 2px);
}
`;
