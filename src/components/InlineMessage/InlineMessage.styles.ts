export const INLINEMESSAGE_STYLES = `
:root{
  --mb-inlinemessage-font-size: .8125rem;
  --mb-inlinemessage-gap: .5rem;
  --mb-inlinemessage-padding: 0;
  --mb-inlinemessage-icon-size: 1rem;

  --mb-inlinemessage-info-color: #0284c7;
  --mb-inlinemessage-success-color: #15803d;
  --mb-inlinemessage-warn-color: #b45309;
  --mb-inlinemessage-error-color: #b91c1c;
  --mb-inlinemessage-secondary-color: #374151;
  --mb-inlinemessage-contrast-color: #ffffff;
}

.mb-inlinemessage{
  display:inline-flex;
  align-items:center;
  gap:var(--mb-inlinemessage-gap);
  padding:var(--mb-inlinemessage-padding);
  font-size:var(--mb-inlinemessage-font-size);
}

.mb-inlinemessage-icon{
  display:inline-flex;
  width:var(--mb-inlinemessage-icon-size);
  height:var(--mb-inlinemessage-icon-size);
  align-items:center;
  justify-content:center;
}

.mb-inlinemessage-info{ color:var(--mb-inlinemessage-info-color); }
.mb-inlinemessage-success{ color:var(--mb-inlinemessage-success-color); }
.mb-inlinemessage-warn{ color:var(--mb-inlinemessage-warn-color); }
.mb-inlinemessage-error{ color:var(--mb-inlinemessage-error-color); }
.mb-inlinemessage-secondary{ color:var(--mb-inlinemessage-secondary-color); }
.mb-inlinemessage-contrast{ color:var(--mb-inlinemessage-contrast-color); }
`;
