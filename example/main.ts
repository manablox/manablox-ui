import '../src/theme/base.css';
import '../src/theme/components/button.css';
import '../src/theme/components/select.css';
import '../src/theme/components/multiselect.css';
import '../src/theme/components/dialog.css';
import '../src/theme/components/accordion.css';

import { defineButton } from '../src/components/Button';
import { defineSelect } from '../src/components/Select';
import { defineMultiSelect } from '../src/components/MultiSelect';
import { defineDialog } from '../src/components/Dialog';
import { defineAccordion } from '../src/components/Accordion';

defineButton();
defineSelect();
defineMultiSelect();
defineDialog();
defineAccordion();

// Dark mode toggle
const toggle = document.getElementById('theme-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.getAttribute('data-mb-theme') === 'dark') {
      html.removeAttribute('data-mb-theme');
      toggle.textContent = 'Switch to Dark Mode';
    } else {
      html.setAttribute('data-mb-theme', 'dark');
      toggle.textContent = 'Switch to Light Mode';
    }
  });
}
