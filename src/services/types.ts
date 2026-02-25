export type {
	ToastMessage,
	ToastState,
	ConfirmOptions,
	ConfirmState,
	DynamicDialogInstance,
	DynamicDialogState,
	Severity,
} from '../core/types.js';

export type Subscriber<T> = (state: T) => void;
export type Unsubscribe = () => void;
