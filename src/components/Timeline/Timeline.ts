import type { AttributeConverter } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { TIMELINE_STYLES } from './Timeline.styles.js';

type TimelineLayout = 'vertical' | 'horizontal';
type TimelineAlign = 'left' | 'right' | 'alternate';

type TimelineItem = Record<string, unknown>;

function normalizeItems(value: unknown): TimelineItem[] {
	if (!Array.isArray(value)) return [];
	return value.filter((entry): entry is TimelineItem => typeof entry === 'object' && entry !== null);
}

export class MbTimeline extends MbBaseComponent {
	static readonly _componentName = 'mb-timeline';
	static readonly _componentStyles = TIMELINE_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['layout', 'string'],
			['align', 'string'],
			['data-key', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTimeline.attributeConverters.keys());
	}

	get value(): TimelineItem[] {
		return normalizeItems(this._obj<unknown>('value'));
	}
	set value(next: TimelineItem[]) {
		this.setAttribute('value', JSON.stringify(next ?? []));
	}

	get layout(): TimelineLayout {
		return this._str('layout', 'vertical') === 'horizontal' ? 'horizontal' : 'vertical';
	}

	get align(): TimelineAlign {
		const value = this._str('align', 'alternate');
		return value === 'left' || value === 'right' || value === 'alternate' ? value : 'alternate';
	}

	get dataKey(): string {
		return this._str('data-key');
	}

	protected _render(): string {
		const items = this.value;
		const classes = [
			'mb-timeline',
			this.layout === 'horizontal' ? 'mb-timeline-horizontal' : '',
			this.align === 'alternate' ? 'mb-timeline-alternate' : '',
			this.align === 'right' ? 'mb-timeline-right' : '',
		]
			.filter(Boolean)
			.join(' ');

		const events = items
			.map((item, index) => {
				const key = this.#resolveKey(item, index);
				const opposite = this.#resolveOpposite(item);
				const marker = this.#resolveMarker(item);
				const content = this.#resolveContent(item);

				return this._html`
					<li part="event" class="mb-timeline-event" data-key="${this._escape(key)}" data-index="${index}">
						<div part="opposite" class="mb-timeline-event-opposite">${opposite}</div>
						<div part="separator" class="mb-timeline-event-separator">
							<div part="marker" class="mb-timeline-event-marker" ${this.#markerStyle(item)}>${marker}</div>
							${index < items.length - 1 ? '<div part="connector" class="mb-timeline-event-connector"></div>' : ''}
						</div>
						<div part="content" class="mb-timeline-event-content">${content}</div>
					</li>
				`;
			})
			.join('');

		return this._html`<ol part="root" class="${classes}">${events || '<slot></slot>'}</ol>`;
	}

	#resolveKey(item: TimelineItem, index: number): string {
		if (!this.dataKey) return String(index);
		const key = item[this.dataKey];
		return key == null ? String(index) : String(key);
	}

	#resolveOpposite(item: TimelineItem): string {
		const date = item.date;
		if (date != null) return this._escape(date);
		const label = item.label;
		return label == null ? '&nbsp;' : this._escape(label);
	}

	#resolveMarker(item: TimelineItem): string {
		const icon = item.icon;
		return icon == null ? '' : this._escape(icon);
	}

	#resolveContent(item: TimelineItem): string {
		const explicit = item.content;
		if (explicit != null) return this._escape(explicit);
		if (item.label != null) return this._escape(item.label);
		return '';
	}

	#markerStyle(item: TimelineItem): string {
		const color = item.color;
		if (typeof color !== 'string' || color.trim() === '') return '';
		return `style="border-color:${this._escape(color)};color:${this._escape(color)}"`;
	}
}

export const defineTimeline = createDefine('mb-timeline', MbTimeline);
export default MbTimeline;
export {};
