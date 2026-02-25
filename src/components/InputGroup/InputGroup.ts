import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { INPUTGROUP_STYLES } from './InputGroup.styles.js';
import { createDefine } from '../../core/define.js';

export class MbInputGroup extends MbBaseComponent {
	static _componentName = 'mb-inputgroup';
	static _componentStyles = INPUTGROUP_STYLES;

	protected _render(): string {
		return `<div class="mb-inputgroup"><slot></slot></div>`;
	}

	protected _afterRender(): void {
		// nothing to attach; but ensure addon nodes get correct class if user forgot
		const addons = this._qsa<HTMLElement>('.mb-inputgroup-addon');
		addons.forEach(el => el.classList.add('mb-inputgroup-addon'));
	}
}

export const defineInputGroup = createDefine('mb-inputgroup', MbInputGroup);

export default MbInputGroup;
