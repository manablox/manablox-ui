# ManaBlox UI

DISCLAIMER: Dont use this anywhere now. It is just a under heavy development package, which will break every day.

ManaBlox UI is a compact, framework-agnostic web components library for building UI with a consistent Aura theme.

Package: `manablox-ui` · Language: TypeScript (ESM-only) · Package manager: `pnpm`

---

## Introduction

ManaBlox UI provides a suite of native Web Components (custom elements) that use a single Aura theme and simple, attribute-driven APIs. Components use **Shadow DOM** for encapsulation, which guarantees internal structure is isolated and enables native `<slot>` support for composing content.

Each component renders into its own shadow root. Styling works through:

- "**CSS custom properties** (`--mb-*`) — inherit through the shadow boundary and are the primary theming API."
- "**`::part()` selectors** — allow consumers to style specific internal parts from outside (e.g. `mb-button::part(label)`)."
- "**Global CSS** on `:root` / theme token sheets continues to work normally."

- Tag prefix: `mb-` (example: `<mb-button>`, `<mb-dialog>`)
- CSS class prefix: `mb-`
- CSS variable prefix: `--mb-`
- Theme: Aura — import with `import 'manablox-ui/theme/aura.css'`
- Dark mode: add `data-mb-theme="dark"` to `<html>` or any ancestor
- Slots: components accept light-DOM children via named and default <slot> elements
- Parts: internal elements expose part="..." attributes for external styling via ::part()

Output files (package build):
- `dist/index.js` (ESM runtime)
- `dist/index.d.ts` (TypeScript declarations)
- `dist/theme/aura.css` (theme CSS)

Runtime dependencies: `@floating-ui/dom`, `tabbable`

---

## Installation

Install with pnpm:

```bash
pnpm add manablox-ui
```

Then import what you need from the package (examples below).

---

## Theme CSS — Selective Loading

ManaBlox UI ships the Aura theme as a full bundle and as per-component CSS files so you can choose between ease-of-use and optimal bundle size.

- **Option A — Load everything (easiest):** Import the full bundle

```js
import 'manablox-ui/theme/aura.css';
```

- **Option B — Load selectively (optimal for bundle size):** Import only what you use

```js
// Required foundation — always load this first
import 'manablox/theme/base.css';

// Then only the components you use
import 'manablox-ui/theme/components/button.css';
import 'manablox-ui/theme/components/dialog.css';
import 'manablox-ui/theme/components/inputtext.css';
// ... etc.
```

`base.css` contains all color primitives and semantic design tokens required by every component. Each `components/*.css` file contains only the CSS custom properties used by that specific component, so importing them selectively reduces bundle size.

Available component CSS files (alphabetical): accordion, autocomplete, avatar, badge, blockui, breadcrumb, button, card, carousel, cascadeselect, checkbox, chip, colorpicker, confirmdialog, confirmpopup, contextmenu, datatable, dataview, datepicker, dialog, dock, drawer, editor, fieldset, fileupload, floatlabel, galleria, iconfield, image, inlinemessage, inplace, inputchips, inputgroup, inputnumber, inputotp, inputtext, knob, listbox, megamenu, menu, menubar, message, metergroup, multiselect, orderlist, organizationchart, overlaybadge, paginator, panelmenu, panel, password, picklist, popover, progressbar, progressspinner, radiobutton, rating, scrollpanel, select, selectbutton, skeleton, slider, speeddial, splitbutton, splitter, stepper, steps, tabmenu, tabs, tag, terminal, textarea, tieredmenu, timeline, toast, togglebutton, toggleswitch, toolbar, tooltip, tree, treetable, treeselect

---

## Quick Start (Vanilla JS)

Create a simple app and register components:

```js
// main.js
import 'manablox-ui/theme/aura.css';
import { defineAll } from 'manablox-ui';

// register all components (or register selectively)
defineAll();

// now use components in your HTML
```

Or register only the components you need:

```js
import { defineButton, defineDialog } from 'manablox-ui';
defineButton();
defineDialog();
```

---

## Theme & Dark Mode

Load the Aura theme:

```js
import 'manablox-ui/theme/aura.css';
```

Enable dark mode by setting the attribute on the document or any ancestor element:

```js
document.documentElement.setAttribute('data-mb-theme', 'dark');
// toggle back
document.documentElement.removeAttribute('data-mb-theme');
```

