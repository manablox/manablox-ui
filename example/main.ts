import '../src/theme/base.css';
import '../src/theme/components/button.css';
import '../src/theme/components/select.css';
import { defineButton } from '../src/components/Button';
import { defineSelect } from '../src/components/Select';

defineButton();
defineSelect();

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
