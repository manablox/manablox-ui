import { createDefine } from '../../core/define.js';
import { MbSplitter, MbSplitterPanel } from './Splitter.js';

export { MbSplitter, MbSplitterPanel };

export const defineSplitter = createDefine('mb-splitter', MbSplitter);
export const defineSplitterPanel = createDefine('mb-splitterpanel', MbSplitterPanel);
