export const SKELETON_STYLES = `
:host {
  display: inline-block;
}

.mb-skeleton {
  background: var(--mb-skeleton-bg, #e9e9e9);
  border-radius: var(--mb-skeleton-border-radius, 0.25rem);
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.mb-skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--mb-skeleton-highlight, rgba(255,255,255,0.6)) 50%, rgba(255,255,255,0) 100%);
  transform: translateX(-100%);
  animation: mb-skeleton-shimmer 1.2s ease-in-out infinite;
}

.mb-skeleton-circle {
  border-radius: 50%;
}

.mb-skeleton.no-animation::after {
  animation: none;
  display: none;
}

@keyframes mb-skeleton-shimmer {
  100% { transform: translateX(100%); }
}
`;