Because components use Shadow DOM, theming is done through CSS custom properties (`--mb-*`), which inherit through shadow roots automatically. The `aura.css` theme defines these tokens on `:root`.

**Styling internal elements from outside** — use `::part()`:

```css
/* Change label font on all buttons */
mb-button::part(label) {
  font-weight: 700;
}
/* Style the select trigger */
mb-select::part(root) {
  border-radius: 0;
}
```

> **Note:** Global class selectors like `.mb-button` no longer reach inside shadow roots. Use `::part()` and CSS variables for all customization.

**Slot-based content composition:**

```html
<!-- default slot -->
<mb-button>Click me</mb-button>

<!-- named slots -->
<mb-dialog header="Confirm">
  <p>Are you sure?</p>
  <div slot="footer">
    <mb-button outlined>Cancel</mb-button>
    <mb-button severity="danger">Delete</mb-button>
  </div>
</mb-dialog>
```

Slotted content stays in light DOM and retains access to your global stylesheets, so icon fonts (e.g. PrimeIcons) work as normal inside slotted content.

---

## Registering Components

The package exports a `defineAll()` helper and individual `defineX()` functions for each component. `defineAll()` is implemented by combining per-component define functions and calling `customElements.define()` for each element.

Usage:

```js
import { defineAll } from 'manablox-ui';
defineAll();

// or selectively
import { defineButton } from 'manablox-ui';
defineButton();
```

After registration, elements like `<mb-button>` and `<mb-dialog>` become available in the DOM.

---

## Using Components (detailed)

Below are practical examples of commonly-used components and how to use them via attributes, slots and events.

Notes about attributes and props:

- HTML attributes map to component props (kebab-case → camelCase).
- Boolean attributes: presence = true. Setting `attr="false"` is treated as false by the runtime when handled explicitly. You can remove the attribute to set false from JS.
- JSON attributes: pass stringified JSON (for `options`, `columns`, `value`, etc.).
- Events are custom events prefixed with `mb-` (for example `mb-change`).
- Slotted content: place light-DOM children inside the element; the component projects them via named or default slots.
- Internal styles cannot be overridden with class selectors; use CSS variables (--mb-*) and ::part() instead.

### Button

Props (as HTML attributes): `label`, `icon`, `icon-pos` ("left"|"right"), `severity` ("secondary"|"success"|"info"|"warning"|"danger"|"contrast"), `raised`, `rounded`, `text`, `outlined`, `link`, `size` ("small"|"large"), `disabled`, `loading`, `badge`, `badge-severity`

Slots: default (label text), `icon`
Parts: `root`, `label`, `icon`, `loading-icon`, `badge`

Examples:

```html
<mb-button label="Save" severity="success" raised></mb-button>
<mb-button label="Delete" severity="danger" outlined></mb-button>
<mb-button loading>Loading...</mb-button>
<mb-button icon="pi pi-check" icon-pos="right" label="Confirm"></mb-button>

<!-- icon via named slot — icon font applies in light DOM -->
<mb-button>
  <i slot="icon" class="pi pi-check"></i>
  Confirm
</mb-button>
```

### Select / MultiSelect

Props: `options` (JSON array), `model-value or value` (string or JSON for objects), `placeholder`, `disabled`, `filter`, `filter-placeholder`

The dropdown overlay is rendered into a portal on `document.body` and styled via globally injected CSS, so it is unaffected by shadow encapsulation.

Example:

```html
<mb-select
  options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'
  placeholder="Choose one"
></mb-select>

<script>
document.querySelector('mb-select').addEventListener('mb-change', e => {
  console.log(e.detail.value);
});
</script>
```

### Dialog

Props: `visible` (boolean), `header` (string), `modal`, `closable`, `draggable`, `maximizable`, `position` ("center"|"top"|"bottom"|"left"|"right")

Example:

```html
<mb-dialog header="My Dialog" modal closable>
  <p>Dialog content here</p>
  <div slot="footer">
    <mb-button label="Close" outlined></mb-button>
    <mb-button label="Save" severity="primary"></mb-button>
  </div>
</mb-dialog>

<!-- Toggle via JS -->
<script>
const dlg = document.querySelector('mb-dialog');
dlg.setAttribute('visible', '');       // open
dlg.setAttribute('visible', 'false'); // close
dlg.removeAttribute('visible');        // close

dlg.addEventListener('mb-show', () => console.log('shown'));
dlg.addEventListener('mb-hide', () => console.log('hidden'));
</script>
```

