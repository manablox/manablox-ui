export const SCROLLPANEL_STYLES = `
:host {
  display: block;
}

.mb-scrollpanel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.mb-scrollpanel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mb-scrollpanel-content {
  width: 100%;
  height: 100%;
  overflow: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mb-scrollpanel-content::-webkit-scrollbar { display: none; }

.mb-scrollpanel-track {
  position: absolute;
  background: var(--mb-scrollpanel-track-bg, transparent);
}

.mb-scrollpanel-track-x {
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--mb-scrollpanel-track-size, 10px);
}

.mb-scrollpanel-track-y {
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--mb-scrollpanel-track-size, 10px);
}

.mb-scrollpanel-bar {
  position: absolute;
  background: var(--mb-scrollpanel-bar-bg, rgba(0, 0, 0, 0.2));
  border-radius: var(--mb-scrollpanel-bar-radius, 999px);
  cursor: pointer;
}

.mb-scrollpanel-bar-x {
  height: var(--mb-scrollpanel-bar-size, 6px);
  bottom: 2px;
  left: 0;
}

.mb-scrollpanel-bar-y {
  width: var(--mb-scrollpanel-bar-size, 6px);
  right: 2px;
  top: 0;
}
`;
