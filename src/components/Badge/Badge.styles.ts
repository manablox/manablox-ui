export const BADGE_STYLES = `
:root{
  --mb-badge-bg: #ef4444;
  --mb-badge-color: #fff;
  --mb-badge-font-size: .75rem;
  --mb-badge-size: 1.5rem;
  --mb-badge-radius: 9999px;

  --mb-badge-sm-size: 1rem;
  --mb-badge-lg-size: 2rem;
  --mb-badge-xl-size: 2.5rem;

  --mb-badge-secondary-bg: #6b7280;
  --mb-badge-success-bg: #16a34a;
  --mb-badge-info-bg: #0284c7;
  --mb-badge-warn-bg: #f59e0b;
  --mb-badge-danger-bg: #dc2626;
  --mb-badge-contrast-bg: #111827;
}

.mb-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:var(--mb-badge-size);
  height:var(--mb-badge-size);
  padding:0 .4rem;
  border-radius:var(--mb-badge-radius);
  background:var(--mb-badge-bg);
  color:var(--mb-badge-color);
  font-size:var(--mb-badge-font-size);
  line-height:1;
  box-sizing:border-box;
}

.mb-badge-sm{ min-width:var(--mb-badge-sm-size); height:var(--mb-badge-sm-size); font-size:0.65rem; }
.mb-badge-lg{ min-width:var(--mb-badge-lg-size); height:var(--mb-badge-lg-size); }
.mb-badge-xl{ min-width:var(--mb-badge-xl-size); height:var(--mb-badge-xl-size); }

/* Severity backgrounds */
.mb-badge-secondary{ background:var(--mb-badge-secondary-bg); }
.mb-badge-success{ background:var(--mb-badge-success-bg); }
.mb-badge-info{ background:var(--mb-badge-info-bg); }
.mb-badge-warn{ background:var(--mb-badge-warn-bg); }
.mb-badge-danger{ background:var(--mb-badge-danger-bg); }
.mb-badge-contrast{ background:var(--mb-badge-contrast-bg); }

.mb-badge-dot{ padding:0; width:0.75rem; min-width:0.75rem; height:0.75rem; border-radius:50%; }
`;