### DataTable

Use `columns` as JSON, enable `paginator`, `rows`, and other attributes.

```html
<mb-datatable
  columns='[{"field":"name","header":"Name","sortable":true},{"field":"age","header":"Age"}]'
  paginator
  rows="10"
  selection-mode="single"
  striped-rows
  show-gridlines
></mb-datatable>

<script>
const table = document.querySelector('mb-datatable');
table.setAttribute('value', JSON.stringify([{ name: 'Alice', age: 30 }]));
table.addEventListener('mb-sort', e => console.log(e.detail));
</script>
```

### Tree

```html
<mb-tree selection-mode="checkbox" filter filter-placeholder="Search..."></mb-tree>

<script>
document.querySelector('mb-tree').setAttribute('value', JSON.stringify([
  { key: '0', label: 'Root', children: [
    { key: '0-0', label: 'Child A' },
    { key: '0-1', label: 'Child B' }
  ]}
]));
</script>
```

### Tooltip

Attach a tooltip to a target element using `target` selector:

```html
<mb-tooltip target="#my-btn" value="This is a tooltip" position="top"></mb-tooltip>
<mb-button id="my-btn" label="Hover me"></mb-button>
```

### Accordion

```html
<mb-accordion>
  <mb-accordionpanel value="0">
    <mb-accordionheader>Section 1</mb-accordionheader>
    <mb-accordioncontent>Content of section 1</mb-accordioncontent>
  </mb-accordionpanel>
  <mb-accordionpanel value="1">
    <mb-accordionheader>Section 2</mb-accordionheader>
    <mb-accordioncontent>Content of section 2</mb-accordioncontent>
  </mb-accordionpanel>
</mb-accordion>
```

### Tabs

```html
<mb-tabs>
  <mb-tabpanel header="Tab 1">Content of tab 1</mb-tabpanel>
  <mb-tabpanel header="Tab 2">Content of tab 2</mb-tabpanel>
</mb-tabs>
```

### Paginator

```html
<mb-paginator total-records="150" rows="10" rows-per-page-options="[10,25,50]"></mb-paginator>
```

Event: `mb-page` → `{ first, rows, page, pageCount }`

### VirtualScroller

```js
const vs = document.querySelector('mb-virtualscroller');
vs.setAttribute('items', JSON.stringify(myLargeArray));
vs.setAttribute('item-size', '50');
vs.setAttribute('scroll-height', '400px');
vs.renderItem = (item, index) => `<div class="my-item">${item.name}</div>`;
```

### Splitter

```html
<mb-splitter layout="horizontal" gutter-size="8">
  <mb-splitterpanel size="30" min-size="10">Left panel</mb-splitterpanel>
  <mb-splitterpanel size="70">Right panel</mb-splitterpanel>
</mb-splitter>
```

### Stepper

```html
<mb-stepper>
  <mb-stepperpanel header="Personal Info">
    <p>Step 1 content</p>
    <mb-button data-step-action="next" label="Next"></mb-button>
  </mb-stepperpanel>
  <mb-stepperpanel header="Address">
    <p>Step 2 content</p>
    <mb-button data-step-action="prev" label="Back"></mb-button>
    <mb-button data-step-action="next" label="Next"></mb-button>
  </mb-stepperpanel>
  <mb-stepperpanel header="Confirm">
    <p>Review and submit</p>
  </mb-stepperpanel>
</mb-stepper>
```

---

## Events

All custom events are prefixed with `mb-`. Example events include `mb-change`, `mb-click`, `mb-hide`, `mb-show`, `mb-page`, `mb-sort`, etc. Listen with `addEventListener`:

```js
element.addEventListener('mb-change', e => {
  console.log(e.detail);
});
```

---

## Services

The package exports three main services as singletons: `toastService`, `confirmService`, and `dynamicDialogService`.

### Toast Service

```ts
import { toastService } from 'manablox-ui';

toastService.add({ severity: 'success', summary: 'Saved', detail: 'Record saved.' });
toastService.add({ severity: 'error', summary: 'Error', detail: 'Something failed.', sticky: true });
toastService.remove(id);
toastService.clear();
```

