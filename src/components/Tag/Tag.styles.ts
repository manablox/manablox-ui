export const TAG_STYLES = `
:root{
  --mb-tag-padding: 0.25rem .5rem;
  --mb-tag-radius: .375rem;
  --mb-tag-font-size: .75rem;
  --mb-tag-bg: #e5e7eb;
  --mb-tag-color: #111827;

  --mb-tag-secondary-bg: #6b7280;
  --mb-tag-success-bg: #d1fae5;
  --mb-tag-success-color: #064e3b;
  --mb-tag-info-bg: #dbeafe;
  --mb-tag-info-color: #083344;
  --mb-tag-warn-bg: #fff7ed;
  --mb-tag-warn-color: #92400e;
  --mb-tag-danger-bg: #fee2e2;
  --mb-tag-danger-color: #7f1d1d;
  --mb-tag-contrast-bg: #111827;
  --mb-tag-contrast-color: #ffffff;
}

.mb-tag{
  display:inline-flex;
  align-items:center;
  gap:0.4rem;
  padding:var(--mb-tag-padding);
  border-radius:var(--mb-tag-radius);
  font-size:var(--mb-tag-font-size);
  background:var(--mb-tag-bg);
  color:var(--mb-tag-color);
}

.mb-tag-rounded{ border-radius:9999px; }

.mb-tag-icon{ display:inline-flex; align-items:center; justify-content:center; }

.mb-tag-secondary{ background:var(--mb-tag-secondary-bg); color:#fff; }
.mb-tag-success{ background:var(--mb-tag-success-bg); color:var(--mb-tag-success-color); }
.mb-tag-info{ background:var(--mb-tag-info-bg); color:var(--mb-tag-info-color); }
.mb-tag-warn{ background:var(--mb-tag-warn-bg); color:var(--mb-tag-warn-color); }
.mb-tag-danger{ background:var(--mb-tag-danger-bg); color:var(--mb-tag-danger-color); }
.mb-tag-contrast{ background:var(--mb-tag-contrast-bg); color:var(--mb-tag-contrast-color); }
`;
