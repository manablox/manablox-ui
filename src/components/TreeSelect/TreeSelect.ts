import type { AttributeConverter, TreeNode } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { TREESELECT_STYLES } from './TreeSelect.styles.js';

type SelectionMode = 'single' | 'multiple' | 'checkbox';
type DisplayMode = 'comma' | 'chip';
type SelectionKeys = Record<string, boolean>;

export class MbTreeSelect extends MbBaseComponent {
	static readonly _componentName = 'mb-treeselect';
	static readonly _componentStyles = TREESELECT_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['options', 'object'],
			['selection-mode', 'string'],
			['display', 'string'],
			['meta-key-selection', 'boolean'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['placeholder', 'string'],
			['filter', 'boolean'],
			['filter-placeholder', 'string'],
			['reset-filter-on-hide', 'boolean'],
			['empty-message', 'string'],
			['scroll-height', 'string'],
			['append-to', 'string'],
			['auto-z-index', 'boolean'],
			['base-z-index', 'number'],
			['panel-class', 'string'],
			['input-id', 'string'],
			['aria-label', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTreeSelect.attributeConverters.keys());
	}

	#listenersBound = false;
	#portalKey = `mb-treeselect-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;
	#focused = false;
	#filterValue = '';
	#expanded = new Set<string>();

