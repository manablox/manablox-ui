// Attribute converter types
export type StringConverter = 'string';
export type BooleanConverter = 'boolean';
export type NumberConverter = 'number';
export type ObjectConverter = 'object';
export type AttributeConverter = StringConverter | BooleanConverter | NumberConverter | ObjectConverter;

// Attribute descriptor used in observedAttributes declaration
export interface AttributeDescriptor {
	name: string;
	converter: AttributeConverter;
	defaultValue?: unknown;
}

// Component severity / variant types (align with PrimeVue)
export type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
export type ButtonSize = 'small' | 'large';
export type InputSize = 'small' | 'large';
export type SelectionMode = 'single' | 'multiple' | 'checkbox';
export type SortOrder = 1 | -1 | 0;
export type Nullable<T> = T | null;

// TreeNode type (used by Tree, TreeTable, TreeSelect)
export interface TreeNode {
	key?: string;
	label?: string;
	data?: unknown;
	icon?: string;
	children?: TreeNode[];
	leaf?: boolean;
	selectable?: boolean;
	style?: string;
	styleClass?: string;
	expanded?: boolean;
	[key: string]: unknown;
}

// MenuItem type (used by all menu components)
export interface MenuItem {
	label?: string;
	icon?: string;
	command?: (event: MenuItemCommandEvent) => void;
	url?: string;
	items?: MenuItem[];
	separator?: boolean;
	disabled?: boolean;
	visible?: boolean;
	target?: string;
	badge?: string;
	badgeClass?: string;
	badgeSeverity?: Severity;
	shortcut?: string;
	key?: string;
	data?: unknown;
	style?: string;
	styleClass?: string;
	expanded?: boolean;
	[key: string]: unknown;
}

export interface MenuItemCommandEvent {
	originalEvent: Event;
	item: MenuItem;
}

// SelectOption type (used by Select, MultiSelect, ListBox etc.)
export interface SelectOption {
	label?: string;
	value?: unknown;
	items?: SelectOption[];
	disabled?: boolean;
	title?: string;
	[key: string]: unknown;
}

// Toast message types
export interface ToastMessage {
	id?: string;
	severity?: Severity;
	summary?: string;
	detail?: string;
	life?: number;
	sticky?: boolean;
	closable?: boolean;
	group?: string;
}

export interface ToastState {
	messages: ToastMessage[];
}

// Confirm types
export interface ConfirmOptions {
	target?: HTMLElement;
	message?: string;
	group?: string;
	icon?: string;
	header?: string;
	acceptLabel?: string;
	rejectLabel?: string;
	acceptIcon?: string;
	rejectIcon?: string;
	acceptClass?: string;
	rejectClass?: string;
	acceptButtonProps?: Record<string, unknown>;
	rejectButtonProps?: Record<string, unknown>;
	blockScroll?: boolean;
	defaultFocus?: 'accept' | 'reject' | 'close' | 'none';
	closeOnEscape?: boolean;
	dismissableMask?: boolean;
	accept?: () => void;
	reject?: () => void;
	onHide?: () => void;
	key?: string;
}

export interface ConfirmState {
	visible: boolean;
	options: ConfirmOptions | null;
}

// DynamicDialog types
export interface DynamicDialogInstance {
	key: string;
	tagName: string;
	props: Record<string, unknown>;
	visible: boolean;
}

export interface DynamicDialogState {
	dialogs: DynamicDialogInstance[];
}
