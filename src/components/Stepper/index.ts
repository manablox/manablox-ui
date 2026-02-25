import { createDefine } from '../../core/define.js';
import { MbStepper, MbStepperPanel } from './Stepper.js';

export { MbStepper, MbStepperPanel };

export const defineStepper = createDefine('mb-stepper', MbStepper);
export const defineStepperPanel = createDefine('mb-stepperpanel', MbStepperPanel);
