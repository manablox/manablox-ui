import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import type { AttributeConverter } from '../../core/types.js';
import styles from './MeterGroup.styles.js';

type MeterItem = { label: string; value: number; color?: string; icon?: string };

export class MbMeterGroup extends MbBaseComponent {
  static _componentName = 'mb-metergroup';
  static _componentStyles = styles;

  protected static get attributeConverters(): Map<string, AttributeConverter> {
    return new Map<string, AttributeConverter>([
      ['value', 'object'],
      ['min', 'number'],
      ['max', 'number'],
      ['orientation', 'string'],
      ['label-position', 'string'],
    ]);
  }

  static get observedAttributes() {
    return Array.from(this.attributeConverters.keys());
  }

  #items: MeterItem[] = [];

  constructor() {
    super();
    const v = this._obj<MeterItem[]>('value');
    if (v) this.#items = v;
  }

  protected _render(): string {
    const items = this._obj<MeterItem[]>('value') ?? this.#items;
    const orientation = this._str('orientation', 'horizontal');
    const labelPos = this._str('label-position', 'end');


    const sum = items.reduce((s, it) => s + (it.value ?? 0), 0) || 0;

    const metersHtml = items
      .map(
        it => `
        <div part="meter" class="mb-metergroup-meter" style="${orientation==='horizontal'?`flex:${sum>0?String(it.value/sum):'0 0 0'}`:''}">
          <div part="meter-fill" class="mb-metergroup-meter-inner" style="background:${this._escape(it.color ?? 'var(--mb-metergroup-meter-bg,#1976d2)')};width:100%;height:100%"></div>
        </div>`
      )
      .join('');

    const labelsHtml = items
      .map(it => `
        <div part="label" class="mb-metergroup-label"><span part="label-color" class="mb-metergroup-color" style="background:${this._escape(it.color ?? '#ccc')}"></span><span part="label-text">${this._escape(it.label)}</span></div>`)
      .join('');

    return this._html`
      <div part="root" class="mb-metergroup">
        ${labelPos === 'start' ? `<div part="labels" class="mb-metergroup-labels">${labelsHtml}</div>` : ''}
        <div part="meters" class="mb-metergroup-meters" style="flex-direction:${orientation==='vertical'?'column':'row'}">${metersHtml}</div>
        ${labelPos === 'end' ? `<div part="labels" class="mb-metergroup-labels">${labelsHtml}</div>` : ''}
      </div>`;
  }
}

export function defineMeterGroup(): void {
  if (!customElements.get('mb-metergroup')) {
    customElements.define('mb-metergroup', MbMeterGroup);
  }
}

export default MbMeterGroup;
