import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { VIRTUALSCROLLER_STYLES } from './VirtualScroller.styles.js';

type Orientation = 'vertical' | 'horizontal' | 'both';

interface ViewportState {
	first: number;
	last: number;
	offsetMain: number;
}

export class MbVirtualScroller extends MbBaseComponent {
	static readonly _componentName = 'mb-virtualscroller';
	static readonly _componentStyles = VIRTUALSCROLLER_STYLES;

	renderItem?: (item: unknown, index: number, options: { first: number; last: number }) => string;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['items', 'object'],
			['item-size', 'object'],
			['scroll-height', 'string'],
			['orientation', 'string'],
			['num-tolerated-items', 'number'],
			['delay', 'number'],
			['lazy', 'boolean'],
			['show-loader', 'boolean'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbVirtualScroller.attributeConverters.keys());
	}

	#listenersBound = false;
	#template: string | null = null;
	#viewport: ViewportState = { first: 0, last: -1, offsetMain: 0 };
	#scrollTimer: ReturnType<typeof setTimeout> | null = null;
	#lazySent = '';

	connectedCallback(): void {
		this.#captureTemplate();
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onScroll = () => this.#handleScroll();
		this.addEventListener('scroll', onScroll, { passive: true });
		this._addCleanup(() => this.removeEventListener('scroll', onScroll));
		this._addCleanup(() => {
			if (this.#scrollTimer) clearTimeout(this.#scrollTimer);
		});
	}

	get items(): unknown[] {
		const value = this._obj<unknown>('items');
		return Array.isArray(value) ? value : [];
	}

	get itemSize(): number | [number, number] {
		const raw = this._obj<unknown>('item-size');
		if (Array.isArray(raw) && raw.length >= 2) {
			return [Number(raw[0] ?? 0) || 0, Number(raw[1] ?? 0) || 0];
		}
		if (typeof raw === 'number') return raw;
		const fromAttr = this._num('item-size', 0) ?? 0;
		return fromAttr > 0 ? fromAttr : 40;
	}

	get orientation(): Orientation {
		const value = this._str('orientation', 'vertical');
		return value === 'horizontal' || value === 'both' ? value : 'vertical';
	}

	get numToleratedItems(): number {
		return Math.max(0, this._num('num-tolerated-items', 3) ?? 3);
	}

	get delay(): number {
		return Math.max(0, this._num('delay', 0) ?? 0);
	}

	get lazy(): boolean {
		return this._bool('lazy');
	}

	get showLoader(): boolean {
		return this._bool('show-loader');
	}

	scrollToIndex(index: number): void {
		const clamped = Math.max(0, Math.min(this.items.length - 1, index));
		const [mainSize] = this.#resolvedItemSize();
		if (this.orientation === 'horizontal') {
			this.scrollTo({ left: clamped * mainSize });
		} else {
			this.scrollTo({ top: clamped * mainSize });
		}
	}

	scrollTo(options?: ScrollToOptions): void;
	scrollTo(x: number, y: number): void;
	scrollTo(optionsOrX?: ScrollToOptions | number, y?: number): void {
		if (typeof optionsOrX === 'number') {
			super.scrollTo(optionsOrX, y ?? 0);
		} else {
			super.scrollTo(optionsOrX);
		}
		this.#updateViewport();
	}

	protected _render(): string {
		this.#updateViewport();
		const [mainSize, crossSize] = this.#resolvedItemSize();
		const total = this.items.length;
		const totalMain = total * Math.max(1, mainSize);
		const { first, last, offsetMain } = this.#viewport;
		const slice = this.items.slice(first, Math.max(first, last + 1));
		const vertical = this.orientation !== 'horizontal';
		const styleHeight = this._escape(this._str('scroll-height', '24rem'));

		const contentItems = slice
			.map((item, i) => {
				const index = first + i;
				const markup = this.#renderItem(item, index, { first, last });
				const itemStyle = vertical
					? `height:${Math.max(1, mainSize)}px;${this.orientation === 'both' ? `width:${Math.max(1, crossSize)}px;` : ''}`
					: `width:${Math.max(1, mainSize)}px;height:${Math.max(1, crossSize)}px;display:inline-block;`;
				return `<div class="mb-virtualscroller-item" part="item" data-index="${index}" style="${itemStyle}">${markup}</div>`;
			})
			.join('');

		const transform =
			this.orientation === 'horizontal'
				? `translateX(${offsetMain}px)`
				: this.orientation === 'both'
					? `translate(${this.scrollLeft}px, ${offsetMain}px)`
					: `translateY(${offsetMain}px)`;
		const contentStyle =
			this.orientation === 'horizontal'
				? `transform:${transform};white-space:nowrap;`
				: `transform:${transform};`;

		const spacerStyle =
			this.orientation === 'horizontal'
				? `width:${totalMain}px;height:1px;`
				: this.orientation === 'both'
					? `height:${totalMain}px;width:100%;`
					: `height:${totalMain}px;width:1px;`;

		const loader = this.showLoader && total === 0 ? '<div class="mb-virtualscroller-loader">Loading...</div>' : '';

		return this._html`
			<div
				class="mb-virtualscroller"
				part="root"
				role="list"
				style="height:${styleHeight};${this.orientation === 'horizontal' ? 'white-space:nowrap;' : ''}"
			>
				<slot part="templates" hidden></slot>
				<div class="mb-virtualscroller-spacer" part="spacer" style="${spacerStyle}"></div>
				<div class="mb-virtualscroller-content" part="content" style="${contentStyle}">${contentItems || loader}</div>
			</div>
		`;
	}

	#handleScroll(): void {
		if (this.delay > 0) {
			if (this.#scrollTimer) clearTimeout(this.#scrollTimer);
			this.#scrollTimer = setTimeout(() => this.#updateAfterScroll(), this.delay);
			return;
		}
		this.#updateAfterScroll();
	}

	#updateAfterScroll(): void {
		this.#updateViewport();
		this._scheduleRender();
		this.emit('mb-scroll', {
			first: this.#viewport.first,
			last: this.#viewport.last,
			scrollTop: this.scrollTop,
		});
		this.#emitLazyIfNeeded();
	}

	#updateViewport(): void {
		const total = this.items.length;
		const [itemMain] = this.#resolvedItemSize();
		const mainSize = Math.max(1, itemMain);
		const viewportMain = this.orientation === 'horizontal' ? this.clientWidth : this.clientHeight;
		const scrollMain = this.orientation === 'horizontal' ? this.scrollLeft : this.scrollTop;
		const visibleCount = Math.max(1, Math.ceil(viewportMain / mainSize));
		const first = Math.max(0, Math.floor(scrollMain / mainSize) - this.numToleratedItems);
		const last = Math.min(total - 1, first + visibleCount + this.numToleratedItems * 2);
		this.#viewport = {
			first,
			last,
			offsetMain: first * mainSize,
		};
	}

	#emitLazyIfNeeded(): void {
		if (!this.lazy || this.items.length === 0) return;
		const threshold = Math.max(0, this.items.length - (this.numToleratedItems + 1));
		if (this.#viewport.last < threshold) return;
		const signature = `${this.#viewport.first}:${this.#viewport.last}`;
		if (this.#lazySent === signature) return;
		this.#lazySent = signature;
		this.emit('mb-lazy-load', {
			first: this.#viewport.first,
			last: this.#viewport.last,
		});
	}

	#resolvedItemSize(): [number, number] {
		if (Array.isArray(this.itemSize)) {
			return [Math.max(1, this.itemSize[0]), Math.max(1, this.itemSize[1])];
		}
		const v = Math.max(1, this.itemSize);
		return [v, v];
	}

	#captureTemplate(): void {
		const template = this._qsLight<HTMLTemplateElement>('template[data-slot="item"]');
		this.#template = template?.innerHTML ?? null;
	}

	#renderItem(item: unknown, index: number, options: { first: number; last: number }): string {
		if (typeof this.renderItem === 'function') {
			const rendered = this.renderItem(item, index, options);
			return rendered ?? '';
		}
		if (this.#template) {
			const value = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
			return this.#template
				.replace(/{{\s*index\s*}}/g, this._escape(index))
				.replace(/{{\s*item\s*}}/g, this._escape(item))
				.replace(/{{\s*([\w-]+)\s*}}/g, (_, key: string) => this._escape(value[key] ?? ''));
		}
		return `<div>${this._escape(item)}</div>`;
	}
}

export const defineVirtualScroller = createDefine('mb-virtualscroller', MbVirtualScroller);

export {};
