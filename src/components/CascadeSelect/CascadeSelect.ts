import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { createPortal, removePortal } from '../../overlay/PortalManager.js';
import { startAutoPosition } from '../../overlay/Positioning.js';
import { CASCADESELECT_STYLES } from './CascadeSelect.styles.js';

type CascadeOption = Record<string, unknown>;

export class MbCascadeSelect extends MbBaseComponent {
	static readonly _componentName = 'mb-cascadeselect';
	static readonly _componentStyles = CASCADESELECT_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['options', 'object'],
			['option-label', 'string'],
			['option-value', 'string'],
			['option-group-label', 'string'],
			['option-group-children', 'string'],
			['placeholder', 'string'],
			['disabled', 'boolean'],
			['invalid', 'boolean'],
			['loading', 'boolean'],
			['input-id', 'string'],
			['aria-label', 'string'],
			['focus-on-hover', 'boolean'],
			['append-to', 'string'],
			['auto-z-index', 'boolean'],
			['base-z-index', 'number'],
			['panel-class', 'string'],
			['overlay-class', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbCascadeSelect.attributeConverters.keys());
	}

	#listenersBound = false;
	#portalKey = `mb-cascadeselect-${Math.random().toString(36).slice(2)}`;
	#portalHost: HTMLElement | null = null;
	#positionCleanup: (() => void) | null = null;
	#outsideCleanup: (() => void) | null = null;
	#isOpen = false;
	#activePath = '';
	#focused = false;

	get options(): CascadeOption[] {
		const parsed = this._obj<unknown>('options');
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item): item is CascadeOption => typeof item === 'object' && item !== null);
	}

	get selectedValue(): unknown {
		return this._obj<unknown>('value');
	}

	set selectedValue(next: unknown) {
		if (next == null) {
			this.removeAttribute('value');
		} else {
			this.setAttribute('value', JSON.stringify(next));
		}
	}

	get optionLabel(): string {
		return this._str('option-label', 'label');
	}

	get optionValue(): string {
		return this._str('option-value', 'value');
	}

	get optionGroupLabel(): string {
		return this._str('option-group-label', this.optionLabel);
	}

	get optionGroupChildren(): string {
		return this._str('option-group-children', 'children');
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

		this.addEventListener('click', onClick);
		this.addEventListener('keydown', onKeyDown);
		this.addEventListener('focusin', onFocusIn);
		this.addEventListener('focusout', onFocusOut);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('keydown', onKeyDown));
		this._addCleanup(() => this.removeEventListener('focusin', onFocusIn));
		this._addCleanup(() => this.removeEventListener('focusout', onFocusOut));
		this._addCleanup(() => this.#close(false));
	}

	disconnectedCallback(): void {
		this.#close(false);
		super.disconnectedCallback();
	}

	protected _render(): string {
		const disabled = this._bool('disabled');
		const invalid = this._bool('invalid');
		const label = this.#selectedLabel() || this._str('placeholder', 'Select');
		const classes = [
			'mb-cascadeselect',
			disabled ? 'mb-cascadeselect-disabled' : '',
			invalid ? 'mb-cascadeselect-invalid' : '',
		]
			.filter(Boolean)
			.join(' ');

		const id = this._str('input-id');
		const ariaLabel = this._str('aria-label');

		return this._html`
			<div
				class="${classes}"
				role="combobox"
				aria-expanded="${this.#isOpen ? 'true' : 'false'}"
				aria-haspopup="tree"
				tabindex="${disabled ? '-1' : '0'}"
				${id ? `id="${this._escape(id)}"` : ''}
				${ariaLabel ? `aria-label="${this._escape(ariaLabel)}"` : ''}
			>
				<span class="mb-cascadeselect-label">${this._escape(label)}</span>
				<button class="mb-cascadeselect-dropdown" type="button" ${disabled ? 'disabled' : ''}>▾</button>
			</div>
		`;
	}

	protected _afterRender(): void {
		if (this.#isOpen) {
			this.#renderOverlay();
		}
	}

	#onRootClick(event: Event): void {
		const target = event.target as HTMLElement;
		if (this._bool('disabled')) return;
		if (!target.closest('.mb-cascadeselect')) return;
		event.preventDefault();
		this.#isOpen ? this.#close(true) : this.#open();
	}

	#onKeyDown(event: KeyboardEvent): void {
		if (this._bool('disabled')) return;

		if (!this.#isOpen && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
			event.preventDefault();
			this.#open();
			return;
		}

		if (!this.#isOpen || !this.#portalHost) return;
		const items = Array.from(this.#portalHost.querySelectorAll<HTMLElement>('.mb-cascadeselect-item-content'));
		if (items.length === 0) return;

		const activeIndex = items.findIndex(item => item.dataset.path === this.#activePath);
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const delta = event.key === 'ArrowDown' ? 1 : -1;
			const nextIndex = activeIndex < 0 ? 0 : (activeIndex + delta + items.length) % items.length;
			const next = items[nextIndex];
			if (next) {
				this.#activePath = next.dataset.path ?? '';
				this.#renderOverlay();
			}
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			this.#openChildrenForPath(this.#activePath);
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			const parent = this.#activePath.split('.').slice(0, -1).join('.');
			this.#activePath = parent;
			this.#renderOverlay();
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			const active = items.find(item => item.dataset.path === this.#activePath);
			if (!active) return;
			const path = active.dataset.path ?? '';
			const option = this.#optionByPath(path);
			if (!option) return;
			const children = this.#childrenOf(option);
			if (children.length > 0) {
				this.#openChildrenForPath(path);
			} else {
				this.#selectOption(option);
			}
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			this.#close(true);
		}
	}

	#open(): void {
		if (this.#isOpen || this._bool('disabled')) return;
		this.#isOpen = true;
		this.#portalHost = createPortal(this.#portalKey, this, 'overlay');
		this.#activePath = '';
		this.#renderOverlay();

		const root = this._qs<HTMLElement>('.mb-cascadeselect');
		const panel = this.#portalHost.querySelector<HTMLElement>('.mb-cascadeselect-overlay');
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
		this.#activePath = '';
		if (emitEvent) this.emit('mb-hide');
		this._scheduleRender();
	}

	#renderOverlay(): void {
		if (!this.#portalHost) return;

		const overlayClass = this._str('overlay-class');
		const panelClass = this._str('panel-class');
		this.#portalHost.innerHTML = this._html`
			<div class="mb-cascadeselect-overlay ${this._escape(panelClass)} ${this._escape(overlayClass)}">
				<ul class="mb-cascadeselect-list" role="tree">
					${this.options.map((option, index) => this.#renderOption(option, String(index), 1)).join('')}
				</ul>
			</div>
		`;

		const onMouseOver = (event: Event) => {
			if (!this._bool('focus-on-hover')) return;
			const target = event.target as HTMLElement;
			const item = target.closest<HTMLElement>('.mb-cascadeselect-item-content');
			if (!item) return;
			this.#activePath = item.dataset.path ?? '';
			this.#openChildrenForPath(this.#activePath, false);
		};

		const onClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const item = target.closest<HTMLElement>('.mb-cascadeselect-item-content');
			if (!item) return;
			event.preventDefault();
			const path = item.dataset.path ?? '';
			const option = this.#optionByPath(path);
			if (!option) return;
			const children = this.#childrenOf(option);
			this.#activePath = path;
			if (children.length > 0) {
				this.#openChildrenForPath(path);
				this.emit('mb-group-change', { value: option });
			} else {
				this.#selectOption(option);
			}
		};

		this.#portalHost.onmouseover = onMouseOver;
		this.#portalHost.onclick = onClick;
	}

	#renderOption(option: CascadeOption, path: string, level: number): string {
		const label = this.#labelOf(option);
		const children = this.#childrenOf(option);
		const open = this.#activePath === path || this.#activePath.startsWith(`${path}.`);
		const activeClass = this.#activePath === path ? 'mb-active' : '';
		const content = this._html`
			<div class="mb-cascadeselect-item-content ${activeClass}" data-path="${this._escape(path)}" role="treeitem" aria-level="${level}" aria-expanded="${children.length > 0 ? String(open) : 'false'}">
				<span>${this._escape(label)}</span>
				${children.length > 0 ? '<span class="mb-cascadeselect-group-icon">▸</span>' : ''}
			</div>
		`;

		if (children.length === 0 || !open) {
			return `<li class="mb-cascadeselect-item">${content}</li>`;
		}

		return this._html`
			<li class="mb-cascadeselect-item">
				${content}
				<div class="mb-cascadeselect-overlay-sublist">
					<ul class="mb-cascadeselect-list" role="group">
						${children.map((child, index) => this.#renderOption(child, `${path}.${index}`, level + 1)).join('')}
					</ul>
				</div>
			</li>
		`;
	}

	#openChildrenForPath(path: string, rerender = true): void {
		this.#activePath = path;
		if (rerender) this.#renderOverlay();
	}

	#selectOption(option: CascadeOption): void {
		const optionValuePath = this.optionValue;
		const nextValue = optionValuePath ? this.#byPath(option, optionValuePath) : option;
		this.selectedValue = nextValue;
		this.emit('mb-change', { value: nextValue });
		this.#close(true);
	}

	#selectedLabel(): string {
		const current = this.selectedValue;
		if (current == null) return '';
		const options = this.options;
		const queue: CascadeOption[] = [...options];
		while (queue.length > 0) {
			const node = queue.shift() as CascadeOption;
			const nodeValue = this.optionValue ? this.#byPath(node, this.optionValue) : node;
			if (this.#equals(nodeValue, current)) return this.#labelOf(node);
			queue.push(...this.#childrenOf(node));
		}
		return '';
	}

	#optionByPath(path: string): CascadeOption | null {
		if (!path) return null;
		const parts = path.split('.').map(segment => Number(segment));
		let current: CascadeOption[] = this.options;
		let node: CascadeOption | null = null;

		for (const part of parts) {
			node = current[part] ?? null;
			if (!node) return null;
			current = this.#childrenOf(node);
		}
		return node;
	}

	#labelOf(option: CascadeOption): string {
		const value = this.#byPath(option, this.optionLabel);
		if (typeof value === 'string' || typeof value === 'number') return String(value);
		return 'Item';
	}

	#childrenOf(option: CascadeOption): CascadeOption[] {
		const value = this.#byPath(option, this.optionGroupChildren);
		if (!Array.isArray(value)) return [];
		return value.filter((item): item is CascadeOption => typeof item === 'object' && item !== null);
	}

	#byPath(obj: unknown, path: string): unknown {
		if (!obj || !path) return obj;
		return path.split('.').reduce<unknown>((acc, key) => {
			if (acc && typeof acc === 'object') {
				return (acc as Record<string, unknown>)[key];
			}
			return undefined;
		}, obj);
	}

	#equals(a: unknown, b: unknown): boolean {
		if (a === b) return true;
		try {
			return JSON.stringify(a) === JSON.stringify(b);
		} catch {
			return false;
		}
	}
}

export const defineCascadeSelect = createDefine('mb-cascadeselect', MbCascadeSelect);
export {};
