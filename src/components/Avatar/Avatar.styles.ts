export const AVATAR_STYLES = `
:host {
  display: inline-block;
}

.mb-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--mb-avatar-border-radius, 0.25rem);
  background: var(--mb-avatar-bg, var(--mb-surface, #f4f4f4));
  color: var(--mb-avatar-color, var(--mb-on-surface, #222));
  width: var(--mb-avatar-width, 2.5rem);
  height: var(--mb-avatar-height, 2.5rem);
  overflow: hidden;
}

.mb-avatar-text {
  font-size: var(--mb-avatar-font-size, 0.875rem);
  font-weight: var(--mb-avatar-font-weight, 600);
  line-height: 1;
}

.mb-avatar-icon {
  font-size: var(--mb-avatar-icon-size, 1rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mb-avatar-sm {
  width: var(--mb-avatar-sm-width, 1.5rem);
  height: var(--mb-avatar-sm-height, 1.5rem);
}

.mb-avatar-lg {
  width: var(--mb-avatar-lg-width, 3rem);
  height: var(--mb-avatar-lg-height, 3rem);
}

.mb-avatar-xl {
  width: var(--mb-avatar-xl-width, 4rem);
  height: var(--mb-avatar-xl-height, 4rem);
}

.mb-avatar-circle {
  border-radius: 50%;
}

.mb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
`;
