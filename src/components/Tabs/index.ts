import { createDefine } from '../../core/define.js';
import { MbTabs, MbTabPanel } from './Tabs.js';

export { MbTabs, MbTabPanel };

export const defineTabs = createDefine('mb-tabs', MbTabs);
export const defineTabPanel = createDefine('mb-tabpanel', MbTabPanel);