	get options(): TreeNode[] {
		const parsed = this._obj<unknown>('options');
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item): item is TreeNode => typeof item === 'object' && item !== null);
	}

	get selectionMode(): SelectionMode {
		const mode = this._str('selection-mode', 'single');
		return mode === 'multiple' || mode === 'checkbox' ? mode : 'single';
	}

	get display(): DisplayMode {
		return this._str('display', 'comma') === 'chip' ? 'chip' : 'comma';
	}

	get selectionKeys(): SelectionKeys {
		return this._obj<SelectionKeys>('value') ?? {};
	}

	set selectionKeys(next: SelectionKeys) {
		this.setAttribute('value', JSON.stringify(next));
	}

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onRootClick(event);
		const onKeyDown = (event: KeyboardEvent) => this.#onKeyDown(event);
		const onFocusIn = () => {
			if (!this.#focused) {
				this.#focused = true;
				this.emit('mb-focus');
			}
		};
		const onFocusOut = (event: FocusEvent) => {
			const next = event.relatedTarget as Node | null;
			if (next && (this.contains(next) || this.#portalHost?.contains(next))) return;
			if (this.#focused) {
				this.#focused = false;
				this.emit('mb-blur');
			}
		};
		const onInput = (event: Event) => this.#onInput(event);

		this.addEventListener('click', onClick);
		this.addEventListener('keydown', onKeyDown);
		this.addEventListener('focusin', onFocusIn);
		this.addEventListener('focusout', onFocusOut);
		this.addEventListener('input', onInput);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => this.removeEventListener('focusin', onFocusIn));
		this._addCleanup(() => this.removeEventListener('focusout', onFocusOut));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.#close(false));
	}

	disconnectedCallback(): void {
		this.#close(false);
		super.disconnectedCallback();
	}

	protected _render(): string {
		const disabled = this._bool('disabled');
		const invalid = this._bool('invalid');
		const selectedLabels = this.#selectedLabels();

		const classes = [
			'mb-treeselect',
			disabled ? 'mb-treeselect-disabled' : '',
			invalid ? 'mb-treeselect-invalid' : '',
		]
			.filter(Boolean)
			.join(' ');

		const labelMarkup =
			selectedLabels.length === 0
				? `<span class="mb-treeselect-placeholder">${this._escape(this._str('placeholder', 'Select'))}</span>`
				: this.display === 'chip'
					? `<div class="mb-treeselect-chip-items">${selectedLabels.map(label => `<span class="mb-treeselect-chip">${this._escape(label)}</span>`).join('')}</div>`
					: `<span class="mb-treeselect-label">${this._escape(selectedLabels.join(', '))}</span>`;

		return this._html`
			<div
				class="${classes}"
				role="combobox"
				aria-expanded="${this.#isOpen ? 'true' : 'false'}"
				aria-haspopup="tree"
				tabindex="${disabled ? '-1' : '0'}"
				${this._str('input-id') ? `id="${this._escape(this._str('input-id'))}"` : ''}
				${this._str('aria-label') ? `aria-label="${this._escape(this._str('aria-label'))}"` : ''}
			>
				<div class="mb-treeselect-label-container">${labelMarkup}</div>
				<button class="mb-treeselect-dropdown" type="button" ${disabled ? 'disabled' : ''}>▾</button>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen) {
			this.#renderOverlay();
		}
	}

	#onRootClick(event: Event): void {
		if (this._bool('disabled')) return;
		const target = event.target as HTMLElement;
		if (!target.closest('.mb-treeselect')) return;
		event.preventDefault();
		this.#isOpen ? this.#close(true) : this.#open();
	}

	#onKeyDown(event: KeyboardEvent): void {
		if (this._bool('disabled')) return;
		if ((event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') && !this.#isOpen) {
			event.preventDefault();
			this.#open();
			return;
		}
		if (event.key === 'Escape' && this.#isOpen) {
			event.preventDefault();
			this.#close(true);
		}
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (target.matches('.mb-treeselect-filter')) {
			this.#filterValue = target.value;
			if (this.#isOpen) this.#renderOverlay();
		}
	}

	#open(): void {
		if (this.#isOpen) return;
		this.#isOpen = true;
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#renderOverlay();

		const root = this._qs<HTMLElement>('.mb-treeselect');
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-treeselect-overlay');
		if (root && panel) {
			this.#positionCleanup = startAutoPosition(root, panel, { placement: 'bottom-start', offsetDistance: 4 });
		}

		const onDocDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (this.contains(target) || this.#portalHost?.contains(target)) return;
			this.#close(true);
		};
		document.addEventListener('mousedown', onDocDown, true);
		this.#outsideCleanup = () => document.removeEventListener('mousedown', onDocDown, true);

		this.emit('mb-show');
		this._scheduleRender();
	}

	#close(emitEvent: boolean): void {
		if (!this.#isOpen && !this.#portalHost) return;
		this.#isOpen = false;
		this.#positionCleanup?.();
		this.#positionCleanup = null;
		this.#outsideCleanup?.();
		this.#outsideCleanup = null;
		removePortal(this.#portalKey);
		this.#portalHost = null;
		if (this._bool('reset-filter-on-hide')) this.#filterValue = '';
		if (emitEvent) this.emit('mb-hide');
		this._scheduleRender();
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;
		const filteredNodes = this.#filteredNodes(this.options, '0');
		const scrollHeight = this._str('scroll-height', '400px');
		const panelClass = this._str('panel-class');
		const emptyMessage = this._str('empty-message', 'No records found');

		this.#portalHost.innerHTML = this._html`
			<div class="mb-treeselect-overlay ${this._escape(panelClass)}">
				${
					this._bool('filter')
						? `<input class="mb-treeselect-filter" type="text" value="${this._escape(this.#filterValue)}" placeholder="${this._escape(this._str('filter-placeholder', 'Filter'))}" />`
						: ''
				}
				<div class="mb-treeselect-tree-container" style="max-height:${this._escape(scrollHeight)}">
					${
						filteredNodes.length === 0
							? `<div class="mb-treeselect-empty-message">${this._escape(emptyMessage)}</div>`
							: `<ul class="mb-treeselect-tree">${filteredNodes.map((node, index) => this.#renderNode(node, `0-${index}`)).join('')}</ul>`
					}
				</div>
				<div class="mb-treeselect-footer">${this.#selectedLabels().length} selected</div>
			</div>
		`;

		const onClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const toggle = target.closest<HTMLElement>('[data-action="toggle"]');
			if (toggle) {
				const key = toggle.dataset.key ?? '';
				if (!key) return;
				if (this.#expanded.has(key)) {
					this.#expanded.delete(key);
					this.emit('mb-node-collapse', { key });
				} else {
					this.#expanded.add(key);
					this.emit('mb-node-expand', { key });
				}
				this.#renderOverlay();
				return;
			}

			const select = target.closest<HTMLElement>('[data-action="select"]');
			if (!select) return;
			const key = select.dataset.key ?? '';
			if (!key) return;
			this.#toggleSelection(key);
		};

		this.#portalHost.onclick = onClick;
	}

	#renderNode(node: TreeNode, key: string): string {
		const children = Array.isArray(node.children)
			? node.children.filter((item): item is TreeNode => typeof item === 'object' && item !== null)
			: [];
		const expanded = this.#expanded.has(key);
		const selected = Boolean(this.selectionKeys[key]);
		const hasChildren = children.length > 0;

		return this._html`
			<li>
				<div class="mb-treeselect-node-content" data-action="select" data-key="${this._escape(key)}">
					<button type="button" data-action="toggle" data-key="${this._escape(key)}" ${hasChildren ? '' : 'disabled'}>${expanded ? '▾' : '▸'}</button>
					${this.selectionMode === 'checkbox' ? `<input type="checkbox" ${selected ? 'checked' : ''} tabindex="-1" />` : ''}
					<span>${this._escape(String(node.label ?? key))}</span>
				</div>
				${hasChildren && expanded ? `<ul>${children.map((child, index) => this.#renderNode(child, `${key}-${index}`)).join('')}</ul>` : ''}
			</li>
		`;
	}

	#toggleSelection(key: string): void {
		const selection = { ...this.selectionKeys };
		const selected = Boolean(selection[key]);

		if (this.selectionMode === 'single') {
			const next: SelectionKeys = selected ? {} : { [key]: true };
			this.selectionKeys = next;
		} else {
			if (selected) delete selection[key];
			else selection[key] = true;
			this.selectionKeys = selection;
		}

		const nextSelected = Boolean(this.selectionKeys[key]);
		if (nextSelected) this.emit('mb-node-select', { key });
		else this.emit('mb-node-unselect', { key });

		this.emit('mb-change', { value: this.selectionKeys });
		if (this.selectionMode === 'single') this.#close(true);
		else this.#renderOverlay();
		this._scheduleRender();
	}

	#filteredNodes(nodes: TreeNode[], prefix: string): TreeNode[] {
		if (!this._bool('filter') || !this.#filterValue.trim()) return nodes;
		const query = this.#filterValue.trim().toLowerCase();

		const filterRecursive = (input: TreeNode[]): TreeNode[] => {
			const output: TreeNode[] = [];
			for (const node of input) {
				const label = String(node.label ?? '').toLowerCase();
				const children = Array.isArray(node.children)
					? node.children.filter((item): item is TreeNode => typeof item === 'object' && item !== null)
					: [];
				const filteredChildren = filterRecursive(children);
				if (label.includes(query) || filteredChildren.length > 0) {
					output.push({ ...node, children: filteredChildren });
				}
			}
			return output;
		};

		return filterRecursive(nodes);
	}

	#selectedLabels(): string[] {
		const keys = Object.entries(this.selectionKeys)
			.filter(([, selected]) => selected)
			.map(([key]) => key);
		if (keys.length === 0) return [];

		const labels: string[] = [];
		const walk = (nodes: TreeNode[], pathPrefix: string): void => {
			nodes.forEach((node, index) => {
				const key = `${pathPrefix}-${index}`;
				if (keys.includes(key)) {
					labels.push(String(node.label ?? key));
				}
				const children = Array.isArray(node.children)
					? node.children.filter((item): item is TreeNode => typeof item === 'object' && item !== null)
					: [];
				if (children.length > 0) walk(children, key);
			});
		};

		walk(this.options, '0');
		return labels;
	}
}

export const defineTreeSelect = createDefine('mb-treeselect', MbTreeSelect);
export {};
