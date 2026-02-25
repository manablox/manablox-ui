export const PROGRESSSPINNER_STYLES = `
.mb-progressspinner {
  position: relative;
  margin: 0 auto;
  width: var(--mb-progressspinner-width, 2rem);
  height: var(--mb-progressspinner-height, 2rem);
  display: inline-block;
}

.mb-progressspinner-svg {
  width: 100%;
  height: 100%;
  animation: mb-progressspinner-rotate var(--mb-progressspinner-animation-duration, 2s) linear infinite;
}

.mb-progressspinner-circle {
  stroke: var(--mb-progressspinner-color, var(--mb-primary, #0ea5a3));
  stroke-linecap: round;
  stroke-dasharray: 1,200;
  stroke-dashoffset: 0;
  animation: mb-progressspinner-dash var(--mb-progressspinner-animation-duration, 1.5s) ease-in-out infinite;
  fill: none;
}

@keyframes mb-progressspinner-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes mb-progressspinner-dash {
  0% {
    stroke-dasharray: 1,200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100,200;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 1,200;
    stroke-dashoffset: -125px;
  }
}
`;
