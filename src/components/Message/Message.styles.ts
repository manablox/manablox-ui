export const MESSAGE_STYLES = `
:root{
  --mb-message-padding: .75rem;
  --mb-message-radius: .5rem;
  --mb-message-gap: .5rem;
  --mb-message-font-size: .875rem;
  --mb-message-icon-size: 1.25rem;

  /* severity backgrounds/colors (defaults mirror Aura theme intent) */
  --mb-message-info-bg: #e6f7ff;
  --mb-message-info-border: #91d5ff;
  --mb-message-info-color: #055160;

  --mb-message-success-bg: #f6ffed;
  --mb-message-success-border: #b7eb8f;
  --mb-message-success-color: #194d19;

  --mb-message-warn-bg: #fffbe6;
  --mb-message-warn-border: #ffe58f;
  --mb-message-warn-color: #614700;

  --mb-message-error-bg: #fff2f0;
  --mb-message-error-border: #ffccc7;
  --mb-message-error-color: #5c0002;

  --mb-message-secondary-bg: #f3f4f6;
  --mb-message-secondary-border: #e5e7eb;
  --mb-message-secondary-color: #111827;

  --mb-message-contrast-bg: #111827;
  --mb-message-contrast-border: #111827;
  --mb-message-contrast-color: #ffffff;

  --mb-message-close-size: 1.25rem;
}

.mb-message{
  display:flex;
  align-items:center;
  padding:var(--mb-message-padding);
  border-radius:var(--mb-message-radius);
  gap:var(--mb-message-gap);
  font-size:var(--mb-message-font-size);
  border:1px solid transparent;
  box-sizing:border-box;
}

.mb-message-icon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:var(--mb-message-icon-size);
  height:var(--mb-message-icon-size);
  flex:0 0 auto;
}

.mb-message-text{
  flex:1 1 auto;
}

.mb-message-close-button{
  background:transparent;
  border:none;
  padding:0.25rem;
  margin:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}

.mb-message-close-icon{
  width:var(--mb-message-close-size);
  height:var(--mb-message-close-size);
  display:inline-block;
}

/* Severity variants */
.mb-message-info{ background:var(--mb-message-info-bg); color:var(--mb-message-info-color); border-color:var(--mb-message-info-border); }
.mb-message-success{ background:var(--mb-message-success-bg); color:var(--mb-message-success-color); border-color:var(--mb-message-success-border); }
.mb-message-warn{ background:var(--mb-message-warn-bg); color:var(--mb-message-warn-color); border-color:var(--mb-message-warn-border); }
.mb-message-error{ background:var(--mb-message-error-bg); color:var(--mb-message-error-color); border-color:var(--mb-message-error-border); }
.mb-message-secondary{ background:var(--mb-message-secondary-bg); color:var(--mb-message-secondary-color); border-color:var(--mb-message-secondary-border); }
.mb-message-contrast{ background:var(--mb-message-contrast-bg); color:var(--mb-message-contrast-color); border-color:var(--mb-message-contrast-border); }
`;
