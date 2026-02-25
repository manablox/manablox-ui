export const TIMELINE_STYLES = `
:host {
	display: block;
}

.mb-timeline {
	display: flex;
	flex-direction: column;
	gap: var(--mb-timeline-gap, 0);
	margin: 0;
	padding: var(--mb-timeline-padding, 0);
	list-style: none;
}

.mb-timeline-horizontal {
	flex-direction: row;
	align-items: stretch;
}

.mb-timeline-event {
	display: flex;
	position: relative;
	min-height: var(--mb-timeline-event-min-height, 3rem);
}

.mb-timeline-horizontal .mb-timeline-event {
	flex-direction: column;
	flex: 1 1 0;
	min-height: 0;
	min-width: var(--mb-timeline-event-min-width, 7rem);
}

.mb-timeline-right .mb-timeline-event {
	flex-direction: row-reverse;
}

.mb-timeline-event-opposite,
.mb-timeline-event-content {
	flex: 1 1 0;
	padding: var(--mb-timeline-event-padding, 0.5rem 1rem);
	color: var(--mb-timeline-event-color, inherit);
}

.mb-timeline-event-opposite {
	text-align: right;
	color: var(--mb-timeline-opposite-color, var(--mb-text-muted-color, #6b7280));
}

.mb-timeline-right .mb-timeline-event-opposite {
	text-align: left;
}

.mb-timeline-alternate .mb-timeline-event:nth-child(even) .mb-timeline-event-opposite,
.mb-timeline-alternate .mb-timeline-event:nth-child(odd) .mb-timeline-event-content {
	opacity: 0;
	pointer-events: none;
	user-select: none;
}

.mb-timeline-horizontal .mb-timeline-event-opposite,
.mb-timeline-horizontal .mb-timeline-event-content {
	text-align: center;
	padding: var(--mb-timeline-horizontal-event-padding, 0.5rem);
}

.mb-timeline-event-separator {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 0 0 var(--mb-timeline-separator-width, 2.5rem);
}

.mb-timeline-horizontal .mb-timeline-event-separator {
	flex-direction: row;
	align-items: center;
	justify-content: center;
	flex: 0 0 auto;
	width: 100%;
	height: var(--mb-timeline-horizontal-separator-height, 2.5rem);
}

.mb-timeline-event-marker {
	width: var(--mb-timeline-marker-size, 1rem);
	height: var(--mb-timeline-marker-size, 1rem);
	border-radius: 9999px;
	border: var(--mb-timeline-marker-border-width, 2px) solid var(--mb-timeline-marker-border-color, var(--mb-primary-color, #3b82f6));
	background: var(--mb-timeline-marker-background, var(--mb-surface-ground, #fff));
	color: var(--mb-timeline-marker-color, var(--mb-primary-color, #3b82f6));
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: var(--mb-timeline-marker-icon-size, 0.625rem);
	line-height: 1;
	z-index: 1;
}

.mb-timeline-event-connector {
	width: var(--mb-timeline-connector-width, 2px);
	flex: 1 1 auto;
	background: var(--mb-timeline-connector-color, var(--mb-border-color, #e5e7eb));
	margin-top: var(--mb-timeline-connector-offset, 0.25rem);
}

.mb-timeline-horizontal .mb-timeline-event-connector {
	width: auto;
	height: var(--mb-timeline-connector-width, 2px);
	margin-top: 0;
	margin-left: var(--mb-timeline-connector-offset, 0.25rem);
}
`;

export {};
