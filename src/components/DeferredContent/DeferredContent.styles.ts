export const DEFERREDCONTENT_STYLES = `
.mb-deferredcontent{display:block}
.mb-deferredcontent .mb-deferredcontent-wrapper{visibility:hidden;opacity:0;transition:opacity .2s ease,visibility .2s}
.mb-deferredcontent.mb-deferredcontent-loaded .mb-deferredcontent-wrapper{visibility:visible;opacity:1}
`;