Mount the toast host so toasts appear on screen:

```html
<mb-toast position="top-right"></mb-toast>
```

Positions: `top-right` (default), `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`, `center`.

### Confirm Service

```ts
import { confirmService } from 'manablox-ui';

confirmService.require({
  header: 'Are you sure?',
  message: 'This action cannot be undone.',
  acceptLabel: 'Yes, delete',
  rejectLabel: 'Cancel',
  severity: 'danger',
  onAccept: () => doDelete(),
  onReject: () => console.log('cancelled'),
});
```

Mount the host element:

```html
<mb-confirmdialog></mb-confirmdialog>
```

### DynamicDialog Service

```ts
import { dynamicDialogService } from 'manablox-ui';

const key = dynamicDialogService.open('mb-my-form', {
  header: 'Edit Record',
  modal: true,
  props: { recordId: 42 },
  onClose: (result) => console.log('closed with', result),
});

dynamicDialogService.close(key);
```

Mount the host element:

```html
<mb-dynamicdialog></mb-dynamicdialog>
```

---

## TypeScript

This library is written in TypeScript and ships `dist/index.d.ts`. The package root re-exports all TypeScript types (from `core/types`) so you can import typings from the package:

```ts
import type { /* component types */ } from 'manablox-ui';
```

Because components are native elements, when needed you can narrow an element reference in TypeScript:

```ts
const btn = document.querySelector('mb-button') as HTMLElement & { label?: string };
btn?.addEventListener('mb-click', (e: Event) => {});
```

Note: this package is ESM-only. Use a bundler or environment that supports ES modules.

---

## Framework Integration

- Vanilla JS: import theme and register components as shown in Quick Start.
- Bundlers (Vite, Rollup, Webpack): import the theme and call `defineAll()` or selective `defineX()` in your entry point. Example for Vite:

```ts
// src/main.ts
import 'manablox-ui/theme/aura.css';
import { defineAll } from 'manablox-ui';
defineAll();
```

- React: ManaBlox components are native custom elements. Use them in JSX after registration. React's synthetic event system doesn't automatically forward custom DOM events; prefer `ref` + `addEventListener` in `useEffect` to listen to `mb-` events:

```tsx
import React, { useEffect, useRef } from 'react';

function App() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChange = (e: Event) => console.log('mb-change', (e as CustomEvent).detail);
    el.addEventListener('mb-change', onChange as EventListener);
    return () => el.removeEventListener('mb-change', onChange as EventListener);
  }, []);

  return <mb-select ref={ref as any} options='[{"label":"A","value":"a"}]'></mb-select>;
}
```

---

## Full Component Reference

| Category | Components |
|---|---|
| Form | Button, InputText, Textarea, InputGroup, Checkbox, RadioButton, ToggleButton, InputNumber, InputMask, InputOtp, Password, Rating, Slider, Knob, ColorPicker, TriStateCheckbox, Select, MultiSelect, AutoComplete, ListBox, CascadeSelect, TreeSelect, SelectButton, FileUpload |
| Data Display | DataTable, DataView, Timeline, Tree, TreeTable, VirtualScroller, OrderList, PickList, Carousel, Galleria |
| Layout | Card, Divider, Panel, Toolbar, Fieldset, ScrollPanel, Splitter/SplitterPanel, BlockUI |
| Navigation | Tabs/TabPanel, Accordion/AccordionPanel/AccordionHeader/AccordionContent, Stepper/StepperPanel, Breadcrumb, Steps, TabMenu, Paginator, Menu, Menubar, TieredMenu, ContextMenu, PanelMenu, MegaMenu, Dock |
| Overlay | Dialog, Drawer, Tooltip, Popover, ConfirmDialog, ConfirmPopup, DynamicDialog |
| Messaging | Toast, Message, InlineMessage |
| Media | Avatar, AvatarGroup, Image |
| Misc | Badge, Tag, Chip, Inplace, DeferredContent, ScrollTop, MeterGroup, Skeleton, ProgressBar, ProgressSpinner, Terminal |

Use the tag prefix `mb-` for all components (for instance `<mb-button>`, `<mb-dialog>`).

---

If you'd like, I can add a small demo `index.html` and a Vite starter configured with `manablox-ui` to help you prototype quickly — tell me which you'd prefer (Vanilla or Vite + React).
