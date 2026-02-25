import { createDefine } from '../../core/define.js';
import {
  MbAccordion,
  MbAccordionPanel,
  MbAccordionHeader,
  MbAccordionContent,
} from './Accordion.js';

export {
  MbAccordion,
  MbAccordionPanel,
  MbAccordionHeader,
  MbAccordionContent,
};

export const defineAccordion = createDefine('mb-accordion', MbAccordion);
export const defineAccordionPanel = createDefine('mb-accordionpanel', MbAccordionPanel);
export const defineAccordionHeader = createDefine('mb-accordionheader', MbAccordionHeader);
export const defineAccordionContent = createDefine('mb-accordioncontent', MbAccordionContent);
